/**
 * Забирает данные, зашитые в страницу в виде структуры из дивов.
 * @param id String id дива с данными
 * @return Array массив со структурами данных
 */
function Legend(id) {
	id = id || 'legend-map-info'; var cssPrefix = 'legend-';
	console.log('Загрузка данных из #' + id);

	function isNaNinArr(arr) {
		for (var i in arr) {
			if (isNaN(arr[i]))
				return true;
		}
		return false;
	}

	var info = $('#' + id)[0];
	var $regions = $($('#map-perm')[0].contentDocument).find('#Regions g');
	var infos = [];
	for (var i = 0; i < $regions.length; i++) {
		var regid = $regions[i].id;
		var $infoDiv = $(info).children('#region-' + regid);
		if (!$infoDiv.length)
			continue;
		var title = $infoDiv.children('.' + cssPrefix + 'title').text();
		var federal = parseInt($infoDiv.children('.' + cssPrefix + 'federal').text());
		var regional = parseInt($infoDiv.children('.' + cssPrefix + 'regional').text());
		var municipal = parseInt($infoDiv.children('.' + cssPrefix + 'municipal').text());
		if (isNaNinArr([federal, regional, municipal]))
			continue;
		var budget = federal + regional + municipal;
		infos[regid] = {
			title: title, budget: budget,
			federal: federal, regional: regional, municipal: municipal
		};
		console.log(title + ' loaded successfully', infos[regid]);
	}
	return infos;
}