/**
 * This code is used to lazy load images in the page.
 *
 * @note This code should be called after the document is ready.
 *
 * Adapted from "Responsive Image Placeholders" by Matt Hinchliffe
 * Original Github: https://github.com/i-like-robots/Responsive-Image-Placeholders
 * License: Creative Commons Attribution-ShareAlike 3.0 Unported License (http://creativecommons.org/licenses/by-sa/3.0/)
 */

var deferImage = function (element) {
  var i, len, attr;
  var img = new Image();
  var placehold = element.children[0];

  element.className += " is-loading";

  img.onload = function () {
    element.className = element.className.replace(
      "is-loading",
      "is-loaded img-responsive",
    );
    element.replaceChild(img, placehold);
  };

  for (i = 0, len = placehold.attributes.length; i < len; i++) {
    attr = placehold.attributes[i];
    if (attr.name.match(/^data-/)) {
      img.setAttribute(attr.name.replace("data-", ""), attr.value);
    }
  }
};
