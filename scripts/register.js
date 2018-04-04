var baseURL = "http://cop4331-2.com/API"
var userID = 0;

function addProfessor() {
	var name = document.getElementById("form-name").value;
	var email = document.getElementById("form-email").value;

	var password = document.getElementById("form-password").value;
	var passwordConfirm = document.getElementById("form-password-confirm").value;
	if (password !== passwordConfirm) {
		document.getElementsByName("response")[0].innerHTML = "Your passwords do not match. Please try again.";
		return;
	}

	password = md5(password);
	// replace with appropriate varaible names
	var payload = '{"name" : "' + name + '", "email" : "' + email + '", "password" : "' + password + '"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/AddProf.php", false);
	xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");

	try {
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				var data = JSON.parse(xhr.responseText);
				var error = data.error;
		
				if(error !== "") {
					document.getElementsByName("response")[0].innerHTML = error;
					return;
				}
		
				// return the to login page
				window.location.href = "http://cop4331-2.com/";
			}
		}

		xhr.send(payload);
	}
	catch(error) {
		// include result of creation in HTML
		document.getElementsByName("response")[0].innerHTML = error.message;
	}
}