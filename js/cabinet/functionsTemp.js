/*
Автор: Пучкин В.
puchkin@prognoz.ru
*/

$(document).ready(function() {

//Стилизация комбобоксов
//============================================================================

function styleCombobox()
{
	if($('.chosen').length > 0)
	{
		$('.chosen').chosen();
	}
}


//Стилизация чекбоксов
//============================================================================
function styleCheckbox()
{
	if($('input[type="checkbox"]').length > 0)
	{
		$('input[type="checkbox"]').checkbox();
	}
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
	$('.popups_bg').click(function()
	{
		popup('all', 'close');
	});
	
	$('.popup').each(function()
	{
		$(this).show();//IE lt 9 incorrectly calculates the height of the elements with disptay:none style.
		$(this).css('margin-top', -$(this).innerHeight() / 2);
		$(this).hide();
	
		var e = $(this).attr('id');
		var cancel = $(this).children('.popup_footer').children('.btn.big.gray');
		
		cancel.click(function()
		{
			popup(e, 'close');
		});
	});
	
	$('.popups_bg, .popup').hide();
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

//При загрузке
//============================================================================
$(function()
{
	styleCombobox();
	styleCheckbox();
	popupActions();
	
	//Попапы
	$('#treatment_table tr').click(function(e)
	{
		if($(this).attr('id') && $(this).attr('id') != 'treatment_header') {
			$.ajax({type: "POST", url: yii.urls.cabfeedlist, 
				data: { id: $(this).attr('id').replace('treatment_id_','') }
			})
			.done(function( msg ) {
				$('#treatment_number').val(msg.fields['number']);
				$('#treatment_question_topic option[value="' + msg.fields['idtheme'] + '"]').attr('selected', 'selected');
				$('#treatment_question_topic').chosen().change();
			    $('#treatment_question_topic').trigger('liszt:updated');
				$('#treatment_name').val(msg.fields['name']);
				$('#treatment_email').val(msg.fields['email']);
				$('#treatment_status [value=' + msg.fields['status'] + ']').attr('selected', 'selected');
				$('#treatment_status').chosen().change();
			    $('#treatment_status').trigger('liszt:updated');			
				$('#treatment_accepted [value=' + msg.fields['accepted'] + ']').attr('selected', 'selected');
				$('#treatment_accepted').chosen().change();
			    $('#treatment_accepted').trigger('liszt:updated');			
				$('#treatment_text').val(msg.fields['text']);
				$('#treatment_answer').val(msg.fields['answer']);
				popup('edit', 'open');
				$('#treatment_textarea_text_symbols').text($('#treatment_text').val().length);
				$('#treatment_textarea_answer_symbols').text($('#treatment_answer').val().length);
			});
		}
	});
	$('#treatment_header th').click(function(e)
	{
		if($(this).attr('id')) {
			$('#treatment_control_form_sort').val($(this).attr('id').replace('treatment_sort_',''));
            var sort_type = $(this).data('sort-type');
            sort_type = sort_type == 'desc' ? 'asc' : 'desc';
            $('#treatment_control_form_sort_type').val(sort_type);
			submitTreatmentControlForm();
		}
	});
	$('#treatment_table tr td.to_center').click(function(e)
	{
		e.stopPropagation();
	});
	$('#treatment_text').bind('input propertychange', function() {
		$('#treatment_textarea_text_symbols').text($('#treatment_text').val().length);
	});	
	$('#treatment_answer').bind('input propertychange', function() {
		$('#treatment_textarea_answer_symbols').text($('#treatment_answer').val().length);
		if($('#treatment_answer').val().length>24000){
		    $('#treatment_answer').val($('#treatment_answer').val().substring(0,24000));
		}
	});	
	$('#treatment_cancel').click(function(e)
	{
		$('.popups_bg, .popup').hide();
	});
	$('#treatment_save').click(function(e)
	{	
		document.getElementById('treatment_save').style.pointerEvents = 'none';
		$.ajax({type: "POST", url: yii.urls.cabfeed,
			data: { 
				id: $('#treatment_number').val(),
				idtheme: $('#treatment_question_topic').find(':selected').val(),
				name: $('#treatment_name').val(),
				email: $('#treatment_email').val(),
				status: $('#treatment_status').find(':selected').val(),
				accepted: $('#treatment_accepted').find(':selected').val(),
				text: $('#treatment_text').val(),
				answer: $('#treatment_answer').val()
			}
		})
		.done(function( msg ) {
			$('.popups_bg, .popup').hide();
			location.reload();
		});			
	});

	//Форма обращений
	$('#treatment_form_submit_btn').click(function()
	{
		submitTreatmentForm();
		return false;
	});
	$('#treatment_control_form .pag_right a').click(function()
	{
		$('#treatment_control_form_page').val($(this).attr('page'));
		submitTreatmentControlForm();
	});	
	$('#treatment_control_form .pag_center>span').click(function()
	{
		$('#treatment_control_form_status').val($(this).attr('status'));
		submitTreatmentControlForm();
	});
	$('#treatment_control_question_topic').live('change', function (e)
	{
		$('#treatment_control_form_question_topic').val($(this).val());
		submitTreatmentControlForm();
	});
	$('#treatment_check_all').click(function(e)
	{
		var check = ($(this).is(':checked')) ? 1 : 0;
		$('#treatment_table td.to_center input').each(
			function() {
				console.log($(this))
				if (check) {
					$(this).attr('checked', true);
					$(this).prev('.fake_checkbox').addClass('checked');
				}
				else {
					$(this).attr('checked', false);
					$(this).prev('.fake_checkbox').removeClass('checked');
				}
		});
		e.stopPropagation();
	});
	var getTreatmentIds = function() {
		$('#treatment_table td.to_center input').each(
			function() {
				if ($(this).is(':checked')) {
					$('#treatment_id').val($('#treatment_id').val() + $(this).parent().parent().parent().attr('id').replace('treatment_id_','') + ',');
				}
		});
	}
	var submitTreatmentForm = function() {
		getTreatmentIds();
		$('#treatment_form').submit();
	}
	var submitTreatmentControlForm = function() {
		$('#treatment_control_form').submit();
		return false;
	}	
});

});
