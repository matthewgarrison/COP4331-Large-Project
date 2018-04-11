<?php
	// Assumes the input is a JSON file in the format of {"session":"", "showRead":""} and classID and setID have previously been set
  // If "showRead" is non-zero, both read and unread questions will be shown.  Otherwise, only unread will be shown
	// Output is JSON in the form of {"result":"", "error":""}
	// result is a string formatted as "questionID: text: studentID: studentName|questionID: text: studentID: studentName|..."

	$inData = getRequestInfo();

	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";

	$result = "";
	$session = trimAndSanitize($inData["session"]);
	$showRead = trimAndSanitize($inData["showRead"]);

	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session");
		exit();
	}

	$sessionID = $_SESSION["sessionID"];
  	$professorID = $_SESSION["professorID"];

	if ($sessionID == null){
		returnWithError("Could not find professor.");
		exit();
	}
  	if ($professorID == null){
		returnWithError("Only professors can view questions");
		exit();
  	}

	$error_occurred = false;

	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);

	if ($conn->connect_error){
		$error_occurred = true;
		returnWithError($conn->connect_error);
	}
	else{
		$stmt = $conn->stmt_init();

		if($showRead == 0){
			$sql = "Select QuestionID, Text, User, UserID from Question where SessionID = ? and IsRead = 0";
		}
		else{
			$sql = "Select QuestionID, Text, User, UserID from Question where SessionID = ?";
		}

		if(!$stmt->prepare($sql)){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $sessionID);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($questionID, $text, $studentID, $name);
      $i = 0;

			while($stmt->fetch()){
				if ($i == 0){
          $result .= $questionID . ": " . $text . ": " . $studentID . ": " . $name;
        }
        else{
          $result .= "|" . $questionID . ": " . $text . ": " . $studentID . ": " . $name;
        }
        $i++;
			}

      returnWithInfo($result);
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
