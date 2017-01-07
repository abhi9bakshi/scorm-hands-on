var response;

var xmlhttp = new XMLHttpRequest();
xmlhttp.overrideMimeType("application/json");
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
       if (xmlhttp.status == 200) {
            console.log(xmlhttp.responseText);
            response = xmlhttp.responseText;
       }
       else if (xmlhttp.status == 400) {
          alert('There was an error 400');
       }
       else {
           alert('something else other than 200 was returned');
       }
    }
};

xmlhttp.open("GET", "modules2.json", true);
xmlhttp.send(null);

console.log(response);
JSON.stringify
parsed_JSON = JSON.parse('{"1": 1, "2": 2, "3": {"4": 4, "5": {"6": 6}}}');

if(parsed_JSON){
    console.log("TRUE");
}else{
    console.log("FALSE");
}
/*
function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'modules.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    console.log("This" + xobj);
    
    xobj.send(null);  
}

// Parse JSON string into object
var response;
var parsed_JSON = response;

if(parsed_JSON){
    console.log("TRUE");
}else{
    console.log("FALSE");
}
*/
    