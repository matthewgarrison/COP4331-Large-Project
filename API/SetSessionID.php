<?php
	// Assumes the input is a JSON file in the format of {"session":"", "sessionID":""}
	// Sets the PHP session sessionID value to the value specified in the input JSON.
	// *** NOTE:  "session" is the PHP session.  "sessionID" is the class session.  ***
	// This allows the sessionID value to be used for other API endpoints, like getting questions
	
	$inData = getRequestInfo();
	
	$session = trimAndSanitize($inData["session"]);
	$sessionID = trimAndSanitize($inData["sessionID"]);
	
	if ($session != ""){
		session_id($session);
	}
	if(!session_start()){
		returnWithError("Could not find PHP session.");
		exit();
	}
	
	$_SESSION["sessionID"] = $sessionID;
	
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