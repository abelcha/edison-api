angular.module('edison', ['ngMaterial', 'lumx', 'ngAnimate', 'ngDialog', 'n3-pie-chart', 'btford.socket-io', 'ngFileUpload', 'pickadate', 'ngRoute', 'ngResource', 'ngTable', 'ngMap'])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('red');
  });


angular.module('edison').controller('MainController', function(tabContainer, $scope, socket, config, dataProvider, $rootScope, $location, edisonAPI) {

  $scope.config = config;
  $rootScope.loadingData = true;
  $rootScope.$on('$routeChangeSuccess', function(e, curr, prev) {
    $rootScope.loadingData = false;
  });

  $scope.sideBarlinks = [{
    url: '/dashboard',
    title: 'Dashboard',
    icon: 'dashboard'
  }, {
    url: '/intervention',
    title: 'Nouvelle Intervention',
    icon: 'plus'
  }];

  $scope.tabs = tabContainer;
  $scope.$watch('tabs.selectedTab', function(prev, curr) {
    if (prev === -1 && curr !== -1) {
      $scope.tabs.selectedTab = curr;
    }
  })
  $rootScope.options = {
    showMap: true
  };

  var initTabs = function(baseUrl) {
    this.tabsInitialized = true;
    $scope.tabs.loadSessionTabs(baseUrl)
      .then(function(urlIsInTabs) {
        $location.url(baseUrl)
      }).catch(function() {
        $scope.tabs.addTab(baseUrl);
      });
    return 0;
  }

  $scope.$on("$locationChangeStart", function(event, next, current) {
    if ($location.path() === "/") {
      return 0;
    }
    if (!this.tabsInitialized) {
      return initTabs($location.path())
    }
    if ($location.path() !== "/intervention") {
      $scope.tabs.addTab($location.path());
    }
    edisonAPI.request({
      fn: 'setSessionData',
      data: {
        tabContainer: $scope.tabs
      }
    })

  });


  $scope.linkClick = function($event, tab) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log(tab);

  }

  $scope.tabIconClick = function($event, tab) {
    $event.preventDefault();
    $event.stopPropagation();
    if ($scope.tabs.remove(tab)) {
      $location.url($scope.tabs.getCurrentTab().url);
    }
  }
});

var getInterList = function(edisonAPI) {
  return edisonAPI.listInterventions({
    cache: true
  });
}
var getArtisanList = function(edisonAPI) {
  return edisonAPI.listArtisans({
    cache: true
  });
}

var getArtisan = function($route, $q, edisonAPI) {
  var id = $route.current.params.id;

  if (id.length > 10) {
    return $q(function(resolve, reject) {
      resolve({
        data: {
          telephone:  {},
          pourcentage: {},
          add: {},
          representant: {},
        }
      })
    });
  } else {
    return edisonAPI.getArtisan(id, {
      cache: true,
      extend: true
    });
  }
};

var getIntervention = function($route, $q, edisonAPI) {
  var id = $route.current.params.id;

  if (id.length > 10) {
    return $q(function(resolve, reject) {
      resolve({
        data: {
          prixAnnonce:0,
          prixFinal:0,
          coutFourniture:0,
          client: {},
          reglementSurPlace: true,
          date: {
            ajout: Date.now(),
            intervention: Date.now()
          }
        }
      })
    });
  } else {
    return edisonAPI.getIntervention(id, {
      cache: true,
      extend: true
    });
  }
}


var whoAmI = function(edisonAPI) {
  return edisonAPI.getUser();
}

angular.module('edison').config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      resolve: {
        user: whoAmI,
        interventions: getInterList,
        artisans: getArtisanList
      },
      redirectTo: '/dashboard',
    })
    .when('/artisan/:id', {
      templateUrl: "Pages/Artisan/artisan.html",
      controller: "ArtisanController",
      resolve: {
        user: whoAmI,
        artisan: getArtisan,
        interventions: getInterList,
        artisans: getArtisanList
      }
    })
    .when('/interventions', {
      templateUrl: "Pages/ListeInterventions/listeInterventions.html",
      controller: "InterventionsController",
      resolve: {
        user: whoAmI,
        interventions: getInterList,
        artisans: getArtisanList
      }
    })
    .when('/interventions/:fltr', {
      templateUrl: "Pages/ListeInterventions/listeInterventions.html",
      controller: "InterventionsController",
      resolve: {
        user: whoAmI,
        interventions: getInterList,
        artisans: getArtisanList
      }
    })
    .when('/intervention', {
      redirectTo: function() {
        return '/intervention/' + Date.now();
      }
    })
    .when('/artisan', {
      redirectTo: function() {
        return '/artisan/' + Date.now();
      }
    })
    .when('/artisan/:artisanID/recap', {
      templateUrl: "Pages/ListeInterventions/listeInterventions.html",
      controller: "InterventionsController",
      resolve: {
        user: whoAmI,
        interventions: getInterList,
        artisans: getArtisanList
      }
    })
    .when('/intervention/:id', {
      templateUrl: "Pages/Intervention/intervention.html",
      controller: "InterventionController",
      resolve: {
        user: whoAmI,
        interventions: getInterList,
        intervention: getIntervention,
        artisans: getArtisanList

      }
    })
    .when('/dashboard', {
      controller: 'DashboardController',
      templateUrl: "Pages/Dashboard/dashboard.html",
      resolve: {
        user: whoAmI,
        interventions: getInterList,
        artisans: getArtisanList

      }
    })
    .otherwise({
      templateUrl: 'templates/Error404.html',
    });
  // use the HTML5 History API
  $locationProvider.html5Mode(true);
});

angular.module('edison').directive('capitalize', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function(input) {
                return input ? input.toUpperCase() : "";
            });
            element.css("text-transform","uppercase");
        }
    };
})


angular.module('edison').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
/*angular.module('edison').directive('materialSelect', function() {
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="select-style text-field">' +
      '<select ng-model>' +
      '<option disabled>{{defaultName}}</option>' +
      '</select>' +
      '</div>'
  }
});
*/

angular.module('edison').directive('newlines', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function(input) {
                return input ? input.replace(/\n/g, '<br/>') : "";
            });
        }
    };
})


angular.module('edison').directive('sglclick', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
          var fn = $parse(attr['sglclick']);
          var delay = 300, clicks = 0, timer = null;
          element.on('click', function (event) {
            clicks++;  //count clicks
            if(clicks === 1) {
              timer = setTimeout(function() {
                scope.$apply(function () {
                    fn(scope, { $event: event });
                }); 
                clicks = 0;             //after action performed, reset counter
              }, delay);
              } else {
                clearTimeout(timer);    //prevent single-click action
                clicks = 0;             //after action performed, reset counter
              }
          });
        }
    };
}])
angular.module("edison").filter('addressPrettify', function() {
  return function(address) {
    return (address.n + " " +
      address.r + " " +
      address.cp + ", " +
      address.v + ", " +
      "France")
  };
});

angular.module("edison").filter('addressXY', function() {
  return function(address) {
    if (!address ||  !address.lt || !address.lg)
      return ("0, 0");
    return (address.lt + ", " + address.lg);
  };
});

angular.module("edison").filter('placeToXY', function() {
  return function(place) {
    var location = place.geometry.location;
    console.log(location)
    return location.lat() + ', ' + location.lng();
  }
});


angular.module("edison").filter('placeToAddress', function() {
  return function(place) {
    var address = function(place) {
      if (place.address_components) {
        var a = place.address_components;
        this.n = a[0] && a[0].short_name;
        this.r = a[1] && a[1].short_name;
        this.cp = a[6] && a[6].short_name;
        this.v = a[2] && a[2].short_name;
      }
      this.lt = place.geometry.location.lat();
      this.lg = place.geometry.location.lng();
    };
    address.prototype.isStreetAddress = (this.n && this.r);
    address.prototype.latLng = this.isStreetAddress ? (this.lt + ', ' + this.lg) : '0, 0'
    
    return new address(place);
  }
});


angular.module("edison").filter('artisanPractice', function(){
  return function(sst, categorie){
    return (sst.categories.indexOf(categorie) > 0);
  }
});
angular.module("edison").filter('categoryFilter', function(){
  return function(sst, categorie){
    return (sst.categories.indexOf(categorie) > 0);
  }
});
angular.module("edison").filter('pricify', function() {
	return function(price) {
		if (price > 800)
			return 900;
		return (price - (price % 100)) + 200;
	}
});
function pad(number) {
  return number < 10 ? '0' + number : number
}
angular.module("edison").filter('relativeDate', function() {

  var minute = 60 * 1000;
  var hour = 60 * minute;
  var day = 24 * hour;
  var week = 7 * day;
  var month = 4 * week;
  var year = 12 * month;

  return function(date) {
    var now = Date.now();
    var date = new Date(date);
    var today = (new Date()).setHours(0, 0, 0, 0);

    var diff = now - date.getTime();
    if (diff < minute)
      return ("à l'instant");
    if (diff < hour)
      return Math.round(diff / minute) + ' minutes';
    if (diff < day) {
      if (date > today) {
        return 'Auj. ' + pad(date.getHours()) + "H" + pad(date.getMinutes());
      } else {
        return 'Hier ' + pad(date.getHours()) + "H" + pad(date.getMinutes());
      }
    }
    if (diff < week)
      return Math.round(diff / day) + ' jours';
    if (diff < month)
      return Math.round(diff / week) + ' semaines'
    if (diff < year)
      return Math.round(diff / week) + ' ans'
  }
});

