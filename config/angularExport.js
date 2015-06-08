angular.module('browserify', [])
    .factory('config', [function() {
        "use strict";
        var config =  require("./dataList.js")
        config.filters = require('./FiltersFactory');
        return config;
            /*    config.civilites = [{
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
                        s: 'EL',
                        o: 2,
                        n: 'Electricité',
                        c: 'yellow  accent-4 black-text'
                    },
                    PL: {
                        s: 'PL',
                        o: 0,
                        n: 'Plomberie',
                        c: 'blue white-text'
                    },
                    CH: {
                        s: 'CH',
                        o: 1,
                        n: 'Chauffage',
                        c: 'red white-text'
                    },
                    CL: {
                        s: 'CL',
                        o: 6,
                        n: 'Climatisation',
                        c: 'teal white-text'
                    },
                    SR: {
                        s: 'SR',
                        o: 3,
                        n: 'Serrurerie',
                        c: 'brown white-text'
                    },
                    VT: {
                        s: 'VT',
                        o: 4,
                        n: 'Vitrerie',
                        c: 'green white-text'
                    },
                    AS: {
                        s: 'AS',
                        o: 5,
                        n: 'Assainissement',
                        c: 'orange white-text'
                    },
                    PT: {
                        s: 'PT',
                        o: 7,
                        n: 'Peinture',
                        c: 'deep-orange white-text'
                    }
                }
                config.categoriesAKV = [{
                    s: 'PL',
                    o: 0,
                    n: 'Plomberie',
                    c: 'blue white-text'
                }, {
                    s: 'CH',
                    o: 1,
                    n: 'Chauffage',
                    c: 'red white-text'
                }, {
                    s: 'EL',
                    o: 2,
                    n: 'Electricité',
                    c: 'yellow  accent-4 black-text'
                }, {
                    s: 'SR',
                    o: 3,
                    n: 'Serrurerie',
                    c: 'brown white-text'
                }, {
                    s: 'VT',
                    o: 4,
                    n: 'Vitrerie',
                    c: 'green white-text'
                }, {
                    s: 'AS',
                    o: 5,
                    n: 'Assainissement',
                    c: 'orange white-text'
                }, {
                    s: 'CL',
                    o: 6,
                    n: 'Climatisation',
                    c: 'teal white-text'
                }, {
                    s: 'PT',
                    o: 7,
                    n: 'Peinture',
                    c: 'deep-orange white-text'
                }]
                config.fournisseur = [{
                    short_name: 'ARTISAN',
                    type: 'Fourniture Artisan'
                }, {
                    short_name: 'CEDEO',
                    type: 'Fourniture Edison'
                }, {
                    short_name: 'BROSSETTE',
                    type: 'Fourniture Edison'
                }, {
                    short_name: 'REXEL',
                    type: 'Fourniture Edison'
                }, {
                    short_name: 'COAXEL',
                    type: 'Fourniture Edison'
                }, {
                    short_name: 'YESSS ELECTRIQUE',
                    type: 'Fourniture Edison'
                }, {
                    short_name: 'CGED',
                    type: 'Fourniture Edison'
                }, {
                    short_name: 'COSTA',
                    type: 'Fourniture Edison'
                }, {
                    short_name: 'FORUM DU BATIMENT',
                    type: 'Fourniture Edison'
                }]


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

                config.tva = [{
                    short_name: 10,
                    long_name: "TVA: 10%"
                }, {
                    short_name: 20,
                    long_name: "TVA: 20%"
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

                config.etatsKV = {
                    ENV: {
                        n: 'Envoyé',
                        c: 'orange'
                    },
                    RGL: {
                        n: 'Reglé',
                        c: 'green'
                    },
                    PAY: {
                        n: 'Payé',
                        c: 'green accent-4'
                    },
                    ATT: {
                        n: 'Reglement En Attente',
                        c: 'purple'
                    },
                    ATTC: {
                        n: 'RC En Attente',
                        c: 'purple'
                    },
                    ATTS: {
                        n: 'RS En Attente',
                        c: 'pink darken-4'
                    },
                    APR: {
                        n: 'A Progr.',
                        c: 'blue'
                    },
                    AVR: {
                        n: 'A Vérifier',
                        c: 'brown darken-3'
                    },
                    ANN: {
                        n: 'Annuler',
                        c: 'red'
                    },
                    DEV: {
                        n: 'Devis',
                        c: 'light-blue'
                    },
                }

                config.status = function(inter) {
                    return {
                        intervention: config.etatsKV[inter.status]
                    }
                }
                return config;*/

    }]);
