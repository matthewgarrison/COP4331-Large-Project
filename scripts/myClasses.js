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