function getValue(path, origin) {
  if (origin === void 0 || origin === null) origin = self ? self : this;
  if (typeof path !== 'string') path = '' + path;
  var c = '',
    pc, i = 0,
    n = path.length,
    name = '';
  if (n)
    while (i <= n)((c = path[i++]) == '.' || c == '[' || c == ']' || c == void 0) ? (name ? (origin = origin[name], name = '') : (pc == '.' || pc == '[' || pc == ']' && c == ']' ? i = n + 2 : void 0), pc = c) : name += c;
  if (i == n + 2) throw "Invalid path: " + path;
  return origin;
}

function cleanString(str) {
  str = str.toString().toLowerCase();
  str = str.replace(/[éèeê]/g, "e");
  str = str.replace(/[àâ]/g, "a");
  return str;
}

angular.module("edison").filter('tableFilter', function() {
  return function(data, fltr, c) {
    var rtn = [];
    for (x in fltr) {
      fltr[x] = cleanString(fltr[x]);
    }

    for (k in data) {
      if (data[k].id) {
        var psh = true;
        for (x in fltr) {
          var str = data[k][x];
          if (!str || str.length === 0 || cleanString(str).indexOf(fltr[x]) < 0) {
            psh = false;
            break;
          }
        }
        if (psh)
          rtn.push(data[k]);
      }
    }
    console.timeEnd("lol")
    return rtn;
  }
});

angular.module('edison').factory('Address', function() {


  var Address = function(place, copyContructor) {
    if (place.lat && place.lng) {
      this.lt = place.lat;
      this.lg = place.lng;
    } else if (copyContructor) {
      this.getAddressProprieties(place);
      this.streetAddress = true;
    } else if (this.isStreetAddress(place)) {
      this.getPlaceProprieties(place);
    }
    if (place.geometry) {
      this.lt = place.geometry.location.lat();
      this.lg = place.geometry.location.lng();
    }
    this.latLng = this.lt + ', ' + this.lg;
  };

  Address.prototype.getPlaceProprieties = function(place) {
    var a = place.address_components;
    this.n = a[0] && a[0].short_name;
    this.r = a[1] && a[1].short_name;
    this.cp = a[6] && a[6].short_name;
    this.v = a[2] && a[2].short_name;
  }

  Address.prototype.getAddressProprieties = function(address) {
    this.n = address.n,
      this.r = address.r,
      this.cp = address.cp,
      this.v = address.v,
      this.lt = address.lt,
      this.lg = address.lg
  }

  Address.prototype.isStreetAddress = function(place) {
    var noStreet = ["locality", "country", "postal_code", "route", "sublocality"];
    this.streetAddress = (noStreet.indexOf(place.types[0]) < 0);
    return (this.streetAddress);
  }

  Address.prototype.toString = function()  {
    return (this.n + " " + this.r + " " + this.cp + ", " + this.v + ", France")
  }

  return (function(place, copyContructor) {
    return new Address(place, copyContructor);
  })
});

angular.module('edison').factory('edisonAPI', ['$http', '$location', 'dataProvider', 'Upload', function($http, $location, dataProvider, Upload) {

  return {
    listInterventions: function(options) {
      return $http({
        method: 'GET',
        cache: options && options.cache,
        url: '/api/intervention/list'
      }).success(function(result) {
        return result;
      })
    },
    listArtisans: function(options) {
      return $http({
        method: 'GET',
        cache: options && options.cache,
        url: '/api/artisan/list'
      }).success(function(result) {
        return result;
      })
    },
    getArtisans: function(cache) {
      return $http({
        method: 'GET',
        cache: cache,
        url: "/api/search/artisan/{}"
      }).success(function(result) {
        return result;
      });
    },
    getInterventions: function(cache) {
      return $http({
        method: 'GET',
        cache: cache,
        url: '/api/search/intervention/{"limit":1000, "sort":"-id"}'
      }).success(function(result) {
        dataProvider('interventions', result);
        return result;
      });
    },
    getArtisan: function(id, options) {
      return $http({
        method: 'GET',
        cache: options && options.cache,
        url: '/api/artisan/' + id,
        params: options ||  {}
      }).success(function(result) {
        return result;
      });
    },
    getIntervention: function(id, options) {
      return $http({
        method: 'GET',
        cache: options && options.cache,
        url: '/api/intervention/' + id,
        params: options ||  {}
      }).success(function(result) {
        return result;
      });
    },
    getDistance: function(options) {
      return $http({
        method: 'GET',
        cache: true,
        url: '/api/map/direction',
        params: options
      }).success(function(result) {
        return result;
      });
    },
    request: function(options) {
      return $http({
        method: options.method || 'GET',
        url: '/api/' + options.fn,
        params: options.data
      });
    },
    saveIntervention: function(params) {
      return $http({
        method: 'GET',
        url: "/api/intervention/save",
        params: params
      });
    },
    getNearestArtisans: function(address, categorie) {
      return $http({
        method: 'GET',
        url: "/api/artisan/rank",
        cache: false,
        params:  {
          categorie: categorie,
          lat: address.lt,
          lng: address.lg,
          limit: 50,
          maxDistance: 50
        }
      });
    },
    getFilesList: function(id) {
      return $http({
        method: 'GET',
        url: "/api/intervention/" + id + "/getFiles"
      });
    },
    uploadFile: function(file, options) {
      return Upload.upload({
        url: '/api/document/upload',
        fields: options,
        file: file
      })
    },
    getArtisanStats: function(id_sst) {
      return $http({
        method: 'GET',
        url: "/api/artisan/" + id_sst + "/stats"
      });
    },
    absenceArtisan: function(id, options) {
      return $http({
        method: 'GET',
        url: '/api/artisan/' + id + '/absence',
        params: options
      })
    },
    getUser: function(id_sst) {
      return $http({
        method: 'GET',
        url: "/api/whoAmI"
      });
    },
  }
}]);

angular.module('edison').factory('config', [function() {

  var config = {};

  config.filters = {
    all:  {
      short: 'all',
      long: 'Toutes les Inters',
      url: ''
    },
    envoye: {
      short: 'env',
      long: 'Envoyé',
      url: '/envoye'
    },
    aVerifier: {
      short: 'avr',
      long: 'A Vérifier',
      url: '/aVerifier'
    },
    clientaRelancer: {
      short: 'carl',
      long: 'Client A Relancer',
      url: '/clientaRelancer'
    },
    clientaRelancerUrgent: {
      short: 'Ucarl',
      long: 'Client A Relancer Urgent',
      url: '/clientaRelancerUrgent'
    },
    sstaRelancer: {
      short: 'sarl',
      long: 'SST A Relancer',
      url: '/sstaRelancer'
    },
    sstaRelancerUrgent: {
      short: 'Usarl',
      long: 'SST A Relancer Urgent',
      url: '/sstaRelancerUrgent'
    },
  }

  config.civilites = [{
    short_name: 'M.',
    long_name: 'Monsieur'
  }, {
    short_name: 'Mme.',
    long_name: 'Madame'
  }, {
    short_name: 'Soc.',
    long_name: 'Société'
  }];

  config.civilitesTab = ['M.', 'Mme.', 'Soc.'];

  config.categoriesKV = {
    EL: {
      n: 'Electricité',
      c: 'yellow  darken-2 black-text'
    },
    PL: {
      n: 'Plomberie',
      c: 'blue'
    },
    CH: {
      n: 'Chauffage',
      c: 'red'
    },
    CL: {
      n: 'Climatisation',
      c: ' teal darken-3'
    },
    SR: {
      n: 'Serrurerie',
      c: 'brown'
    },
    VT: {
      n: 'Vitrerie',
      c: ' green darken-3'
    },
    CR: {
      n: 'Carrelage',
      c: ''
    },
    MN: {
      n: 'Menuiserie',
      c: ''
    },
    MC: {
      n: 'Maconnerie',
      c: ''
    },
    PT: {
      n: 'Peinture',
      c: ''
    }
  }

  config.fournisseur = [{
    short_name: 'EDISON SERVICES',
    type: 'Fourniture Edison'
  }, {
    short_name: 'CEDEO',
    type: 'Fourniture Artisan'
  }, {
    short_name: 'BROSSETTE',
    type: 'Fourniture Artisan'
  }, {
    short_name: 'REXEL',
    type: 'Fourniture Artisan'
  }, {
    short_name: 'COAXEL',
    type: 'Fourniture Artisan'
  }, {
    short_name: 'YESSS ELECTRIQUE',
    type: 'Fourniture Artisan'
  }, {
    short_name: 'CGED',
    type: 'Fourniture Artisan'
  }, {
    short_name: 'COSTA',
    type: 'Fourniture Artisan'
  }, {
    short_name: 'FORUM DU BATIMENT',
    type: 'Fourniture Artisan'
  }]

  config.categories = [{
    short_name: 'EL',
    long_name: 'Electricité'
  }, {
    short_name: 'PL',
    long_name: 'Plomberie'
  }, {
    short_name: 'CH',
    long_name: 'Chauffage'
  }, {
    short_name: 'CL',
    long_name: 'Climatisation'
  }, {
    short_name: 'SR',
    long_name: 'Serrurerie'
  }, {
    short_name: 'VT',
    long_name: 'Vitrerie'
  }, {
    short_name: 'CR',
    long_name: 'Carrelage'
  }, {
    short_name: 'MN',
    long_name: 'Menuiserie'
  }, {
    short_name: 'MC',
    long_name: 'Maconnerie'
  }, {
    short_name: 'PT',
    long_name: 'Peinture'
  }];

  config.modeDeReglements = [{
    short_name: 'CB',
    long_name: 'Carte Bancaire'
  }, {
    short_name: 'CH',
    long_name: 'Chèque'
  }, {
    short_name: 'CA',
    long_name: 'Espèces'
  }];

  config.typePayeur = [{
    short_name: 'SOC',
    long_name: 'Société'
  }, {
    short_name: 'PRO',
    long_name: 'Propriétaire'
  }, {
    short_name: 'LOC',
    long_name: 'Locataire'
  }, {
    short_name: 'IMO',
    long_name: 'Agence Immobilière'
  }, {
    short_name: 'CUR',
    long_name: 'Curatelle'
  }, {
    short_name: 'AUT',
    long_name: 'Autre'
  }];

  config.status = function(inter) {
    return {
      intervention: config.etatsKV[inter.status]
    }
  }

  return config;

}]);

