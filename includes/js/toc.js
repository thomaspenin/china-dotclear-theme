/**
 * Vanilla JS replacement for the old jquery.stoc.js plugin: builds a nested
 * table of contents (nav list) from the headings found in a content
 * container, mirroring the approach used on Bootstrap's own docs pages
 * (a heading tree rendered as nested <ul>/<li> lists, paired with
 * bootstrap.ScrollSpy for the active-link highlighting).
 *
 * Sub-levels are collapsed by default (accordion behavior): clicking a
 * heading with children toggles its sub-list open/closed, and scrolling
 * into a section (via bootstrap.ScrollSpy's "activate.bs.scrollspy" event
 * on document.body) auto-expands the branch leading to the active heading.
 *
 * @note This code should be called after the document is ready.
 */

(function (globalObject) {
  "use strict";

  const DEFAULTS = {
    search: "body", // Where to search for headings
    depth: 3, // How many heading levels to include
    start: 1, // Level of the first heading to consider (h1 = 1)
    listType: "ul", // "ul" or "ol"
    rootListId: "", // Id applied to the top-level list
    rootListClass: "", // Class applied to the top-level list
    subListClass: "", // Class applied to nested lists
  };

  /*!
   * Returns the numeric level of a heading element (h2 -> 2)
   * @param {Element} heading
   * @returns {number}
   */
  function getHeadingLevel(heading) {
    return parseInt(heading.tagName.substring(1), 10);
  }

  /*!
   * Builds a CSS selector matching the heading levels to look for
   * @param {number} start
   * @param {number} depth
   * @returns {string}
   */
  function buildHeadingSelector(start, depth) {
    const tags = [];
    for (let level = start; level < start + depth; level++) {
      tags.push("h" + level);
    }
    return tags.join(", ");
  }

  /*!
   * Makes sure a heading element has an id to link to, generating one if needed
   * @param {Element} heading
   * @param {number} index
   * @returns {string} the heading's id
   */
  function ensureHeadingId(heading, index) {
    if (!heading.id) {
      heading.id = "toc-heading-" + index;
    }
    return heading.id;
  }

  /*!
   * Groups a flat list of headings (with a numeric "level") into a nested
   * tree of { heading, children } nodes, based on their relative levels.
   * @param {Array<{level: number}>} headings
   * @returns {Array<{heading: object, children: Array}>}
   */
  function groupHeadingsIntoTree(headings) {
    const root = [];
    const stack = []; // Stack of currently open { level, children } branches

    headings.forEach(function (heading) {
      const node = { heading: heading, children: [] };

      while (
        stack.length > 0 &&
        stack[stack.length - 1].level >= heading.level
      ) {
        stack.pop();
      }

      if (stack.length === 0) {
        root.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push({ level: heading.level, children: node.children });
    });

    return root;
  }

  const CLASS_HAS_CHILDREN = "toc-has-children";
  const CLASS_SUBLIST = "toc-collapse"; // collapsed by default, expanded via CLASS_SHOW
  const CLASS_SHOW = "show";
  const CLASS_CURRENT = "toc-current"; // persistent highlight, unlike bootstrap's own .active
  const EVENT_SCROLLSPY_ACTIVATE = "activate.bs.scrollspy";

  /*!
   * Renders a heading tree (as produced by groupHeadingsIntoTree) into a
   * nested <ul>/<ol> DOM structure. Branches with children are collapsed
   * by default (class CLASS_SUBLIST) and expanded via attachTocInteractions.
   * @param {Array} tree
   * @param {object} options
   * @param {boolean} isRoot
   * @returns {Element}
   */
  function renderTocTree(tree, options, isRoot) {
    const list = document.createElement(options.listType);
    const className = isRoot ? options.rootListClass : options.subListClass;

    if (className) {
      list.className = className;
    }
    if (!isRoot) {
      list.classList.add(CLASS_SUBLIST);
    }
    if (isRoot && options.rootListId) {
      list.id = options.rootListId;
    }

    tree.forEach(function (node) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#" + node.heading.id;
      link.textContent = node.heading.text;
      item.appendChild(link);

      if (node.children.length > 0) {
        item.classList.add(CLASS_HAS_CHILDREN);
        link.setAttribute("aria-expanded", "false");
        item.appendChild(renderTocTree(node.children, options, false));
      }

      list.appendChild(item);
    });

    return list;
  }

  /*!
   * Collapses every sub-level list under rootList
   * @param {Element} rootList
   */
  function collapseAllBranches(rootList) {
    Array.prototype.forEach.call(
      rootList.querySelectorAll("." + CLASS_SUBLIST),
      function (sublist) {
        sublist.classList.remove(CLASS_SHOW);
        const headerLink = sublist.previousElementSibling;
        if (headerLink && headerLink.tagName === "A") {
          headerLink.setAttribute("aria-expanded", "false");
        }
      },
    );
  }

  /*!
   * Expands the active link's own sub-list (if any) plus every collapsed
   * sub-list containing it, climbing up from its branch to the root. Also
   * expanding the link's own children avoids it being collapsed back right
   * after being opened by a click, once scrollspy activates that same heading.
   * @param {Element} link
   */
  function expandActiveBranch(link) {
    const ownSublist = link.nextElementSibling;
    if (ownSublist && ownSublist.classList.contains(CLASS_SUBLIST)) {
      ownSublist.classList.add(CLASS_SHOW);
      link.setAttribute("aria-expanded", "true");
    }

    let current = link;
    while (current) {
      const item = current.closest("li");
      const parentList = item ? item.parentElement : null;
      if (!parentList || !parentList.classList.contains(CLASS_SUBLIST)) {
        break;
      }
      parentList.classList.add(CLASS_SHOW);
      const headerLink = parentList.previousElementSibling;
      if (headerLink && headerLink.tagName === "A") {
        headerLink.setAttribute("aria-expanded", "true");
      }
      current = headerLink;
    }
  }

  /*!
   * Returns the very first heading link rendered in a toc list, if any.
   * @param {Element} rootList
   * @returns {Element|null}
   */
  function getFirstLink(rootList) {
    const firstItem = rootList.children[0];
    return firstItem ? firstItem.children[0] || null : null;
  }

  /*!
   * Wires up the accordion (click-to-toggle) and scrollspy (auto-expand the
   * active branch) behaviors on a rendered toc list. A heading is always kept
   * marked as current: the first one by default, until scrollspy activates another.
   * @param {Element} rootList
   */
  function attachTocInteractions(rootList) {
    let currentLink = null;

    function markCurrent(link) {
      // Keep our own persistent "current" marker instead of relying on
      // bootstrap.ScrollSpy's own .active class, which it removes as soon as
      // the heading scrolls out of its (narrow) observed root margin, well
      // before the next heading is reached, causing the highlight to flicker.
      if (currentLink && currentLink !== link) {
        currentLink.classList.remove(CLASS_CURRENT);
        currentLink.removeAttribute("aria-current");
      }
      link.classList.add(CLASS_CURRENT);
      link.setAttribute("aria-current", "true");
      currentLink = link;

      collapseAllBranches(rootList);
      expandActiveBranch(link);
    }

    rootList.addEventListener("click", function (event) {
      const link = event.target.closest("a");
      if (!link || !rootList.contains(link)) {
        return;
      }

      const sublist = link.nextElementSibling;
      if (sublist && sublist.classList.contains(CLASS_SUBLIST)) {
        const expanded = sublist.classList.toggle(CLASS_SHOW);
        link.setAttribute("aria-expanded", String(expanded));
      }
    });

    if (typeof document !== "undefined" && document.body) {
      document.body.addEventListener(
        EVENT_SCROLLSPY_ACTIVATE,
        function (event) {
          const activeLink = event.relatedTarget;
          if (!activeLink || !rootList.contains(activeLink)) {
            return;
          }
          markCurrent(activeLink);
        },
      );
    }

    const firstLink = getFirstLink(rootList);
    if (firstLink) {
      markCurrent(firstLink);
    }
  }

  /*!
   * Builds a table of contents from the headings found in options.search,
   * and inserts it at the beginning of the target element.
   * @param {string|Element} target - Where to insert the generated toc
   * @param {object} [userOptions]
   * @returns {boolean} whether a toc was built (false if no heading was found)
   */
  function buildToc(target, userOptions) {
    if (typeof document === "undefined") {
      return false;
    }

    const options = Object.assign({}, DEFAULTS, userOptions);
    const targetEl =
      typeof target === "string" ? document.querySelector(target) : target;
    const sourceEl =
      typeof options.search === "string"
        ? document.querySelector(options.search)
        : options.search;

    if (!targetEl || !sourceEl) {
      return false;
    }

    const selector = buildHeadingSelector(options.start, options.depth);
    const headingEls = Array.prototype.slice.call(
      sourceEl.querySelectorAll(selector),
    );

    if (headingEls.length === 0) {
      return false;
    }

    const headings = headingEls.map(function (heading, index) {
      return {
        level: getHeadingLevel(heading),
        id: ensureHeadingId(heading, index),
        text: heading.textContent,
      };
    });

    const tree = groupHeadingsIntoTree(headings);
    const list = renderTocTree(tree, options, true);

    targetEl.insertBefore(list, targetEl.firstChild);
    attachTocInteractions(list);
    return true;
  }

  const api = {
    buildToc,
    buildHeadingSelector,
    getHeadingLevel,
    ensureHeadingId,
    groupHeadingsIntoTree,
    renderTocTree,
    attachTocInteractions,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (typeof window !== "undefined") {
    window.buildToc = buildToc;
  }

  globalObject.buildToc = buildToc;
})(typeof window !== "undefined" ? window : globalThis);
