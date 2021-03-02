define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/request',
  'dojo/dom-attr',
  'dojo/store/Memory',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/form/ComboBox',
  './utils/DomUtils'
], function (
  declare,
  array,
  request,
  domAttr,
  Memory,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  ComboBox,
  domUtils
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: '' +
      '<div data-dojo-attach-point="containerNode" class="widget-pane">' +
      '  <div class="widget-pane-header">Adres</div>' +
      '  <div class="widget-pane-content">' +
      '    <select data-dojo-attach-point="gewestSelect" data-dojo-attach-event="onchange:_gewestChange" disabled></select>' +
      '    <select data-dojo-attach-point="provinceSelect" data-dojo-attach-event="onchange:_provinceChange" disabled></select>' +
      '    <select data-dojo-attach-point="municipalitySelect" data-dojo-attach-event="onchange:_municipalityChange" disabled></select>' +
      '    <select data-dojo-attach-point="streetSelect" data-dojo-attach-event="onchange:_streetChange" disabled></select>' +
      '    <select data-dojo-attach-point="numberSelect" data-dojo-attach-event="onchange:_numberChange" disabled></select>' +
      '  </div>' +
      '</div>',
    baseClass: null,
    value: null,
    name: null,
    sortMethod: null,
    gewestList: null,
    provinceList: null,
    municipalityList: null,
    disabled: false,
    baseUrl: null,
    _nummerFilteringSelect: null,

    postCreate: function () {
      //console.debug('CrabZoomer::postCreate');
      this.inherited(arguments);
      this._createNumberSelect();

      this._fillGewestSelect(this.gewestList);
      this._fillProvinceSelect(this.provinceList);
      this._fillMunicipalitySelect(this.municipalityList);
      this._fillStreetSelect([]);
      this._fillNumberSelect([]);

      var self = this;

      if (this.gewestList == null) {
        request(this.baseUrl + "/crab/gewesten", {
          handleAs: "json",
          headers: {
            "X-Requested-With": ""
          }
        }).then(
          function (jsondata) {
            if (self.sortMethod) {
              jsondata.sort(self.sortMethod);
            }
            self.gewestList = jsondata;
            self._fillGewestSelect(jsondata);
            // this._setGewest('');
            domAttr.remove(self.gewestSelect, "disabled");
          },
          function (error) {
            self._errorHandler(error);
          }
        );
      }
      else {
        domAttr.remove(self.gewestSelect, "disabled");
      }

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
            self.provinceList = jsondata;
            self._fillProvinceSelect(jsondata);
            domAttr.remove(self.provinceSelect, "disabled");
          },
          function (error) {
            self._errorHandler(error);
          }
        );
      }
      else {
        domAttr.remove(self.provinceSelect, "disabled");
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
            self._fillMunicipalitySelect(jsondata);
            domAttr.remove(self.municipalitySelect, "disabled");
            self.municipalityList = jsondata;
          },
          function (error) {
            self._errorHandler(error);
          }
        );
      }
      else {
        domAttr.remove(self.municipalitySelect, "disabled");
      }
    },

    startup: function () {
      //console.debug('CrabZoomer::startup');
      this.inherited(arguments);
    },

    enable: function () {
      //console.debug('CrabZoomer::enable');
      this.disabled = false;
      domAttr.remove(this.provinceSelect, "disabled");
      domAttr.remove(this.municipalitySelect, "disabled");
      domAttr.remove(this.streetSelect, "disabled");
      this._nummerFilteringSelect.set('disabled', false);
    },

    disable: function () {
      //console.debug('CrabZoomer::disable');
      this.disabled = true;
      domAttr.set(this.provinceSelect, "disabled", true);
      domAttr.set(this.municipalitySelect, "disabled", true);
      domAttr.set(this.streetSelect, "disabled", true);
      this._nummerFilteringSelect.set('disabled', true);
    },

    _createNumberSelect: function() {
      this._nummerFilteringSelect = new ComboBox({
        store: new Memory(),
        hasDownArrow: true,
        placeHolder: 'Kies een huisnummer',
        searchAttr: 'label',
        autoComplete: false,
        required: false,
        disabled: true,
        'class': 'placeholder-input'
      }, this.numberSelect);
    },

    _gewestChange: function () {
      //console.debug('CrabZoomer::_gewestChange');
      var value = domUtils.getSelectedOption(this.gewestSelect);

      this._setProvince('');
      this._setMunicipality('');
      this._setStreet('');
      this._setNumber('');
      this.disable();

      if (!value) {
        this._fillGewestSelect([]);
        this._fillMunicipalitySelect(this.municipalityCache);
        this._fillStreetSelect([]);
        this._fillNumberSelect([]);
        domAttr.remove(this.provinceSelect, "disabled");
        domAttr.remove(this.municipalitySelect, "disabled");
        return false;
      }

      var self = this;

      request(this.baseUrl + "/crab/gewesten/" + value + "/provincies", {
        handleAs: "json",
        headers: {
          "X-Requested-With": ""
        }
      }).then(
        function (jsondata) {
          if (self.sortMethod) {
            jsondata.sort(self.sortMethod);
          }

          self._fillMunicipalitySelect(jsondata);
          domAttr.remove(self.provinceSelect, "disabled");
          domAttr.remove(self.municipalitySelect, "disabled");

          var location = self.value;
          if (location && location.municipality && location.province && location.province.id == value) {
            self._setMunicipality(location.municipality.id);
          }
        },
        function (error) {
          self._errorHandler(error);
        }
      );
    },

    _provinceChange: function () {
      //console.debug('CrabZoomer::_provinceChange');
      var value = domUtils.getSelectedOption(this.provinceSelect);

      this._setMunicipality('');
      this._setStreet('');
      this._setNumber('');
      this.disable();

      if (!value) {
        this._fillMunicipalitySelect(this.municipalityCache);
        this._fillStreetSelect([]);
        this._fillNumberSelect([]);
        domAttr.remove(this.provinceSelect, "disabled");
        domAttr.remove(this.municipalitySelect, "disabled");
        return false;
      }

      var self = this;

      request(this.baseUrl + "/crab/provincies/" + value + "/gemeenten", {
        handleAs: "json",
        headers: {
          "X-Requested-With": ""
        }
      }).then(
        function (jsondata) {
          if (self.sortMethod) {
            jsondata.sort(self.sortMethod);
          }

          self._fillMunicipalitySelect(jsondata);
          domAttr.remove(self.provinceSelect, "disabled");
          domAttr.remove(self.municipalitySelect, "disabled");

          var location = self.value;
          if (location && location.municipality && location.province && location.province.id == value) {
            self._setMunicipality(location.municipality.id);
          }
        },
        function (error) {
          self._errorHandler(error);
        }
      );
    },

    _municipalityChange: function () {
      //console.debug('CrabZoomer::_municipalityChange');
      var value = domUtils.getSelectedOption(this.municipalitySelect);

      this._setStreet('');
      this._setNumber('');
      this.disable();

      if (!value) {
        this._fillStreetSelect([]);
        this._fillNumberSelect([]);
        domAttr.remove(this.provinceSelect, "disabled");
        domAttr.remove(this.municipalitySelect, "disabled");
        return false;
      }

      var self = this;

      request(this.baseUrl + "/crab/gemeenten/" + value + "/straten?aantal=5000", {
        handleAs: "json",
        headers: {
          "X-Requested-With": ""
        }
      }).then(
        function (jsondata) {
          if (self.sortMethod) {
            jsondata.sort(self.sortMethod);
          }

          self._fillStreetSelect(jsondata);

          domAttr.remove(self.provinceSelect, "disabled");
          domAttr.remove(self.municipalitySelect, "disabled");
          domAttr.remove(self.streetSelect, "disabled");

          var location = self.value;
          if (location && location.street && location.municipality && location.municipality.id == value) {
            self._setStreet(location.street.id);
          }
        },
        function (error) {
          self._errorHandler(error);
        }
      );
    },

    _streetChange: function () {
      //console.debug('CrabZoomer::_streetChange');
      var value = domUtils.getSelectedOption(this.streetSelect);

      this._setNumber('');
      this.disable();

      if (!value) {
        this._fillNumberSelect([]);
        domAttr.remove(this.provinceSelect, "disabled");
        domAttr.remove(this.municipalitySelect, "disabled");
        domAttr.remove(this.streetSelect, "disabled");
        return false;
      }

      var self = this;

      request(this.baseUrl + "/crab/straten/" + value + "/huisnummers?aantal=5000", {
        handleAs: "json",
        headers: {
          "X-Requested-With": ""
        }
      }).then(
        function (jsondata) {
          if (self.sortMethod) {
            jsondata.sort(self.sortMethod);
          }

          self._fillNumberSelect(jsondata);

          domAttr.remove(self.provinceSelect, "disabled");
          domAttr.remove(self.municipalitySelect, "disabled");
          domAttr.remove(self.streetSelect, "disabled");
          self._nummerFilteringSelect.set('disabled', false);

          var location = self.value;
          if (location && location.housenumber && location.street && location.street.id == value) {
            self._setNumber(location.housenumber);
          }
        },
        function (error) {
          self._errorHandler(error);
        }
      );
    },

    _numberChange: function () {
      //console.debug('CrabZoomer::_numberChange');
    },

    _errorHandler: function (e){
      console.error("An error occurred in the crabpy dijit: " + e);
      this.reset();
      alert('Er is een fout opgetreden bij het aanspreken van de CRAB service');
    },

    reset: function () {
      console.debug('CrabZoomer::reset');
      this._fillMunicipalitySelect(this.municipalityCache);
      this._fillStreetSelect([]);
      this._fillNumberSelect([]);

      this._setProvince('');
      this._setMunicipality('');
      this._setStreet('');
      this._setNumber('');

      domAttr.remove(this.provinceSelect, "disabled");
      domAttr.remove(this.municipalitySelect, "disabled");
      domAttr.set(this.streetSelect, "disabled", true);
      this._nummerFilteringSelect.set('disabled', true);
    },

    _getValueAttr: function () {
      console.debug('CrabZoomer::_getValueAttr');
      var address = {};

      if (domUtils.getSelectedOption(this.provinceSelect)) {
        address.province = this._getSelectValueAsObect(this.provinceSelect);
      }

      if (domUtils.getSelectedOption(this.municipalitySelect)) {
        address.municipality = this._getSelectValueAsObect(this.municipalitySelect);
      }

      if (domUtils.getSelectedOption(this.streetSelect)) {
        address.street = this._getSelectValueAsObect(this.streetSelect);
      }

      var houseNumberObj = this._nummerFilteringSelect.item;
      if (houseNumberObj) {
        address.housenumber = {
          id: houseNumberObj.id,
          name: houseNumberObj.label
        };
      }
      else if (this._nummerFilteringSelect.get('value')) {
        address.housenumber = {name: this._nummerFilteringSelect.get('value')};
      }

      return address;
    },

    _getSelectValueAsObect: function (select) {
      //console.debug('CrabZoomer::_getSelectValueAsObect');
      return {
        id: domUtils.getSelectedOption(select),
        name: domUtils.getSelectedOptionLabel(select)
      }
    },

    _setValueAttr: function (location) {
      //console.debug('CrabZoomer::_setValueAttr', location);
      this.value = location;
      if (location.province) {
        this._setProvince(location.province.id);
      }
      else if (location.municipality) {
        this._setMunicipality(location.municipality.id);

      }
    },

    getBbox: function () {
      //console.debug('CrabZoomer::getBbox');
      var bbox = null;
      var url = null;
      var number = this._nummerFilteringSelect.item ? this._nummerFilteringSelect.item.id : null;
      var street = domUtils.getSelectedOption(this.streetSelect);
      var municipality = domUtils.getSelectedOption(this.municipalitySelect);

      if (number) {url = this.baseUrl + "/crab/huisnummers/" + number;}
      else if (street) {url = this.baseUrl + "/crab/straten/" + street;}
      else if (municipality) {url = this.baseUrl + "/crab/gemeenten/" + municipality;}

      if (url) {
        request(url, {
          handleAs: "json",
          sync: true,
          headers: {
            "X-Requested-With": ""
          }
        }).then(function (jsondata) {
            if (jsondata.bounding_box) {
              bbox = array.map(jsondata.bounding_box, function (item) {
                return parseFloat(item);
              });
            }
          },
          function (error) {
            self._errorHandler(error);
          });
      }

      return bbox;
    },

    _fillGewestSelect: function (data) {
      //console.debug('CrabZoomer::_fillGewestSelect', data);
      domUtils.addSelectOptions(this.gewestSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'naam',
        placeholder: 'Kies een gewest'
      });
    },

    _fillProvinceSelect: function (data) {
      //console.debug('CrabZoomer::_fillProvinceSelect', data);
      domUtils.addSelectOptions(this.provinceSelect, {
        data: data,
        idProperty: 'niscode',
        labelProperty: 'naam',
        placeholder: 'Kies een provincie'
      });
    },

    _fillMunicipalitySelect: function (data) {
      //console.debug('CrabZoomer::_fillMunicipalitySelect', data);
      domUtils.addSelectOptions(this.municipalitySelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'naam',
        placeholder: 'Kies een gemeente'
      });
    },

    _fillStreetSelect: function (data) {
      //console.debug('CrabZoomer::_fillStreetSelect', data);
      domUtils.addSelectOptions(this.streetSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'label',
        placeholder: 'Kies een straat'
      });
    },

    _fillNumberSelect: function (nummers) {
      console.debug('CrabZoomer::_fillNumberSelect', nummers);
      if (nummers) {
        this._nummerFilteringSelect.set('store', new Memory({data: nummers}));
      }
    },

    _setGewest: function (value) {
      //console.debug('CrabZoomer::_setGewest', value);
      domUtils.setSelectedOptions(this.gewestSelect, [value]);
      this._gewestChange();
    },

    _setProvince: function (value) {
      //console.debug('CrabZoomer::_setProvince', value);
      domUtils.setSelectedOptions(this.provinceSelect, [value]);
      this._provinceChange();
    },

    _setMunicipality: function (value) {
      //console.debug('CrabZoomer::_setMunicipality', value);
      domUtils.setSelectedOptions(this.municipalitySelect, [value]);
      this._municipalityChange();
    },

    _setStreet: function (value) {
      //console.debug('CrabZoomer::_setStreet', value);
      domUtils.setSelectedOptions(this.streetSelect, [value]);
      this._streetChange();
    },

    _setNumber: function (value) {
      console.debug('CrabZoomer::_setNumber', value);
      if (!value) {
        this._nummerFilteringSelect.reset();
        return;
      }

      if (value.id) {
        var huisnummerObj = this._nummerFilteringSelect.store.get(value.id);
        this._nummerFilteringSelect.set('item', huisnummerObj);
      }
      else if (value.name) {
        this._nummerFilteringSelect.set('value', value.name);
      }
      this._numberChange();
    }
  });
});