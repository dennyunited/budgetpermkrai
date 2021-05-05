$(function() {
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
        return s.toString().replace(/\s+/g, '') * 1;
    }
    var prof = 0, def = 0;
    var EXPENSES = 24142189, INCOMES = 22781819;
    var MAX_DEF_ALLOWED = 1630000;
    var NDFL = 9131272, NDFL_VYCH = 4565636, TAXES_DEFAULT = 0.13;
    var LAND_TAX = 1558580, LAND_TAX_DEFAULT = 0.002, LAND_FACILITY = 779290;
    var RENT_INCOMES = 836798;
    var GKH_INCOMES = 200000;
    var TRANSPORT_INCOMES = 120000;
    var BORDER_VALUE = 5000000;
    var BALANCE_DELTA = 400000;
    var profTotalDefault = NDFL + LAND_TAX + RENT_INCOMES;
    var expTotalDefault = 0; // расходы, которые учитывают слайдеры (при 100% всегда меньше, чем EXPENSES)
    $('.slider_ui').each(function() {
        var $t = $(this);
        $t.find('.ui-slider-handle span').text('100%');
        var $b = $t.parent().siblings('.summ').find('> b');
        var sum = $t.parent().siblings('.summ').find('> b').text();
        sum = strToRubles(sum);
        expTotalDefault += sum;
        $b.data('original', sum);
    });
    function calcProfAndDef() {
        var expTotal = 0;
        // walk through all the sliders to grab the sum
        $('.slider_ui').each(function() {
            var $tt = $(this);
            var pct = parseInt($tt.find('.ui-slider-handle span').text());
            pct /= 100;
            var $b = $tt.parent().siblings('.summ').find('> b');
            var sum = $b.data('original');
            sum = strToRubles(sum) * pct; // expenses
            $b.text(formatRubles(sum));
            if (sum > $b.data('original')) {
                $b.css('color', '#C1272D');
            } else if (sum < $b.data('original')) {
                $b.css('color', '#009245');
            } else {
                $b.css('color', '');
            }
            expTotal += sum;
        });
        if (expTotal > expTotalDefault) {
            $('#expenses-diff').text(formatRubles(expTotal - expTotalDefault) + ' тыс  руб.').css('color', '#C1272D');
        } else if (expTotal < expTotalDefault) {
            $('#expenses-diff').text(formatRubles(expTotalDefault - expTotal) + ' тыс  руб.').css('color', '#009245');
        } else { // zero and gray
            $('#expenses-diff').text('0 тыс  руб.').css('color', '#333');
        }
        // если расходы меньше, чем все известные расходы (которые включают "прочее"), то
        // а иначе выбранные расходы превышают текущие
        expTotal = expTotal;// < EXPENSES ? EXPENSES - expTotalDefault + expTotal : expTotal;
        def = expTotal; // всего пойдёт в дефицит
        // далее учесть доходы:
        var taxes = parseInt($('.ui_1 .ui-slider-handle span').text()) / 100;
        var taxesChecked = $('#include_vych input').prop('checked');
        // если галочка снята, то прибавляется NDFL_VYCH
        var diff = taxes - TAXES_DEFAULT;
        var taxesSum = NDFL * diff + NDFL;
        if (!taxesChecked) {
            taxesSum += NDFL_VYCH;
        }
//            console.log('taxesSum: ' + taxesSum);
        var landTaxes = parseFloat($('.ui_2 .ui-slider-handle span').text()) / 100;
        diff = landTaxes - LAND_TAX_DEFAULT;
        var landTaxesSum = LAND_TAX * diff + LAND_TAX;
        var landTaxesChecked = $('#include_facility input').prop('checked');
        if (!landTaxesChecked) {
            landTaxesSum += LAND_FACILITY;
        }
//            console.log('landTaxesSum: ' + landTaxesSum);
        var rentTaxes = parseInt($('.ui_3 .ui-slider-handle span').text()) / 100;
        var rentIncomes = RENT_INCOMES * rentTaxes;
//            console.log('rentIncomes: ' + rentIncomes);
        var gkhBonus = $('#GKH_incomes input').prop('checked') ? GKH_INCOMES : 0;
        var transportBonus = $('#transport_incomes input').prop('checked') ? TRANSPORT_INCOMES : 0;
//            console.log('GKH: ' + gkhBonus);
//            console.log('Transport: ' + transportBonus);
        prof = taxesSum + landTaxesSum + rentIncomes + gkhBonus + transportBonus;
        if (prof > profTotalDefault) {
            $('#incomes-diff').text(formatRubles(prof - profTotalDefault) + ' тыс  руб.').css('color', '#C1272D');
        } else if (prof < profTotalDefault) {
            $('#incomes-diff').text(formatRubles(profTotalDefault - prof) + ' тыс  руб.').css('color', '#009245');
        } else {
            $('#incomes-diff').text('0 тыс  руб.').css('color', '#333');
        }
        prof = INCOMES - profTotalDefault + prof; // prof < INCOMES ? INCOMES - profTotalDefault + prof : prof;
        prof = parseInt(prof);
        def = parseInt(def);
        processProfAndDef(prof, def);
    }

    function processProfAndDef(inc, exp) {
        var diff = inc - exp;
        var width = Math.abs(((diff / BORDER_VALUE) / 2) * 24.4);
        if (width > 40) {
            width = 47;
        }
        if (diff < 0) { // дефицит
            var text = Math.abs(diff) < MAX_DEF_ALLOWED ? 'Бюджет дефицитный: расходы превышают доходы в пределах допустимого уровня. Бюджет может быть утвержден с предложенными Вами параметрами.'
                : 'Бюджет дефицитный: расходы превышают доходы сверх допустимого уровня. Бюджет не может быть утвержден с предложенными Вами параметрами. Сократите расходы по другим направления и/или варианты обеспечения данных расходов (правая часть калькулятора).';
            $('#budgetc-def').html('<div class="hint" style="background: #B53948">\
                <div class="arrow" style="border-top-color: #B53948"></div>\
                <b>${amount} тыс  руб.</b>\
            <span>${text}</span>\
            </div>'
                .replace('${amount}', formatRubles(diff))
                .replace('${text}', text)
            );
            if (Math.abs(diff) > MAX_DEF_ALLOWED) {
                $('#budgetc-def .hint').removeClass('budgetc-prof-hint');
                $('#budgetc-submit').addClass('data_source_btn-disabled');
            } else {
                $('#budgetc-def .hint').css('width', '');
                $('#budgetc-submit').removeClass('data_source_btn-disabled active');
            }
            $('#budgetc-prof').empty().css('width', '0');
            $('#budgetc-def').css('width', width + '%');
        } else { // профицит
            $('#budgetc-def').empty().css('width', '0');
            $('#budgetc-prof').html('<div class="hint" style="background: #009245">\
                <div class="arrow" style="border-top-color: #009245"></div>\
                <b>${amount} тыс  руб.</b>\
            <span>Бюджет профицитный: доходы превышают расходы. Бюджет может быть утвержден с предложенными Вами параметрами.</span>\
            </div>'.replace('${amount}', formatRubles(diff)));
            $('#budgetc-prof').css('width', width + '%').find('.hint').addClass('budgetc-prof-hint').find('.arrow').css('left', '270px');
        }
    }

    /**
     * Расходы
     */
    $('.slider_ui').slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 20,
        value: 10,
        create: function(event, ui) {
            $(this).find('.ui-slider-handle span').html('100%');
        },
        slide: function(event, ui, triggered) {
            var $t = $(this);
            var $pctSpan = $t.find('.ui-slider-handle span');
            $pctSpan.css('content', '"' + ui.value * 10 +  '%"');
            if (ui.value > 10){
                $t.find('.ui-slider-handle').css({'border-color':'#C1272D'});
                $t.find('.ui-slider-range').css({'background':'#C1272D'});
            }
            else if (ui.value < 10){
                $t.find('.ui-slider-handle').css({'border-color':'#009245'});
                $t.find('.ui-slider-range').css({'background':'#009245'});
            }
            else {
                $t.find('.ui-slider-handle').css({'border-color':'#4D4D4D'});
                $t.find('.ui-slider-range').css({'background':'#4D4D4D'});
            }
            if (ui.value > 0){
                $t.find('.ui-slider-handle span').html(ui.value+'0%');
            }
            else {
                $t.find('.ui-slider-handle span').html(ui.value+'%');
            }
            // logic:
            if (!triggered) {
                calcProfAndDef();
            }
        }
    });
    /**
     * НДФЛ
     */
    $('.ui_1').slider({
        orientation: "horizontal",
        min: 0,
        max: 20,
        value: 13,
        create: function(event, ui) {
            $(this).find('.ui-slider-handle span').html('13%');
        },
        slide: function(event, ui, triggered) {
            var $pctSpan = $(this).find('.ui-slider-handle span');
            $pctSpan.css('content', '"' + ui.value + '%"');
            $(this).find('.ui-slider-handle span').html(ui.value + '%');
            if (!triggered) {
                calcProfAndDef();
            }
        }
    });
    /**
     * Земельный налог
     */
    $('.ui_2').slider({
        orientation: "horizontal",
        min: 0,
        max: 10,
        value: 2,
        create: function( event, ui ) {
            $(this).find('.ui-slider-handle span').html('0.2%');
        },
        slide: function( event, ui, triggered ) {
            var $pctSpan = $(this).find('.ui-slider-handle span');
            $pctSpan.css('content', '"' + ui.value / 10 +  '"');
            if (ui.value > 0 && ui.value < 10){
                $(this).find('.ui-slider-handle span').html('0.'+ui.value+'%');
            }
            else if (ui.value == 10){
                $(this).find('.ui-slider-handle span').html('1%');
            }
            else {
                $(this).find('.ui-slider-handle span').html(ui.value+'%');
            }
            if (!triggered) {
                calcProfAndDef();
            }
        }
    });
    /**
     * Аренда
     */
    $('.ui_3').slider({
        orientation: "horizontal",
        min: 0,
        max: 15,
        value: 10,
        create: function( event, ui ) {
            $(this).find('.ui-slider-handle span').html('100%');
        },
        slide:function( event, ui, triggered ) {
            var $pctSpan = $(this).find('.ui-slider-handle span');
            $pctSpan.css('content', '"' + ui.value * 10 +  '%"');
            if (ui.value > 0){
                $(this).find('.ui-slider-handle span').html(ui.value+'0%');
            }
            else {
                $(this).find('.ui-slider-handle span').html(ui.value+'%');
            }
            if (!triggered) {
                calcProfAndDef();
            }
        }
    });
    /**
     * Галочки
     */
    $('#include_facility input, #transport_incomes input, #GKH_incomes input, #include_vych input').change(function() {
        calcProfAndDef();
    });
    $('#gradostroy-slider').slider('disable');
    $('#gradostroy-slider').find('a').click(function(e) {
        e.preventDefault();
    }).attr('title', 'В настоящее время не активен').css('cursor', 'default');
    calcProfAndDef();

    function reset() {
        $('#include_vych input, #include_facility input').prop('checked', true);
        $('#GKH_incomes input, #transport_incomes input').prop('checked', false);
        $('.slider_ui').each(function() {
            var $t = $(this);
            $t.slider('option', 'value', 10);
            $t.slider('option', 'slide').call($t, null, {value: 10}, true);
        });
        $('.ui_1').slider('option', 'value', 13);
        $('.ui_2').slider('option', 'value', 2);
        $('.ui_1').slider('option', 'slide').call($('.ui_1'), null, {value: 13}, true);
        $('.ui_2').slider('option', 'slide').call($('.ui_2'), null, {value: 2}, true);
        $('#include_vych .fake_checkbox, #include_facility .fake_checkbox').addClass('checked');
        $('#transport_incomes .fake_checkbox, #GKH_incomes .fake_checkbox').removeClass('checked');
    }

    $('#budgetc-reset').click(function(e) {
        e.preventDefault();
        reset();
        calcProfAndDef();
    });
});