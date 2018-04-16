var invalidSessionError = "Unable to access session.";
var invalidProfError = "Could not find professor.";
var baseURL = "http://cop4331-2.com/API";

function refreshPage(){

}

function refreshQuestions(){
    clearQuestions;
}

function clearQuestions(){
    var container = document.getElementsByClassName("questions-container")[0];
    var questions = container.getElementsByClassName("question");

    while(questions.length > 0){
        container.removeChild(questions[0]);
    }
}

function insertQuestion(text, timestamp, read, id){

    // Build question text
    var questionText = document.createElement("div");
    questionText.className = "question-text";
    questionText.innerHTML = text;

    // Build dropdown menu
    var displayButton = document.createElement("button");
    displayButton.className = "dropdown-item";
    displayButton.innerHTML = "Display";
    displayButton.setAttribute("data-toggle", "modal");
    displayButton.setAttribute("data-target", "#displayQuestionModal");
    
    var viewButton = document.createElement("button");
    viewButton.className = "dropdown-item";
    viewButton.innerHTML = "View Student";
    viewButton.setAttribute("data-toggle", "modal");
    viewButton.setAttribute("data-target", "#displayStudentModal");

    var deleteButton = document.createElement("button");
    deleteButton.className = "dropdown-item";
    deleteButton.innerHTML = "Delete";
    deleteButton.setAttribute("data-toggle", "modal");
    deleteButton.setAttribute("data-target", "#deleteQuestionModal");

    var dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu";
    dropdownMenu.appendChild(displayButton);
    dropdownMenu.appendChild(viewButton);
    dropdownMenu.appendChild(deleteButton);

    var dropdownButton = document.createElement("button");
    dropdownButton.className = "dropdown";
    dropdownButton.type = "button";
    deleteButton.setAttribute("data-toggle", "dropdown");

    var dropdown = document.createElement("div");
    dropdown.className = "dropdown";
    dropdown.appendChild(dropdownButton);
    dropdown.appendChild(dropdownMenu);

    // Build question footer
    var timestamp = document.createElement("div");
    timestamp.className = "question-timestamp";
    timestamp.innerHTML = timestamp;

    var readCheckbox = document.createElement("input");
    readCheckbox.className = "form-check-input";
    readCheckbox.type = "checkbox";
    readCheckbox.value = "read";

    var readtext = document.createElement("p");
    readtext.innerHTML = "Mark as read";

    var readContainer = document.createElement("div");
    readContainer.className = "form-check";
    readContainer.appendChild(readCheckbox);
    readContainer.appendChild(readtext);

    var questionFooter = document.createElement("div");
    questionFooter.className = "question-footer";
    questionFooter.appendChild(timestamp);
    questionFooter.appendChild(readContainer);
}