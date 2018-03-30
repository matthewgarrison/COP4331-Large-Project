var baseURL = "http://cop4331-2.com/API"
var userID = 0;

$(document).ready(function() {
	$('#form-password-confirm').keydown(function (event) {
	    var keypressed = event.keyCode || event.which;
	    if (keypressed == 13) {
	        addUser();
	    }
	});
});

function addProfessor() {
	var userName = document.getElementById("form-username").value;

	var password = document.getElementById("form-password").value;
	var passwordConfirm = document.getElementById("form-password-confirm").value;
	if (password !== passwordConfirm) {
		document.getElementById('passwordCompareAndCreateResult').innerHTML = "Your passwords do not match. Please try again.";
		return;
	}

	password = md5(password);

	document.getElementById("passwordCompareAndCreateResult").innerHTML = "";

	// replace with appropriate varaible names
	var payload = '{"username" : "' + userName + '", "password" : "' + password + '"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/AddUser.php", false);
	xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");

	try {
		xhr.send(payload);

		var data = JSON.parse(xhr.responseText);
		var error = data.error;

		if(error !== "") {
			document.getElementById('passwordCompareAndCreateResult').innerHTML = error;
			return;
		}

		// return the to login page
		window.location.href = "http://cop4331-2.com/";
	}
	catch(error) {
		// include result of creation in HTML
		document.getElementById('passwordCompareAndCreateResult').innerHTML = error.message;
	}
}