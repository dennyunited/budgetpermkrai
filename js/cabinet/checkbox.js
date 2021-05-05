/*
Автор: Пучкин В.
puchkin@prognoz.ru
*/

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
		$(this).bind('click', function()
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
		$(this).bind('mouseover', function()
		{
			$(this).prev('.fake_checkbox').addClass('hover');
		}).bind('mouseleave', function()
		{
			$(this).prev('.fake_checkbox').removeClass('hover');
		});
	});
}