Router.route("/", {where: "server"})
	.post(function() {
		// console.log(this.request.body); //{ content: 'test1', hitType: 'audio' }
		
		let requestBody = this.request.body;
		if(typeof requestBody.method != "undefined"){
			switch(requestBody.method){
				case "provideTip":
					Meteor.call("provideTip", requestBody, (err,result) => {
						if(!err){
							this.response.end("success");
						}
					} );
					//Todo: error controller
					break;
				case "getTip":
					Meteor.call("getTip", requestBody, (err, result) => {
						this.response.end(result);
					});
					break; 
				case "upvoteTip":
					Meteor.call("upvoteTip", requestBody, (err,result) => {
						if(!err){
							this.response.end(result);
						}
					} );
					break;
				case "downvoteTip":
					Meteor.call("downvoteTip", requestBody, (err,result) => {
						if(!err){
							this.response.end(result);
						}
					} );
					break;
				case "getFeedback":
					Meteor.call("getFeedback", requestBody, (err, result) => {
						if(!err){
							this.response.end(result);
						}
					});
					break;
			}
		}
		
	});