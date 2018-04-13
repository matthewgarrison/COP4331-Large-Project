var invalidSessionError = "Unable to access session.";
var invalidProfError = "Could not find professor.";
var baseURL = "http://cop4331-2.com/API";

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
    goButton.setAttribute("onclick", "gotoClass("+classID+")");

    // Class header
    var classTitle = document.createElement("p");
    classTitle.innerHTML = className;

    var deleteButton = document.createElement("button");
    deleteButton.className = "btn-deleteClass";
    goButton.setAttribute("data-toggle", "modal");
    goButton.setAttribute("data-target", "#deleteClassModal");
    goButton.setAttribute("onclick", "deleteClass("+classID+")");

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

function decToHex(value){

    var hex = "";
    var place = 16;
    var placeBelow = 1;
    while(value !== 0){
        hex = hexChar((value%place)/placeBelow) + hex;
        value -= value%place;
        placeBelow = place;
        place *= 16;
    }

    return hex;
}

function hexToDec(value){

    var dec = 0;
    var mult = 1;
    for(var i=value.length-1; i>=0; i--){
        dec += hexVal(value.charAt(i))*mult;
        mult *= 16;
    }

    return dec;
}

function hexChar(value){
    if(value < 10) return value;
    if(value == 10) return "A";
    if(value == 11) return "B";
    if(value == 12) return "C";
    if(value == 13) return "D";
    if(value == 14) return "E";
    if(value == 15) return "F";
}

function hexVal(value){
    if(value == "A") return 10;
    if(value == "B") return 11;
    if(value == "C") return 12;
    if(value == "D") return 13;
    if(value == "E") return 14;
    if(value == "F") return 15;
    return value;
}

function clearClasses(){
    var container = document.getElementsByClassName("class-list-container")[0];
    var classes = container.getElementsByClassName("class-container");

    while(classes.length > 0){
        container.removeChild(classes[0]);
    }
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

				if(error != '') {

                    if(error == invalidSessionError){
                        window.location.href = "http://cop4331-2.com/myClasses.html";
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    if(error == invalidProfError){
                        window.location.href = "http://cop4331-2.com/myClasses.html";
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

                clearClasses();
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

function logout(){
    var payload = '{"session" : ""}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/Logout.php", false);
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

				window.location.href = "http://cop4331-2.com/Login.html";
			}
		}

		xhr.send(payload);
    }

    catch(error){
        console.log("Logout Error: "+error);
    }
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
        console.log("Add Class Error: "+error);
    }
}

function gotoClass(id){
    var payload = '{"session" : "", "classID" : "'+id+'"}';

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
                        console.log("API ERROR: "+error);
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

function deleteClass(id){

}