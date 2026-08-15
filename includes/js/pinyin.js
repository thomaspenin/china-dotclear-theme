/**
 * This code is used to accentuate Pinyin text in the page.
 *
 * @note This code should be called after the document is ready.
 */

(function (globalObject) {
  const TONE_MARKS = {
    1: { a: "ā", e: "ē", i: "ī", o: "ō", u: "ū", ü: "ǖ" },
    2: { a: "á", e: "é", i: "í", o: "ó", u: "ú", ü: "ǘ" },
    3: { a: "ǎ", e: "ě", i: "ǐ", o: "ǒ", u: "ǔ", ü: "ǚ" },
    4: { a: "à", e: "è", i: "ì", o: "ò", u: "ù", ü: "ǜ" },
  };

  /*!
   * Capitalizes the first letter of a string
   * @param {string} value - The string to capitalize
   * @returns {string} The string with the first letter capitalized
   */
  function capitalizeFirstLetter(value) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  /*!
   * Normalizes letters in a string, replacing 'v' or 'V' with 'ü'
   * @param {string} value - The string to normalize
   * @returns {string} The normalized string
   */
  function normalizeLetters(value) {
    return value.replace(/[vV]/g, "ü");
  }

  /*!
   * Detects the target vowel for tone marking in a Pinyin syllable
   * @param {string} syllable - The Pinyin syllable to analyze
   * @returns {string|null} The target vowel for tone marking, or null if none found
   */
  function detectToneTarget(syllable) {
    const normalized = normalizeLetters(syllable).toLowerCase();
    if (!normalized || !/[aeiouü]/.test(normalized)) {
      return null;
    }

    if (normalized.includes("a")) return "a";
    if (normalized.includes("e")) return "e";
    if (normalized.includes("ou")) return "o";
    if (normalized.includes("o")) return "o";
    if (normalized.includes("iu")) return "u";
    if (normalized.includes("ui")) return "i";
    if (normalized.includes("i")) return "i";
    if (normalized.includes("u")) return "u";
    if (normalized.includes("ü")) return "ü";
    return null;
  }

  /*!
   * Applies a tone mark to a Pinyin syllable based on the given tone number
   * @param {string} syllable - The Pinyin syllable to accentuate
   * @param {number|string} toneNumber - The tone number (1-4) to apply
   * @returns {string} The syllable with the appropriate tone mark applied
   */
  function applyToneMark(syllable, toneNumber) {
    const tone = Number(toneNumber);
    if (!Number.isInteger(tone) || tone < 1 || tone > 4) {
      return normalizeLetters(syllable);
    }

    const normalized = normalizeLetters(syllable).toLowerCase();
    const target = detectToneTarget(normalized);
    if (!target) {
      return normalized;
    }

    const index = normalized.lastIndexOf(target);
    const mark = TONE_MARKS[tone][target];
    if (index === -1 || !mark) {
      return normalized;
    }

    return normalized.slice(0, index) + mark + normalized.slice(index + 1);
  }

  /*!
   * Preserves the case of the original string when applying tone marks
   * @param {string} value - The string with tone marks applied
   * @param {string} original - The original string to preserve case from
   * @returns {string} The string with tone marks and preserved case
   */
  function preserveCase(value, original) {
    const originalLetters = original || "";
    const isAllUppercase =
      originalLetters !== "" &&
      originalLetters === originalLetters.toUpperCase() &&
      /[a-z]/i.test(originalLetters);

    if (isAllUppercase) {
      return value.toUpperCase();
    }

    if (
      originalLetters &&
      originalLetters[0] === originalLetters[0].toUpperCase()
    ) {
      return capitalizeFirstLetter(value);
    }

    return value;
  }

  /*!
   * Accentuates Pinyin text by replacing tone numbers with appropriate diacritical marks
   * @param {string} value - The Pinyin text to accentuate
   * @returns {string} The accentuated Pinyin text
   */
  function accentPinyin(value) {
    if (typeof value !== "string" || value.length === 0) {
      return value;
    }

    let output = "";
    for (let index = 0; index < value.length; index += 1) {
      const char = value[index];
      if (!/[A-Za-züÜvV]/.test(char)) {
        output += char;
        continue;
      }

      let end = index;
      while (end < value.length && /[A-Za-züÜvV]/.test(value[end])) {
        end += 1;
      }

      const letters = value.slice(index, end);
      const hasToneDigit = end < value.length && /[1-4]/.test(value[end]);

      if (hasToneDigit && /[aeiouü]/i.test(normalizeLetters(letters))) {
        const toneDigit = value[end];
        const accented = applyToneMark(letters, toneDigit);
        output += preserveCase(accented, letters);
        index = end;
        continue;
      }

      output += letters;
      index = end - 1;
    }

    return output;
  }

  /*!
   * Transforms all <py> and <pyb> elements in the DOM, accentuating their Pinyin text
   */
  function transformPinyin() {
    if (typeof document === "undefined") {
      return;
    }

    document.querySelectorAll("py, pyb").forEach(function (element) {
      element.textContent = accentPinyin(element.textContent || "");
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", transformPinyin);
    } else {
      transformPinyin();
    }
  }

  const api = {
    accentPinyin,
    applyToneMark,
    capitalizeFirstLetter,
    transformPinyin,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (typeof window !== "undefined") {
    window.accentPinyin = accentPinyin;
    window.transformPinyin = transformPinyin;
  }

  globalObject.accentPinyin = accentPinyin;
  globalObject.transformPinyin = transformPinyin;
})(typeof window !== "undefined" ? window : globalThis);
