// Adapted from http://maketea.co.uk/2013/05/04/responsive-image-placeholders.html

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
