var invalidSessionError = "Unable to access session.";
var invalidProfError = "Could not find professor.";
var baseURL = "http://cop4331-2.com/API";
var deleteTarget = -1;
var deletePollTarget = -1;
var letters = ["A", "B", "C", "D", "E", "F", "G"];

var endTarget = -1;

function refreshPage(){
    getInfo();
    refreshQuestions();
    refreshPolls();
}

window.setInterval(lightRefresh, 5000);
function lightRefresh(){
    refreshQuestions();
    refreshPolls();
}

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
                clearQuestions();

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

    while(true){
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
            continue;
        }
        break;
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

    while(true){
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
            continue;
        }
        break;
    }
	
}

function getInfo() {
    var payload = '{"session" : ""}';

    while(true){
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
            continue;
        }
        break;
    }
	
}

function addPoll() {
    var pollText = document.getElementById("add-poll-question-input").value;
    document.getElementById("add-poll-question-input").value = "";
    var answer1 = document.getElementById("add-poll-answer1-input").value;
    document.getElementById("add-poll-answer1-input").value = "";
    var answer2 = document.getElementById("add-poll-answer2-input").value;
    document.getElementById("add-poll-answer2-input").value = "";
    var answer3 = document.getElementById("add-poll-answer3-input").value;
    document.getElementById("add-poll-answer3-input").value = "";
    var answer4 = document.getElementById("add-poll-answer4-input").value;
    document.getElementById("add-poll-answer4-input").value = "";
    var answer5 = document.getElementById("add-poll-answer5-input").value;
    document.getElementById("add-poll-answer5-input").value = "";
    var payload = '{"session" : "", "text" : "'+pollText+'", "answer1" : "' + answer1 + '", "answer2" : "' + 
            answer2 + '", "answer3" : "' + answer3 + '", "answer4" : "' + answer4 + '", "answer5" : "' + answer5 + '"}';

    while(true){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", baseURL + "/CreatePoll.php", false);
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

                        if(error == "Failed to find session."){
                            console.log("INVALID SESSION");
                            window.location.href = "http://cop4331-2.com/Login.html";
                        }

                        else{
                            displayError(error);
                            // window.location.href = "http://cop4331-2.com/Login.html";
                        } 
                        return;
                    }
                    refreshPolls();
                }
            }

            xhr.send(payload);
        }

        catch(error){
            console.log("Add Poll Error: "+error);
            continue;
        }
        break;
    }
}

