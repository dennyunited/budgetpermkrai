function MultipleForm(options){
    var _self = this;

    this.values = [[]];
    this.controlsNum = 0;

    if(!options.form){
        throw 'MultipleForm: form option does not set.';
    }

    this.defaultOptions = {
        form:null,
        addButtonSelector:'.js-multiple-form-add',
        removeButtonSelector:'.js-multiple-form-remove',
        onAdd:function(){},
        onRemove:function(){},
        afterUpdate:function(){},
        maxLength:5,
        template:
        '<div>\n\
            <div style="margin-bottom: 5px">\n\
                <div class="js-multiple-form multiple-form-wrapper">\n\
                    {{#each this}}\n\
                        <div class="multiple-form-row js-multiple-form-row" data-multiple_form_index="{{@index}}">\n\
                            <span title="Удалить" class="js-multiple-form-remove multiple-form-remove glyphicon glyphicon-remove"></span>\n\
                        </div>\n\
                    {{/each}}\n\
                </div>\n\
            </div>\n\
            {{#checkLength this}}\n\
            <span class="js-multiple-form-add btn btn-primary btn-xs">Добавить</span>\n\
            {{/checkLength}}\n\
        </div>'
    };
    function init(){
       _self.options = $.extend({}, _self.defaultOptions, options);

       _self.$template = $(_self.options.template);

       _self.$formWrapper = _self.$template.find('.js-multiple-form');

       _self.options.form.after(_self.$template);

        _self.$template.find('.js-multiple-form-row').prepend(_self.options.form);
        
        _self.$formWrapper.find(':input').each(function(){
            $(this).attr('name', $(this).attr('name').replace(/^([^\[]*)(.*?)(\[[^\[\]]*\])?$/, '$1$2[{{@index}}]$3') );
            var key = $(this).data('multiple_form_name');

            ($(this).prop("tagName") === 'TEXTAREA')?
                $(this).html("{{this.["+key+"]}}") :
                $(this).attr('value', "{{this.["+key+"]}}");
            _self.controlsNum++;
        });
        
        Handlebars.registerHelper('checkLength', function(data, options){
            if(data.length<_self.options.maxLength){
                return options.fn(this);
            };
            return;
        });
        _self.HandlebarsTemplate = Handlebars.compile(_self.$template.html());
        _self.$formWrapper.empty();

        _self.$template.on('click', _self.options.addButtonSelector, function(){

            _self.values.push(Array.apply(null, {length: _self.controlsNum}).map(function(){return ''}));
            _self.render();

            if(typeof _self.options.onAdd == 'function'){
                _self.options.onAdd();
            }
        });

        _self.$template.on('click', _self.options.removeButtonSelector, function(){
            _self.values.splice($(this).closest('.js-multiple-form-row').data().multiple_form_index, 1);
            _self.render();
            if(typeof _self.options.onRemove == 'function'){
                _self.options.onRemove();
            }
        });

        _self.$template.on('change', ':input', function(){
            var rowIndex = $(this).closest('.js-multiple-form-row').data().multiple_form_index;
            var inputIndex = $(this).data('multiple_form_name');
            _self.values[rowIndex][inputIndex] = $(this).val();
        });

        _self.render();
    };

    this.render = function(){
        var values = _self.values.slice(0, _self.options.maxLength);
        _self.$template.html(_self.HandlebarsTemplate(values));
    };

    this.update = function(values){
        if(!values)
            values = [];
        _self.values = values;
        _self.render();
        if(typeof _self.options.afterUpdate == 'function'){
            _self.options.afterUpdate();
        }
        return _self;
    };

    init();
};