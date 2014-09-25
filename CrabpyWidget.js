define([
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/_base/declare",
    "dojo/request",
    "dijit/form/FilteringSelect",
    "dojo/store/Memory"
], function (_WidgetBase, _TemplatedMixin, declare, request, FilteringSelect, Memory) {

    return declare([_WidgetBase, _TemplatedMixin], {

        templateString: '' +
            '<div data-dojo-attach-point="containerNode">' +
            '   <fieldset>' +
            '       <div data-dojo-attach-point="provinceSelect"></div>' +
            '       <div data-dojo-attach-point="municipalitySelect"></div>' +
            '       <!--<div data-dojo-attach-point="deelgemeenteSelect"></div>-->' +
            '       <div data-dojo-attach-point="streetSelect"></div>' +
            '       <div data-dojo-attach-point="numberSelect"></div>' +
            '   </fieldset>' +
            '</div>',
        provinceSelector: null,
        municipalitySelector: null,
        streetSelector: null,
        numberSelector: null,
        baseClass: "crabpyselect",
        value: null,
        name: null,
        sortMethod: null,
        provinceList: null,
        municipalityList: null,
        disabled:false,
        baseUrl: null,

        postCreate: function () {
            this.inherited(arguments);

            this.sortMethod = this._sortNatural;

            var provinceSelector = this._buildFilteringSelect("niscode", "naam", "Kies een provincie", this.provinceSelect);
            if (this.provinceList){
                provinceSelector.store.setData(this.provinceList);
                provinceSelector.set('disabled', this.disabled);
            }

            var municipalitySelector = this._buildFilteringSelect("id", "naam", "Kies een gemeente", this.municipalitySelect);
            if (this.municipalityList){
                municipalitySelector.store.setData(this.municipalityList);
                municipalitySelector.set('disabled', this.disabled);
            }

            var streetSelector = this._buildFilteringSelect("id", "label", "Kies een straat", this.streetSelect);
            var numberSelector = this._buildFilteringSelect("id", "label", "Kies een huisnummer", this.numberSelect);

            this.provinceSelector = provinceSelector;
            this.municipalitySelector = municipalitySelector;
            this.streetSelector = streetSelector;
            this.numberSelector = numberSelector;

            var self = this;

            provinceSelector.watch('value', function(name, old, value) {
                var location = self.value;
                provinceSelector.set('disabled', true);
                municipalitySelector.set('disabled', true);
                streetSelector.set('disabled', true);
                numberSelector.set('disabled', true);
                municipalitySelector.reset();
                streetSelector.reset();
                numberSelector.reset();
                if (!value) {
                    municipalitySelector.store.setData(self.municipalityList);
                    provinceSelector.set('disabled', false);
                    municipalitySelector.set('disabled', false);
                    return false;
                }

                request(self.baseUrl + "/crab/provincies/" + value + "/gemeenten", {
                    handleAs: "json"
                }).then(function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        municipalitySelector.store.setData(jsondata);
                        provinceSelector.set('disabled', false);
                        municipalitySelector.set('disabled', false);
                        if (location && location.municipality && location.province && location.province.id == value) {
                            municipalitySelector.set('value', location.municipality.id);
                        }
                    },
                    function (error) {
                        self._errorHandler(error);
                    });
            });

            municipalitySelector.watch('value', function(name, old, value) {
                if (!value) return false;
                var location = self.value;
                provinceSelector.set('disabled', true);
                municipalitySelector.set('disabled', true);
                streetSelector.set('disabled', true);
                numberSelector.set('disabled', true);
                streetSelector.reset();
                numberSelector.reset();
                request(self.baseUrl + "/crab/gemeenten/" + value + "/straten?aantal=5000", {
                    handleAs: "json"
                }).then(function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        streetSelector.store.setData(jsondata);
                        provinceSelector.set('disabled', false);
                        municipalitySelector.set('disabled', false);
                        streetSelector.set('disabled', false);
                        if (location && location.street && location.municipality && location.municipality.id == value) {
                            streetSelector.set('value', location.street.id);
                        }
                    },
                    function (error) {
                        self._errorHandler(error);
                    });
            });

            streetSelector.watch('value', function(name, old, value) {
                if (!value) return false;
                var location = self.value;
                streetSelector.set('disabled', true);
                numberSelector.set('disabled', true);
                numberSelector.reset();
                request(self.baseUrl + "/crab/straten/" + value + "/huisnummers?aantal=5000", {
                    handleAs: "json"
                }).then(function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        numberSelector.store.setData(jsondata);
                        streetSelector.set('disabled', false);
                        numberSelector.set('disabled', false);
                        if (location && location.housenumber && location.street && location.street.id == value) {
                            numberSelector.set('value', location.housenumber.id);
                        }
                    },
                    function (error) {
                        self._errorHandler(error);
                    });
            });

            numberSelector.watch('value', function(name, old, value) {
                //
            });

            if (this.provinceList == null) {
                request(this.baseUrl + "/crab/gewesten/2/provincies", {
                    handleAs: "json"
                }).then(
                    function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        provinceSelector.store.setData(jsondata);
                        provinceSelector.set('disabled', false);
                        self.provinceList  = jsondata;
                    },
                    function (error) {
                        console.log("An error occurred: " + error);
                    });
            }

            if (this.municipalityList == null) {
                request(this.baseUrl + "/crab/gewesten/2/gemeenten?aantal=500", {
                    handleAs: "json"
                }).then(
                    function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        self.municipalityCache = jsondata;
                        municipalitySelector.store.setData(jsondata);
                        municipalitySelector.set('disabled', false);
                        self.municipalityList = jsondata;
                    },
                    function (error) {
                        console.log("An error occurred: " + error);
                    });
            }
        },

        startup: function () {
            this.inherited(arguments);
        },

        enableDisableInput:function(bool)
        {
            this.disabled=bool;
            this.provinceSelector.set('disabled', !this.disabled);
            this.municipalitySelector.set('disabled', !this.disabled);
        },

        _buildFilteringSelect: function (idfield, labelfield, placeholder, node) {
            return new FilteringSelect({
                store: new Memory({idProperty: idfield, data: []}),
                placeholder: placeholder,
                labelAttr: labelfield,
                searchAttr: labelfield,
                required: false,
                naturalSortAttribute: labelfield,
                fetchProperties: {
                   // sort:[{attribute:labelfield, descending:false}]
                },
                disabled: true,
                autoComplete: false,
                maxHeight:300
            }, node);
        },

        _errorHandler: function (e){
            console.log("An error occurred in the crabpy dijit: " + e);
            this.reset();
            alert('Er is een fout opgetreden bij het aanspreken van de CRAB service');
        },

        reset: function () {
            this.municipalitySelector.store.setData(this.municipalityList);
            this.streetSelector.store.setData([]);
            this.numberSelector.store.setData([]);

            this.provinceSelector.reset();
            this.municipalitySelector.reset();
            this.streetSelector.reset();
            this.numberSelector.reset();

            this.provinceSelector.set('disabled', false);
            this.municipalitySelector.set('disabled', false);
            this.streetSelector.set('disabled', true);
            this.numberSelector.set('disabled', true);
        },

        _getValueAttr: function () {
            var address = {};

            if (this.provinceSelector.get('value')) {
                address.province = {
                    id: this.provinceSelector.get('value'),
                    name: this.provinceSelector.get('displayedValue')
                };
            }

            if (this.municipalitySelector.get('value')) {
                address.municipality = {
                    id: this.municipalitySelector.get('value'),
                    name: this.municipalitySelector.get('displayedValue')
                };
            }

//            if (this.deelgemeenteSelector.get('value')) {
//                address.deelgemeente = {
//                    id: this.deelgemeenteSelector.get('value'),
//                    name: this.deelgemeenteSelector.get('displayedValue')
//                };
//            }

            if (this.streetSelector.get('value')) {
                address.street = {
                    id: this.streetSelector.get('value'),
                    name: this.streetSelector.get('displayedValue')
                };
            }

            if (this.numberSelector.get('value')) {
                address.housenumber = {
                    id: this.numberSelector.get('value'),
                    name: this.numberSelector.get('displayedValue')
                };
            }

            return address;
        },

        _setValueAttr: function (location) {
            this.value = location;
            if (location.province) {
                this.provinceSelector.set('value', location.province.id);
            }
            else if (location.municipality) {
                this.municipalitySelector.set('value', location.municipality.id);
            }
        },

        _sortNatural: function (a, b) {
            function chunkify(t) {
                var tz = [], x = 0, y = -1, n = 0, i, j;

                while (i = (j = t.charAt(x++)).charCodeAt(0)) {
                  var m = (i == 46 || (i >=48 && i <= 57));
                  if (m !== n) {
                    tz[++y] = "";
                    n = m;
                  }
                  tz[y] += j;
                }
                return tz;
            }

            var aProperty = a;
            var bProperty = b;
            if (a.label) {
                aProperty = a.label;
                bProperty = b.label;
            }
            else if (a.naam) {
                aProperty = a.naam;
                bProperty = b.naam;
            }
            var aa = chunkify(aProperty.toLowerCase());
            var bb = chunkify(bProperty.toLowerCase());

            for (x = 0; aa[x] && bb[x]; x++) {
            if (aa[x] !== bb[x]) {
              var c = Number(aa[x]), d = Number(bb[x]);
              if (c == aa[x] && d == bb[x]) {
                return c - d;
              } else return (aa[x] > bb[x]) ? 1 : -1;
            }
            }
            return aa.length - bb.length;
        }

    });
});