angular.module('edison').factory('dataProvider', ['socket', '$rootScope', 'config', '_', function(socket, $rootScope, config, _) {

  var dataProvider = function() {
    var _this = this;
    socket.on('interventionListChange', function(data) {
      _this.updateInterventionList(data);
    });
  }
  dataProvider.prototype.setInterventionList = function(data) {
    this.interventionList = data;
  };

  dataProvider.prototype.refreshInterventionListFilter = function(params) {
    var _this = this;

    this.interventionListFiltered = this.interventionList;

    if (this.interventionList && params) {
      if (params.fltr && params.fltr !== 'all' && config.filters[params.fltr]) {
        this.interventionListFiltered = _.filter(this.interventionList, function(e) {
          return e.fltr[config.filters[params.fltr].short];
        })
      } else if (params.artisanID) {
        var artisanID = parseInt(params.artisanID);
        this.interventionListFiltered = _.filter(this.interventionList, function(e) {
          return e.ai === artisanID;
        })
      }
    }
  }

  dataProvider.prototype.updateInterventionList = function(data) {
    var _this = this;
    if (this.interventionList) {
      var index = _.findIndex(this.interventionList, function(e) {
        return e.id === data.id
      });
      _this.interventionList[index] = data;
      $rootScope.$broadcast('InterventionListChange');
    }
  }

  dataProvider.prototype.getInterventionList = function() {
    return this.interventionList;
  }

  return new dataProvider;

}]);

angular.module('edison').factory('dialog', ['$mdDialog', 'edisonAPI', function($mdDialog, edisonAPI) {


  return {
    absence: {
      open: function(id, cb) {
        $mdDialog.show({
          controller: function DialogController($scope, $mdDialog) {
            $scope.absenceTime = 'TODAY';
            $scope.absence = [{
              title: 'Toute la journée',
              value: 'TODAY'
            }, {
              title: '1 Heure',
              value: '1'
            }, {
              title: '2 Heure',
              value: '2'
            }, {
              title: '3 Heure',
              value: '3'
            }, {
              title: '4 Heure',
              value: '4'
            }]
            $scope.hide = function() {
              $mdDialog.hide();
            };
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            $scope.answer = function(answer) {
              $mdDialog.hide(answer);
              var hours = 0;
              if (answer === "TODAY") {
                hours = 23 - (new Date).getHours() + 1;
              } else {
                hours = parseInt(answer);
              }
              start = new Date;
              end = new Date;
              end.setHours(end.getHours() + hours)
              edisonAPI.absenceArtisan(id, {
                start: start,
                end: end
              }).success(cb)
            };
          },
          templateUrl: '/Pages/Intervention/dialogs/absence.html',
        });
      }
    }
  }

}]);

angular.module('edison').factory('_', ['$window',
  function($window) {
    return $window._;
  }
])

angular.module('edison').factory('mapAutocomplete', ['$q', 'Address',
  function($q, Address) {

    var autocomplete = function() {
      this.service = new google.maps.places.AutocompleteService();
      this.geocoder = new google.maps.Geocoder();
    }

    autocomplete.prototype.search = function(input) {
      var deferred = $q.defer();
      this.service.getPlacePredictions({
        input: input,
        componentRestrictions: {
          country: 'fr'
        }
      }, function(predictions, status) {
        deferred.resolve(predictions || []);
      });
      return deferred.promise;
    }

    autocomplete.prototype.getPlaceAddress = function(place) {
      var self = this;
      return $q(function(resolve, reject) {
        self.geocoder.geocode({
          'address': place.description
        }, function(result, status) {
          if (status !== google.maps.places.PlacesServiceStatus.OK)
            return reject(status);
          return resolve(Address(result[0]));
        });

      });
    };

    return new autocomplete;

  }
]);

angular.module('edison').factory('socket', function (socketFactory) {
  return socketFactory();
});
angular.module('edison').factory('tabContainer', ['$location', '$window', '$q', 'edisonAPI','_', function($location, $window, $q, edisonAPI, _) {

  var Tab = function(args) {

    if (typeof args === 'object') {
      //copy constructor
      for (var k in args) {
        this[k] = args[k];
      }
    } else {
      this.url = args;
      this.title = '';
      this.position = null;
      this.deleted = false;
      this._timestamp = Date.now();
    }
  }

  Tab.prototype.setData = function(data) {
    //slice create a copy
    this._data = JSON.parse(JSON.stringify(data));
    this.data = JSON.parse(JSON.stringify(data));
  }

  Tab.prototype.setTitle = function(title) {
    this.title = title;
  }

  var TabContainer = function() {

    var self = this;
    this._tabs = [];
    this.selectedTab = 0;
  }

  TabContainer.prototype.loadSessionTabs = function(currentUrl) {
    var self = this;

    return $q(function(resolve, reject) {
      var currentUrlInSessionTabs = false;
      edisonAPI.request({
        fn: "getSessionData",
      }).then(function(result) {
        self.selectedTab = result.data.selectedTab;
        for (var i = 0; i < result.data._tabs.length; i++) {
          self._tabs.push(new Tab(result.data._tabs[i]))
          if (result.data._tabs[i].url === currentUrl) {
            self.selectedTab = i;
            currentUrlInSessionTabs = true;
          }
        }
        if (!currentUrlInSessionTabs) {
          return reject();
        }
        return resolve();
      }).catch(reject);

    })

  }

  TabContainer.prototype.setFocus = function(tab) {
    this.selectedTab = (typeof tab === 'number' ? tab : tab.position);
  };

  TabContainer.prototype.createTab = function(url, title) {
    var tab = new Tab(url);

    tab.position = this._tabs.length;
    this._tabs.push(tab);
    return (tab);
  }

  TabContainer.prototype.isOpen = function(url) {
    var index = _.findIndex(this._tabs, function(e) {
      return ((!e.deleted && e.url === url));
    });
    return (index >= 0);
  };

  TabContainer.prototype.getTab = function(url) {

    return _.find(this._tabs, function(e) {
      return ((!e.deleted && e.url === url));
    });
  };

  TabContainer.prototype.len = function() {
    var size = 0;

    this._tabs.forEach(function(e, i) {
      size += !e.deleted;
    })
    return (size);
  }

  TabContainer.prototype.getPrevTab = function(tab) {

    for (var i = tab.position - 1; i >= 0; i--) {
      if (this._tabs[i].deleted == false)
        return (this._tabs[i]);
    };

  };

  TabContainer.prototype.remove = function(tab) {
    var newTabs = [];
    var j = 0;

    if (this._tabs.length <= 1) {
      return false;
    }
    var reload = (this.selectedTab == tab.position);
    for (var i = 0; i < this._tabs.length; i++) {
      if (i != tab.position) {
        newTabs.push(this._tabs[i]);
        newTabs[j].position = j;
        ++j;
      }
    };
    this._tabs = newTabs;

    if (this.selectedTab == tab.position && this.selectedTab != 0) {
      this.selectedTab--;
    }
    if (this.selectedTab > tab.position) {
      this.selectedTab--;
    }
    return (reload);
  }

  TabContainer.prototype.getCurrentTab = function() {
    return this._tabs[this.selectedTab];
  }
  TabContainer.prototype.addTab = function(url, options) {
    var tab;
    if (!this.isOpen(url)) {
      tab = this.createTab(url);
    } else {
      tab = this.getTab(url)
    }
    if (!(options && options.setFocus === false)) {
      this.setFocus(tab)
    }
    if (options && options.title) {
      tab.setTitle(options.title);
    }
  }

  return (new TabContainer);

}]);

