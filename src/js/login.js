var baseURL = "http://cop4331-2.com/API";

function login(){

    var userID;
    var username;

	var email = document.getElementsByName("email").value;
	var password = md5(document.getElementsByName("password").value);

	var payload = '{"username" : "' + email + '", "password" : "' + password + '"}';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseURL + "/ProfLogin.php", false);
	xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");

	try {
		xhr.send(payload);

		var data = JSON.parse(xhr.responseText);
        userID = data.id;
        username = data.name;
        var error = data.error;

		if(error != '') {
            // Process errors!!
            return;
        }
        
        console.log("UserID: " + userID + " username: " + username + " error: " + error);

		document.getElementsByName("email").value = "";
		document.getElementsByName("password").value = "";

		// implement when more features complete
	}
	catch(error) {
	}
}