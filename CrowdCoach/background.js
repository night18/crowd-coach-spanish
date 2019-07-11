/**
Author: Chun-Wei Chiang
Create Date: 2017/10/12
Class name: Background.js
Purpose: 
Modify History:
**/

var lastTabId = 0;

const reg_domain = new RegExp("https:\/\/worker.mturk.com\/projects\/\w+\/",'i');

chrome.runtime.onInstalled.addListener(function(){
	//Replace all the rule
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		//new rule
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions:[
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							hostEquals: 'worker.mturk.com'
						}
					})
				],
				actions:[ new chrome.declarativeContent.ShowPageAction() ]
			}
		]);
	});
});

// //Fires when the active tab in a window changes
// chrome.tabs.onActivated.addListener(function(activeInfo){
// 	//activeInfo contains tabId(Integer) and windowId(Integer)
	
// 	lastTabId = activeInfo.tabId;
// 	chrome.pageAction.show(lastTabId);


// 	// chrome.browserAction.setIcon({
// 	// 	path: "img/inactive.png"
// 	// });
// });

//handle the message and handle the data which cannot be access through webpage
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse){
		console.log("chrome.runtime.onMessage",request);

		if(request.getWorkerInfo){
			console.log("received get worker infomation request", request);
			let workerName = $(".me-bar a[href='/account']").text();
			let workerID = $(".me-bar .copyable-content").text();

			return true;
		}else if (request.method == "getHitSetID"){
			// getHitSetID(request).then(function(hitsetid){
			// 	console.log(hitsetid);
			// 	sendResponse({ hitSetID : hitsetid });	
			// });
			console.log("received get hit id request", request);
			chrome.tabs.query({ currentWindow: true, active: true }, function(tabs){
				console.log(tabs);
				let url = tabs[0].url;
				let hitsetid = url.split("/")[4];
				console.log(hitsetid);
				sendResponse({ hitSetID : hitsetid });	
			});

			return true; //Asynchronously response
		}

	}
);

// //Fired when a tab is updated.
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
// 	//see https://developer.chrome.com/extensions/tabs#event-onUpdated
// 	lastTabId = tabId;
// 	chrome.pageAction.show(lastTabId);
// 	//To check whether the user is in Mturk
// 	if(changeInfo.url){
// 		if (reg_domain.test(changeInfo.url)){
// 		chrome.pageAction.setIcon({
// 			path: "img/active.png",
// 			tabId: lastTabId
// 		});

// 		chrome.pageAction.setPopup({
// 			tabId: lastTabId,
// 			// popup: "html/login.html"
// 		});


		
// 		}
// 	} 
	
// })


// chrome.runtime.onMessage.addListener(function(msg, sender){
// 	if((msg.from === "content") && (msg.subject === "active")){	
// 		chrome.browserAction.setIcon({
// 			path: "img/active.png"
// 		});
// 	}
// })