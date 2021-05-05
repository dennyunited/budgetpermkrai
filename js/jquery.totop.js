(function($, window) {
    $.fn.totop = function(options) {
        var p = $.extend(true, {}, $.fn.totop.defaults, options);
        var $t = $(this);
        $('#' + p.id).click(function(e) {
            e.preventDefault();
            $("body, html").animate({scrollTop: 0}, p.scrollSpeed);
            if (p.doNotHide == false) {
                $(this).slideUp(p.arrowAppearSpeed).animate({
                    opacity: 0
                }, {
                    duration: p.arrowAppearSpeed,
                    queue: false
                });
            }
        });
        $t.scroll(function() {
            var $arrow = $('#' + p.id);
            clearTimeout($arrow.data(p.dataName));
            $arrow.data(p.dataName, setTimeout(function() {
                if ($t.scrollTop() > p.top) {
                    $arrow.slideDown(p.arrowAppearSpeed).animate({
                        opacity: 1
                    }, {
                        duration: p.arrowAppearSpeed,
                        queue: false
                    });
                } else {
                    if (p.doNotHide == false) {
                        $arrow.slideUp(p.arrowAppearSpeed).animate({
                            opacity: 0
                        }, {
                            duration: p.arrowAppearSpeed,
                            queue: false
                        });
                    }
                }
            }, p.timeout));
        });
    };
    $.fn.totop.defaults = {
        top: 300,
        id: 'totop',
        arrowAppearSpeed: 300,
        scrollSpeed: 300,
        timeout: 150,
        doNotHide: true,
        dataName: 'totop-timeout'
    };
})(jQuery, window);