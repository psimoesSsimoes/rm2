'use strict';

var logger, core;
var http = require('http-message');
var context = require('../../../../../../context');

function getCompanies(req, res) {
        logger.info('rmuicontroller:getCompanies');
        var rm_req = JSON.stringify({ reqAction: 'getCompanies', params: {}});
        rmChannelRequest(rm_req, res);
}
function getCompany(req, res) {
        logger.info('rmuicontroller:getCompany');
        var rm_req= JSON.stringify({ reqAction: 'getCompany', params: {companyId: parseInt(req.params.companyid, 10)}});
        rmChannelRequest(rm_req, res);
}
function getHub(req, res) {
        logger.info('rmuicontroller:getHub' + JSON.stringify(req.params));
        var rm_req = JSON.stringify({ reqAction: 'getHub', params: {hubId: parseInt(req.params.hubid, 10)}});
        rmChannelRequest(rm_req, res);
}
function getHubs(req, res) {
        logger.info('rmuicontroller:getHubs');
        var rm_req = JSON.stringify({ reqAction: 'getHubs', params: {companyId: parseInt(req.params.companyid, 10)}});

        //request RM backend open4sla component
        rmChannelRequest(rm_req, res);
}
function getHub(req, res) {
        logger.info('rmuicontroller:getHub');
        var rm_req = JSON.stringify({ reqAction: 'getHub', params: {hubId: parseInt(req.params.hubid, 10)}});

        //request RM backend open4sla component
        rmChannelRequest(rm_req, res);
}
function getResources(req, res) {
        logger.info('rmuicontroller:getResources');
        var rm_req = JSON.stringify({ reqAction: 'getResources', params: {hubId: parseInt(req.params.hubid, 10)}});
        rmChannelRequest(rm_req, res);
}
function getHubProperties(req, res) {
        logger.info('rmuicontroller:getHubProperties');
        var rm_req = JSON.stringify({ reqAction: 'getHubProperties', params: {hubId: parseInt(req.params.hubid, 10)}});

        rmChannelRequest(rm_req, res);
}
function getHubTypes(req, res) {
        logger.info('rmuicontroller:getHubTypes');
        var rm_req = JSON.stringify({
                reqAction: 'getHubTypes',
                params: {}
        })
        rmChannelRequest(rm_req, res);
}
function getResourceTypes(req, res) {
        logger.info('rmuicontroller:getResourceTypes');
        var rm_req = JSON.stringify({
                reqAction: 'getResourceTypes',
                params: {
                        attachable: req.params.attachable.replace("%20", "")
                }
        })
        rmChannelRequest(rm_req, res);
}
function getHubSubTypes(req, res) {
        logger.info('rmuicontroller:getHubSubTypes');
        var rm_req = JSON.stringify({
                reqAction: 'getHubSubTypes',
                params: {
                        hubType: req.params.hubtype
                }
        })
        rmChannelRequest(rm_req, res);
}
function setProperty(req, res) {
        logger.info('rmuicontroller:setProperty with (' + req.body.resourceId + "," + req.body.propertyName + "," + req.body.propertyValue + ")");
        var rm_req = JSON.stringify({
                reqAction: 'setProperty',
                params: {
                        resourceId: parseInt(req.body.resourceId, 10),
                        propertyName: req.body.propertyName,
                        propertyValue: req.body.propertyValue
                }
        })

        rmChannelRequest(rm_req, res);
}
function addProperty(req, res) {
        logger.info('rmuicontroller:addProperty with (' + req.body.resourceId + "," + req.body.propertyName + "," + req.body.propertyType + "," + req.body.propertyValue + ")");
        var rm_req = JSON.stringify({
                reqAction: 'addProperty',
                params: {
                        resourceId: parseInt(req.body.resourceId, 10),
                        propertyName: req.body.propertyName,
                        propertyType: req.body.propertyType,
                        propertyValue: req.body.propertyValue
                }
        })
        rmChannelRequest(rm_req, res);
}
function delProperty(req, res) {
        logger.info('rmuicontroller:delProperty');
        var rm_req= JSON.stringify({
                reqAction: 'delProperty',
                params: {
                        resourceId: parseInt(req.body.resourceId, 10),
                        propertyName: req.body.propertyName
                }
        })
        rmChannelRequest(rm_req, res);
}
function addHub(req, res) {
        logger.info('rmuicontroller:addHub');
        var rm_req=JSON.stringify({
                reqAction: 'addHub',
                params: {
                        companyId : parseInt(req.body.companyId, 10),
                        hubName: req.body.hubName,
                        hubType: req.body.hubType
                }
        })
        rmChannelRequest(rm_req, res);
}
function delHub(req, res) {
        logger.info('rmuicontroller:delHub');
        var rm_req=JSON.stringify({
                reqAction: 'delHub',
                params: {
                        hubId: parseInt(req.body.hubId, 10)
                }
        })
        rmChannelRequest(rm_req, res);
}
function addResource(req, res) {
        logger.info('rmuicontroller:addResource');
        var rm_req=JSON.stringify({
                reqAction: 'addResource',
                params: {
                        hubId: parseInt(req.body.hubId, 10),
                        resourceName: req.body.resourceName,
                        resourceType: req.body.resourceType
                }
        })
        rmChannelRequest(rm_req, res);
}
function delResource(req, res) {
        logger.info('rmuicontroller:delResource');
        var rm_req = JSON.stringify({
                reqAction: 'delResource',
                params: {
                        resourceId: parseInt(req.body.resourceId, 10)
                }
        })
        rmChannelRequest(rm_req, res);
}
function getResource(req, res) {
        logger.info('rmuicontroller:getResource');
        var rm_req = JSON.stringify({ reqAction: 'getResource', params: {resourceId: parseInt(req.params.resourceid, 10)}});
        rmChannelRequest(rm_req, res);
}
function getResourceProperties(req, res) {
        logger.info('rmuicontroller:getResourceProperties');
        var rm_req = JSON.stringify({ reqAction: 'getResourceProperties', params: {resourceId: parseInt(req.params.resourceid, 10)}});
        rmChannelRequest(rm_req, res);
}
function getConfig(req, res) {
        logger.info('rmuicontroller:getConfig for hub id (' + req.params.hubid + ')')
        var rm_req = JSON.stringify({ reqAction: 'getConfig', params: {hubId: parseInt(req.params.hubid, 10)}})
        rmChannelRequest(rm_req, res);
}
function sendConfig(req, res) {
        logger.info('rmuicontroller:sendConfig ')
        var rm_req = JSON.stringify({ reqAction: 'sendConfig', params: {config: req.body.config}})
        rmChannelRequest(rm_req, res);
}
function getExternal(req, res) {
        var rm_req = JSON.stringify({ reqAction: 'requestExternal', params: {hubId: parseInt(req.params.hubid), resourceId: parseInt(req.params.resourceid)}})
        rmChannelRequest(rm_req, res);
}
function datacollectorCreate(req, res) {
        var rm_req = JSON.stringify({ reqAction: 'datacollectorCreate', params: {resourceId: parseInt(req.body.resourceid), dataCollectorName: req.body.datacollectorname, type: req.body.datacollectortype, schema: req.body.datacollectorschema}})
        rmChannelRequest(rm_req, res);
}
function rmChannelRequest(request,res) {
        logger.info('rmuicontroller:rmChannelRequest');
        var inputRequest = JSON.parse(request);
        var rmcall = context.rmChannel.sendRequest(request)
                .then (function(response){
                        //handle the RM response
                        var result = JSON.parse(response[0][1]);
                        logger.info('rmuicontroller:rmChannelRequest for (' + JSON.stringify(inputRequest.reqAction)+ ') received answer:' + JSON.stringify(result, null, 2));
                        res.writeHead(200, {
                                'Content-type': 'application/json'
                                });
                        res.write(JSON.stringify(result));
                        return res.end();
                })
                .fail (function(err){
                        logger.info('rmuicontroller:rmChannelRequest for (' + JSON.stringify(inputRequest.reqAction)+ ') error answer:' + err);
                        res.writeHead(500);
                        return res.end();
                })
}
module.exports = function(dependencies) {
        logger = dependencies('logger');
        return {
                getCompanies: getCompanies,
                getCompany: getCompany,		
                getHubs: getHubs,
                getHub: getHub,
                getResources: getResources,
                getHubProperties: getHubProperties,
                setProperty: setProperty,
                addProperty: addProperty,
                delProperty: delProperty,
                getHubTypes: getHubTypes,
                getHubSubTypes: getHubSubTypes,
                addHub: addHub,
                delHub: delHub,
                getResourceTypes: getResourceTypes,
                addResource: addResource,
                delResource: delResource,
                getResource: getResource,
                getResourceProperties: getResourceProperties,
                getConfig: getConfig,
                sendConfig: sendConfig,
                getExternal: getExternal,
                datacollectorCreate: datacollectorCreate
	}
}
