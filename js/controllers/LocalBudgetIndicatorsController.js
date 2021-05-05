function LocalBudgetIndicatorsController(params) {
    var _self = this;

    _self.$timestamp = null;
	_self.$year = null;
    _self.$mf_code = null;
	_self.$wrapper = null;
    _self.baseUrl = null;
    _self.BaseExportLink = null;
	_self.isIndicatorPage = false;

    _self.init = function(params) {
        _self.$timestamp = $('.js-select-timestamp');
	    _self.$year = $('.js-select-year');
        _self.$mf_code = $('.js-select-mf_code');
	    _self.$wrapper = $('.local-budget-wrapper');
        _self.baseUrl = params.baseUrl;
	    _self.isIndicatorPage = params.isIndicatorPage || false;
        _self.BaseExportLink = $('a.export').attr('href');

	    _self.Handlers.attachEvents();
    };

	_self.updateContentContext = function (html) {
		_self.$wrapper.replaceWith($(html));
		_self.$wrapper = $('.local-budget-wrapper');
	};

    _self.Handlers = {
	    onChangeData: function() {
		    var $button = $(this);
		    var data = null;

		    if ($button.data('back') == 1) {
			    data = {
				    year: $button.data('year'),
				    timestamp: $button.data('timestamp'),
				    type: $button.data('type')
			    };
		    }
		    else {
			    data = {
				    year: _self.$year.val(),
				    timestamp: _self.$timestamp.val(),
				    type: $button.data('type')
			    };
		    }

		    _self.Loader.show();
	        $.ajax({
		        url: _self.baseUrl + '/local_budgets/indicators',
		        type: 'post',
		        data: data
	        }).done(function(html) {
		        _self.Loader.hide();
		        _self.updateContentContext(html);
	        });
        },

	    onChangeDetails: function() {
		    var $button = $(this);

		    _self.Loader.show();
		    $.ajax({
			    url: _self.baseUrl + '/local_budgets/indicator_details',
			    type: 'post',
			    data: {
				    year: _self.$year.val(),
				    timestamp: _self.$timestamp.val(),
				    mf_code: $button.data('mf_code'),
				    type: $button.data('type')
			    }
		    }).done(function(html) {
			    _self.Loader.hide();
			    _self.updateContentContext(html);
		    });
	    },

        attachEvents: function() {
	        _self.$timestamp.chosen().change(_self.isIndicatorPage ? _self.Handlers.onChangeData : _self.Handlers.onChangeDetails);
	        _self.$year.chosen().change(_self.isIndicatorPage ? _self.Handlers.onChangeData : _self.Handlers.onChangeDetails);
	        _self.$mf_code.chosen().change(_self.Handlers.onChangeData);
	        _self.$wrapper.on('click', '.btn_local_budget_type', _self.Handlers.onChangeData);
	        _self.$wrapper.on('click', '.js-municipal-formation', _self.Handlers.onChangeDetails);
        }
    };

    _self.Loader = {
        show: function() {
	        // based by #1277096
		    //console.log('Show loader');
	    },

	    hide: function() {
		    //console.log('Hide loader');
	    }
    };

    _self.init(params);
};