function refreshPolls(){
    var payload = '{"session" : ""}';
    while(true){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", baseURL + "/ListPolls.php", false);
        xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");

        try{
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4){
                    var data = JSON.parse(xhr.responseText);
                    var error = data.error;

                    clearActivePolls();
                    clearArchivedPolls();
                    displayActivePollContent = [];
                    if(error != '') {

                        if(error == invalidSessionError){
                            console.log("INVALID SESSION");
                            window.location.href = "http://cop4331-2.com/Login.html";
                        }

                        else if(error == invalidProfError){
                            console.log("INVALID SESSION");
                            window.location.href = "http://cop4331-2.com/Login.html";
                        }

                        else{
                            displayError(error);
                            // window.location.href = "http://cop4331-2.com/Login.html";
                        } 
                        return;
                    }
                    
                    // Update active polls
                    var activeRaw = data.active;
                    var idx = 0;
                    while(idx < activeRaw.length){
                        var pollID = "";
                        var questionText = "";
                        var numAnswers = "";
                        var dateCreated = "";
                        var answers = "";

                        while(activeRaw.charAt(idx) != '|'){
                            pollID = pollID + activeRaw.charAt(idx++);
                        }
                        idx += 2;

                        while(activeRaw.charAt(idx) != '|'){
                            questionText = questionText + activeRaw.charAt(idx++);
                        }
                        idx += 2;

                        while(activeRaw.charAt(idx) != '|'){
                            numAnswers = numAnswers + activeRaw.charAt(idx++);
                        }
                        idx += 2;

                        while(idx < activeRaw.length && activeRaw.charAt(idx) != '|'){
                            dateCreated = dateCreated + activeRaw.charAt(idx++);
                        }
                        idx+=2;

                        for(var i=0; i<numAnswers; i++){
                            if(i != 0) answers = answers + "| ";
                            while(idx < activeRaw.length && activeRaw.charAt(idx) != '|'){
                                answers = answers + activeRaw.charAt(idx++);
                            }
                            idx += 2;
                        }

                        for(var i=numAnswers; i<5; i++){
                            idx += 2;
                        }

                        insertActivePoll(questionText, answers, parseInt(numAnswers), pollID);
                    }

                    if(idx == 0){
                        insertEmtpyItem(document.getElementsByClassName("overhead-container-polls")[0], "There are no active polls");
                    }

                    // Update archived polls
                    var archivedRaw = data.archived;
                    idx = 0;
                    while(idx < archivedRaw.length){
                        var pollID = "";
                        var questionText = "";
                        var numAnswers = "";
                        var dateCreated = "";
                        var dateArchived = "";
                        var answers = "";

                        while(archivedRaw.charAt(idx) != '|'){
                            pollID = pollID + archivedRaw.charAt(idx++);
                        }
                        idx += 2;

                        while(archivedRaw.charAt(idx) != '|'){
                            questionText = questionText + archivedRaw.charAt(idx++);
                        }
                        idx += 2;

                        while(archivedRaw.charAt(idx) != '|'){
                            numAnswers = numAnswers + archivedRaw.charAt(idx++);
                        }
                        idx += 2;

                        while(idx < archivedRaw.length && archivedRaw.charAt(idx) != '|'){
                            dateCreated = dateCreated + archivedRaw.charAt(idx++);
                        }
                        idx+=2;

                        while(idx < archivedRaw.length && archivedRaw.charAt(idx) != '|'){
                            dateArchived = dateArchived + archivedRaw.charAt(idx++);
                        }
                        idx+=2;

                        for(var i=0; i<numAnswers; i++){
                            if(i != 0) answers = answers + "| ";
                            while(idx < archivedRaw.length && archivedRaw.charAt(idx) != '|'){
                                answers = answers + archivedRaw.charAt(idx++);
                            }
                            idx += 2;
                        }

                        for(var i=numAnswers; i<5; i++){
                            idx += 2;
                        }

                        insertArchivedPoll(questionText, answers, parseInt(numAnswers), pollID);
                    }

                    if(idx == 0){
                        insertEmtpyItem(document.getElementsByClassName("overhead-container-polls")[1], "There are no archived polls");
                    }

                    
                }
            }

            xhr.send(payload);
        }

        catch(error){
            console.log("refreshPolls Error: "+error);
            continue;
        }
        break;
    }
}

function clearActivePolls(){
    var container = document.getElementsByClassName("overhead-container-polls")[0];
    var polls = container.getElementsByClassName("polls-container");

    while(polls.length > 0){
        container.removeChild(polls[0]);
    }

    clearEmtpyItems(container);
}

