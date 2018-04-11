<?php
	// Assumes the input is a JSON file in the format of {"session":""}
	// Outputs as {"error":"", "professorID":"", "studentID":"", "name":"", "classID":"", "sessionID":""}
	// Some of the above may be null
	
	
	$inData = getRequestInfo();
	
	$session = trimAndSanitize($inData["session"]);
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session");
		exit();
	}
	
	$result = '{"error":""';
	$result .= ', "professorID":"' . $_SESSION["professorID"] . '"';
	$result .= ', "studentID":"' . $_SESSION["studentID"] . '"';
	$result .= ', "name":"' . $_SESSION["name"] . '"';
	$result .= ', "classID":"' . $_SESSION["classID"] . '"';
	$result .= ', "sessionID":"' . $_SESSION["sessionID"] . '"';
	$result .= '}';
	
	sendAsJSON($result);
	
	
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
		$retValue = '{"error":"' . $err . '", "professorID":"", "studentID":"", "name":"", "classID":"", "sessionID":""}';
		sendAsJSON( $retValue );
	}
	
	// Send the user's username and ID as JSON
	function sendAsJSON($obj){
		header('Content-type: application/json');
		echo $obj;
	}
?>
