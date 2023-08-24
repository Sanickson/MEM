;(function ($) {

	var $selectTruck;
	var lastParam = {};

	function listTruck (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Построение списка транспортных компаний'});

		$.ajax({
			url: 'qListTruck',
			dataType: 'json',
			// data: O,
			success: function (json) {
				var sCnt = 0;
				var html = '';

				$.each(json.data, function (key, item) {

						sCnt += parseInt(item.TRUCKID, 10);
						html += '<option value=' + item.TRUCKID + '>' + item.NAME + '</option>';

				});
				html = '<option value="None">Все ТК =  ' + sCnt + ' </option>' +
			    '<option disabled>-------------------------</option>' + html;
				$selectTruck.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			}
		});
	}

	$.fn.selectTruck = function () {
		$selectTruck = this;
		listTruck();
		return $selectTruck;
	};
	
})(jQuery);