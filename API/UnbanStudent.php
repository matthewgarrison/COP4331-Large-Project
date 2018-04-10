<?php
	// Assumes the input is a JSON file in the format of {"session":"", "studentID":""}
	// Removes the specified student/class combo from the ban list, allowing them to register for a class they had previously been banned from
	
	$inData = getRequestInfo();
	
	$session = trimAndSanitize($inData["session"]);
	$studentID = trimAndSanitize($inData["studentID"]);
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	if ($session != ""){
		session_id($session);
	}
	if(!session_start()){
		returnWithError("Unable to start session");
		exit();
	}
	
	$classID = $_SESSION["classID"];
	
	$error_occurred = false;
	$in_use = false;
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occured = true;
		returnWithError($conn->connect_error);
	}
	else{
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("SELECT studentID FROM Student WHERE studentID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $studentID);
			$stmt->execute();
			
			$stmt->bind_result($student);
			while($stmt->fetch()){
				$in_use = true;
			}
			if (!$in_use){
				$error_occurred = true;
				returnWithError("Invalid student id");
			}
			$stmt->close();
		}
		if(!$error_occurred){
			$in_use = false;
			$stmt = $conn->stmt_init();
			if(!$stmt->prepare("SELECT ClassID FROM Class WHERE ClassID = ?")){
				$error_occurred = true;
				returnWithError($conn->errno());
			}
			else{
				$stmt->bind_param("i", $classID);
				$stmt->execute();
				
				$stmt->bind_result($class);
				while($stmt->fetch()){
					$in_use = true;
				}
				if (!$in_use){
					$error_occurred = true;
					returnWithError("The class to unban from must be specified");
				}
				$stmt->close();
			}
		}
		if (!$error_occurred){
			$stmt = $conn->stmt_init();
			if(!$stmt->prepare("DELETE FROM Ban WHERE ClassID = ? AND StudentID = ?")){
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