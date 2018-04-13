var sessionID, classID;
var invalidSessionError = "Unable to access session.";
var invalidProfError = "Could not find professor.";
var baseURL = "http://cop4331-2.com/API";

function getClassName() {
    var payload = '{"session" : ""}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/GetInfo.php", false);
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
                        console.log("API ERROR: "+error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
					return;
                }
                
                return data.className;
			}
		}

		xhr.send(payload);
    }

	return "";
}

function getClassID() { // Returns it in hex
    var payload = '{"session" : ""}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/GetInfo.php", false);
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
                        console.log("API ERROR: "+error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
                    return;
                }
                
                return decToHex(data.classID);
            }
        }

        xhr.send(payload);
    }

    return "";
}

function updateClassName() {
	// call the API endpoint
}

function createNewSession() {
	var sessionName = document.getElementById("new-session-form-container").value;
    document.getElementById("new-session-form-container").value = "";
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
                        console.log("API ERROR: "+error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
					return;
                }
                refreshClasses();
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("Add Session Error: "+error);
    }
}

function endSession(sessionId) {

}

function refreshPage(){
    refreshSessions();
    document.getElementsByClassName("class-title")[0].innerHTML = getClassName();
    document.getElementsByClassName("class-id")[0].innerHTML = getClassID();
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
                        window.location.href = "http://cop4331-2.com/Class.html";
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    if(error == invalidProfError){
                        window.location.href = "http://cop4331-2.com/Class.html";
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    else{
                        console.log("API ERROR: "+error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
					return;
                }
                
                console.log("VALID SESSION");

                var loopIdx;
                for (loopIdx = 0; loopIdx < 2; loopIdx++) {
                    var isActiveSession = (loopIdx == 0);
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

                        insertClass(isActiveSession, sessionID, sessionName, date);
                        idx++;
                    }
                }
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("Refresh Classes Error: "+error);
    }
}


function clearSessions(activeSessions) {
    var container = "";
    if (activeSessions) container = document.getElementsByClassName("session-container")[0];
    else container = document.getElementsByClassName("archive-container")[0];
    var classes = container.getElementsByClassName("session-container");

    while(classes.length > 0){
        container.removeChild(classes[0]);
    }
}

function insertSession(isActiveSession, sessionName, sessionId, date) {
    // Link to enter the session
    var sessionLink = document.createElement("a");
    sessionLink.href = "#";
    sessionLink.innerHTML = sessionName;

    // Class element
    var sessionElement = document.createElement("div");
    sessionElement.className = "session-container";
    sessionElement.appendChild(sessionLink);

    if (isActiveSession) {
        var endButton = document.createElement("button");
        endButton.type = "button";
        endButton.className = "btn-session";
        endButton.setAttribute("data-toggle", "modal");
        endButton.setAttribute("data-target", "#endSessionModal");
        endButton.setAttribute("onclick", "endSession("+sessionId+")");
        sessionElement.appendChild(endButton);
    } else {
        var dateElement = document.createElement("div");
        dateElement.className = "archive-date";
        dateElement.innerHTML = date;
        sessionElement.appendChild(dateElement);
        var dropdownElement = document.createElement("div");
        dropdownElement.className = "dropdown";
        var dropdownButton = document.createElement("button");
        dropdownButton.type = "button";
        dropdownButton.className = "btn-menu";
        dropdown.setAttribute("data-toggle", "dropdown");
        dropdownElement.appendChild(dropdownButton);
        var dropdownMenuElement = document.createElement("div");
        dropdownMenuElement.className = "dropdown-menu";
        var dropdownRenameElement = document.createElement("button");
        dropdownRenameElement.type = "button";
        dropdownRenameElement.className = "dropdown-item";
        dropdownRenameElement.setAttribute("data-toggle", "modal");
        dropdownRenameElement.setAttribute("data-target", "#editSessionModal");
        dropdownRenameElement.setAttribute("onclick", "");
        dropdownMenuElement.appendChild(dropdownRenameElement);
        var dropdownDeleteElement = document.createElement("button");
        dropdownDeleteElement.type = "button";
        dropdownDeleteElement.className = "dropdown-item";
        dropdownDeleteElement.setAttribute("data-toggle", "modal");
        dropdownDeleteElement.setAttribute("data-target", "#editSessionModal");
        dropdownDeleteElement.setAttribute("onclick", "");
        dropdownMenuElement.appendChild(dropdownDeleteElement);
        dropdownElement.appendChild(dropdownMenuElement);
        sessionElement.appendChild(dropdownElement);
    }

    // Sessions container
    var container = "";
    if (activeSessions) container = document.getElementsByClassName("session-container")[0];
    else container = document.getElementsByClassName("archive-container")[0];
    container.appendChild(classElement);
}