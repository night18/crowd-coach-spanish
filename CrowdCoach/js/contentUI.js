/**
Author: Chun-Wei Chiang
Create Date: 2018/06/07
Purpose: User interface of the website
Modify History:
**/

let tips;
let tipsIndex = 0;

/*========== add tips ==========*/
let hintProvider = document.createElement("div");
hintProvider.id = "hintProvider";
hintProvider.className = "hidden";

let shareLabel = document.createElement("p");
shareLabel.className = "label_text";
shareLabel.innerHTML = "Comparte tus consejos para los demás.";

let hintPvdContent = document.createElement("textarea");
hintPvdContent.id = "hintPvdContent";
hintPvdContent.placeholder = "Maximo 100 caracteres";

let typeLabel = document.createElement("p");
typeLabel.className = "label_text";
typeLabel.innerHTML = "Por clasificar clasifique el HIT";


let typeSelector = document.createElement("select");
typeSelector.id = "typeSelector";

let audioOption = document.createElement("option");
audioOption.value = "audio";
audioOption.innerHTML = "Transcripción de audio";
typeSelector.append(audioOption);

let writeOption = document.createElement("option");
writeOption.value = "write";
writeOption.innerHTML = "Escritura";
typeSelector.append(writeOption);

let surveyOption = document.createElement("option");
surveyOption.value = "survey";
surveyOption.innerHTML = "Encuesta";
typeSelector.append(surveyOption);

let imgTransOption = document.createElement("option");
imgTransOption.value = "imgtrans";
imgTransOption.innerHTML = "Transcripción de imágenes.";
typeSelector.append(imgTransOption);

let dataOption = document.createElement("option");
dataOption.value = "data";
dataOption.innerHTML = "Recopilación de datos";
typeSelector.append(dataOption);

let imgTagOption = document.createElement("option");
imgTagOption.value = "imgtag";
imgTagOption.innerHTML = "Etiquetando imagenes";
typeSelector.append(imgTagOption);

let categorizeOption = document.createElement("option");
categorizeOption.value = "categorize";
categorizeOption.innerHTML = "Clasificar por categorías";
typeSelector.append(categorizeOption);

let otherOption = document.createElement("option");
otherOption.value = "others";
otherOption.innerHTML = "Otras";
typeSelector.append(otherOption);

let sendButton = document.createElement("button");
sendButton.addEventListener("click", sendListener);
sendButton.id = "sendButton";
sendButton.type = "button";
sendButton.innerHTML = "enviar";


hintProvider.append(shareLabel);
hintProvider.append(hintPvdContent);
hintProvider.append(typeLabel);
hintProvider.append(typeSelector);
hintProvider.append(sendButton);

$("body").append(hintProvider);

/*========== add button ==========*/
let addButton = document.createElement("button");
//let addURL = chrome.runtime.getURL("img/plus.svg");
addButton.className = "add_button";
addButton.type = "button";
addButton.innerHTML = "Proporcionar consejo";
//addButton.src = addURL;
$(".work-pipeline-action").prepend(addButton);

let addButtonParent = document.querySelectorAll(".add_button");
for(let i = 0; i < addButtonParent.length; i++){
	addButtonParent[i].addEventListener("click", function(e){
	$("#hintProvider").toggleClass("hidden");
	$("#hintProvider").toggleClass("show");
	});
}
// addButton.addEventListener("click", function(e){
// 	$("#hintProvider").toggleClass("hidden");
// 	$("#hintProvider").toggleClass("show");
// });

// $("body").append(addButton);



/*========== hint displayer ==========*/
$(".text-muted div:eq(0)").removeClass("col-xs-7");
$(".text-muted div:eq(0)").addClass("col-xs-3");
$(".text-muted div:eq(1)").removeClass("col-xs-5");
$(".text-muted div:eq(1)").addClass("col-xs-3");

let hintDisplayer = document.createElement("div");
hintDisplayer.className = "col-xs-6";
hintDisplayer.id = "hintDisplayer";

let hintContainer = document.createElement("div");
hintContainer.className = "textContent";

