function FormValidator($form, options){
    /**
     * Function bind events to fields
     */
    function bindEvents(validator){
        var _self = validator,
            defaultOptions = {
                showMessage:true,
                messageDelimeter:'<br>'
            };
        _self.fields = [];

        //Unbind all validator events from fields
        $.each(options.fields, function(index, fieldConfig){
            if(!fieldConfig || !fieldConfig.selector){
                throw 'Field config has no \'selector\' attribute.'
            }
            if(!fieldConfig || !fieldConfig.rules){
                throw 'Field config has no \'rules\' attribute.'
            }
            if(!fieldConfig || !$.isArray(fieldConfig.rules)) {
                throw 'Field \'rules\' attribute should be an array.'
            }

            var $fields = $form.find(fieldConfig.selector);

            $fields.off('.'+_self.eventNamespace);
            $(document).off('.'+_self.eventNamespace);
        });

        //Bind validator events to fields
        $.each(options.fields, function(index, fieldConfig){

            var $fields = $form.find(fieldConfig.selector);
            $fields.each(function(){
                var $field = $(this);
                var fullFieldConfig = $.extend(true, {}, defaultOptions, fieldConfig, {element:$field});

                _self.fields.push( fullFieldConfig );
                if(fieldConfig.events){
                    $field.on(_self.renameEvents(fieldConfig.events), function(event){
                        var $element = $(this);
                        _self.validate($element, event);
                    });
                }
            });

        });
    };

    var validator = {
       /**
        * Validator config 
        * @type object
        * @example
        * <pre>
        * {
        *   fields:[
        *       {
        *           selector:"#inputId", //input selector
        *           rules:['required', 'integer', 'numeric', 'email', ['match','[\s,]+/', 'gi'], ['custom', function($element, fieldConfig){
        *           
        *           }] //validate rules array
        *           events:"blur click", //validate events,
        *           showMessage:"true", //whether show error message 
        *           messages:{require:"Field is require", integer:"Only integers"},
        *           beforeValidate:function($element, elementConfig, event){}, //Callback will be raised before field validation. 
        *                                                                 If function return false, validation will not be performed.
        *           afterValidate:function($element, elementConfig, valid, message, event){} //Callback will be raised after field validation. 
        *                                                                               If function return false, then fields will not be marked as wrong.
        *       }
        *   ],
        * }
        * </pre>
        */
        options:{},

       /**
        * Form fields data
        * @type array   
        */
        fields:[],

        /**
         * Default error messages
         */
        messages:{
            required:'Поле обязательно для заполнения',
            integer:'Поле может содержать только числовое значение',
            email:'Неправильно задана электронная почта',
            integer:'Значение должно быть целым числом',
            numeric:'Значение должно быть числом',
            custom:'Неверное значение',
            minlength:'Минимальное количество симаолов - {minlength}',
            maxlength:'Максимальное количество симаолов - {maxlength}',
        },

        /*
         * Default error message
         */
        defaultErrorMessage: "invalid",

        /*
         * Class for the error field element
         */
        errorFieldClass: "error",

        /*
         * Class for the success field element
         */
        successFieldClass: "success",

        /*
         * Class for error message element
         */
        errorMessageClass: "errorMessage",

        /*
         * Tag name for error message element
         */
        errorMessageTagName: "span",

        /*
         * Event namespace name
         */
        eventNamespace: "FormValidator",

        /**
         * E-mail address validation regular expression
         */
        emailRegExpr:  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

        init: function (){
            var _self = this;            
            _self.options = $.extend(_self.options, options);

            $.each(options, function(index, option){
                if(index != 'fields' && _self.hasOwnProperty(index)){
                    _self[index] = option;
                }
            });

            bindEvents(_self);
        },

        /**
         * Function add namespaces to events
         * @example
         * <pre>
         * inpur: 'blure change'
         * output: 'blure.FormValidator change.FormValidator'
         * </pre>
         * @param {string} events space separated list
         * @returns {string} events with namespace
         */
        renameEvents: function(eventsList){
            var _self = this;
            var events = eventsList.split(/[\s,]+/);
            var result = [];
            $.each(events, function(index, event){
                result.push(event+"."+_self.eventNamespace);
            });
            return result.join(' ');
        },

        /**
         * Function updates validator.
         */
        update: function(){
            bindEvents(this);
        },

        /**
         * Function validates form or field if it passed as first param
         * @param {object} $field field for validation. 
         * @param {object} event Validation trigger event. 
         * @param {boolean} withoutCallback Whether call <code>beforeValidate</code> and <code>afterValidate</code> callbacks
         * If not passed fuction validate whole form.
         * @returns {boolean} Whether form or field is valid.
         */
        validate:function($field, event, withoutCallback){
            if(typeof withoutCallback == 'undefined'){
                withoutCallback = false;
            }
            var _self = this;
            var valid = true;
            var fieldsToValidate = [];
            if($field){
                $field.each(function(){
                    var filedConfig = _self.getFieldConfig($(this));
                    if(!$.isArray(filedConfig)){
                        filedConfig = [filedConfig];
                    }
                    $.each(filedConfig, function(key, config){
                        fieldsToValidate.push(config);
                    });
                });
            }
            else{
                fieldsToValidate = _self.fields;
            }

            if(typeof _self.beforeValidate === 'function' && !withoutCallback){
                _self.beforeValidate();
            }

            $.each(fieldsToValidate, function(key, fieldConfig){
                if(!fieldConfig || !fieldConfig.element) return;
                fieldConfig.element.data('formValidatorFieldIsValid', true);
            });
            $.each(fieldsToValidate, function(key, fieldConfig){
                var validField = true;

                if(!fieldConfig) return;

                var $element = fieldConfig.element;

                if(fieldConfig.beforeValidate && typeof fieldConfig.beforeValidate === 'function' && !withoutCallback){
                    if(!fieldConfig.beforeValidate.call(_self, $element, fieldConfig, event)) return;
                }

                var validator = _self.getValidator(fieldConfig.rules);

                var result = validator(fieldConfig);

                var message = "";
                $.each(result, function(index, error){
                    validField = validField && error.valid;
                    if(error.message){
                        message += error.message+fieldConfig.messageDelimeter;
                    }
                });

                $element.data('formValidatorFieldIsValid', ($element.data('formValidatorFieldIsValid') && validField));
                
                valid = valid && validField; 

                if(fieldConfig.afterValidate && typeof fieldConfig.afterValidate === 'function' && !withoutCallback){
                    if(!fieldConfig.afterValidate.call(_self, $element, fieldConfig, validField, message, event)) return;
                }

                if(!$element.data('formValidatorFieldIsValid')){
                    _self.markErrorField($element, message, fieldConfig, result);
                }
                else{
                    _self.unmarkErrorField($element, fieldConfig, result);
                }
            });

            if( typeof _self.afterValidate === 'function' && !withoutCallback)
                _self.afterValidate();

            return valid;
        },

        /**
         * Function marks error field (prepends error message element and appends class <code>this.errorClassName</code> to field element)
         * @param {string} error message
         * @param {object} jQuery field element object
         * @param {object} fieldOptions Field options
         * @param {object} result Validation result
         * @returns {object} jQuery field element object
         */
        markErrorField:function($field, message, fieldOptions, result){
            var _self = this;
            $field.parent().find('.'+_self.errorMessageClass).remove();
            $field.closest('.row').removeClass(_self.successFieldClass);
            if(message && fieldOptions.showMessage){
                _self.getErrorMessageElement(message).insertBefore($field);
            }
            $field.closest('.row').addClass(_self.errorFieldClass);
            return $field;
        },

        /**
         * Function umarks error field (remove error message element and this.errorClassName class to field element)
         * @param {object} jQuery field element object
         * @param {object} fieldOptions Field options
         * @param {object} result Validation result
         * @returns {object} jQuery field element object
         */
        unmarkErrorField:function($field, fieldOptions, result){
            var _self = this;
            $field.parent().find('.'+_self.errorMessageClass).remove();
            $field.closest('.row').removeClass(_self.errorFieldClass);
            $field.closest('.row').addClass(_self.successFieldClass);
            return $field;
        },

        /**
         * Function unmark all error and success fields
         * @returns {undefined}
         */
        resetAllFields:function(){
            var _self = this;
            $.each(_self.fields, function(key, $field){
                $field.element.closest('.form-group').removeClass(_self.errorFieldClass);
                $field.element.closest('.form-group').removeClass(_self.successFieldClass);
                $field.element.parent().find('.'+_self.errorMessageClass).remove();
            });
        },

        /**
         * Function returns error element based on this.errorMessageTagName and this.errorMessageClass
         * @see <code>this.errorMessageClass</code> and <code>this.errorMessageTagName</code>
         * @param (string) Error message text
         * @returns {object} jQuery error message object
         */
        getErrorMessageElement:function(message){
            var _self = this;
            return $('<'+_self.errorMessageTagName+' class="'+_self.errorMessageClass+'">'+message+'</'+_self.errorMessageTagName+'>')
        },

        /**
         * Function returns field config by jQuery field object
         * @param {object} $field jQuery field object
         * @returns {object|null} field config if exists
         */
        getFieldConfig:function($field){
            var _self = this;
            var fieldConfig = _self.fields.filter(function(field){
                return field.element[0] == $field[0];
            });
            if(fieldConfig.length == 1){
                return fieldConfig[0];
            }
            else if(fieldConfig.length > 1) {
                return fieldConfig;
            }
            return null;
        },

        /**
         * Function returns function for validate field by rules.
         * @param {string} rules  field object
         * @returns {function} validator
         */
        getValidator: function(rules){
            var _self = this;

            return function(fieldConfig){
                var result = {};

                $.each(fieldConfig.rules, function(index, rule){
                    var ruleName = $.isArray(rule)?rule[0]:rule;

                    var value = fieldConfig.element.val();
                    switch(ruleName){
                        case 'required':
                            if(value===''){
                                result['required'] = {valid:false, message:_self.getMessage(fieldConfig, 'required')};
                            }
                            break;
                        case 'email':
                            if(!_self.emailRegExpr.test(value)){
                                result['email'] = {valid:false, message:_self.getMessage(fieldConfig, 'email')};
                            }
                            break;
                        case 'match':
                            if(rule[1]){
                                var flags = rule[2]?rule[2]:'gi';
                                var regExpr = new RegExp(rule[1], flags);
                                if(!regExpr.test(value)){
                                    result['match'] = {valid:false, message:_self.getMessage(fieldConfig, 'match')};
                                }
                            }
                            break;
                        case 'integer':
                            if (value % 1 !== 0 ){
                                result['integer'] = {valid:false, message:_self.getMessage(fieldConfig, 'integer')};
                            }
                            break;
                        case 'numeric':
                            var val = _self.replaceComma(_self.replaceSpaces(value));
                            if ( isNaN(val) || !isFinite(val) ){
                                result['numeric'] = {valid:false, message:_self.getMessage(fieldConfig, 'numeric')};
                            }
                            break;
                        case 'custom':
                            if(rule[1] && typeof rule[1] == 'function' && !rule[1](fieldConfig.element, fieldConfig)){
                                result['custom'] = {valid:false, message:_self.getMessage(fieldConfig, 'custom')};
                            }
                            break;
                        case 'minlength':
                            if(rule[1] && isFinite(rule[1]) && value.length < rule[1]){
                                result['minlength'] = {valid:false, message:_self.getMessage(fieldConfig, 'minlength')};
                            }
                            break;
                        case 'maxlength':
                            if(rule[1] && isFinite(rule[1]) && value.length > rule[1]){
                                result['maxlength'] = {valid:false, message:_self.getMessage(fieldConfig, 'maxlength')};
                            }
                            break;
                    }
                });

                return result;
            };
        },
        /**
         * Function returns error message text by rule name
         * @param {object} fieldOptions Field options
         * @param {string} ruleName Name of validation rule
         * @returns {string} error message text
         */
        getMessage: function(fieldOptions, ruleName){
            if(fieldOptions.messages && typeof fieldOptions.messages[ruleName] == 'string')
                return fieldOptions.messages[ruleName];

            var message = this.messages[ruleName] || this.defaultErrorMessage;

            switch(ruleName){
                case 'minlength':
                    var ruleOptions = fieldOptions.rules.filter(function(rule){
                        return ($.isArray(rule) && rule[0] == 'minlength');
                    });
                    if(!!ruleOptions[0][1]){
                        message = message.replace("{minlength}", ruleOptions[0][1]);
                    }
                    break;
                case 'maxlength':
                    var ruleOptions = fieldOptions.rules.filter(function(rule){
                        return ($.isArray(rule) && rule[0] == 'maxlength');
                    });
                    if(!!ruleOptions[0][1]){
                        message = message.replace("{maxlength}", ruleOptions[0][1]);
                    }
                    break;
            }

            return message;
        },

        /**
         * Function replaces commas to the points in string.
         * @param {string} input String
         * @returns {string} output string
         */
        replaceComma: function(val) {
            return val.replace(',', '.');
        },

        /**
         * Function remove spaces form string.
         * @param {string} input String
         * @returns {string} output string
         */
        replaceSpaces: function(val) {
            return val.replace(/\s/gi, '');
        },

        /**
         * Before validate callback
         */
        beforeValidate: function(){
            return true;
        },
        /**
         * After validate callback
         * @param {object} valid Whether field value is valid
         */
        afterValidate: function(valid){
            return true;
        },
        destroy:function(){
            $('*').off('.'+this.eventNamespace);
        }


    };

    validator.init();
    return validator;
};