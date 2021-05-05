function ManagerPrototype(){

    var _self = this;

    this.deleteConfirmation = "Вы уверены, что хотите удалить запись?";

    this.formSelector = '.js-form-container';

    this.$form = $(_self.formSelector+' form');

    this.init = function(){
        _self = this;

        $('.js-create-record').on('click', function(){
            _self.showForm();
            return false;
        });

        $('.js-close-form').on('click', function(){
            _self.hideForm();
            return false;
        });

        $('.js-manage-form').on('submit', function(){
            _self.submitForm();
            return false;
        });

        $(document).on('click', '.js-edit-record', function(){
            _self.showForm($(this).attr('href'));
            return false;
        });

        $(document).on('click', '.js-delete-record', function(){
            if(confirm(_self.deleteConfirmation)){
                _self.deleteRecord($(this).attr('href'));
            }
            return false;
        });
    };

    /**
     * Function updates grid and call <code>afterUpdateGrid()</code> callback
     * @returns {undefined}
     */
    this.updateGrid = function(){
        var _self = this;
        $('#'+_self.gridId).yiiGridView('update');
        if(typeof _self.afterUpdateGrid === 'function'){
            _self.afterUpdateGrid();
        }
    };

    /**
     * Function hides manage form.
     * @returns {object} jQuery form object
     */
    this.hideForm = function(){
        var _self = this;
        _self.resetForm();
        $(_self.formSelector).hide();
        return $(_self.formSelector);
    };

    /**
     * Function resets all form inputs
     * @returns {object} jQuery form object
     */
    this.resetForm = function(){
        var _self = this;
        _self.$form[0].reset();
        _self.$form.find('js-record-id').val('');
        if(_self.fileUploader)
            _self.fileUploader.reset();
        if(_self.validator)
            _self.validator.resetAllFields();
        
        
        _self.$form.find('.row').removeClass('error').removeClass('success');
        return $(_self.formSelector);
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
        return valid;
    };

    /**
     * Funcrion initialize datepickers
     * @param {string} datepicker element selector
     * @param {object} options
     * @returns {object} jQuery input element
     */
    this.initDatepickers = function(selector, options){
        if(!options) 
            options = {};
        var defaultOptions = {
            format:'dd.mm.yyyy',
            forceParse:true,
            multidate:false,
            autoclose:true,
            multidateSeparator:"",
            keyboardNavigation:false,
            language:'ru',
            clearBtn:true
        };
        options = $.extend(true, defaultOptions, options);
        return $(selector).datepicker(options);
    };

    /**
     * Function fill form from data parameter 
     * @param {object} data key - value pairs
     * @param {string|function} inputSelectorTemplate for input. 
     * @param {object} form jQuery form element.
     * If string then {{key}} pattern will be replaced by data key name.
     * @returns {object} jQuery form element.
     */
    this.fillForm = function(data, inputSelectorTemplate, form){
        if(typeof inputSelectorTemplate === 'undefined'){
            inputSelectorTemplate = '{{key}}';
        }
        if(typeof form === 'undefined'){
            form = $(_self.formSelector+' form');
        }

        $.each(data, function(key, val){
            if(typeof val !== 'string') return;

            var selector = getSelector(key);
            var $input = form.find(selector);
            if( 
                $input.length === 2 && 
                $input.filter('[type="checkbox"]').length && 
                $input.filter('[type="hidden"]').length
            ){
                var $checkbox = $input.filter('[type="checkbox"]');
                $checkbox[0].checked = ($checkbox.val() == val);
                $checkbox.trigger('change');
            }
            else if($input.length){
                $input.val(val);
            }
        });

        function getSelector(key){
            if(typeof inputSelectorTemplate === 'function'){
                return inputSelectorTemplate(key);
            }
            else{
                return inputSelectorTemplate.replace('{{key}}', key );
            }

            return inputSelectorTemplate;
        }
        
    };
    
    /**
     * Funtion shows waiting cover
     * @param {object} $container element to append waiting cover;
     * @param {Function} callback Function;
     * @return void
     */
    this.showWaitingCover = function($container, callback){
        if(!$container || (!!$container.length && $container.length==0)){
            $container = _self.$Wrapper.find('form');
        }
        this.hideWaitingCover($container);
        var $elem = $('<div class="waiting js-waiting"></div>');
        $container.prepend($elem);
        if(typeof callback == 'function') callback($elem);
    };

    /**
     * Funtion hides waiting cover
     * @param {object} $container element to remove waiting cover;
     * @param {Function} callback Function;
     * @return void
     */
    this.hideWaitingCover = function($container, callback){
        if(!$container || (!!$container.length && $container.length==0)){
            $container = _self.$Wrapper.find('form');
        }
        $container.children(".js-waiting").remove();
        if(typeof callback == 'function') callback();
    };

    this.getErrorsFromResponse = function(response){
        var message = "";
        $.each(response.error, function(key, value){
            if($.isArray(value)){
                message +=value.join("\n\r")+"\n\r";
            }
            else if(typeof value == 'string'){
                message +=value+"\n\r";
            }
        });
        return message;
    };
    
    this.init();
};

