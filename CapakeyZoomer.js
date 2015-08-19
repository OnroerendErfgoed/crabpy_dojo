define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/request',
  'dojo/dom-attr',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  './utils/DomUtils'
], function (
  declare,
  array,
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
    '   <legend>Perceel:</legend>' +
    '   <select data-dojo-attach-point="gemeenteSelect" data-dojo-attach-event="onchange:_gemeenteChange" disabled></select>' +
    '   <select data-dojo-attach-point="afdelingSelect" data-dojo-attach-event="onchange:_afdelingChange" disabled></select>' +
    '   <select data-dojo-attach-point="sectieSelect" data-dojo-attach-event="onchange:_sectieChange" disabled></select>' +
    '   <select data-dojo-attach-point="perceelSelect" data-dojo-attach-event="onchange:_perceelChange" disabled></select>' +
    ' </fieldset>' +
    '</div>',
    baseClass: null,
    value: null,
    name: null,
    sortMethod: null,
    gemeenteList: null,
    disabled: false,
    baseUrl: null,

    postCreate: function () {
      //console.debug('CapakeyZoomer::postCreate');
      this.inherited(arguments);

      this._fillGemeenteSelect(this.gemeenteList);
      this._fillAfdelingSelect([]);
      this._fillSectieSelect([]);
      this._fillPerceelSelect([]);

      var self = this;

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
            self.gemeenteList  = jsondata;
            self._fillGemeenteSelect(jsondata);
            domAttr.remove(self.gemeenteSelect, "disabled");
          },
          function (error) {
            console.log("An error occurred: " + error);
          });
      }
      else {
        domAttr.remove(self.gemeenteSelect, "disabled");
      }
    },

    startup: function () {
      //console.debug('CapakeyZoomer::startup');
      this.inherited(arguments);
    },

    _errorHandler: function (e){
      console.error("An error occurred in the crabpy dijit: " + e);
      this.reset();
      alert('Er is een fout opgetreden bij het aanspreken van de CRAB service');
    },

    reset: function () {
      //console.debug('CapakeyZoomer::reset');
      this._fillGemeenteSelect(this.gemeenteList);
      this._fillAfdelingSelect([]);
      this._fillSectieSelect([]);
      this._fillPerceelSelect([]);

      this._setGemeente('');
      this._setAfdeling('');
      this._setSectie('');
      this._setPerceel('');

      domAttr.remove(this.gemeenteSelect, "disabled");
      domAttr.set(this.afdelingSelect, "disabled", true);
      domAttr.set(this.sectieSelect, "disabled", true);
      domAttr.set(this.perceelSelect, "disabled", true);
    },


    enable: function () {
      //console.debug('CapakeyZoomer::enable');
      this.disabled = false;
      domAttr.remove(this.gemeenteSelect, "disabled");
      domAttr.remove(this.afdelingSelect, "disabled");
      domAttr.remove(this.sectieSelect, "disabled");
      domAttr.remove(this.perceelSelect, "disabled");
    },

    disable: function () {
      //console.debug('CapakeyZoomer::disable');
      this.disabled = true;
      domAttr.set(this.gemeenteSelect, "disabled", true);
      domAttr.set(this.afdelingSelect, "disabled", true);
      domAttr.set(this.sectieSelect, "disabled", true);
      domAttr.set(this.perceelSelect, "disabled", true);
    },

    _getValueAttr: function () {
      //console.debug('CapakeyZoomer::_getValueAttr');
      var address = {};

      if (domUtils.getSelectedOption(this.gemeenteSelect)) {
        address.gemeente = this._getSelectValueAsObect(this.gemeenteSelect);
      }
      if (domUtils.getSelectedOption(this.afdelingSelect)) {
        address.afdeling = this._getSelectValueAsObect(this.afdelingSelect);
      }
      if (domUtils.getSelectedOption(this.sectieSelect)) {
        address.sectie = this._getSelectValueAsObect(this.sectieSelect);
      }
      if (domUtils.getSelectedOption(this.perceelSelect)) {
        address.perceel = this._getSelectValueAsObect(this.perceelSelect);
      }

      return address;
    },

    _getSelectValueAsObect: function (select) {
      //console.debug('CapakeyZoomer::_getSelectValueAsObect');
      return {
        id: domUtils.getSelectedOption(select),
        name: domUtils.getSelectedOptionLabel(select)
      }
    },

    _setValueAttr: function (location) {
      //console.debug('CapakeyZoomer::_setValueAttr');
      this.value = location;
      if (location.gemeente) {
        this._setGemeente(location.gemeente.id);
      }
    },

    getBbox: function () {
      //console.debug('CapakeyZoomer::getBbox');
      var bbox = null;
      var url = null;

      var perceel = domUtils.getSelectedOption(this.perceelSelect);
      var sectie = domUtils.getSelectedOption(this.sectieSelect);
      var afdeling = domUtils.getSelectedOption(this.afdelingSelect);
      var gemeente = domUtils.getSelectedOption(this.gemeenteSelect);

      if (perceel && sectie && afdeling) {
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
            if (jsondata.bounding_box) {
              bbox = array.map(jsondata.bounding_box, function (item) {
                return parseFloat(item);
              });
            }
          },
          function (error) {
            console.log("An error occurred: " + error);
          });
      }
      return bbox;
    },

    _fillGemeenteSelect: function (data) {
      //console.debug('CapakeyZoomer::_fillGemeenteSelect', data);
      domUtils.addSelectOptions(this.gemeenteSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'naam',
        placeholder: 'Kies een gemeente'
      });
    },

    _fillAfdelingSelect: function (data) {
      //console.debug('CapakeyZoomer::_fillAfdelingSelect', data);
      domUtils.addSelectOptions(this.afdelingSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'naam',
        placeholder: 'Kies een afdeling'
      });
    },

    _fillSectieSelect: function (data) {
      //console.debug('CapakeyZoomer::_fillSectieSelect', data);
      domUtils.addSelectOptions(this.sectieSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'id',
        placeholder: 'Kies een sectie'
      });
    },

    _fillPerceelSelect: function (data) {
      //console.debug('CapakeyZoomer::_fillPerceelSelect', data);
      domUtils.addSelectOptions(this.perceelSelect, {
        data: data,
        idProperty: 'id',
        labelProperty: 'capakey',
        placeholder: 'Kies een perceel'
      });
    },

    _gemeenteChange: function () {
      var value = domUtils.getSelectedOption(this.gemeenteSelect);
      //console.debug('CapakeyZoomer::_gemeenteChange', value);

      this._setAfdeling('');
      this._setSectie('');
      this._setPerceel('');
      this.disable();

      if (!value) {
        this._fillAfdelingSelect([]);
        this._fillSectieSelect([]);
        this._fillPerceelSelect([]);
        domAttr.remove(this.gemeenteSelect, "disabled");
        return false;
      }

      var self = this;

      request(this.baseUrl + "/capakey/gemeenten/" + value + "/afdelingen", {
        handleAs: "json",
        headers: {
          "X-Requested-With": ""
        }
      }).then(
        function (jsondata) {
          if (self.sortMethod) {
            jsondata.sort(self.sortMethod);
          }

          self._fillAfdelingSelect(jsondata);
          domAttr.remove(self.gemeenteSelect, "disabled");
          domAttr.remove(self.afdelingSelect, "disabled");
          var location = self.value;
          if (location && location.afdeling && location.gemeente && location.gemeente.id == value) {
            self._setAfdeling(location.afdeling.id);
          }
        },
        function (error) {
          self._errorHandler(error);
        }
      );

    },

    _afdelingChange: function () {
      var value = domUtils.getSelectedOption(this.afdelingSelect);
      //console.debug('CapakeyZoomer::_afdelingChange', value);

      this._setSectie('');
      this._setPerceel('');
      this.disable();

       if (!value) {
        this._fillSectieSelect([]);
        this._fillPerceelSelect([]);
        domAttr.remove(this.gemeenteSelect, "disabled");
        domAttr.remove(this.afdelingSelect, "disabled");
        return false;
      }

      var self = this;

      request(this.baseUrl + "/capakey/afdelingen/" + value + "/secties", {
        handleAs: "json",
        headers: {
          "X-Requested-With": ""
        }
      }).then(function (jsondata) {
          self._fillSectieSelect(jsondata);
          domAttr.remove(self.gemeenteSelect, "disabled");
          domAttr.remove(self.afdelingSelect, "disabled");
          domAttr.remove(self.sectieSelect, "disabled");
          var location = self.value;
          if (location && location.sectie && location.afdeling && location.afdeling.id == value) {
            self._setSectie(location.sectie.id);
          }
        },
        function (error) {
          self._errorHandler(error);
        });
    },

    _sectieChange: function () {
      var value = domUtils.getSelectedOption(this.sectieSelect);
      var afdeling = domUtils.getSelectedOption(this.afdelingSelect);
      //console.debug('CapakeyZoomer::_sectieChange', value);

      this._setPerceel('');
      this.disable();

      if (!value) {
        this._fillPerceelSelect([]);
        domAttr.remove(this.gemeenteSelect, "disabled");
        domAttr.remove(this.afdelingSelect, "disabled");
        domAttr.remove(this.sectieSelect, "disabled");
        return false;
      }

      var self = this;

      request(self.baseUrl + "/capakey/afdelingen/" + afdeling + "/secties/" + value + "/percelen", {
        handleAs: "json",
        headers: {
          "X-Requested-With": ""
        }
      }).then(
        function (jsondata) {
          self._fillPerceelSelect(jsondata);
          domAttr.remove(self.gemeenteSelect, "disabled");
          domAttr.remove(self.afdelingSelect, "disabled");
          domAttr.remove(self.sectieSelect, "disabled");
          domAttr.remove(self.perceelSelect, "disabled");
          var location = self.value;
          if (location && location.perceel && location.sectie && location.sectie.id == value) {
            self._setPerceel(location.perceel.id);
          }
        },
        function (error) {
          self._errorHandler(error);
        }
      );
    },

    _perceelChange: function () {
      //console.debug('CapakeyZoomer::_perceelChange');
    },

    _setGemeente: function (value) {
      //console.debug('CapakeyZoomer::_setGemeente', value);
      domUtils.setSelectedOptions(this.gemeenteSelect, [value]);
      this._gemeenteChange();
    },

    _setAfdeling: function (value) {
      //console.debug('CapakeyZoomer::_setAfdeling', value);
      domUtils.setSelectedOptions(this.afdelingSelect, [value]);
      this._afdelingChange();
    },

    _setSectie: function (value) {
      //console.debug('CapakeyZoomer::_setSectie', value);
      domUtils.setSelectedOptions(this.sectieSelect, [value]);
      this._sectieChange();
    },

    _setPerceel: function (value) {
      //console.debug('CapakeyZoomer::_setPerceel', value);
      domUtils.setSelectedOptions(this.perceelSelect, [value]);
      this._perceelChange();
    }

  });
});