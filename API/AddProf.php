<?php
	// Assumes the input is a JSON file in the format of {"email":"", "name":"", "password":""}
	
	$inData = getRequestInfo();
	
	$email = trimAndSanitize($inData["email"]);
	$name = trimAndSanitize($inData["name"]);
	$password = trimAndSanitize($inData["password"]);
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	$error_occurred = false;
	$in_use = false;
	
	if($email == "" || $name == "" || $password == ""){
		returnWithError("All fields must be filled out");
		exit();
	}
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occured = true;
		returnWithError($conn->connect_error);
	}
	else{
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("SELECT professorID FROM Professor WHERE Email = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("s", $email);
			$stmt->execute();
			
			$stmt->bind_result($id);
			while($stmt->fetch()){
				$in_use = true;
				$error_occurred = true;
				returnWithError("That email is already in use by a Queue&A account");
			}
			$stmt->close();
			if (!$in_use){
				$stmt = $conn->prepare("insert into Professor (Email, Name, Password) VALUES (?, ?, ?)");
				$stmt->bind_param("sss", $email, $name, $password);
				if(!$stmt->execute())
				{
					$error_occurred = true;
					returnWithError( $conn->errno );
				}
				$stmt->close();
			}
		}
		$conn->close();
	}
	
	if (!$error_occurred){
		returnWithError("");
	}
	
	// Removes whitespace at the front and back, and removes single quotes and semi-colons
	function trimAndSanitize($str){
		$str = trim($str);
		$str = str_replace("'", "", $str );
		$str = str_replace(";", "", $str);
		return $str;
	}
	
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}
	
	function sendAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendAsJson( $retValue );
	}
?>