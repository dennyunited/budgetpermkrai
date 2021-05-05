function LocalBudgetDebtController(params) {
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
        onClickDebtTypeButton: function() {
            var $button = $(this);

            self.currentType = $button.data('type');
            self.Loader.show();
            $.ajax({
                url: self.baseUrl + '/local_budgets/municipal_debt',
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
                    $('h1.border-title span:first').html('Муниципальный долг');
                }
            });
        },

        attachEvents: function() {
            self.Context.on('click', '.btn_local_budget_type', self.Handlers.onClickDebtTypeButton);
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