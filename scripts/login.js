var baseURL = "http://cop4331-2.com/API";

// Login error responses
var badLogin = "Incorrect username or password";

function login(){

	var email = document.getElementsByName("email")[0].value;
	var password = md5(document.getElementsByName("password")[0].value);

	var payload = '{"email" : "' + email + '", "password" : "' + password + '"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/ProfLogin.php", false);
	xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");

	try {
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				var data = JSON.parse(xhr.responseText);
				var error = data.error;

				if(error != '') {
					printError(error);
					return;
				}

				document.getElementsByName("email")[0].value = "";
				document.getElementsByName("password")[0].value = "";
				window.location.href = "http://cop4331-2.com/myClasses.html";
			}
		}

		xhr.send(payload);
	}
	catch(error) {
		printError(error.message);
	}
	return false;
}

function printError(error){
	if(error == "Could not find account"){
		document.getElementsByName("response")[0].innerHTML = badLogin;
	}
	else{
		document.getElementsByName("response")[0].innerHTML = error;
	}
}