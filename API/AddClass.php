<?php
	// Assumes the input is a JSON file in the format of {"professorID":"", "name":""}
	
	$inData = getRequestInfo();
	
	$professorID = trimAndSanitize($inData["professorID"]);
	$name = trimAndSanitize($inData["name"]);
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	$error_occurred = false;
	$in_use = false;
	
	if($name == ""){
		returnWithError("Name cannot be empty" );
		exit();
	}
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occured = true;
		returnWithError($conn->connect_error );
	}
	else{
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("INSERT INTO Class (Name, ProfessorID) VALUES (?, ?)")){
			$error_occurred = true;
			returnWithError("Failed to prepare statement");
		}
		else{
			$stmt->bind_param("si", $name, $professorID);
			if(!$stmt->execute()){
				$error_occurred = true;
				returnWithError( "Error adding to database" );
			}
			$stmt->close();
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
	
	function returnWithError( $err)
	{
		$retValue = '{"error":"' . $err . '"}';
		sendAsJson( $retValue );
	}
?>