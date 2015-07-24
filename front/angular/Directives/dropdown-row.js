angular.module('edison').directive('dropdownRow', function(edisonAPI, config, $q, $timeout, Intervention) {
    "use strict";

    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/Directives/dropdown-row.html',
        scope: {
            model: "@",
            row: '=',
        },
        link: function(scope, element, attrs) {
            scope.Intervention = Intervention
            scope._model = scope.model || "intervention"
            console.log('-->', scope._model)
            scope.expendedStyle = {
                height: 0,
                overflow: 'hidden'
            };
            scope.expendedReady = false;
            scope.data = {};
            scope.config = config
            $timeout(function() {
                $("#expended").velocity({
                    height: 205,
                }, 200);
            }, 50)

            if (scope._model === "intervention") {
                edisonAPI.intervention.get(scope.row.id, {
                    extended: true
                }).then(function(result) {
                    scope.data = result.data;
                    scope.client = scope.data.client;
                    scope.address = scope.client.address;

                })

            } else if (scope._model === "devis") {
                var pAll = [
                    edisonAPI.devis.get(scope.row.id),
                ]
                var pThen = function(result) {
                    scope.data = result[0].data;
                    scope.client = scope.data.client;
                    scope.address = scope.client.address;
                    scope.data.flagship = _.max(scope.data.produits, 'pu');
                }
            } else if (scope._model === 'artisan') {
                pAll = [
                    edisonAPI.artisan.get(scope.row.id),
                    edisonAPI.artisan.getStats(scope.row.id)
                ]
                pThen = function(result) {
                    scope.data = result[0].data;
                    scope.artisan = scope.data;
                    scope.artisan.stats = result[1].data;
                    scope.address = scope.artisan.address
                }
            }

            $q.all(pAll).then(pThen)

            scope.getStaticMap = function(address) {
                var q = "?width=500&height=200&precision=0&zoom=11&origin=" + address.lt + ", " + address.lg;
                return "/api/mapGetStatic" + q;
            }

        }
    };
});
