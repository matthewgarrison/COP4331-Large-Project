<?php
	//  Returns a list of students who have joined a class
	//  Expects input in the form of {"session":""}, where session refers to a PHP session, and assumes the class has already been set
	//  Outputs in the form of {"result":"", "error":""}
	//  "result" is a string in the form of "id| name| email| dateJoined||id | name| email| dateJoined"
	//  Note that each student is separated by two pipes, and each field within separated by a pipe and a space
	
	$inData = getRequestInfo();
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	$id = 0;
	$name = "";
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
		returnWithError("The class must be set prior to getting the roster");
		exit();
	}
	
	$error_occurred = false;
	$found_student = false;
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occurred = true;
		returnWithError($conn->connect_error);
	}
	else{
		$stmt = $conn->stmt_init();
		// Find the students' IDs and dates they joined the class
		if(!$stmt->prepare("Select StudentID, DateJoined from Registration where ClassID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $classID);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($id, $date);
			while($stmt->fetch()){
				// Get each student's name and email
				$stmt2 = $conn->stmt_init();
				if (!$stmt2->prepare("Select Name, Email from Student where StudentID = ?")){
					returnWithError("Failed to find students");
					exit();
				}
				else{
					$stmt2->bind_param("i", $id);
					$stmt2->execute();
					$stmt2->store_result();
					$stmt2->bind_result($name, $email);
					while ($stmt2->fetch()){
						if (!$found_student){
							$result .= $id . "| " . $name . "| " . $email . "| " . $date;
							$found_student = true;
						}
						else{
							$result .= "||" . $id . "| " . $name . "| " . $email . "| " . $date;
						}
					}
					$stmt2->close();
				}
			}
			if($found_student){
				returnWithInfo($result);
			}
			else{
				returnWithError("No students found");
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
