<?php
	// Assumes the input is a JSON file in the format of {"session":""}
	// Output is JSON in the form of {"result":"", "error":""}
	// result is a string formatted as "id: name: #students: #sessions|id: name: #students: #sessions|..."
	
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
	
	$professorID = $_SESSION["professorID"];
	
	if ($professorID == null){
		returnWithError("Could not find professor.");
		exit();
	}
	
	$error_occurred = false;
	$found_class = false;
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occurred = true;
		returnWithError($conn->connect_error);
	}
	else{
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("Select ClassID, Name from Class where ProfessorID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $professorID);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($id, $name);
			while($stmt->fetch()){
				$classID = $id;
				$className = $name;
				
				// Count number of students in each class
				$stmt2 = $conn->stmt_init();
				if (!$stmt2->prepare("Select StudentID from Registration where ClassID = ?")){
					returnWithError("Failed to count students");
					exit();
				}
				else{
					$numStudents = 0;
					$stmt2->bind_param("i", $classID);
					$stmt2->execute();
					$stmt2->store_result();
					$stmt2->bind_result($student);
					while ($stmt2->fetch()){
						$numStudents += 1;
					}
					$stmt2->close();
				}
				
				// Count number of sessions associated with each class
				$stmt3 = $conn->stmt_init();
				if (!$stmt3->prepare("Select SessionID from Session where ClassID = ?")){
					returnWithError("Failed to count sessions");
					exit();
				}
				else{
					$numSessions = 0;
					$stmt3->bind_param("i", $classID);
					$stmt3->execute();
					$stmt3->store_result();
					$stmt3->bind_result($sessionID);
					while ($stmt3->fetch()){
						$numSessions += 1;
					}
					$stmt3->close();
				}
				
				if (!$found_class){
					$result .= $classID . ": " . $className . ": " . $numStudents . ": " . $numSessions;
					$found_class = true;
				}
				else{
					$result .= "|" . $classID . ": " . $className . ": " . $numStudents . ": " . $numSessions;
				}
			}
			if($found_class){
				returnWithInfo($result);
			}
			else{
				returnWithError("No classes found");
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
