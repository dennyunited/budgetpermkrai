$(function () {
    function formatRubles(n) {
        n += '';
        var i = n.indexOf('.');
        if (i >= 0) {
            n = n.substring(0, i);
        }
        if (n.indexOf('-') == 0) {
            n = '– ' + n.substr(1);
        }
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function strToRubles(s) {
        return s.replace(/\s+/g, '') * 1;
    }

    function formatPct(pct) {
        pct += '';
        var i = pct.indexOf('.')
        if (i < 0) {
            return pct;
        }
        return pct.substring(0, i + 2).replace('.', ',');
    }

    function liveIntFormatter(e) {
        if (e.ctrlKey || e.altKey || [37, 38, 39, 40, 9].indexOf(e.which) >= 0) {
            return;
        }
        var v = this.value.replace(/\s/g, '').trim();
        v = parseInt(v);
        if (isNaN(v)) {
            this.value = '';
            return;
        }
        v = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        this.value = v;
    }

    $('.calculator_outer input:text').keyup(liveIntFormatter);

    $('#f-incomes input').keyup(function () { // INCOMES
        var $t = $(this);
        var $tr = $t.closest('tr');
        if ($t.hasClass('f-in-month')) {
            $tr.find('.f-in-year').val(formatRubles(strToRubles(this.value) * 12));
        } else if ($t.hasClass('f-in-year')) {
            $tr.find('.f-in-month').val(formatRubles(strToRubles(this.value) / 12))
        } else if ($t.hasClass('f-in-month-other')) {
            $tr.find('.f-in-year-other').val(formatRubles(strToRubles(this.value) * 12));
        } else if ($t.hasClass('f-in-year-other')) {
            $tr.find('.f-in-month-other').val(formatRubles(strToRubles(this.value) / 12))
        }
        $('#f-expenses').data('triggered', true);
        $('#f-expenses input').first().trigger('keyup');
        $('#f-incomes-total-month').text(formatRubles(
            strToRubles($('.f-in-month').val()) + strToRubles($('.f-in-month-other').val())
        ));
        $('#f-incomes-total-year').text(formatRubles(
            strToRubles($('.f-in-year').val()) + strToRubles($('.f-in-year-other').val())
        ));
    });

    $('#f-expenses .color').css('background', '#CCC');
    $('#f-expenses input').keyup(function (e) { // EXPENSES
        if (e.which == 9 || e.which == 16) {
            return;
        }
        var sum = 0;
        var $table = $('#f-expenses'), data = [], colors = [], pchartData = [];
        $table.find('input').each(function (i) {
            var v = strToRubles(this.value);
            var $colorEl = $(this).parent().prev('th').children('.color');
            if (v > 0) {
                sum += v;
                var title = $(this).parent().prev('th').children('.color_description').text();
                data.push([title, v]);
                $colorEl.css('background', $colorEl.data('background'));
                colors.push($colorEl.data('background'));
                pchartData.push({value: v, color: $colorEl.data('background'), title: title, formatted: this.value + ' руб.', num: i + 1})
            } else {
                $colorEl.css('background', '#CCC');
            }
        });
        var $incomes = $('#f-incomes');
        var totalIncomesMonth = strToRubles($incomes.find('.f-in-month').val()) + strToRubles($incomes.find('.f-in-month-other').val());
        var $li = $('#month-year-switcher li.active');
        if ($li.hasClass('f-month')) {
            var savings = totalIncomesMonth - sum;
            $('#f-savings-total-month').text(formatRubles(savings));
            $('#f-savings-total-year').text(formatRubles(savings * 12));
        } else {
            savings = totalIncomesMonth - sum / 12;
            $('#f-savings-total-month').text(formatRubles(totalIncomesMonth - sum / 12));
            $('#f-savings-total-year').text(formatRubles(totalIncomesMonth * 12 - sum));
        }
        var text = $('#f-savings-total-month').text().trim();
        if (text.indexOf('–') == 0) {
            $('#f-savings-total-month').parent().css('color', '#9E2934').siblings().css('color', '#9E2934');
        } else {
            $('#f-savings-total-month').parent().css('color', '').siblings().css('color', '');
        }
        if ($table.data('triggered')) {
            $table.data('triggered', false);
            return;
        }
        $('#f-chart-container').empty();
        var totalData = {};
        if ($li.hasClass('f-month')) {
            totalData.month = formatRubles(sum).replace('-', '');
            totalData.year = formatRubles(sum * 12).replace('-', '');
        } else {
            totalData.month = formatRubles(sum / 12).replace('-', '');
            totalData.year = formatRubles(sum).replace('-', '');
        }
        __data = pchartData;
        Raphael('f-chart-container').pieChart({data: pchartData, totalData: totalData});
//        new Highcharts.Chart({
//            chart: {
//                renderTo: 'f-chart-container',
//                type: 'pie',
//                backgroundColor: 'rgba(255, 255, 255, 0)'
//            },
//            title: {
//                text: ''
//            },
//            plotOptions: {
//                pie: {
//                    shadow: true,
//                    dataLabels: {
//                        formatter: function () {
//                            var color = this.point.color;// == '#F0F000' ? '#333' : this.point.color;
//                            if (this.point.color == '#F0F000') {
//                                var shadow = ''; //; background: #333; padding: 10px;
//                                color = '#C6C600';
//                            } else {
//                                shadow = '';
//                            }
//                            return '<span style="color: ' + color + '; font-weight: bold; font-size: 115%' + shadow + '">'
//                                + formatPct(this.point.percentage)
//                                + '%</span>';
//                        },
//                        distance: 20,
//                        connectorWidth: 1,
//                        x: 0,
//                        y: 0
//                    }
//                }
//            },
//            tooltip: {
//                formatter: function () {
//                    return '<b>' + this.point.name + '</b>: '
//                        + formatRubles(this.point.y) + ' руб.'
//                }
//            },
//            series: [
//                {
//                    name: 'Распределение расходов',
//                    data: data,
//                    size: '73%',
//                    innerSize: '50%',
//                    showInLegend: false
//                }
//            ],
//            colors: colors
//        }, function(chart) {
////            for (var i in data) {
////                chart.series[0].data[5].dataLabel.translate(275, 520);
////            }
//        });
//        $('#f-chart-container').prepend('\
//            <div class="family_expenses_chart_total">\
//                <b style="width: 150px">Общая сумма расходов, руб</b>\
//                <span>\
//                    <span style="display: inline" id="f-expenses-month-circle"></span> в месяц\
//                </span>\
//                <span>\
//                    <span style="display: inline" id="f-expenses-year-circle"></span> в год\
//                </span>\
//            </div>'
//        );
        $('#f-chart-container svg').css('position', 'static');
        if ($li.hasClass('f-month')) {
            $('#f-expenses-month-circle').text(formatRubles(sum).replace('-', ''));
            $('#f-expenses-year-circle').text(formatRubles(sum * 12).replace('-', ''));
        } else {
            $('#f-expenses-month-circle').text(formatRubles(sum / 12).replace('-', ''));
            $('#f-expenses-year-circle').text(formatRubles(sum).replace('-', ''));
        }
    });

    $('#month-year-switcher li').click(function () {
        var $t = $(this);
        if ($t.hasClass('active')) {
            return;
        }
        $t.siblings().removeClass('active');
        $t.addClass('active');
        var year = $t.hasClass('f-year');
        $('#f-expenses input').each(function () {
            var v = strToRubles(this.value);
            if (v == 0) {
                return;
            }
            if (year) {
                $(this).val(formatRubles(v * 12));
            } else {
                $(this).val(formatRubles(Math.round(v / 12)));
            }
        });
        $('#f-expenses input').first().trigger('keyup');
    });
});