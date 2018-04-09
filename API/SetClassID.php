<?php
	// Assumes the input is a JSON file in the format of {"session":"", "classID":""}
	// Sets the PHP session classID value to the value specified in the input JSON.
	// This allows the classID value to be used for other API endpoints, like creating sessions
	
	$inData = getRequestInfo();
	
	$session = trimAndSanitize($inData["session"]);
	$classID = trimAndSanitize($inData["classID"]);
	
	if ($session != ""){
		session_id($session);
	}
	if(!session_start()){
		returnWithError("Could not find session.");
		exit();
	}
	
	$_SESSION["classID"] = $classID;
	
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