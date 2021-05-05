function LocalBudgetController(params) {
    var self = this;
    self.Context = null;
    self.ContentContext = null;
    self.baseUrl = null;
    self.currentType = 0;
    self.pageType = null;

    self.init = function(params) {
        self.Context = $('.local-budget-wrapper');
        self.ContentContext = $('.local-budget-dynamic-wrapper');
        self.baseUrl = params.baseUrl;
        self.pageType = params.pageType;
        self.$timestamp = $('.js-select-timestamp');
        self.$year = $('.js-select-year');
        self.Handlers.attachEvents();
    };
	
    self.updateContentContext = function (html) {
		self.Context.replaceWith($(html));
		self.Context = $('.local-budget-wrapper');

        var $export = $('.export');
        var href = $export.attr('href');
        var tmp = href.split('?');
        if (tmp.length > 1) {
            href = tmp[0];
        }

        var timestamp = $('.js-select-timestamp').find('option:selected').val();
        var year = $('.js-select-year').find('option:selected').val();
        $export.attr('href', href + '?year=' + year + '&timestamp=' + timestamp);
    };
	
	self.updateContext = function (html) {
        self.ContentContext.replaceWith($(html));
        self.ContentContext = $('.local-budget-dynamic-wrapper');
        var $export = $('.export');
        var href = $export.attr('href');
        var tmp = href.split('?');
        if (tmp.length > 1) {
            href = tmp[0];
        }

        var timestamp = $('.js-select-timestamp').find('option:selected').val();
        var year = $('.js-select-year').find('option:selected').val();
        $export.attr('href', href + '?year=' + year + '&timestamp=' + timestamp);
    };

    self.Handlers = {
        onClickIncomeTypeButton: function() {
            var $button = $(this).hasClass('js-select-timestamp') || $(this).hasClass('js-select-year')
                ? self.Context.find('.btn_local_budget_type.active')
                : $(this);
			
			self.currentType = ($button.data('type') === undefined) ? $('.btn_local_budget_type.active').data('type') : $button.data('type');
            if(self.currentType == undefined){
                self.currentType = $('.incomes_submenu_title.active').data('type');
            }
			
			if(self.currentType == undefined){
                self.currentType = $('.btn_local_budget_type').eq(0).data('type');
            }

            self.Loader.show();
			var date = new Date(self.$timestamp.val()*1000);
			var year = date.getFullYear();
			if (year!=self.$year.val()   || date.getMonth() == 11){
				if (self.$year.val() == 2015) {
					var newDate="02/01/"+self.$year.val();
				} else {
					var newDate="01/01/"+self.$year.val();
				}
				tm = new Date(newDate).getTime() / 1000
			} else {
				tm = self.$timestamp.val();
			}
            $.ajax({
                url: self.baseUrl + '/local_budgets/' + self.pageType,
                type: 'post',
                data: {
                    type: self.currentType,
                    timestamp: tm,
                    year: self.$year.val()
                }
            }).done(function(resp) {
				
                self.Loader.hide();
                self.updateContentContext(resp);
                var newTitle = $button.text();
                var preTitle = 'Расходы на ';
				var types_array = [1,2,3,4,5,12,6,7,7001,7002,7003,7004,10002];

                if (self.pageType == 'incomes'){
                    preTitle = 'Собственные доходы';

                    if (self.currentType == '10000') {
                        newTitle = '';
                        preTitle = 'Доходы'
                    }
                }

                if (self.pageType == 'expenses'){
                    preTitle = 'Расходы. ';

                    if (self.currentType == '100') {
                        newTitle = 'Всего';
                    }
                }

                if (self.pageType == 'arrears'){
                    preTitle = 'Недоимка. ';

                    if (self.currentType == '11') {
                        newTitle = 'Всего';
                    }
                }

                if (self.pageType == 'shortage') {
                    preTitle = newTitle = '';
                }
				
				if (types_array.indexOf(self.currentType)!=-1){
					 preTitle = '';
				}
                $('.___title').find('span:first').html(preTitle + newTitle);
            });
        },
        onClickShowAllIncomesButton: function() {
            var $other = $('.btn_local_budget_show_all').not(this);
            var currentTable = $(this).parents('.raitings');
            var raitingsList = null;

            $('.raitings').show();
            currentTable.hide();
            $other.parents('.raitings:first').hide();

            $('.raitings.outsider.total, .raitings.top.total').hide();

            if(currentTable.hasClass('outsider')){
                raitingsList = $('.raitings.outsider.total');
            }
            else{
                raitingsList = $('.raitings.top.total');
            }

            $(raitingsList).find('.raitings-title:first').hide();


            $('html, body').animate({
                scrollTop: raitingsList.find('h1:first').offset().top
            }, 1);

            raitingsList.show();
        },

        onClickShowSubmenu: function() {
            if(!$(this).hasClass('active')){
                $('h1.border-title').find('span:first').html('Местные бюджеты. ' + $(this).html());
                $('.in-out-list .incomes_submenu_title.active').removeClass('active');
                $(this).addClass('active');
                $('.in-out-list .incomes_submenu_list.active').removeClass('active');
                $('.in-out-list .incomes_submenu_list').eq($(this).index()).addClass('active');
            }

            if ($(this).data('type'))
                self.Handlers.onClickIncomeTypeButton.apply($(this));
            else
                $('.in-out-list .incomes_submenu_list.active li:first-child a').trigger('click');
        },

        onClickArrearsDetails: function() {
            var code = $(this).data('code');
	        var type = $(this).data('type');

            self.Loader.show();
            $.ajax({
                url: self.baseUrl + '/local_budgets/arrears_details',
                type: 'post',
                data: {
                    type: type,
                    timestamp: self.$timestamp.val(),
                    code: code
                }
            }).done(function(resp) {
                self.Loader.hide();
                self.updateContext(resp);
            });
        },

        attachEvents: function() {
            self.$timestamp.chosen().change(self.Handlers.onClickIncomeTypeButton);
            self.$year.chosen().change(self.Handlers.onClickIncomeTypeButton);
            self.Context.on('click', '.btn_local_budget_type', self.Handlers.onClickIncomeTypeButton);
            self.Context.on('click', '.btn_local_budget_show_all', self.Handlers.onClickShowAllIncomesButton);
            self.Context.on('click', '.in-out-list .incomes_submenu_title', self.Handlers.onClickShowSubmenu);
            self.Context.on('click', '.region.clickable', self.Handlers.onClickArrearsDetails);

            //$('.btn_local_budget_type:first').click();
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