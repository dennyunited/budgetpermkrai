/**
 * $("[textarea selector]").autogrow();
 * $("[textarea selector]").autogrow({threshold: 20, max: 300});
 * $("[textarea selector]").autogrow({threshold: 20, x: 4});
 * $("[textarea selector]").autogrow({animate: false});
 * $("[textarea selector]").autogrow({animate: 300});
 */
(function($) {
	$.fn.autogrow = function(options) {

		options = $.extend({threshold: 16, x: 6, animate: 200}, options);
		processOptions(options);

		this.filter('textarea').each(function() {
			var $t          = $(this),
				minHeight   = $t.height(),
				maxHeight 	= (minHeight * options['x']) || options['max'] || 9999;

			var $shadow = $('<div></div>').css({
				position:   'absolute',
				top:        -9999,
				left:       -9999,
				width:      $t.width(),
				fontSize:   $t.css('fontSize'),
				fontFamily: $t.css('fontFamily'),
				lineHeight: $t.css('lineHeight'),
				resize:     'none'
			}).appendTo(document.body);

			var times = function(string, number) {
				for (var i = 0, r = ''; i < number; i++)
					r += string;
				return r;
			}

			var update = function() {
				var val = this.value.replace(/</g, '&lt;')
									.replace(/>/g, '&gt;')
									.replace(/&/g, '&amp;')
									.replace(/\n/g, '<br/>')
									.replace(/\s{2,}/g, function(space) {
										return times('&nbsp;', space.length - 1) + ' '
									});
				$shadow.html(val);
				var height = Math.max($shadow.height() + options["threshold"], minHeight);
				if (height < maxHeight) {
					if (options['animate'])
						$t.stop().animate({'height' : Math.max($shadow.height() + options["threshold"], minHeight)}, options['animate'] || 200);
					else
						$t.height(Math.max($shadow.height() + options["threshold"], minHeight));
				}
			}

			$t.keydown(update).keyup(update).keypress(update).change(update).change();
		});

		function processOptions(options) {
			options.x = parseInt(options.x);
			options.threshold = parseInt(options.threshold);
			options.max = parseInt(options.max);
		}

		return this;
	}
})(jQuery);