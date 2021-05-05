function menu_controls() {
    $('.slide_outer').each(function () {
        var ul_width = $(this).find('ul').width(),
            content_width = $(this).width(),
            offset = parseInt($(this).find('.slide_inner').css('left')),
            max_slide = ul_width - content_width;
        if (ul_width > content_width) {

            if (offset >= 0) {
                $(this).closest('.container').find('.slide_left').addClass('disabled');
                clearInterval(menu_slide);
            }
            else if (offset < 0) {
                $(this).closest('.container').find('.slide_left').removeClass('disabled');
            }
            if (offset >= -max_slide) {
                $(this).closest('.container').find('.slide_right').removeClass('disabled');
            }
            else if (offset <= -max_slide) {
                $(this).closest('.container').find('.slide_right').addClass('disabled');
                clearInterval(menu_slide);
            }
            if ($(this).closest('.container').find('.slide_right').attr('class') == 'menu_right disabled') {}
        }
        else {
            $('.menu_rails').attr('style', 'left:0px');
            $(this).closest('.container').find('.slide_left').addClass('disabled');
            $(this).closest('.container').find('.slide_right').addClass('disabled');
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
	
	$(function()
	{
	
		$('.cbt_combobox').each(function()
		{
			$(this).children('.cbt_dropdown').children('.cbt_dropdown_item').each(function()
			{
				$(this).mousedown(function()
				{
					$(this).addClass('pressed');
				}).mouseup(function()
				{
					$(this).removeClass('pressed');
				});;
			});
	
				
			var thisCB = $(this);
			
			thisCB.children('.cbt_dropdown').css('width', thisCB.innerWidth());
			
			$(this).click(function()
			{
				thisCB.prev('.cbt_background').css('z-index', '253');
				thisCB.removeClass('focus');
				thisCB.children('.cbt_dropdown').hide();
				thisCB.addClass('focus').css('z-index', '254');
				thisCB.children('.cbt_dropdown').slideDown(100);
				thisCB.prev('.cbt_background').show();
				thisCB.children('.cbt_fake').show().css('z-index', '255');
			});
			
			
			$('.cbt_background').click(function()
			{
				thisCB.children('.cbt_dropdown').slideUp(100);
				window.setTimeout(function()
				{
					thisCB.removeClass('focus').css('z-index', '2');
				}, 100);
				thisCB.prev('.cbt_background').hide().css('z-index', '1');
				thisCB.children('.cbt_fake').hide().css('z-index', '3');
			});
			thisCB.children('.cbt_dropdown').children('.cbt_level').children('.cbt_level').children('.cbt_dropdown_item').click(function(e)
			{
				slideUp();
				e.stopPropagation();
				return false;
			});
			thisCB.children('.cbt_dropdown').children('.cbt_dropdown_item').click(function()
			{
				thisCB.children('.cbt_dropdown').children('.cbt_dropdown_item').removeClass('selected');
				$(this).addClass('selected');
				
				thisCB.children('.cbt_dropdown').css('width', thisCB.innerWidth());
				slideUp();
				thisCB.children('.cbt_left').text($(this).text());
				thisCB.next('select').children('option').removeAttr('selected');
				thisCB.next('select').children('option').eq($(this).index() - 1).attr('selected', 'selected');
				return false;
			});
			
			thisCB.children('.cbt_fake').click(function()
			{
				slideUp();
				return false;
			});
			var slideUp = function(){
				thisCB.children('.cbt_dropdown').slideUp(100);
				window.setTimeout(function()
				{
					thisCB.removeClass('focus').css('z-index', '2');
				}, 100);
				thisCB.prev('.cbt_background').hide().css('z-index', '1');
				thisCB.children('.cbt_fake').hide().css('z-index', '3');
			}
		});
		
		$('.cbt_dropdown_item.drop > a.auto-expand').each(function()
		{
			$(this).click(function(e)
			{
				$(this).parent().find('span.icon').trigger('click');
				e.stopPropagation();
			});
		});
		$('.cbt_dropdown_item.drop > span.icon').each(function()
		{
			if($(this).closest('.cbt_dropdown_item').attr('class') == 'cbt_dropdown_item drop')
			{
				$(this).closest('.cbt_level').children('.cbt_level').hide();
			}
			$(this).click(function()
			{
				$(this).closest('.cbt_dropdown_item').toggleClass('open');
				$(this).closest('.cbt_level').children('.cbt_level').slideToggle();
				return false;
			});
		});
		
		var input = $('.cbt_combobox > input');
		
		$('.cbt_dropdown_item > .text').each(function()
		{
			$(this).click(function()
			{
				if($(this).attr('class') != 'text disabled')
				{
					if (!$(this).parent().hasClass('drop')) {
						if ($(this).attr('select_value'))
							$(this).closest('.cbt_combobox').children('.cbt_left').attr('select_value',$(this).attr('select_value'));
						$(this).closest('.cbt_combobox').children('.cbt_left').text($(this).text());
					}
					
					if($(this).closest('div').attr('class') == 'cbt_dropdown_item drop' || $(this).closest('div').attr('class') == 'cbt_dropdown_item drop open')
					{
						nextElemLength = $(this).closest('.cbt_level').children('.cbt_level').find('.text').length;
						
						inputText = $(this).text() + ';';
						
						for(i = 0; i <= nextElemLength; i++)
						{
							inputText += $(this).closest('.cbt_level').children('.cbt_level').find('.text').eq(i).text() + ';';
						}
						
						input.val(inputText);
					}
					else
					{
						input.val($(this).text());
					}
				}
			});
		});
	
	});
}


//Раскрывающиеся блоки в «Государственные-программы-3»
//============================================================================
function gpBlocks()
{
	if($('.gp_info_block').length > 0)
	{
		$('.gp_info_block').each(function()
		{
			var e = $(this);
			var title = e.children('h1');
			var hidden = e.children('.GPI_content');
			
			hidden.hide();
			title.css('margin-bottom', 0);
			
			if(e.hasClass('open'))
			{
				hidden.show();
			title.css('margin-bottom', '20px');
			}
			
			title.click(function()
			{
				if(e.hasClass('open'))
				{
					e.removeClass('open');
					hidden.slideUp();
					title.animate({'margin-bottom':0});
				}
				else
				{
					e.addClass('open');
					hidden.slideDown();
					title.animate({'margin-bottom':'20px'});
				}
			});
		});
	}
}


//Переключающиеся блоки «Карта», «Рейтинг» и прочие в «Финансовый-менеджмент-3,4,5»
//============================================================================
function switchBlocks()
{
	if($('.sort > a').length > 0)
	{
		$('.sort > a').each(function()
		{
			var e = $(this);
			var hidden = $('.sort_hidden').eq(e.index());
			
			hidden.hide();
			if(e.hasClass('active_sort'))
			{
				hidden.show();
			}
			
			e.click(function()
			{
				$('.sort > a').removeClass('active_sort');
				e.addClass('active_sort');
				$('.sort_hidden').hide();
				hidden.show();
				return false;
			});
		});
	}
	
	if($('.SC_switcher > div').length > 0)
	{
		$('.SC_switcher > div').each(function()
		{
			var e = $(this);
			var hidden = $('.CSC_chart_hidden').eq(e.index());
			
			hidden.hide();
			if(e.hasClass('active'))
			{
				hidden.show();
			}
			
			e.click(function()
			{
				$('.SC_switcher > div').removeClass('active');
				e.addClass('active');
				$('.CSC_chart_hidden').hide();
				hidden.show();
			});
		});
	}
}


//Раскрытие и скрытие ответов в «Обратная-связь»
//============================================================================
function treat()
{
	if($('.TI_expand').length > 0)
	{
		$('.TI_expand').each(function()
		{
			var e = $(this);
			var eText = e.children('span');
			var hidden = e.next('.TI_hidden');
			
			hidden.hide();
			if(eText.text() == 'Скрыть ответ')
			{
				hidden.show();
			}
			
			e.click(function()
			{
				if(eText.text() == 'Скрыть ответ')
				{
					hidden.slideUp();
					eText.text('Раскрыть ответ');
				}
				else if(eText.text() == 'Раскрыть ответ')
				{
					hidden.slideDown();
					eText.text('Скрыть ответ');
				}
			});
		});
	}
}


//Фиксированный блок с формой обратной связи
//============================================================================
function feedback()
{
	$('.feedback_tail').click(function()
	{
		if(parseFloat($('.feedback_fixed').css('right')) == -269)
		{
			$('.feedback_fixed').animate({'right':-2}, 300);
		}
		else
		{
			$('.feedback_fixed').animate({'right':-269}, 300);
		}
	});
	// Функция для крестика в обратной связи
	$('.feedback_close').click(function()
	{	
		$('.feedback_fixed').animate({'right':-269}, 300);
	});	
}


//Функция открытия попапа
//============================================================================
function popup(id, action)
{
	if(action == 'open')
	{
		$('.popups_bg').fadeIn();
		$('#' + id).fadeIn();
	}
	else
	{
		if(id == 'all')
		{
			$('.popups_bg').fadeOut();
			
			$('.popup').each(function()
			{
				$(this).fadeOut();
			});
		}
		else
		{
			$('.popups_bg').fadeOut();
			$('#' + id).fadeOut();
		}
	}
}


//Закрытие попапов
//============================================================================
function popupActions()
{
	$('.treat_form > .btn').click(function()
	{
		$.ajax({type: "POST", url: yii.urls.addfeed, 
			data: { 
				idtheme: $('#feedback_subject').attr('select_value'),
				name: $('#feedback_name').val(),
				email: $('#feedback_email').val(),
				text: $('#feedback_text').val()
			}
		})
		.done(function( msg ) {
			var str = '';
			//console.log(msg.errors);
			for (field in msg.errors) {
				if(msg.errors[field]) {
					str += msg.errors[field] + '\n';
				}
			}
			str = str.replace('Idtheme','"Тема обращения"').replace('Email','"Электронный адрес"').replace('Name', '"Ф.И.О."').replace('Text','"Текст обращения"');
			if (str)
				alert('Обратите внимание:\nПри отправке обращения неверно заполнены поля.\n\n'+str+'\nЗаполните правильно поля и повторите отправку обращения.');
			else {
				popup('ok', 'open');
				$('#feedback_subject').text('Выберите тему обращения');
				$('#feedback_subject').attr('select_value', '');
				$('#feedback_name').val('');
				$('#feedback_email').val('');
				$('#feedback_text').val('');
				$('#feedback_textarea_symbols').text($('#feedback_text').val().length);
				$('.feedback_tail').trigger('click');
				$('#feedback_textarea_symbols').text(0);
			}
		});		
	});
	
	$('#feedback_text').bind('input propertychange', function() {
		$('#feedback_textarea_symbols').text($('#feedback_text').val().length);
	});

	$('.popups_bg').click(function()
	{
		popup('all', 'close');
	});
	$('.popup_close').click(function()
	{	
		popup('all', 'close');
	});
	$('.popup').each(function()
	{
//		$(this).css('margin-top', -$(this).innerHeight() / 2);
//		$(this).css('margin-left', -$(this).innerWidth() / 2);
//	
		var e = $(this).attr('id');
		var cancel = $(this).children('.btn');
		
		cancel.click(function()
		{
			popup(e, 'close');
		});
	});
	
	$('.popups_bg, .popup').hide();
}

function oldBrowserCheck() {
    if (typeof $.cookie === 'function' && $.cookie('noOldBrowserCheck')) {
        return;
    }

    var knownAgents = new Array();
    knownAgents[0] = 'msie';
    knownAgents[1] = 'firefox';
    knownAgents[2] = 'chrome';
    knownAgents[3] = 'safari';
    knownAgents[4] = 'webkit';
    knownAgents[5] = 'opera';
    knownAgents[6] = 'netscape';
    knownAgents[7] = 'konqueror';
    knownAgents[8] = 'gecko';

    var uAgent = navigator.userAgent;
    var curAgent = '';
    for (var i = 0; i < knownAgents.length; i++) {
        var checkAgent = new RegExp(knownAgents[i], 'i');
        if (checkAgent.test(uAgent)) {
            curAgent = knownAgents[i];
            break;
        }
    }

    if (curAgent == '') {
        return;
    }

    var checkVersion = new RegExp(curAgent + '[/ ]+([0-9]+(\.[0-9]+)?)', 'i');
    var curVersionData = checkVersion.exec(uAgent);
    if (!curVersionData) {
        return;
    }

    if (curAgent == 'opera' && window.opera && curVersionData[1] != opera.version())
        curVersionData[1] = opera.version();

    var curVersion = curVersionData[1].split('.');
    if (curVersion.length < 2) {
        curVersion[1] = 0;
    }
    curVersion[0] = parseInt(curVersion[0]);
    curVersion[1] = parseInt(curVersion[1]);

    if ((curAgent == 'msie' && curVersion[0] < 8)
        || (curAgent == 'firefox' && curVersion[0] < 11)
        || (curAgent == 'chrome' && curVersion[0] < 21)
        || (curAgent == 'opera' && (curVersion[0] < 12 || (curVersion[0] <= 12 && curVersion[1] < 10)))
        || (curAgent == 'safari' && (curVersion[0] < 5 || (curVersion[0] == 5 && curVersion[1] < 1)))
    ) {
        
        $('body').prepend(
            '<div id="oldBrowserMsg" style="background-color: #F00; color: #FFF; width: 100%;">'
                + '<div style="float: left; color:black;">Вы используете устаревшую версию браузера, могут быть ошибки совместимости при просмотре графики.</div>'
                + '<div id="closeOldBrowserMsg" title="Закрыть" style="float: right; cursor: pointer;">&nbsp;&nbsp;&nbsp;X&nbsp;&nbsp;&nbsp;</div>'
                + '<div style="clear: both;"></div>'
            + '</div>'
        );

        $('#closeOldBrowserMsg').bind('click', function(){
            $('#oldBrowserMsg').remove();
            $.cookie('noOldBrowserCheck', 1, {expires: (1/24/2)});
        });
    }
}

$.fn.hasOverflow = function() {
    var $this = $(this);
    var $children = $this.find('*');
    var len = $children.length;

    if (len) {
        var maxWidth = 0;
        var maxHeight = 0
        $children.map(function(){
            maxWidth = Math.max(maxWidth, $(this).outerWidth(true));
            maxHeight = Math.max(maxHeight, $(this).outerHeight(true));
        });

        return maxWidth > $this.width() || maxHeight > $this.height();
    }

    return false;
};

/*Стартовые функции*/
$(function () {

})

/*После загрузки страницы*/
$(window).load(function () {
	$('.slide_inner').css({ 'left': 0 });
    menu_controls();
    menu_slide();
	gpBlocks();
	switchBlocks();
	treat();
	feedback();
	popupActions();
	
	if($('.chosen').length > 0)
	{
		$('.chosen').chosen();
	}
	if($.browser.msie && $.browser.version < 9)
		$('img').css('max-width', 'inherit')

    oldBrowserCheck();
})

/*При ресайзе страницы*/
$(window).resize(function () {

})

$(window).resize(function () {
                if ($(window).width() < 1280){
                               $('.news_list li').css('min-width',188);
                } else {
                               $('.news_list li').css('min-width',202);
                }
})