// let hintTitle = document.createElement("div");
// hintTitle.innerHTML = "Hint:";
// hintContainer.append(hintTitle);

/*========== hint content ==========*/
let hintContent = document.createElement("div");
hintContent.id = "hintContent";
hintContent.innerHTML = "Cargando consejos de compañeros";
hintContainer.append(hintContent);

/*========== feedback ==========*/
let feedbackContainer = document.createElement("div");

/*========== like button ==========*/
let likeButton = document.createElement("img");
let likeURL = chrome.runtime.getURL("img/like.svg");
likeButton.className = "feedbackButton gray";
likeButton.id = "likeButton";
likeButton.src = likeURL;
likeButton.addEventListener("click", function(e){
	//Todo: only feedback once
	let xhrLikePost = $.post(serverURL, {
		method: "upvoteTip",
		feedbacker_id: workerID,
		tip_id: tips[tipsIndex]._id,
		create_timestamp: new Date().toUTCString()
	}).done(function(response){
		switch (JSON.parse(response).score){
			case 0:
				$("#likeButton").addClass("gray");
				$("#dislikeButton").addClass("gray");
				break;
			case 1:
				$("#likeButton").removeClass("gray");
				$("#dislikeButton").addClass("gray");
				break;
			case -1:
				$("#likeButton").addClass("gray");
				$("#dislikeButton").removeClass("gray");
				break;
		}
		sweetAlert("Good job!", "Thanks for your feedback!", "success");
		xhrLikePost.abort();
	});
});

feedbackContainer.append(likeButton);

/*========== dislike button ==========*/
let dislikeButton = document.createElement("img");
let dislikeURL = chrome.runtime.getURL("img/dislike.svg");
dislikeButton.className = "feedbackButton gray";
dislikeButton.id = "dislikeButton";
dislikeButton.src = dislikeURL;
dislikeButton.addEventListener("click", function(e){
	//Todo: only feedback once
	let xhrDislikePost = $.post(serverURL, {
		method: "downvoteTip",
		feedbacker_id: workerID,
		tip_id: tips[tipsIndex]._id,
		create_timestamp: new Date().toUTCString()
	}).done(function(response){
		switch (JSON.parse(response).score){
			case 0:
				$("#likeButton").addClass("gray");
				$("#dislikeButton").addClass("gray");
				break;
			case 1:
				$("#likeButton").removeClass("gray");
				$("#dislikeButton").addClass("gray");
				break;
			case -1:
				$("#likeButton").addClass("gray");
				$("#dislikeButton").removeClass("gray");
				break;
		}
		sweetAlert("Good job!", "Thanks for your feedback!", "success");
		xhrDislikePost.abort();
	});
});
feedbackContainer.append(dislikeButton);

hintContainer.append(feedbackContainer);


/*========== left arrow button ==========*/
let preHintButton = document.createElement("img");
let preURL = chrome.runtime.getURL("img/left_arrow.svg");
preHintButton.className = "hintSelectorButton";
preHintButton.src = preURL;
preHintButton.addEventListener("click", function(e){
	//Todo: record the view times
	tipsIndex = tipsIndex==0? tips.length - 1: tipsIndex - 1;
	$("#hintContent").text(tips[tipsIndex].tip);
	getFeedback(tips[tipsIndex]._id);
});


/*========== right arrow button ==========*/
let nextHintButton = document.createElement("img");
let nextURL = chrome.runtime.getURL("img/right_arrow.svg");
nextHintButton.className = "hintSelectorButton";
nextHintButton.src = nextURL;
nextHintButton.addEventListener("click", function(e){
	//Todo: record the view times
	tipsIndex = tipsIndex== tips.length - 1? 0 : tipsIndex + 1;
	$("#hintContent").text(tips[tipsIndex].tip);
	getFeedback(tips[tipsIndex]._id);
});

hintDisplayer.append(preHintButton);
hintDisplayer.append(hintContainer);
hintDisplayer.append(nextHintButton);

$(".text-muted div:eq(1)").before(hintDisplayer);

