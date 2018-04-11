<?php
	// Assumes the input is a JSON file in the format of {"session":""}
	// Deletes all session variables associated with the session
	
	
	$inData = getRequestInfo();
	
	$session = trimAndSanitize($inData["session"]);
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session");
		exit();
	}
	
	unset($_SESSION["professorID"]);
	unset($_SESSION["studentID"]);
	unset($_SESSION["name"]);
	unset($_SESSION["classID"]);
	unset($_SESSION["sessionID"]);
	
	returnWithError("");
	
	
	// Removes whitespace at the front and back, and removes single quotes and semi-colons
	function trimAndSanitize($str){
		$str = trim($str);
		$str = str_replace("'", "", $str );
		$str = str_replace(";", "", $str);
		return $str;
	}
	
	// Parse JSON file input
	function getRequestInfo(){
		return json_decode(file_get_contents('php://input'), true);
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendAsJSON( $retValue );
	}
	
	// Send the user's username and ID as JSON
	function sendAsJSON($obj){
		header('Content-type: application/json');
		echo $obj;
	}
?>
