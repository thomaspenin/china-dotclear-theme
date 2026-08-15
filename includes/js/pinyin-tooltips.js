/*!
 * @instructions Given the content of a <ch> or <chb> tag, provide the pinyin on hover if provided.
 * The full syntax to benefit from this functionality will then be of the sort:
 * 		<ch pinyin="ni3hao3">你好</ch>
 * When hovering over "你好" on the page, a tooltip containing the "ni3hao3" pinyin will appear
 * @note This needs to be called before the function transforming numbered pinyin into accented pinyin, since
 * otherwise, it will not transform it.
 */

/*!
 * @abstract Function to create tooltips containing the pinyin that appear when hovering a <ch> or <chb> tag
 * @discussion To be called when the document is ready
 */
function preparePinyinOnHover() {
  // Consider all "Chinese" tags on the page since they may be impacted
  document.querySelectorAll("ch, chb").forEach(function (element) {
    var pinyin = element.getAttribute("pinyin");
    if (pinyin && pinyin.length > 0) {
      var tooltip = document.createElement("span");
      tooltip.setAttribute("data-bs-toggle", "tooltip");
      tooltip.className = "pinyinTooltip";
      tooltip.title = accentPinyin(pinyin);
      tooltip.textContent = element.textContent;
      element.replaceWith(tooltip);
    }
  });
}