/*
 * Detects on which browser the user is navigating
 *
 * Usage:
 * var browser = detectBrowser();
 *
 */
angular.module('edison').service('detectBrowser', ['$window',
  function($window) {

    // http://stackoverflow.com/questions/22947535/how-to-detect-browser-using-angular
    return function() {
      var userAgent = $window.navigator.userAgent,
        browsers = {
          chrome: /chrome/i,
          safari: /safari/i,
          firefox: /firefox/i,
          ie: /internet explorer/i
        };

      for (var key in browsers) {
        if (browsers[key].test(userAgent)) {
          return key;
        }
      }

      return 'unknown';
    }
  }
]);

/*
 * Get window height and width
 *
 * Usage:
 * windowDimensions.height();
 * windowDimensions.width();
 *
 */
angular.module('edison').factory('windowDimensions', ['$window', 'detectBrowser',
  function($window, detectBrowser) {
    var browser = detectBrowser();

    return {
      height: function() {
        return (browser === 'safari') ? document.documentElement.clientHeight : window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      },

      width: function() {
        console.log('watchDimensions')
        return (browser === 'safari') ? document.documentElement.clientWidth : window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
      }
    }
  }
]);

/*
 * Watch window resizing event to set new window dimensions,
 * and broadcast the event to the app
 *
 * Usage:
 * <html watch-window-resize>...</html>
 *
 * Bind the resize event:
   $scope.$on('watchWindowResize::resize', function() {
       // Do something
   });
 *
 */
angular.module('edison').directive('watchWindowResize', ['$window', '$timeout', 'windowDimensions',
  function($window, $timeout, windowDimensions) {

    return {
      link: function($scope) {
        // Get window's dimensions
        $scope.getDimensions = function() {

          // Namespacing events with name of directive + event to avoid collisions
          // http://stackoverflow.com/questions/23272169/what-is-the-best-way-to-bind-to-a-global-event-in-a-angularjs-directive
          $scope.$broadcast('watchWindowResize::resize', {
            height: windowDimensions.height(),
            width: windowDimensions.width()
          });
        }

        // On window resize...
        angular.element($window).on('resize', function(e) {

          // Reset timeout
          $timeout.cancel($scope.resizing);

          // Add a timeout to not call the resizing function every pixel
          $scope.resizing = $timeout(function() {

            $scope.getDimensions();
          }, 300);
        });
      }
    }
  }
]);

angular.module('edison').controller('ArtisanController', function(tabContainer, $location, $mdSidenav, $interval, ngDialog, LxNotificationService, edisonAPI, config, $routeParams, $scope, windowDimensions, artisan) {
  $scope.config = config;
  $scope.tab = tabContainer.getCurrentTab();
  var id = parseInt($routeParams.id);

  if (!$scope.tab.data) {
    if ($routeParams.id.length > 12) {
      $scope.tab.isNew = true;
      $scope.tab.setTitle('@' + moment().format("HH:mm").toString());
    } else {
      $scope.tab.setTitle('@' + $routeParams.id);
      if (!artisan) {
        alert("Impossible de trouver les informations !");
        $location.url("/dashboard");
        $scope.tabs.remove($scope.tab);
        return 0;
      }
    }
    $scope.tab.setData(artisan.data);
  }
});

angular.module('edison').controller('DashboardController', function(tabContainer, $location, $scope, $rootScope, interventions, artisans){

	$scope.tab = tabContainer.getCurrentTab();
	$scope.tab.setTitle('dashBoard')
});
angular.module('edison').controller('InterventionMapController', function($scope, $q, $interval, $window, Address, dialog, mapAutocomplete, edisonAPI) {
  $scope.autocomplete = mapAutocomplete;
  if (!$scope.tab.data.client.address) {
    $scope.mapCenter = Address({
      lat: 46.3333,
      lng: 2.6
    });
    $scope.zoom = 6;
  } else {
    if ($scope.tab.data.artisan) {
      $scope.zoom = 12;
      //$scope.tab.data.artisan.address = Address($scope.tab.data.artisan.address, true);
    }
    if ($scope.tab.data.client.address) {
      $scope.tab.data.client.address = Address($scope.tab.data.client.address, true); //true -> copyContructor
      $scope.mapCenter = $scope.tab.data.client.address;
    }
  }


  $scope.showInterMarker = function() {
    if (!$scope.mapCenter ||  !$scope.mapCenter.latLng || !$scope.tab.data.client || !$scope.tab.data.client.address ||  !$scope.tab.data.client.address.latLng) {
      return (false)
    }
    return ($scope.tab.data.client.address.latLng == $scope.mapCenter.latLng);
  }

  $scope.changeAddress = function(place) {
    mapAutocomplete.getPlaceAddress(place).then(function(addr)  {
        $scope.zoom = 12;
        $scope.mapCenter = addr;
        if (addr.streetAddress) {
          $scope.tab.data.client.address = addr;
          $scope.searchText = "lol";
        }
        $scope.searchArtisans();
      },
      function(err) {
        console.log(err);
      })
  }

  $scope.$watch('tab.data.sst', function(id_sst) {
    if (id_sst) {
      $q.all([
        edisonAPI.getArtisan(id_sst, {
          cache: true
        }),
        edisonAPI.getArtisanStats(id_sst, {
          cache: true
        }),
      ]).then(function(result)  {
        $scope.tab.data.artisan = result[0].data;
        $scope.tab.data.artisan.stats = result[1].data;
        if (result[0].data.address) {
          edisonAPI.getDistance({
              origin: result[0].data.address.lt + ", " + result[0].data.address.lg,
              destination: $scope.tab.data.client.address.lt + ", " + $scope.tab.data.client.address.lg
            })
            .then(function(result) {
              $scope.tab.data.artisan.stats.direction = result.data;
            })
        }
      });
    }
  })

  $scope.dialog = dialog;

  $scope.sstAbsence = function(id) {
    dialog.absence.open(id, function() {
       $scope.searchArtisans();
    })
  }

  $scope.showMap = function() {
    $scope.loadMap = true;
  }

  $scope.loadMap = $scope.tab.isNew;

  $scope.getStaticMap = function() {
    var q = "?width=" + $window.outerWidth * 0.8;
    if ($scope.tab.data.client && $scope.tab.data.client.address && $scope.tab.data.client.address.latLng)
      q += ("&origin=" + $scope.tab.data.client.address.latLng);
    if ($scope.tab.data.artisan && $scope.tab.data.artisan.id)
      q += ("&destination=" + $scope.tab.data.artisan.address.lt + "," + $scope.tab.data.artisan.address.lg);
    return "/api/map/staticDirections" + q;
  }
});

