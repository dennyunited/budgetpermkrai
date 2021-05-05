$(function(){
    $('.js-survey-list').chosen();
    
    $('.js-survey-list').on('change', function(){
        $('.js-survey').hide();
        $('.js-survey').eq($(this).val()).show();
    }); 
    
    $('.js-survey form').on('submit', function(e){
        e.preventDefault();
        var $form  = $(this);
        var url = $form.attr('action');
        var data = $form.serialize();
        if($form.find('input:checked').length === 0){
            alert("Не выбрано ни одного варианта");
            return;
        }
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            success: function(response){
                alert("Ваш ответ принят! Спасибо за участие в опросе.");
                $form[0].reset();
                $form.find('input[checked]').attr('checked', false);
                $form.find('.js-other-answer input[type="text"]').hide();
            },
            error: function(response){
                if(response.status==403){
                    alert("Вы не можете больше голосовать в этом опросе.");
                }
            }
        });

        return false;
    });

    $('.js-show-results').on('click', function(){
        var $form = $(this).closest('form');
        $form.data('surveyId');
        $.ajax({
            url:'/survey/result/id/'+$form.data('surveyId'),
            type:'GET',
            success:function(response){
                showResult($form.closest('.js-survey').find('.js-survey-results'),response);
            },
            error:function(){

            }
        });
    });
    
    $('.js-survey form').on('change', '[type="checkbox"], [type="radio"]', function(){
        if($(this).is(':checked') && $(this).closest('.js-other-answer').length>0){
            $('.js-other-answer').find('input[type="text"]').show().focus();
        }
        else{
            $('.js-other-answer').find('input[type="text"]').hide();
        }
    });
    
    $('.js-survey form').on('change', '[type="radio"]', function(){
        $('.js-survey form input[type="radio"]').attr('checked', false);
        $(this).attr('checked', true);
    });
    
    function showResult($container, result){
        return true; // ticket 1175198 
        if(!$container.length){
            return false;
        }
        $container.show();

        var categories = [];
        var series = [{
            name:"голоса",
            data: []
        }];

        $.each(result, function(key, value){
            categories.push(value.ITEM_NAME);
            series[0].data.push(parseInt(value.NUM));
        });

        $container.highcharts({
            chart: {
                type: 'bar',
                title: ''
            },
            title:{
                text:'Результаты опроса'
            },
            xAxis: {
                categories: categories,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text:'Голосов',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 100,
                floating: true,
                borderWidth: 1,
                backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: series
        });

        return true;
    }

});