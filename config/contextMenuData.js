module.exports = {
    artisan: [{
        title: 'Modifier la Fiche',
        action: "ouvrirFiche"
    }, {
        title: 'Ouvrir Recap',
        action: "ouvrirRecap",
    }, {
        title: "Demander un facturier",
        action: 'needFacturier',
        hide: function(artisan, user) {
            this.style = null;
            if (artisan.demandeFacturier && artisan.demandeFacturier.status === 'PENDING') {
                this.style = {
                    color: 'red'
                }
            }
            return false
        }
    }, {
        title: "Refuser le facturier",
        action: 'refuseFacturier',
        hide: function(artisan, user) {
            return (!artisan.demandeFacturier || artisan.demandeFacturier.status !== 'PENDING' || user.service !== 'PARTENARIAT')
        }
    }, {
        title: "Facturier/deviseur",
        action: 'facturierDeviseur',
        hide: function(artisan, user) {
            return !(user.service == 'PARTENARIAT')
        }
    }, {
        title: "Archiver",
        action: 'archiver',
        hide: function(artisan) {
            return artisan.status === 'ARC';
        }
    }, {
        title: "dé-Archiver",
        action: 'deArchiver',
        hide: function(artisan) {
            return artisan.status !== 'ARC';
        }
    }, {
        title: "Envoyer Contrat",
        action: 'envoiContrat',
        hide: function(artisan) {
            return (artisan.document && artisan.document.cni && artisan.document.kbis && artisan.document.contrat);
        }
    }, {
        title: "Mettre sous tutelle",
        action: 'tutelleIn',
        hide: function(artisan, user) {
            return !(user.root && !artisan.tutelle)
        }
    }, {
        title: "Sortir de tutelle",
        action: 'tutelleOut',
        hide: function(artisan, user) {
            return !(user.root && artisan.tutelle)
        }
    }, {
        title: "Rappel Contrat",
        action: 'rappelContrat',
        hide: function(artisan) {
            return !artisan.historique.contrat.length || (artisan.document && artisan.document.cni && artisan.document.kbis && artisan.document.contrat);
        }
    }, {
        title: 'Appels',
        style: {
            fontWeight: 'bold'
        },
        subs: [{
            title: 'Telephone 1',
            action: 'callTel1',
            binding: 'telephone.tel1',
            hide: function(artisan) {
                return !artisan.telephone.tel1
            }
        }, {
            title: 'Telephone 2',
            action: 'callTel2',
            binding: 'telephone.tel2',
            hide: function(artisan) {
                return !artisan.telephone.tel2
            }
        }]
    }],
    devis: [{
        title: 'Modifier le devis',
        action: "ouvrirFiche",
        style: {
            fontWeight: 'bold'
        },
    }, {
        title: 'Appels',
        style: {
            fontWeight: 'bold'
        },
        subs: [{
            title: 'Client tel1',
            action: 'callTel1',
            binding: 'client.telephone.tel1',
            hide: function(inter) {
                return !inter.client.telephone.tel1
            }
        }, {
            title: 'Client tel2',
            action: 'callTel2',
            binding: 'client.telephone.tel2',
            hide: function(inter) {
                return !inter.client.telephone.tel2
            }
        }, {
            title: 'Client tel3',
            binding: 'client.telephone.tel3',
            action: 'callTel3',
            hide: function(inter) {
                return !inter.client.telephone.tel3
            }
        }]
    }, {
        title: "Prévisualiser",
        action: 'devisPreview',
    }, {
        title: "Envoyer",
        action: 'sendDevis',
        hide: function(inter) {
            return inter.status === "TRA" || (inter.historique && inter.historique.length != 0);
        }
    }, {
        title: "Relance 1",
        action: 'sendDevis',
        hide: function(inter) {
            return inter.status === "TRA" || (!inter.historique || inter.historique.length != 1);
        }
    }, {
        title: "Relance 2",
        action: 'sendDevis',
        hide: function(inter) {
            return inter.status === "TRA" || (!inter.historique || inter.historique.length < 2);
        }
    }, {
        title: "Transferer",
        action: 'transfert',
        hide: function(inter) {
            return inter.status === 'TRA';
        }
    }, {
        title: "Annuler",
        action: 'annulation',
        hide: function(inter) {
            return inter.status === 'ANN';
        }
    }],
    intervention: [{
        title: "Modifier l'intervention",
        action: "ouvrirFiche",
        style: {
            fontWeight: 'bold'
        }
    }, {
        title: 'Appels',
        style: {
            fontWeight: 'bold'
        },
        subs: [{
            title: 'Client tel1',
            action: 'callTel1',
            binding: 'client.telephone.tel1',
            hide: function(inter) {
                return !inter.client.telephone.tel1
            }
        }, {
            title: 'Client tel2',
            action: 'callTel2',
            binding: 'client.telephone.tel2',
            hide: function(inter) {
                return !inter.client.telephone.tel2
            }
        }, {
            title: 'Client tel3',
            action: 'callTel3',
            binding: 'client.telephone.tel3',
            hide: function(inter) {
                return !inter.client.telephone.tel3
            }
        }, {
            title: 'Sous-traitant tel1',
            action: 'callSst1',
            binding: 'sst.telephone.tel1',
            hide: function(inter) {
                return !inter.sst || !inter.sst.telephone.tel1
            }
        }, {
            title: 'Sous-traitant tel2',
            action: 'callSst2',
            binding: 'sst.telephone.tel2',
            hide: function(inter) {
                return !inter.sst || !inter.sst.telephone.tel2
            }
        }, {
            title: 'Payeur tel1',
            action: 'callPayeur1',
            binding: 'sst.facture.tel',
            hide: function(inter) {
                return !inter.facture || !inter.facture.tel
            }
        }, {
            title: 'Payeur tel2',
            action: 'callPayeur2',
            binding: 'sst.facture.tel2',
            hide: function(inter) {
                return !inter.facture || !inter.facture.tel2
            }
        }]
    }, {
        title: 'Recap sous-traitant',
        action: "ouvrirRecapSST",
        hide: function(inter) {
            return !inter.artisan || !inter.artisan.id
        }
    }, {
        title: 'Reglement Client',
        action: "validerReglement",
        hide: function(inter) {
            return !(app_session.root ||  app_session.service === 'COMPTABILITE') ||  (inter.status !== 'ENC' && inter.status !== 'VRF');
        }
    }, {
        title: 'Paiement SST',
        action: "validerPaiement",
        hide: function(inter) {
            return !((app_session.root ||  app_session.service === 'COMPTABILITE') && (inter.status === 'VRF' || inter.status === "ENC"));
        }
    }, {
        title: "SMS sous-traitant",
        action: 'smsArtisan',
        hide: function(inter) {
            return !inter.artisan || !inter.artisan.id
        }
    }, {
        title: "Envoyer",
        action: 'envoi',
        hide: function(inter) {
            return inter.status == "VRF" || (!inter.artisan || !inter.artisan.id)
        }
    }, {
        title: "Vérifier",
        action: 'verification',
        hide: function(inter) {
            return inter.status !== "AVR" && inter.status !== 'ENC'
        }
    }, {
        title: "Auto-facture",
        action: 'autoFacture',
        hide: function(inter) {
            return !inter.compta.paiement.effectue;
        }
    }, {
        title: "Reactiver",
        action: 'reactivation',
        hide: function(inter) {
            return inter.status !== 'ANN'
        }
    }, {
        title: "Annuler",
        action: 'annulation',
        hide: function(inter) {
            return !inter.id || inter.status === 'ANN' 
        }
    }, {
        title: "Recouvrement",
        action: 'recouvrement',
        hide: function(inter) {
            return inter.compta.reglement.recu || inter.status !== "VRF"
        }
    }, {
        title: "Je prend !",
        action: 'demarcher',
        hide: function(inter, user) {
            return !(inter.aDemarcher && user.service === 'PARTENARIAT')
        }
    }]
}
