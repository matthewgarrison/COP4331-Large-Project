<?php
	// Assumes the input is a JSON file in the format of {"professorID":""}
	// Output is JSON in the form of {"result":"", "error":""}
	// result is a string formatted as "id: name: #students|id: name: #students|..."
	
	$inData = getRequestInfo();
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	$id = 0;
	$name = "";
	$result = "";
	$professorID = trimAndSanitize($inData["professorID"]);
	
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
				
				
				if (!$found_class){
					$result .= $classID . ": " . $className . ": " . $numStudents;
					$found_class = true;
				}
				else{
					$result .= "|" . $classID . ": " . $className . ": " . $numStudents;
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
