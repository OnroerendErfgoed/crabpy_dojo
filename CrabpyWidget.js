define([
    "mijit/_WidgetBase",
    "dojo/_base/declare",
    "./CrabZoomer"
], function (_WidgetBase, declare, CrabZoomer) {

    return declare([_WidgetBase], {

        baseClass: "crabpyselect",
        provinceList: null,
        municipalityList: null,
        baseUrl: null,

        postCreate: function () {
            this.inherited(arguments);

            this.sortMethod = this._sortNatural;
        },

        startup: function () {
            this.inherited(arguments);
        },

        createCrabZoomer: function (node) {
            return new CrabZoomer({
                name: "crabzoomer",
                baseUrl: this.baseUrl,
                baseClass: this.baseClass
            }, node);
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