function insertActivePoll(questionText, answerText, numAnswers, id){
    // Create dropdown menu
    var displayButton = document.createElement("button");
    displayButton.className = "dropdown-item";
    displayButton.setAttribute("data-toggle", "modal");
    displayButton.setAttribute("data-target", "#displayPollModal"); 
    displayButton.setAttribute("onclick", "updateDisplayModal('"+questionText+"','"+answerText+"');");   
    displayButton.innerHTML = "Display";

    var resultsButton = document.createElement("button");
    resultsButton.className = "dropdown-item";
    resultsButton.setAttribute("data-toggle", "modal");
    resultsButton.setAttribute("data-target", "#viewResultsModal"); 
    resultsButton.setAttribute("onclick", "setChart('"+questionText+"', "+numAnswers+", "+id+");");   
    resultsButton.innerHTML = "View Results";

    var endButton = document.createElement("button");
    endButton.className = "dropdown-item";
    endButton.setAttribute("data-toggle", "modal");
    endButton.setAttribute("data-target", "#endPollModal");  
    endButton.setAttribute("onclick", "setEndTarget("+id+");");  
    endButton.innerHTML = "End Poll";
    
    var deleteButton = document.createElement("button");
    deleteButton.className = "dropdown-item";
    deleteButton.setAttribute("data-toggle", "modal");
    deleteButton.setAttribute("data-target", "#deletePollModal");    
    deleteButton.setAttribute("onclick", "setDeletePollTarget("+id+");");  
    deleteButton.innerHTML = "Delete";

    var dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu";
    dropdownMenu.appendChild(displayButton);
    dropdownMenu.appendChild(resultsButton);
    dropdownMenu.appendChild(endButton);
    dropdownMenu.appendChild(deleteButton);

    var dropdownButton = document.createElement("button");
    dropdownButton.className = "btn-menu";
    dropdownButton.setAttribute("data-toggle", "dropdown");
    dropdownButton.type = "button";

    var dropdownContainer = document.createElement("div");
    dropdownContainer.className = "dropdown";
    dropdownContainer.appendChild(dropdownButton);
    dropdownContainer.appendChild(dropdownMenu);

    // Poll text item
    var pollText = document.createElement("div");
    pollText.className = "poll-text";
    pollText.innerHTML = questionText;

    // Poll container
    var pollEntry = document.createElement("div");
    pollEntry.className = "poll-entry";
    pollEntry.appendChild(pollText);
    pollEntry.appendChild(dropdownContainer);

    var pollContainer = document.createElement("div");
    pollContainer.className = "polls-container";
    pollContainer.appendChild(pollEntry);

    var container = document.getElementsByClassName("overhead-container-polls")[0];
    container.appendChild(pollContainer);
}

function updateDisplayModal(question, answers){
    // Clear the modal
    var modalContainer = document.getElementById("displayModal");
    var children = modalContainer.getElementsByClassName("modal-body");

    while(children.length != 0){
        modalContainer.removeChild(children[0]);
    }

    // Create new modal body
    var modalBody = document.createElement("div");
    modalBody.className = "modal-body";

    var questionText = document.createElement("div");
    questionText.className = "display-poll-question";
    questionText.innerHTML = question;
    modalBody.appendChild(questionText);

    var idx = 0;
    var letterIdx = 0;
    while(idx < answers.length){
        var answerLetter = document.createElement("div");
        answerLetter.className="answer-letter";
        answerLetter.innerHTML = letters[letterIdx++];

        var text = "";
        while(idx < answers.length && answers.charAt(idx) != '|'){
            text = text + answers.charAt(idx++);
        }
        idx += 2;

        var answerText = document.createElement("div");
        answerText.className = "answer-text";
        answerText.innerHTML = text;

        var answerContainer = document.createElement("div");
        answerContainer.className = "display-answer-choice";
        answerContainer.appendChild(answerLetter);
        answerContainer.appendChild(answerText);
        modalBody.appendChild(answerContainer);
    }

    modalContainer.insertBefore(modalBody, modalContainer.getElementsByClassName("modal-footer")[0]);
}

function clearArchivedPolls(){
    var container = document.getElementsByClassName("overhead-container-polls")[1];
    var polls = container.getElementsByClassName("polls-container");

    while(polls.length > 0){
        container.removeChild(polls[0]);
    }

    clearEmtpyItems(container);
}