angular.module('edison').controller('InterventionController',
  function($scope, $location, $routeParams, ngDialog, LxNotificationService, Upload, tabContainer, edisonAPI, config, intervention, artisans, user) {
    $scope.artisans = artisans.data;
    $scope.config = config;
    $scope.tab = tabContainer.getCurrentTab();
    var id = parseInt($routeParams.id);
    console.log(user);
    if (!$scope.tab.data) {
      $scope.tab.setData(intervention.data);
      $scope.tab.data.sst = intervention.data.artisan ? intervention.data.artisan.id : 0;

      if ($routeParams.id.length > 12) {
        $scope.tab.isNew = true;
        $scope.tab.data.tmpID =  $routeParams.id;
        $scope.tab.setTitle('#' + moment((new Date(parseInt($scope.tab.data.tmpID))).toISOString()).format("HH:mm").toString());
      } else {
        $scope.tab.setTitle('#' + $routeParams.id);
        if (!intervention) {
          alert("Impossible de trouver les informations !");
          $location.url("/dashboard");
          $scope.tabs.remove($scope.tab);
          return 0;
        }
      }
    }
    $scope.showMap = false;
    $scope.www = artisans.data;
    console.log(artisans.data)
    $scope.ben = [{
    "lat": 46.209118,
    "lng": 5.2040304
}, {
    "lat": 46.3580032,
    "lng": 6.1344328
}, {
    "lat": 45.964308,
    "lng": 5.742393
}, {
    "lat": 49.575967,
    "lng": 4.496606
}, {
    "lat": 45.5066043,
    "lng": 4.187342000000001
}, {
    "lat": 43.79519759999999,
    "lng": 6.776322599999999
}, {
    "lat": 44.0623542,
    "lng": 6.126275
}, {
    "lat": 43.9286774,
    "lng": 5.8869538
}, {
    "lat": 43.2536311,
    "lng": 2.9128424
}, {
    "lat": 44.536949,
    "lng": 5.832837899999999
}, {
    "lat": 44.2366602,
    "lng": 5.946136
}, {
    "lat": 44.3133136,
    "lng": 5.838972999999999
}, {
    "lat": 38.7035471,
    "lng": -9.3966038
}, {
    "lat": 38.7035471,
    "lng": -9.3966038
}, {
    "lat": 38.7035471,
    "lng": -9.3966038
}, {
    "lat": 38.7035471,
    "lng": -9.3966038
}, {
    "lat": 43.798422,
    "lng": 7.364837
}, {
    "lat": 43.7089298,
    "lng": 6.999354800000001
}, {
    "lat": 44.238438,
    "lng": 5.314896999999999
}, {
    "lat": 43.5493921,
    "lng": 6.977682799999999
}, {
    "lat": 43.5709091,
    "lng": 7.1115107
}, {
    "lat": 43.6779982,
    "lng": 7.1490296
}, {
    "lat": 38.7035471,
    "lng": -9.3966038
}, {
    "lat": 38.7035471,
    "lng": -9.3966038
}, {
    "lat": 43.357663,
    "lng": 5.776195
}, {
    "lat": 44.26442,
    "lng": 5.940688
}, {
    "lat": 48.948791,
    "lng": 2.358939
}, {
    "lat": 38.7035471,
    "lng": -9.3966038
}, {
    "lat": 43.6203186,
    "lng": 6.9692969
}, {
    "lat": -31.4607006,
    "lng": -64.20853389999999
}, {
    "lat": 29.5516105,
    "lng": 34.9623225
}, {
    "lat": 29.5516105,
    "lng": 34.9623225
}, {
    "lat": 29.5516105,
    "lng": 34.9623225
}, {
    "lat": 45.357702,
    "lng": 3.516894
}, {
    "lat": 43.7165668,
    "lng": 7.1532988
}, {
    "lat": 44.61775799999999,
    "lng": 4.391492
}, {
    "lat": 45.2404959,
    "lng": 4.7123145
}, {
    "lat": 46.673855,
    "lng": 0.8645520000000001
}, {
    "lat": 48.2973451,
    "lng": 4.0744009
}, {
    "lat": 48.336422,
    "lng": 4.032719
}, {
    "lat": 43.212161,
    "lng": 2.353663
}, {
    "lat": 43.212161,
    "lng": 2.353663
}, {
    "lat": 43.184277,
    "lng": 3.003078
}, {
    "lat": 43.184277,
    "lng": 3.003078
}, {
    "lat": 43.317118,
    "lng": 1.95333
}, {
    "lat": 43.2570369,
    "lng": 2.947553
}, {
    "lat": 44.100575,
    "lng": 3.077801
}, {
    "lat": 44.560317,
    "lng": 2.25183
}, {
    "lat": 44.37948069999999,
    "lng": 2.5891648
}, {
    "lat": 43.300771,
    "lng": 5.3821768
}, {
    "lat": 43.3174701,
    "lng": 5.3599355
}, {
    "lat": 43.305868,
    "lng": 5.4018087
}, {
    "lat": 43.2916612,
    "lng": 5.3965729
}, {
    "lat": 43.2875818,
    "lng": 5.380868299999999
}, {
    "lat": 43.2839895,
    "lng": 5.3547034
}, {
    "lat": 43.25424,
    "lng": 5.3819969
}, {
    "lat": 43.25424,
    "lng": 5.3819969
}, {
    "lat": 43.25424,
    "lng": 5.3819969
}, {
    "lat": 43.25424,
    "lng": 5.3819969
}, {
    "lat": 43.2290357,
    "lng": 5.4463322
}, {
    "lat": 43.2290357,
    "lng": 5.4463322
}, {
    "lat": 43.2290357,
    "lng": 5.4463322
}, {
    "lat": 43.28489159999999,
    "lng": 5.488267899999999
}, {
    "lat": 43.3071618,
    "lng": 5.4253757
}, {
    "lat": 43.3649321,
    "lng": 5.4253757
}, {
    "lat": 43.3649321,
    "lng": 5.4253757
}, {
    "lat": 43.3649321,
    "lng": 5.4253757
}, {
    "lat": 43.3426011,
    "lng": 5.38872
}, {
    "lat": 43.3426011,
    "lng": 5.38872
}, {
    "lat": 43.5388336,
    "lng": 5.4044268
}, {
    "lat": 43.5388336,
    "lng": 5.4044268
}, {
    "lat": 43.5338335,
    "lng": 5.509246999999999
}, {
    "lat": 43.37687400000001,
    "lng": 5.605345
}, {
    "lat": 43.410272,
    "lng": 5.308922
}, {
    "lat": 43.6017739,
    "lng": 4.624375100000001
}, {
    "lat": 43.4413816,
    "lng": 4.789873099999999
}, {
    "lat": 43.640199,
    "lng": 5.097022
}, {
    "lat": 43.369174,
    "lng": 5.631362999999999
}, {
    "lat": 43.2926781,
    "lng": 5.5676425
}, {
    "lat": 43.2926781,
    "lng": 5.5676425
}, {
    "lat": 43.65399499999999,
    "lng": 5.261712000000001
}, {
    "lat": 43.446909,
    "lng": 5.684154899999999
}, {
    "lat": 43.486821,
    "lng": 5.495122
}, {
    "lat": 43.17365299999999,
    "lng": 5.605155
}, {
    "lat": 43.17365299999999,
    "lng": 5.605155
}, {
    "lat": 43.330673,
    "lng": 5.151575999999999
}, {
    "lat": 43.4537819,
    "lng": 5.560919
}, {
    "lat": 43.420234,
    "lng": 5.236007
}, {
    "lat": 43.369912,
    "lng": 5.252998
}, {
    "lat": 43.5212157,
    "lng": 4.9454803
}, {
    "lat": 49.0178749,
    "lng": -0.031555
}, {
    "lat": 44.930953,
    "lng": 2.444997
}, {
    "lat": 45.7148899,
    "lng": 0.205213
}, {
    "lat": 46.01405399999999,
    "lng": 0.668317
}, {
    "lat": 47.099779,
    "lng": 2.372956
}, {
    "lat": 45.159555,
    "lng": 1.533937
}, {
    "lat": 45.5367,
    "lng": 2.1465519
}, {
    "lat": 45.169889,
    "lng": 1.564005
}, {
    "lat": 45.093356,
    "lng": 1.93755
}, {
    "lat": 47.322047,
    "lng": 5.04148
}, {
    "lat": 47.322047,
    "lng": 5.04148
}, {
    "lat": 47.34985,
    "lng": 5.022149
}, {
    "lat": 47.193543,
    "lng": 5.388925
}, {
    "lat": 47.102266,
    "lng": 5.262805999999999
}, {
    "lat": 47.02603000000001,
    "lng": 4.840004
}, {
    "lat": 47.294216,
    "lng": 5.001189999999999
}, {
    "lat": 47.624329,
    "lng": 4.337495
}, {
    "lat": 48.51418,
    "lng": -2.765835
}, {
    "lat": 48.732084,
    "lng": -3.459144
}, {
    "lat": 48.611355,
    "lng": -3.473584
}, {
    "lat": 44.890891,
    "lng": 1.217292
}, {
    "lat": 45.00885,
    "lng": 0.162779
}, {
    "lat": 47.237829,
    "lng": 6.024053899999999
}, {
    "lat": 47.237829,
    "lng": 6.024053899999999
}, {
    "lat": 47.237829,
    "lng": 6.024053899999999
}, {
    "lat": 47.262235,
    "lng": 6.0459
}, {
    "lat": 46.9041039,
    "lng": 6.354241999999999
}, {
    "lat": 47.497803,
    "lng": 6.833282000000001
}, {
    "lat": 47.05698,
    "lng": 6.604106
}, {
    "lat": 47.225555,
    "lng": 6.116118
}, {
    "lat": 44.933393,
    "lng": 4.89236
}, {
    "lat": 44.933393,
    "lng": 4.89236
}, {
    "lat": 44.89934,
    "lng": 5.020312
}, {
    "lat": 44.89934,
    "lng": 5.020312
}, {
    "lat": 44.556944,
    "lng": 4.749496
}, {
    "lat": 45.040419,
    "lng": 5.050948
}, {
    "lat": 44.7282749,
    "lng": 5.024071999999999
}, {
    "lat": 44.875215,
    "lng": 4.884814
}, {
    "lat": 48.439575,
    "lng": 1.466895
}, {
    "lat": 47.997542,
    "lng": -4.097899
}, {
    "lat": 47.997542,
    "lng": -4.097899
}, {
    "lat": 48.57208,
    "lng": -4.32229
}, {
    "lat": 45.9797534,
    "lng": 14.4886977
}, {
    "lat": 48.510131,
    "lng": -4.073265
}, {
    "lat": 47.902874,
    "lng": -4.282634
}, {
    "lat": 47.855448,
    "lng": -3.852671
}, {
    "lat": 44.05483,
    "lng": 4.699936
}, {
    "lat": 43.831502,
    "lng": 4.49726
}, {
    "lat": 44.261034,
    "lng": 4.648079
}, {
    "lat": 43.765169,
    "lng": 4.286233999999999
}, {
    "lat": 43.8333998,
    "lng": 4.3256918
}, {
    "lat": 43.804678,
    "lng": 4.228438
}, {
    "lat": 43.6046256,
    "lng": 1.444205
}, {
    "lat": 43.6046256,
    "lng": 1.444205
}, {
    "lat": 43.5618224,
    "lng": 1.3951694
}, {
    "lat": 43.5618224,
    "lng": 1.3951694
}, {
    "lat": 42.788963,
    "lng": 0.592943
}, {
    "lat": 43.679151,
    "lng": 1.392018
}, {
    "lat": 43.6381666,
    "lng": 1.4338047
}, {
    "lat": 43.65719199999999,
    "lng": 1.484186
}, {
    "lat": 43.458611,
    "lng": 2.004573
}, {
    "lat": 43.5611027,
    "lng": 1.4531355
}, {
    "lat": 43.5611027,
    "lng": 1.4531355
}, {
    "lat": 43.355368,
    "lng": 1.275022
}, {
    "lat": 43.6040202,
    "lng": 1.4773114
}, {
    "lat": 43.10522,
    "lng": 0.7856689
}, {
    "lat": 43.849456,
    "lng": 0.6632439
}, {
    "lat": 44.652297,
    "lng": -1.1785016
}, {
    "lat": 44.811257,
    "lng": -0.7822089999999999
}, {
    "lat": 44.7799813,
    "lng": -0.5672574
}, {
    "lat": 44.857738,
    "lng": -0.530906
}, {
    "lat": 44.8535732,
    "lng": -0.6156794000000001
}, {
    "lat": 44.99456,
    "lng": -0.445865
}, {
    "lat": 44.802614,
    "lng": -0.588054
}, {
    "lat": 44.8817329,
    "lng": -0.42852
}, {
    "lat": 44.920034,
    "lng": -0.361672
}, {
    "lat": 45.027155,
    "lng": -0.798488
}, {
    "lat": 44.743536,
    "lng": -1.102449
}, {
    "lat": 44.80583,
    "lng": -0.630386
}, {
    "lat": 44.8448769,
    "lng": -0.656358
}, {
    "lat": 44.8448769,
    "lng": -0.656358
}, {
    "lat": 43.59685959999999,
    "lng": 3.8502617
}, {
    "lat": 43.59685959999999,
    "lng": 3.8502617
}, {
    "lat": 43.6348676,
    "lng": 3.8604402
}, {
    "lat": 43.3148346,
    "lng": 3.1383661
}, {
    "lat": 43.344233,
    "lng": 3.215795
}, {
    "lat": 43.344233,
    "lng": 3.215795
}, {
    "lat": 43.344233,
    "lng": 3.215795
}, {
    "lat": 43.647718,
    "lng": 3.797514
}, {
    "lat": 48.101097,
    "lng": -1.795384
}, {
    "lat": 48.153561,
    "lng": -1.683146
}, {
    "lat": 47.388309,
    "lng": 0.658258
}, {
    "lat": 45.18942980000001,
    "lng": 5.7165413
}, {
    "lat": 45.18942980000001,
    "lng": 5.7165413
}, {
    "lat": 45.613538,
    "lng": 5.150093
}, {
    "lat": 45.142151,
    "lng": 5.718033999999999
}, {
    "lat": 45.344334,
    "lng": 4.817731000000001
}, {
    "lat": 45.393794,
    "lng": 5.260022
}, {
    "lat": 45.346157,
    "lng": 5.078346
}, {
    "lat": 45.248534,
    "lng": 5.828113
}, {
    "lat": 44.9249986,
    "lng": 5.7597418
}, {
    "lat": 45.221686,
    "lng": 5.795234000000001
}, {
    "lat": 45.218107,
    "lng": 5.86065
}, {
    "lat": 45.503532,
    "lng": 5.139305999999999
}, {
    "lat": 45.056206,
    "lng": 5.669119999999999
}, {
    "lat": 45.7173484,
    "lng": 5.447137199999999
}, {
    "lat": 45.051951,
    "lng": 6.030063999999999
}, {
    "lat": 45.192754,
    "lng": 5.688211
}, {
    "lat": 45.634915,
    "lng": 5.562628
}, {
    "lat": 45.578041,
    "lng": 4.812652
}, {
    "lat": 45.284906,
    "lng": 5.882982999999999
}, {
    "lat": 46.671361,
    "lng": 5.550796
}, {
    "lat": 47.09534,
    "lng": 5.49081
}, {
    "lat": 46.387405,
    "lng": 5.867765899999999
}, {
    "lat": 46.746091,
    "lng": 5.905724999999999
}, {
    "lat": 47.49923,
    "lng": 1.175105
}, {
    "lat": 45.450626,
    "lng": 4.3859432
}, {
    "lat": 45.450626,
    "lng": 4.3859432
}, {
    "lat": 45.430262,
    "lng": 4.4248877
}, {
    "lat": 45.7436262,
    "lng": 4.223236500000001
}, {
    "lat": 45.404462,
    "lng": 4.372446
}, {
    "lat": 45.50067300000001,
    "lng": 4.242463
}, {
    "lat": 46.159599,
    "lng": 4.172521
}, {
    "lat": 45.473518,
    "lng": 4.379554
}, {
    "lat": 46.034432,
    "lng": 4.072695
}, {
    "lat": 45.590322,
    "lng": 4.318391
}, {
    "lat": 45.607143,
    "lng": 4.082572
}, {
    "lat": 45.387638,
    "lng": 4.287617
}, {
    "lat": 48.3010676,
    "lng": -1.2833599
}, {
    "lat": 45.042768,
    "lng": 3.882936
}, {
    "lat": 45.295564,
    "lng": 3.386482
}, {
    "lat": 45.369468,
    "lng": 4.200829
}, {
    "lat": 45.030028,
    "lng": 3.875883
}, {
    "lat": 47.2185047,
    "lng": -1.5446583
}, {
    "lat": 47.29957599999999,
    "lng": -1.550638
}, {
    "lat": 47.2734979,
    "lng": -2.213848
}, {
    "lat": 47.210335,
    "lng": -1.651444
}, {
    "lat": 48.014736,
    "lng": 2.73203
}, {
    "lat": 47.97534599999999,
    "lng": 2.768125
}, {
    "lat": 47.93335,
    "lng": 2.926589
}, {
    "lat": 44.4475229,
    "lng": 1.441989
}, {
    "lat": 44.893626,
    "lng": 1.478613
}, {
    "lat": 44.2035321,
    "lng": 0.6251540999999999
}, {
    "lat": 44.532748,
    "lng": 0.767717
}, {
    "lat": 44.4082053,
    "lng": 0.7072568
}, {
    "lat": 44.49736799999999,
    "lng": 0.9707429999999999
}, {
    "lat": 44.1762257,
    "lng": 0.5945052
}, {
    "lat": 44.1749628,
    "lng": 0.6441101
}, {
    "lat": 47.478419,
    "lng": -0.5631659999999999
}, {
    "lat": 47.478419,
    "lng": -0.5631659999999999
}, {
    "lat": 47.059407,
    "lng": -0.879787
}, {
    "lat": 48.8516917,
    "lng": -1.5722394
}, {
    "lat": 48.838032,
    "lng": -1.221714
}, {
    "lat": 48.113748,
    "lng": 5.1392559
}, {
    "lat": 48.773605,
    "lng": 5.158238000000001
}, {
    "lat": 48.773605,
    "lng": 5.158238000000001
}, {
    "lat": 47.7482524,
    "lng": -3.3702449
}, {
    "lat": 47.810173,
    "lng": -2.383339
}, {
    "lat": 47.482133,
    "lng": -3.121053
}, {
    "lat": 47.7651619,
    "lng": -2.1312
}, {
    "lat": 47.915138,
    "lng": -3.334565
}, {
    "lat": 47.735695,
    "lng": -3.42714
}, {
    "lat": 47.58469299999999,
    "lng": -3.077786
}, {
    "lat": 47.347009,
    "lng": -3.156406
}, {
    "lat": 47.347009,
    "lng": -3.156406
}, {
    "lat": 47.527684,
    "lng": -2.768463
}, {
    "lat": 47.76349399999999,
    "lng": -3.347354
}, {
    "lat": 46.99089600000001,
    "lng": 3.162845
}, {
    "lat": 50.6927049,
    "lng": 3.177847
}, {
    "lat": 50.725231,
    "lng": 1.613334
}, {
    "lat": 45.771264,
    "lng": 3.1198023
}, {
    "lat": 45.771264,
    "lng": 3.1198023
}, {
    "lat": 45.7950636,
    "lng": 3.1172305
}, {
    "lat": 43.2951,
    "lng": -0.370797
}, {
    "lat": 43.315739,
    "lng": -0.411051
}, {
    "lat": 43.315739,
    "lng": -0.411051
}, {
    "lat": 43.481402,
    "lng": -1.514699
}, {
    "lat": 43.2052229,
    "lng": 0.07356689999999999
}, {
    "lat": 42.6886591,
    "lng": 2.8948332
}, {
    "lat": 42.706091,
    "lng": 3.009898
}, {
    "lat": 42.606203,
    "lng": 3.006674
}, {
    "lat": 42.50250500000001,
    "lng": 2.0779169
}, {
    "lat": 47.591057,
    "lng": 7.574328699999999
}, {
    "lat": 47.728415,
    "lng": 7.415866
}, {
    "lat": 45.75826,
    "lng": 4.855386999999999
}, {
    "lat": 45.7304251,
    "lng": 4.8399378
}, {
    "lat": 45.7304251,
    "lng": 4.8399378
}, {
    "lat": 45.7304251,
    "lng": 4.8399378
}, {
    "lat": 45.7304251,
    "lng": 4.8399378
}, {
    "lat": 45.7315386,
    "lng": 4.869616499999999
}, {
    "lat": 45.7315386,
    "lng": 4.869616499999999
}, {
    "lat": 45.7699424,
    "lng": 4.8037184
}, {
    "lat": 45.7699424,
    "lng": 4.8037184
}, {
    "lat": 45.771944,
    "lng": 4.8901709
}, {
    "lat": 45.771944,
    "lng": 4.8901709
}, {
    "lat": 45.735237,
    "lng": 4.804827
}, {
    "lat": 45.782029,
    "lng": 4.922661
}, {
    "lat": 45.761337,
    "lng": 4.776921
}, {
    "lat": 45.761337,
    "lng": 4.776921
}, {
    "lat": 45.699594,
    "lng": 4.8844649
}, {
    "lat": 45.699594,
    "lng": 4.8844649
}, {
    "lat": 45.991471,
    "lng": 4.718821
}, {
    "lat": 45.619722,
    "lng": 4.6730292
}, {
    "lat": 45.73331599999999,
    "lng": 4.911926999999999
}, {
    "lat": 43.276732,
    "lng": 6.168039
}, {
    "lat": 45.691243,
    "lng": 5.028886
}, {
    "lat": 45.644571,
    "lng": 5.010241
}, {
    "lat": 45.6629628,
    "lng": 4.9532038
}, {
    "lat": 47.456876,
    "lng": 5.584124
}, {
    "lat": 47.425273,
    "lng": 6.069262999999999
}, {
    "lat": 47.8168409,
    "lng": 6.381111
}, {
    "lat": 47.890926,
    "lng": 6.326187
}, {
    "lat": 46.780764,
    "lng": 4.853947
}, {
    "lat": 46.910567,
    "lng": 4.753217999999999
}, {
    "lat": 46.769682,
    "lng": 4.452304
}, {
    "lat": 46.67413,
    "lng": 4.362979
}, {
    "lat": 48.076935,
    "lng": 0.300514
}, {
    "lat": 45.692341,
    "lng": 5.908998
}, {
    "lat": 45.675535,
    "lng": 6.392726
}, {
    "lat": 45.275403,
    "lng": 6.344886
}, {
    "lat": 45.201491,
    "lng": 6.67292
}, {
    "lat": 45.8971718,
    "lng": 6.1251614
}, {
    "lat": 46.19325300000001,
    "lng": 6.234158
}, {
    "lat": 45.8457128,
    "lng": 6.619911699999999
}, {
    "lat": 46.373565,
    "lng": 6.477634999999999
}, {
    "lat": 46.18468499999999,
    "lng": 6.208959
}, {
    "lat": 46.1472759,
    "lng": 6.410160899999999
}, {
    "lat": 45.96093,
    "lng": 6.0416679
}, {
    "lat": 45.923697,
    "lng": 6.869433
}, {
    "lat": 46.401488,
    "lng": 6.590948999999999
}, {
    "lat": 45.8890357,
    "lng": 6.102035799999999
}, {
    "lat": 46.109625,
    "lng": 6.264520999999999
}, {
    "lat": 45.9192139,
    "lng": 6.141949899999999
}, {
    "lat": 45.907737,
    "lng": 6.106676999999999
}, {
    "lat": 48.8293647,
    "lng": 2.4265406
}, {
    "lat": 48.830759,
    "lng": 2.359204
}, {
    "lat": 48.8421616,
    "lng": 2.2927665
}, {
    "lat": 48.8421616,
    "lng": 2.2927665
}, {
    "lat": 48.8421616,
    "lng": 2.2927665
}, {
    "lat": 48.8530933,
    "lng": 2.2487626
}, {
    "lat": 48.8530933,
    "lng": 2.2487626
}, {
    "lat": 48.89061359999999,
    "lng": 2.3867083
}, {
    "lat": 48.8599825,
    "lng": 2.4066412
}, {
    "lat": 48.8599825,
    "lng": 2.4066412
}, {
    "lat": 49.836447,
    "lng": 0.859934
}, {
    "lat": 48.8343936,
    "lng": 2.6811889
}, {
    "lat": 48.9562018,
    "lng": 2.8884657
}, {
    "lat": 48.267043,
    "lng": 2.692611
}, {
    "lat": 48.8215519,
    "lng": 2.7047469
}, {
    "lat": 48.18081129999999,
    "lng": -1.6319539
}, {
    "lat": 48.90202499999999,
    "lng": 2.813534
}, {
    "lat": 48.43092499999999,
    "lng": 2.764365
}, {
    "lat": 48.741829,
    "lng": 2.053208
}, {
    "lat": 48.741829,
    "lng": 2.053208
}, {
    "lat": 49.0058719,
    "lng": 1.896887
}, {
    "lat": 48.929584,
    "lng": 2.046982
}, {
    "lat": 48.929584,
    "lng": 2.046982
}, {
    "lat": 48.912375,
    "lng": 2.1776585
}, {
    "lat": 48.787755,
    "lng": 1.819789
}, {
    "lat": 48.979048,
    "lng": 2.051033
}, {
    "lat": 48.947545,
    "lng": 2.1423899
}, {
    "lat": 48.926916,
    "lng": 2.18888
}, {
    "lat": 46.323716,
    "lng": -0.4647769999999999
}, {
    "lat": 46.3522327,
    "lng": -0.3830973
}, {
    "lat": 46.609637,
    "lng": -0.235316
}, {
    "lat": 49.875919,
    "lng": 2.384894
}, {
    "lat": 49.9003609,
    "lng": 2.503762
}, {
    "lat": 43.9250853,
    "lng": 2.1486413
}, {
    "lat": 43.9250853,
    "lng": 2.1486413
}, {
    "lat": 43.606214,
    "lng": 2.241295
}, {
    "lat": 43.70736,
    "lng": 2.691618
}, {
    "lat": 44.0221252,
    "lng": 1.3529599
}, {
    "lat": 44.10485200000001,
    "lng": 1.08468
}, {
    "lat": 44.108057,
    "lng": 0.890241
}, {
    "lat": 43.88330999999999,
    "lng": 0.9885109999999999
}, {
    "lat": 43.1146883,
    "lng": 5.9488975
}, {
    "lat": 43.128083,
    "lng": 5.9700399
}, {
    "lat": 43.118021,
    "lng": 5.801435
}, {
    "lat": 43.118021,
    "lng": 5.801435
}, {
    "lat": 43.329229,
    "lng": 6.045799
}, {
    "lat": 43.0944835,
    "lng": 5.824835200000001
}, {
    "lat": 43.136418,
    "lng": 5.754186
}, {
    "lat": 43.13824,
    "lng": 5.987584399999999
}, {
    "lat": 43.40655,
    "lng": 6.061186999999999
}, {
    "lat": 43.124228,
    "lng": 5.928
}, {
    "lat": 43.191199,
    "lng": 6.041983999999999
}, {
    "lat": 43.106933,
    "lng": 6.018687
}, {
    "lat": 43.151682,
    "lng": 6.342201999999999
}, {
    "lat": 43.138622,
    "lng": 6.235208
}, {
    "lat": 43.138622,
    "lng": 6.235208
}, {
    "lat": 43.1826409,
    "lng": 5.709571
}, {
    "lat": 43.1826409,
    "lng": 5.709571
}, {
    "lat": 43.096777,
    "lng": 6.072284
}, {
    "lat": 43.198331,
    "lng": 5.802294
}, {
    "lat": 43.237875,
    "lng": 6.072199899999999
}, {
    "lat": 43.107465,
    "lng": 6.131492799999999
}, {
    "lat": 43.107465,
    "lng": 6.131492799999999
}, {
    "lat": 43.472036,
    "lng": 6.566574999999999
}, {
    "lat": 43.102976,
    "lng": 5.878219
}, {
    "lat": 43.493236,
    "lng": 6.361556999999999
}, {
    "lat": 43.72607499999999,
    "lng": 5.812819999999999
}, {
    "lat": 43.228355,
    "lng": 6.585578
}, {
    "lat": 43.43315200000001,
    "lng": 6.737034
}, {
    "lat": 43.42316,
    "lng": 6.749713
}, {
    "lat": 43.43315200000001,
    "lng": 6.737034
}, {
    "lat": 43.43315200000001,
    "lng": 6.737034
}, {
    "lat": 43.563768,
    "lng": 6.231328
}, {
    "lat": 43.42519,
    "lng": 6.76837
}, {
    "lat": 43.94700419999999,
    "lng": 4.8209596
}, {
    "lat": 43.9527568,
    "lng": 4.8159257
}, {
    "lat": 44.1380989,
    "lng": 4.807511
}, {
    "lat": 46.50436,
    "lng": -1.738692
}, {
    "lat": 46.555152,
    "lng": -1.0587819
}, {
    "lat": 46.424169,
    "lng": -1.4886839
}, {
    "lat": 46.58022400000001,
    "lng": 0.340375
}, {
    "lat": 46.6218618,
    "lng": 0.3070971
}, {
    "lat": 45.8162774,
    "lng": 1.2623048
}, {
    "lat": 45.8162774,
    "lng": 1.2623048
}, {
    "lat": 45.738677,
    "lng": 1.742153
}, {
    "lat": 45.877448,
    "lng": 1.238798
}, {
    "lat": 45.835537,
    "lng": 1.306352
}, {
    "lat": 45.512429,
    "lng": 1.2036579
}, {
    "lat": 48.172402,
    "lng": 6.449403
}, {
    "lat": 47.798202,
    "lng": 3.573781
}, {
    "lat": 47.48822,
    "lng": 3.907721999999999
}, {
    "lat": 48.08520499999999,
    "lng": 3.294579
}, {
    "lat": 48.63263999999999,
    "lng": 2.312884
}, {
    "lat": 48.656473,
    "lng": 2.385166
}, {
    "lat": 48.904526,
    "lng": 2.304768
}, {
    "lat": 48.904526,
    "lng": 2.304768
}, {
    "lat": 48.869798,
    "lng": 2.219033
}, {
    "lat": 48.796696,
    "lng": 2.31002
}, {
    "lat": 48.808026,
    "lng": 2.192418
}, {
    "lat": 48.936616,
    "lng": 2.324789
}, {
    "lat": 48.914155,
    "lng": 2.285369
}, {
    "lat": 48.894533,
    "lng": 2.40963
}, {
    "lat": 47.9391821,
    "lng": 1.2101783
}, {
    "lat": 48.757205,
    "lng": 2.326243
}, {
    "lat": 48.753882,
    "lng": 2.505875
}, {
    "lat": 48.762541,
    "lng": 2.4088759
}, {
    "lat": 48.801148,
    "lng": 2.429443
}, {
    "lat": 48.792716,
    "lng": 2.359279
}, {
    "lat": 48.9472096,
    "lng": 2.2466847
}, {
    "lat": 49.048606,
    "lng": 2.01199
}, {
    "lat": 48.975751,
    "lng": 2.3272339
}, {
    "lat": 48.973526,
    "lng": 2.201292
}, {
    "lat": 49.112288,
    "lng": 2.217872
}, {
    "lat": 49.007379,
    "lng": 2.387981
}, {
    "lat": 42.6886591,
    "lng": 2.8948332
}, {
    "lat": 49.1193074,
    "lng": 6.1757236
}, {
    "lat": 45.876133,
    "lng": 4.8410209
}, {
    "lat": 48.9318839,
    "lng": 2.579918
}, {
    "lat": 45.1729516,
    "lng": 5.6703133
}, {
    "lat": 48.941345,
    "lng": 2.46436
}, {
    "lat": 48.85433450000001,
    "lng": 2.3134029
}, {
    "lat": 48.4779709,
    "lng": 3.123497
}, {
    "lat": 48.7980422,
    "lng": 2.4800862
}, {
    "lat": 45.650631,
    "lng": 5.470497000000001
}, {
    "lat": 46.168785,
    "lng": -1.119056
}]


    $scope.addComment = function() {
      console.log($scope.commentText)
      $scope.tab.data.comments.push({
        login: user.data.login,
        text: $scope.commentText,
        date: new Date()
      })
      $scope.commentText = "";
    }

    $scope.onFileUpload = function(file) {
      if (file) {
        edisonAPI.uploadFile(file, {
          link: $scope.tab.data.id || $scope.tab.data.tmpID,
          model: 'intervention',
          type: 'fiche'
        }).success(function() {
          $scope.fileUploadText = "";
          $scope.loadFilesList();
        })
      }
    }

    $scope.loadFilesList = function() {
      edisonAPI.getFilesList($scope.tab.data.id || $scope.tab.data.tmpID).then(function(result) {
        $scope.files = result.data;
      }, console.log)
    }
    $scope.loadFilesList();


    $scope.saveInter = function(options) {
      edisonAPI.saveIntervention({
        options: options,
        data: $scope.tab.data
      }).then(function(data) {
        LxNotificationService.success("L'intervention " + data.data + " à été enregistré");
        $location.url("/interventions");
        $scope.tabs.remove($scope.tab);
      }).catch(function(response) {
        LxNotificationService.error(response.data);
      });
    }

    $scope.clickOnArtisanMarker = function(event, sst) {
      $scope.tab.data.sst = sst.id;
    }

    $scope.searchArtisans = function() {
      console.log("search");
      edisonAPI.getNearestArtisans($scope.tab.data.client.address, $scope.tab.data.categorie)
        .success(function(result) {
          $scope.nearestArtisans = result;
        });
    }
    if ($scope.tab.data.client.address)
      $scope.searchArtisans();


  });

