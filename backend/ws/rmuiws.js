'use strict';
var NAMESPACE = '/rmui';
var is_init = false;
var rmuiNAMESPACE;
var q = require('q');

function init(dependencies) {
	var logger = dependencies('logger');
	var io = dependencies('wsserver').io;
	var context = require('../../../../context');

	if (is_init) {
		logger.warn("The RMUI_NOTIFICATION service is already Initialized");
		return;
	}
	
	function _channelhandler(req_msg){
		//req_msg is JSON {type: <>, data: <>}
		logger.info("RMUI_NOTIFICATION: _channelhandler receive msg from RM saying: " + req_msg);
		var rmrequestPromise = q.defer();
		var req_msg_json = JSON.parse(req_msg);
		logger.info("RMUI_NOTIFICATION: req_msg_json.notification: " + req_msg_json.notification);
		
		if (req_msg_json.notification == "hubconnectionupdate"){
			var msg = {
				companyid: req_msg_json.companyid,
				hubid: req_msg_json.hubid,
				timestamp: "something",
				status: req_msg_json.status
			};
			//logger.info("RMUI_NOTIFICATION publishing to rmui:events:hub:status the message: " + JSON.stringify(msg));
			//pubsub.local.topic('rmui:events:hub:status').publish(msg);
			

			//for each scoket emit the msg
			//var rmuiclientsockets = rmuiNAMESPACE.scokets;
			
			logger.info("RMUI_NOTIFICATION: emitting using just namespace...");
			rmuiNAMESPACE.emit('rmui:event:connectionupdate', msg);

			//rmuiNAMESPACE.scokets.forEach(function(socket){
			//	logger.info("RMUI_NOTIFICATION: Emitting on (rmui:event:connected) the msg (" + JSON.stringify(msg) + ")");
			//	socket.emit('rmui:event:connected', msg);
			//})
			
		}
		//reply with ACK
		
		rmrequestPromise.resolve([['RMUI-ACK']]);

		return rmrequestPromise
	}

	context.rmNotifyChannel.handleRequest = _channelhandler;

	rmuiNAMESPACE = io.of(NAMESPACE);
	rmuiNAMESPACE.on('connection', function(socket){
		logger.info("New connection on " + NAMESPACE);
		
		socket.on('subscribe', function(hisid){
			logger.info('User', hisid, ': new connection on', NAMESPACE);
			socket.join(hisid);
		});

		socket.on('unsubscribe', function(hisid){
			logger.info('User', hisid, ': closed connection on', NAMESPACE);
			socket.leave(hisid);

		})

	})

	is_init = true;
}

module.exports.init = init;