'use strict';
console.log("RMUI: Loading Constants");

angular.module('uninova.rm.2')
.constant('RM_NOTIFY', {
	NAMESPACE: '/rmui',
	EVENT: {
		HUBCONNECTIONUPDATE: 'rmui:event:connectionupdate'
	}
})