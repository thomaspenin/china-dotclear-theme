const test = require("node:test");
const assert = require("node:assert/strict");

const { accentPinyin, transformPinyin } = require("../includes/js/pinyin.js");

test("converts single syllables with tone numbers", () => {
  assert.equal(accentPinyin("ni3"), "nǐ");
  assert.equal(accentPinyin("Ni3"), "Nǐ");
  assert.equal(accentPinyin("SHI4"), "SHÌ");
  assert.equal(accentPinyin("lü4"), "lǜ");
  assert.equal(accentPinyin("nü3"), "nǚ");
  assert.equal(accentPinyin("zhong1"), "zhōng");
  assert.equal(accentPinyin("Xue2"), "Xué");
});

test("converts common words and names", () => {
  assert.equal(accentPinyin("ni3hao3"), "nǐhǎo");
  assert.equal(accentPinyin("Zhong1guo2"), "Zhōngguó");
  assert.equal(accentPinyin("Xiang4"), "Xiàng");
  assert.equal(accentPinyin("Qing1"), "Qīng");
  assert.equal(accentPinyin("QING1"), "QĪNG");
  assert.equal(accentPinyin("liu2"), "liú");
  assert.equal(accentPinyin("shui3"), "shuǐ");
});

test("converts sentence-style strings while preserving punctuation", () => {
  assert.equal(
    accentPinyin("Ni3 Hao3! Wo3men2 zai4 Zhong1guo2."),
    "Nǐ Hǎo! Wǒmén zài Zhōngguó.",
  );
  assert.equal(accentPinyin("Xi1an1, xia4!"), "Xīān, xià!");
  assert.equal(accentPinyin("Shang4hai3 ren2?"), "Shànghǎi rén?");
});

test("leaves plain text and unnumbered pinyin unchanged", () => {
  assert.equal(accentPinyin("hello world"), "hello world");
  assert.equal(accentPinyin("ma"), "ma");
  assert.equal(accentPinyin("nǐhǎo"), "nǐhǎo");
  assert.equal(accentPinyin("X1"), "X1");
});

test("transforms py and pyb tags in DOM markup", () => {
  const originalDocument = globalThis.document;
  const elements = [
    { tagName: "PY", textContent: "ni3hao3" },
    { tagName: "PYB", textContent: "Xue2" },
  ];

  globalThis.document = {
    readyState: "interactive",
    querySelectorAll: (selector) => (selector === "py, pyb" ? elements : []),
    addEventListener: () => {},
  };

  try {
    transformPinyin();
    assert.equal(elements[0].textContent, "nǐhǎo");
    assert.equal(elements[1].textContent, "Xué");
  } finally {
    globalThis.document = originalDocument;
  }
});
