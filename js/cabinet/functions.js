$(function() {
    $('aside .hierarchy ul li > ul').hide();
    $('aside .hierarchy .open > ul').show();
    $('aside .hierarchy .icon_drop').click(function () {
        var _this = $(this), $ul = _this.closest('li').find('> ul');
        if ($ul.is(':animated')) {
            return;
        }
        _this.closest('li').find('> ul').slideToggle(200, function () {
            _this.closest('li').toggleClass('open');
        });
    });
    $('aside .icon_list').click(function() {
        var $drop = $(this).closest('.drop');
        $(this).siblings('ul').slideToggle(200, function() {
            $drop.toggleClass('visible');
        });
    });
    $('#login_submit_btn').click(function() { //cabinet/views/login/login.php
        submitCheckAndSubmit();
    });
    $('input').keypress(function(event) {
        if (event.which == 13)
            submitCheckAndSubmit();
    });    
    var submitCheckAndSubmit = function() {
        if ($('#login_form input').get(0).value == '' || $('#login_form input').get(1).value == '')
            alert('Введите логин и пароль');
        else
            $('#login_form').submit();
    }
});

function showDialogAlert(alertText, titleText) {
    $('#openDialog')
        .html(alertText)
        .dialog('option', {
            width: 400,
            title: titleText ? titleText : '',
            buttons: [
                {
                    text: 'Закрыть окно',
                    click: function() {
                        $(this).dialog('close');
                    }
                }
            ]
        })
        .dialog('open');
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
