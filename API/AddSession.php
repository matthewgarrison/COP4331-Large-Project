<?php
	// Assumes the input is a JSON file in the format of {"session":"", "name":""}, and the session already has classID set
	// *** IMPORTANT NOTE: the "session" field in the above JSON refers to a PHP session, NOT a class session in the database ***
	// *** If both are needed, "session" always refers to a PHP session and "sessionID" always refers to a class session ***
	
	$inData = getRequestInfo();

	date_default_timezone_set('America/New_York');
	
	$session = trimAndSanitize($inData["session"]);
	$name = trimAndSanitize($inData["name"]);
	$name = sanitizeName($name);
	$date = trimAndSanitize($inData["date"]);
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	$error_occurred = false;
	$in_use = false;
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session");
		exit();
	}
	
	$classID = $_SESSION["classID"];
	
	if ($classID == null){
		returnWithError("classID must be set before adding a session");
		exit();
	}
	
	if($name == ""){
		returnWithError("Name cannot be empty" );
		exit();
	}
	
	$date = date("F d, Y");
	
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occured = true;
		returnWithError($conn->connect_error );
	}
	else{
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("INSERT INTO Session (ClassID, Name, DateCreated, Archived) VALUES (?, ?, ?, 0)")){
			$error_occurred = true;
			returnWithError("Failed to prepare statement");
		}
		else{
			$stmt->bind_param("iss", $classID, $name, $date);
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
	
	// Makes sure the session name cannot have colons or pipes
	function sanitizeName($str){
		$str = str_replace(":", "", $str);
		$str = str_replace("|", "", $str);
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
