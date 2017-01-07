var counter = 0;


window.onload = function() {
  loadModules();
};

function loadModules(){
  //Set iFrame Source
  console.log(mKey[counter].url);
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
    loadModules();
  }
}

function next(){
  if(counter<mKey.length-1)
  {
    counter++;
    loadModules();
  }
}

function exit(){
  alert("Bye!");
}