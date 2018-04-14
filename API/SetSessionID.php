<?php
	// Assumes the input is a JSON file in the format of {"session":"", "sessionID":"", "sessionName":""}
	// Sets the PHP session sessionID value to the value specified in the input JSON.
	// *** NOTE:  "session" is the PHP session.  "sessionID" is the class session.  ***
	// This allows the sessionID value to be used for other API endpoints, like getting questions
	// sessionName is optional, but allows it to be returned by GetInfo.php
	
	$inData = getRequestInfo();
	
	$session = trimAndSanitize($inData["session"]);
	$sessionID = trimAndSanitize($inData["sessionID"]);
	$sessionName = trimAndSanitize($inData["sessionName"]);
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session");
		exit();
	}
	
	$_SESSION["sessionID"] = $sessionID;
	$_SESSION["sessionName"] = $sessionName;

	returnWithError("");
	
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
