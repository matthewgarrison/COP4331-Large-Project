<?php
	// Assumes the input is a JSON file in the format of {"session":""}
	// *** NOTE: "session" refers to a PHP session, and "sessionID" refers to a class session ***
	// It's unfortunate that we have to deal with two things called sessions, but ¯\_(ツ)_/¯
	// Output is JSON in the form of {"result":"", "error":""}
	// result is a string formatted as "id: name: date|id: name: date|..."
	
	$inData = getRequestInfo();
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	$id = 0;
	$name = "";
	$date = "";
	$result = "";
	$session = trimAndSanitize($inData["session"]);
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session");
		exit();
	}
	
	$classID = $_SESSION["classID"];
	
	if ($classID == null){
		returnWithError("The class has not been set.");
		exit();
	}
	
	$error_occurred = false;
	$found_session = false;
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occurred = true;
		returnWithError($conn->connect_error);
	}
	else{
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("Select SessionID, Name, Date from Session where ClassID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $classID);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($id, $name, $date);
			while($stmt->fetch()){
				
				if (!$found_session){
					$result .= $id . ": " . $name . ": " . $date;
					$found_session = true;
				}
				else{
					$result .= "|" . $id . ": " . $name . ": " . $date;
				}
			}
			if($found_session){
				returnWithInfo($result);
			}
			else{
				returnWithError("No sessions found");
			}
			$stmt->close();
		}
		
		$conn->close();
	}
	
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
	
	// Send the user's username and ID as JSON
	function sendAsJSON($obj){
		header('Content-type: application/json');
		echo $obj;
	}
	
	// Return in the case of an error
	function returnWithError( $err )
	{
		$retValue = '{"result":"","error":"' . $err . '"}';
		sendAsJson( $retValue );
	}
	
	// Return and send the user's name and id
	function returnWithInfo( $result )
	{
		$retValue = '{"result":"' . $result . '","error":""}';
		sendAsJson( $retValue );
	}
?>
