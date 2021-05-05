function formatNumber(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    var out = x1 + x2;
    out = out.replace('.', ',');
    return out;
};
$(function() {
    if ($('aside.sidebar').length == 0) {
        $('.all').css('background', 'none');
    }
    if ($('.page-index').length == 0) {
        $('.news_scroll').hide();
    }
    $('a[href="#"]').click(function(e) {
        e.preventDefault();
    });
});