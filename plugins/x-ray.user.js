// ==UserScript==
// @id             iitc-plugin-x-ray
// @name           IITC Plugin: X-Ray
// @category       Portals
// @version        0.1.0.@@DATETIMEVERSION@@
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUILDNAME@@-@@BUILDDATE@@] Draw all portals for current view. May perform MANY requests to Intel site for large scales
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

@@PLUGINSTART@@

// PLUGIN START ////////////////////////////////////////////////////////



// use own namespace for plugin
window.plugin.xRay = function () {};

window.plugin.xRay.originalFunc = undefined;
window.plugin.xRay.xRayFunc = function (zoom) {
    return 17;
};

window.plugin.xRay.setup = function () {

    window.plugin.xRay.layer = L.layerGroup([]);
    window.addLayerGroup('Show ALL portals', plugin.xRay.layer, false);

    window.map.on('layeradd', function (e) {
        if (e.layer === window.plugin.xRay.layer) {
            window.plugin.xRay.originalFunc = window.getDataZoomForMapZoom;
            window.getDataZoomForMapZoom = window.plugin.xRay.xRayFunc;
        }
    });
    window.map.on('layerremove', function (e) {

        if (e.layer === window.plugin.xRay.layer) {
            window.getDataZoomForMapZoom = window.plugin.xRay.originalFunc;
        }
    });

}

var setup = plugin.xRay.setup;

// PLUGIN END //////////////////////////////////////////////////////////

@@PLUGINEND@@
