require([
  'crabpy_dojo/CrabpyWidget',
  'dijit/form/Button',
  'dojo/dom',
  'dojo/json',
  'dojo/domReady!'
], function (
  CrabpyWidget,
  Button,
  dom,
  JSON
) {
  // init widget
  var crabpyWidget = new CrabpyWidget({
    name: "location",
    alleGewesten: true,
    baseUrl: "https://dev-geo.onroerenderfgoed.be"
    // baseUrl: "http://localhost:6543"
  });

  var crabZoomer = crabpyWidget.createCrabZoomer('widgetNode');
  crabZoomer.startup();

  new Button({
    label: "Get value",
    onClick: function(){
      // Do something:
      dom.byId("testResult").innerHTML = JSON.stringify(crabZoomer.get('value'));
    }
  }, "testButtonNode").startup();

  new Button({
    label: "Set value",
    onClick: function(){
      crabZoomer.set('value', {"provincie":{"niscode":"10000","name":"Antwerpen"},"gemeente":{"niscode":"13001","name":"Arendonk"},"straat":{"id":"12417","name":"Aartrijtstraat"},"adres":{"id":"712126","huisnummer":"6"}});
//                    crabZoomer.set('value', {"gemeente":{"niscode":"13001","name":"Arendonk"},"straat":{"id":"12417","name":"Aartrijtstraat"},"adres":{"id":"712126","huisnummer":"6"}});
//                    crabZoomer.set('value', {"provincie":{"id":"10000","name":"Antwerpen"}});
    }
  }, "test2ButtonNode").startup();

  new Button({
    label: "reset",
    onClick: function(){
      crabZoomer.reset();
      dom.byId("testResult").innerHTML = JSON.stringify(crabZoomer.get('value'));
      dom.byId("bboxResult").innerHTML = JSON.stringify(crabZoomer.getBbox());
    }
  }, "test3ButtonNode").startup();

  new Button({
    label: "get bbox",
    onClick: function(){
      dom.byId("bboxResult").innerHTML = JSON.stringify(crabZoomer.getBbox());
    }
  }, "test4ButtonNode").startup();

  new Button({
    label: "disable",
    onClick: function(){
      crabZoomer.disable();
    }
  }, "test5ButtonNode").startup();

  new Button({
    label: "enable",
    onClick: function(){
      crabZoomer.enable();
    }
  }, "test6ButtonNode").startup();


  //------------
  var capakeyZoomer = crabpyWidget.createCapakeyZoomer('widgetNodeB');
  capakeyZoomer.startup();

  new Button({
    label: "Get value",
    onClick: function(){
      // Do something:
      dom.byId("testBResult").innerHTML = JSON.stringify(capakeyZoomer.get('value'));
    }
  }, "testBButtonNode").startup();

  new Button({
    label: "Set value",
    onClick: function(){
      capakeyZoomer.set('value', {"gemeente":{"id":"11001","name":"Aartselaar"},"afdeling":{"id":"11001","name":"AARTSELAAR 1 AFD"},"sectie":{"id":"B","name":"B"},"perceel":{"id":"0008/00H002","name":"11001B0008/00H002"}});
    }
  }, "testB2ButtonNode").startup();

  new Button({
    label: "reset",
    onClick: function(){
      capakeyZoomer.reset();
      dom.byId("testBResult").innerHTML = JSON.stringify(capakeyZoomer.get('value'));
      dom.byId("bboxBResult").innerHTML = JSON.stringify(capakeyZoomer.getBbox());
    }
  }, "testB3ButtonNode").startup();

  new Button({
    label: "get bbox",
    onClick: function(){
      dom.byId("bboxBResult").innerHTML = capakeyZoomer.getBbox();
    }
  }, "testB4ButtonNode").startup();

  new Button({
    label: "disable",
    onClick: function(){
      capakeyZoomer.disable();
    }
  }, "testB5ButtonNode").startup();

  new Button({
    label: "enable",
    onClick: function(){
      capakeyZoomer.enable();
    }
  }, "testB6ButtonNode").startup();

  new Button({
    label: 'set region',
    onClick: function(){
      crabZoomer.set('value', {'gewest': {'niscode': 2000, 'naam': 'Vlaams Gewest'}});
    }
  }, 'test7ButtonNode').startup();
});