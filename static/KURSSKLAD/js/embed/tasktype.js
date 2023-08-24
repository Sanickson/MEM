;(function ($) {

	var $selectTasktype;

	function listTasktype () {

		$.blockUI && $.blockUI({message: 'Получение типов заданий'});

		$.ajax({
			url: 'coreQTaskTypeList',
			dataType: 'json',
			success: function (json) {
				var html = '<option value="None">Без фильтра</option>' +
				           '<option disabled>------------------------------</option>';
				$.each(json.data, function (key, item) {
					html += '<option value=' + item.ID + '>' + item.NAME + '</option>';
				});
				$selectTasktype.html(html);

				$.unblockUI && $.unblockUI();
			},
			async: false
		});
	}

	$.fn.selectTasktype = function () {
		$selectTasktype = this;

		listTasktype();

		return $selectTasktype;
	};

})(jQuery);