function LocalBudgetExpensesController(params) {
    var self = this;

    self.Context = null;
    self.ContentContext = null;
    self.Points = null;
    self.InfoContext = null;

    self.baseUrl = null;
    self.currentType = 100;
    self.averageValue = null;

    self.init = function(params) {
        self.Context = $('.local-budget-static-wrapper');
        self.ContentContext = $('.diagramm_inner');
        self.InfoContext = self.Context.find('.info_section');
        self.baseUrl = params.baseUrl;

        self.Handlers.attachEvents();
        self.renderChart(params.data);
    };

    self.loadChart = function (type) {
        self.currentType = type;
        self.Loader.show();
        $.ajax({
            url: self.baseUrl + '/local_budgets/loadExpensesChart',
            type: 'POST',
            data: {
                type: type
            }
        }).done(function (data) {
            self.renderChart(data);
            self.Loader.hide();
        });
    };

    self.renderChart = function (data) {
        self.Points = data.points;
        var html = '';

        for (var i = 0; i < data.points.length; i++) {
            var p = data.points[i];
            var planned = self.currentType == 100 ? p.mfData.percents.population : p.mfData.percents.planned;

            html += '<div class="di__line" style="margin-top: ' + (100 - p.mfData.percents.expenses) + 'px" data-code="' + p.mfData.code + '">';
            html += '<div class="di__line_green" style="height: ' + p.mfData.percents.expenses + 'px"></div>';
            html += '<div class="di__line_orange" style="height: ' + planned + 'px"></div>';
            html += '</div>';
        }

        self.ContentContext.html(html);
        $('#info_container').find('.title_section b').html(formatNew(self.currentType == 100 ? data.average_value : data.average_value / 1000, 1) + '');

        var $perm = $('.di__line[data-code=57701000]');
        if ($perm.length) {
            $perm.trigger('mouseover');
        } else {
            $('.di__line:first').trigger('mouseover');
        }

    };

    self.getPointByCode = function(code) {
        for (var i = 0; i < self.Points.length; i++) {
            if (self.Points[i].mfData.code == code) {
                return self.Points[i];
            }
        }

        return false;
    };

    self._getCustomExpensesLabel = function() {
        switch (parseInt(self.currentType)) {
            case 101: return 'Расходы бюджета на содержание органов местного самоуправления';
            case 102: return 'Расходы бюджета на финансовое обеспечение учреждений образования';
            case 103: return 'Расходы бюджета на финансовое обеспечение учреждений здравоохранения';
            case 104: return 'Расходы бюджета на социальные выплаты населению';
            case 105: return 'Расходы бюджета на содержание объектов жкх';
            case 106: return 'Расходы бюджета на обеспечение общественной безопасности';
            case 107: return 'Расходы бюджета на финансовое обеспечение учреждений культуры';
            case 108: return 'Расходы бюджета на финансовое обеспечение спортивных учреждений';
            case 109: return 'Расходы бюджета на финансовое обеспечение сети общественного транспорта';
            case 110: return 'Расходы бюджета на содержание дорожных объектов';
            case 111: return 'Расходы бюджета на благоустройство территорий';
            case 112: return 'Прочие расходы бюджета';

            default: return 'Расходы бюджета.';
        }
    };

    self.Handlers = {
        onTypeBtnClick: function() {
            self.loadChart($(this).data('type'));

            if ($(this).data('type') == 100) {
                $('.legend_bottom').html('Число жителей, чел.');
            } else {
                $('.legend_bottom').html('Уточненный план расходов, тыс. руб.');
            }

            $('.local-budget-dynamic-wrapper h1:first').html($(this).html() + ($(this).data('type') == 100 ? ', руб.' : ', тыс. руб.'));

            $('.btn_local_budget_type.active').removeClass('active');
            $(this).addClass('active');
        },

        onPointOver: function() {
            var code = $(this).data('code');
            var point = self.getPointByCode(code);

            var per_citizen = formatNew(self.currentType == 100 ? point.mfData.expenses_per_citizen : point.mfData.total_expenses / 1000, 1);
            var population = formatNew(point.mfData.population);
            var planned = formatNew(self.currentType == 100 ? point.mfData.total_expenses / 1000 : point.mfData.planned_new, 1);
            if (!planned.length) {
                planned = '0';
            }

            $('.legend_top').html(self.currentType == 100 ? 'Расходы бюджета на 1 жителя' : self._getCustomExpensesLabel());


            per_citizen += self.currentType == 100
                ? '<span class="mute">Расходы бюджета на 1 жителя</span>'
                : '<span class="mute">' + self._getCustomExpensesLabel() + '</span>';

            population += '<span class="mute">Число жителей, чел.</span>';
            planned += self.currentType == 100
                ? '<span class="mute center">Уточненный план расходов на 2015, тыс. руб.</span>'
                : '<span class="mute center">% от уточненного плана</span>'
            ;

            self.InfoContext.find('h2').html(point.mfData.name);
            self.InfoContext.find('img').attr('src', self.baseUrl + '/img/crests/' + point.mfData.code + '.png');
            self.InfoContext.find('.per_citizen').html(per_citizen);
            self.InfoContext.find('.population').html(population);
            self.InfoContext.find('.total_expenses').html(planned);
        },

        attachEvents: function() {
            self.Context.on('mouseenter', '.di__line', self.Handlers.onPointOver);
            self.Context.on('click', '.btn_local_budget_type', self.Handlers.onTypeBtnClick);
        }
    };

    self.Loader = {
        show: function() {
	        // based by #1277096
            //$('body').append('<div class="page_overlay_loader"><div class="loading"></div></div>');
        },

        hide: function() {
            //$('.page_overlay_loader').remove();
        }
    };

    self.init(params);
};