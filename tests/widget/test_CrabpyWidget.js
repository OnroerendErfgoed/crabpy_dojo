require([
    "crabpy_dojo/CrabpyWidget",
    "dojo-form-controls/Button",
    "dojo/dom",
    "dojo/json",
    "dojo/domReady!"
], function (
    CrabpyWidget,
    Button,
    dom,
    JSON
) {
    // init widget
    var crabpyWidget = new CrabpyWidget({
        name: "location",
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
            crabZoomer.set('value', {"province":{"id":"10000","name":"Antwerpen"},"municipality":{"id":"44","name":"Arendonk"},"street":{"id":"12417","name":"Aartrijtstraat"},"housenumber":{"id":"537126","name":"6"}});
//                    crabZoomer.set('value', {"municipality":{"id":"44","name":"Arendonk"},"street":{"id":"12417","name":"Aartrijtstraat"},"housenumber":{"id":"537126","name":"6"}});
//                    crabZoomer.set('value', {"province":{"id":"10000","name":"Antwerpen"}});
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
            dom.byId("bboxResult").innerHTML = crabZoomer.getBbox();
        }
    }, "test4ButtonNode").startup();


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
});