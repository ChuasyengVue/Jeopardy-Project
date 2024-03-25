// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
const NUM_CATEGORIES = 6;
const NUM_QUESTION_PER_CAT = 5;

async function getCategoryIds() {
  // Getting 100 categories
  const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/categories`, {
    params: { count: 100 }
  });
// iterating over the category id
  const categoriesId = response.data.map(cat => cat.id);
// Lodash function for random sample to select the amount of categories needed.
  return _.sampleSize(categoriesId, NUM_CATEGORIES);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null, value: 200},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null, value: 400},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    // Getting the category Id from the api
  const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category`, {
    params: { id: catId }
  });

  const catTitle = response.data.title;
  const catClues = response.data.clues;
// select random catClues and amount of questions, which return 3 properties
  const clueArray = _.sampleSize(catClues, NUM_QUESTION_PER_CAT).map
  ((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null
  }));
  return { title: catTitle, clues: catClues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  hideLoadingView();

  // Add row with headers for categories
  const categoryTopRow = $("<tr>");
  const thead = $('#jeopardy thead');
  const tbody = $('#jeopardy tbody');
// create <tr> for each cell of the <th>
  for (let category of categories) {
    categoryTopRow.append($("<th>").text(category.title));
  }
  thead.append(categoryTopRow);

  // Add rows with questions for each category
  tbody.empty();
  for (let clueIdx = 0; clueIdx < NUM_QUESTION_PER_CAT; clueIdx++) {
    let categoryTopRow = $("<tr>");
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      categoryTopRow.append(
        $("<td>")
          .attr("id", `${catIdx}-${clueIdx}`)
          .append($("<i>").addClass("fas fa-question-circle fa-3x"))
      );
    }
    tbody.append(categoryTopRow);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const trgt = $(evt.target);
  const id = trgt.attr("id");
  const [catId, clueId] = id.split("-");
  const category = categories[catId];
  const clue = category.clues[clueId];

  let msg;
// Showing the questioning state
  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  }
  
   else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
    trgt.addClass("disabled");
  } 
  else {
    // already showing answer; ignore
    return;
  }

  // Update text of cell
  trgt.html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
const spin = $("#spin-container");

function showLoadingView() {
    const thead = $('#jeopardy thead');
    const tbody = $('#jeopardy tbody');

  // clear the board
  thead.empty();
  tbody.empty();

  
  // show the loading icon
  spin.show();
  $("#start")
    .addClass("disabled")
    .text("Loading...");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#start")
    .removeClass("disabled")
    .text("Restart!");
  spin.hide();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let isLoading = $("#start").text() === "Loading...";

  if (!isLoading) {
    showLoadingView();

    let catIds = await getCategoryIds();

    categories = [];

    for (let catId of catIds) {
      categories.push(await getCategory(catId));
    }

    fillTable();
  }
}

/** On click of start / restart button, set up game. */

$("#start").on("click", setupAndStart);

/** On page load, add event handler for clicking clues */

$(async function() {
  $("#jeopardy").on("click", "td", handleClick);
});

