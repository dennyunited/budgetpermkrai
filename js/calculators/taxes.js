$(function() {
	var activeTab = null,
			isClearing = false,
			MaxSalaryFromYearBeginnig = 280000,
			taxesWeight = [7.92, 40.75, 3.93, 10.79, 4.57, 0.60, 2.32, 1.30, 3.27, 9.66, 0.46, 3.90, 10.53],
			checkboxes = [
		/*0*/ {
			uncompatibleWithCheckbox: [7, 8, 9],
			nalogTypes: [0],
			uncompatibleWithNalog: []
		},
		/*1*/ {
			uncompatibleWithCheckbox: [7, 8, 9],
			nalogTypes: [0],
			uncompatibleWithNalog: []
		},
		/*2*/ {
			uncompatibleWithCheckbox: [7, 8, 9],
			nalogTypes: [0],
			uncompatibleWithNalog: []
		},
		/*3*/ {
			uncompatibleWithCheckbox: [7, 8, 9],
			nalogTypes: [0],
			uncompatibleWithNalog: []
		},
		/*4*/ {
			uncompatibleWithCheckbox: [5, 7, 8, 9],
			nalogTypes: [1],
			uncompatibleWithNalog: [2]
		},
		/*5*/ {
			uncompatibleWithCheckbox: [4, 7, 8, 9],
			nalogTypes: [2],
			uncompatibleWithNalog: []
		},
		/*6*/ {
			uncompatibleWithCheckbox: [7, 8, 9],
			nalogTypes: [3],
			uncompatibleWithNalog: []
		},
		/*7*/ {
			uncompatibleWithCheckbox: [0, 1, 2, 3, 4, 5, 6, 8, 9],
			nalogTypes: [],
			uncompatibleWithNalog: [0, 1, 2, 3]
		},
		/*8*/ {
			uncompatibleWithCheckbox: [0, 1, 2, 3, 4, 5, 6, 7, 9],
			nalogTypes: [],
			uncompatibleWithNalog: [0, 1, 2, 3]
		},
		/*9*/ {
			uncompatibleWithCheckbox: [0, 1, 2, 3, 4, 5, 6, 7, 8],
			nalogTypes: [],
			uncompatibleWithNalog: [0, 1, 2, 3]
		},
	];

	function formatRubles(n) {
		return formatNew(n, 2) || 0;
	}

	var factPercents = [20, 30, 40, 30, 40, 25, 20, 20, 30, 20];
	// Сведения о налогах
	var taxes = [
		// НДФЛ: обычные доходы
		{
			percent: 13,
			caption: 'по обычным доходам',
			salaryStart: 0,
			taxBase: 0,
			//		Вычеты по налогу
			deductions: [
				// стандартные вычеты
				{
					isAlone: false,
					children: [],
					isChernobyl: false,
					isHero: false,
					childDeductions: function() {
						var childDeductions = 0;
						if (taxes[0].salaryStart <= MaxSalaryFromYearBeginnig)
							for (var i = 0; i < this.children.length; i++) {
								var c = this.children[i];
								var v = 0;
								// 1400 р. – на первого и второго ребенка до 18 лет, учащегося до 24 лет, не инвалида
								if (i < 2) {
									if (c.year <= 18 || c.year <= 24 && c.isPupil)
										v = 1400;
								} else {
									// 3000 р. – на третьего и каждого последующего ребенка до 18 лет, учащегося до 24 лет
									if (c.year <= 18 || c.year <= 24 && c.isPupil)
										v = 3000;
								}
								// 3000 р. – на инвалида до 18 лет любой группы инвалидности, инвалида-учащегося до 24 лет I и II групп инвалидности
								if (c.group_invalid &&
										(c.year <= 18 || c.year > 18 && (c.group_invalid == 'I' || c.group_invalid == 'II')))
									v = 3000;

								childDeductions += v;
							}
						if (this.isAlone)
							childDeductions *= 2;
						return childDeductions;
					},
					deduction: function() {
						var result = 0;
						result += this.childDeductions();
						if (this.isChernobyl)
							result += 3000;
						if (this.isHero && !this.isChernobyl)
							result += 500;
						return result;
					}
				},
				// социальные вычеты
				{
					donations: 0,
					study: 0,
					medical: 0,
					pension: 0,
					addPension: 0,
					deduction: function() {
						var result = Math.min(120000, Math.min(this.study, 50000) + this.medical + this.pension + this.addPension);
						return result + Math.min(taxes[0].taxBase * .25, Math.max(0, this.donations));
					}
				},
				// имущественные вычеты
				{
					sellSum: 0,
					sellOthers: 0,
					buildSum: 0,
					percents: 0,
					deduction: function() {
						var result = Math.min(1000000, this.sellSum) +
								Math.min(250000, this.sellOthers) +
								Math.min(2000000, this.buildSum + this.percents);
						return result;
					}
				},
				// профессиональные вычеты
				{
					factExpenses: 0,
					hasApproved: false,
					activity: 0,
					deduction: function() {
						var result = this.factExpenses;
						if (this.hasApproved) {
							result = taxes[0].taxBase * factPercents[this.activity] / 100;
						}
						return result;
					}
				}],
			taxValue: function() {
				var result = this.taxBase;
				var deduction = 0;
				for (var i = 0; i < this.deductions.length; i++) {
					deduction += this.deductions[i].deduction();
				}
				result -= deduction;
				result = (result < 0 ? 0 : this.percent / 100) * result;
				return result;
			}
		},
		// НДФЛ: дивиденды
		{
			percent: 9,
			caption: 'по дивидендам',
			taxBase: 0,
			taxValue: function() {
				return (this.percent / 100) * this.taxBase;
			}
		},
		// НДФЛ: по доходам иностранных граждан
		{
			percent: 30,
			caption: 'по доходам иностранных граждан',
			taxBase: 0,
			taxValue: function() {
				return (this.percent / 100) * this.taxBase;
			}
		},
		// НДФЛ: по другим доходам
		{
			percent: 35,
			caption: 'по другим доходам',
			taxBase: 0,
			taxValue: function() {
				return (this.percent / 100) * this.taxBase;
			}
		},
		// Упрощенная форма налогообложения
		{
			percent: 6,
			incomes: 0,
			expenses: 0,
			type: 1,
			localTaxValue: 1,
			minTax: function() {
				return this.type == 1 ? 0 : this.incomes * .01;
			},
			taxValue: function() {
				var result = 0,
						taxBase = Math.max(0, this.incomes);
				this.percent = this.type == 1 ? 6 : 15;
				if (this.type == 2)
				{
					taxBase = Math.max(0, this.incomes - this.expenses);
				}
				return this.type == 1 ? taxBase * this.percent / 100 : Math.max(taxBase * this.percent / 100, this.minTax());
			}
		},
		// ЕНВД
		{
			percent: 15,
			baseIncome: 7500,
			K1: 1.569,
			K2: 1,
			localTaxValue: 1,
			pension: 0,
			payDisability: 0,
			insurance: 0,
			planTaxValue: function() {
				return this.baseIncome * this.K1 * this.K2 * this.percent / 100;
			},
			taxValue: function() {
				return Math.max(0, this.planTaxValue() - Math.min(this.planTaxValue() * .5, this.pension + this.payDisability + this.insurance));
			}
		},
		// единый сельскохозяйственный налог
		{
			percent: 6,
			taxBase: 0,
			localTaxValue: 1,
			taxValue: function() {
				return this.percent / 100 * this.taxBase;
			}
		}
	];

	// Вывод расчетной информации
	function fillData(idx) {
		var r = $('.ndfl_tabs').next().children('table');
		r.eq(idx == 0 ? 1 : 0).hide();
		r.eq(idx > 0 ? 1 : 0).show();
		$('.tax_deductions')[idx == 0 ? 'show' : 'hide']();
		var t = taxes[idx];
		$('.percent.tax').find('span').text(t.percent);
		$('#TaxSum').find('span').text(t.caption);
		$('#TaxSum').next().find('.big_red').find('span').text(formatRubles(t.taxValue()));

		if (idx == 0) {
			var c = $('.children_unit');
			c.hide();
			c.each(function(idx, el) {
				var s = t.deductions[0];
				if (idx >= s.children.length)
					return;
				var o = $(el);
				o.data('index', idx);
				o.show();
				o.find('.year').val(s.children[idx].birthday);
				var v = o.find('.isPupil');
				if ((!!v.attr('checked')) != s.children[idx].isPupil)
					v[0].click();
				v = o.find('.isInvalid');
				if ((!!v.attr('checked')) != (!!s.children[idx].group_invalid))
					v[0].click();
				v = o.find('.group_invalid');
				v.val(s.children[idx].group_invalid ? s.children[idx].group_invalid : v.find('option').eq(0).val());
			});
			$('#salaryMonthly').val(t.taxBase);
			return;
		} else {
			if (idx == 2) {
				drawChart();
			}
		}
		$('#taxBase').val(t.taxBase);
	}

	var taxTotal = 0;

	// Пересчет данных
	function calculate() {
		if (isClearing)
			return;
		taxTotal = 0;
		var dSpan = $('.green_big');
		var curTab = $('.ndfl_tabs').data('selected') || 0;

		for (var i = 0; i < taxes.length; i++) {
			var tVal = taxes[i].taxValue(),
					unit = $('.unit').eq(i < 4 ? 0 : i - 3);

			if (unit.css('display') == 'none')
				continue;

			if (i == 0)
			{
				// вкладка налога НДФЛ
				// Вывод сведений по вычетам
				// стандартные
				dSpan.eq(0).find('span').text(formatRubles(taxes[i].deductions[0].childDeductions()));
				dSpan.eq(1).find('span').text(formatRubles(taxes[i].deductions[0].isChernobyl ? 3000 : 0));
				dSpan.eq(2).find('span').text(formatRubles(taxes[i].deductions[0].isHero && !taxes[i].deductions[0].isChernobyl ? 500 : 0));
				// социальные
				dSpan.eq(3).find('span').text(formatRubles(taxes[i].deductions[1].deduction()));
				// имущественные
				dSpan.eq(4).find('span').text(formatRubles(taxes[i].deductions[2].deduction()));
				// профессиональные
				dSpan.eq(5).find('span').text(formatRubles(taxes[i].deductions[3].deduction()));
			}
			if (curTab == i) {
				// вывод итога по виду дохода (обычные, дивиденды, иностранцы, другие)
				$('#TaxSum').next().find('.big_red').find('span').text(formatRubles(tVal));
			}
			taxTotal += tVal;
			setTotalSum = function(cn, val) {
				var sum = unit.find(cn).find('.big_red');
				sum.eq(0).find('span').text(formatRubles(i < 4 ? taxTotal : val));
				var lPercent = taxes[i]['localTaxValue'] || .2;
				sum.eq(1).find('span').text(formatRubles((i < 4 ? taxTotal : val) * lPercent));
			}
			setTotalSum('.TaxTotalSum', tVal);

			if (i == 4) {
				$('#minTax').text(formatRubles(taxes[i].minTax()));
			}
			if (i == 5) {
				setTotalSum('.TaxPlanSum', taxes[i].planTaxValue());
			}
		}
		$('#TaxByMonth').text(formatRubles(taxTotal));
		$('#TaxByYear').text(formatRubles(taxTotal * 12));
		CalculateTaxDistrib();
	}

	// Расчет распределения налога пользователя
	function CalculateTaxDistrib() {
		var rows = $('.spend_tax_table').find('tbody').find('tr'),
				d = rows.eq(0).find('td'),
				s = formatRubles(taxTotal);
		d.eq(1).text(s);
		d.eq(2).text(s);
		$('#remain').text('0');
		var sum = 0;
		for (var i = 0; i < taxesWeight.length; i++) {
			d = rows.eq(i + 1).find('td');
			var v = taxTotal * taxesWeight[i] / 100;
			if (sum + v > taxTotal)
				v = taxTotal - sum;
			sum += v;
			s = formatRubles(v);
			d.eq(1).text(s);
			var inp = d.find('input');
			inp.val(s).data('oldVal', s);
			inp[0].disabled = taxTotal == 0;
		}
		if (activeTab.find('.number').text() == '3')
			$('#btn_reset').addClass('disabled').attr('disabled', true); else
			$('#btn_reset').removeClass('disabled').removeAttr('disabled');
		drawChart();
	}

	function canChange() {
		var result = false;
		$('.unit').each(function() {
			result = result ||
					$(this).css('display') != 'none' && this.id != 'lastUnit';
		})
		if (!result)
			alert('Вы не являетесь налогоплательщиком');
		return result;
	}
	//==============================================================================

	$('.calculate_accordion, .spend_tax_table').find('input:text').each(
			function() {
				if ($(this).parent().hasClass('chzn-search'))
					return;
				$(this).keydown(checkAndFormatNumberOnInputKeyDown);
			});
	// инициализация табов (статус, расчет, опрос)
	activeTab =
			$('.steps').find('li')
			.click(function() {
		if (!canChange())
			return;

		var idx = activeTab.find('.number').text();
		if (activeTab)
		{
			activeTab.removeClass('active');
			$('#tab' + idx).hide();
		}
		activeTab = $(this);
		idx = activeTab.find('.number').text();
		activeTab.addClass('active');
		$('#tab' + idx).show();
		if (idx > 1)
			calculate();
		$('.btn_next')[idx > 2 ? 'hide' : 'show']();
	})
			.eq(0);

	// инициализация статусов
	$('.find_status_list')
			.find('input')
			.each(function(idx, el) {
		var o = $(el),
				units = $('.calculate_accordion').find('.unit');
		checkboxes[idx].checkbox = this;
		units.hide();

		o.change(function() {

			var idx = $(this).data('index');

			units.hide();

			for (var i = 0; i < checkboxes.length; i++) {
				if (!checkboxes[i])
					continue;
				var c = checkboxes[i].checkbox;
				if (i != idx && c.checked) {
					for (var j = 0; j < checkboxes[i].nalogTypes.length; j++) {
						var x = checkboxes[i].nalogTypes[j];
						units.eq(x).show();
					}
				}
			}

			if (!this.checked)
				return;

			var info = checkboxes[idx];

			for (i = 0; i < info.uncompatibleWithCheckbox.length; i++) {
				var cb = checkboxes[info.uncompatibleWithCheckbox[i]].checkbox;
				if (cb.checked)
					cb.click();
			}

			for (i = 0; i < info.uncompatibleWithNalog.length; i++) {
				idx = info.uncompatibleWithNalog[i];
				units.eq(idx).hide();
			}

			for (i = 0; i < info.nalogTypes.length; i++) {
				idx = info.nalogTypes[i];
				units.eq(idx).show();
			}
		})
				.data('index', idx);
	});

	// Инициализация вкладок НДФЛ
	var l = $('.ndfl_tabs').find('li');
	l.each(function(idx, el) {
		$(el)
				.click(function() {
			l.removeClass('active');
			$(this).addClass('active');
			$('.ndfl_tabs').data('selected', idx);
			fillData(idx);
		})
				.data('index', idx);
	}
	);
	// Инициализация вкладок вычетов
	var sl = $('.tax_deductions_tabs').find('li');
	var tbls = $('.tax_deductions_content').children();
	tbls.each(function(idx, el) {
		$(el).data('index', idx);
		if (idx > 0)
			$(el).hide();
	});

	sl.each(function(idx, el) {
		$(el)
				.click(function() {
			sl.removeClass('active');
			var o = $(this);
			o.addClass('active');
			tbls.hide();
			tbls.eq(o.data('index')).show();
		})
				.data('index', idx)
	}
	);
	$('.children_unit').each(function(idx, el) {
		$(this).data('index', idx);
	});
	// Первоначальное заполнение
	fillData(0);
	// обработчики редактирования
	// Заработная плата с начала года
	var children = taxes[0].deductions[0].children;

	$('#salaryStart').change(function() {
		taxes[0].salaryStart = toFloat(this.value);
		var isDisable = (taxes[0].salaryStart > MaxSalaryFromYearBeginnig);
		$(this).parents('.children_unit').find('input,select').each(function(idx, el) {
			var val = isDisable;
			if (this.tagName == 'select') {
				idx = $(this).parents('.children_unit').data('index');
				val = isDisable && children[idx].group_invalid;
			}
			$(this).attr('disabled', val).trigger('liszt:updated');
		});
		calculate();
	});
	// Заработная плата ежемесячно
	$('#salaryMonthly').change(function() {
		taxes[0].taxBase = toFloat(this.value);
		calculate();
	});

	// Количество детей в семье
	$('#children').change(function() {
		var u = $('.children_unit');
		u.hide();

		var cb = $(this).val();
		u.each(function(idx, el) {
			if (cb != ' ' && idx < cb) {
				$(this).show();
				if (idx >= children.length)
					children.push({
						birthday: '',
						year: 0,
						isPupil: false,
						group_invalid: false
					})
			}
		});

		while (cb < children.length && children.length > 0)
			children.pop();

		var h = $('.tax_deductions_content').children(':visible').height();
		if (h < 540)
			h = 540;
		$('.tax_deductions').height(h + 'px');
		calculate();
	});

	var dt = new Date();
	// возраст ребенка , лет
	$('.year').datepicker({
		minDate: new Date(dt.getFullYear() - 24, dt.getMonth(), dt.getDate()),
		maxDate: 0,
		changeMonth: true,
		changeYear: true,
		yearRange: "c-24:c"
	});

	$('.year').change(function() {
		var idx = $(this).parents('.children_unit').data('index');
		if (idx < 0 || idx >= children.length)
			return;
		children[idx].birthday = this.value;
		children[idx].year = dt.getFullYear() - toFloat(this.value.split('.')[2]);
		calculate();
	});
	// единственный родитель (опекун)
	$('#isAlone').change(function() {
		taxes[0].deductions[0].isAlone = !!this.checked;
		calculate();
	});
	// учащийся очной формы обучения
	$('.isPupil').change(function() {
		var idx = $(this).parents('.children_unit').data('index');
		children[idx].isPupil = this.checked;
		calculate();
	});
	// инвалидность
	$('.isInvalid').change(function() {
		var p = $(this).parents('.children_unit');
		var idx = p.data('index');
		if (idx < 0 || idx >= children.length)
			return;

		children[idx].group_invalid = this.checked;
		var cb = p.find('.group_invalid');
		if (cb.val() != ' ' && this.checked)
			children[idx].group_invalid = cb.val();
		cb.attr('disabled', !this.checked).trigger("liszt:updated");
		cb.prev()[(this.checked ? 'remove' : 'add') + 'Class']('disabled');
		calculate();
	});
	// группа инвалидности
	$('.group_invalid').change(function() {
		var idx = $(this).parents('.children_unit').data('index');
		if (idx < children.length && children[idx].group_invalid) {
			children[idx].group_invalid = $(this).val();
		}
		calculate();
	});
	// Вычеты чернобыльцам, инвалидам ВОВ (ст.218 НК, п.1., пп.1)
	$('#isChernobyl').change(function() {
		taxes[0].deductions[0].isChernobyl = !!this.checked;
		calculate();
	});
	// Вычеты героям, блокадникам, инвалидам детства и др. (ст.218 НК, п.1., пп.2)
	$('#isHero').change(function() {
		taxes[0].deductions[0].isHero = !!this.checked;
		calculate();
	});
	// Налоговая база (Дивиденды, Иностранцы, Другие)
	$('#taxBase').change(function() {
		var idx = $('.ndfl_tabs').data('selected') || -1;
		if (idx < 0)
			return;
		taxes[idx].taxBase = toFloat(this.value);
		calculate();
	});
	// Социальные
	$('#donations').change(function() {
		taxes[0].deductions[1].donations = toFloat(this.value);
		calculate();
	});
	$('#study').change(function() {
		taxes[0].deductions[1].study = toFloat(this.value);
		calculate();
	});
	$('#medical').change(function() {
		taxes[0].deductions[1].medical = toFloat(this.value);
		calculate();
	});
	$('#pension').change(function() {
		taxes[0].deductions[1].pension = toFloat(this.value);
		calculate();
	});
	$('#addPension').change(function() {
		taxes[0].deductions[1].addPension = toFloat(this.value);
		calculate();
	});

	// Имущественные
	$('#sellSum').change(function() {
		taxes[0].deductions[2].sellSum = toFloat(this.value);
		calculate();
	});

	$('#sellOthers').change(function() {
		taxes[0].deductions[2].sellOthers = toFloat(this.value);
		calculate();
	});

	$('#buildSum').change(function() {
		taxes[0].deductions[2].buildSum = toFloat(this.value);
		calculate();
	});

	$('#percents').change(function() {
		taxes[0].deductions[2].percents = toFloat(this.value);
		calculate();
	});

	// Профессиональные
	$('#factExpenses').change(function() {
		taxes[0].deductions[3].factExpenses = toFloat(this.value);
		calculate();
	});

	$('#hasApproved').change(function() {
		taxes[0].deductions[3].hasApproved = !!this.checked;
		calculate();
	});

	$('#activity').change(function() {
		taxes[0].deductions[3].activity = this.value;
		calculate();
	});

	// Расчет налога при упрощенной системе налогообложения
	$('input[name=r_1]').change(function() {
		var isEnable = (this.value == 2);
		var c = $(this).parents('tr').next().next().children();
		c.find('input').attr('disabled', !isEnable)[(isEnable ? 'remove' : 'add') + 'Class']('disabled');
		c[(isEnable ? 'remove' : 'add') + 'Class']('disabled');
		$('#minTax').parents('table')[isEnable ? 'show' : 'hide']();
		taxes[4].type = this.value;
		calculate();
		$('.unit').eq(1).find('.percent').text(taxes[4].percent + '%');
	});

	$('#incomes').change(function() {
		taxes[4].incomes = toFloat(this.value);
		calculate();
	});

	$('#expenses').change(function() {
		taxes[4].expenses = toFloat(this.value);
		calculate();
	});

	$('#activity_type').change(function() {
		taxes[5].baseIncome = toFloat(this.value);
		$('.baseIncome').text(formatRubles(taxes[5].baseIncome));
		calculate();
	});

	$('#K2').change(function() {
		taxes[5].K2 = toFloat(this.value);
		calculate();
	});

	$('#ip_pension').change(function() {
		taxes[5].pension = toFloat(this.value);
		calculate();
	});

	$('#disability').change(function() {
		taxes[5].payDisability = toFloat(this.value);
		calculate();
	});

	$('#insurance').change(function() {
		taxes[5].insurance = toFloat(this.value);
		calculate();
	});

	$('#taxBase1').change(function() {
		taxes[6].taxBase = toFloat(this.value);
		calculate();
	});

	$('.spend_tax_table').find('input:text').change(function() {
		var p = $(this),
				idx = p.parents('tr')[0].rowIndex - 3,
				val = toFloat(this.value),
				dif = (toFloat(p.parents('tr').find('td').eq(1).text()) - val).toFixed(2) * 1,
				r = $('#remain'),
				oldVal = p.data('oldVal') || '';

		if (oldVal == this.value)
			return;

		$('#btn_reset').removeClass('disabled').removeAttr('disabled');
		var rows = $('.spend_tax_table').find('tbody').find('tr'), sum = 0;
		for (var i = 1; i < rows.length; i++)
		{
			sum += toFloat(rows.eq(i).find('input').val());
		}
		rows.eq(0).find('td').eq(2).text(formatRubles(sum.toFixed(2) * 1));

		p.data('oldVal', this.value);
		var x = toFloat(rows.eq(0).find('td').eq(1).text()) - sum;
		r.text(formatRubles(x));
		drawChart();
	});

	$('.btn_next').click(function() {
		if (!canChange())
			return false;
		activeTab.next().trigger('click');
		return false;
	});

	$('#btn_reset').click(function() {
		if ($(this).hasClass('disabled'))
			return false;

		var idx = activeTab.find('span.number').text();
		switch (idx) {
			case '1':
				var units = $('.calculate_accordion').find('.unit');
				units.hide();
				for (var i = 0; i < checkboxes.length; i++) {
					var c = checkboxes[i].checkbox;
					if (c.checked) {
						c.click();
					}
				}
				break;
			case '2':
				isClearing = true;
				$('#tab' + idx).find('input:text, select, input:checkbox').each(
						function() {
							if (this.tagName == 'INPUT') {
								switch (this.type)
								{
									case 'text':
										this.value = 0;
										$(this).trigger('change');
									case 'checkbox':
										if (this.checked)
										{
											this.click();
										}
										break;
								}
							} else
							{
								$(this).find('option').eq(0)[0].selected = true;
								$(this)
										.chosen();

								$(this)
										.trigger("liszt:updated")
										.trigger("change");

							}
						});

				isClearing = false;
				for (var i = 0; i < taxes.length; i++) {
					if (taxes[i]['taxBase']) {
						taxes[i].taxBase = 0;
					}
				}
				// Сброс комбобоксов
				$('.chzn-container').find('input').each(function() {
					this.value = '';
				})
				calculate();
				break;
			case '3':
				$('#remain').text('0');
				$('.spend_tax_table').find('input:text').each(
						function() {
							$(this).val($(this).parent().prev().text());
							$(this).data('oldVal', this.value);
						});
				var c = $('.spend_tax_table').find('.STT_all_costs').find('td');
				c.eq(2).text(c.eq(1).text());
				drawChart();
				$(this).addClass('disabled').attr('disabled', true);
		}
		return false;
	});

	function drawChart() {
		if (taxTotal <= 0)
		{
			$('#chart-container').empty();
			return;
		}

		var data = [];
		$('.spend_tax_table input').each(function() {
			var $t = $(this);
			var title = $t.parent().siblings().first().text();
			if (this.value.trim() == '') {
				return;
			}
			var v = toFloat(this.value);
			data.push([title, v]);
		});

		new Highcharts.Chart({
			chart: {
				renderTo: 'chart-container',
				type: 'pie',
				backgroundColor: 'rgba(255, 255, 255, 0)'
			},
			title: {
				text: ''
			},
			plotOptions: {
				pie: {
					shadow: true,
					dataLabels: {
						formatter: function() {
							return '<span style="color: ' + this.point.color + '; font-weight: bold; font-size: 115%">'
									+ (this.point.percentage).toFixed(1)
									+ '%</span>';
						},
						distance: 9,
						connectorWidth: 0
					}
				}
			},
			tooltip: {
				formatter: function() {
					return '<b>' + this.point.name + '</b>: '
							+ formatRubles(this.point.y) + ' руб.'
				}
			},
			series: [
				{
					name: 'Распределение расходов',
					data: data,
					showInLegend: true
				}],
			colors: ['#DB212F', '#E47C2E', '#D6A425', '#DBE031', '#94D128', '#6BDD35', '#29CC86', '#38DBD3', '#2EAECC', '#42B6DB', '#366CCC', '#4C48DB', '#6B3ACC']
		});
	}
});