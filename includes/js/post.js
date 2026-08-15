/**
 * This code manages the "remember me" functionality for the comment form.
 * It uses cookies to store the user's name, email, and website information
 * when the "remember me" checkbox is checked.
 *
 * @note This code should be called after the document is ready.
 */

(function () {
  var COOKIE_NAME = "comment_info";
  var COOKIE_PATH = getCookiePath();

  /**
   * Gets the path for the cookie based on the top link element.
   * @returns {string} The cookie path.
   */
  function getCookiePath() {
    var topLink = document.querySelector("link[rel=top]");
    var href = topLink && topLink.getAttribute("href");

    if (!href) {
      return "/";
    }

    try {
      return new URL(href, window.location.href).pathname || "/";
    } catch (error) {
      return "/";
    }
  }

  /**
   * Sets a cookie with the specified value and options.
   * @param {string} value The value to set in the cookie.
   */
  function setCookie(value) {
    window.cookieHelpers.set(COOKIE_NAME, value, {
      expires: 60,
      path: COOKIE_PATH,
    });
  }

  /**
   * Removes the cookie with the specified name and path.
   */
  function dropCookie() {
    window.cookieHelpers.remove(COOKIE_NAME, {
      path: COOKIE_PATH,
    });
  }

  /**
   * Reads the cookie value and splits it into parts (name, email, website).
   * @param {string} value The value of the cookie.
   * @returns {Array|string|boolean} The parsed cookie parts, or false if invalid.
   */
  function readCookie(value) {
    if (!value) {
      return false;
    }

    var parts = value.split("\n");
    if (parts.length !== 3) {
      dropCookie();
      return false;
    }

    return parts;
  }

  /**
   * Initializes the "remember me" functionality for the comment form.
   * It sets up event listeners for the checkbox and input fields to manage the cookie.
   */
  function initializeRememberMe() {
    var formContainer = document.querySelector(".new-comment-buttons");
    if (!formContainer) {
      return;
    }

    var checkbox = document.getElementById("c_remember");
    var nameField = document.getElementById("c_name");
    var mailField = document.getElementById("c_mail");
    var siteField = document.getElementById("c_site");

    if (!checkbox || !nameField || !mailField || !siteField) {
      var reminder = document.createElement("div");
      reminder.className = "remember";
      reminder.innerHTML =
        '<input type="checkbox" id="c_remember" name="c_remember" /> ' +
        '<label for="c_remember">' +
        (window.post_remember_str || "") +
        "</label>";
      formContainer.parentNode.insertBefore(reminder, formContainer);
      checkbox = document.getElementById("c_remember");
      nameField = document.getElementById("c_name");
      mailField = document.getElementById("c_mail");
      siteField = document.getElementById("c_site");
    }

    if (!checkbox || !nameField || !mailField || !siteField) {
      return;
    }

    var remembered = readCookie(window.cookieHelpers.get(COOKIE_NAME));
    if (remembered !== false) {
      nameField.value = remembered[0];
      mailField.value = remembered[1];
      siteField.value = remembered[2];
      checkbox.checked = true;
    }

    checkbox.addEventListener("change", function () {
      if (this.checked) {
        setCookie(
          nameField.value + "\n" + mailField.value + "\n" + siteField.value,
        );
      } else {
        dropCookie();
      }
    });

    [nameField, mailField, siteField].forEach(function (field) {
      field.addEventListener("change", function () {
        if (checkbox.checked) {
          setCookie(
            nameField.value + "\n" + mailField.value + "\n" + siteField.value,
          );
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeRememberMe);
  } else {
    initializeRememberMe();
  }
})();
