function LocalBudgetIncomesController(params) {
    var self = this;
    self.Context = null;
    self.ContentContext = null;
    self.baseUrl = null;
    self.currentType = 0;

    self.init = function(params) {
        self.Context = $('.local-budget-static-wrapper');
        self.ContentContext = $('.local-budget-dynamic-wrapper');
        self.baseUrl = params.baseUrl;

        self.Handlers.attachEvents();
    };

    self.updateContentContext = function (html) {
        self.ContentContext.replaceWith($(html));
        self.ContentContext = $('.local-budget-dynamic-wrapper');
    };

    self.Handlers = {
        onClickIncomeTypeButton: function() {
            var $button = $(this);

            self.currentType = $button.data('type');
            self.Loader.show();
            $.ajax({
                url: self.baseUrl + '/local_budgets/incomes',
                type: 'post',
                data: {
                    type: self.currentType
                }
            }).done(function(resp) {
                self.Loader.hide();
                self.updateContentContext(resp);
                $('.btn_local_budget_type.active').removeClass('active');
                $button.addClass('active');

                if (self.currentType == 0) {
                    $('h1.border-title span:first').html('Местные бюджеты. доходы');
                }
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

            self.Loader.show();
            $.ajax({
                url: self.baseUrl + '/local_budgets/incomes',
                type: 'post',
                data: {
                    type: self.currentType,
                    code: code
                }
            }).done(function(resp) {
                self.Loader.hide();
                self.updateContentContext(resp);
            });
        },

        attachEvents: function() {
            self.Context.on('click', '.btn_local_budget_type', self.Handlers.onClickIncomeTypeButton);
            self.Context.on('click', '.btn_local_budget_show_all', self.Handlers.onClickShowAllIncomesButton);
            self.Context.on('click', '.in-out-list .incomes_submenu_title', self.Handlers.onClickShowSubmenu);
            self.Context.on('click', '.region.clickable', self.Handlers.onClickArrearsDetails);
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