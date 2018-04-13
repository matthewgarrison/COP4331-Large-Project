<?php
	// Assumes the input is a JSON file in the format of {"session":"", "classID":""}
	// Removes the specified class and all associated sessions, questions, join records, and bans
	
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
		// Delete student registrations
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("DELETE FROM Registration WHERE ClassID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		$stmt->bind_param("i", $classID);
		if (!$stmt->execute()){
			$error_occurred = true;
			returnWithError("Failed to remove registrations.");
		}
		$stmt->close();
		
		// Delete student bans
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("DELETE FROM Ban WHERE ClassID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		$stmt->bind_param("i", $classID);
		if (!$stmt->execute()){
			$error_occurred = true;
			returnWithError("Failed to remove bans.");
		}
		$stmt->close();
		
		// Delete sessions associated stuff
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("SELECT SessionID FROM Session WHERE ClassID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		$stmt->bind_param("i", $classID);
		if (!$stmt->execute()){
			$error_occurred = true;
			returnWithError("Failed to remove sessions.");
		}
		else{
			$stmt->store_result();
			$stmt->bind_result($sessID);
			while ($stmt->fetch()){
				// Delete associated questions
				if (!$error_occurred){
					$stmt2 = $conn->stmt_init();
					if(!$stmt2->prepare("DELETE FROM Question WHERE SessionID = ?")){
						$error_occurred = true;
						returnWithError($conn->errno());
					}
					$stmt2->bind_param("i", $sessID);
					if (!$stmt2->execute()){
						$error_occurred = true;
						returnWithError("Failed to remove questions.");
					}
					$stmt2->close();
				}
				// Delete the session itself
				if (!$error_occurred){
					$stmt2 = $conn->stmt_init();
					if(!$stmt2->prepare("DELETE FROM Session WHERE SessionID = ?")){
						$error_occurred = true;
						returnWithError($conn->errno());
					}
					$stmt2->bind_param("i", $sessID);
					if (!$stmt2->execute()){
						$error_occurred = true;
						returnWithError("Failed to remove sessions.");
					}
					$stmt2->close();
				}
			}
		}
		$stmt->close();
		
		// Delete the class itself
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("DELETE FROM Class WHERE ClassID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		$stmt->bind_param("i", $classID);
		if (!$stmt->execute()){
			$error_occurred = true;
			returnWithError("Failed to remove class.");
		}
		$stmt->close();
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
