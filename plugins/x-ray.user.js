// ==UserScript==
// @id             iitc-plugin-x-ray
// @name           IITC Plugin: X-Ray
// @category       Portals
// @version        2.0.0.@@DATETIMEVERSION@@
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUILDNAME@@-@@BUILDDATE@@] Tool for getting detailed info from map at different scales
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

window.plugin.xRay.KEY_STORAGE = 'plugin-x-ray';

window.plugin.xRay.originalFunc = window.getDataZoomForMapZoom;

window.plugin.xRay.xRayFunc = function (zoom) {

    var originalZoom = window.plugin.xRay.originalFunc(zoom);
    window.plugin.xRay.forcedZoom = parseInt($('#x-ray-forced').val());
    
    var safeMapZoom = parseInt($('#x-ray-safe').val());

    if (window.map.getZoom() >= safeMapZoom) {
        if ($('#x-ray-auto-zoom').prop('checked')) {
            return window.plugin.xRay.forcedZoom;
        } else {
            return Math.max(window.plugin.xRay.forcedZoom, originalZoom);
        }
    }

    return originalZoom;
};

window.plugin.xRay.saveSettings = function() {
    var obj = {
        square: parseInt($('#x-ray-square').val()),
        scale:  $('#x-ray-select').val(),
        forced: parseInt($('#x-ray-forced').val()),
        safe:   parseInt($('#x-ray-safe').val()),
        auto:   $('#x-ray-auto-zoom').prop('checked')
    };

    localStorage[plugin.xRay.KEY_STORAGE] = JSON.stringify(obj);
}

window.plugin.xRay.loadSettings = function() {
    
    if (localStorage[plugin.xRay.KEY_STORAGE]) {
        return JSON.parse(localStorage[plugin.xRay.KEY_STORAGE]);
    }
}

window.plugin.xRay.init = function () {

    var parent = $(".leaflet-top.leaflet-left", window.map.getContainer());

    var button = document.createElement("a");
    button.className = "leaflet-bar-part";
    button.addEventListener("click", plugin.xRay.onBtnClick, false);
    button.title = 'X-Ray';

//    var tooltip = document.createElement("div");
//    tooltip.className = "leaflet-x-ray-tooltip";
//    tooltip.addEventListener("click", function(){return false;}, false);

    var settings = $('<div id="x-ray-settings" class="leaflet-x-ray">\
X-Ray <input id="x-ray-square" type="number" min="1" value="5"> × <span id="x-ray-sq-cp">5</span> tiles \
at <select id="x-ray-select">\
<option value="17" selected="selected">Portals</option>\
<option value="13">Links</option></select>\
scale<br>\
Load <select id="x-ray-forced">\
<option value="17" selected="selected">17 (Portals)</option>\
<option value="16">16</option>\
<option value="15">15</option>\
<option value="14">14</option>\
<option value="13">13 (All links)</option>\
<option value="12">12</option>\
<option value="11">11</option>\
<option value="10">10</option>\
<option value="9">9</option>\
<option value="8">8</option>\
<option value="7">7</option>\
<option value="6">6</option>\
<option value="5">5</option>\
<option value="4">4</option>\
<option value="3">3</option>\
<option value="2">2</option>\
<option value="1">1</option>\
</select> for <select id="x-ray-safe">\
<option value="16">16</option>\
<option value="15">15</option>\
<option value="14">14</option>\
<option value="13" selected="selected">13</option>\
<option value="12">12</option>\
<option value="11">11</option>\
<option value="10">10</option>\
<option value="9">9</option>\
<option value="8">8</option>\
<option value="7">7</option>\
<option value="6">6</option>\
<option value="5">5</option>\
<option value="4">4</option>\
<option value="3">3</option>\
<option value="2">2</option>\
<option value="1">1</option>\
</select>+ map zoom<br>\
<input type="checkbox" id="x-ray-auto-zoom">Disable auto zoom in</div>');
    $('#sidebar').append(settings);

    $('#x-ray-square').on('change', function(e){ $('#x-ray-sq-cp').html($(this).val()); });
    $('#x-ray-settings').on('change', '*', window.plugin.xRay.saveSettings);

    var settingsObj = window.plugin.xRay.loadSettings();

    if (settingsObj) {
        $('#x-ray-square').val(settingsObj.square).change();
        $('#x-ray-select').val(settingsObj.scale);
        $('#x-ray-forced').val(settingsObj.forced);
        $('#x-ray-safe').val(settingsObj.safe);
        $('#x-ray-auto-zoom').prop('checked', settingsObj.auto);
    }

    var container = document.createElement("div");
    container.className = "leaflet-x-ray leaflet-bar leaflet-control";
    container.appendChild(button);
//    container.appendChild(tooltip);
    
    parent.append(container);

    window.plugin.xRay.container = container;
    window.plugin.xRay.button = button;
//    window.plugin.xRay.tooltip = tooltip;
};

