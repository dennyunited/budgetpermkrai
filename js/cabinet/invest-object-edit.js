function InvestObjectManager(){
    var _self = this;

    this.selectedGeoObject;
    this.coordinate;
    this.actionsObject;

    ymaps.ready(init);
    function init() {
        $('select.chosen').chosen({width: "100%"});
        $('form#invest-object-form').keydown(function(event){
            if(event.keyCode == 13) {
                event.preventDefault();
                return false;
            }
        });

        var addresses = new ymaps.GeoObjectCollection();

        _self.coordinate = _self.getInputValue('INVESTOBJECTS_COORDINATE');

        var coords = _self.coordinate.split(' ');

        var centerCoord = [58.009, 56.235];
        var defaultZoom = 8;

        if(coords.length > 1) {
            centerCoord = [coords[1],coords[0]];
            defaultZoom = 10;
        }

        var myMap = new ymaps.Map('map', {
            center: centerCoord,
            zoom: defaultZoom,
            behaviors: ['default', 'scrollZoom']
        });

        myMap.geoObjects.add(addresses);

        var search = new ymaps.control.SearchControl({
            useMapBounds : true,
            noCentering : false,
            noPlacemark : true
        });

        myMap.controls
            .add(search, { right: 88, top: 5 })
            .add("zoomControl", {left: 5, top: 5})
            .add('mapTools', { left: 325, top: 5 });

        myMap.geoObjects.events.add('click', function (e) {
            if(e.get('target').geometry.getType() == "Point") {
                var coords = e.get('coords');
                _self.getGetPlacemark(myMap, coords);
            }
        });

        search.events.add("resultselect", function (e) {
            var results = search.getResultsArray(),
                selected = e.get('resultIndex'),
                point = results[selected].geometry.getCoordinates();
            _self.getGetPlacemark(myMap, point);
        });

        myMap.events.add('click', function (e) {
            var coords = e.get('coords');
            _self.getGetPlacemark(myMap, coords);
        });

        if(coords.length > 1) {
            _self.getGetPlacemark(myMap, coords.reverse(), true);
        }

        var selectedProgram = $('#INVESTOBJECTS_IDPROGRAM').find("option:selected");
        if(selectedProgram.length && selectedProgram.val().length){
            var id = selectedProgram.val();
            _self.refreshActions(id);
        }
        else{
            $('#INVESTOBJECTS_ACTION').prop('disabled', true);
            $('#INVESTOBJECTS_ACTION').trigger("liszt:updated");
        }

    }

    /**
     * check if object is created,
     * else create it
     */
    _self.getGetPlacemark = function (myMap, coords, notChangeAddress) {
        if (typeof(_self.selectedGeoObject) == 'object') {
            _self.selectedGeoObject.geometry.setCoordinates(coords);
        } else {
            var placemark = _self.createPlacemark(coords);
            myMap.geoObjects.add(placemark);
            placemark.events.add('dragend', function () {
                var coordinate = placemark.geometry.getCoordinates();
                _self.updateInputValues(coordinate);
            });
            placemark.events.add('beforedragstart', function () {
                _self._prevCoorinates = placemark.geometry.getCoordinates();
            });
            _self.selectedGeoObject = placemark;
        }

        if (typeof notChangeAddress != 'undefined' && notChangeAddress) {
            // координаты уже установлены. если не меняем адрес, то переписывать их нет нужны, иначе упрыгивают в Иран ))
            //_self.setCoordinateToInput(coords);
        }
        else
            _self.updateInputValues(coords);
    };

    _self.updateInputValues = function (coords) {
        _self.setCoordinateToInput(coords);
        _self.setAddressByCoordinate(coords);
    };

    _self.setCoordinateToInput = function (coordinate) {
        _self.setInputValue('INVESTOBJECTS_COORDINATE', coordinate.reverse().join(' '));
    };

    /**
     * set input value
     * @param inputId
     * @param val
     */
    _self.setInputValue = function (inputId, val) {
        var input = document.getElementById(inputId);
        input.value = val;
    };

    /**
     * get input value
     * @param inputId
     * @returns {Node.value|*}
     */
    _self.getInputValue = function (inputId) {
        var input = document.getElementById(inputId);
        return input !== undefined ? input.value : null;
    };

    _self.setAddressByCoordinate = function (coordinates) {
        ymaps.geocode(coordinates.reverse()).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);
            _self.setInputValue('INVESTOBJECTS_ADDRESS', firstGeoObject.properties.get('text'));
        });
    };

    /**
     * creates placemark by coordinates
     * return placemark object
     */
    _self.createPlacemark = function (coords) {
        return new ymaps.Placemark(coords, {
        }, {
            preset: 'twirl',
            draggable: true
        });
    };
    _self.refreshActions = function (id){
        var actionSelector = $('#INVESTOBJECTS_ACTION');
        $.ajax({
            url:'/cabinet/investobjects/getsubprogramsdata/programId/'+id,
            type:'GET',
            success:function(response){
                var newOption;
                _self.actionsObject = JSON.parse(response);


                actionSelector.empty(); //remove all child nodes
                newOption = $('<option value=""></option>');
                actionSelector.append(newOption);

                var selectedAction = $('#INVESTOBJECTS_NAME').val();
                var selectedText = '';

                $.each(_self.actionsObject, function(index, value) {

                    if(selectedAction.length && value.TITLE == selectedAction){
                        selectedText = 'selected';
                    }
                    else{
                        selectedText = '';
                    }
                    var newOption = $('<option value="' + index + '" ' + selectedText + '>' + value.TITLE + '</option>');
                    actionSelector.append(newOption);
                });
                actionSelector.prop('disabled', false);
                actionSelector.trigger("liszt:updated");
            },
            error:function(){

            }
        });
    };
    
    $('#INVESTOBJECTS_IDPROGRAM').on('change', function(){
        var id = $(this).val();
        $('#INVESTOBJECTS_NAME').val('');
        $('#INVESTOBJECTS_PLAN').val('');
        $('#INVESTOBJECTS_FACT').val('');
        $('#INVESTOBJECTS_IDACTION').val('');
		$('#INVESTOBJECTS_GRBS').val('');

        var actionSelector = $('#INVESTOBJECTS_ACTION');
        actionSelector.empty(); //remove all child nodes
        actionSelector.prop('disabled', true);
        actionSelector.trigger("liszt:updated");

        _self.refreshActions(id);
    });

    $('#INVESTOBJECTS_ACTION').on('change', function(){
        var activeItem = $(this).find("option:selected");
        var id = activeItem.val();
        var selectedAction = _self.actionsObject[id];

        $('#INVESTOBJECTS_NAME').val(selectedAction.TITLE);
        $('#INVESTOBJECTS_IDACTION').val(selectedAction.CODE);
        $('#INVESTOBJECTS_PLAN').val(selectedAction.PLAN);
        $('#INVESTOBJECTS_FACT').val(selectedAction.FACT);
		$('#INVESTOBJECTS_GRBS').val(selectedAction.GRBS);

    });
}