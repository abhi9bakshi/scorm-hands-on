function initializeLMS(){
	var initSuccess = doLMSInitialize();
	doLMSSetValue("cmi.core.score.min", "0");
    doLMSSetValue("cmi.core.score.max", "100");
	console.log(initSuccess);
}

function finishLMS(score, page){
	doLMSSetValue("cmi.core.score.raw", score);
	doLMSSetValue("cmi.core.lesson_location", page);
	var finSuccess = doLMSFinish();
	console.log(finSuccess);
}