<?php
	// Assumes the input is a JSON file in the format of {"session":"", "sessionID":""}
	// Removes the specified session and all associated questions
	
	$inData = getRequestInfo();
	
	$session = trimAndSanitize($inData["session"]);
	$sessionID = trimAndSanitize($inData["sessionID"]);
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session");
		exit();
	}
	
	$professorID = $_SESSION["professorID"];
	
	if ($professorID == ""){
		returnWithError("Only professors can delete classes.");
		exit();
	}
	
	$error_occurred = false;
	$in_use = false;
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occured = true;
		returnWithError($conn->connect_error);
	}
	else{
		// Delete associated questions
		if (!$error_occurred){
			$stmt = $conn->stmt_init();
			if(!$stmt->prepare("DELETE FROM Question WHERE SessionID = ?")){
				$error_occurred = true;
				returnWithError($conn->errno());
			}
			$stmt->bind_param("i", $sessionID);
			if (!$stmt->execute()){
				$error_occurred = true;
				returnWithError("Failed to remove questions.");
			}
			$stmt->close();
		}
		// Delete the session itself
		if (!$error_occurred){
			$stmt = $conn->stmt_init();
			if(!$stmt->prepare("DELETE FROM Session WHERE SessionID = ?")){
				$error_occurred = true;
				returnWithError($conn->errno());
			}
			$stmt->bind_param("i", $sessionID);
			if (!$stmt->execute()){
				$error_occurred = true;
				returnWithError("Failed to remove session.");
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
