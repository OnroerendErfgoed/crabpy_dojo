define([
  'dojo/_base/declare',
  'dojo/request',
  'dojo/dom-attr',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  './utils/DomUtils'
], function (
  declare,
  request,
  domAttr,
  _WidgetBase,
  _TemplatedMixin,
  domUtils
) {
  return declare([_WidgetBase, _TemplatedMixin], {

    templateString: '' +
    '<div data-dojo-attach-point="containerNode">' +
    ' <fieldset>' +
    '   <legend>Adres:</legend>' +
    '   <select data-dojo-attach-point="provinceSelect" data-dojo-attach-event="onchange:_provinceChange" disabled></select>' +
    '   <select data-dojo-attach-point="municipalitySelect" data-dojo-attach-event="onchange:_municipalityChange" disabled></select>' +
    '   <select data-dojo-attach-point="streetSelect" data-dojo-attach-event="onchange:_streetChange" disabled></select>' +
    '   <select data-dojo-attach-point="numberSelect" data-dojo-attach-event="onchange:_numberChange" disabled></select>' +
    ' </fieldset>' +
    '</div>',
    baseClass: null,
    value: null,
    name: null,
    sortMethod: null,
    provinceList: null,
    municipalityList: null,
    disabled: false,
    baseUrl: null,

    postCreate: function () {
      console.debug('CrabZoomer::postCreate');
      this.inherited(arguments);

      this._fillProvinceSelect(this.provinceList);
      this._fillMunicipalitySelect(this.municipalityList);
      this._fillStreetSelect([]);
      this._fillNumberSelect([]);

      var self = this;

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
            console.error("An error occurred: " + error);
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
            console.error("An error occurred: " + error);
          }
        );
      }
      else {
        domAttr.remove(self.municipalitySelect, "disabled");
      }
    },

    startup: function () {
      console.debug('CrabZoomer::startup');
      this.inherited(arguments);
    },

    enable: function () {
      console.debug('CrabZoomer::enable');
      this.disabled = false;
      domAttr.remove(this.provinceSelect, "disabled");
      domAttr.remove(this.municipalitySelect, "disabled");
      domAttr.remove(this.streetSelect, "disabled");
      domAttr.remove(this.numberSelect, "disabled");
    },

    disable: function () {
      console.debug('CrabZoomer::disable');
      this.disabled = true;
      domAttr.set(this.provinceSelect, "disabled", true);
      domAttr.set(this.municipalitySelect, "disabled", true);
      domAttr.set(this.streetSelect, "disabled", true);
      domAttr.set(this.numberSelect, "disabled", true);
    },

    _provinceChange: function () {
      console.debug('CrabZoomer::_provinceChange');
      var value = domUtils.getSelectedOption(this.provinceSelect);
      console.log('Province:', value);

      this.disable();
      this._setMunicipality('');
      this._setStreet('');
      this._setNumber('');

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
            console.debug('_provinceChange::location', location);
            self._setMunicipality(location.municipality.id);
          }
        },
        function (error) {
          self._errorHandler(error);
        }
      );
    },

    _municipalityChange: function () {
      console.debug('CrabZoomer::_municipalityChange');
      var value = domUtils.getSelectedOption(this.municipalitySelect);
      console.log('Municipality:', value);

      this.disable();
      this._setStreet('');
      this._setNumber('');

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
      console.debug('CrabZoomer::_streetChange');
      var value = domUtils.getSelectedOption(this.streetSelect);
      console.log('Street:', value);

      this.disable();
      this._setNumber('');

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
          domAttr.remove(self.numberSelect, "disabled");

          var location = self.value;
          if (location && location.housenumber && location.street && location.street.id == value) {
            self._setNumber(location.housenumber.id);
          }
        },
        function (error) {
          self._errorHandler(error);
        }
      );
    },

    _numberChange: function () {
      console.debug('CrabZoomer::_numberChange');
      var value = domUtils.getSelectedOption(this.numberSelect);
      console.log('Number:', value);
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
      domAttr.set(this.numberSelect, "disabled", true);
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

      if (domUtils.getSelectedOption(this.numberSelect)) {
        address.housenumber = this._getSelectValueAsObect(this.numberSelect);
      }

      return address;
    },

    _getSelectValueAsObect: function (select) {
      console.debug('CrabZoomer::_getSelectValueAsObect');
      return {
        id: domUtils.getSelectedOption(select),
        name: domUtils.getSelectedOptionLabel(select)
      }
    },

    _setValueAttr: function (location) {
      console.debug('CrabZoomer::_setValueAttr', location);
      this.value = location;
      if (location.province) {
        this._setProvince(location.province.id);
      }
      else if (location.municipality) {
        this._setMunicipality(location.municipality.id);

      }
    },

    getBbox: function () {
      console.debug('CrabZoomer::getBbox');
      var bbox = null;
      var url = null;
      var number = domUtils.getSelectedOption(this.numberSelect);
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
            bbox = jsondata.bounding_box;
          },
          function (error) {
            console.log("An error occurred: " + error);
          });
      }

      return bbox;
    },

    _fillProvinceSelect: function (data) {
      console.debug('CrabZoomer::_fillProvinceSelect', data);
      domUtils.addSelectOptions(this.provinceSelect, {
        data: data,
        idProperty: 'niscode',
        labelProperty: 'naam',
        placeholder: 'Kies een provincie'
      });
    },

    _fillMunicipalitySelect: function (data) {
      console.debug('CrabZoomer::_fillMunicipalitySelect', data);
      domUtils.addSelectOptions(this.municipalitySelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'naam',
        placeholder: 'Kies een gemeente'
      });
    },

    _fillStreetSelect: function (data) {
      console.debug('CrabZoomer::_fillStreetSelect', data);
      domUtils.addSelectOptions(this.streetSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'label',
        placeholder: 'Kies een straat'
      });
    },

    _fillNumberSelect: function (data) {
      console.debug('CrabZoomer::_fillNumberSelect', data);
      domUtils.addSelectOptions(this.numberSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'label',
        placeholder: 'Kies een huisnummer'
      });
    },

    _setProvince: function (value) {
      console.debug('CrabZoomer::_setProvince', value);
      domUtils.setSelectedOptions(this.provinceSelect, [value]);
      this._provinceChange();
    },

    _setMunicipality: function (value) {
      console.debug('CrabZoomer::_setMunicipality', value);
      domUtils.setSelectedOptions(this.municipalitySelect, [value]);
      this._municipalityChange();
    },

    _setStreet: function (value) {
      console.debug('CrabZoomer::_setStreet', value);
      domUtils.setSelectedOptions(this.streetSelect, [value]);
      this._streetChange();
    },

    _setNumber: function (value) {
      console.debug('CrabZoomer::_setNumber', value);
      domUtils.setSelectedOptions(this.numberSelect, [value]);
      this._numberChange();
    }
  });
});