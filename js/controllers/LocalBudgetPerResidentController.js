function LocalBudgetPerResidentController(params) {
    var _self = this;

    _self.$timestamp = null;
	_self.$year = null;
	_self.$wrapper = null;
    _self.baseUrl = null;
	_self.currentType = null;

    _self.init = function(params) {
        _self.$timestamp = $('.js-select-timestamp');
	    _self.$year = $('.js-select-year');
	    _self.$wrapper = $('.local-budget-wrapper');
	    _self.$dynamicContext = $('.local-budget-dynamic-wrapper');
        _self.baseUrl = params.baseUrl;
	    _self.currentType = params.currentType;

	    _self.Handlers.attachEvents();
    };

	_self.updateContent = function (html) {
		_self.$wrapper.replaceWith($(html));
		_self.$wrapper = $('.local-budget-wrapper');
	};

	_self.updateDynamicContent = function (html) {
		_self.$dynamicContext.replaceWith($(html));
		_self.$dynamicContext = $('.local-budget-dynamic-wrapper');
	};

    _self.Handlers = {
	    onChangeData: function() {
		    var $button = $(this);

            var type = ($button.data('type') === undefined) ? $('.btn_local_budget_type.active').data('type') : $button.data('type');
            if(type == undefined){
                type = $('.incomes_submenu_title.active').data('type');
            }

		    _self.Loader.show();
			
			var date = new Date(_self.$timestamp.val()*1000);
			var year = date.getFullYear();
			//console.log(date.getMonth());
			if (year!=_self.$year.val() || date.getMonth() == 11){
				if (_self.$year.val() == 2015) {
					var newDate="02/01/"+_self.$year.val();
				} else {
					var newDate="01/01/"+_self.$year.val();
				}				
				tm = new Date(newDate).getTime() / 1000
			} else {
				tm = _self.$timestamp.val();
			}

	        $.ajax({
		        url: _self.baseUrl + '/local_budgets/per_resident_' + _self.currentType,
		        type: 'post',
		        data: {
			        year: _self.$year.val(),
			        timestamp: /*_self.$timestamp.val()*/ tm,
			        type: type
		        }
	        }).done(function(html) {
		        _self.Loader.hide();
		        _self.updateContent(html);
                        
                        $('.income_description').hide();
                        $('.js-income_description_'+type).show();
                        
				var types_array = [1,2,3,4,5,12,6,7,7001,7002,7003,7004,10002];
                var $title = $('.per_resident_title');
                if(type == '10000') {
                    $title.html('Доходы');
                } else if (type == '11'){
                    $title.html('Недоимка. Всего');
                }else if(type == '11000') {
                    $title.html('Расходы. Всего');
                } 
				else if (types_array.indexOf(type)!=-1){
					 $title.html($title.html());
				}
				else {
                    $title.html($('.incomes_submenu_title:first').html() + '. ' + $title.html());
                }

                var $export = $('.export');
                var href = $export.attr('href');
                var tmp = href.split('?');
                if (tmp.length > 1) {
                    href = tmp[0];
                }

                var timestamp = $('.js-select-timestamp').find('option:selected').val();
                var year = $('.js-select-year').find('option:selected').val();
                $export.attr('href', href + '?year=' + year + '&timestamp=' + timestamp);
	        });

		    return false;
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

	    onClickArrearsDetails: function() {
		    var code = $(this).data('code');
		    var type = $(this).data('type');

		    _self.Loader.show();
			
			var date = new Date(_self.$timestamp.val()*1000);
			var year = date.getFullYear();
			if (year!=_self.$year.val()){
				var newDate="02/01/"+_self.$year.val();
				tm = new Date(newDate).getTime() / 1000
			} else {
				tm = _self.$timestamp.val();
			}
			
			
		    $.ajax({
			    url: _self.baseUrl + '/local_budgets/arrears_details',
			    type: 'post',
			    data: {
				    type: type,
				    code: code,
                    timestamp: /*_self.$timestamp.val()*/ tm,
				    per_resident: 1
			    }
		    }).done(function(html) {
			    _self.Loader.hide();
			    _self.updateDynamicContent(html);
		    });
	    },

        attachEvents: function() {
	        _self.$timestamp.chosen().change(_self.Handlers.onChangeData);
	        _self.$year.chosen().change(_self.Handlers.onChangeData);
	        _self.$wrapper.on('click', '.btn_local_budget_type, .incomes_submenu_title', _self.Handlers.onChangeData);
	        _self.$wrapper.on('click', '.btn_local_budget_show_all', _self.Handlers.onClickShowAllIncomesButton);
	        _self.$wrapper.on('click', '.region.clickable', _self.Handlers.onClickArrearsDetails);
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