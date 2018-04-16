<?php
	// Assumes the input is a JSON file in the format of {"session":"", "showRead":""} and classID and setID have previously been set
  // If "showRead" is non-zero, both read and unread questions will be shown.  Otherwise, only unread will be shown
	// Output is JSON in the form of {"result":"", "error":""}
	// result is a string formatted as "questionID| text| studentID| studentName| dateTime||questionID| text| studentID| studentName| dateTime||..."
	// Note that two pipes separates each question, with one pipe separating the fields inside.  This is so that : can be used in questions/dates

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
		returnWithError("Could not find session.");
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
			$sql = "Select QuestionID, Text, User, UserID, DateTime from Question where SessionID = ? and IsRead = 0";
		}
		else{
			$sql = "Select QuestionID, Text, User, UserID, DateTime from Question where SessionID = ?";
		}

		if(!$stmt->prepare($sql)){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $sessionID);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($questionID, $text, $name, $studentID, $dateTime);
      $i = 0;

			while($stmt->fetch()){
				if ($i == 0){
          $result .= $questionID . "| " . $text . "| " . $studentID . "| " . $name . "| " . $dateTime;
        }
        else{
          $result .= "||" . $questionID . "| " . $text . "| " . $studentID . "| " . $name . "| " . $dateTime;
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
