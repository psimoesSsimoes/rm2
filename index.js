'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;
var path = require('path');

var ResourceManagerModule = new AwesomeModule('uninova.rm.2', {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.logger', 'logger'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.wrapper', 'webserver-wrapper'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.pubsub', 'pubsub'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.wsserver', 'wsserver')
  ],

  states: {
    lib: function(dependencies, callback) {
      //var rmuilib = require('./backend/lib')(dependencies);
      var rmuiserver = require('./backend/webserver/rmui')(dependencies);
      //var rmnotify = require('./backend/webserver/config/rmnotification')(dependencies);

      var lib = {
        //rmnotify: rmnotify,
        api: {
          rmuiserver: rmuiserver
        },
        lib: {}
      };

      return callback(null, lib);
    },

    deploy: function(dependencies, callback) {
      //init the rmnotification handler
      //this.rmnotify.init();
      //require('./backend/webserver/ws/rmuiws').init(dependencies);

      // Register the webapp
      var app = require('./backend/webserver')(dependencies, this);
      // Register every exposed endpoints
      app.use('/api', this.api.rmuiserver);

      var webserverWrapper = dependencies('webserver-wrapper');
      // Register every exposed frontend scripts
      var jsFiles = [
        'app.js',
        'vendors/chart.js/dist/Chart.min.js',
        'vendors/angular-chart.js/dist/angular-chart.min.js',
        'rmui/constants.js',
        'rmui/controllers.js',
        'rmui/services.js',
        'rmui/directives.js'
      ];
      webserverWrapper.injectAngularModules('rmui', jsFiles, ['uninova.rm.2'], ['esn']);
      var lessFile = path.resolve(__dirname, './frontend/css/styles.less');
      webserverWrapper.injectLess('rmuiless', [lessFile], 'esn');
      webserverWrapper.addApp('rmui', app);
      
      return callback();
    },
    start: function(dependencies, callback) {
      require('./backend/ws/rmuiws').init(dependencies);
      return callback();
    }
  }
});

module.exports = ResourceManagerModule;
