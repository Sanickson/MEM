;(function ($) {

	var $selectTUMixType;
	var lastParam = {};

	function listTUMixType (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Получение типов ТЕ'});

		$.ajax({
			url: 'listTUMixTypes',
			dataType: 'json',
			data: O,
			success: function (json) {
				var html = '<option value="Null">Все виды</option>' +
					        '<option disabled>-------------------------</option>';

				$.each(json.data, function (key, item) {
						html += '<option value=' + item.ID + '>' + item.NAME + '</option>';
				});
				$selectTUMixType.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			},
			async: false
		});
	}

	$.fn.selectTUMixType = function () {
		$selectTUMixType = this;
		listTUMixType();
		return $selectTUMixType;
	};
	
})(jQuery);