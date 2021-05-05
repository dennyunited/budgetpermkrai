function importNode(node, allChildren) {
    switch (node.nodeType) {
        case document.ELEMENT_NODE:
            var newNode = document.createElementNS(node.namespaceURI, node.nodeName);
            if (node.attributes && node.attributes.length > 0)
                for (var i = 0, il = node.attributes.length; i < il; i++)
                    newNode.setAttribute(node.attributes[i].nodeName, node.getAttribute(node.attributes[i].nodeName));
            if (allChildren && node.childNodes && node.childNodes.length > 0)
                for (var i = 0, il = node.childNodes.length; i < il; i++)
                    newNode.appendChild(importNode(node.childNodes[i], allChildren));
            return newNode;
            break;
        case document.TEXT_NODE:
        case document.CDATA_SECTION_NODE:
        case document.COMMENT_NODE:
            return document.createTextNode(node.nodeValue);
            break;
    }
}

(function () {
    /**
     * Забирает данные, зашитые в страницу в виде структуры из дивов.
     * @param id String id дива с данными
     * @return Array массив со структурами данных
     */
    function Legend(id) {
        id = id || 'legend-map-info';
        var cssPrefix = 'legend-';

        function isNaNinArr(arr) {
            for (var i in arr) {
                if (isNaN(arr[i]))
                    return true;
            }
            return false;
        }

        var info = $('#' + id)[0];
        var $regions = $('#map-perm').find('#Regions path');
        var infos = [];
        for (var i = 0; i < $regions.length; i++) {
            var regid = $regions[i].id;
            var $infoDiv = $(info).children('#region-' + regid); // данные
            if (!$infoDiv.length) { // если нет данных
                infos[regid] = {
                    title: $('#gossector-regions-' + regid).attr('value') || 'регион',
                    federal: 0, regional: 0, municipal: 0, budget: 0
                };
                continue;
            } else {
                var title = $.trim($infoDiv.children('.' + cssPrefix + 'title').text());
                var place = parseInt($infoDiv.children('.' + cssPrefix + 'place').text());
                var value = parseInt($infoDiv.children('.' + cssPrefix + 'value').text());
                if (isNaNinArr([place, value]))
                    continue;
                infos[regid] = {
                    title: title, value: value,
                    place: place
                };
            }
//			console.log(title + ' loaded successfully', infos[regid]);
        }
        return infos;
    }

    onSvgMapLoaded = function () {
        function getGrey(value) {
            var colors = ['#5E9E5E', '#60a749', '#95cb6f', '#c0c0c0'];
            var i = 0;
            if (value > 1 & value <= 200){
                i = 1;
            }else{
                if (value > 200){
                    i = 2;
                }else{
                    i = 3;
                }
            }
            return colors[i];
        }

        infos = Legend();
        displayLegend();
        $('#map-perm').find('#Regions path')
                .each(function () {
                    $(this).css('fill', getGrey(infos[this.id].value));
                    if (this.id == 99000) {
                        $(this).css('fill', '#ffffff');
                    }
                    regionsColors[this.id] = $(this).css('fill');
                })
                .mouseover(function (e) {
                    if (mapIntervalId) {
                        clearInterval(mapIntervalId);
                        mapIntervalId = 0;
                    }

                    var x = e.clientX;
                    var y = e.clientY + 10;
                    /*x = x < 400 ? 400+x : x;
                     x = x > 1000 ? 1000 : x;
                     y = y < 200 ? 250 : y;
                     y = y > 350 ? 350 : y;*/
                    var id = this.id;
                    var r = $(this);
                    displayInfo(r, x, y, id);
                }).mouseout(function () {
            if (oldItem) {
                oldItem.css('fill', regionsColors[rId]).attr({
                    transform: '',
                    filter: ''
                });
            }

            if (mapIntervalId) {
                clearInterval(mapIntervalId);
                mapIntervalId = 0;
            }

            mapIntervalId = setInterval(function () {
                if (oldItem) {
                    oldItem = null;
                }

                $('.maps-legend-container').remove();
            }, 200);
        });
    }
    var cnt = 0;

    var mapIntervalId = 0;
    var infos;
    var regionsColors = [];

    /**
     * @param values Array размеры в единицах (млн рублей и т.п.)
     * @return Array размеры в пикселях для полосок
     */
    function getScaledWidths(values) {
        var maxWidth = 180, total = 0;
        for (var i in values) {
            total += values[i];
        }
        var scaledWidths = [];
        for (i in values) {
            var scaled = Math.round((values[i] / total) * maxWidth);
            scaledWidths.push(scaled < 1 ? 1 : scaled);
        }
        var max = Math.max.apply(null, scaledWidths);
        var stretch = maxWidth / max;
        scaledWidths = $.map(scaledWidths, function (v) {
            return Math.round(v * stretch);
        });
        return scaledWidths;
    }

    var oldItem = null, rId;

    function displayLegend()
    {
        //var colors = ['#eaeaea', '#CFCFCF','#AEAEAE'];
        $('#object-map-holder').append('<div '
                + ' class="map-legend">'
                + '<table>'
                //+ '<tr><th colspan="2" >' + 'Легенда' + '</th></tr>'
                + '<tr><th></th><th style="text-align:left;">Баллы</th></tr>'
                + '<tr><td><div class="legend-color" style="background-color: #c0c0c0;"></div></td><td>дисквалифицирован</td></tr>'
                + '<tr><td><div class="legend-color" style="background-color: #5E9E5E;"></div></td><td>до 100</td></tr>'
                + '<tr><td><div class="legend-color" style="background-color: #60a749;"></div></td><td>от 100 до 200</td></tr>'
                + '<tr><td><div class="legend-color" style="background-color: #95cb6f;"></div></td><td>более 200</td></tr>'
                + '</table>'
                );
    }

    function displayInfo(r, x, y, id) {
        if (id == 99000 /*river ?!*/) {
            return;
        }
        $('.maps-legend-container').remove();
        var infoObj = infos[id];

        if (!(infoObj && typeof infoObj == 'object'))
            return;
        if (oldItem) {
            oldItem.css('fill', regionsColors[rId]).attr({
                transform: '',
                filter: ''
            });
        }
        r.css('fill', '#78A4A2').attr({});
        oldItem = r;
        rId = id;
        var scaledWidths = getScaledWidths([infoObj.federal, infoObj.regional,
            infoObj.municipal]);
        var xShift = +10, yShift = +10;
        //xShift = xShift < $(window).width() / 2.2 ? xShift + 100 : xShift - 100;

        if (infoObj.budget == 0) {
            $('#object-map-holder').append('<div style="position: fixed; top: '
                    + (y + yShift)
                    + 'px; left: '
                    + (x + xShift)
                    + 'px; '
                    + 'z-index: 3; '
                    + '" class="maps-legend-container">'
                    + '<table style="font-family: Arial; font-size: 16px; padding: 15px 40px; background: white; border-radius: 10px; border-collapse: separate;">'
                    + '<tr><td colspan="2" style="text-align: center; padding-bottom: 8px; font-weight: bold; font-size: 15px;">' + infoObj.title + '</td></tr>'
                    + '<tr><td colspan="2">Нет данных</td>'
                    + '</table>'
                    + '</div>'
                    );
        }
        else {
            $('#object-map-holder')
                    .append(
                            '<div style="position: fixed; top: '
                            + (y - 20 + yShift)
                            + 'px; left: '
                            + (x + xShift)
                            + 'px; '
                            + 'z-index: 3; '
                            + '" class="maps-legend-container">'
                            + '<table style="font-family: Arial; font-size: 16px; padding: 15px 40px; background: rgba(188, 220, 191, 0.91); border-radius: 10px; border-collapse: separate;">'
                            + '<tr><td colspan="2" style="text-align: center; padding-bottom: 8px; font-weight: bold; font-size: 15px;">' + infoObj.title + '</td></tr>'
                            + '<tr class="maps-tooltip-federal" style="height: 30px;"><td style="text-align: right"><div style="width: '
                            + scaledWidths[0]
                            + 'px; background-color: #90CE68; float: right; height: 24px">&nbsp;</div>'
                            + '<div style="float: right; padding-right: 10px; font-size: 20px; color: #707070">'
                            + infoObj.value
                            + '</div></td>'
                            + '<td style="text-align: left; padding-left: 10px">Итоговый рейтинг</td></tr>'
                            + '<tr class="maps-tooltip-regional" style="height: 30px;"><td style="text-align: right"><div style="width: '
                            + scaledWidths[1]
                            + 'px; background-color: #90CE68; float: right; height: 24px">&nbsp;</div>'
                            + '<div style="float: right; padding-right: 10px; font-size: 20px; color: #707070">'
                            + infoObj.place
                            + '</div></td>'
                            + '<td style="text-align: left; padding-left: 10px">Место</td></tr>'
                            + '</table>'
                            + '</div>'
                            );
        }

        $('.maps-legend-container').mouseover(function (e) {
            var newX = e.clientX;
            var newY = e.clientY + 10;

            displayInfo(r, newX, newY, id);
        });
    }
})();

