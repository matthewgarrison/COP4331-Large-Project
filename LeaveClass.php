<?php
	// Assumes the input is a JSON file in the format of {"session":"", "classID":""}
	// Removes student from specified class
	
	$inData = getRequestInfo();
	
	$session = trimAndSanitize($inData["session"]);
	$classID = trimAndSanitize($inData["classID"]);
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session.");
		exit();
	}
	
	$studentID = $_SESSION["studentID"];
	
	$error_occurred = false;
	$in_use = false;
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occured = true;
		returnWithError($conn->connect_error);
	}
	else{
		// Remove student from class
		if (!$error_occurred){
			$stmt = $conn->stmt_init();
			if(!$stmt->prepare("DELETE FROM Registration WHERE ClassID = ? and StudentID = ?")){
				$error_occurred = true;
				returnWithError($conn->errno());
			}
			$stmt->bind_param("ii", $classID, $studentID);
			if (!$stmt->execute()){
				$error_occurred = true;
				returnWithError("Failed to remove from class.");
			}
			$stmt->close();
		}
	}
	$conn->close();
	
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