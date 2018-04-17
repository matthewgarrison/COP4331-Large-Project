<?php
	// Assumes the input is a JSON file in the format of {"session":"", "text":"", "answer1":"", "answer2":"", "answer3":"", "answer4":"", "answer5":""}
	// Also assumes that ClassID and SessionID are already set as session variables
	// Creates a new poll with the specified answers
	
	$inData = getRequestInfo();
	
	date_default_timezone_set('America/New_York');
	
	$session = trimAndSanitize($inData["session"]);
	$text = trimAndSanitize($inData["text"]);
	$numAns = 0;
	
	for ($i = 1; $i <= 5; $i++){
		if (trimAndSanitize($inData["answer" . $i]) != ""){
			 $answers[$numAns + 1] = trimAndSanitize($inData["answer" . $i]);
			 $numAns++;
		}
	}
	for ($i = $numAns + 1; $i <= 5; $i++){
		$answers[$i] = "";
	}
	
	if ($numAns < 2){
		returnWithError("Polls must have at least two answers.");
		exit();
	}
	
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
	
	$sessionID = $_SESSION["sessionID"];
	
	$error_occurred = false;
	
	$date = date("F d, Y");
	
	// Connect to database
	$conn = new mysqli($servername, $dbUName, $dbPwd, $dbName);
	if ($conn->connect_error){
		$error_occured = true;
		returnWithError($conn->connect_error);
	}
	else{
		// Insert the poll
		if (!$error_occurred){
			$stmt = $conn->stmt_init();
			if (!$stmt->prepare("Insert into Poll (SessionID, QuestionText, NumAnswers, DateCreated, Answer1, Answer2, Answer3, Answer4, Answer5) values (?, ?, ?, ?, ?, ?, ?, ?, ?)")){
			 	returnWithError("Failed to prepare statement.");
			 	exit();
			}
			else{
				$stmt->bind_param("isissssss", $sessionID, $text, $numAns, $date, $answers[1], $answers[2], $answers[3], $answers[4], $answers[5]);
				if (!$stmt->execute()){
					returnWithError("Could not add to DB");
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