var LpaController = function(tabContainer, edisonAPI, $scope) {
    "use strict";
    var _this = this
    var tab = tabContainer.getCurrentTab();
    tab.setTitle('LPA')
    edisonAPI.compta.lpa().then(function(result) {
        _this.result = result.data
    }, console.log)

    var reloadNumeroCheque = function(debutCheque) {
    	_.each(_this.result, function(e) {
    		if (e.toFlush) {
    			e.numeroCheque = debutCheque++
    		}
    	})
    }

    $scope.$watch('debutCheque', function(current) {
        console.log(current)
    })
}


angular.module('edison').controller('LpaController', LpaController);
