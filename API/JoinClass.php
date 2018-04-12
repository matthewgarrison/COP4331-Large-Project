<?php
	// Assumes the input is a JSON file in the format of {"session":"", "classID":""}
	
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
	
	$studentID = $_SESSION["studentID"];
	
	$error_occurred = false;
	$in_use = false;
	$date = date("F d, Y");
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occured = true;
		returnWithError($conn->connect_error);
	}
	else{
		$stmt = $conn->stmt_init();
		// Check that the student exists
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
		
		//Check that the class exists
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
					returnWithError("Invalid class id");
				}
				$stmt->close();
			}
		}
		
		//Check that the student is not banned from the class
		if (!$error_occurred){
			$banned = false;
			$stmt = $conn->stmt_init();
			if(!$stmt->prepare("SELECT BanID FROM Ban WHERE ClassID = ? and StudentID = ?")){
				$error_occurred = true;
				returnWithError($conn->errno());
			}
			else{
				$stmt->bind_param("ii", $classID, $studentID);
				$stmt->execute();
				
				$stmt->bind_result($ban);
				while($stmt->fetch()){
					$banned = true;
				}
				if ($banned){
					$error_occurred = true;
					returnWithError("You have been banned from joining this class.  See your professor for details.");
				}
				$stmt->close();
			}
		}
		
		// Check that the student is not already in the class
		if (!$error_occurred){
			$already_registered = false;
			$stmt = $conn->stmt_init();
			if(!$stmt->prepare("SELECT RegID FROM Registration WHERE ClassID = ? and StudentID = ?")){
				$error_occurred = true;
				returnWithError($conn->errno());
			}
			else{
				$stmt->bind_param("ii", $classID, $studentID);
				$stmt->execute();
				
				$stmt->bind_result($ban);
				while($stmt->fetch()){
					$already_registered = true;
				}
				if ($already_registered){
					$error_occurred = true;
					returnWithError("You are already in this class.");
				}
				$stmt->close();
			}
		}
		if (!$error_occurred){
			$stmt = $conn->stmt_init();
			if(!$stmt->prepare("INSERT INTO Registration (StudentID, ClassID, DateJoined) VALUES (?, ?, ?)")){
				$error_occurred = true;
				returnWithError($conn->errno());
			}
			$stmt->bind_param("iis", $studentID, $classID, $date);
			if (!$stmt->execute()){
				$error_occurred = true;
				returnWithError("Failed to register for class.");
			}
		}
		$conn->close();
	}
	
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
