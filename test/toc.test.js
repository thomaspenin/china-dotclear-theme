const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildToc,
  buildHeadingSelector,
  getHeadingLevel,
  ensureHeadingId,
  groupHeadingsIntoTree,
} = require("../includes/js/toc.js");

/**
 * Minimal fake DOM element used to test buildToc/renderTocTree/attachTocInteractions
 * without a jsdom dependency.
 */
class FakeElement {
  constructor(tagName) {
    this.tagName = (tagName || "div").toUpperCase();
    this.id = "";
    this.textContent = "";
    this.children = [];
    this.parentElement = null;
    this._classes = new Set();
    this._attributes = {};
    this._listeners = {};

    const self = this;
    this.classList = {
      add(cls) {
        self._classes.add(cls);
      },
      remove(cls) {
        self._classes.delete(cls);
      },
      contains(cls) {
        return self._classes.has(cls);
      },
      toggle(cls, force) {
        const shouldHave =
          force === undefined ? !self._classes.has(cls) : force;
        if (shouldHave) {
          self._classes.add(cls);
        } else {
          self._classes.delete(cls);
        }
        return shouldHave;
      },
    };
  }

  get className() {
    return Array.from(this._classes).join(" ");
  }

  set className(value) {
    this._classes = new Set(value ? value.split(/\s+/).filter(Boolean) : []);
  }

  appendChild(child) {
    this.children.push(child);
    child.parentElement = this;
    return child;
  }

  insertBefore(newNode, referenceNode) {
    const index = referenceNode ? this.children.indexOf(referenceNode) : -1;
    if (index === -1) {
      this.children.unshift(newNode);
    } else {
      this.children.splice(index, 0, newNode);
    }
    newNode.parentElement = this;
    return newNode;
  }

  get firstChild() {
    return this.children[0] || null;
  }

  get previousElementSibling() {
    if (!this.parentElement) {
      return null;
    }
    const index = this.parentElement.children.indexOf(this);
    return index > 0 ? this.parentElement.children[index - 1] : null;
  }

  get nextElementSibling() {
    if (!this.parentElement) {
      return null;
    }
    const index = this.parentElement.children.indexOf(this);
    return index !== -1 && index < this.parentElement.children.length - 1
      ? this.parentElement.children[index + 1]
      : null;
  }

  setAttribute(name, value) {
    this._attributes[name] = String(value);
  }

  getAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this._attributes, name)
      ? this._attributes[name]
      : null;
  }

  removeAttribute(name) {
    delete this._attributes[name];
  }

  closest(tagName) {
    const upperTag = tagName.toUpperCase();
    let node = this;
    while (node) {
      if (node.tagName === upperTag) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  contains(node) {
    let current = node;
    while (current) {
      if (current === this) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  querySelectorAll(selector) {
    const cls = selector.replace(/^\./, "");
    const results = [];
    (function walk(node) {
      node.children.forEach((child) => {
        if (child._classes && child._classes.has(cls)) {
          results.push(child);
        }
        walk(child);
      });
    })(this);
    return results;
  }

  addEventListener(type, handler) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(handler);
  }

  dispatchEvent(event) {
    const handlers = this._listeners[event.type] || [];
    handlers.forEach((handler) => handler(event));
    return true;
  }
}

function makeQuerySelectorAll(elements) {
  return function (selector) {
    const tags = selector.split(",").map((tag) => tag.trim().toLowerCase());
    return elements.filter((el) => tags.includes(el.tagName.toLowerCase()));
  };
}

test("buildHeadingSelector builds a selector for the given range", () => {
  assert.equal(buildHeadingSelector(1, 3), "h1, h2, h3");
  assert.equal(buildHeadingSelector(2, 2), "h2, h3");
  assert.equal(buildHeadingSelector(1, 1), "h1");
});

test("getHeadingLevel reads the numeric level from a heading tag name", () => {
  assert.equal(getHeadingLevel({ tagName: "H1" }), 1);
  assert.equal(getHeadingLevel({ tagName: "H4" }), 4);
});

test("ensureHeadingId keeps existing ids and generates missing ones", () => {
  const withId = { id: "existing" };
  assert.equal(ensureHeadingId(withId, 0), "existing");

  const withoutId = { id: "" };
  assert.equal(ensureHeadingId(withoutId, 2), "toc-heading-2");
  assert.equal(withoutId.id, "toc-heading-2");
});

test("groupHeadingsIntoTree keeps siblings at the same level flat", () => {
  const headings = [
    { level: 2, id: "a" },
    { level: 2, id: "b" },
    { level: 2, id: "c" },
  ];
  const tree = groupHeadingsIntoTree(headings);
  assert.equal(tree.length, 3);
  tree.forEach((node) => assert.equal(node.children.length, 0));
});

test("groupHeadingsIntoTree nests deeper headings under their previous sibling", () => {
  const headings = [
    { level: 2, id: "h2-1" },
    { level: 3, id: "h3-1" },
    { level: 3, id: "h3-2" },
    { level: 2, id: "h2-2" },
  ];
  const tree = groupHeadingsIntoTree(headings);
  assert.equal(tree.length, 2);
  assert.equal(tree[0].heading.id, "h2-1");
  assert.equal(tree[0].children.length, 2);
  assert.equal(tree[0].children[0].heading.id, "h3-1");
  assert.equal(tree[0].children[1].heading.id, "h3-2");
  assert.equal(tree[1].heading.id, "h2-2");
  assert.equal(tree[1].children.length, 0);
});

test("groupHeadingsIntoTree handles a level jump without an intermediate heading", () => {
  const headings = [
    { level: 1, id: "h1" },
    { level: 3, id: "h3" },
  ];
  const tree = groupHeadingsIntoTree(headings);
  assert.equal(tree.length, 1);
  assert.equal(tree[0].children.length, 1);
  assert.equal(tree[0].children[0].heading.id, "h3");
});

test("buildToc inserts a nested list of links into the target element", () => {
  const originalDocument = globalThis.document;

  const target = new FakeElement("nav");
  const source = new FakeElement("div");

  const h2a = new FakeElement("h2");
  h2a.textContent = "Section one";
  const h3a = new FakeElement("h3");
  h3a.textContent = "Subsection";
  const h2b = new FakeElement("h2");
  h2b.textContent = "Section two";

  source.querySelectorAll = makeQuerySelectorAll([h2a, h3a, h2b]);

  const registry = {
    ".toc-target": target,
    ".post-content": source,
  };

  globalThis.document = {
    createElement: (tag) => new FakeElement(tag),
    querySelector: (selector) => registry[selector] || null,
    body: new FakeElement("body"),
  };

  try {
    const built = buildToc(".toc-target", {
      search: ".post-content",
      depth: 3,
      start: 1,
      listType: "ul",
      rootListId: "toc",
      rootListClass: "nav",
      subListClass: "nav",
    });

    assert.equal(built, true);
    assert.equal(target.children.length, 1);

    const rootList = target.children[0];
    assert.equal(rootList.tagName, "UL");
    assert.equal(rootList.id, "toc");
    assert.equal(rootList.className, "nav");
    assert.equal(rootList.children.length, 2);

    const [firstItem, secondItem] = rootList.children;
    assert.equal(firstItem.tagName, "LI");
    const [link, nestedList] = firstItem.children;
    assert.equal(link.tagName, "A");
    assert.equal(link.href, "#toc-heading-0");
    assert.equal(link.textContent, "Section one");
    assert.equal(nestedList.tagName, "UL");
    assert.equal(nestedList.className, "nav");
    assert.equal(nestedList.children.length, 1);
    assert.equal(nestedList.children[0].children[0].href, "#toc-heading-1");

    assert.equal(secondItem.children.length, 1);
    assert.equal(h2a.id, "toc-heading-0");
    assert.equal(h3a.id, "toc-heading-1");
    assert.equal(h2b.id, "toc-heading-2");
  } finally {
    globalThis.document = originalDocument;
  }
});

test("buildToc marks the first heading as current by default, before any scrollspy activation", () => {
  const originalDocument = globalThis.document;

  const target = new FakeElement("nav");
  const source = new FakeElement("div");
  const h2a = new FakeElement("h2");
  h2a.textContent = "Section one";
  const h2b = new FakeElement("h2");
  h2b.textContent = "Section two";
  source.querySelectorAll = makeQuerySelectorAll([h2a, h2b]);

  globalThis.document = {
    createElement: (tag) => new FakeElement(tag),
    querySelector: (selector) => (selector === ".toc-target" ? target : source),
    body: new FakeElement("body"),
  };

  try {
    buildToc(".toc-target", { search: ".post-content" });

    const rootList = target.children[0];
    const [firstLink] = rootList.children[0].children;
    const [secondLink] = rootList.children[1].children;

    assert.equal(firstLink.classList.contains("toc-current"), true);
    assert.equal(firstLink.getAttribute("aria-current"), "true");
    assert.equal(secondLink.classList.contains("toc-current"), false);
  } finally {
    globalThis.document = originalDocument;
  }
});

test("buildToc highlights the active heading on scrollspy activation and keeps it until another is activated", () => {
  const originalDocument = globalThis.document;

  const target = new FakeElement("nav");
  const source = new FakeElement("div");
  const h2a = new FakeElement("h2");
  h2a.textContent = "Section one";
  const h3a = new FakeElement("h3");
  h3a.textContent = "Subsection one";
  const h2b = new FakeElement("h2");
  h2b.textContent = "Section two";
  source.querySelectorAll = makeQuerySelectorAll([h2a, h3a, h2b]);

  const body = new FakeElement("body");

  globalThis.document = {
    createElement: (tag) => new FakeElement(tag),
    querySelector: (selector) => (selector === ".toc-target" ? target : source),
    body,
  };

  try {
    buildToc(".toc-target", { search: ".post-content" });

    const rootList = target.children[0];
    const [firstItem, secondItem] = rootList.children;
    const nestedLink = firstItem.children[1].children[0].children[0];
    const secondLink = secondItem.children[0];

    body.dispatchEvent({
      type: "activate.bs.scrollspy",
      relatedTarget: nestedLink,
    });
    assert.equal(nestedLink.classList.contains("toc-current"), true);
    assert.equal(nestedLink.getAttribute("aria-current"), "true");

    // Activation for an unrelated link (outside the toc) must be ignored
    body.dispatchEvent({
      type: "activate.bs.scrollspy",
      relatedTarget: new FakeElement("a"),
    });
    assert.equal(nestedLink.classList.contains("toc-current"), true);

    // Bootstrap's own ScrollSpy may clear its .active class between two headings
    // (as the heading scrolls out of its narrow observed root margin) without
    // firing a new "activate" event; our own marker must not be affected by that.
    nestedLink.classList.remove("active");
    assert.equal(nestedLink.classList.contains("toc-current"), true);

    // Activating a different heading moves the marker
    body.dispatchEvent({
      type: "activate.bs.scrollspy",
      relatedTarget: secondLink,
    });
    assert.equal(nestedLink.classList.contains("toc-current"), false);
    assert.equal(nestedLink.getAttribute("aria-current"), null);
    assert.equal(secondLink.classList.contains("toc-current"), true);
    assert.equal(secondLink.getAttribute("aria-current"), "true");
  } finally {
    globalThis.document = originalDocument;
  }
});

test("buildToc keeps existing heading ids instead of overwriting them", () => {
  const originalDocument = globalThis.document;

  const target = new FakeElement("nav");
  const source = new FakeElement("div");
  const heading = new FakeElement("h2");
  heading.id = "custom-id";
  heading.textContent = "Custom heading";
  source.querySelectorAll = makeQuerySelectorAll([heading]);

  globalThis.document = {
    createElement: (tag) => new FakeElement(tag),
    querySelector: (selector) => (selector === ".toc-target" ? target : source),
    body: new FakeElement("body"),
  };

  try {
    buildToc(".toc-target", { search: ".post-content" });
    const link = target.children[0].children[0].children[0];
    assert.equal(link.href, "#custom-id");
  } finally {
    globalThis.document = originalDocument;
  }
});

test("buildToc returns false when there is no matching heading", () => {
  const originalDocument = globalThis.document;
  const target = new FakeElement("nav");
  const source = new FakeElement("div");
  source.querySelectorAll = () => [];

  globalThis.document = {
    createElement: (tag) => new FakeElement(tag),
    querySelector: (selector) => (selector === ".toc-target" ? target : source),
    body: new FakeElement("body"),
  };

  try {
    assert.equal(buildToc(".toc-target", { search: ".post-content" }), false);
    assert.equal(target.children.length, 0);
  } finally {
    globalThis.document = originalDocument;
  }
});

test("buildToc returns false when the target or source element is missing", () => {
  const originalDocument = globalThis.document;
  globalThis.document = {
    createElement: (tag) => new FakeElement(tag),
    querySelector: () => null,
  };

  try {
    assert.equal(
      buildToc(".missing-target", { search: ".missing-source" }),
      false,
    );
  } finally {
    globalThis.document = originalDocument;
  }
});
