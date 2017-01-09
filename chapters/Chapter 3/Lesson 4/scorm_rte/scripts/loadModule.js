function moduleClass(id, title, url){
	this.id = id;
	this.title = title;
	this.url = url;
}

var mKey = [];

var request = new XMLHttpRequest();
request.open("GET", "modules.xml", false);
request.send();
var xml = request.responseXML;
var modules = xml.getElementsByTagName("module");

for(var i = 0; i < modules.length; i++) {
    var module = modules[i];
    var id = module.getElementsByTagName("id");
    var title = module.getElementsByTagName("title");
    var url = module.getElementsByTagName("url");
    mKey.push(new moduleClass(id[0].childNodes[0].nodeValue,title[0].childNodes[0].nodeValue,url[0].childNodes[0].nodeValue));    
}
