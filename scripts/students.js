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

function refreshPage(){

}

function clearCurrentStudents(){
    var container = document.getElementsByClassName("student-list-container")[0];
    var students = container.getElementsByClassName("student");

    while(students.length > 0){
        container.removeChild(students[0]);
    }
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

    var studentContainer = document.createElement("div");
    studentContainer.className = "student";
    studentContainer.appendChild(nameElement);
    studentContainer.appendChild(emailElement);
    studentContainer.appendChild(joinDateElement);
    studentContainer.appendChild(banButton);

    document.getElementsByClassName("student-list-container")[0].appendChild(studentContainer);
}

function refreshCurrentStudents(){
    
}

function clearBannedStudents(){
    var container = document.getElementsByClassName("student-list-container")[1];
    var students = container.getElementsByClassName("student");

    while(students.length > 0){
        container.removeChild(students[0]);
    }
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

}