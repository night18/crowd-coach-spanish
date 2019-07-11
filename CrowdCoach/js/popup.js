/**
Author: Chun-Wei Chiang
Create Date: 2017/10/18
Class name: popup.js
Purpose: Control the popup page and detect the amazon turk ID
Modify History:
**/

// function click(e) {
//   chrome.tabs.executeScript(null,
//       {code:"document.body.style.backgroundColor='" + e.target.id + "'"});
//   window.close();
// }

function getWorkerID(){
	const dashboardUrl = "https://www.mturk.com/mturk/dashboard";

	let workerID =  "00";

	return workerID
}

function workerNameScrpit(){
	let name = "Test";
	let Row1 = $("body .div:eq(0) .div:eq(0) .div:eq(1) a[value='/account']");
	console.log(Row1);

	return name;
}

const getWorkerName = async () => {
	


	try{
		let workerName = localStorage.getItem("AMTmentor.workerName");

		// We have to convert the function to a string
		const scriptToExec = `(${workerNameScrpit})()`;

		if(!workerName || typeof workerName != "undefined"){
			name = await chrome.tabs.executeScript(null, 
				{code: scriptToExec}
			);

			workerName = name;
			localStorage.setItem("AMTmentor.workerName", workerName);
		}

		return workerName;
	
	}catch(err){
		console.log(err);
	}
	
}

document.addEventListener('DOMContentLoaded', async () => {
	let xhr = new XMLHttpRequest();
	let workerID = "";
	xhr.open("GET", "https://worker.mturk.com", true);
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4) {
			let data = xhr.responseText;
			workerID = $(".me-bar  a[href='/account']", $(data));
			// workerID = $("span:eq(0)", $(data)).text();
			console.log(data)
			console.log(workerID)
		}
	}
	xhr.send();

	// let workerID = await getWorkerID();
	// let workerName = await getWorkerName();

	// if(workerName){
	// 	$('#mturk_username').text(workerName);
	// }

	// if(workerID){
	// 	$('#mturk_userid').text(workerID);	
	// }
	

});

