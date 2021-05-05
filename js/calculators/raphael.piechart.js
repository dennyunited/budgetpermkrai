/**
 * Рисует полукруговую диаграмму.
 * @param prefs Object:<pre>
 * | ---------------- | ------- | -------------------------------------------------------------------- | ------------------ |
 * |     ПАРАМЕТР     |   ТИП   |                               ОПИСАНИЕ                               |    ПО УМОЛЧАНИЮ    |
 * | ---------------- | ------- | -------------------------------------------------------------------- | ------------------ |
 * | source           | string  |    id таблицы с данными.                                             | 'halfpie-data'     |
 * | tWidth           | int     |    Максимальная ширина блока с текстом в пикселях.                   | 150                |
 * | radius           | int     |    Радиус круга (внешняя граница планового значения) в пикселях.     | 220                |
 * | innerRadius      | int     |    Радиус внутреннего круга в пикселях                               | 100                |
 * | realPlusLimit    | int     |    Максимальное значение разницы между радиусом реального значения и | 20                 |
 * |                  |         | планового значения в пикселях.                                       |                    |
 * | font ->          | object  |    Свойства шрифта: family, size, color, weight.                     | в описании         |
 * |  + family        | string  |    'Helvetica, Arial, sans-serif'                                    |                    |
 * |  + size          | string  |    '14px'                                                            |                    |
 * |  + color         | string  |    '#7D7D7D'                                                         |                    |
 * |  + weight        | string  |    'bold'                                                            |                    |
 * | animations ->    | object  |    Свойства анимации: скорость, эффект.                              | в описании         |
 * |  + speed         | int     |    200                                                               |                    |
 * |  + effect        | string  |    'quart'                                                           |                    |
 * | ---------------- | ------- | -------------------------------------------------------------------- | ------------------ |
 * @param debug Boolean
 * </pre>
 */
