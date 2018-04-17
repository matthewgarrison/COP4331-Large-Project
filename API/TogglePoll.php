<?php
	// Assumes the input is a JSON file in the format of {"session":"", "pollID":""}
	// Toggles whether or not the given poll is archived.
	
	$inData = getRequestInfo();

	date_default_timezone_set('America/New_York');
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	// Connect to database
	$session = trimAndSanitize($inData["session"]);
	$pollID = trimAndSanitize($inData["pollID"]);
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session");
		exit();
	}
	
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occurred = true;
		returnWithError($conn->connect_error);
	}
	else{
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("Select IsArchived from Poll where PollID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $pollID);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($old_value);
			$stmt->fetch();
			$stmt->close();
		}
		if(!$error_occurred){
			if ($old_value == 0){
				$new_value = 1;
				$date = date("F d, Y");
			}
			else{
				$new_value = 0;
				$date = "";
			}
			$stmt = $conn->stmt_init();
		    if(!$stmt->prepare("Update Poll set IsArchived = ?, DateArchived = ? where PollID = ?")){
				$error_occurred = true;
				returnWithError($conn->errno());
			}
		    else{
				$stmt->bind_param("isi", $new_value, $date, $pollID);
				$stmt->execute();
				$stmt->close();
			}
		}
	}
    if (!$error_occurred){
		returnWithError("");
    }
	
	// Removes whitespace at the front and back, and removes single quotes and semi-colons
	function trimAndSanitize($str){
		$str = trim($str);
		$str = str_replace("'", "", $str);
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
