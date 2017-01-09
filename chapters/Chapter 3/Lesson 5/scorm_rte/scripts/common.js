var counter = 0;
var visited;

window.onload = function() {
  getBookmark();
  loadModules();
  initializeLMS();
  visited = new Array(mKey.length);
  visited[counter] = true;
};

window.onunload = function() {
  var score = getScore();
  finishLMS(score, counter);
}

function getBookmark(){
  var bookmark = doLMSGetValue("cmi.core.lesson_location");
  if (bookmark == ""){
      counter = 0;
  }
  else{
      if (confirm("Would you like to resume from where you previously left off?")){
          counter = parseInt(bookmark, 10);
      }
      else{
          counter = 0;
      }
  }
}

function getScore(){
var visitedCount = 0;
  for(var i=0; i<visited.length; i++){
    if(visited[i] == true){
      visitedCount++;
    }
  }

  var score = (visitedCount / mKey.length) * 100;
  return score;
}

function loadModules(){
  //Set iFrame Source
  document.getElementById('moduleViewer').src = "../" + mKey[counter].url;

  //Set title
  document.title = mKey[counter].title;

  //Set Module Name
  document.getElementById("module_name").innerHTML = mKey[counter].title;
}

function previous(){
  if(counter>0)
  {
    counter--;
    visited[counter] = true;
    loadModules();
  }
}

function next(){
  if(counter<mKey.length-1)
  {
    counter++;
    visited[counter] = true;
    loadModules();
  }
}

function exit(){
  var score = getScore();
  finishLMS(score, counter);
  alert("Bye!");
}