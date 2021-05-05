$(function($){
		$.datepicker.regional['ru'] = {
		closeText: 'Закрыть',
		prevText: 'Предыдущий',
		nextText: 'Следующий',
		currentText: 'Текущая дата',
		monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
		'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
		monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн',
		'Июл','Авг','Сен','Окт','Ноя','Дек'],
		dayNames: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота',],
		dayNamesShort: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб',],
		dayNamesMin: ['В','П','В','С','Ч','П','С',],
		weekHeader: 'Неделя',
		dateFormat: 'dd.mm.yy',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''};

	$.datepicker.setDefaults($.datepicker.regional['ru']);
});