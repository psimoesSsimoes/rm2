'use strict';
console.log("RMUI: Loading controller.js");

angular.module('uninova.rm.2')
.controller('testController', function($scope, $stateParams, testService) {
	console.log("RMUI: testController");
	$scope.company = "a minha empresa";
	testService.getHub(2).then(function(message) {
                $scope.hubinfo = { id: 2, name: message.data.data[0].resourceName };
        });
})
.controller('companiesController',function($scope, companyService){
	console.log("RMUI: CompaniesController: Requesting getCompanies...");
    companyService.getCompanies().then(function(message) {
      $scope.companiesList = message.data.data;
    });

})

.controller('dashboardController', function($scope, $stateParams, companyService, hubService,resourceService, rmuiNotificationService){
    
    rmuiNotificationService.startListen();

    $scope.hubtypes = [];
    $scope.companiesList = [];
    $scope.seriesBubble =[];
    $scope.dataBubble = [];
    var compID = 122;
    companyService.getCompanies().then(function(message) {
                $scope.companiesList = message.data.data;
                compID = $scope.companiesList[0].resourceId;
 
                //insert selected company in scope
                companyService.getCompanyById(compID).then(function(message){
                        $scope.companyinfo = { id: compID, name: message.data.data[0].resourceName };
                });

                getAllHubsByCompanyIDForBubbleChart(compID);
        });

    var typeExists = function(thisTypeName){
        var returned = false;
        //var returned = false;
        $scope.hubtypes.forEach(function(eachType){
            if(eachType.typeName == thisTypeName){
                console.log("already exists...");
                returned = true;
            }
        })
        return returned;
    }

    var appendNewHub = function(typename, hubPropsList){
        //check if this type (parent Name already exists in the scope hubtypes list)
        if (!(typeExists(typename))){
            console.log("the " + typename + " dont exists!");
            //since this type does not exists, 
            //lets check if the hub is connected
            hubPropsList.forEach(function(eachProp){
                if (eachProp.resourcePropertyName == "status" && eachProp.value == "connected") {
                    $scope.hubtypes.push({typeName: typename, counter: 1, connected: 1});
                }
                if (eachProp.resourcePropertyName == "status" && eachProp.value == "disconnected") {
                    $scope.hubtypes.push({typeName: typename, counter: 1, connected: 0});
                }
            })
        }else{
            console.log("the " + typename + " already exists!");
            $scope.hubtypes.forEach(function(eachType){
                if(eachType.typeName == typename){
                    console.log("Found the type: " + typename + " with " + JSON.stringify(eachType));
                    //increment this type counted hub
                    eachType.counter++;
                    //increment the type connected values
                    hubPropsList.forEach(function(eachProp){
                        if (eachProp.resourcePropertyName == "status" && eachProp.value == "connected") {
                            eachType.connected++;
                        }
                    })
                }
            })
        }
    }

    

    var hubPropertiesIsDone = function(){
        hubService.getHubTypes().then(function(getHubTypesres){
            $scope.hubsList.forEach(function(eachHub){
                $scope.hubtypesStructure = getHubTypesres.data.data;
                angular.forEach(getHubTypesres.data.data, function(eachType){
                    if(eachHub.conceptName == eachType.conceptName){
                        appendNewHub(eachType.parentName, eachHub.properties);
                    }
                })
            })
        })
    }
        
        var getAllHubsByCompanyIDForBubbleChart = function(compID) {
                $scope.seriesBubbleTmp = [];
                $scope.dataBubbleTmp = [];
                //get hubs list for the company context
                hubService.getHubsByCompaneyID(compID).then(function(message){
                        $scope.hubsList = message.data.data;
                        //fill the hubs properties
                        $scope.hubsList.forEach(function(eachObj){
                                $scope.seriesBubbleTmp.push(eachObj.resourceName);
                                resourceService.getResources(eachObj.resourceId).then(function(message) {
                                        $scope.resourcesList = message.data.data;
                                        $scope.dataBubbleTmp.push([{x: 10, y: $scope.resourcesList.length,r: 20}]);
                                        });
                        })
                        $scope.seriesBubble = $scope.seriesBubbleTmp;
                        $scope.dataBubble = $scope.dataBubbleTmp;
                })
        }

    //know how many hubs this company has defined
    hubService.getHubs().then(function(message){
        $scope.hubsList = message.data.data;
        //fill the hubs properties
        var propsDone = 0;
        $scope.hubsList.forEach(function(eachObj){
            hubService.getHubProperties(eachObj.resourceId).then(function(message) {
                eachObj.properties = message.data.data;
                propsDone++;
                if($scope.hubsList.length == propsDone){
                    hubPropertiesIsDone();
                }
            })
        })
        
    })

    
    $scope.$on('rmui:event:connectionupdate', function(events, args){
        //check the company id
        if (args.companyid == $scope.companyinfo.id){
            //search the hub and update the status icon
            angular.forEach($scope.hubsList, function(eachObj){
                if (eachObj.resourceId == args.hubid){
                    angular.forEach(eachObj.properties, function(eachprop){
                        if (eachprop.resourcePropertyName == "status"){
                            eachprop.value = args.status
                            console.log("hub is UPDATED!!!!!")
                        }
                    })
                }
            })
        }
    })
    $scope.statuslabels = [];
    $scope.hubtypes.forEach(function(eachTypes){
        $scope.statuslabels.push(eachTypes.typeName);
    })
    //chart data___________________________________
    //1 hub connections ratio
    //1.1 legacy system hubs

})

