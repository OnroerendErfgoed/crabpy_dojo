define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/request',
  'dojo/promise/all',
  'dojo/dom-attr',
  'dojo/dom-construct',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  './utils/DomUtils'
], function (
  declare,
  array,
  lang,
  request,
  all,
  domAttr,
  domConstruct,
  _WidgetBase,
  _TemplatedMixin,
  domUtils
) {
  return declare([_WidgetBase, _TemplatedMixin], {

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
    gewestList: [
      {id: 1, naam: 'Brussels Hoofdstedelijk Gewest'},
      {id: 2, naam: 'Vlaams Gewest'},
      {id: 3, naam: 'Waals Gewest'}
    ],
    provinceList: null,
    provinceCache: [
      {niscode: 10000, naam: 'Antwerpen', gewest: {id: 2}},
      {niscode: 20001, naam: 'Vlaams-Brabant', gewest: {id: 2}},
      {niscode: 30000, naam: 'West-Vlaanderen', gewest: {id: 2}},
      {niscode: 40000, naam: 'Oost-Vlaanderen', gewest: {id: 2}},
      {niscode: 70000, naam: 'Limburg', gewest: {id: 2}},
      {niscode: 20002, naam: 'Waals-Brabant', gewest: {id: 3}},
      {niscode: 50000, naam: 'Henegouwen', gewest: {id: 3}},
      {niscode: 60000, naam: 'Luik', gewest: {id: 3}},
      {niscode: 80000, naam: 'Luxemburg', gewest: {id: 3}},
      {niscode: 90000, naam: 'Namen', gewest: {id: 3}}
    ],
    municipalityList: null,
    municipalityCache: null,
    disabled: false,
    baseUrl: null,
    alleGewesten: null,

    postCreate: function () {
      // console.debug('CrabZoomer::postCreate', this.alleGewesten);
      this.inherited(arguments);
    },

    startup: function () {
      //console.debug('CrabZoomer::startup');
      this.inherited(arguments);

      if (this.alleGewesten) {
        this._fillGewestSelect(this.gewestList);
        domAttr.remove(this.gewestSelect, 'disabled');
      }
      else {
        domConstruct.destroy(this.gewestSelect);
        this.provinceCache = array.filter(this.provinceCache, function (item){
          return item.gewest.id === 2; // enkel provincies van Vlaams Gewest
        });
      }
      this.provinceList = this.provinceCache.sort(this.sortMethod);
      this._fillProvinceSelect(this.provinceList);
      domAttr.remove(this.provinceSelect, 'disabled');

      this._getGemeentenByGewest(this.alleGewesten ? [1, 2, 3] : [2]).then(
        lang.hitch(this, function (jsondata) {
          this.municipalityCache = jsondata;
          this.municipalityList = jsondata;
          this._fillMunicipalitySelect(jsondata);
          domAttr.remove(this.municipalitySelect, 'disabled');
        })
      );

      this._fillStreetSelect([]);
      this._fillNumberSelect([]);
    },

    enable: function () {
      //console.debug('CrabZoomer::enable');
      this.disabled = false;
      if (this.alleGewesten) {
        domAttr.remove(this.gewestSelect, 'disabled');
      }
      domAttr.remove(this.provinceSelect, 'disabled');
      domAttr.remove(this.municipalitySelect, 'disabled');
      domAttr.remove(this.streetSelect, 'disabled');
      domAttr.remove(this.numberSelect, 'disabled');
    },

    disable: function () {
      //console.debug('CrabZoomer::disable');
      this.disabled = true;
      if (this.alleGewesten) {
        domAttr.set(this.gewestSelect, 'disabled', true);
      }
      domAttr.set(this.provinceSelect, 'disabled', true);
      domAttr.set(this.municipalitySelect, 'disabled', true);
      domAttr.set(this.streetSelect, 'disabled', true);
      domAttr.set(this.numberSelect, 'disabled', true);
    },

    _gewestChange: function () {
      var value = domUtils.getSelectedOption(this.gewestSelect);
      // console.debug('CrabZoomer::_gewestChange', value);

      this.disable();
      this._fillStreetSelect([]);
      this._fillNumberSelect([]);

      if (!value) {
        this.provinceList = this.provinceCache.sort(this.sortMethod);
        this._fillProvinceSelect(this.provinceCache);
        this._fillMunicipalitySelect(this.municipalityCache);
        domAttr.remove(this.gewestSelect, 'disabled');
        domAttr.remove(this.provinceSelect, 'disabled');
        domAttr.remove(this.municipalitySelect, 'disabled');
        return false;
      }

      this.provinceList = array.filter(this.provinceCache, function (item){
        return item.gewest.id === parseInt(value);
      });
      this._fillProvinceSelect(this.provinceList);
      domAttr.remove(this.gewestSelect, 'disabled');
      if (this.provinceList.length > 0){
        domAttr.remove(this.provinceSelect, 'disabled');
      }

      this._getGemeentenByGewest(value).then(
        lang.hitch(this, function (jsondata) {
          this.municipalityList = jsondata;
          this._fillMunicipalitySelect(jsondata);
          domAttr.remove(this.municipalitySelect, 'disabled');
        })
      );
    },

    _provinceChange: function () {
      //console.debug('CrabZoomer::_provinceChange');
      var value = domUtils.getSelectedOption(this.provinceSelect);

      this.disable();
      this._fillStreetSelect([]);
      this._fillNumberSelect([]);

      if (!value) {
        this._fillMunicipalitySelect(this.municipalityCache);
        if (this.alleGewesten) {
          domAttr.remove(this.gewestSelect, 'disabled');
        }
        domAttr.remove(this.provinceSelect, 'disabled');
        domAttr.remove(this.municipalitySelect, 'disabled');
        return false;
      }

      this._crabGet('provincies/' + value + '/gemeenten', this.sortMethod).then(
        lang.hitch(this, function (jsondata) {
          this._fillMunicipalitySelect(jsondata);
          if (this.alleGewesten) {
            domAttr.remove(this.gewestSelect, 'disabled');
          }
          domAttr.remove(this.provinceSelect, 'disabled');
          domAttr.remove(this.municipalitySelect, 'disabled');

          var location = this.value;
          if (location && location.municipality && location.province && location.province.id === value) {
            this._setMunicipality(location.municipality.id);
          }
        })
      );
    },

    _municipalityChange: function () {
      //console.debug('CrabZoomer::_municipalityChange');
      var value = domUtils.getSelectedOption(this.municipalitySelect);

      this.disable();
      this._fillStreetSelect([]);
      this._fillNumberSelect([]);      

      if (!value) {
        if (this.alleGewesten) {
          domAttr.remove(this.gewestSelect, 'disabled');
        }
        if (this.provinceList.length > 0){
          domAttr.remove(this.provinceSelect, 'disabled');
        }
        domAttr.remove(this.municipalitySelect, 'disabled');
        return false;
      }

      this._crabGet('gemeenten/' + value + '/straten', this.sortMethod).then(
        lang.hitch(this, function (jsondata) {
          this._fillStreetSelect(jsondata);
          if (this.alleGewesten) {
            domAttr.remove(this.gewestSelect, 'disabled');
          }
          if (this.provinceList.length > 0){
            domAttr.remove(this.provinceSelect, 'disabled');
          }
          domAttr.remove(this.municipalitySelect, 'disabled');
          domAttr.remove(this.streetSelect, 'disabled');

          var location = this.value;
          if (location && location.street && location.municipality && location.municipality.id === value) {
            this._setStreet(location.street.id);
          }
        })
      );
    },

    _streetChange: function () {
      //console.debug('CrabZoomer::_streetChange');
      var value = domUtils.getSelectedOption(this.streetSelect);

      this.disable();
      this._fillNumberSelect([]); 

      if (!value) {
        if (this.alleGewesten) {
          domAttr.remove(this.gewestSelect, 'disabled');
        }
        if (this.provinceList.length > 0){
          domAttr.remove(this.provinceSelect, 'disabled');
        }
        domAttr.remove(this.municipalitySelect, 'disabled');
        domAttr.remove(this.streetSelect, 'disabled');
        return false;
      }

      this._crabGet('straten/' + value + '/huisnummers', this.sortMethod).then(
        lang.hitch(this, function (jsondata) {
          this._fillNumberSelect(jsondata);
          if (this.alleGewesten) {
            domAttr.remove(this.gewestSelect, 'disabled');
          }
          if (this.provinceList.length > 0){
            domAttr.remove(this.provinceSelect, 'disabled');
          }
          domAttr.remove(this.municipalitySelect, 'disabled');
          domAttr.remove(this.streetSelect, 'disabled');
          domAttr.remove(this.numberSelect, 'disabled');

          var location = this.value;
          if (location && location.housenumber && location.street && location.street.id === value) {
            this._setNumber(location.housenumber.id);
          }
        })
      );
    },

    _numberChange: function () {
      var value = domUtils.getSelectedOption(this.numberSelect);
      //console.debug('CrabZoomer::_numberChange', value);
    },

    _errorHandler: function (e){
      console.error("An error occurred in the crabpy dijit: " + e);
      this.reset();
      alert('Er is een fout opgetreden bij het aanspreken van de CRAB service');
    },

    reset: function () {
      console.debug('CrabZoomer::reset');
      if (this.alleGewesten) {
        domUtils.setSelectedOptions(this.gewestSelect, ['']);
      }
      this._fillProvinceSelect(this.provinceCache);
      this._fillMunicipalitySelect(this.municipalityCache);
      this._fillStreetSelect([]);
      this._fillNumberSelect([]);
      domAttr.remove(this.gewestSelect, 'disabled');
      domAttr.remove(this.provinceSelect, 'disabled');
      domAttr.remove(this.municipalitySelect, 'disabled');
      domAttr.set(this.streetSelect, 'disabled', true);
      domAttr.set(this.numberSelect, 'disabled', true);
    },

    _getValueAttr: function () {
      console.debug('CrabZoomer::_getValueAttr');
      var address = {};

      if (domUtils.getSelectedOption(this.gewestSelect)) {
        address.region = this._getSelectValueAsObect(this.gewestSelect);
      }

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
      //console.debug('CrabZoomer::_getSelectValueAsObect');
      return {
        id: domUtils.getSelectedOption(select),
        name: domUtils.getSelectedOptionLabel(select)
      };
    },

    _setValueAttr: function (location) {
      //console.debug('CrabZoomer::_setValueAttr', location);
      this.value = location;
      if (this.alleGewesten) {
        this._setRegion(location.region ? location.region.id : '');
      }
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
      // console.debug('CrabZoomer::_fillGewestSelect', data);
      domUtils.addSelectOptions(this.gewestSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'naam',
        placeholder: 'Kies een gewest'
      });
    },

    _fillProvinceSelect: function (data) {
      // console.debug('CrabZoomer::_fillProvinceSelect', data);
      domUtils.addSelectOptions(this.provinceSelect, {
        data: data,
        idProperty: 'niscode',
        labelProperty: 'naam',
        placeholder: 'Kies een provincie'
      });
      domUtils.setSelectedOptions(this.provinceSelect, ['']);
    },

    _fillMunicipalitySelect: function (data) {
      // console.debug('CrabZoomer::_fillMunicipalitySelect', data);
      domUtils.addSelectOptions(this.municipalitySelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'naam',
        placeholder: 'Kies een gemeente'
      });
      domUtils.setSelectedOptions(this.municipalitySelect, ['']);
    },

    _fillStreetSelect: function (data) {
      // console.debug('CrabZoomer::_fillStreetSelect', data);
      domUtils.addSelectOptions(this.streetSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'label',
        placeholder: 'Kies een straat'
      });
      domUtils.setSelectedOptions(this.streetSelect, ['']);
    },

    _fillNumberSelect: function (data) {
      //console.debug('CrabZoomer::_fillNumberSelect', data);
      domUtils.addSelectOptions(this.numberSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'label',
        placeholder: 'Kies een huisnummer'
      });
    },

    _setRegion: function (value) {
      // console.debug('CrabZoomer::_setRegion', value);
      domUtils.setSelectedOptions(this.gewestSelect, [value.toString()]);
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
      //console.debug('CrabZoomer::_setNumber', value);
      domUtils.setSelectedOptions(this.numberSelect, [value]);
      this._numberChange();
    },

    _getGemeentenByGewest: function (gewesten) {
      // console.debug('CrabZoomer::_getGemeentenByGewest', gewesten);
      var promises = [];
      array.forEach(gewesten,function (gewest){
        promises.push(this._crabGet('gewesten/' + gewest + '/gemeenten'));
      }, this);
      return all(promises).then(
        lang.hitch(this, function (responses) {
          var gemeenten = [];
          array.forEach(responses,function (item){
            gemeenten = gemeenten.concat(item);
          });
          return this.sortMethod ? gemeenten.sort(this.sortMethod) : gemeenten;

        })
      );
    },

    _crabGet: function (path, sortMethod) {
      // console.debug('CrabZoomer::_crabGet', path);
      return request(this.baseUrl + '/crab/' + path, {
        handleAs: 'json',
        headers: {
          'X-Requested-With': '',
          'Accept': 'application/json'
        }
      }).then(
        lang.hitch(this, function (jsondata) {
          return sortMethod ? jsondata.sort(sortMethod) : jsondata;
        }),
        lang.hitch(this, function (error) {
          this._errorHandler(error);
        })
      );
    }
  });
});