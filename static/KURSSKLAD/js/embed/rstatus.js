;(function ($) {

	var $selectStatus;
	var lastParam = {};

	function listStatus (O) {
		var O = $.extend(lastParam, O);
		$.blockUI && $.blockUI({message: 'Получение списка статусов'});

		$.ajax({
			url: 'qListStatus',
			dataType: 'json',
			data: O,
			success: function (json) {
				var html = '<option value="None">Без фильтра</option>' +
				           '<option disabled>------------------------------</option>';
				$.each(json.data, function (key, item) {
					html += '<option value=' + item.CODE + '>' + item.NAME + '</option>';
				});
				$selectStatus.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			},
			async: false
		});

	}

	$.fn.selectStatus = function (json) {
		$selectStatus = this;
		var O = {};
		if (json)
			O = json;

		listStatus(O);

		return $selectStatus;
	};
	
})(jQuery);