window.plugin.xRay.createTilesQueue = function(lat, lng) {

    //credits xlinkloader 

    var zoom = $('#x-ray-select').val();
    var tp = getMapZoomTileParameters(zoom);

    var tiles = new Object();

    var currX = lngToTile(lng, tp);
    var currY = latToTile(lat, tp);

    var length = parseInt($('#x-ray-square').val());
    var step = Math.floor(length/2);
    var corr = length % 2 === 0 ? 1 : 0;

    var startX = currX - step;
    var startY = currY - step;
    var endX = currX + step - corr;
    var endY = currY + step - corr;

    for (var i = startX; i <= endX; ++i) {
        for (var j = startY; j <= endY; ++j) {

            var tile_id = pointToTileId(tp, i, j);
            var latNorth = tileToLat(j,tp);
            var latSouth = tileToLat(j+1,tp);
            var lngWest = tileToLng(i,tp);
            var lngEast = tileToLng(i+1,tp);

            tiles[tile_id] = [tile_id, latNorth, latSouth, lngWest, lngEast];
            //console.log(tiles[tile_id]);
        }
    }

    return tiles;
};

window.plugin.xRay.loadDetailed = function(tiles) {

    //credits xlinkloader 

    var request = [];

//    window.mapDataRequest.debugTiles.reset();
    window.mapDataRequest.resetRenderQueue();
    for (var t in tiles) {
        var tileDescr = tiles[t];

        var tile_id = tileDescr[0];
        var latNorth = tileDescr[1];
        var latSouth = tileDescr[2];
        var lngWest = tileDescr[3];
        var lngEast = tileDescr[4];

        //console.log("adding to queue: ", tile_id);
        request.push(tile_id);
        window.mapDataRequest.debugTiles.create(tile_id,[[latSouth,lngWest],[latNorth,lngEast]])
        window.mapDataRequest.queuedTiles[tile_id] = tile_id;
    }
    window.mapDataRequest.requestedTileCount = request.length;
    //console.log("total tiles to load: ", request.length);
    window.mapDataRequest.setStatus ('loading', undefined, -1);
    if (window.mapDataRequest.timer) {
        clearTimeout(window.mapDataRequest.timer);
        delete window.mapDataRequest.timer;
    }
    //!!! use this
    window.mapDataRequest.delayProcessRequestQueue (window.mapDataRequest.DOWNLOAD_DELAY,true);
    //window.mapDataRequest.processRequestQueue (true);
}

window.plugin.xRay.scanAround = function(ev) {
    var tiles = plugin.xRay.createTilesQueue(ev.latlng.lat, ev.latlng.lng);
    plugin.xRay.loadDetailed(tiles);
};

window.plugin.xRay.onBtnClick = function (ev) {
    var btn = window.plugin.xRay.button,
//        tooltip = window.plugin.xRay.tooltip,
        container = window.plugin.xRay.container;
//        layer = plugin.xRay.layer;

    if (btn.classList.contains("active")) {
        map.off("click", window.plugin.xRay.scanAround);

        container.classList.remove("active");
        btn.classList.remove("active");
        window.mapDataRequest.debugTiles.reset();
    } else {
        map.on("click", window.plugin.xRay.scanAround);
        container.classList.add("active");
        btn.classList.add("active");

//        setTimeout(function () {
//            tooltip.textContent = 'Click on map';
//        }, 10);
    }

    ev.stopPropagation();
};

window.plugin.xRay.enable = function() {
    window.plugin.xRay.originalFunc = window.getDataZoomForMapZoom;
    window.getDataZoomForMapZoom = window.plugin.xRay.xRayFunc;
    $('.leaflet-x-ray').show();
}

window.plugin.xRay.disable = function() {
    window.getDataZoomForMapZoom = window.plugin.xRay.originalFunc;
    $('.leaflet-x-ray').hide();
}

window.plugin.xRay.setup = function () {
    $('<style>').prop('type', 'text/css').html('@@INCLUDESTRING:plugins/x-ray.css@@').appendTo('head');

    window.plugin.xRay.layer = L.layerGroup([]);
    window.addLayerGroup('X-Ray', plugin.xRay.layer, false);

    window.plugin.xRay.init();

    window.map.on('layeradd', function (e) {
        if (e.layer === window.plugin.xRay.layer) {
            window.plugin.xRay.enable();
        }
    });
    window.map.on('layerremove', function (e) {
        if (e.layer === window.plugin.xRay.layer) {
            window.plugin.xRay.disable();
        }
    });
    if (window.isLayerGroupDisplayed('X-Ray', false)) {
        window.plugin.xRay.enable();
    } else {
        window.plugin.xRay.disable();
    }

};

var setup = plugin.xRay.setup;

// PLUGIN END //////////////////////////////////////////////////////////

@@PLUGINEND@@