.controller('companyController', function($scope, $stateParams, hubService, companyService, resourceService, notificationFactory, rmuiNotificationService) {
        
        rmuiNotificationService.startListen();


        $scope.$on('rmui:event:connectionupdate', function(events, args){
            console.log("something on rmui:event:connectionupdate " + args);
            //check the company id
            if (args.companyid == $scope.companyinfo.id){
                //search the hub and update the status icon
                angular.forEach($scope.hubsList, function(eachObj){
                    if (eachObj.resourceId == args.hubid){
                        angular.forEach(eachObj.properties, function(eachprop){
                            if (eachprop.resourcePropertyName == "status"){
                                eachprop.value = args.status
                                console.log("hub is UPDATED!!!!!")
                            }
                        })
                    }
                })
            }
        })

        var getAllHubs = function() {
                //get hubs list for the company context
                hubService.getHubs().then(function(message){
                        $scope.hubsList = message.data.data;
                        //fill the hubs properties
                        $scope.hubsList.forEach(function(eachObj){
                                hubService.getHubProperties(eachObj.resourceId).then(function(message) {
                                        eachObj.properties = message.data.data;
                                })
                        })
                })
        }
        //add new hub scope
        $scope.newhubname = "";
        $scope.newhubtype = "";

        //insert selected company in scope
        companyService.getCompany().then(function(message){
                $scope.companyinfo = { id: $stateParams.companyid, name: message.data.data[0].resourceName };
        });

        getAllHubs();

        hubService.getHubTypes().then(function(message){
            $scope.hubtypes = [];
            //to fill the new hub type select box
            angular.forEach(message.data.data, function(eachObj){
                if (eachObj.parentName != "Hub" && eachObj.conceptName != "Hub") {
                    $scope.hubtypes.push(eachObj);
                }
            })
        })
        //resetFormNewHub() = cancel button
        $scope.resetFormNewHub = function() {
                $scope.newhubname = "";
                $scope.newhubtype = "";
        }

        //createHub submit button
        $scope.createHub = function(){
                console.log("CompanyController: createHub");
                hubService.addHub($stateParams.companyid, $scope.newhubname, $scope.newhubtype.conceptName).then(function(message){
                        if (message.data.status == "Ok") {
                                //create success notification
                                //notification("Create new Hub", "Your new Hub has been created", "success");
                                notificationFactory.weakSuccess("Create new Hub","Your new Hub has been created");
                                //close modal
                                //closemodal('#addhub');
                                angular.element(document.querySelector('#addhub')).modal('hide');

                                //refresh hubs list
                                getAllHubs();
                        }else{
                                //create notification
                                //notification("Create new Hub",message.data.message,"error");
                                notificationFactory.weakError("Create new Hub",message.data.message);
                        }
                })
        }

        $scope.deleteHub = function(index){
                confirmation("Delete Hub", "Are you sure?").get().on('pnotify.confirm', function() {
                        hubService.delHub($scope.hubsList[index].resourceId).then(function(message){
                                if (message.data.status == "Ok") {
                                        //create notification
                                        //notification("Delete Hub", "Hub successfully deleted", "success");
                                        notificationFactory.weakSuccess("Delete Hub", "Hub successfully deleted");
                                        //delete from propertiesList

                                        //delete $scope.hubsList[index]
                                        $scope.hubsList.splice(index,1)
                                }else{
                                        //create notification
                                        //notification("Delete Hub", message.data.message, "error");
                                        notificationFactory.weakError("Delete Hub", message.data.message);
                                }
                        })
                })
        }

        $scope.isConnected = function(propertiesList){
                status = "disconnected"
                //console.log("propertiesList:" + JSON.stringify(propertiesList))
                angular.forEach(propertiesList, function(eachObj){
                        //console.log("forEach: " + JSON.stringify(eachObj))
                        if (eachObj.resourcePropertyName == "status") {
                                status = eachObj.value
                                //console.log("status in: " + status)
                        }
                })
                //console.log("status out: " + status)
                return status
        }
/**	
	$scope.AllResources = function() {
	    console.log($scope.hubsList.length);
	    for (var i = 0 i< $scope.hubsList.length;i++){
		console.log("Atum");
            	resourceService.getResource($scope.hubsList[i].resourceId).then(function(message) {
                    $scope.resourcesList = message.data.data;
            });
		}
    	}*/


	// preencher scope.company retornando jc com 
	// informacao sobre a companhia, hubs, resources, propriedades
	// preencher scope.company retornando jc com 
	// informacao sobre a companhia, hubs, resources, propriedades
	$scope.atum = function(){
		var j_c={};
		console.log();
		j_c.name = $scope.companyinfo.name;
		j_c.type = "comp";
		j_c.children = $scope.hubsList.map(function traverse(o ) {
				console.log(o.resourceName);
				console.log(o.resourceId);
			resourceService.getResources(o.resourceId).then(function(message) {
                    console.log(message.data.data);
            });

            	for(var j in o.properties){
					console.log(o.properties[j].resourcePropertyName);
				}
				        
    			}
		 
			
		)
		return j_c;
		
	}
	
	
	$scope.company = {
                name: "Flexfelina",
                type: "comp",
                children: [{
                    name: "Hub 1",
                    type: "hub",
                    children: [{
                        name: "Property 1",
                        type: "prop",
                    }, {
                        name: "Resource A",
                        type: "rec",
                        children: [{
                            name: "prop1",
                            type: "prop"
                        }, {
                            name: "prop2",
                            type: "prop"
                        }]
                    }]
                }, {
                    name: "hub 2",
                    type: "hub",
                    children: [{
                            name: "prop 2",
                            type: "prop"
                        },
                        {
                            name: "Resource 2",
                            type: "rec",
                            children: [{
                                name: "propx",
                                type: "prop"
                            }, {
                                name: "propy",
                                type: "prop"
                            }]
                        }
                    ]
                }]
            };

})

