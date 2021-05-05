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
        if (typeof $(this).attr('class') != 'undefined')
        {
            var specClass = ' ' + $(this).attr('class');
        }
        else
        {
            specClass = '';
        }

        var $fakeCheckbox = $('<div class="fake_checkbox' + specClass + '"></div>');

        $(this).closest('div').prepend($fakeCheckbox);
        //При загрузке
        if ($(this).is(':checked'))
        {
            $fakeCheckbox.addClass('checked');
        }
        else
        {
            $fakeCheckbox.removeClass('checked');
        }
        //При клике
        $(this).on('change', function()
        {
            if ($(this).is(':checked'))
            {
                $fakeCheckbox.addClass('checked');
            }
            else
            {
                $fakeCheckbox.removeClass('checked');
            }
        });
        //При наведении
        $(this).on('mouseover', function()
        {
            $fakeCheckbox.addClass('hover');
        }).on('mouseleave', function()
        {
            $fakeCheckbox.removeClass('hover');
        });
    });
}