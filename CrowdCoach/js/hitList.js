/**
Author: Chun-Wei Chiang
Create Date: 2018/06/07
Purpose: Listen user's action
Modify History:
**/

let workerName = $(".me-bar a[href='/account']").text();
let workerID = $(".me-bar .copyable-content").text();

// console.log ($("ol.hit-set-table").parent().attr("data-react-props"));

//Retrive all HIT data based on index
function getHitInfo(rowIndex){
	let props = $("ol.hit-set-table").parent().attr("data-react-props");
	let hitRowJson = JSON.parse(props).bodyData[rowIndex-1];

	return {
		 hitSetID: hitRowJson.hit_set_id,
		 requesterID: hitRowJson.requester_id,
		 requesterName: hitRowJson.requester_name,
		 hitTitle: hitRowJson.title,
		 hitDescription: hitRowJson.description,
		 hitDuration: hitRowJson.assignment_duration_in_seconds,
		 hitCount: hitRowJson.assignable_hits_count,
		 reward: hitRowJson.monetary_reward.amount_in_dollars,
		 reward_currency: hitRowJson.monetary_reward.currency_code,
		 creationTime: hitRowJson.creation_time,
		 expeiratiomTime: hitRowJson.latest_expiration_time,
		 updateTime: hitRowJson.last_updated_time,
		 requirment: hitRowJson.project_requirements
	}		
}

$("#MainContent ol li").each(function(index){ //Each row of the HIT list.
	if(index != 0){
		let dskRow = $(this).find(".desktop-row");
		let dskPreview = dskRow.find(".action-container .preview");
		// console.log(dskPreview.text());

		//click preview
		dskPreview.on("click", function(){
			console.log(getHitInfo(index));
			
		});
	}
});