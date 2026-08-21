/**
 * This code provides utility functions for managing cookies in the browser.
 *
 * @note This code should be called after the document is ready.
 */

(function (global) {
  "use strict";

  /**
   * Retrieves the value of a cookie by its name.
   * @param {string} name - The name of the cookie to retrieve.
   * @returns {string|null} The value of the cookie, or null if not found.
   */
  function getCookie(name) {
    if (!name || typeof document === "undefined") {
      return null;
    }

    var cookies = document.cookie ? document.cookie.split(";") : [];

    for (var i = 0; i < cookies.length; i += 1) {
      var cookie = cookies[i].replace(/^\s+|\s+$/g, "");
      var separatorIndex = cookie.indexOf("=");
      var key = separatorIndex >= 0 ? cookie.slice(0, separatorIndex) : cookie;

      if (key === name) {
        var rawValue =
          separatorIndex >= 0 ? cookie.slice(separatorIndex + 1) : "";
        try {
          return decodeURIComponent(rawValue);
        } catch (error) {
          return rawValue;
        }
      }
    }

    return null;
  }

  /**
   * Sets a cookie with the specified name, value, and options.
   * @param {string} name - The name of the cookie to set.
   * @param {string} value - The value of the cookie to set.
   * @param {Object} [options] - Optional settings for the cookie.
   * @param {number|Date} [options.expires] - Expiration date of the cookie. Can be a number of days or a Date object.
   * @param {string} [options.path] - The path where the cookie is valid.
   * @param {string} [options.domain] - The domain where the cookie is valid.
   * @param {boolean} [options.secure] - Whether the cookie should be secure.
   * @returns {void}
   */
  function setCookie(name, value, options) {
    if (!name || typeof document === "undefined") {
      return;
    }

    var settings = options || {};
    var cookieParts = [
      encodeURIComponent(name) + "=" + encodeURIComponent(String(value)),
    ];

    if (settings.expires) {
      var expiresValue = settings.expires;
      var expiresDate;

      if (typeof expiresValue === "number") {
        expiresDate = new Date();
        expiresDate.setTime(
          expiresDate.getTime() + expiresValue * 24 * 60 * 60 * 1000,
        );
      } else if (expiresValue instanceof Date) {
        expiresDate = expiresValue;
      }

      if (expiresDate) {
        cookieParts.push("expires=" + expiresDate.toUTCString());
      }
    }

    if (settings.path) {
      cookieParts.push("path=" + settings.path);
    }

    if (settings.domain) {
      cookieParts.push("domain=" + settings.domain);
    }

    if (settings.secure) {
      cookieParts.push("secure");
    }

    document.cookie = cookieParts.join("; ");
  }

  /**
   * Removes a cookie with the specified name and options.
   * @param {string} name - The name of the cookie to remove.
   * @param {Object} [options] - Optional settings for the cookie.
   * @param {string} [options.path] - The path where the cookie is valid.
   * @param {string} [options.domain] - The domain where the cookie is valid.
   * @param {boolean} [options.secure] - Whether the cookie should be secure.
   * @returns {void}
   */
  function removeCookie(name, options) {
    var settings = options || {};
    setCookie(name, "", {
      expires: -1,
      path: settings.path,
      domain: settings.domain,
      secure: settings.secure,
    });
  }

  global.cookieHelpers = {
    get: getCookie,
    set: setCookie,
    remove: removeCookie,
  };
})(window);
