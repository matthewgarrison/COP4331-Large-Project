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
    catch(error){
        console.log("Get Class Name Error: "+error);
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
    catch(error){
        console.log("Get Class ID Error: "+error);
    }

    return "";
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
                        console.log("API ERROR: "+error);
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

function endSession(sessionID) {
    var payload = '{"session" : "", "sessionID" : "'+sessionID+'"}';

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
                        console.log("API ERROR: "+error);
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
                        idx++;
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
}

function insertSession(isActiveSession, sessionName, sessionId, date) {
    // Link to enter the session
    var sessionLink = document.createElement("a");
    sessionLink.href = "#";
    sessionLink.innerHTML = sessionName;

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
        dropdownButton.setAttribute("data-toggle", "dropdown");
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
    if (isActiveSession) container = document.getElementsByClassName("session-container")[0];
    else container = document.getElementsByClassName("archive-container")[0];
    container.appendChild(sessionElement);
}