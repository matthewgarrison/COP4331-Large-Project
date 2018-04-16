var invalidSessionError = "Unable to access session";
var invalidProfError = "Could not find professor.";
var baseURL = "http://cop4331-2.com/API";
var deleteTarget = -1;

function insertClass(className, classID, numStudents, numSessions){
    // Stats information
    var classIDElement = document.createElement("p");
    classIDElement.innerHTML = "Class ID: " + decToHex(classID);

    var numStudentsElement = document.createElement("p");
    numStudentsElement.innerHTML = "Number of Students: " + numStudents;
    
    var numSessionsElement = document.createElement("p");
    numSessionsElement.innerHTML = "Number of Sessions: " + numSessions;

    // Stats container
    var classStatsContainer = document.createElement("div");
    classStatsContainer.className = "class-stats-container";
    classStatsContainer.appendChild(classIDElement);
    classStatsContainer.appendChild(numStudentsElement);
    classStatsContainer.appendChild(numSessionsElement);

    // Go to class button
    var goButton = document.createElement("button");
    goButton.type = "button";
    goButton.className = "btn-custom";
    goButton.setAttribute("onclick", 'gotoClass('+classID+', "' + className + '")');

    // Class header
    var classTitle = document.createElement("p");
    classTitle.innerHTML = className;

    var deleteButton = document.createElement("button");
    deleteButton.className = "btn-deleteClass";
    deleteButton.setAttribute("data-toggle", "modal");
    deleteButton.setAttribute("data-target", "#deleteClassModal");
    deleteButton.setAttribute("onclick", "setDeleteTarget("+classID+",\""+className+"\")");

    var classHeader = document.createElement("div");
    classHeader.className = "class-header";
    classHeader.appendChild(classTitle);
    classHeader.appendChild(deleteButton);

    // Class element
    var classElement = document.createElement("div");
    classElement.className = "class-container";
    classElement.appendChild(classHeader);
    classElement.appendChild(classStatsContainer);
    classElement.appendChild(goButton);

    // Classes container
    var container = document.getElementsByClassName("class-list-container")[0];
    container.appendChild(classElement);
}
function clearClasses(){
    var container = document.getElementsByClassName("class-list-container")[0];
    var classes = container.getElementsByClassName("class-container");

    while(classes.length > 0){
        container.removeChild(classes[0]);
    }

    clearEmtpyItems(container);
}

function refreshClasses(){
	var payload = '{"session" : ""}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/GetProfClass.php", false);
    xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");
    
    try{
        xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				var data = JSON.parse(xhr.responseText);
                var error = data.error;

                clearClasses();
				if(error != '') {
                    if(error == invalidSessionError){
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    else if(error == invalidProfError){
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    else {
                        displayError(error);
                    }
					return;
                }
                
                console.log("VALID SESSION");

                var rawClasses = data.result;
                var idx = 0;
                while(idx < rawClasses.length){
                    var classID = "";
                    var className = "";
                    var numStudents = "";
                    var numSessions = "";

                    while(rawClasses.charAt(idx) != ':'){
                        classID = classID + rawClasses.charAt(idx++);
                    }
                    idx += 2;

                    while(rawClasses.charAt(idx) != ':'){
                        className = className + rawClasses.charAt(idx++);
                    }
                    idx += 2;

                    while(rawClasses.charAt(idx) != ':'){
                        numStudents = numStudents + rawClasses.charAt(idx++);
                    }
                    idx += 2;

                    while(idx < rawClasses.length && rawClasses.charAt(idx) != '|'){
                        numSessions = numSessions + rawClasses.charAt(idx++);
                    }

                    insertClass(className, classID, numStudents, numSessions);
                    idx++;
                }

                if(idx == 0){
                    insertEmtpyItem(document.getElementsByClassName("class-list-container")[0], "You have not created any classes");
                }
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("Refresh Classes Error: "+error);
    }
}

function refreshPage(){
    refreshClasses();
}

function addClass(){
    var className = document.getElementById("add-class-input").value;
    document.getElementById("add-class-input").value = "";
    var payload = '{"session" : "", "name" : "'+className+'"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/AddClass.php", false);
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
                refreshClasses();
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("Add Class Error: "+error);
    }
}

function gotoClass(id, name){
    var payload = '{"session" : "", "classID" : "'+id+'", "className" : "'+name+'"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/SetClassID.php", false);
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

				window.location.href = "http://cop4331-2.com/Class.html";
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("gotoClass Error: "+error);
    }
}

function deleteClass(){
    if(deleteTarget == -1) return;

    var payload = '{"session" : "", "classID" : "'+deleteTarget+'"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/DeleteClass.php", false);
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

                refreshClasses();
                setDeleteTarget(-1, "");
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("deleteClass Error: "+error);
    }

}

function setDeleteTarget(id, name){
    deleteTarget = id;
    document.getElementsByClassName("edit-class-form-container")[0].innerHTML = 'Are you sure you want to delete "'+name+'"? You won\'t ever be able to access it again.';
}