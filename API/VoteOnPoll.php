<?php
	// Assumes the input is a JSON file in the format of {"session":"", "pollID":"", "answer":""}
	// "answer" in the above JSON should be an integer between 1 and the number of answers in the poll, inclusive
	// Also assumes that studentID is already set as a session variable
	// Removes any previous votes made by the student and casts one for the specified answer
	
	$inData = getRequestInfo();
	
	$session = trimAndSanitize($inData["session"]);
	$pollID = trimAndSanitize($inData["pollID"]);
	$answer = trimAndSanitize($inData["answer"]);
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session.");
		exit();
	}
	
	$studentID = $_SESSION["studentID"];

	if ($studentID == ""){
		returnWithError("Must be logged in as a student to vote on a poll.");
		exit();
	}
	
	$error_occurred = false;
	$numAns = 0;
	
	$date = date("F d, Y");
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occured = true;
		returnWithError($conn->connect_error);
	}
	else{
		// Get information about the poll being voted on
		if (!$error_occurred){
			$stmt = $conn->stmt_init();
			if (!$stmt->prepare("Select IsArchived, NumAnswers from Poll where PollID = ?")){
			 	returnWithError("Failed to prepare statement.");
			 	exit();
			}
			else{
				$stmt->bind_param("i", $pollID);
				$stmt->execute();
				$stmt->store_result();
				$stmt->bind_result($archived, $numAns);
				$stmt->fetch();
				// Check if the poll has been archived
				if ($archived != 0){
					returnWithError("Archived polls cannot be voted on.");
					exit();
				}
				if ($answer < 1 or $answer > $numAns){
					returnWithError("Only valid answers can be voted on.");
					exit();
				}
			}
			$stmt->close();
			
			// Delete the old vote, if one exists
			$stmt = $conn->stmt_init();
			if (!$stmt->prepare("Delete from Vote where PollID = ? and StudentID = ?")){
				returnWithError("Could not prepare statement.");
				exit();
			}
			else{
				$stmt->bind_param("ii", $pollID, $studentID);
				if (!$stmt->execute()){
					returnWithError("Could not delete old vote.");
					exit();
				}
			}
			$stmt->close();
			
			// Insert the new vote
			$stmt = $conn->stmt_init();
			if (!$stmt->prepare("Insert into Vote (PollID, StudentID, Answer) values (?, ?, ?)")){
				returnWithError("Could not prepare statement.");
				exit();
			}
			else{
				$stmt->bind_param("iii", $pollID, $studentID, $answer);
				if (!$stmt->execute()){
					returnWithError("Could not insert vote to DB");
					exit();
				}
			}
			$stmt->close();
		}
	}
	$conn->close();
	
	if (!$error_occurred){
		returnWithError("");
	}
	
	// Removes whitespace at the front and back, and removes single quotes, pipes, and semi-colons
	function trimAndSanitize($str){
		$str = trim($str);
		$str = str_replace("'", "", $str );
		$str = str_replace(";", "", $str);
		$str = str_replace("|", "", $str);
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