angular.module('edison').controller('InterventionsController', function(tabContainer, $window, edisonAPI, dataProvider, $routeParams, $location, $scope, $q, $rootScope, $filter, config, ngTableParams, interventions) {
  $scope.tab = tabContainer.getCurrentTab();

  $scope.recap = $routeParams.artisanID;
  if ($scope.recap) {
    $scope.tab.setTitle("Recap@" + $routeParams.artisanID)

    $scope.data = [
  {label: "Four", value: 44, color: "#F44336"},
  {label: "Five", value: 55, color: "#ff9800"},
  {label: "Six", value: 66, color: "#00C853"}
    ];
    $scope.options = {thickness: 200};
  } else {
      $scope.tab.setTitle($routeParams.fltr ? config.filters[$routeParams.fltr].long : 'Interventions');
  }
  $scope.api = edisonAPI;
  $scope.config = config;
  $scope.dataProvider = dataProvider;

  if (!$scope.dataProvider.getInterventionList()) {
    $scope.dataProvider.setInterventionList(interventions.data);
  }

  $scope.dataProvider.refreshInterventionListFilter($routeParams);

  var tableParameters = {
    page: 1, // show first page
    total: $scope.dataProvider.interventionListFiltered.length,
    filter: {},
    count: 100 // count per page
  };
  var tableSettings = {
    //groupBy:$rootScope.config.selectedGrouping,
    total: $scope.dataProvider.interventionListFiltered,
    getData: function($defer, params) {
      var data = $scope.dataProvider.interventionListFiltered;
      data = $filter('tableFilter')(data, params.filter());
      params.total(data.length);
      data = $filter('orderBy')(data, params.orderBy());
      $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
    },
    filterDelay: 150
  }
  $scope.tableParams = new ngTableParams(tableParameters, tableSettings);

  $rootScope.$on('InterventionListChange', function() {
    $scope.dataProvider.refreshInterventionListFilter($routeParams);
    $scope.tableParams.reload();
  })

  $scope.getStaticMap = function(inter) {
    q = "?width=500&height=250&precision=0&zoom=10&origin=" + inter.client.address.lt + ", " + inter.client.address.lg;
    return "/api/map/staticDirections" + q;
  }
  
  $scope.rowClick = function($event, inter, doubleClick) {
    if (doubleClick) {
      $location.url('/intervention/' + inter.id)

    } else if ($event.metaKey || $event.ctrlKey) {
      tabContainer.addTab('/intervention/' + inter.id, {
        title: ('#' + inter.id),
        setFocus: false,
        allowDuplicates: false
      });
    } else {
      if ($rootScope.expendedRow === inter.id) {
        $rootScope.expendedRow = -1;
      } else {
        $q.all([
          edisonAPI.getIntervention(inter.id),
          edisonAPI.getArtisanStats(inter.ai)
        ]).then(function(result)  {

          $rootScope.expendedRow = inter.id;
          $rootScope.expendedRowData = result[0].data;
          $rootScope.expendedRowData.artisanStats = result[1].data
        })
      }
    }
  }

});
