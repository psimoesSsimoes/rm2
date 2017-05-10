'use strict';

var express = require('express');
// where we define out front end path
var FRONTEND_PATH = require('../constants').FRONTEND_PATH;
var NODEMODULES_PATH = require('../constants').NODEMODULES_PATH;

module.exports = function(dependencies, application) {
  //serve our frontend folder
  application.use(express.static(FRONTEND_PATH));
  
  //set the views folder at frontend/views
  application.set('views', FRONTEND_PATH + '/views');
  application.get('/views/*', function(req, res) {
    var templateName = req.params[0].replace(/\.html$/, '');
    res.render(templateName);
  });
};
