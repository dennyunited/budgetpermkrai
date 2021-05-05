function SurveyManager(){
    'use strict';
    ManagerPrototype.apply(this, arguments);
    var _self = this;
    this.gridId = 'survey_list';
    this.formData;

    this.init = function(){
        
        _self.itemsForm = new MultipleForm({
            form:$('.js-items-form'),
            onAdd:function(){
                _self.validator.update();
            },
            onRemove:function(){
                _self.validator.update();
            },
            afterUpdate:function(){
                _self.validator.update();
            },
            maxLength:40,
            template:'<div>\n\
            <div style="margin-bottom: 5px">\n\
                <div class="js-multiple-form multiple-form-wrapper">\n\
                    {{#each this}}\n\
                        <div class="multiple-form-row js-multiple-form-row" data-multiple_form_index="{{@index}}">\n\
                            <span title="Удалить вариант ответа" class="js-multiple-form-remove multiple-form-remove glyphicon glyphicon-remove"></span>\n\
                        </div>\n\
                    {{/each}}\n\
                </div>\n\
            </div>\n\
            {{#checkLength this}}\n\
                <span class="js-multiple-form-add btn btn-primary btn-xs">Добавить</span>\n\
            {{/checkLength}}\n\
        <div>'
        });
        
        this.validator = new FormValidator(_self.$form, {
            fields:[
                {
                    selector:'[name="SURVEY[NAME]"]',
                    rules:['required', ['maxlength',100]],
                    events:'blur change'
                },
                {
                    selector:'[name="SURVEY[DESCRIPTION]"]',
                    rules:['required', ['maxlength',200]],
                    events:'blur change'
                },
                {
                    selector:'[name^="SURVEY[ITEMS]"][type="text"]',
                    rules:['required'],
                    events:'blur change'
                },
                {
                    selector:'#SURVEY_DATESTART',
                    events:'blur change',
                    rules:['required', ['custom', function($field, fieldConfig){
                            var _self = this;
                            var valid = true;
                            $field.parent().find('.'+_self.errorMessageClass).remove();
                            var from = parseInt($('#SURVEY_DATESTART').val().replace(/(\d\d)\.(\d\d)\.(\d\d\d\d)/, '$3$2$1'));
                            var to = parseInt($('#SURVEY_DATEEND').val().replace(/(\d\d)\.(\d\d)\.(\d\d\d\d)/, '$3$2$1'));
                            if(!!from && !!to && to < from){
                                valid = false;
                            }
                            var $endDateRow = $('#SURVEY_DATEEND').closest('.row');
                            if (valid && $endDateRow.hasClass('error') && $('#SURVEY_DATESTART').val()) {
                                $endDateRow.removeClass('error').addClass('success');
                                $endDateRow.find('.errorMessage').remove();
                            }

                            return valid;
                        }
                    ]],
                    afterValidate:function($field, fieldConfig, valid, message, event){
                        _self.validator.validate($('#SURVEY_DATESTART').not($field), event, true);
                        return true;
                    },
                    messages:{custom:'Дата начала не может быть позже даты окончания.'}
                },
                {
                    selector:' #SURVEY_DATEEND',
                    events:'blur change',
                    rules:['required', ['custom', function($field, fieldConfig){
                        var _self = this;
                        var valid = true;
                        $field.parent().find('.'+_self.errorMessageClass).remove();
                        var from = parseInt($('#SURVEY_DATESTART').val().replace(/(\d\d)\.(\d\d)\.(\d\d\d\d)/, '$3$2$1'));
                        var to = parseInt($('#SURVEY_DATEEND').val().replace(/(\d\d)\.(\d\d)\.(\d\d\d\d)/, '$3$2$1'));
                        if(!!from && !!to && to < from){
                            valid = false;
                        }
                        var $startDateRow = $('#SURVEY_DATESTART').closest('.row');
                        if (valid && $startDateRow.hasClass('error') && $('#SURVEY_DATESTART').val()) {
                            $startDateRow.removeClass('error').addClass('success');
                            $startDateRow.find('.errorMessage').remove();
                        }

                        return valid;
                    }
                    ]],
                    afterValidate:function($field, fieldConfig, valid, message, event){
                        _self.validator.validate($('#SURVEY_DATEEND').not($field), event, true);
                        return true;
                    },
                    messages:{custom:'Дата окончания не может быть раньше даты начала.'}
                }
            ]
        });
        
         
        $('.js-show-results').click(function(){
            var id = $(this).attr('href');
            if(!id)
                return;

            $.ajax({
                url:'/survey/result/id/'+id,
                type:'GET',
                success:function(response){
                    _self.showForm(id);
                    _self.showResult($('.js-survey-results'), response);
                },
                error:function(){

                }
            });
        });
        
        $('.js-get-report').click(function(){
            var id = parseInt($('input[type="hidden"][name="SURVEY[ID]"]').val());
            if(!id)
                return;
            window.location = '/cabinet/survey/report/id/'+id;
        });
    };

    /**
     * Function deletes node from tree
     * @param {integer} nodeId node id attribute
     * @returns {jqXHR} The jQuery XMLHttpRequest (jqXHR) object 
     */
    this.deleteRecord = function(recordId){
        if(!recordId){
            throw 'recordId id attribute is required.';
            return;
        }

        return $.ajax({
            url:'/cabinet/survey/delete/id/'+recordId,
            type:'DELETE',
            success: function(response){
                _self.afterDelete(response);
            }
        });
    };

    /**
     * Function shows manage form.
     * @returns {object} jQuery form object
     */
    this.showForm = function(recordId){
        $('.js-form-container').show();
        $('.js-survey-results').hide();

        if (typeof _self.formData != "undefined" && _self.formData != $('.js-form-container form').serialize()) {
            if (!confirm("Данные не будут сохранены, продолжить?"))
                return false;
        }

        if(!recordId){
            _self.hideForm();
            _self.itemsForm.update([{}]);
            $('.js-form-container').show();
            $('.js-form-header').html('Новый опрос');
            $('.js-get-report').hide();
            _self.resetForm();
            $('input[type="hidden"][name="SURVEY[ID]"]').val('');
        }
        else{
            _self.showWaitingCover($('.js-form-container'));
            $('.js-survey-results-wrap').show();
            $.ajax({
               url:'/cabinet/survey/get/id/'+recordId,
               type:'GET',
               success:function(response){
                    _self.hideForm();
                    $('.js-form-container').show();
                    _self.fillForm(response, '[name="SURVEY[{{key}}]"]');

                    response.ITEMS = response.ITEMS || [{}];
                    _self.itemsForm.update(
                        response.ITEMS.filter(function(value){
                            return value.TYPE != 2;
                        })
                    );

                    $('.js-form-header').html(response.NAME);
                    _self.hideWaitingCover($('.js-form-container'));
                    
                    $('.js-get-report').show().attr('href', '/cabinet/survey/report/id/'+recordId);
                    _self.validator.update();
                   _self.formData = $('.js-form-container form').serialize();
               }
            });
        }
        return $('.js-form-container');
    };

    /**
     * Function validate and sends data to server.
     * @returns {boolean} wheather data is valid
     */
    this.submitForm = function(){
        if(!this.validateForm())
            return;

        _self.showWaitingCover($('.js-form-container'));
        var id = parseInt($('input[type="hidden"][name="SURVEY[ID]"]').val());
        var data = _self.$form.serializeJSON();
        $.ajax({
            url:'/cabinet/survey/save',
            type: "POST",
            data:data,
            success:function(response){
                _self.updateGrid();
                _self.afterSave(response);
            },
            error:function(httpResponse){
                _self.hideWaitingCover($('.js-form-container'));
                if(httpResponse.responseJSON.error){
                    var message = _self.getErrorsFromResponse(httpResponse.responseJSON);
                    alert(message);
                }
            }
        });
    };

    this.afterSave = function(response){
        _self.formData = undefined;
        this.showForm(response.ID);
        _self.hideWaitingCover($('.js-form-container'));
    };

    this.afterDelete = function(response){
        if($('[name="SURVEY[ID]"]').val() == response.id){
            this.hideForm();
        }
        _self.updateGrid();
    };
    
    /**
     * Funcrtion validates data and show errors if they exist.
     * @returns {boolean} wheather data is valid
     */
    this.validateForm = function(){
        var _self = this;
        var valid = true;
        if(_self.validator)
            valid = _self.validator.validate();
        
        if(valid && $('[name^="SURVEY[ITEMS]"][type="text"]').length<2){
            alert('Вариантов ответа не может быть меньше двух.');
            valid = false;
        }
        
        return valid;
    };
    
    this.showResult = function($container, result){
        if(!$container.length){
            return false;
        }
        $container.empty().show();

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
	        exporting: {
		        buttons: {
			        contextButton: {
				        enabled: false
			        },
			        pngButton: {
				        text: 'PNG',
				        _titleKey: 'downloadAsPNG',
				        onclick: function() {
					        this.exportChart({type: 'image/png'});
				        }
			        }
		        }
	        },
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
                    align: 'middle'
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
                enabled: false
            },
            credits: {
                enabled: false
            },
            series: series
        });
        return true;
    };
    
    _self.init();
};