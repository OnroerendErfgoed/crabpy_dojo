/**
 * utils Module voor het werken met dom elementen
 * @module utils/DomUtils
 */
define([
  'dojo/_base/array',
  'dojo/dom-construct',
  'dojo/_base/lang',
  'dojo/_base/connect'
], function (
  array,
  domConstruct,
  lang,
  connect
) {
  return{
    /**
     * Geeft de geselecteerde 'option' terug uit de 'select'.
     * @param {Object} select De 'select' lijst
     * @returns {String} Value van de  geselecteerde 'option'
     */
    getSelectedOption: function (select) {
      return select.options[select.selectedIndex].value;
    },

    /**
     * Geeft het label van geselecteerde 'option' terug uit de 'select'.
     * @param {Object} select De 'select' lijst
     * @returns {String} Label van de  geselecteerde 'option'
     */
    getSelectedOptionLabel: function (select) {
      return select.options[select.selectedIndex].label;
    },


    /**
     * Zet een of meerdere 'options' geselecteerd voor een 'select' lijst.
     * @param {Object} select De 'select' lijst
     * @param {Array} values De geselecteerde 'option' waardes
     */
    setSelectedOptions: function (select, values) {
      var options = select && select.options;
      for (var i=0, iLen=options.length; i<iLen; i++) {
        options[i].selected = (values.indexOf(options[i].value) > -1)
      }
    },

    /**
     * Verwijder de opties
     * @param select {Object} select De 'select' lijst
     */
    resetSelectOptions: function (select) {
      domConstruct.empty(select);
    },

    /**
     * Voeg 'options' toe aan een 'select' lijst.
     * @param {Object} select De 'select' lijst
     * @param {Object} options Een object met de opties, formaat:
     *   {
     *     data: {array},
     *     idProperty: {string},
     *     labelProperty: {string},
     *     placeholder (optioneel): {string}
     *   }
     */
    addSelectOptions: function (select, options){
      domConstruct.empty(select);
      if (options.placeholder) {
        domConstruct.place('<option value="">' + options.placeholder + '</option>', select);
      }
      array.forEach(options.data, function (item) {
        domConstruct.place('<option value="' + item[options.idProperty] + '">' + item[options.labelProperty] + '</option>',
          select);
      });
    },

    /**
     * Verwijder de list items van een html <ul> lijst
     * @param ul {Object} De ul lijst
     */
    resetList: function (ul) {
      domConstruct.empty(ul);
    }

  }
});