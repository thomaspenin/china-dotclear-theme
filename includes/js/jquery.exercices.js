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
  $(".answer").each(function (index) {
    // Move the content of the answer to a new div that can be collapsed
    var answerContent = $(this).contents();
    $(this).prepend('<div class="expandable"></div>');
    var expandableSection = $(this).children(".expandable");
    expandableSection.append(answerContent);

    // Add a new node to allow expanding/minimizing the questions
    $(this).before(
      '<div class="visibilityToggle">Correction&nbsp;<span class="arrow">&laquo;</span></div>',
    );
    var visibilityToggle = $(this).prev();
    //var visibilityToggle = $(this).children(".visibilityToggle");
    visibilityToggle.click(function () {
      var isVisible = expandableSection.is(":visible");
      expandableSection.slideToggle();

      // Change the aspect of the button indicating the move
      if (isVisible) visibilityToggle.find(".arrow").text("«");
      else visibilityToggle.find(".arrow").text("»");
    });

    // Collapse the answer without animation so that it is hidden by default
    expandableSection.toggle();
  });
}
