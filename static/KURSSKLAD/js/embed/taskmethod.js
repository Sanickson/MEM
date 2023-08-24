;(function ($) {

	var $selectMethod;
	var lastParam = {};

	function listMethod (O) {
		var O = $.extend(lastParam, O);
		$.blockUI && $.blockUI({message: 'Получение списка методов'});

		$.ajax({
			url: 'qTaskMethod',
			dataType: 'json',
			data: O,
			success: function (json) {
				var html = '<option value="None">Без фильтра</option>' +
				           '<option disabled>------------------------------</option>';
				$.each(json.data, function (key, item) {
					html += '<option value=' + item.ID + '>' + item.CODE + ': ' + item.NAME + '</option>';
				});
				$selectMethod.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			},
			async: false
		});

	}

	$.fn.selectMethod = function (json) {
		$selectMethod = this;
		var O = {};
		if (json)
			O = json;

		listMethod(O);

		return $selectMethod;
	};
	
})(jQuery);