/*!
 * @instructions To create exercices, use code like the following one in the Dotclear XHTML editor:
 * 		   <ol>
 * 		     <li class="exercice">
 *                     <div class="question">Text of the question of exercice 1</div>
 * 		       <div class="answer">Text of the answer of exercice 1</div>
 *		     </li>
 * 		     <li class="exercice">
 *                     <div class="question">Text of the question of exercice 2</div>
 * 		       <div class="answer">Text of the answer of exercice 2</div>
 *		     </li>
 *		   </ol>
 * This script will then prepare the exercices so that the questions are hidden by default
 * and can be manually expanded by the user
 */

/*!
 * @abstract Function to configure the exercices, i.e. prepare hidden answers
 * @discussion To be called when the document is ready
 */
function configureExercices() {
  document.querySelectorAll(".answer").forEach(function (answer) {
    // Move the content of the answer to a new div that can be collapsed
    var expandableSection = document.createElement("div");
    expandableSection.className = "expandable";
    while (answer.firstChild) {
      expandableSection.appendChild(answer.firstChild);
    }
    answer.appendChild(expandableSection);

    // Add a new node to allow expanding/minimizing the questions
    var visibilityToggle = document.createElement("div");
    visibilityToggle.className = "visibilityToggle";
    visibilityToggle.setAttribute("role", "button");
    visibilityToggle.tabIndex = 0;
    visibilityToggle.setAttribute("aria-expanded", "false");
    visibilityToggle.innerHTML =
      'Correction&nbsp;<i class="ph ph-caret-down" aria-hidden="true"></i>';
    var question = answer.parentNode.querySelector(".question");
    answer.parentNode.insertBefore(visibilityToggle, question || answer);
    var icon = visibilityToggle.querySelector(".ph");
    var isAnimating = false;

    function toggleAnswer() {
      if (isAnimating) {
        return;
      }

      var isVisible = !expandableSection.hidden;
      var keyframes;

      if (isVisible) {
        var answerHeight = expandableSection.scrollHeight + "px";
        keyframes = [
          { height: answerHeight, opacity: 1 },
          { height: "0", opacity: 0 },
        ];
      } else {
        expandableSection.hidden = false;
        var answerHeight = expandableSection.scrollHeight + "px";
        keyframes = [
          { height: "0", opacity: 0 },
          { height: answerHeight, opacity: 1 },
        ];
      }

      isAnimating = true;
      visibilityToggle.setAttribute("aria-expanded", String(!isVisible));
      expandableSection.style.overflow = "hidden";

      icon.classList.toggle("ph-caret-down", isVisible);
      icon.classList.toggle("ph-caret-up", !isVisible);

      var animation = expandableSection.animate(keyframes, {
        duration: 200,
        easing: "ease-in-out",
      });

      animation.onfinish = function () {
        expandableSection.hidden = isVisible;
        expandableSection.style.height = "";
        expandableSection.style.opacity = "";
        expandableSection.style.overflow = "";
        isAnimating = false;
      };
    }

    visibilityToggle.addEventListener("click", toggleAnswer);
    visibilityToggle.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleAnswer();
      }
    });

    // Collapse the answer so that it is hidden by default
    expandableSection.hidden = true;
  });
}
