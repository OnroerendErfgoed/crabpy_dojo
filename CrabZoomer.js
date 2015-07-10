define([
    "mijit/_WidgetBase",
    "mijit/_TemplatedMixin",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/request",
    "dojo-form-controls/Select"
], function (_WidgetBase, _TemplatedMixin, declare, array, request, Select) {

    return declare([_WidgetBase, _TemplatedMixin], {

        templateString: '' +
            '<div data-dojo-attach-point="containerNode" class="zoneerder-pane">' +
            '   <div class="zoneerder-pane-header">Adres</div>' +
            '       <div class="zoneerder-pane-content">' +
            '           <div data-dojo-attach-point="provinceSelect"></div>' +
            '           <div data-dojo-attach-point="municipalitySelect"></div>' +
            '           <div data-dojo-attach-point="streetSelect"></div>' +
            '           <div data-dojo-attach-point="numberSelect"></div>' +
            '       </div>' +
            '   </div>' +
            '</div>',
        provinceSelector: null,
        municipalitySelector: null,
        streetSelector: null,
        numberSelector: null,
        baseClass: null,
        value: null,
        name: null,
        sortMethod: null,
        provinceList: null,
        municipalityList: null,
        disabled:false,
        baseUrl: null,

        postCreate: function () {
            this.inherited(arguments);

            var provinceSelector = this._buildSelect("provinceSelector", "niscode", "naam", "Kies een provincie",
                this.provinceSelect);
            if (this.provinceList){
                this._setSelectOptions(provinceSelector, this.provinceList);
                provinceSelector.set('disabled', this.disabled);
            }

            var municipalitySelector = this._buildSelect("municipalitySelector", "id", "naam", "Kies een gemeente",
                this.municipalitySelect);
            if (this.municipalityList){
                this._setSelectOptions(municipalitySelector, this.municipalityList);
                municipalitySelector.set('disabled', this.disabled);
            }

            var streetSelector = this._buildSelect("streetSelector", "id", "label", "Kies een straat",
                this.streetSelect);
            var numberSelector = this._buildSelect("numberSelector", "id", "label", "Kies een huisnummer",
                this.numberSelect);

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
                municipalitySelector.set('value', '');
                streetSelector.set('value', '');
                numberSelector.set('value', '');
                if (!value) {
                    self._setSelectOptions(municipalitySelector, self.municipalityList);
                    provinceSelector.set('disabled', false);
                    municipalitySelector.set('disabled', false);
                    return false;
                }

                request(self.baseUrl + "/crab/provincies/" + value + "/gemeenten", {
                    handleAs: "json",
                    headers: {
                        "X-Requested-With": ""
                    }
                }).then(function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        self._setSelectOptions(municipalitySelector, jsondata);
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
                streetSelector.set('value', '');
                numberSelector.set('value', '');
                request(self.baseUrl + "/crab/gemeenten/" + value + "/straten?aantal=5000", {
                    handleAs: "json",
                    headers: {
                        "X-Requested-With": ""
                    }
                }).then(function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        self._setSelectOptions(streetSelector, jsondata);
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
                numberSelector.set('value', '');
                request(self.baseUrl + "/crab/straten/" + value + "/huisnummers?aantal=5000", {
                    handleAs: "json",
                    headers: {
                        "X-Requested-With": ""
                    }
                }).then(function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        self._setSelectOptions(numberSelector, jsondata);
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
                    handleAs: "json",
                    headers: {
                        "X-Requested-With": ""
                    }
                }).then(
                    function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        self._setSelectOptions(provinceSelector, jsondata);
                        provinceSelector.set('disabled', false);
                        self.provinceList  = jsondata;
                    },
                    function (error) {
                        console.log("An error occurred: " + error);
                    });
            }

            if (this.municipalityList == null) {
                request(this.baseUrl + "/crab/gewesten/2/gemeenten?aantal=500", {
                    handleAs: "json",
                    headers: {
                        "X-Requested-With": ""
                    }
                }).then(
                    function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        self.municipalityCache = jsondata;
                        self._setSelectOptions(municipalitySelector, jsondata);
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

        _buildSelect: function (name, idfield, labelfield, placeholder, node) {
            var defaultOption = [
                { value: '', label: placeholder}
            ];
            return new Select({
                name: name,
                idfield: idfield,
                labelfield: labelfield,
                value: '',
                options: defaultOption,
                required: false
            }, node);
        },

        _setSelectOptions: function (select, jsondata) {
            var defaultOption = [select.get('options')[0]];
            var options = array.map(jsondata, function(object){
                var returnObject = {};
                returnObject.value = object[select.idfield].toString();
                returnObject.label = object[select.labelfield];
                return returnObject;
            });
            select.set('options', defaultOption.concat(options));
        },

        _getSelectValue: function (selector) {
            var value = selector.get('value');
            var label = value;
            array.some(selector.get('options'), function (option) {
                if (option.value == value) {
                    label = option.label;
                    return false;
                }
            });
            return {id: value, name: label};
        },

        _errorHandler: function (e){
            console.log("An error occurred in the crabpy dijit: " + e);
            this.reset();
            alert('Er is een fout opgetreden bij het aanspreken van de CRAB service');
        },

        reset: function () {
            this._setSelectOptions(this.municipalitySelector, this.municipalityList);
            this._setSelectOptions(this.streetSelector, []);
            this._setSelectOptions(this.numberSelector, []);

            this.provinceSelector.set('value', '');
            this.municipalitySelector.set('value', '');
            this.streetSelector.set('value', '');
            this.numberSelector.set('value', '');

            this.provinceSelector.set('disabled', false);
            this.municipalitySelector.set('disabled', false);
            this.streetSelector.set('disabled', true);
            this.numberSelector.set('disabled', true);
        },

        _getValueAttr: function () {
            var address = {};

            if (this.provinceSelector.get('value')) {
                address.province = this._getSelectValue(this.provinceSelector);
            }

            if (this.municipalitySelector.get('value')) {
                address.municipality = this._getSelectValue(this.municipalitySelector);
            }

            if (this.streetSelector.get('value')) {
                address.street = this._getSelectValue(this.streetSelector);
            }

            if (this.numberSelector.get('value')) {
                address.housenumber = this._getSelectValue(this.numberSelector);
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

        getBbox: function () {
            var bbox = null;
            var url = null;

            if (this.numberSelector.get('value')) {
                url = this.baseUrl + "/crab/huisnummers/" + this.numberSelector.get('value');
            }
            else if (this.streetSelector.get('value')) {
                url = this.baseUrl + "/crab/straten/" + this.streetSelector.get('value');
            }
            else if (this.municipalitySelector.get('value')) {
                url = this.baseUrl + "/crab/gemeenten/" + this.municipalitySelector.get('value');
            }
            if (url) {
                request(url, {
                    handleAs: "json",
                    sync: true,
                    headers: {
                        "X-Requested-With": ""
                    }
                }).then(function (jsondata) {
                    bbox = jsondata.bounding_box;
                },
                function (error) {
                    console.log("An error occurred: " + error);
                });
            }
            return bbox;
        }
    });
});