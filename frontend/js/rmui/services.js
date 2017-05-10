'use strict';


// injectamos o modulo d3 na factory de d3

angular.module('d3', [])
  .factory('d3Service', ['$document', '$q', '$rootScope',
    function($document, $q, $rootScope) {
      var d = $q.defer();
      function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() { d.resolve(window.d3); });
      }
      // Create a script tag with d3 as the source
      // and call our onScriptLoad callback when it
      // has been loaded
      var scriptTag = $document[0].createElement('script');
      scriptTag.type = 'text/javascript'; 
      scriptTag.async = true;
      scriptTag.src = 'http://d3js.org/d3.v3.min.js';
      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
      }
      scriptTag.onload = onScriptLoad;
 
      var s = $document[0].getElementsByTagName('body')[0];
      s.appendChild(scriptTag);
 
      return {
        d3: function() { return d.promise; }
      };
}]);








console.log("RMUI: Loading Services");


angular.module('uninova.rm.2')
.factory('rmuiNotificationService', function($rootScope, RM_NOTIFY, livenotification){
    var sio = null;
    var is_listen = false;
    
    function connectionupdate(data){
        console.log("emitter here... " + JSON.stringify(data));
        $rootScope.$broadcast(RM_NOTIFY.EVENT.HUBCONNECTIONUPDATE, data);
    }

    function startListen(){
        if(is_listen){ return; }
        
        if(sio == null){
            sio = livenotification(RM_NOTIFY.NAMESPACE);
            console.log("RM_NOTIFICATION: Start listening rmui service ...")
        }
        console.log("RM_NOTIFICATION: Defining the events function ...");
        //define the listeners
        sio.on(RM_NOTIFY.EVENT.HUBCONNECTIONUPDATE,connectionupdate);
        
        is_listen = true;
    }

    return {
        startListen: startListen
    }
})

.factory('testService', function($http){
	return {
		getHub: function(hubid) {
			return $http.get('/rmui/api/gethub/' + hubid)
		}
	}
})
//Service to handle company info
.factory('companyService', function($http, $stateParams) {
    return {
        getCompany: function() {
            return $http.get('/rmui/api/getcompany/' + $stateParams.companyid)
        },
        getCompanyById: function(comID) {
            return $http.get('/rmui/api/getcompany/' + comID)
        },
        getCompanies: function() {
            return $http.get('/rmui/api/getcompanies')
        }
    }
})
//Service to handle hub info
.factory('hubService', function($http, $stateParams) {
    return {
            getHub: function(hubid) {
                    return $http.get('/rmui/api/gethub/' + hubid)
            },
            getHubs: function() {
                    return $http.get('/rmui/api/gethubs/' + $stateParams.companyid)
            },
            getHubsByCompaneyID: function(comID) {
                    return $http.get('/rmui/api/gethubs/' + comID)
            },
            addHub: function(companyid, hubname, hubtype) {
                    var postData = {companyId: companyid, hubName: hubname, hubType: hubtype}
                    return $http.post('/rmui/api/addhub', postData)
            },
            delHub: function(hubid) {
                    var postData = {hubId: hubid}
                    return $http.post('/rmui/api/delhub', postData)
            },
            getHubProperties: function(hubid) {
                    return $http.get('/rmui/api/gethubproperties/' + hubid)
            },
            getHubTypes: function() {
                    return $http.get('/rmui/api/gethubtypes')
            },
            getConfig: function() {
                    return $http.get('/rmui/api/getconfig/' + $stateParams.hubid)
            },
            sendConfig: function(config) {
                    var postData = {config: config}
                    return $http.post('/rmui/api/sendconfig', postData)
            }
    }
})
//Service to handle resource info
.factory('resourceService', function($http, $stateParams) {
    return {
        getResource: function() {
            return $http.get('/rmui/api/getresource/' + $stateParams.resourceid)
        },
        getResources: function(hubid) {
            return $http.get('/rmui/api/getresources/' + hubid)
        },
        addResource: function(hubid, resourcename, resourcetype) {
            var postData = {hubId: hubid, resourceName: resourcename, resourceType: resourcetype}
            return $http.post('/rmui/api/addresource', postData)
        },
        delResource: function(resourceid) {
            var postData = {resourceId: resourceid}
            return $http.post('/rmui/api/delresource', postData)
        },
        getResourceTypes: function(conceptAttachable) {
            conceptAttachable = conceptAttachable.replace(" ", "%20");
            return $http.get('/rmui/api/getresourcetypes/' + conceptAttachable)
        },
        getProperties: function(resourceid) {
            return $http.get('/rmui/api/getresourceproperties/' + resourceid)
        }
    }
})
//Service to handle common properties info
.factory('propertiesService', function($http, $stateParams) {
    return {
        editProperty: function(resourceid, propertyname, propertyvalue) {
            var postData = {resourceId: resourceid, propertyName: propertyname, propertyValue: propertyvalue };
            return $http.post('/rmui/api/setproperty', postData)
        },
        addProperty: function(resourceid, propertyname, propertytype, propertyvalue) {
            var postData = {
                    resourceId: resourceid,
                    propertyName: propertyname,
                    propertyType: propertytype,
                    propertyValue: propertyvalue
            }
            return $http.post('/rmui/api/addproperty', postData)
        },
        delProperty: function(resourceid, propertyname) {
            var postData = {
                    resourceId: resourceid,
                    propertyName: propertyname
            }
            return $http.post('/rmui/api/delproperty', postData)
        },
        getExternal: function(hubid, resourceid) {
            return $http.get('/rmui/api/getexternalproperty/' + hubid + "/" + resourceid)
        }
    }
})
.factory('dataCollectorService', function($http, $stateParams) {
        return {
                create: function(resourceid, datacollectorname, datacollectortype, datacollectorschema){
                        var postData = {resourceid: resourceid, datacollectorname: datacollectorname, datacollectortype: datacollectortype, datacollectorschema: datacollectorschema}
                        return $http.post('/rm/api/createdatacollector', postData)
                }
        }
})

.factory('confirmationService', function ($q, $modal) {
    var _create = function (title, message) {
        var defer = $q.defer();

        console.log("SOMETHING HERE");
        var modalInstance = $modal({
            templateUrl: '/rmui/views/partials/confirmation_tpl.html',
            controller: function ($scope) {
                $scope.confirmation_title = title;
                $scope.confirmation_body = message;
                $scope.confirmation_ok = function(){
                    //modalInstance.close();
                    defer.resolve();
                };
                $scope.confirmation_cancel = function() {
                    //$modalInstance.dismiss();
                    defer.reject();
                };
            },
            show: false
        });

        modalInstance.show();

        return defer.promise;
    }
    return {
        create: _create
    }
})

