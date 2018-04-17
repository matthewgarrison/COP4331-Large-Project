<?php
	// Assumes the input is a JSON file in the format of {"session":"", "pollID":""}
	// Tallies the votes for the specified poll
	// Output is JSON in the form of {"error":"", "ans1":"", "ans2":"", "ans3":"", "ans4":"", "ans5":""}
	
	$inData = getRequestInfo();
	
	// Server info for connection
	$servername = "localhost";
	$dbUName = "Group7User";
	$dbPwd = "Group7Pass";
	$dbName = "queueNA";
	
	$session = trimAndSanitize($inData["session"]);
	$pollID = trimAndSanitize($inData["pollID"]);
	
	for ($i = 1; $i <= 5; $i++){
		$votes[$i] = 0;
	}
	
	if ($session != ""){
		session_id($session);
	}
	if (!session_start()){
		returnWithError("Unable to access session");
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
		if(!$stmt->prepare("Select Answer from Vote where PollID = ?")){
			$error_occurred = true;
			returnWithError($conn->errno());
		}
		else{
			$stmt->bind_param("i", $pollID);
			$stmt->execute();
			$stmt->bind_result($ans);
			while($stmt->fetch()){
				$votes[$ans] += 1;
			}
			$stmt->close();
		}
		returnWithInfo($votes);
		
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
		$retValue = '{"error":"' . $err . '"}';
		sendAsJson( $retValue );
	}
	
	// Return and send the user's name and id
	function returnWithInfo( $votes )
	{
		$retValue = '{"error":"",';
		$retValue .= '"ans1":"' . $votes[1] . '",';
		$retValue .= '"ans2":"' . $votes[2] . '",';
		$retValue .= '"ans3":"' . $votes[3] . '",';
		$retValue .= '"ans4":"' . $votes[4] . '",';
		$retValue .= '"ans5":"' . $votes[5] . '"';
		$retValue .= '}';
		sendAsJson( $retValue );
	}
?>
