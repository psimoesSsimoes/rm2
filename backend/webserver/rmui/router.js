'use strict';

var express = require('express');
var bodyParser = require('body-parser');

module.exports = function(dependencies) {

	//rmui controller
	var rmuicontroller = require('./controllers/rmuicontroller')(dependencies);

	var router = express.Router();
	
	// backend routes /rmui/api + <-following->
	// get routes
	router.get('/getcompanies', rmuicontroller.getCompanies);
	router.get('/getcompany/:companyid', rmuicontroller.getCompany);
	router.get('/gethubs/:companyid', rmuicontroller.getHubs);
	router.get('/gethub/:hubid', rmuicontroller.getHub);
	router.get('/getresources/:hubid', rmuicontroller.getResources);
	router.get('/getresource/:resourceid', rmuicontroller.getResource);
	router.get('/gethubproperties/:hubid', rmuicontroller.getHubProperties);
	router.get('/gethubtypes', rmuicontroller.getHubTypes);
	router.get('/getresourcetypes/:attachable', rmuicontroller.getResourceTypes);
	router.get('/gethubsubtypes/:hubtype', rmuicontroller.getHubSubTypes);
	router.get('/getresourceproperties/:resourceid', rmuicontroller.getResourceProperties);
	router.get('/getconfig/:hubid', rmuicontroller.getConfig);
	router.get('/getexternalproperty/:hubid/:resourceid', rmuicontroller.getExternal);

	//post routes
	router.post('/setproperty', rmuicontroller.setProperty);
	router.post('/addproperty', rmuicontroller.addProperty);
	router.post('/delproperty', rmuicontroller.delProperty);
	router.post('/addhub', rmuicontroller.addHub);
	router.post('/delhub', rmuicontroller.delHub);
	router.post('/addresource', rmuicontroller.addResource);
	router.post('/delresource', rmuicontroller.delResource);
	router.post('/sendconfig', rmuicontroller.sendConfig);
	router.post('/createdatacollector', rmuicontroller.datacollectorCreate)
	
	return router;
};
