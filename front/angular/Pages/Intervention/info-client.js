 angular.module('edison').directive('infoClient', ['config', 'edisonAPI', function(config, edisonAPI) {
     "use strict";
     return {
         replace: true,
         restrict: 'E',
         templateUrl: '/Pages/intervention/info-client.html',
         transclude: true,
         scope: {
             client: '=model'
         },
         link: function(scope, element, attrs) {
             scope.config = config;
             scope.searchPhone = function(tel) {
                 if (tel.length > 2) {
                     edisonAPI.searchPhone(tel)
                         .success(function(tel) {
                             scope.searchedPhone = tel
                         }).catch(function() {
                             scope.searchedPhone = {};
                         })
                 }
             }
         }
     }

 }]);
