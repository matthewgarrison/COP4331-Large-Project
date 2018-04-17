<?php
	// Assumes the input is a JSON file in the format of {"session":""}
	// Also assumes that sessionID has previously been set
	// Output is JSON in the form of {"active":"", "archived":"", "error":""}
	// "active" is the info on active sessions, and is a string formatted as "pollID| questionText| #answers| dateCreated| answer1...||pollID| questionText| #answers| dateCreated| answer1...||..."
	// "archived" is the info on archives sessions, and is a string formatted as "pollID| questionText| #answers| dateCreated| dateArchived| answer1...||pollID| questionText| #answers| dateCreated| dateArchived| answer1...||..."
	// result is a string formatted as "pollID| questionText| #answers| answer1...||pollID| questionText| #answers| answer1...||..."
	// It will contain answer1 through answer5.  Any unused answers will have a value of ""
	
	$inData = getRequestInfo();
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	$id = 0;
	$text = "";
	$numAnswers = 0;
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
	
	$sessionID = $_SESSION["sessionID"];
	
	if ($sessionID == null){
		returnWithError("The session has not been set.");
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
		if(!$stmt->prepare("Select PollID, QuestionText, NumAnswers, DateCreated, IsArchived, DateArchived, Answer1, Answer2, Answer3, Answer4, Answer5 from Poll where SessionID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $sessionID);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($id, $text, $numAns, $dateCreated, $archivedFlag, $dateArchived, $ans1, $ans2, $ans3, $ans4, $ans5);
			while($stmt->fetch()){
				if ($archivedFlag == 0){
					if (!$found_active){
						$active .= $id . "| " . $text . "| " . $numAns . "| " . $dateCreated . "| " . $ans1 . "| " . $ans2 . "| " . $ans3 . "| " . $ans4 . "| " . $ans5;
						$found_active = true;
					}
					else{
						$active .= "||" . $id . "| " . $text . "| " . $numAns . "| " . $dateCreated . "| " . $ans1 . "| " . $ans2 . "| " . $ans3 . "| " . $ans4 . "| " . $ans5;
					}
				}
				else{
					if (!$found_archived){
						$archived .= $id . "| " . $text . "| " . $numAns . "| " . $dateCreated . "| " . $dateArchived . "| " . $ans1 . "| " . $ans2 . "| " . $ans3 . "| " . $ans4 . "| " . $ans5;
						$found_archived = true;
					}
					else{
						$archived .= "||" . $id . "| " . $text . "| " . $numAns . "| " . $dateCreated . "| " . $dateArchived . "| " . $ans1 . "| " . $ans2 . "| " . $ans3 . "| " . $ans4 . "| " . $ans5;
					}
				}
			}
			returnWithInfo($active, $archived);
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