function insertArchivedPoll(questionText, answerText, numAnswers, id){
    // Create dropdown menu
    var displayButton = document.createElement("button");
    displayButton.className = "dropdown-item";
    displayButton.setAttribute("data-toggle", "modal");
    displayButton.setAttribute("data-target", "#displayPollModal");  
    displayButton.setAttribute("onclick", "updateDisplayModal('"+questionText+"','"+answerText+"');");     
    displayButton.innerHTML = "Display";

    var resultsButton = document.createElement("button");
    resultsButton.className = "dropdown-item";
    resultsButton.setAttribute("data-toggle", "modal");
    resultsButton.setAttribute("data-target", "#viewResultsModal");    
    resultsButton.innerHTML = "View Results";
    
    var deleteButton = document.createElement("button");
    deleteButton.className = "dropdown-item";
    deleteButton.setAttribute("data-toggle", "modal");
    deleteButton.setAttribute("data-target", "#deletePollModal"); 
    deleteButton.setAttribute("onclick", "setDeletePollTarget("+id+");");   
    deleteButton.innerHTML = "Delete";

    var dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu";
    dropdownMenu.appendChild(displayButton);
    dropdownMenu.appendChild(resultsButton);
    dropdownMenu.appendChild(deleteButton);

    var dropdownButton = document.createElement("button");
    dropdownButton.className = "btn-menu";
    dropdownButton.setAttribute("data-toggle", "dropdown");
    dropdownButton.type = "button";

    var dropdownContainer = document.createElement("div");
    dropdownContainer.className = "dropdown";
    dropdownContainer.appendChild(dropdownButton);
    dropdownContainer.appendChild(dropdownMenu);

    // Poll text item
    var pollText = document.createElement("div");
    pollText.className = "poll-text";
    pollText.innerHTML = questionText;

    // Poll container
    var pollEntry = document.createElement("div");
    pollEntry.className = "poll-entry";
    pollEntry.appendChild(pollText);
    pollEntry.appendChild(dropdownContainer);

    var pollContainer = document.createElement("div");
    pollContainer.className = "polls-container";
    pollContainer.appendChild(pollEntry);

    var container = document.getElementsByClassName("overhead-container-polls")[1];
    container.appendChild(pollContainer);
}

function endPoll(){
    if(endTarget == -1) return;

    var payload = '{"session" : "", "pollID" : "'+endTarget+'"}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/TogglePoll.php", false);
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

                refreshPolls();
                setEndTarget(-1);
            }
        }

        xhr.send(payload);
    }

    catch(error){
        console.log("endPoll Error: "+error);
        displayError("Failed to archive poll, try again later");
    }
}

function deletePoll(){
    if(deletePollTarget == -1) return;

    var payload = '{"session" : "", "pollID" : "'+deletePollTarget+'"}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/DeletePoll.php", false);
    xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");
    
    try{
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                var data = JSON.parse(xhr.responseText);
                var error = data.error;

                if(error != '') {

                    if(error == invalidSessionError || error == "Only professors can delete polls."){
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    else{
                        displayError(error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
                    return;
                }

                refreshPolls();
                setDeletePollTarget(-1);
            }
        }

        xhr.send(payload);
    }

    catch(error){
        console.log("deletePoll Error: "+error);
        displayError("Failed to delete poll, try again later");
    }
}

function setChart(question, numAnswers, id){
    var payload = '{"session" : "", "pollID" : "'+id+'"}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/GetPollResults.php", false);
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

                var answerData = [];
                if(numAnswers > 0) answerData[0] = parseInt(data.ans1);
                if(numAnswers > 1) answerData[1] = parseInt(data.ans2);
                if(numAnswers > 2) answerData[2] = parseInt(data.ans3);
                if(numAnswers > 3) answerData[3] = parseInt(data.ans4);
                if(numAnswers > 4) answerData[4] = parseInt(data.ans5);

                var chartData = [];
                for(var i=0; i<numAnswers; i++){
                    chartData[i] = {
                        y: answerData[i]
                    }
                }

                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: 'chart-container',
                        type: 'bar'
                    },

                    title: {
                        text: question
                    },

                    xAxis: {
                        categories: letters,
                        labels: {
                            enabled: true
                        }
                    },

                    series: [{
                        type: 'column',
                        name: question,
                        data: chartData
                    }]
                });
            }
        }

        xhr.send(payload);
    }

    catch(error){
        console.log("getPollResults Error: "+error);
        displayError("Failed to get poll data, try again later");
    }
}

function setEndTarget(id){
    endTarget = id;
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

function setDeletePollTarget(id){
    deletePollTarget = id;
}