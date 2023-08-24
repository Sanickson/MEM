;(function ($) {

	var $selectCountry;

	function listCountry () {

		$.blockUI && $.blockUI({message: 'Получение списка стран'});

		$.ajax({
			url: 'qCountrySelect',
			dataType: 'json',
			success: function (json) {

				var html = '<option value="None">Без фильтра</option>' +
				           '<option disabled>------------------------------</option>';
				for (var i = 0 ; i < json.data.length ; i++) {
					var R = json.data[i];
					html += '<option value="' + R.COUNTRYID + '">' + R.NAME + '</option>';
				}
				$selectCountry.html(html);

				$.unblockUI && $.unblockUI();
			},
			async: false
		});

	}

	$.fn.selectCountry = function () {
		$selectCountry = this;

		listCountry();

		return $selectCountry;
	};
	
})(jQuery);