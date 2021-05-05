$(function () {
    var IE_gs_mode = false,
        stylesChanged = false,
        special_label = 'Версия для слабовидящих',
        usual_label = 'Обычная версия сайта';

    $(document).ready(function(){
        IE_gs_mode = msieversion();
        $(document).on('click', '.with-tool-font .switch', function() {
            $(this).toggleClass('switch_off');
            if($(this).hasClass('switch_off')){
                changeFont('useSerif');
            }
            else{
                changeFont('0');
            }
            reloadFontSize();
        });

        $(document).on('click', '.with-tool-img .switch', function() {
            $(this).toggleClass('switch_off');
            if($(this).hasClass('switch_off')){
                changeNoImageMode('0');
                $('body').removeClass('no_image_mode');
            }
            else{
                changeNoImageMode('1');
                $('body').addClass('no_image_mode');
            }
        });

        var mode = getCookie('special_mode');
        if(mode === '1') {
            $('body').addClass('special_mode');
            if(IE_gs_mode){
                $('body').addClass('ie_mode');
            }

            $('.usually-version-link').html(usual_label);

            initMode();
        }
    });

    function initMode(){

        if($('#highcharts-canvas').length){
            $('#highcharts-canvas').parent().find('.tabs li').on('click', function(){
                var font_size = getCookie('font_size');
                if(font_size){
                    setTimeout(function(){
                        changeFontSizeAction($('#highcharts-canvas').parent().contents(), font_size);
                    }, timeout);
                }
            });
        }

        var dark_mode = getCookie('dark_mode');
        if (dark_mode === '1') {
            $('body').addClass('dark_side');
            $('.color-btn').removeClass('active');
            $('.color-btn').eq(1).addClass('active');
        }

        var no_image_mode = getCookie('no_image_mode');
        if(no_image_mode === '1') {
            $('body').addClass('no_image_mode');
            $('.with-tool-img .switch').removeClass('switch_off');
        }

        var font_name = getCookie('font_name');
        if (typeof font_name !== 'undefined' && font_name.length && font_name !== '0') {
            changeFont(font_name);
            $('.with-tool-font .switch').addClass('switch_off');
        }
        reloadFontSize();
        $(document).trigger('reloadSpecialStyles');

        $(document).ajaxComplete(function() {
            reloadFontSize();
        });
    }

    $('.usually-version-link').on("click", function (event) {
        event.preventDefault();
        var mode = getCookie('special_mode');
        if(mode === '1'){
            $(this).html(special_label);
            setCookie('special_mode', '0', 7);
            if(IE_gs_mode > 8) {
                setCookie('special_ie_mode', '0', 7);
                location.reload();
            }
            changeFontSizeAction($('.special_mode').contents(), 1);
            removeOldSpecialFontSetting();
            $('body').removeClass('special_mode');
        }
        else{
            $(this).html(usual_label);
            setCookie('special_mode', '1', 7);
            $('body').addClass('special_mode');
            initMode();
            if(IE_gs_mode > 8) {
                setCookie('special_ie_mode', '1', 7);
                location.reload();
            }
        }
    });

    $('.font-btn').on("click", function () {
        $('.font-btn').removeClass('active');
        $(this).addClass("active");
    });

    $('.color-btn').on("click", function () {
        $('.color-btn').removeClass('active');
        $(this).addClass("active");
        if($(this).hasClass('color-btn-dark')){
            setDarkMode('1');
        }
        else{
            setDarkMode('0');
        }
    });

    $('.js-small-font-btn').on("click", function () {
        changeFontSize(1);
    });
    $('.js-middle-font-btn').on("click", function () {
        changeFontSize(1.07);
    });
    $('.js-large-font-btn') .on("click", function () {
        changeFontSize(1.15);
    });

    $('.js-family-interval-select').on("change", function () {
        changeLetterSpacing($(this).val());
    });

    $('.js-family-type-select').on("change", function () {
        changeFont($(this).val());
    });

    function setFontMarks(modifier){
        $('body.special-small-font').removeClass('special-small-font');
        $('body.special-middle-font').removeClass('special-middle-font');
        $('body.special-large-font').removeClass('special-large-font');
        if(modifier > 0){
            var type = 'small';
            if(parseFloat(modifier) === 1.07){
                type = 'middle';
            }
            else if(parseFloat(modifier) === 1.15){
                type = 'large';
            }
            $('body').addClass('special-' + type + '-font');
        }
    }


    function reloadFontSize(){
        var font_size = getCookie('font_size');
        var timeout = $('#highcharts-canvas').length ? 1000 : 0;
        if (font_size === '1' || font_size === '1.07' || font_size === '1.15') {
            setTimeout(function(){
                changeFontSize(font_size);
            }, timeout);
        }
    }

    function changeFontSize(modifier) {
        setCookie('font_size', modifier, 7);
        $(document).trigger('reloadSpecialStyles');
        setFontMarks(modifier);
        changeFontSizeAction($('.special_mode').contents(), modifier);
    }

    function changeNoImageMode(modifier){
        setCookie('no_image_mode', modifier, 7);
    }

    function changeFontSizeAction(elements, modifier) {
        $.each(elements, function (ind, node) {
            if (node.nodeType == 3) {
                if (node.textContent.trim() != "") {
                    var size = $(node.parentNode).css('font-size').replace('px', '');
                    if (!$(node.parentNode).data('initialSize'))
                        $(node.parentNode).data('initialSize', size);
                    size = parseInt($(node.parentNode).data('initialSize'));
                    var modifiedSize;
                    if(size < 25){
                        modifiedSize = size * modifier;
                    }
                    else{
                        modifiedSize = size * ( 1 + ( (modifier - 1) / (size / 10) ) );
                        //console.log(size + ' - ' + modifiedSize);
                    }

                    $(node.parentNode).css('font-size', modifiedSize + "px");
                }
            }
            changeFontSizeAction(node.childNodes, modifier);
        });
        stylesChanged = true;
    }

    function changeLetterSpacing(modifier) {
        setCookie('letter_spacing', modifier, 7);
        stylesChanged = true;
        changeLetterSpacingAction($('.special_mode').contents(), modifier);
    }

    function changeLetterSpacingAction(elements, modifier) {
        $.each(elements, function (ind, node) {
            if (node.nodeType == 3) {
                if (node.textContent.trim() != "") {
                    $(node.parentNode).css('letter-spacing',  modifier + "px");
                }
            }
            changeLetterSpacingAction(node.childNodes, modifier);
        });
    }

    function changeFont(modifier) {
        removeOldSpecialFontSetting();
        if(modifier !== '0'){
            $('body').addClass(modifier);
        }
        setCookie('font_name', modifier, 7);
        $(document).trigger('reloadSpecialStyles');
        stylesChanged = true;
    }

    function setDarkMode(modifier) {
        if(modifier === '1'){
            $('body').addClass('dark_side');
        }
        else{
            $('body').removeClass('dark_side');
        }

        setCookie('dark_mode', modifier, 7);
        stylesChanged = true;
    }

    function removeOldSpecialFontSetting(){
        $('body.useArial').removeClass('useArial');
        $('body.useVerdana').removeClass('useVerdana');
        $('body.useTimesNewRoman').removeClass('useTimesNewRoman');
        $('body.useSerif').removeClass('useSerif');
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires + '; Path=/';
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
        }
        return "";
    }

    function ieCheck() {
        var ua = window.navigator.userAgent,
            msie = ua.indexOf("MSIE ");
        return (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) ? true : false;
    }

    function msieversion() {

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        var result = false;

        if (msie > 0){
            result = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
        }
        else if(!!navigator.userAgent.match(/Trident.*rv\:11\./)){
            result = 11;
        }

        return result;
    }
    
});