.controller('resourcesController', function($scope, $stateParams, companyService, hubService, resourceService, propertiesService, notificationFactory) {
    
    //insert company info scope
    companyService.getCompany().then(function(message){
            $scope.companyinfo = { id: $stateParams.companyid, name: message.data.data[0].resourceName };
    });
    //insert hub info in scope
    hubService.getHub($stateParams.hubid).then(function(message) {
            $scope.hubinfo = { id: $stateParams.hubid, name: message.data.data[0].resourceName, conceptName: message.data.data[0].conceptName};
            hubService.getHubProperties($stateParams.hubid).then(function(hubsList) {
                    angular.forEach(hubsList.data.data, function(hubprop){
                            if (hubprop.resourcePropertyName == "configUploaded"){
                                    console.log("YESSSSSSSSSS configUploaded");
                                    $scope.hubinfo.configStatus = angular.copy(hubprop.value);
                            }
                    })
            })
    });
    //insert resources list in scope
    var getAllResources = function() {
            resourceService.getResources($stateParams.hubid).then(function(message) {
                    $scope.resourcesList = message.data.data;
            });
    }

    getAllResources();

    //insert new resources in scope
    $scope.newresourcename = "";
    $scope.newresourcetype = "";

    //resetFormNewHub() = cancel button
    $scope.resetFormNewResource = function() {
            $scope.newresourcename = "";
            $scope.newresourcetype = "";
    }

    var keepgoing = true;
    $scope.resourceIsAttachableTo = "";

    //get hub properties by hubid url
    hubService.getHubProperties($stateParams.hubid).then(function(message) {
            angular.forEach(message.data.data, function(eachObj) {
                    if (keepgoing) {
                            if (eachObj.resourcePropertyName == "attachable") {
                                    //get the value of property "attachable"
                                    $scope.resourceIsAttachableTo = angular.copy(eachObj.value);
                                    keepgoing = false;
                            }
                    }
            })

            $scope.hubpropertiesList = message.data.data;
    });

    //run getResourceTypes when resourceIsAttachableTo has a value
    $scope.$watch('resourceIsAttachableTo', function() {
            resourceService.getResourceTypes($scope.resourceIsAttachableTo).then(function(message) {
                    $scope.resourcetypes = message.data.data;
            })
    })


    $scope.createResource = function() {
            resourceService.addResource($stateParams.hubid, $scope.newresourcename, $scope.newresourcetype.conceptName).then(function(message){
                    if (message.data.status == "Ok") {
                            //create notification
                            //notification("Create new Resource", "Your new Resource has been created", "success");
                            notificationFactory.weakSuccess("Create New Resource", "Your new Resource has been created")
                            //close modal
                            //closemodal('#addresource');
                            angular.element(document.querySelector('#addresource')).modal('hide');
                            //append new resource to the resourcesList
                            getAllResources();
                    }else{
                            //create notification
                            //notification("Create new Resource",message.data.message,"error");
                            notificationFactory.weakError("Create New Resource", message.data.message);
                    }
            })
    }

    $scope.deleteResource = function(index) {
            resourceService.delResource($scope.resourcesList[index].resourceId).then(function(message){
                    if (message.data.status == "Ok") {
                            //create notification
                            //notification("Delete Resource", "Resource successfully deleted", "success");
                            notificationFactory.weakSuccess("Delete Resource","Resource successfully deleted");
                            //delete from propertiesList
                            angular.element(document.querySelector('#_'+index+'_del')).modal('hide');
                            //delete $scope.hubsList[index]
                            $scope.resourcesList.splice(index,1)
                    }else{
                            //create notification
                            //notification("Delete Resource", message.data.message, "error");
                            notificationFactory.weakError("Delete Resource", message.data.message);
                    }
            })
    }

    //get configuration for hub id
    hubService.getConfig().then(function(message) {
            //store the configuration as backup for reset
            $scope.configuration = message.data;
            //store the configuration for edit
            $scope.editedconfiguration = JSON.stringify(message.data, null, 2);
            $scope.uglyconfiguration = JSON.stringify(message.data, null, 2);
    })

    $scope.isConfigurationChanged = function() {
            return !angular.equals($scope.editedconfiguration, $scope.uglyconfiguration);
    }
    $scope.valJSON = function() {
            //awesome JSON format validator
            try{
                    $scope.editedconfiguration = JSON.parse($scope.uglyconfiguration)
                    //notification("JSON Format", "The format is correct", "success")
                    notificationFactory.weakSuccess("JSON Format", "The format is correct");
                    $scope.configuration = $scope.editedconfiguration
                    $scope.editedconfiguration = JSON.stringify($scope.editedconfiguration, null, 2)
                    $scope.uglyconfiguration = angular.copy($scope.editedconfiguration)
            }catch(err){
                    //notification("JSON Format", err, "error");
                    notificationFactory.weakError("JSON Format", err);
            }
    }

    $scope.sendConfigModal = function() {
        angular.element(document.querySelector('#sendconfigmodal')).modal('show');
    }

    $scope.confirmSendConfig = function(){
        hubService.sendConfig($scope.configuration).then(function(message) {
            if (message.data.status == "Ok") {
                    //update send configuration status

                    propertiesService.editProperty($stateParams.hubid, "configUploaded", "true").then(function(updated){
                            if (updated.data.status == "Ok") {
                                    console.log("configUploaded property was changed");
                                    $scope.hubinfo.configStatus = "true"
                            }else{
                                    console.log("configUploaded property was not changed");
                            }
                    })
                    //notification("Send configuration", "Configuration was sent", "success");
                    notificationFactory.weakSuccess("Send configuration","Configuration was sent");
                    //closemodal('#viewconfig');
                    angular.element(document.querySelector('#viewconfig')).modal('hide');
                    angular.element(document.querySelector('#sendconfigmodal')).modal('hide');
            }else{
                    //notification("Send configuration", message.data, "error");
                    notificationFactory.weakError("Send configuration", message.data);
            }
    })
    }
    $scope.cancelViewconfig = function() {
            console.log("cancel edited configuration button");
            $scope.uglyconfiguration = angular.copy($scope.editedconfiguration);
    }

})

