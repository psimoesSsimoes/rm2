'use strict';

// criar modulo d3
angular.module('d3', [])
// injectamos module d3 criado em uninova.rm.2
angular.module('uninova.rm.2', ['op.dynamicDirective','ui.router', 'esn.http', 'esn.paginate', 'esn.websocket', 'esn.core', 'esn.object-type', 'esn.session', 'esn.collaboration', 'chart.js','d3'])

.config(['$stateProvider','dynamicDirectiveServiceProvider', function($stateProvider, dynamicDirectiveServiceProvider) {

	//inject in top application menu a new RM button base on the angular directive applicationMenuRm
	var menu_rm = new dynamicDirectiveServiceProvider.DynamicDirective(true, 'application-menu-rm', {priority: 28});
	dynamicDirectiveServiceProvider.addInjection('esn-application-menu', menu_rm);
	//$urlRouterProvider.when('/rmui', '/rmui/company/companyid');
	$stateProvider
		.state('rmui',{
			url: '/rmui',
			templateUrl: '/rmui/views/index.html',
			controller: 'testController',
			abstract: true
		})
		.state('rmui.companies',{
			url: '/companies',
			templateUrl: '/rmui/views/partials/companies.html',
			controller: 'companiesController'
		})
		.state('rmui.companydashboard',{
			url:'',
			templateUrl: '/rmui/views/partials/company_dashboard.html',
			controller: 'dashboardController'
		})
		.state('rmui.company',{
			url:'/company/:companyid',
			templateUrl: '/rmui/views/partials/company.html',
			controller: 'companyController'
		})
		.state('rmui.resources',{
			url:'/company/:companyid/hub/:hubid/resources',
			templateUrl: '/rmui/views/partials/resources.html',
			controller: 'resourcesController'
		})
		.state('rmui.hubproperties',{
			url:'/company/:companyid/hub/:hubid/properties',
			templateUrl: '/rmui/views/partials/hubproperties.html',
			controller: 'hubPropertiesController'
		})
		.state('rmui.resourceproperties',{
			url:'/company/:companyid/hub/:hubid/resource/:resourceid/properties',
			templateUrl: '/rmui/views/partials/resourceproperties.html',
			controller: 'resourcePropertiesController'
		})
		.state('rmui.external',{
			url:'/company/:companyid/hub/:hubid/resource/:resourceid/external',
			templateUrl: '/rmui/views/partials/external.html',
			controller: 'externalController'
		})
		.state('rmui.hw',{
			url:'/helloworld',
			templateUrl: '/hw/views/helloworld.html',
			controller: function($state){
				//$state.go('hw');
			}
		});
	}
])


