function initializeLMS(){
	var initSuccess = doLMSInitialize();
	console.log(initSuccess);
}

function finishLMS(){
	var finSuccess = doLMSFinish();
	console.log(finSuccess);
}