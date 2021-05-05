$(function(){

	window.onload = function(){
        var budgetCalculator = new BudgetCalculator();
        budgetCalculator.currentYear = $('.js-calc-settings').data("year");
		budgetCalculator.initControlButtons();
        $('.preloader_block').hide();
    };

	function BudgetCalculator()
	{
		var _self = this;
		this.$currentExpenses = null;
		this.$difference =  null;
		this.$controls =  null;
		this.$programControls =  null;
		this.$detailControls=  null;

		this.$progress =  null;
		this.$verdict =  null;
		this.$resetButton =  null;
		this.$sendButton =  null;
		this.$exportButton =  null;
		this.$blockedBtton =  null;
		this.$userNamePopup =  null;
		this.$cover =  null;
		this.programControls = []; //Array - program sliders (key=>program ID, value=>JQuery object of program slider)
		this.detailControls = []; //Array - detail sliders (key=>program ID, value=> set of JQuery objects of detail slider)
		this.INCOMES = { 2014: 97387.7, 2015: 101151.5, 2016: 101306.3, 2017: 104194.5};
		this.EXPENSES = { 2014: 109499.6, 2015: 113000.5, 2016: 114019.9, 2017: 111600.82};
		this.INITIAL_DIFFERENCE = 0;
		this.DIFICIT_LIMIT = -7405.4;
		this.difference = 0; //Difference between EXPENSES and current_expenses
		this.dificit = 0; //Difference between EXPENSES and current_expenses
		this.formLocked = true;
		this.formChanged = false;
		this.$calcHeader =  null;
        this.$nextStepBtn =  null;
        this.$sliderResetBtn=  null;
        this.$linkBack=  null;
		this.$sideMessage = null;

        this.changedData = {};
        this.currentYear = null;

		this.bNotInitialized = true;

        /**
        * Calculator initialization of jquery object function
        * @return void
        */
        this.initElement = function () {
            this.currentYear = $('.js-calc-settings').data("year");
            this.$currentExpenses = $('.js-current_expenses'); //JQuery object - current expenses indicator
            this.$difference = $('.js-difference'); //JQuery object - difference between EXPENSES and current_expenses indicator
            this.$controls = $('.js-control_budget'); //JQuery objects - all sliders
            this.$programControls = $('.js-control_budget[data-calc_program_id]'); //JQuery objects - program sliders
            this.$progress = $('.js-total_progress'); //JQuery object - scale difference between EXPENSES and current_expenses indicator
            this.$verdict = $('.js-verdict'); //JQuery object - verdict indicator
            this.$resetButton = $('.js-reset_calc'); //JQuery object - reset calculator button
            this.$sendButton = $('.js-send_form'); //JQuery object - send calculator form button
            this.$exportButton = $('.js-calc_export'); //JQuery object - download PDF document
            this.$blockedBtton = $('.js-form_blocked'); //JQuery object - button locked form
            this.$userNamePopup = $('.js-username_popup'); //JQuery object - user name popup
            this.$cover = $('.popups_bg'); //JQuery object - popup bg cover
            this.$calcHeader = $('.js-calc_header');
            this.$nextStepBtn = $('.js-next-step');
            this.$sliderResetBtn= $('.js-slider-reset');
            this.$linkBack = $('.js-link-back');
	        this.$sideMessage = $('.side-message');
        };

		/**
		 * Calculator initialization of default values
		 * @return void
		 */
		this.initDefaultValues = function() {
			if (_self.bNotInitialized) {
				var sum = 0;
				_self.$controls.each(function(ind, item) {
					sum += $(item).data('value');
				});

				sum /= 1e6;

				this.INITIAL_DIFFERENCE =  this.EXPENSES[this.currentYear] - sum;

				_self.bNotInitialized = false;
			}
		};

		/**
		 * Function return program equalto 0 if it's 'Прочие государственные программы'
		 * @return integer
		 */
		this.getParentProgram = function($item) {
			var parentDetail = $item.data('calc_parent_detail'),
				parentProgram = $item.data('calc_parent_program');
			return parentDetail === 0 ? 0 : parentProgram;
		};

		/**
		 * Calculator initialization function
		 * @return void
		 */
		this.init = function()
		{
            _self.initElement();

			_self.initDefaultValues();
            // set positive difference by default
			_self.$difference.data('positive', true);

			if($('input[type="checkbox"]').length > 0)
			{
				$('input[type="checkbox"]').checkbox();
			}

			// Initialization slider widgets
			_self.$controls.each(function() {
				var programId = false;
				if (programId = $(this).attr('data-calc_program_id')) {
					$(this).data('programId', programId);

					_self.programControls[programId] = $(this);
					_self.programControls[programId].detailsInitialized = false;

                    var max_percent = $(this).data('max_percent'),
                        min_percent = $(this).data('min_percent'),
                        main_program = $(this).data('main_program'),
                        parentDetail = $(this).data('calc_parent_detail'),
                        parentProgram = _self.getParentProgram($(this));

                    var percent = 100;
                    if (main_program) {
                        if (typeof _self.changedData[programId] != 'undefined') {
                            percent =  _self.changedData[programId].percent;
                        }
                    } else {
                        if (
                            typeof _self.changedData[parentProgram] != 'undefined' &&
                            typeof _self.changedData[parentProgram]['children'][programId] != 'undefined'
                        ) {
                            percent =  _self.changedData[parentProgram]['children'][programId].percent;
                        } else if (
                            typeof _self.changedData[parentProgram] != 'undefined' &&
                            typeof _self.changedData[parentProgram]['children'][parentDetail] != 'undefined'
                        ) {
                            percent = _self.changedData[parentProgram]['children'][parentDetail].percent;
                        } else if (typeof _self.changedData[parentProgram] != 'undefined') {
                            percent = _self.changedData[parentProgram].percent;
                        }
                    }


					var type = $(this).attr('type');
					if (type == 'checkbox') {
						$(this).data('percent_value', percent);
						$(this).data('initial_value', parseFloat($(this).data('value')));
						var val = parseFloat($(this).data('initial_value')) / 100 * percent;
						$(this).data('value', val);
						$('.js-check-sum-' + programId).text(_self.formatValuesToString(val));
						if ($(this).hasClass('js-check-yes')) {
							if (typeof _self.changedData[parentProgram].children[programId] != 'undefined' && _self.changedData[parentProgram].children[programId].value == 0) {
								$(this).prop("checked", false);
								$('.js-yes-container-' + programId).find('.fake_checkbox').removeClass('checked');
							} else {
								$(this).prop("checked", true);
								$('.js-yes-container-' + programId).find('.fake_checkbox').addClass('checked');
							}

							$(this).on('click', function () {
								if ($(this).prop('checked')) {
									_self.changedData[parentProgram].children[programId].value = val;
									_self.changedData[parentProgram].children[parentDetail].value += val;

									_self.changeParents(parentProgram, parentDetail, val);

									$('.js-no-container-' + programId).find('input').prop('checked', false);
									$('.js-no-container-' + programId).find('.fake_checkbox').removeClass('checked');
									_self.collectDataItem($(this));
									_self.calculate();
									$('.js-check-sum-' + programId).text(_self.formatValuesToString(_self.changedData[parentProgram].children[programId].value));
									$('.js-indicator-mes[data-id-program="' + programId + '"]').hide();
									$('.message-inner-income[data-id-program="' + programId + '"]').show();
								} else {
									$('.js-yes-container-' + programId).find('.fake_checkbox').addClass('checked');
									return false;
								}
							});
						} else if ($(this).hasClass('js-check-no')) {
							if (typeof _self.changedData[parentProgram].children[programId] != 'undefined') {
								if (_self.changedData[parentProgram].children[programId].value == 0) {
									$(this).prop("checked", true);
									$('.js-check-sum-' + programId).text(_self.formatValuesToString(0));
									$('.js-no-container-' + programId).find('.fake_checkbox').addClass('checked');
								} else {
									$(this).prop("checked", false);
									$('.js-no-container-' + programId).find('.fake_checkbox').removeClass('checked');
								}
							}
							$(this).on('click', function () {
								if ($(this).prop('checked')) {
									_self.changedData[parentProgram].children[programId].value = 0;
									_self.changedData[parentProgram].children[parentDetail].value -= val;
									_self.changeParents(parentProgram, parentDetail, -val);

									$('.js-yes-container-' + programId).find('input').prop('checked', false);
									$('.js-yes-container-' + programId).find('.fake_checkbox').removeClass('checked');
									_self.collectDataItem($(this));
									_self.calculate();
									$('.js-check-sum-' + programId).text(_self.formatValuesToString(_self.changedData[parentProgram].children[programId].value));
									$('.js-indicator-mes[data-id-program="' + programId + '"]').hide();
									$('.message-inner-outcome[data-id-program="' + programId + '"]').show();
								} else {
									$('.js-no-container-' + programId).find('.fake_checkbox').addClass('checked');
									return false;
								}
							});
						}
					} else {
						var disabled = false;
						if ($(this).data('disabled'))
							disabled = true;
						$(this).slider({
							range: 'min',
							min: 100 + min_percent,
							max: max_percent + 100,
							step: 1,
							value: percent,
							disabled: disabled,
							create:function(event, ui)
							{
								$(this).find('a').append($("<span class='value'><span class='number'></span></span>"));
								$(this).data('percent_value', percent);
								$(this).data('$percent', $(this).find('.percent'));
								$(this).data('$number', $(this).find('.number'));

								if (main_program) {
									if (typeof _self.changedData[programId] != 'undefined' && typeof _self.changedData[programId].value != 'undefined') {
										$(this).data('initial_value', _self.changedData[programId].value / _self.changedData[programId].percent * 100);
									} else {
										$(this).data('initial_value', parseFloat($(this).data('value')));
									}
								} else {
									if (typeof _self.changedData[parentProgram] != 'undefined' && typeof _self.changedData[parentProgram].children[programId] != 'undefined') {
										$(this).data('initial_value', _self.changedData[parentProgram].children[programId].value / _self.changedData[parentProgram].children[programId].percent * 100);
									} else {
										$(this).data('initial_value', parseFloat($(this).data('value')));
									}
								}

								var val = parseFloat($(this).data('initial_value')) / 100 * percent;

								$(this).data('value', val);

								_self.processControlDisplay($(this));
							},
							slide:function(event, ui)
							{
								var val = parseFloat($(this).data('initial_value')) / 100 * ui.value;
								$(this).data('value', val);
								$(this).data('percent_value', ui.value);

								_self.processControlDisplay($(this));
								_self.collectDataItem($(this));
								_self.calculate();
							}
						});

						$(this).bind("mousedown", function(event){
							if ($(this).data('disabled')) {
								var detailId = $(this).data('calc_program_id');
								if (detailId) {
									$('.js-indicator-mes[data-id-program="' + detailId + '"]').css({display: 'table-cell'});
								}
							}
						});
					}
				}
                if ($(this).data('calc_parent_program_id')) {
				    var $indicators = $('.js-indicator[data-program_detail_id="' + $(this).data('detail_item_id')+'"]');
				    if($indicators.length > 0){
					    $(this).data('$indicators', $indicators);
				    }
				}
			});

			_self.collectData();

            _self.$nextStepBtn.click(function () {
                var wrapper = $(this).parents('.budget-opt').find('.js-btns-block'),
                    programId = wrapper.data('calc_program_id'),
                    percent = _self.programControls[programId].data('percent_value'),
                    parent = wrapper.data('calc_detail_id');
	            _self.$cover.show();
                $.ajax({
                    url: '/calculators/programDetails',
                    data: {
                        program_id: programId,
                        percent: percent,
                        parent: parent,
                        year:  _self.currentYear
                    }
                }).done(function (html) {
                    $('.js-calc-settings').html(html);
	                $('html,body').animate({
		                scrollTop: 420
	                }, 500);
                    _self.init();
		            _self.processSideMessage();
	                _self.$cover.hide();
                });
            });

            _self.$linkBack.click(function () {
                var programId = $(this).data('program_id'),
                    parent = $(this).data('parent_id'),
                    percent = 0;
	            _self.$cover.show();
                $.ajax({
                    url: '/calculators/back',
                    data: {
                        program_id: programId,
                        percent: percent,
                        parent: parent,
                        year:  _self.currentYear
                    }
                }).done(function (html) {
                    $('.js-calc-settings').html(html);
                    _self.init();
	                //_self.collectData();
	                _self.processSideMessage();
	                _self.$cover.hide();
					$('.js-your-result').hide();
                });

                return false;
            });

            _self.$sliderResetBtn.click(function () {
	            var $parent = $(this).parents('.js-btns-block'),
                    programId = $parent.data('calc_program_id'),
                    detailId = $parent.data('calc_detail_id');

				if (typeof programId != 'undefined') {
					var item = $('.js-control_budget[data-calc_program_id="' + detailId + '"]');
					if (item.hasClass('js-check-yes') || item.hasClass('js-check-no')) {
						$('input.js-check-yes[data-calc_program_id="' + detailId + '"]').prop('checked', true);
						$('input.js-check-yes[data-calc_program_id="' + detailId + '"]').trigger('click');
						$('input.js-check-no[data-calc_program_id="' + detailId + '"]').prop('checked', false);
						$('.js-indicator-mes[data-id-program="' + detailId + '"]').hide();
					} else {
						_self.resetCalculator(programId, detailId);
					}
				}
            });

            var b = $('#budget-header-block'); // закрупляемый блок
            var bHeight = b.outerHeight(); // его высота
            var content = b.closest('.content'); // блок, в котром он расположен
            var offsetFooter = $('.footer').offset().top;  // отступ футера сверху
            var preHeight = $('.header').outerHeight() + $('.menu').outerHeight() + $('.crumbs').outerHeight() +  $('.balanace-top').outerHeight(); // высота header + menu +
            var mes = $('.side-message');

			$(window).on('scroll', function() {
                var scroll = $(window).scrollTop();

				// класс stick-bottom удаляет блок с экрана и скрывает страницу "ВАШ РЕЗУЛЬТАТ"
				/*if(scroll + bHeight > offsetFooter) {
					b.addClass('stick-bottom');
				} else {
					b.removeClass('stick-bottom');
				}

				if (!b.hasClass('stick-bottom')) {*/
					if (scroll > preHeight) {
						b.addClass('fix-balance');
						b.css('top', scroll - 299 + 'px');
						b.css('width', $('.content').width() - 100 + 'px');
						content.css('padding-top', bHeight + 'px');
					} else {
						b.removeClass('fix-balance');
						content.css('padding-top', 0 + 'px');
					}
				//}

				if (mes.length && !b.hasClass('stick-bottom')) {
					var blockH = $('.js-calc-settings').outerHeight(),
						top = $('.budget-opts').offset().top;

					if ( (scroll + bHeight) > top ) {
						var offsetTop =  (scroll + bHeight) - top,
							dif = (mes.offset().top + mes.outerHeight()) - (top + $('.budget-opts').outerHeight());
						if (dif > 0)
							offsetTop -= dif;

						mes.css({
							top: offsetTop + 'px',
							width: '298px',
							display: 'block'
						});
					} else {
						mes.css({
							top: 0 + 'px',
							width: '351px',
							display: 'block'
						});
					}
				}
			});

			$(window).resize(function () {
				$(window).trigger('scroll');
			});


			$('#calc-result .btn').click(function() {
				popup('calc-result', '');
			});

			$('.total_header a.step').on('click', function() {
				$('.total_header a.step').removeClass('active');
				$(this).addClass('active');
				if ($(this).data('step') == 2) {
					// show results
					$('.budget-opts, .budget-cat').hide();
					$('.js-your-result').show();
					_self.$cover.show();
					//console.log(_self.currentYear);
					//console.log(_self.changedData);

					$.ajax({
						url: '/calculators/yourResults',
						data: { budgetData:JSON.stringify(_self.changedData), year:  _self.currentYear },
						type: 'POST'
					}).done(function (html) {
						$('.js-your-result').html(html);
						_self.$cover.hide();
					});
				} else {
					// show programs
					$('.js-your-result').hide();
					$('.budget-opts, .budget-cat').show();
				}
				return false;
			});

			_self.formChanged = false;
		};

		this.changeParents = function (parentProgram, parentDetail, val) {
			if (_self.changedData[parentProgram].children[parentDetail].parentDetail != "") {
				_self.changedData[parentProgram].children[_self.changedData[parentProgram].children[parentDetail].parentDetail].value += val;
				var item = _self.changedData[parentProgram].children[_self.changedData[parentProgram].children[parentDetail].parentDetail];
				var parent = typeof item != 'undefined' ? item.parentDetail : null;
				if (parent)
					_self.changeParents(parentProgram, parent, val);
				else {
					_self.changedData[parentProgram].value += val;
					if (val < 0) {
						if (typeof _self.changedData[parentProgram].changedItemCount == 'undefined') {
							_self.changedData[parentProgram].changedItemCount = 0;
						}
						_self.changedData[parentProgram].changedItemCount++;
					} else {
						if (typeof _self.changedData[parentProgram].changedItemCount != 'undefined' && _self.changedData[parentProgram].changedItemCount != 0) {
							_self.changedData[parentProgram].changedItemCount--;
						}
					}

				}
			} else {
				_self.changedData[parentProgram].value += val;
			}
		};

		this.initControlButtons = function () {
			_self.$sendButton.click(function () {
				_self.sendForm();
			});

			$('.js-close_success_popup').click(function(){
				$(this).closest('.popup').hide();
				_self.$cover.hide();
			});

			$('.js-close-username_popup').on('click', function(){
				$(this).closest('.popup').hide();
				_self.$cover.hide();
			});

			$('.js-save-username_popup').on('click', function(){
				_self.$userNamePopup.hide();
				_self.$cover.hide();
				//_self.collectData();
				_self.sendForm(_self.$userNamePopup.find('input').val(), $(this).data('url'));
			});

			_self.$exportButton.click(function() {
				_self.getPdf($(this).attr('href'));
				return false;
			});


			_self.$resetButton.click(function() {
				_self.resetCalculator();
				$('.total_header a.step.active').trigger('click');
				$('html,body').animate({
					scrollTop: 200
				}, 500);
			});

			$('.js-close-popup').on('click', function() {
				_self.closePopup($(this));
			});

			$(".popup_close").off("click");
			$(".popup_close").on("click", function() {
				_self.closePopup($(this));
			});

            $('.js-total-incomes').text(formatNumber(_self.INCOMES[_self.currentYear]));
            $('.js-total-expenses').text(formatNumber(_self.EXPENSES[_self.currentYear]));
            console.log("init dificit: " + _self.dificit);
            _self.$difference.html(_self.formatValuesToString(_self.dificit, 1));
		};

        /**
         * Function collects the values ​​of the input fields and creates an object.
         * @return void
         */
        this.collectData = function()
        {
	        var element = null,
		        id = null,
		        mainProgram = null,
		        parentProgram = null,
		        parentDetail = null,
		        value = null,
		        initialValue = null,
		        percent = null;
	        _self.$programControls.each(function (ind, item) {
		        element = $(item),
			        id = element.data('calc_program_id'),
			        mainProgram = element.data('main_program'),
			        parentProgram = element.data('calc_parent_program'),
			        parentDetail = element.data('calc_parent_detail'),
			        value = element.data('value'),
			        initialValue = element.data('initial_value'),
			        percent = element.data('percent_value');

		        if (mainProgram) {
			        if (typeof  _self.changedData[id] == 'undefined' || _self.getObjectSize(_self.changedData[id].children) == 0) {
				        _self.changedData[id] = {value: value, percent: percent, initialValue: initialValue, children: {}};
			        }
		        } else if (typeof _self.changedData[parentProgram]['children'][id] == 'undefined') {
			        _self.changedData[parentProgram]['children'][id] = {
				        value: value,
				        percent: percent,
				        parentDetail: parentDetail,
				        initialValue: initialValue
			        }
		        }
	        });
        };

		this.calculateChildrenValues = function(array, parentDetail, percent) {
			for(var ind in array) {
				if (array[ind].parentDetail == parentDetail) {
					array[ind].value = array[ind].value / array[ind].percent * percent;
					array[ind].percent = percent;
					array = _self.calculateChildrenValues(array, ind, percent);
				}
			}
			return array;
		};

		this.calculateParentValues = function(array, id, parentDetail, percent, hasInitialValue) {
			if (id) {
				for(var ind in array) {
					if (ind == id) {
						array[ind].value = array[ind].value / array[ind].percent * percent;
						array[ind].percent = percent;
						break;
					}
				}
			}
			var sum = 0;

			for(var ind in array) {
				if (array[ind].parentDetail == parentDetail) {
					sum += array[ind].value;
				}
			}

			if (typeof array[parentDetail] != 'undefined') {
				if (array[parentDetail].value != 0)
					array[parentDetail].percent = sum / (array[parentDetail].value / array[parentDetail].percent);
				else
					array[parentDetail].percent = percent;

				array[parentDetail].value = sum;

				array = _self.calculateParentValues(array, parentDetail, array[parentDetail].parentDetail, array[parentDetail].percent);
			}

			return array;
		};

		/**
		 * Function collects the values ​​of exactly input field and creates an object.
		 * @return void
		 */
		this.collectDataItem = function(itemElement)
		{
			var element = $(itemElement),
				id = element.data('calc_program_id'),
				mainProgram = element.data('main_program'),
				parentProgram = element.data('calc_parent_program'),
				parentDetail = element.data('calc_parent_detail'),
				value = element.data('value'),
				percent = element.data('percent_value');

			if (typeof mainProgram == 'undefined') {
				_self.changedData[parentProgram].children[id].value = _self.changedData[parentProgram].children[id].value  / _self.changedData[parentProgram].children[id].percent * element.data('percent_value');

				_self.changedData[parentProgram].children[id].percent = element.data('percent_value');

				if (element.data('percent_value') == _self.changedData[parentProgram].children[id].percent) {
					_self.changedData[parentProgram].children = _self.calculateChildrenValues(_self.changedData[parentProgram].children, id, element.data('percent_value'));
				}

				_self.changedData[parentProgram].children = _self.calculateParentValues(_self.changedData[parentProgram].children, id, parentDetail, element.data('percent_value'));
				var res = _self.getParentValue(_self.changedData[parentProgram].children, _self.changedData[parentProgram], "");

				if (res) {
					_self.changedData[parentProgram].percent = res.percent;
					_self.changedData[parentProgram].value  = res.value;
				}
			} else {
				_self.changedData[id].value = _self.changedData[id].value / _self.changedData[id].percent * element.data('percent_value');
				_self.changedData[id].percent = element.data('percent_value');

				if (element.data('percent_value') == _self.changedData[id].percent) {
					$.each(_self.changedData[id].children, function (ind, item) {
						if (item.parentDetail == "") {
							item.value = item.value / item.percent * element.data('percent_value');
							item.percent = element.data('percent_value');
						}
					});
					_self.changedData[id].children = _self.calculateChildrenValues(_self.changedData[id].children, "", element.data('percent_value'));
				}
			}
		};

        this.getObjectSize = function(obj) {
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

		this.getParentValue = function(array, parent, parentId) {
			var sum = 0;
			var percent = 0;
			var length = 0;
			var res = {value: null, percent: null};
			var isInitValue = false;
			$.each(array, function (ind, item) {
				if (typeof parentId == 'undefined' || parentId == item.parentDetail) {
					length++;
					sum += item.value;
					percent += item.percent;
				}
			});

			if (length > 0) {
				if (percent / length != 100) {
					res['percent'] = sum / (parent.value / parseFloat(parent.percent));
					res['value'] = sum;
				} else {
					if (typeof parent.changedItemCount == 'undefined' || parent.changedItemCount == 0) {
						res['percent'] = 100;
						res['value'] = parent.initialValue;
					} else {
						res['percent'] = sum / (parent.value / parseFloat(parent.percent));
						res['value'] = sum;
					}
				}

				return res;
			}
			return false;
		};


		/**
		* Function send calcutator data via ajax
		* @param string username - user name
		* @return void
		*/
		this.sendForm = function(username, url)
		{
			if( typeof username == 'undefined'){
				_self.$cover.show();
				_self.$userNamePopup.show();
				return;
			} else {
				var username = username;
				_self.$cover.show();
				$.ajax({
					url: url,
					data: { budgetData:JSON.stringify(_self.changedData), userName:username , year:  _self.currentYear},
					type: 'POST',
					success:function(response)
					{
						popup('calc-result', 'open');
					},
					error:function()
					{
						alert('Запрос не выполнен. Повторите позже.');
						_self.$cover.hide();
					}
				});
			}
		};


		/**
		 * Function send calcutator data via ajax and expects pdf document file
		 * @return void
		 */
		this.getPdf = function(url)
		{
			//_self.collectData();
			var strData = JSON.stringify(_self.changedData);
			var $form = $('<form style="display:none;" action="' + url + '" method="POST"><textarea name="budgetData">'+strData+'</textarea></form>');

			$('body').append($form);
			$form.submit();
			$form.remove();
		};


        /*
		 * Function handles the appearance of sliders e.g. red, green or gray
		 * background color, percent and absolute numbers. If object is associated
		 * with indicator, then set the status indicator("Больше" or "Меньше")
		 * @param JQuery object var $control - slider object
		 * @return void
		 */
		this.processControlDisplay = function($control)
		{
			//Calculate percet indicator value
			var percentValue = $control.data('percent_value');
			//Get absolute indicator value
			var value = parseFloat($control.data('value'));
			//Display the results.
			var processedPercentValue = parseInt(percentValue) - 100;

			$control.data('$number').html( _self.formatValuesToString(value));

			//Set background color
			if (percentValue < 100) {
				if ($(this).data('state') !== 'green') {
					$control.data('state', 'green');
					$control.closest('.dragged_outer').removeClass('red').addClass('green');
				}
			} else if (percentValue > 100) {
				if($(this).data('state') !== 'red') {
					$control.data('state', 'red');
					$control.closest('.dragged_outer').removeClass('green').addClass('red');
				}
			} else {
				if($control.data('state') !== 'gray') {
					$control.data('state', 'gray');
					$control.closest('.dragged_outer').removeClass('green').removeClass('red');
				}
			}

            var id = $control.data('calc_program_id'),
                main_program = $control.data('main_program');

            //if (!main_program) {
                percentValue = percentValue - 100;

                $('.js-indicator-mes[data-id-program="' +  id + '"]').hide();
                $('.js-indicator-mes[data-id-program="' +  id + '"]').each(function (ind, item) {
                    var from = $(item).data('from_percent'),
                        to = $(item).data('to_percent'),
	                    disabled = $(item).data('disabled');

                    if ((from && to && from <= percentValue && to >= percentValue) && !disabled) {
                        $(item).css({display: main_program ? "block" : "table-cell"});
                    }
                });
            //}
		};

		/**
		 * Function calculate sum of all program sliders display values of dificit and proficit
		 * @return void
		 */
		this.calculate = function()
		{
			var totalSum = 0,
			    totalPercentSum = 0,
                parent = 0;

            if (_self.getObjectSize(_self.changedData) > 0) {
                $.each(_self.changedData, function (ind, item) {
                    totalSum += item.value;
                    totalPercentSum += item.percent;
                });
            }


			totalSum /= 1e6;
			totalSum += _self.INITIAL_DIFFERENCE;
			_self.difference = _self.EXPENSES[_self.currentYear] - totalSum;
			_self.dificit  = _self.INCOMES[_self.currentYear] - totalSum;


			if (_self.difference == 0) {
				_self.$currentExpenses.parent().hide();
			} else {
				_self.$currentExpenses.parent().show();
				_self.$currentExpenses.html(_self.formatValuesToString(totalSum, 1));
				_self.$currentExpenses.parent().removeClass('up').removeClass('down').addClass(_self.difference < 0 ? 'down' : 'up');
			}

			_self.$difference.html(_self.formatValuesToString(_self.dificit, 1));

			if (_self.dificit < 0 && _self.$difference.data('positive') == true) {
				var wrapper = _self.$difference.closest('.total_number');
				//wrapper.removeClass('up');
				//wrapper.addClass('down');
				wrapper.removeClass('green').addClass('red');
				_self.$difference.data('positive', false);
			}

			if (_self.dificit > 0 && _self.$difference.data('positive') == false) {
				var wrapper = _self.$difference.closest('.total_number');
				//wrapper.removeClass('down');
				//wrapper.addClass('up');
				wrapper.removeClass('red').addClass('green');
				_self.$difference.data('positive', true);
			}

			if (_self.dificit < _self.DIFICIT_LIMIT) {
				_self.exceeded();
			} else {
				_self.permissible();
			}

			if ((totalPercentSum / $('[data-calc_program_id]').not('[data-calc_parent_program_id]').length) != 100 && !_self.formChanged) {
				_self.formChanged = true;
				$('.js-unchanged_hint').hide();
				_self.unlockForm();
			}

			_self.setProgress(totalSum);
			_self.processSideMessage();
		};

		/**
		 * Function change left side message box and displays difference between initial and current expenses
		 * @return void
		 */
		this.processSideMessage = function() {
			if (_self.difference > 0) {
				_self.$sideMessage.addClass('side-message-income');
				_self.$sideMessage.removeClass('side-message-outcome');
			}
			else {
				_self.$sideMessage.addClass('side-message-outcome');
				_self.$sideMessage.removeClass('side-message-income');
			}
			var $inner = _self.$sideMessage.find('.side-message-inner');
			$inner.find('h2 > span').html(_self.formatValuesToString(_self.difference, 1));
			if (_self.difference < 0) {
				$inner.find('p.up').hide();
				$inner.find('p.down').show();
			}
			else {
				$inner.find('p.up').show();
				$inner.find('p.down').hide();
			}
		};


		/**
		 * Function changes the state of the calculator when the limit is exceeded.
		 * Blocks form and displays a message.
		 * @return void
		 */
		this.exceeded = function()
		{
			if(_self.dificit < _self.DIFICIT_LIMIT){
			    _self.$verdict.html("<span class=\"red\">Ваше предложение по изменению бюджета не может быть принято. Сократите расходы по направлениям.</span>");
			    this.lockForm();
			}
		};

		/**
		 * Function changes the state of the calculator when returning deficit limits.
		 * Unlocks the form and displays a message.
		 * @return void
		 */
		this.permissible = function()
		{
			this.unlockForm();
			if(_self.dificit == 0 || _self.difference == 0) {
			    _self.$verdict.html("&nbsp;");
			}
			else if (_self.dificit >= 0){
				_self.$verdict.html("<span class=\"green\">Ваше предложение по изменению бюджета может быть принято. Для отправки нажмите кнопку «Сохранить и отправить результаты»</span>");
			}
			else if (_self.dificit > _self.DIFICIT_LIMIT){
				_self.$verdict.html("<span class=\"green\">Ваше предложение по изменению бюджета может быть принято. Для отправки нажмите кнопку «Сохранить и отправить результаты»</span>");
			}
		};

		/**
		 * The function sets the values ​​on the scale shows the difference.
		 * @return void
		 */
		this.setProgress = function(totalSum)
		{
			var selector = '';
			if (_self.difference > 0) {
				_self.$progress.find('.red').hide();
				selector = '.green';
			} else if (_self.difference < 0){
				_self.$progress.find('.green').hide();
				selector = '.red';
			} else {
				_self.$progress.find('.green').hide();
				_self.$progress.find('.red').hide();
			}

			if (_self.difference < 15000) {
				_self.$progress.find(selector).show().css('width', (Math.abs(_self.difference/1000*30))+'px');
			} else {
				_self.$progress.find(selector).show().css('width', '450px');
			}
			_self.$progress.find(selector + ' .number span.big').html(_self.formatValuesToString(totalSum, 1));
		};

		/**
		 * The function lock the form
		 * @return void
		 */
		this.lockForm = function()
		{
			if(_self.formLocked)
			    return;

			_self.formLocked = true;

			_self.$sendButton.hide();
			_self.$blockedBtton.show();
		};

		/**
		 * The function unlock the form
		 * @return void
		 */
		this.unlockForm = function()
		{
			if(!_self.formLocked || !_self.formChanged)
				return;

			_self.formLocked = false;
			_self.$sendButton.show();
			_self.$blockedBtton.hide();
		};

		/**
		 * The function reset calculator
		 * @return void
		 */
		this.resetCalculator = function(id, detailId)
		{
			console.log(_self.changedData);
				/*	if (item.hasClass('js-check-yes') || item.hasClass('js-check-no')) {
						$('input.js-check-yes[data-calc_program_id="' + detailId + '"]').prop('checked', true);
						$('input.js-check-yes[data-calc_program_id="' + detailId + '"]').trigger('click');
						$('input.js-check-no[data-calc_program_id="' + detailId + '"]').prop('checked', false);
						$('.js-indicator-mes[data-id-program="' + detailId + '"]').hide();
					} */
            if (typeof id == 'undefined') {
	            $.each(_self.changedData, function (ind, item) {
		            item.value = (item.value / item.percent) * 100;
		            item.percent = 100;
		            $.each(item.children, function (child_ind, child) {
			            child.value = (child.value / child.percent) * 100;
			            child.percent = 100;
		            });				
	            });
	            _self.$programControls.each(function () {
                    _self.setControlValue($(this), parseFloat($(this).data('initial_value')));
		            _self.collectDataItem($(this));
                });
				/*$("input[type='checkbox'].js-check-yes").each(function(){
					$(this).trigger("click");
				});
				
				$("input[type='checkbox'].js-check-no").attr("checked", "");
				
				$(".fake_checkbox.js-check-yes").addClass("checked");
				$(".fake_checkbox.js-check-yes").removeClass("checked");*/
            } else {
	            var slider = null;
	            if (typeof detailId == 'undefined')
                    slider = $('.js-control_budget[data-calc_program_id="' + id + '"]');
	            else
		            slider = $('.js-control_budget[data-calc_program_id="' + detailId + '"]');

                _self.setControlValue(slider, parseFloat(slider.data('initial_value')));
	            _self.collectDataItem(slider);
            }

			this.calculate();
		};

		/**
		 * Function sets the value of the slider as a percentage and absolute value and moves the slider.
		 * @param JQuery object var $control - slider object
		 * @return integer value - absolute value
		 */
		this.setControlValue = function($control, value){
            var percentValue = parseInt((value/parseInt($control.data('initial_value')))*100);
            $control.data( 'percent_value', percentValue );
            $control.data( 'value', parseFloat(value) );
            try {
                $control.slider( "value", percentValue );
                _self.processControlDisplay( $control );
            } catch (e) {}
		};
		
		/**
		 * Function format value 
		 * @param number||string value - value to be formatted.
		 * @param number denominator - value by which you want to divide the original value.
		 * @return string value - formatted value
		 */
		this.formatValuesToString = function(value, denominator)
		{
			denominator = denominator || 1000000;
			
			typeof value === "number" && (value = value/denominator);
			value = value.toFixed(1);
			typeof value === "number" && (value = value.toString());
			
			value = value.replace(/^-*(\d*)$/g, '$1.0');
			value = value.replace(/\./, ',');
			value = value.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
			//value = value.replace(/(\d+\,\d)(\d)*/g, '$1');
			
			return value;
		};
		
		this.init();
		this.calculate();
	}

	jQuery.fn.checkbox = function()
	{
		$(this).each(function()
		{
			$(this).css('opacity', '0');
			//Чтобы сменить оформление чекбокса, достаточно подставить ему какой-то класс, а у этого класса в css задать другое фоновое изображение
			if($(this).attr('class') != 'undefined')
			{
				specClass = ' ' + $(this).attr('class');
			}
			else
			{
				specClass = '';
			}
			$(this).closest('div').prepend('<div class="fake_checkbox' + specClass + '"></div>');
			//При загрузке
			if($(this).is(':checked'))
			{
				$(this).prev('.fake_checkbox').addClass('checked');
			}
			else
			{
				$(this).prev('.fake_checkbox').removeClass('checked');
			}
			//При клике
			$(this).live('click', function()
			{
				if($(this).is(':checked'))
				{
					$(this).prev('.fake_checkbox').addClass('checked');
				}
				else
				{
					$(this).prev('.fake_checkbox').removeClass('checked');
				}
			});
			//При наведении
			$(this).live('mouseover', function()
			{
				$(this).prev('.fake_checkbox').addClass('hover');
			}).live('mouseleave', function()
			{
				$(this).prev('.fake_checkbox').removeClass('hover');
			});
		});
	}
});
