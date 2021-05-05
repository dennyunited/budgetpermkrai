var exportingSettings = {
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
};