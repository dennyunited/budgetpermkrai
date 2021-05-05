var isBudgetTypeEnabled = true;
var compareBudgetAction = '';
var terrSelectorEnable = false;

function init_table(){
    init_sort();
    init_clear_region();
}

function init_sort(){
    $(".rait-table").tablesorter({
        headers: { 0: { sorter: false}, 1 : {sorter: 'thousands'}, 2 : {sorter: 'thousands'}, 3 : {sorter: 'calc-percent'}, 4: {sorter: 'thousands'} },
        sortList: [[4,0]]
    });

    $(".sort-cell").on("click", function() {
        var current = $(this).find(".sort-cell-tool");
        $(".sort-cell-tool").removeClass("active").not(current).removeClass("up");
        current.addClass("active").toggleClass("up");
    });
}

function init_clear_region(){
    $('.top-raiting').live('click', function(){
        $(this).toggleClass("active");
        if(!$(this).hasClass('active')){
            $('.territory_selector_place').addClass("active");
            terrSelectorEnable = true;
        }
        else{
            $('.territory_selector_place').removeClass("active");
            terrSelectorEnable = false;
            if($('#choose_terr').val() !== '0'){
                $('#choose_terr').val(0).trigger("chosen:updated").trigger("liszt:updated");
                reloadIndicatorsData();
            }
        }
        $(".rait-diagram-container").toggle();
    });
}

function reloadIndicatorsData(){

	var tm;
			if ($('.js-select-year').val()!=new Date($('.js-select-timestamp').val()*1000).getFullYear()    || new Date($('.js-select-timestamp').val()*1000).getMonth() == 11){
				if ($('.js-select-year').val() == 2015) {
					var newDate="02/01/"+$('.js-select-year').val();
				} else {
					var newDate="01/01/"+$('.js-select-year').val();
				}
				tm = new Date(newDate).getTime() / 1000
			} else {
				tm = $('.js-select-timestamp').val();
			}
			
    $.ajax({
        url: '/compare_budgets/' + compareBudgetAction,
        type: 'post',
        data: {
            type: $(".btn_local_budget_type.active").attr("data-type"),
            territory: $('#choose_terr').val(),
            	timestamp: /*$('.js-select-timestamp').val()*/ tm,
				year : $('.js-select-year').val()
        }
    }).done(function(resp) {
        $('.compare-budget-wrapper').html(resp);
        /*if(terrSelectorEnable === true){
            $(".rait-diagram-container").addClass("active");
            $(".rait-diagram-container").hide();
            $(".rait-diagram-container").eq(1).show();
        }
        else{
            $("a.top-raiting").addClass("active");
            $(".rait-diagram-container").hide();
            $(".rait-diagram-container").eq(0).show();
        }*/

        init_sort();
		$(".chosen").chosen();
        //init_clear_region();
    });
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

	if (isBudgetTypeEnabled) {
		$(".btn_local_budget_type").live("click", function(){
			var button=$(this);
			$.ajax({
				url: '/compare_budgets/' + compareBudgetAction,
				type: 'post',
				data: {
					type: $(this).attr("data-type"),
                    territory: $('#choose_terr').val(),
					timestamp: $(".js-select-timestamp").val()
				}
			}).done(function(resp) {
				$('.compare-budget-wrapper').html(resp);
				//$('.btn_local_budget_type.active').removeClass('active');
                /*if(terrSelectorEnable === true){
                    $(".rait-diagram-container").addClass("active");
                    $(".rait-diagram-container").hide();
                    $(".rait-diagram-container").eq(1).show();
                }
                else{
                    $("a.top-raiting").addClass("active");
                    $(".rait-diagram-container").hide();
                    $(".rait-diagram-container").eq(0).show();
                }*/
                button.addClass('active');
                init_sort();
				$(".chosen").chosen();
                //init_clear_region();
			});
		});
	}

	$(".js-select-timestamp, .js-select-year, #choose_terr").live("change", function(){
        reloadIndicatorsData();
	});

});
