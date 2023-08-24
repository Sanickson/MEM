;(function ($) {

	var $selectSelScheme;
	var lastParam = {};

	function listSelScheme (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Получение списка схем отборки товара'});

		$.ajax({
			url: 'qSchemeSelect',
			dataType: 'json',
			data: O,
			success: function (json) {
				var html = '<option value="None">Без фильтра</option>' +
				           '<option disabled>------------------------------</option>';
				for (var i = 0 ; i < json.data.length ; i++) {
					var R = json.data[i];
					html += '<option value="' + R.ID + '">' + R.CODE + '=' + R.NAME + '</option>';
				}
				$selectSelScheme.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			},
			async: false
		});
	}

	/*$.fn.changeSelScheme = function () {
		this.change(function () {
			var O = {};
			O[$(this).attr('name')] = $(this).val();
			listSelScheme(O);

		}).change();
		return this;
	};*/

	$.fn.changeSelScheme = function () {
        function change(){
            var O = {};
			O[$(this).attr('name')] = $(this).val();
			listSelScheme(O);
        }
		this.change(change);
        change.call(this);
		return this;
	};

	$.fn.selectSelScheme = function () {
		$selectSelScheme = this;
		return $selectSelScheme;
	}

	$('#labelSS').is('label') ? $('#labelSS').html('<b>СО</b>:') : $('#labelSS').text('Схема отборки');
})(jQuery);