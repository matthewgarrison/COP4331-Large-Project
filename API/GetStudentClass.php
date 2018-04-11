<?php
	// Assumes the input is a JSON file in the format of {"session":""}
	// Output is JSON in the form of {"result":"", "error":""}
	// result is a string formatted as "id: name|id: name|..."
	
	$inData = getRequestInfo();
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	
	$id = 0;
	$name = "";
	$result = "";
	$count = 0;
	$session = trimAndSanitize($inData["session"]);
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session");
		exit();
	}
	
	$studentID = $_SESSION["studentID"];
	
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
		if(!$stmt->prepare("Select ClassID from Registration where StudentID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $studentID);
			$stmt->execute();
			$stmt->bind_result($id);
			while($stmt->fetch()){
				$found_class = true;
				$classes[$count] = $id;
				$count++;
			}
			if (!$found_class){
				returnWithError("No classes found");
			}
			$stmt->close();
		}
		if ($found_class){
			$stmt = $conn->stmt_init();
			if (!$stmt->prepare("Select Name from Class where ClassID = ?")){
				$error_occurred = true;
				returnWithError($conn->errno());
			}
			else{
				for ($i = 0; $i < $count; $i++){
					$stmt->bind_param("i", $classes[$i]);
					$stmt->execute();
					$stmt->bind_result($name);
					if ($stmt->fetch()){
						if ($i == 0){
							$result .= $classes[$i] . ": " . $name;
						}
						else{
							$result .= "|" . $classes[$i] . ": " . $name;
						}
					}
				}
				returnWithInfo($result);
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