//show hub properties on selected hub
.controller('hubPropertiesController', function($scope, $stateParams, companyService, hubService, propertiesService, notificationFactory, confirmationService) {
        console.log("HubPropertiesController for company id (" + $stateParams.companyid + ')');
        //insert selected company in scope
        companyService.getCompany().then(function(message){
                $scope.companyinfo = { id: $stateParams.companyid, name: message.data.data[0].resourceName };
        });
        //insert hub info in scope
        hubService.getHub($stateParams.hubid).then(function(message) {
                $scope.hubinfo = { id: $stateParams.hubid, name: message.data.data[0].resourceName };
        });
        //get hub properties
        hubService.getHubProperties($stateParams.hubid).then(function(message) {
                //console.log("HubPropertiesController hub properties received: " + JSON.stringify(message.data, null, 2));
                $scope.propertiesList = message.data.data;
                //save propertiesList
                $scope.oriPropertiesList = angular.copy($scope.propertiesList);
        });

        //set property types
        $scope.propertytypes = ["string", "JSON", "integer", "real"];

        //add new property scope variables
        $scope.newpropertyname = "";
        $scope.newpropertytype = "";
        $scope.newpropertyvalue = "";

        //resetForm() = cancel button
        $scope.resetForm = function() {
                //console.log("resetForm");
                $scope.propertiesList = angular.copy($scope.oriPropertiesList);
                //console.log("resetForm: " + JSON.stringify($scope.propertiesList));
        }

        //resetFormNewProperty() = cancel button
        $scope.resetFormNewProperty = function() {
                $scope.newpropertyname = "";
                $scope.newpropertytype = "";
                $scope.newpropertyvalue = "";
        }

        //disables model buttons
        $scope.isPropertyChanged = function() {
                return !angular.equals($scope.propertiesList, $scope.oriPropertiesList);
        }

        //editProperty() = submit button
        $scope.editProperty = function(index) {
                //console.log("submit with: resourceId=" + $stateParams.hubid + ", property name=" + $scope.propertiesList[index].resourcePropertyName + ", property value=" + $scope.propertiesList[index].value);
                propertiesService.editProperty($stateParams.hubid, $scope.propertiesList[index].resourcePropertyName, $scope.propertiesList[index].value).then(function(message){
                        if (message.data.status == "Ok") {
                                //create notification
                                //notification("Edit Property Value","Value has been updated successfully", "success");
                                notificationFactory.weakSuccess("Edit Property Value", "Value has been updated successfully");
                                //close modal
                                //closemodal('#' + index + '_edit');
                                angular.element(document.querySelector('#_'+ index + '_edit')).modal('hide');
                        }else{
                                //create notification
                                //notification("Edit Property Value","Found an error", "error");
                                notificationFactory.strongError("Edit Property Value", "Found an error");
                        }
                })
        }

        //createProperty = submit button
        $scope.createProperty = function() {
                propertiesService.addProperty($stateParams.hubid, $scope.newpropertyname, $scope.newpropertytype, $scope.newpropertyvalue).then(function(message){
                        console.log("MESSAGE: " + JSON.stringify(message.data));
                        if (message.data.status == "Ok") {
                                //create notification
                                //notification("Create new Property", "Your new property has been created", "success");
                                notificationFactory.weakSuccess("Create new Property", "Your new property has been created");
                                //close modal
                                //closemodal('#addproperty');
                                angular.element(document.querySelector('#addproperty')).modal('hide');
                                //append new property to the propertiesList
                                $scope.propertiesList.push({resourceId: $stateParams.hubid, resourcePropertyName: $scope.newpropertyname, type: $scope.newpropertytype, value: $scope.newpropertyvalue })
                        }else{
                                //create notification
                                //notification("Create new Property",message.data.message,"error");
                                notificationFactory.strongError("Create new Property", message.data.message);
                        }
                })
        }

        //deleteProperty = delete button
        $scope.deleteProperty = function(index) {
                propertiesService.delProperty($scope.propertiesList[index].resourceId, $scope.propertiesList[index].resourcePropertyName).then(function(message){
                    if (message.data.status == "Ok") {
                                    //create notification
                                   //notification("Delete Property", "Property successfully deleted", "success");
                                  notificationFactory.weakSuccess("Delete Property", "Property successfully deleted");
                                 angular.element(document.querySelector('#_'+index+'_del')).modal('hide');
                                 //delete $scope.propertiesList[index]
                                 $scope.propertiesList.splice(index,1)
                         }else{
                                 //create notification
                                 //notification("Delete Property", message.data.message, "error");
                                 notificationFactory.strongError("Delete Property", message.data.message);
                         }
                })
        }
        
})

