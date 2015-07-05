// ==UserScript==
// @id             iitc-plugin-x-ray
// @name           IITC Plugin: X-Ray
// @category       Portals
// @version        1.0.1.@@DATETIMEVERSION@@
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUILDNAME@@-@@BUILDDATE@@] Draw "specified or higher" portals for current view. May perform MANY requests to Intel site for large scales
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

window.plugin.xRay.originalFunc = function(zoom) {return 0;};
window.plugin.xRay.xRayFunc = function (zoom) {
    return Math.max($('#xray-level').val(), window.plugin.xRay.originalFunc(zoom));
};

window.plugin.xRay.setup = function () {

    window.plugin.xRay.layer = L.layerGroup([]);
    window.addLayerGroup('Force <select id="xray-level">\
        <option value="17">0+ portals</option>\
        <option value="15">1+ portals</option>\
        <option value="13">2+ portals</option>\
        <option value="12">3+ portals</option>\
        <option value="10">5+ portals</option>\
        <option value="9">6+ portals</option>\
        <option value="7">7+ portals</option>\
        <option value="4">8+ portals</option>\
    </select>', plugin.xRay.layer, false);

    $('.leaflet-control-layers-list').on('change', '#xray-level', function(){
        $(this).closest('label').find('input[type=checkbox]').prop('checked', true);
    });

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
