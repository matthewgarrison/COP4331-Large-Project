<?php
	// Assumes the input is a JSON file in the format of {"session":""}
	// *** NOTE: "session" refers to a PHP session, and "sessionID" refers to a class session ***
	// It's unfortunate that we have to deal with two things called sessions, but ¯\_(ツ)_/¯
	// Output is JSON in the form of {"active":"", "archived":"", "error":""}
	// "active" is the info on active sessions, and is a string formatted as "id: name: dateCreated|id: name: dateCreated|..."
	// "archived" is the info on archives sessions, and is a string formatted as "id: name: dateCreated: dateArchived|id: name: dateCreated: dateArchived|..."
	
	$inData = getRequestInfo();
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	$id = 0;
	$name = "";
	$dateCreated = "";
	$dateArchived = "";
	$active = "";
	$archived = "";
	$archivedFlag = 0;
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
	$found_active = false;
	$found_archived = false;
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occurred = true;
		returnWithError($conn->connect_error);
	}
	else{
		$stmt = $conn->stmt_init();
		if(!$stmt->prepare("Select SessionID, Name, DateCreated, Archived, DateArchived from Session where ClassID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $classID);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($id, $name, $dateCreated, $archivedFlag, $dateArchived);
			while($stmt->fetch()){
				if ($archivedFlag == 0){
					if (!$found_active){
						$active .= $id . ": " . $name . ": " . $dateCreated;
						$found_active = true;
					}
					else{
						$active .= "|" . $id . ": " . $name . ": " . $dateCreated;
					}
				}
				else{
					if (!$found_archived){
						$archived .= $id . ": " . $name . ": " . $dateCreated . ": " . $dateArchived;
						$found_archived = true;
					}
					else{
						$archived .= "|" . $id . ": " . $name . ": " . $dateCreated . ": " . $dateArchived;
					}
				}
			}
			if($found_active or $found_archived){
				returnWithInfo($active, $archived);
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
		$retValue = '{"active":"", "archived":"", "error":"' . $err . '"}';
		sendAsJson( $retValue );
	}
	
	// Return and send the user's name and id
	function returnWithInfo( $active, $archived )
	{
		$retValue = '{"active":"' . $active . '", "archived":"' . $archived . '", "error":""}';
		sendAsJson( $retValue );
	}
?>
