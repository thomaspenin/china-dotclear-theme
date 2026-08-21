/**
 * This code efficiently detects Chinese text in the page and wraps it in a
 * <span class="zh">...</span> tag, so that it can be styled differently
 * (e.g. bigger font size) than the rest of the text.
 *
 * @note This code should be called after the document is ready.
 */

(function () {
  "use strict";

  var chineseText = /([\u3000-\uFFFF]+)/g;
  var excludedAncestor = "pre, code, char, .blogTitle, .zh, script, style";

  window.wrapChineseText = function (root) {
    var documentRoot = root.ownerDocument || document;
    var nodeFilter = documentRoot.defaultView.NodeFilter;
    var textNodes = [];
    var walker = documentRoot.createTreeWalker(root, nodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return node.parentElement.closest(excludedAncestor)
          ? nodeFilter.FILTER_REJECT
          : nodeFilter.FILTER_ACCEPT;
      },
    });
    var node;

    while ((node = walker.nextNode())) {
      if (chineseText.test(node.nodeValue)) {
        textNodes.push(node);
      }
      chineseText.lastIndex = 0;
    }

    textNodes.forEach(function (textNode) {
      var fragment = documentRoot.createDocumentFragment();
      var lastIndex = 0;

      textNode.nodeValue.replace(chineseText, function (match, _text, offset) {
        fragment.append(
          documentRoot.createTextNode(
            textNode.nodeValue.slice(lastIndex, offset),
          ),
        );

        var chineseSpan = documentRoot.createElement("span");
        chineseSpan.className = "zh";
        chineseSpan.textContent = match;
        fragment.append(chineseSpan);

        lastIndex = offset + match.length;
        return match;
      });

      fragment.append(
        documentRoot.createTextNode(textNode.nodeValue.slice(lastIndex)),
      );
      textNode.replaceWith(fragment);
      chineseText.lastIndex = 0;
    });
  };
})();
