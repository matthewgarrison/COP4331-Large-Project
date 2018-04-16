var deleteTarget, endTarget;
var invalidSessionError = "Unable to access session.";
var invalidProfError = "Could not find professor.";
var baseURL = "http://cop4331-2.com/API";
var classID, className;

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
                
                className = data.className;
                classID = data.classID;
			}
		}

		xhr.send(payload);
    }
    catch(error){
        console.log("Get Info Error: "+error);
    }
}

function updateClassName() {
	// call the API endpoint
}

function createNewSession() {
	var sessionName = document.getElementById("create-new-session-input").value;
    document.getElementById("create-new-session-input").value = "";
    var payload = '{"session" : "", "name" : "'+sessionName+'"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/AddSession.php", false);
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
                refreshSessions();
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("Create New Session Error: "+error);
    }
}

function endSession() {
    if(endTarget == -1) return;
    var payload = '{"session" : "", "sessionID" : "'+endTarget+'"}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/ToggleArchived.php", false);
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
                refreshSessions();
            }
        }

        xhr.send(payload);
    }

    catch(error){
        console.log("End Session Error: "+error);
    }
}

function deleteSession() {
    if(deleteTarget == -1) return;
    var payload = '{"session" : "", "sessionID" : "'+deleteTarget+'"}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/DeleteSession.php", false);
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
                refreshSessions();
            }
        }

        xhr.send(payload);
    }

    catch(error){
        console.log("Delete Session Error: "+error);
    }
}

function refreshPage(){
    refreshSessions();
    getInfo();
    document.getElementsByClassName("class-title")[0].innerHTML = className;
    document.getElementsByClassName("class-id")[0].innerHTML = "Class ID: " + decToHex(classID);
    document.title = "Queue & A - " + className;
}

function refreshSessions(){
	var payload = '{"session" : ""}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/GetSession.php", false);
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
                
                var loopIdx;
                for (loopIdx = 0; loopIdx < 2; loopIdx++) {
                    var isActiveSession = (loopIdx ? true : false);
                    clearSessions(isActiveSession);
                    var rawSessions = (isActiveSession ? data.active : data.archived);
                    var idx = 0;

                    while(idx < rawSessions.length){
                        var sessionID = "";
                        var sessionName = "";
                        var date = "";

                        while(rawSessions.charAt(idx) != ':'){
                            sessionID = sessionID + rawSessions.charAt(idx++);
                        }
                        idx += 2;

                        while(rawSessions.charAt(idx) != ':'){
                            sessionName = sessionName + rawSessions.charAt(idx++);
                        }
                        idx += 2;

                        while(idx < rawSessions.length && rawSessions.charAt(idx) != '|'){
                            date = date + rawSessions.charAt(idx++);
                        }

                        insertSession(isActiveSession, sessionName, sessionID, date);
                        idx ++;
                    }

                    if(idx == 0){
                        if(isActiveSession){
                            insertEmtpyItem(document.getElementsByClassName("session-container")[0], "There are no active sessions");
                        }
                        else{
                            insertEmtpyItem(document.getElementsByClassName("archive-container")[0], "There are no archived sessions");
                        }
                    }
                }
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("Refresh Sessions Error: "+error);
    }
}

function setEndTarget(id) {
    endTarget = id;
}

function setDeleteTarget(id) {
    deleteTarget = id;
}


function clearSessions(activeSessions) {
    var container = "", classes = "";
    if (activeSessions) {
        container = document.getElementsByClassName("session-container")[0];
        classes = container.getElementsByClassName("session");
    } else {
        container = document.getElementsByClassName("archive-container")[0];
        classes = container.getElementsByClassName("archive-entry");
    }

    while(classes.length > 0){
        container.removeChild(classes[0]);
    }

    clearEmtpyItems(container);
}

function gotoSession(id, name){
    var payload = '{"session" : "", "sessionID" : "'+id+'", "sessionName" : "'+name+'"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/SetSessionID.php", false);
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

				window.location.href = "http://cop4331-2.com/session.html";
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("gotoSession Error: "+error);
    }
}

function insertSession(isActiveSession, sessionName, sessionId, date) {
    if (!isActiveSession) {
        var idx = date.indexOf(":");
        if (idx != -1) {
            date = date.substring(idx+2);
        }
    }

    // Link to enter the session
    var sessionLink = document.createElement("a");
    sessionLink.innerHTML = sessionName;
    sessionLink.setAttribute("onclick", "gotoSession("+sessionId+", '"+sessionName+"');");

    // Class element
    var sessionElement = document.createElement("div");
    if (isActiveSession) sessionElement.className = "session";
    else sessionElement.className = "archive-entry";
    sessionElement.appendChild(sessionLink);

    if (isActiveSession) {
        var endButton = document.createElement("button");
        endButton.type = "button";
        endButton.innerHTML = "End Session";
        endButton.className = "btn-session";
        endButton.setAttribute("data-toggle", "modal");
        endButton.setAttribute("data-target", "#endSessionModal");
        endButton.setAttribute("onclick", "setEndTarget("+sessionId+")");
        sessionElement.appendChild(endButton);
    } else {
        var dateElement = document.createElement("div");
        dateElement.className = "archive-date";
        dateElement.innerHTML = date;
        sessionElement.appendChild(dateElement);
    }
    var deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn-delete";
    deleteButton.setAttribute("data-toggle", "modal");
    deleteButton.setAttribute("data-target", "#deleteSessionModal");
    deleteButton.setAttribute("onclick", "setDeleteTarget("+sessionId+")");
    sessionElement.appendChild(deleteButton);

    // Sessions container
    var container = "";
    if (isActiveSession) container = document.getElementsByClassName("session-container")[0];
    else container = document.getElementsByClassName("archive-container")[0];
    container.appendChild(sessionElement);
}