.controller('resourcePropertiesController', function ($scope, $stateParams, companyService, hubService, resourceService, propertiesService, notificationFactory) {

        //loading
        $scope.loadingCount = 0;
        
        angular.element(document.querySelector('#myPleaseWait')).modal('show');

        //watch the counter
        $scope.$watch('loadingCount', function() {
                if ($scope.loadingCount == 4){
                        angular.element(document.querySelector('#myPleaseWait')).modal('hide');
                }
        })


        //insert selected company in scope
        companyService.getCompany().then(function(message){
                $scope.companyinfo = { id: $stateParams.companyid, name: message.data.data[0].resourceName };
                $scope.loadingCount = $scope.loadingCount + 1;
        });
        //insert hub info in scope
        hubService.getHub($stateParams.hubid).then(function(message) {
                $scope.hubinfo = { id: $stateParams.hubid, name: message.data.data[0].resourceName };
                $scope.loadingCount = $scope.loadingCount + 1;
        });
        //insert resource info in scope
        resourceService.getResource().then(function(message) {
                $scope.resourceinfo = { id: $stateParams.resourceid, name: message.data.data[0].resourceName };
                $scope.loadingCount = $scope.loadingCount + 1;
        });
        //get resource properties
        resourceService.getProperties($stateParams.resourceid).then(function(message) {
                $scope.propertiesList = message.data.data;
                //save propertiesList
                $scope.oriPropertiesList = angular.copy($scope.propertiesList);
                $scope.loadingCount = $scope.loadingCount + 1;
        });

        //set property types
        $scope.propertytypes = ["string", "JSON", "integer", "real"];

        //add new property scope variables
        $scope.newpropertyname = "";
        $scope.newpropertytype = "";
        $scope.newpropertyvalue = "";

        //resetForm() = cancel button
        $scope.resetForm = function() {
                //console.log("resetForm");
                $scope.propertiesList = angular.copy($scope.oriPropertiesList);
                //console.log("resetForm: " + JSON.stringify($scope.propertiesList));
        }

        //resetFormNewProperty() = cancel button
        $scope.resetFormNewProperty = function() {
                $scope.newpropertyname = "";
                $scope.newpropertytype = "";
                $scope.newpropertyvalue = "";
        }

        //disables model buttons
        $scope.isPropertyChanged = function() {
                return !angular.equals($scope.propertiesList, $scope.oriPropertiesList);
        }

        //editProperty() = submit button
        $scope.editProperty = function(index) {
                //console.log("submit with: resourceId=" + $stateParams.hubid + ", property name=" + $scope.propertiesList[index].resourcePropertyName + ", property value=" + $scope.propertiesList[index].value);
                propertiesService.editProperty($stateParams.resourceid, $scope.propertiesList[index].resourcePropertyName, $scope.propertiesList[index].value).then(function(message){
                        if (message.data.status == "Ok") {
                                //create notification
                                //notification("Edit Property Value","Value has been updated successfully", "success");
                                notificationFactory.weakSuccess("Edit Property Value", "Value has been updated successfully");
                                //close modal
                                //closemodal('#' + index + '_edit');
                                angular.element(document.querySelector('#_'+index+'_edit')).modal('hide');

                        }else{
                                //create notification
                                //notification("Edit Property Value","Found an error", "error");
                                notificationFactory.strongError("Edit Property Value", message.data.message);
                        }
                })
        }
        //createProperty = submit button
        $scope.createProperty = function() {
                propertiesService.addProperty($stateParams.resourceid, $scope.newpropertyname, $scope.newpropertytype, $scope.newpropertyvalue).then(function(message){
                        if (message.data.status == "Ok") {
                                //create notification
                                //notification("Create new Property", "Your new property has been created", "success");
                                notificationFactory.weakSuccess("Create new Property", "Your new property has been created");
                                //close modal
                                //closemodal('#addproperty');
                                angular.element(document.querySelector('#addproperty')).modal('hide');
                                //append new property to the propertiesList
                                $scope.propertiesList.push({resourceId: $stateParams.resourceid, resourcePropertyName: $scope.newpropertyname, type: $scope.newpropertytype, value: $scope.newpropertyvalue })
                        }else{
                                //create notification
                                //notification("Create new Property",message.data.message,"error");
                                notificationFactory.strongError("Create new Property", message.data.message);
                        }
                })
        }
        //deleteProperty = delete button
        $scope.deleteProperty = function(index) {
                //confirmation("Delete Property", "Are you sure?").get().on('pnotify.confirm', function() {
                        propertiesService.delProperty($scope.propertiesList[index].resourceId, $scope.propertiesList[index].resourcePropertyName).then(function(message){
                                if (message.data.status == "Ok") {
                                        //create notification
                                        //notification("Delete Property", "Property successfully deleted", "success");
                                        notificationFactory.weakSuccess("Delete Property", "Property successfully deleted");
                                        angular.element(document.querySelector('#_'+index+'_del')).modal('hide');
                                        //delete $scope.propertiesList[index]
                                        $scope.propertiesList.splice(index,1)
                                }else{
                                        //create notification
                                        //notification("Delete Property", message.data.message, "error");
                                        notificationFactory.strongError("Delete Property", message.data.message);
                                }
                        })
                //})
        }

        //get external content
        $scope.getexternalproperty = function() {
                propertiesService.getExternal($stateParams.hubid, $stateParams.resourceid).then(function(message){
                        if (message.data.status == "Ok") {
                                //create notification
                                //notification("External Property", "External property has been requested", "success")
                                notificationFactory.weakSuccess("External Property", "External property has been requested");
                        }else{
                                //notification("External Property", "External property found some error", "error");
                                notificationFactory.strongError("External Property", "External property found some error");
                        }
                })
        }
})

