
function decToHex(value){

    var hex = "";
    var place = 16;
    var placeBelow = 1;
    while(value !== 0){
        hex = hexChar((value%place)/placeBelow) + hex;
        value -= value%place;
        placeBelow = place;
        place *= 16;
    }

    return hex;
}

function hexToDec(value){

    var dec = 0;
    var mult = 1;
    for(var i=value.length-1; i>=0; i--){
        dec += hexVal(value.charAt(i))*mult;
        mult *= 16;
    }

    return dec;
}

function hexChar(value){
    if(value < 10) return value;
    if(value == 10) return "A";
    if(value == 11) return "B";
    if(value == 12) return "C";
    if(value == 13) return "D";
    if(value == 14) return "E";
    if(value == 15) return "F";
}

function hexVal(value){
    if(value == "A") return 10;
    if(value == "B") return 11;
    if(value == "C") return 12;
    if(value == "D") return 13;
    if(value == "E") return 14;
    if(value == "F") return 15;
    return value;
}

function logout(){
    var payload = '{"session" : ""}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", baseURL + "/Logout.php", false);
    xhr.setRequestHeader("Content-type", "application/json; charset = UTF-8");
    
    try{
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                var data = JSON.parse(xhr.responseText);
                var error = data.error;

                if(error != '') {

                    if(error == invalidSessionError){
                        console.log("INVALID SESSION");
                        window.location.href = "http://cop4331-2.com/Login.html";
                    }

                    else{
                        console.log("API ERROR: "+error);
                        // window.location.href = "http://cop4331-2.com/Login.html";
                    } 
                    return;
                }

                window.location.href = "http://cop4331-2.com/Login.html";
            }
        }

        xhr.send(payload);
    }

    catch(error){
        console.log("Logout Error: "+error);
    }
}


