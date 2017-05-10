'use strict';

var express = require('express');

module.exports = function(dependencies) {

	console.log("RMUI: Preparing backend express server...");
	var application = express();
	require('./config/views')(dependencies, application);
	application.disable('view cache');
	return application;
};
