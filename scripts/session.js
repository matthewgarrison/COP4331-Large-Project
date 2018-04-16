var invalidSessionError = "Unable to access session.";
var invalidProfError = "Could not find professor.";
var baseURL = "http://cop4331-2.com/API";
var showRead = false;
var deleteTarget = -1;

function refreshPage(){
    refreshQuestions();
}

window.setInterval(refreshQuestions, 3000);
function refreshQuestions(){
    var payload = '{"session" : ""}';

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
                        console.log("API ERROR: "+error);
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

                    while(idx < rawStudents.length && rawStudents.charAt(idx) != '|'){
                        dateTime = dateTime + rawStudents.charAt(idx++);
                    }

                    insertQuestion(questionText, dateTime, false, questionID, studentName);
                    idx+=2;
                }
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("refreshQueries Error: "+error);
    }
}


function clearQuestions(){
    var container = document.getElementsByClassName("questions-container")[0];
    var questions = container.getElementsByClassName("question");

    while(questions.length > 0){
        container.removeChild(questions[0]);
    }
}

function insertQuestion(text, timestamp, read, id, studentName){

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
    deleteButton.setAttribute("onclick", "deleteTarget = "+id+";");

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
                        console.log("API ERROR: "+error);
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
                        console.log("API ERROR: "+error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
					return;
                }
                
                document.getElementsByClassName("class-title")[0].innerHTML = data.className;
                document.getElementsByClassName("class-id")[0].innerHTML = decToHex(data.classID);
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