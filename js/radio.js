/*
Автор: Пучкин В.
puchkin@prognoz.ru
*/

jQuery.fn.radio = function()
{
	$(this).each(function()
	{
		$(this).css('opacity', '0');
		
		var name = $(this).attr('name');
		
		//Чтобы сменить оформление чекбокса, достаточно подставить ему какой-то класс, а у этого класса в css задать другое фоновое изображение
		if($(this).attr('class') != 'undefined')
		{
			specClass = ' ' + $(this).attr('class');
		}
		else
		{
			specClass = '';
		}
		$(this).closest('div').prepend('<div class="fake_radio' + specClass + '"></div>');
		//При загрузке
		if($(this).is(':checked'))
		{
			$(this).prev('.fake_radio').addClass('checked');
		}
		else
		{
			$(this).prev('.fake_radio').removeClass('checked');
		}
		//При клике
		$(this).live('click', function()
		{
			if($(this).is(':checked'))
			{
				$('input[type="radio"][name="' + name + '"]').prev('.fake_radio').removeClass('checked');
				$(this).prev('.fake_radio').addClass('checked');
			}
		});
		//При наведении
		$(this).live('mouseover', function()
		{
			$(this).prev('.fake_radio').addClass('hover');
		}).live('mouseleave', function()
		{
			$(this).prev('.fake_radio').removeClass('hover');
		});
	});
}