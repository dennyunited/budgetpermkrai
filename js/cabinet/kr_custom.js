$(function() {
    (function() {
        var days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        var months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября' ,'ноября' ,'декабря'];

        function update() {
            var date = new Date();
            var day = days[date.getDay()];
            var month = months[date.getMonth()];
            var d = date.getDate();

            var hours = ('0' + date.getHours()).slice(-2);
            var minutes = ('0' + date.getMinutes()).slice(-2);
            var textDate = day + ', ' + d + ' ' + month;

            $('.TimeDate .minute').text(minutes);
            $('.TimeDate .hour').text(hours);
            $('.TimeDate .date').text(textDate);
        }

        setInterval(update, 900);
        update();
    })();

    $('aside .main_link a').click(function() {
        var $t = $(this), $aside = $t.closest('aside');
        if ($aside.is(':animated')) {
            return;
        }
        var $hie = $aside.children('.hierarchy');
        if ($hie.is(':visible')) {
            $hie.fadeOut(100);
            $aside.animate({width: '61px'}, 200);
            $('section').animate({'margin-left': '61px'}, 200);
        } else {
            $aside.animate({width: '291px'}, 200, function() {
                $hie.fadeIn(100);
            });
            $('section').animate({'margin-left': '291px'}, 200);
        }
    });

    $('section ul.sidebar_list').addClass('left_bar_list').css({width: 'auto', 'max-width': '360px'});
    $('#metadata .sidebar_list li').css('padding', '15px 25px');

    $('.content').css('min-height', $('.sidebar').outerHeight());

    $('section').on('click', '.filebrowse, .filebrowse-input', function() {
        $(this).siblings('.fileinput').click();
    });

    $('section').on('change', '.fileinput', function() {
        var v = $(this).val();
        if (v) {
            var startIndex = (v.indexOf('\\') >= 0 ? v.lastIndexOf('\\') : v.lastIndexOf('/'));
            var filename = v.substring(startIndex);
            if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                filename = filename.substring(1);
            }
            $(this).siblings('.filebrowse-input').val(filename);
        }
    });
    $('section').on('click', '.my-tabs > ul li', function() {
        var $t = $(this);
        var index = $t.parent().children().index(this);
        $t.addClass('my-tabs-opened').siblings().removeClass('my-tabs-opened');
        var $holder = $t.closest('.my-tabs');
        $holder.find('.my-tabs-divs > div').hide().eq(index).show();
    });
    $('section').on('click', '.left_bar_list li a', function() {
        $(this).parent().addClass('active').siblings().removeClass('active');
    });
});
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