angular.module('edison').directive('historiqueSst', function(edisonAPI) {
    "use strict";

    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/Templates/historique-sst.html',
        scope: {
            data: "=",
            exit: '&'
        },
        link: function(scope, element, attrs) {
            var reload = function() {
                if (!scope.data || !scope.data.id) {
                    return 0;
                }
                edisonAPI.artisan.fullHistory(scope.data.id).then(function(resp) {
                    scope.hist = resp.data;
                })
            }

            scope.$watch('data.id', reload)
            scope.check = function(sign) {
                /*  if (sign.ok)
                      return 0;*/
                edisonAPI.signalement.check(sign._id, sign.text).then(function(resp) {
                    sign = _.merge(sign, resp.data);
                })
                scope.exit && scope.exit();
            }
            scope.comment = function() {
                edisonAPI.artisan.comment(scope.data.id, scope.comm).then(reload)
                scope.comm = ""
            }
        }
    };
});