.controller('externalController', function ($scope, $sce, $stateParams, companyService, hubService, resourceService, propertiesService, dataCollectorService, notificationFactory) {
        //insert selected company in scope
        companyService.getCompany().then(function(message){
                $scope.companyinfo = { id: $stateParams.companyid, name: message.data.data[0].resourceName };
        });
        //insert hub info in scope
        hubService.getHub($stateParams.hubid).then(function(message) {
                $scope.hubinfo = { id: $stateParams.hubid, name: message.data.data[0].resourceName };
        });
        //insert resource info in scope
        resourceService.getResource().then(function(message) {
                $scope.resourceinfo = { id: $stateParams.resourceid, name: message.data.data[0].resourceName };
        });
        //insert html code in scope
        resourceService.getProperties($stateParams.resourceid).then(function(message) {
                //search for the html property
                angular.forEach(message.data.data, function(eachObj){
                        if (eachObj.resourcePropertyName == "external property") {
                                $scope.htmlString = $sce.trustAsHtml(eachObj.value);
                        }
                })
        });
        //define external content function
        $scope.submitExternal = function () {
                //confirmation("Confirmation", "Do you want to proceed?").get().on('pnotify.confirm', function() {
                        //fieldsList array of strings
                        //configuration json
                        console.log(PCP_fieldsList);
                        console.log(PCP_outputConfiguration);
                        $scope.fields = PCP_fieldsList;
                        $scope.configuration = PCP_outputConfiguration;
                        //create a outputConfiguration property for this resourceid
                        propertiesService.addProperty($stateParams.resourceid, "outputConfiguration", "JSON", JSON.stringify($scope.configuration)).then(function(message){
                                if (message.data.status == "Ok") {
                                        //create notification
                                        //notification("Submit", "Success", "success");
                                        notificationFactory.weakSuccess("Submit", "Success");
                                        angular.element(document.querySelector('#submit')).modal('hide');
                                }else{
                                        //create notification
                                        //notification("Submit", message.data.message, "error");
                                        notificationFactory.strongError("Submit", message.data.message);
                                }
                        })
                        //store the fields names in a specific property
                        $scope.my_fieldsList = []
                        angular.forEach($scope.fields, function(eachObj){
                                $scope.my_fieldsList.push({name: eachObj, type: "string"})
                        })
                        propertiesService.editProperty($stateParams.resourceid, "private_DataSet", JSON.stringify($scope.my_fieldsList)).then(function(message){
                                if (message.data.status == "Ok") {
                                        console.log("properpy private_fields creation OK")
                                }else{
                                        console.log("properpy private_fields not created: " + message.data.message)
                                }
                        })
                        //create datacollector for this resourceid
                        dataCollectorService.create($stateParams.resourceid, "dc_" + $stateParams.resourceid, "JSON", JSON.stringify($scope.my_fieldsList)).then(function(message){
                                if (message.data.status == "Ok") {
                                        console.log("data collector creation OK")
                                }else{
                                        console.log("data collector not created: " + message.data.message)
                                }
                        })
                //})
        };
});


