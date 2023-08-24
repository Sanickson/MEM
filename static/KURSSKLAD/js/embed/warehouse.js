;(function ($) {

	var $selectWarehouse;

	function listWarehouses () {

		$.blockUI && $.blockUI({message: 'Получение списка складов'});

		$.ajax({
			url: 'coreQUserWareHouses',
			dataType: 'json',
			success: function (json) {
				var html = '';
				var selectedID;

				$.each(json.data, function (key, item) {

					html += '<option value=' + item.WHID + '>' + item.WHNAME + '</option>';
					if (item.ISACTIVE == 1) {
						selectedID = item.WHID;
					}
				});
				$selectWarehouse.html(html);
				$selectWarehouse.val(selectedID);

				$.unblockUI && $.unblockUI();
			},
			async: false
		});

	}

	$.fn.selectWarehouse = function () {
		$selectWarehouse = this;
		listWarehouses();

		return $selectWarehouse;
	};

	$('#labelWH').is('label') ? $('#labelWH').html('<b>Склад</b>:') : $('#labelWH').text('Склад');
})(jQuery);