var invalidSessionError = "Unable to access session";
var invalidProfError = "Could not find professor.";
var baseURL = "http://cop4331-2.com/API";

var banTarget = -1;
var unbanTarget = -1;
var className = "CLASS NAME";

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
                document.title = data.className + " | Queue & A";
                className = data.className;
            }
        }

        xhr.send(payload);
    }
    catch(error){
        console.log("Get Info Error: "+error);
    }
}

function refreshPage(){
    refreshCurrentStudents();
    refreshBannedStudents();
    getInfo();
}

function clearCurrentStudents(){
    var container = document.getElementsByClassName("student-list-container")[0];
    var students = container.getElementsByClassName("student");

    while(students.length > 1){
        container.removeChild(students[1]);
    }

    clearEmtpyItems(container);
}

function insertStudent(name, email, joinDate, id){
    var nameElement = document.createElement("p");
    nameElement.className = "student-name";
    nameElement.innerHTML = name;

    var emailElement = document.createElement("p");
    emailElement.className = "student-email";
    emailElement.innerHTML = email;

    var joinDateElement = document.createElement("p");
    joinDateElement.className = "date-joined";
    joinDateElement.innerHTML = joinDate;

    var banButton = document.createElement("button");
    banButton.className = "btn-ban";
    banButton.setAttribute("data-toggle", "modal");
    banButton.setAttribute("data-target", "#banStudentModal");
    banButton.setAttribute("onclick", "setBanTarget("+id+", \""+name+"\")");

    var studentContainer = document.createElement("div");
    studentContainer.className = "student";
    studentContainer.appendChild(nameElement);
    studentContainer.appendChild(emailElement);
    studentContainer.appendChild(joinDateElement);
    studentContainer.appendChild(banButton);

    document.getElementsByClassName("student-list-container")[0].appendChild(studentContainer);
}

function refreshCurrentStudents(){
    var payload = '{"session" : ""}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/GetRoster.php", false);
    xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");
    
    try{
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                var data = JSON.parse(xhr.responseText);
                var error = data.error;

                clearCurrentStudents();
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

                var rawStudents = data.result;
                var idx = 0;
                while(idx < rawStudents.length){
                    var studentID = "";
                    var studentName = "";
                    var studentEmail = "";
                    var joinDate = "";

                    while(rawStudents.charAt(idx) != '|'){
                        studentID = studentID + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    while(rawStudents.charAt(idx) != '|'){
                        studentName = studentName + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    while(rawStudents.charAt(idx) != '|'){
                        studentEmail = studentEmail + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    while(idx < rawStudents.length && rawStudents.charAt(idx) != '|'){
                        joinDate = joinDate + rawStudents.charAt(idx++);
                    }

                    insertStudent(studentName, studentEmail, joinDate, studentID);
                    idx+=2;
                }

                if(idx == 0){
                    insertEmtpyItem(document.getElementsByClassName("student-list-container")[0], "No students have joined the class");
                }
            }
        }

        xhr.send(payload);
    }

    catch(error){
        console.log("refreshCurrentStudents Error: "+error);
    }
}

function clearBannedStudents(){
    var container = document.getElementsByClassName("student-list-container")[1];
    var students = container.getElementsByClassName("student");

    while(students.length > 1){
        container.removeChild(students[1]);
    }

    clearEmtpyItems(container);
}

function insertBannedStudent(name, email, joinDate, id){
    var nameElement = document.createElement("p");
    nameElement.className = "student-name";
    nameElement.innerHTML = name;

    var emailElement = document.createElement("p");
    emailElement.className = "student-email";
    emailElement.innerHTML = email;

    var joinDateElement = document.createElement("p");
    joinDateElement.className = "date-joined";
    joinDateElement.innerHTML = joinDate;

    var unbanButton = document.createElement("button");
    unbanButton.className = "btn-unban";
    unbanButton.setAttribute("data-toggle", "modal");
    unbanButton.setAttribute("data-target", "#unbanStudentModal");
    unbanButton.setAttribute("onclick", "setUnbanTarget("+id+", \""+name+"\")");
    unbanButton.innerHTML = "Unban";

    var studentContainer = document.createElement("div");
    studentContainer.className = "student";
    studentContainer.appendChild(nameElement);
    studentContainer.appendChild(emailElement);
    studentContainer.appendChild(joinDateElement);
    studentContainer.appendChild(unbanButton);

    document.getElementsByClassName("student-list-container")[1].appendChild(studentContainer);
}

function refreshBannedStudents(){
    var payload = '{"session" : ""}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/GetBanList.php", false);
    xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");
    
    try{
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                var data = JSON.parse(xhr.responseText);
                var error = data.error;

                clearBannedStudents();
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

                var rawStudents = data.result;
                var idx = 0;
                while(idx < rawStudents.length){
                    var studentID = "";
                    var studentName = "";
                    var studentEmail = "";
                    var joinDate = "";

                    while(rawStudents.charAt(idx) != '|'){
                        studentID = studentID + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    while(rawStudents.charAt(idx) != '|'){
                        studentName = studentName + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    
                    while(rawStudents.charAt(idx) != '|'){
                        studentEmail = studentEmail + rawStudents.charAt(idx++);
                    }
                    idx += 2;

                    while(idx < rawStudents.length && rawStudents.charAt(idx) != '|'){
                        joinDate = joinDate + rawStudents.charAt(idx++);
                    }
                    
                    insertBannedStudent(studentName, studentEmail, joinDate, studentID);
                    idx+=2;
                }

                if(idx == 0){
                    insertEmtpyItem(document.getElementsByClassName("student-list-container")[1], "No students have been banned");
                }
            }
        }

        xhr.send(payload);
    }

    catch(error){
        console.log("refreshBannedStudents Error: "+error);
    }
}

function banStudent(){
    if(banTarget == -1) return;

    var payload = '{"session" : "", "studentID" : "'+banTarget+'"}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/BanStudent.php", false);
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

                refreshCurrentStudents();
                refreshBannedStudents();
                setBanTarget(-1, "");
            }
        }

        xhr.send(payload);
    }

    catch(error){
        console.log("banStudent Error: "+error);
    }
}



function unbanStudent(){
    if(unbanTarget == -1) return;

    var payload = '{"session" : "", "studentID" : "'+unbanTarget+'"}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/UnbanStudent.php", false);
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

                refreshCurrentStudents();
                refreshBannedStudents();
                setUnbanTarget(-1, "");
            }
        }

        xhr.send(payload);
    }

    catch(error){
        console.log("unbanStudent Error: "+error);
    }
}

function setBanTarget(id, name){
    banTarget = id;
    document.getElementsByClassName("edit-class-form-container")[0].innerHTML = 'Are you sure you want to ban '+name+' from contributing to '+className+'? You can always unban them in the future.';
}

function setUnbanTarget(id, name){
    unbanTarget = id;
    document.getElementsByClassName("edit-class-form-container")[1].innerHTML = 'Are you sure you want to unban '+name+' from '+className+'? They will be able to fully participate in the class once again.';
}