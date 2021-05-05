/*Новости*/

function menu_controls() {
    $('.slide_outer').each(function () {
        var ul_width = $(this).find('ul').width(),
            content_width = $(this).width(),
            offset = parseInt($(this).find('.slide_inner').css('left')),
            max_slide = ul_width - content_width;
        if (ul_width > content_width) {

            if (offset >= 0) {
                $(this).closest('.container').find('.slide_left').hide();
                clearInterval(menu_slide);
            }
            else if (offset < 0) {
                $(this).closest('.container').find('.slide_left').show();
            }
            if (offset >= -max_slide) {
                $(this).closest('.container').find('.slide_right').show();
            }
            else if (offset <= -max_slide) {
                $(this).closest('.container').find('.slide_right').hide();
                clearInterval(menu_slide);
            }
            if ($(this).closest('.container').find('.slide_right').attr('class') == 'menu_right disabled') {}
        }
        else {
            $('.menu_rails').attr('style', 'left:0px');
            $(this).closest('.container').find('.slide_left').hide();
            $(this).closest('.container').find('.slide_right').hide();
        }
    })
}
function menu_slide() {
	var slide_step = 0;
	$('.slide_right, .slide_left').mousedown(function () {
		var _inner = $(this).closest('.container').find('.slide_inner');
		if ($(this).attr('class') == 'slide_right') {
			menu_slide = setInterval(function () {
				slide_step = parseInt(_inner.css('left'));
				slide_step = slide_step - 10;
				_inner.css({ 'left': slide_step });
				menu_controls();
			}, 1)
		}
		else if ($(this).attr('class') == 'slide_left') {
			menu_slide = setInterval(function () {
				slide_step = parseInt(_inner.css('left'));
				slide_step = slide_step + 10;
				_inner.css({ 'left': slide_step });
				menu_controls();
			}, 1)
		}
	})
	$('.all').mouseup(function () {
		clearInterval(menu_slide);
	})

}





/*Стартовые функции*/
$(function () {
	$('.btn_calculate, .btn_message').hover(function(){
		$(this).animate({'right':0},50);
	}).mouseleave(function(){
		$(this).animate({'right':-5},50);
	})

	$('.persons_list .visible, .persons_list h3 span').click(function() {
        var $t = $(this);
		$t.closest('li').find('.visible_content').slideToggle(300, function() {
            $t.closest('li').toggleClass('show');
        });
	});

	$('.data_source_btn').click(function(){
		$(this).toggleClass('active');
	})

	$('.control').click(function(){
		$(this).next('.tasks_all').slideToggle(300);
	});


	$('.sidebar_list .arrow').click(function(){
		_this = $(this);
		$(this).closest('li').find('ul').slideToggle(200);
		setTimeout(function(){
			_this.closest('li').toggleClass('open');
		},100)
	})

	$('.calculate_accordion .unit_header .arrow').click(function(){
		$(this).closest('.unit').toggleClass('open');
	})


	$('input[type="checkbox"]').checkbox();
	$('input[type="radio"]').radio();


    $('.chosen').chosen({disable_search_threshold: 20, no_results_text: 'Не найден элемент с текстом'});

	$('.slider_ui').slider({
		orientation: "horizontal",
		range: "min",
		min: 0,
		max: 20,
		value: 10,
		create: function( event, ui ) {
			$(this).find('.ui-slider-handle span').html('100%');
		},
		slide:function( event, ui ){
			if (ui.value > 10){
				$(this).find('.ui-slider-handle').css({'border-color':'#C1272D'});
				$(this).find('.ui-slider-range').css({'background':'#C1272D'});
			}
			else if (ui.value < 10){
				$(this).find('.ui-slider-handle').css({'border-color':'#009245'});
				$(this).find('.ui-slider-range').css({'background':'#009245'});
			}
			else {
				$(this).find('.ui-slider-handle').css({'border-color':'#4D4D4D'});
				$(this).find('.ui-slider-range').css({'background':'#4D4D4D'});
			}
			if (ui.value > 0){
				$(this).find('.ui-slider-handle span').html(ui.value+'0%');
			}
			else {
				$(this).find('.ui-slider-handle span').html(ui.value+'%');
			}
		}
	});
	$('.ui_1').slider({
		orientation: "horizontal",
		min: 0,
		max: 20,
		value: 13,
		create: function( event, ui ) {
			$(this).find('.ui-slider-handle span').html('13%');
		},
		slide:function( event, ui ){
			$(this).find('.ui-slider-handle span').html(ui.value+'%');
		}
	});
	$('.ui_2').slider({
		orientation: "horizontal",
		min: 0,
		max: 10,
		value: 2,
		create: function( event, ui ) {
			$(this).find('.ui-slider-handle span').html('0.2%');
		},
		slide:function( event, ui ){
			if (ui.value > 0 && ui.value < 10){
				$(this).find('.ui-slider-handle span').html('0.'+ui.value+'%');
			}
			else if (ui.value == 10){
				$(this).find('.ui-slider-handle span').html('1%');
			}
			else {
				$(this).find('.ui-slider-handle span').html(ui.value+'%');
			}
		}
	});
	$('.ui_3').slider({
		orientation: "horizontal",
		min: 0,
		max: 15,
		value: 10,
		create: function( event, ui ) {
			$(this).find('.ui-slider-handle span').html('100%');
		},
		slide:function( event, ui ){
			if (ui.value > 0){
				$(this).find('.ui-slider-handle span').html(ui.value+'0%');
			}
			else {
				$(this).find('.ui-slider-handle span').html(ui.value+'%');
			}
		}
	});
})

/*После загрузки страницы*/
$(window).load(function () {
	$('.slide_inner').css({ 'left': 0 });
    menu_controls();
    menu_slide();
})

/*При ресайзе страницы*/
$(window).resize(function () {

})