var InterventionsController = function($timeout, tabContainer, FiltersFactory, ContextMenu, LxProgressService, edisonAPI, DataProvider, $routeParams, $location, $q, $rootScope, $filter, config, ngTableParams) {
    "use strict";
    var _this = this;

    _this.recap = $routeParams.sstID ? parseInt($routeParams.sstID) : false;

    LxProgressService.circular.show('#5fa2db', '#globalProgress');
    edisonAPI.intervention.list({
        cache: true
    }).success(function(resp) {
        _this.tab = tabContainer.getCurrentTab();
        var filtersFactory = new FiltersFactory('intervention')
        var currentFilter;
        if ($routeParams.fltr) {
            currentFilter = filtersFactory.getFilterByUrl($routeParams.fltr)
        }
        var currentHash = $location.hash();
        var title = currentFilter ? currentFilter.long_name : "Interventions";
        _this.tab.setTitle(title, currentHash);
        _this.tab.hash = currentHash;
        _this.config = config;

        if (_this.recap) {
            var customFilter = function(inter) {
                return inter.ai === _this.recap;
            }
            _this.tab.setTitle('Recap ' + _this.recap)
        }

        var dataProvider = new DataProvider('intervention');
        if (!dataProvider.isInit()) {
            console.log("not init")
            dataProvider.setData(resp);
        }
        dataProvider.applyFilter(currentFilter, _this.tab.hash, customFilter);
        var tableParameters = {
            page: 1, // show first page
            total: dataProvider.filteredData.length,
            filter: {},
            sorting: {
                id: 'desc'
            },
            count: 100 // count per page
        };
        var tableSettings = {
            //groupBy:$rootScope.config.selectedGrouping,
            total: dataProvider.filteredData,
            getData: function($defer, params) {
                var data = dataProvider.filteredData;
                data = $filter('tableFilter')(data, params.filter());
                params.total(data.length);
                data = $filter('orderBy')(data, params.orderBy());
                $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            },
            filterDelay: 100
        }
        _this.tableParams = new ngTableParams(tableParameters, tableSettings);
        $('.listeInterventions').css('min-height', '0px')
        LxProgressService.circular.hide();
    })

    $rootScope.$on('interventionListChange', function() {
        console.log("reload")
        dataProvider.applyFilter(currentFilter, _this.tab.hash, customFilter);
        _this.tableParams.reload();
    })

    _this.contextMenu = new ContextMenu('intervention')


    _this.rowRightClick = function($event, inter) {
        edisonAPI.intervention.get(inter.id, {
                extend: true
            })
            .then(function(resp) {
                _this.contextMenu.setData(resp.data);
                _this.contextMenu.setPosition($event.pageX, $event.pageY)
                _this.contextMenu.open();
            })
    }

    _this.rowClick = function($event, inter) {
        if (_this.contextMenu.active)
            return _this.contextMenu.close();
        if ($event.metaKey || $event.ctrlKey) {
            tabContainer.addTab('/intervention/' + inter.id, {
                title: ('#' + inter.id),
                setFocus: false,
                allowDuplicates: false
            });
        } else {
            if ($rootScope.expendedRow === inter.id) {
                $rootScope.expendedRow = undefined;
            } else {
                $rootScope.expendedRow = inter.id
            }
        }
    }

}
angular.module('edison').controller('InterventionsController', InterventionsController);
