var isBudgetTypeEnabled = true;
var compareBudgetAction = '';

function init_table(){
    init_sort();

	$("a.top-raiting").on("click", function(){
		$(this).toggleClass("active");
		$(".rait-diagram-container").toggle();
	});
}

function init_sort(){
    $(".rait-table").tablesorter({
        headers: { 0: { sorter: false}, 1 : {sorter: 'thousands'}, 2 : {sorter: 'thousands'},3: {sorter: 'thousands'} },
        sortList: [[1,1]]
    });
    //$(".sort-cell-tool").not(".down").hide();

    $(".sort-cell").on("click", function() {
        var current = $(this).find(".sort-cell-tool");
        $(".sort-cell-tool").removeClass("active").not(current).removeClass("up");
        current.addClass("active").toggleClass("up");
    });
}

function showLoading(state) {
    if (state) {
        if ($('.show_loading_block').length > 0) {
            $('.show_loading_block').show();
        } else {
            $('body').append($('<div class="show_loading_block"></div>'));
        }
    } else {
        $('.show_loading_block').hide();
    }
}

$(document).ready(function(){

	$.tablesorter.addParser({
		id: 'thousands',
		is: function (s) {
			return false;
		},
		format: function (s) {
			return s.replace(/\s+/g, '').replace(/,/g, '.');
		},
		type: 'numeric'
	});

	$.tablesorter.addParser({
		id: "calc-percent",
		is: function(s) {
			return false;
		},
		format: function(s, table) {
			var v =  s ? $.tablesorter.formatFloat(s.replace(/\s+/g, '').replace(/%/g, ""), table)/100 : s;
			return /%/.test(s) ? v/100 : v;
		},
		type: "numeric"
	});

	init_table();


        
        $('.choose_data_for_difference').live("change", function(){
            showLoading(true);
			var tm;
			if ($('.js-select-year').val()!=new Date($('#choose_timestamp').val()*1000).getFullYear()   || new Date($('#choose_timestamp').val()*1000).getMonth() == 11){
				if ($('.js-select-year').val() == 2015) {
					var newDate="02/01/"+$('.js-select-year').val();
				} else {
					var newDate="01/01/"+$('.js-select-year').val();
				}
				tm = new Date(newDate).getTime() / 1000
			} else {
				tm = $('#choose_timestamp').val();
			}

		$.ajax({
			url: '/compare_budgets/' + compareBudgetAction,
			type: 'post',
			data: {
				territory: $('#choose_terr').val(),
				timestamp: /*$('#choose_timestamp').val()*/ tm,
				year : $('.js-select-year').val()
			}
		}).done(function(resp) {
			$('.compare-budget-wrapper').html(resp);
                        init_sort();
                        showLoading(false);
						$('.chosen').chosen();
		});
	});
});
