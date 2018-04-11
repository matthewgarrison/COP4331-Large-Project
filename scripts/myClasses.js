var invalidSessionError = "Unable to access session.";
var invalidProfError = "Could not find professor.";
var baseURL = "http://cop4331-2.com/API";

function insertClass(className, classID, numStudents, numSessions){
    // Stats information
    var classIDElement = document.createElement("p");
    classIDElement.innerHTML = "Class ID: " + hexString(classID);

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

    // Class element
    var classElement = document.createElement("div");
    classElement.innerHTML = className+"<br>\n<hr>";
    classElement.className = "class-container";
    classElement.appendChild(classStatsContainer);
    classElement.appendChild(goButton);

    // Classes container
    var container = document.getElementsByClassName("class-list-container")[0];
    container.appendChild(classElement);
}

function hexString(value){
    return "INSERTHEXHERE("+value+")";
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
                    }

                    if(error == invalidProfError){
                        window.location.href = "http://cop4331-2.com/myClasses.html";
                        console.log("INVALID SESSION");
                    }

                    else console.log("API ERROR: "+error);
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