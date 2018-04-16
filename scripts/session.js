var invalidSessionError = "Unable to access session.";
var invalidProfError = "Could not find professor.";
var baseURL = "http://cop4331-2.com/API";
var deleteTarget = -1;

function refreshPage(){
    getInfo();
    refreshQuestions();
}

window.setInterval(refreshQuestions, 3000);
function refreshQuestions(){
    var payload = '{"session" : "", "showRead" : "'+(showRead() ? 1 : 0)+'"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/ListQuestions.php", false);
    xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");
    
    try{
        xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				var data = JSON.parse(xhr.responseText);
                var error = data.error;

                clearQuestions();
				if(error != '') {

                    if(error == invalidSessionError || error == invalidProfError){
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    else{
                        displayError(error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
					return;
                }

                var rawStudents = data.result;
                var idx = 0;
                while(idx < rawStudents.length){
                    var questionID = "";
                    var questionText = "";
                    var studentID = "";
                    var studentName = "";
                    var dateTime = "";
                    var read = "";

                    while(rawStudents.charAt(idx) != '|'){
                        questionID = questionID + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    while(rawStudents.charAt(idx) != '|'){
                        questionText = questionText + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    while(rawStudents.charAt(idx) != '|'){
                        studentID = studentID + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    while(rawStudents.charAt(idx) != '|'){
                        studentName = studentName + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    while(rawStudents.charAt(idx) != '|'){
                        dateTime = dateTime + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    while(idx < rawStudents.length && rawStudents.charAt(idx) != '|'){
                        read = read + rawStudents.charAt(idx++);
                    }
                    idx +=2;
                    insertQuestion(questionText, dateTime, (read == "1"), questionID, studentName, newestFirst());
                    
                }

                if(idx == 0){
                    if(!showRead()){
                        insertEmtpyItem(document.getElementsByClassName("questions-container")[0], "There are no unread questions");
                    } 
                    else {
                        insertEmtpyItem(document.getElementsByClassName("questions-container")[0], "There are no questions");
                    }
                }
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("refreshQueries Error: "+error);
    }
}

function showRead(){
    var filterMode = document.getElementById("filter-select");
    if(filterMode.options[filterMode.selectedIndex].value == "unreadOnly") return false;
    return true;
}

function newestFirst(){
    var sortMode = document.getElementById("sort-select");
    if(sortMode.options[sortMode.selectedIndex].value == "newestFirst") return true;
    return false;
}

function clearQuestions(){
    var container = document.getElementsByClassName("questions-container")[0];
    var questions = container.getElementsByClassName("question");

    while(questions.length > 0){
        container.removeChild(questions[0]);
    }

    clearEmtpyItems(container);
}

function toggleRead(id){
    var payload = '{"session" : "", "questionID" : "'+id+'"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/ToggleRead.php", false);
    xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");
    
    try{
        xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				var data = JSON.parse(xhr.responseText);
                var error = data.error;

				if(error != '') {

                    if(error == invalidSessionError){
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    else{
                        displayError(error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
					return;
                }

                refreshQuestions();
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("toggleRead Error: "+error);
    }
}

function insertQuestion(text, timestamp, read, id, studentName, sortNewest){

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
    displayButton.setAttribute("onclick", "setDisplayText(\""+text+"\");");
    
    var viewButton = document.createElement("button");
    viewButton.className = "dropdown-item";
    viewButton.innerHTML = "View Student";
    viewButton.setAttribute("data-toggle", "modal");
    viewButton.setAttribute("data-target", "#displayStudentModal");
    viewButton.setAttribute("onclick", "setAskerName(\""+studentName+"\");");

    var deleteButton = document.createElement("button");
    deleteButton.className = "dropdown-item";
    deleteButton.innerHTML = "Delete";
    deleteButton.setAttribute("data-toggle", "modal");
    deleteButton.setAttribute("data-target", "#deleteQuestionModal");
    deleteButton.setAttribute("onclick", "setDeleteTarget("+id+");");

    var dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu";
    dropdownMenu.appendChild(displayButton);
    dropdownMenu.appendChild(viewButton);
    dropdownMenu.appendChild(deleteButton);

    var dropdownButton = document.createElement("button");
    dropdownButton.className = "btn-menu";
    dropdownButton.type = "button";
    dropdownButton.setAttribute("data-toggle", "dropdown");

    var dropdown = document.createElement("div");
    dropdown.className = "dropdown";
    dropdown.appendChild(dropdownButton);
    dropdown.appendChild(dropdownMenu);

    // Build question footer
    var timestampElement = document.createElement("div");
    timestampElement.className = "question-timestamp";
    timestampElement.innerHTML = timestamp;

    var readCheckbox = document.createElement("input");
    readCheckbox.className = "form-check-input";
    readCheckbox.type = "checkbox";
    readCheckbox.value = "read";
    readCheckbox.checked = read;
    readCheckbox.setAttribute("onclick", "toggleRead("+id+");");

    var readtext = document.createElement("p");
    readtext.innerHTML = "Mark as read";

    var readContainer = document.createElement("div");
    readContainer.className = "form-check";
    readContainer.appendChild(readCheckbox);
    readContainer.appendChild(readtext);

    var questionFooter = document.createElement("div");
    questionFooter.className = "question-footer";
    questionFooter.appendChild(timestampElement);
    questionFooter.appendChild(readContainer);

    var questionBody = document.createElement("div");
    questionBody.className = "question-body";
    questionBody.appendChild(questionText);
    questionBody.appendChild(dropdown);

    var questionContainer = document.createElement("div");
    questionContainer.className = "question";
    questionContainer.appendChild(questionBody);
    questionContainer.appendChild(questionFooter);

    var container = document.getElementsByClassName("questions-container")[0];
    if(!sortNewest){
        container.appendChild(questionContainer);
    }
    else{
        container.insertBefore(questionContainer, container.getElementsByClassName("question-list-header")[0].nextSibling);
    }
}

function deleteQuestion(){
    if(deleteTarget == -1) return;

    var payload = '{"session" : "", "questionID" : "'+deleteTarget+'"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/DeleteQuestion.php", false);
    xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");
    
    try{
        xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				var data = JSON.parse(xhr.responseText);
                var error = data.error;

				if(error != '') {

                    if(error == invalidSessionError){
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    else{
                        displayError(error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
					return;
                }

                refreshQuestions();
                deleteTarget = -1;
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("deleteQuestion Error: "+error);
    }
}

function getInfo() {
    var payload = '{"session" : ""}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/GetInfo.php", false);
    xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");
    
    try{
        xhr.onreadystatechange = function(){
			if(xhr.readyState === 4) {
				var data = JSON.parse(xhr.responseText);
                var error = data.error;

				if(error != '') {

                    if(error == invalidSessionError){
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    else{
                        displayError(error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
					return;
                }
                
                document.getElementsByClassName("class-title")[0].innerHTML = data.className;
                document.getElementsByClassName("class-id")[0].innerHTML = "Class ID: "+decToHex(data.classID);
			}
		}

		xhr.send(payload);
    }
    catch(error){
        console.log("Get Info Error: "+error);
    }
}

function setDisplayText(text){
    document.getElementsByClassName("display-question-text")[0].innerHTML = text;
}

function setAskerName(name){
    document.getElementById("askerName").innerHTML = name;
}

function setDeleteTarget(id){
    deleteTarget = id;
}