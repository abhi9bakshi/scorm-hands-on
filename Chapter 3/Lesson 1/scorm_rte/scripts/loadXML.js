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

    for(var j = 0; j < id.length; j++) {
        mKey.push(new moduleClass(id[j].childNodes[0].nodeValue,title[j].childNodes[0].nodeValue,url[j].childNodes[0].nodeValue));
    }
}

console.log(mKey[0].title);