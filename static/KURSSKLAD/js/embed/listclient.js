;(function ($) {

	var $selectClient;
	var lastParam = {};

	function listClient (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Построение списка клиентов'});

		$.ajax({
			url: 'palclientListCl',
			dataType: 'json',
			data: O,
			success: function (json) {
				var sCnt = 0;
				var html = '';

				$.each(json.data, function (key, item) {

						sCnt += parseInt(item.CLPALCNT, 10);
						html += '<option value=' + item.CLID + '>' + item.CLNAME + ' = ' + item.CLPALCNT + '</option>';

				});
				html = '<option value="0">Все клиенты =  ' + sCnt + ' </option>' +
			    '<option disabled>-------------------------</option>' + html;
				$selectClient.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			}
		});
	}

	$.fn.changeListClient = function () {
		this.change(function () {
			var O = {};
			O[$(this).attr('name')] = $(this).val();
			listClient(O);
		}).change();
		return this;
	};

	$.fn.selectClient = function () {
		$selectClient = this;
		return $selectClient;
	};
	
})(jQuery);