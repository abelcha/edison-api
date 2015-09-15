angular.module('edison')
    .factory('Artisan', ['$window', '$rootScope', '$location', 'LxNotificationService', 'LxProgressService', 'dialog', 'edisonAPI', 'textTemplate',
        function($window, $rootScope, $location, LxNotificationService, LxProgressService, dialog, edisonAPI, textTemplate) {
            "use strict";
            var Artisan = function(data) {
                if (!(this instanceof Artisan)) {
                    return new Artisan(data);
                }
                for (var k in data) {
                    this[k] = data[k];
                }
            }
            Artisan.prototype.typeOf = function() {
                return 'Artisan';
            }
            Artisan.prototype.ouvrirFiche = function() {
                $location.url("/artisan/" + this.id);
            }
            Artisan.prototype.ouvrirRecap = function() {
                $location.url("/artisan/" + this.id + '/recap');
            }
            Artisan.prototype.facturierDeviseur = function() {
                var _this = this;
                dialog.facturierDeviseur(this, function(facturier, deviseur) {
                    edisonAPI.artisan.sendFacturier(_this.id, facturier, deviseur);
                })
            }
            Artisan.prototype.call = function(cb) {
                var _this = this;
                var now = Date.now();
                $window.open('callto:' + _this.telephone.tel1, '_self', false)
                    /*                dialog.choiceText({
                                        title: 'Nouvel Appel',
                                        subTitle: _this.telephone.tel1
                                    }, function(response, text) {
                                        edisonAPI.call.save({
                                            date: now,
                                            to: _this.telephone.tel1,
                                            link: _this.id,
                                            origin: _this.id || _this.tmpID || 0,
                                            description: text,
                                            response: response
                                        }).success(function(resp) {
                                            if (typeof cb === 'function')
                                                cb(null, resp);
                                        }).catch(function(err) {
                                            if (typeof cb === 'function')
                                                cb(err);
                                        })
                                    })*/
            };

            Artisan.prototype.save = function(cb) {
                console.log('save')
                var _this = this;

                edisonAPI.artisan.save(_this)
                    .then(function(resp) {
                        LxNotificationService.success("Les données ont à été enregistré");
                        if (typeof cb === 'function')
                            cb(null, resp.data)
                    }).catch(function(error) {
                        LxNotificationService.error(error.data);
                        if (typeof cb === 'function')
                            cb(error.data)
                    });
            };

            Artisan.prototype.upload = function(file, name, cb) {
                var _this = this;
                if (file) {
                    LxProgressService.circular.show('#5fa2db', '#fileUploadProgress');
                    edisonAPI.artisan.upload(file, name, _this.id)
                        .success(function(resp) {
                            _this.document = resp.document;
                            LxProgressService.circular.hide();
                            if (typeof cb === 'function')
                                cb(null, resp);
                        }).catch(function(err) {
                            LxProgressService.circular.hide();
                            if (typeof cb === 'function')
                                cb(err);
                        })
                }
            }

            Artisan.prototype.envoiContrat = function(cb) {
                var _this = this;
                dialog.sendContrat({
                    data: _this,
                    text: _.template(textTemplate.mail.artisan.envoiContrat())(_this),
                }, function(options) {
                    LxProgressService.circular.show('#5fa2db', '#globalProgress');
                    edisonAPI.artisan.envoiContrat(_this.id, {
                        text: options.text,
                        signe: options.signe
                    }).success(function(resp) {
                        LxProgressService.circular.hide()
                        if (typeof cb === 'function')
                            cb(null, resp);
                    });
                });
            }
            Artisan.prototype.rappelContrat = function(cb) {
                var _this = this;
                _this.datePlain = moment(_this.date.ajout).format('ll')
                dialog.sendContrat({
                    data: _this,
                    text: _.template(textTemplate.mail.artisan.rappelContrat())(_this),
                }, function(options) {
                    LxProgressService.circular.show('#5fa2db', '#globalProgress');
                    edisonAPI.artisan.envoiContrat(_this.id, {
                        text: options.text,
                        signe: options.signe,
                        rappel: true
                    }).success(function(resp) {
                        LxProgressService.circular.hide()
                        if (typeof cb === 'function')
                            cb(null, resp);
                    });
                });
            }

            Artisan.prototype.ouvrirFiche = function() {
                $location.url("/artisan/" + this.id);
            }
            return Artisan;
        }
    ]);