Raphael.fn.pieChart = function(prefs, debug) {
    prefs = prefs || {};
    prefs = $.extend(true, {
        source: 'halfpie-data',
        tWidth: 150,
        radius: 130,
        innerRadius: 90,
        realPlusLimit: 20,
        font: {
            family: '"Lucida Sans Unicode", "Trebuchet MS", Helvetica, Arial, sans-serif',
            size: '13px',
            color: '#7D7D7D',
            weight: 'bold'
        }, anim: {
            speed: 200,
            effect: 'quart'
        }
    }, prefs);
    debug = true;
    var data = prefs.data;
    if (!data.length) {
        this.text(this.width / 2, this.height / 2, '').attr({color: 'grey', 'font-size': '24px', 'font-family': 'Helvetica, Arial, sans-serif'});
        return;
    }
    var total = 0;
    for (var i = 0; i < data.length; i++) {
        total += data[i].value;
    }
    for (i = 0; i < data.length; i++) {
        data[i].percentage = (data[i].value / total) * 100;
    }
    var paper = this;
    var cx = this.width / 2, cy = this.height / 2 + 24, radius = prefs.radius;
    drawSectorsAndLabels(data);
    drawFurther();

    function drawFurther() {
        paper.circle(cx, cy, prefs.innerRadius).attr({fill: '#F0F0F0', stroke: '#CCC'});
        var xshift = 30, yshift = -5, sumsXshift = 54;
        var titleFont = {'font-weight': 'bold', 'font-size': '12px', 'font-family': 'Helvetica, Arial, sans-serif', fill: '#1A1A1A', 'text-anchor': 'start'};
        paper.text(cx - prefs.innerRadius / 1.25 + xshift, cy - prefs.innerRadius / 2.4 + yshift, 'Общая сумма').attr(titleFont);
        paper.text(cx - prefs.innerRadius / 1.25 + xshift, cy - prefs.innerRadius / 2.4 + 15 + yshift, 'расходов, руб.').attr(titleFont);
        var sumsFont = {fill: '#C1272D', 'text-anchor': 'start', 'font-size': '17px', 'font-weight': 'bold', 'font-family': 'Helvetica, Arial, sans-serif'};
        paper.text(cx - prefs.innerRadius / 1.25 + xshift + sumsXshift, cy + prefs.innerRadius / 20 + 3, ' в месяц').attr(sumsFont);
        paper.text(cx - prefs.innerRadius / 1.25 + xshift + sumsXshift, cy + prefs.innerRadius / 20 + 32, ' в год').attr(sumsFont);
        paper.text(cx - prefs.innerRadius / 1.25 + xshift + sumsXshift - 6, cy + prefs.innerRadius / 20 + 3, prefs.totalData.month).attr($.extend({}, sumsFont, {'text-anchor': 'end'}));
        paper.text(cx - prefs.innerRadius / 1.25 + xshift + sumsXshift - 6, cy + prefs.innerRadius / 20 + 32, prefs.totalData.year).attr($.extend({}, sumsFont, {'text-anchor': 'end'}));
    }
    /**
     * Рисует сектор
     * @param cx_ Number x координата центра
     * @param cy_ Number y координата центра
     * @param r Number радиус круга
     * @param startAngle Number угол первого луча сектора в градусах (против часовой)
     * @param endAngle Number угол второго луча сектора в градусах (против часовой)
     * @param params Object параметры-стили для нарисованного сектора
     * @return Raphael-объект нарисованный сектор
     **/
    function drawSector(cx_, cy_, r, startAngle, endAngle, params) {
        var rad = Math.PI / 180;
        var x1 = cx_ + r * Math.cos(-startAngle * rad),
            x2 = cx_ + r * Math.cos(-endAngle * rad),
            y1 = cy_ + r * Math.sin(-startAngle * rad),
            y2 = cy_ + r * Math.sin(-endAngle * rad);

        var angle = (endAngle - startAngle) / 2;
        var xD = cx_ + (r - 30) * Math.cos(-angle * rad);
        var yD = cy_ + (r - 30) * Math.sin(-angle * rad);
        var text, bckg;
        return paper.path(["M", cx_, cy_, "L", x1, y1, "A", r, r, 0, + (endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params).mouseover(function(e) {
            var x = e.offsetX < 160/2 ? e.offsetX + 100 : e.offsetX - 50;
            var y = e.offsetY < cy ? e.offsetY + 150 : e.offsetY;
            text = paper.text(x, y, params.labTitle + ': ' + params.sum).attr({'font-size': '12px', fill: '#333', 'font-weight': 'bold', 'text-anchor': 'start'});
            var box = text.getBBox();
            bckg = paper.rect(box.x - 10, box.y - 6, box.width + 20, box.height + 12).attr({'fill': '#EEE', opacity: 1, 'z-index': 100, 'overflow': 'hidden', stroke: params.labColor});
            text.toFront();
        }).mouseout(function() {
            text.remove();
            bckg.remove();
        });
    }

    /**
     * Рисует текст
     * @param cx_ Number x координата центра
     * @param cy_ Number y координата центра
     * @param angle Number угол луча, приходящего в левый верхний угол текста
     * @param text String текст
     * @param params Object параметры-стили для нарисованного элемента
     * @return Raphael-объект нарисованный элемент с текстом
     */
    function drawLabel(cx_, cy_, angle, text, params) {
        var dist = radius + 10, rad = Math.PI / 180;
        var xTextStart = cx_ + dist * Math.cos(-(angle) * rad);
        var yTextStart = cy_ + dist * Math.sin(-(angle) * rad);
        var t = paper.text(xTextStart, yTextStart, text).attr(params);
        wrapText(text, t);
        var tBBox = t.getBBox();
        if (debug) {
//            paper.circle(tBBox.x, tBBox.y, 3).attr({fill: 'red'});
        }
        var xShift = 0, yShift = 0;
        if (tBBox.x < cx) {
            var boxWidth = tBBox.x2 - tBBox.x;
            if (tBBox.y < cy) {
                xShift = -boxWidth;
            } else {
                xShift = -boxWidth;
            }
        }
        t.attr({x: t.attr('x') + xShift, y: t.attr('y')});

        return t;
    }

    function drawSectorsAndLabels(data) {
        var angle = 0; // start angle
        for (i = 0; i < data.length; i++) {
            var sectorAngle = (data[i].value / total) * 360;
            var start = angle - sectorAngle, end = angle;
            if (sectorAngle == 360) {
                start = 0, end = 359.99;
            }
            var color = data[i].color == '#F0F000' ? '#C6C600' : data[i].color;
            drawSector(cx, cy, radius, start, end, {
                fill: data[i].color, stroke: '#EEE', 'stroke-width': 1, labTitle: data[i].title, sum: data[i].formatted, labColor: color
            });
            var label = drawLabel(cx, cy, angle - sectorAngle / 2, data[i].percentage.toFixed(1).replace('.', ',') + '%', {
                fill: color, 'font-family': prefs.font.family, 'font-size': prefs.font.size, 'font-weight': prefs.font.weight, 'text-anchor': 'start'
            });
            angle -= sectorAngle;
        }
    }

    function wrapText(text, raTextEl) {
        var maxWidth = prefs.tWidth;
        text = text.replace(/(\\n)+/g, '\n');
        var lines = text.split(/\n/);
        var tempText = '';
        for (var i = 0; i < lines.length; i++) {
            var words = lines[i].split(/\s+/);
            for (var k = 0; k < words.length; k++) {
                raTextEl.attr('text', tempText + words[k] + ' ');
                if (raTextEl.getBBox().width > maxWidth) {
                    tempText += '\n' + words[k];
                } else {
                    tempText += words[k] + ' ';
                }
            }
            tempText += '\n';
        }
        raTextEl.attr('text', tempText);
    }
};