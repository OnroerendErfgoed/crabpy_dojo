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
            '   <div class="zoneerder-pane-header">Perceel</div>' +
            '       <div class="zoneerder-pane-content">' +
            '           <div data-dojo-attach-point="gemeenteSelect"></div>' +
            '           <div data-dojo-attach-point="afdelingSelect"></div>' +
            '           <div data-dojo-attach-point="sectieSelect"></div>' +
            '           <div data-dojo-attach-point="perceelSelect"></div>' +
            '       </div>' +
            '   </div>' +
            '</div>',
        gemeenteSelector: null,
        afdelingSelector: null,
        sectieSelector: null,
        perceelSelector: null,
        baseClass: null,
        value: null,
        name: null,
        sortMethod: null,
        gemeenteList: null,
        disabled:false,
        baseUrl: null,

        postCreate: function () {
            this.inherited(arguments);

            var gemeenteSelector = this._buildSelect("gemeenteSelector", "id", "naam", "Kies een gemeente",
                this.gemeenteSelect);

            var afdelingSelector = this._buildSelect("afdelingSelector", "id", "naam", "Kies een afdeling",
                this.afdelingSelect);

            var sectieSelector = this._buildSelect("sectieSelector", "id", "id", "Kies een sectie",
                this.sectieSelect);

            var perceelSelector = this._buildSelect("perceelSelector", "id", "capakey", "Kies een perceel",
                this.perceelSelect);

            this.gemeenteSelector = gemeenteSelector;
            this.afdelingSelector = afdelingSelector;
            this.sectieSelector = sectieSelector;
            this.perceelSelector = perceelSelector;

            var self = this;

            gemeenteSelector.watch('value', function(name, old, value) {
                var location = self.value;
                gemeenteSelector.set('disabled', true);
                afdelingSelector.set('disabled', true);
                sectieSelector.set('disabled', true);
                perceelSelector.set('disabled', true);
                afdelingSelector.set('value', '');
                sectieSelector.set('value', '');
                perceelSelector.set('value', '');
                if (!value) {
                    self._setSelectOptions(afdelingSelector, self.municipalityList);
                    gemeenteSelector.set('disabled', false);
                    afdelingSelector.set('disabled', false);
                    return false;
                }

                request(self.baseUrl + "/capakey/gemeenten/" + value + "/afdelingen", {
                    handleAs: "json",
                    headers: {
                        "X-Requested-With": ""
                    }
                }).then(function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        self._setSelectOptions(afdelingSelector, jsondata);
                        gemeenteSelector.set('disabled', false);
                        afdelingSelector.set('disabled', false);
                        if (location && location.afdeling && location.gemeente && location.gemeente.id == value) {
                            afdelingSelector.set('value', location.afdeling.id);
                        }
                    },
                    function (error) {
                        self._errorHandler(error);
                    });
            });

            afdelingSelector.watch('value', function(name, old, value) {
                if (!value) return false;
                var location = self.value;
                gemeenteSelector.set('disabled', true);
                afdelingSelector.set('disabled', true);
                sectieSelector.set('disabled', true);
                perceelSelector.set('disabled', true);
                sectieSelector.set('value', '');
                perceelSelector.set('value', '');
                request(self.baseUrl + "/capakey/afdelingen/" + value + "/secties", {
                    handleAs: "json",
                    headers: {
                        "X-Requested-With": ""
                    }
                }).then(function (jsondata) {
                        self._setSelectOptions(sectieSelector, jsondata);
                        gemeenteSelector.set('disabled', false);
                        afdelingSelector.set('disabled', false);
                        sectieSelector.set('disabled', false);
                        if (location && location.sectie && location.afdeling && location.afdeling.id == value) {
                            sectieSelector.set('value', location.sectie.id);
                        }
                    },
                    function (error) {
                        self._errorHandler(error);
                    });
            });

            sectieSelector.watch('value', function(name, old, value) {
                if (!value) return false;
                var afdeling = self.afdelingSelector.get('value');
                if (!afdeling) return false;
                var location = self.value;
                sectieSelector.set('disabled', true);
                perceelSelector.set('disabled', true);
                perceelSelector.set('value', '');
                request(self.baseUrl + "/capakey/afdelingen/" + afdeling + "/secties/" + value + "/percelen", {
                    handleAs: "json",
                    headers: {
                        "X-Requested-With": ""
                    }
                }).then(function (jsondata) {
                        self._setSelectOptions(perceelSelector, jsondata);
                        sectieSelector.set('disabled', false);
                        perceelSelector.set('disabled', false);
                        if (location && location.perceel && location.sectie && location.sectie.id == value) {
                            perceelSelector.set('value', location.perceel.id);
                        }
                    },
                    function (error) {
                        self._errorHandler(error);
                    });
            });

            perceelSelector.watch('value', function(name, old, value) {
                //
            });

            if (this.gemeenteList == null) {
                request(this.baseUrl + "/capakey/gemeenten", {
                    handleAs: "json",
                    headers: {
                        "X-Requested-With": ""
                    }
                }).then(
                    function (jsondata) {
                        if (self.sortMethod) {
                            jsondata.sort(self.sortMethod);
                        }
                        self._setSelectOptions(gemeenteSelector, jsondata);
                        gemeenteSelector.set('disabled', false);
                        self.gemeenteList  = jsondata;
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
            this.gemeenteSelector.set('disabled', !this.disabled);
            this.afdelingSelector.set('disabled', !this.disabled);
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
            this._setSelectOptions(this.afdelingSelector, this.municipalityList);
            this._setSelectOptions(this.sectieSelector, []);
            this._setSelectOptions(this.perceelSelector, []);

            this.gemeenteSelector.set('value', '');
            this.afdelingSelector.set('value', '');
            this.sectieSelector.set('value', '');
            this.perceelSelector.set('value', '');

            this.gemeenteSelector.set('disabled', false);
            this.afdelingSelector.set('disabled', false);
            this.sectieSelector.set('disabled', true);
            this.perceelSelector.set('disabled', true);
        },

        _getValueAttr: function () {
            var address = {};

            if (this.gemeenteSelector.get('value')) {
                address.gemeente = this._getSelectValue(this.gemeenteSelector);
            }

            if (this.afdelingSelector.get('value')) {
                address.afdeling = this._getSelectValue(this.afdelingSelector);
            }

            if (this.sectieSelector.get('value')) {
                address.sectie = this._getSelectValue(this.sectieSelector);
            }

            if (this.perceelSelector.get('value')) {
                address.perceel = this._getSelectValue(this.perceelSelector);
            }

            return address;
        },

        _setValueAttr: function (location) {
            this.value = location;
            if (location.gemeente) {
                this.gemeenteSelector.set('value', location.gemeente.id);
            }
        },

        getBbox: function () {
            var bbox = null;
            var url = null;

            var perceel = this.perceelSelector.get('value');
            var sectie = this.sectieSelector.get('value');
            var afdeling = this.afdelingSelector.get('value');
            var gemeente = this.gemeenteSelector.get('value');

            if (perceel  && sectie && afdeling) {
                url = this.baseUrl + "/capakey/afdelingen/" + afdeling + "/secties/" + sectie  + "/percelen/" + perceel;
            }
            else if (sectie && afdeling) {
                url = this.baseUrl + "/capakey/afdelingen/" + afdeling + "/secties/" + sectie;
            }
            else if (afdeling) {
                url = this.baseUrl + "/capakey/afdelingen/" + afdeling;
            }
            else if (gemeente) {
                url = this.baseUrl + "/capakey/gemeenten/" + gemeente;
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