/**
 * Created by kashko.iu on 18.01.2017.
 */
;(function ($) {

	var $selectClientType;

	function listClientType () {
		$.blockUI && $.blockUI({message: 'Построение списка типов клиентов'});

		$.ajax({
			url: 'qClientTypeList',
			dataType: 'json',
			success: function (json) {
				var html = '';
				$.each(json.data, function (key, item) {
						html += '<option value=' + item.ID + '> ' + item.CODE +':  '+ item.NAME + '</option>';
				});
				html = '<option value="null">Все типы </option>' +
			    '<option disabled>-------------------------</option>' + html;
				$selectClientType.html(html);

				$.unblockUI && $.unblockUI();
			}
		});
	}

	$.fn.selectClientType = function () {
		$selectClientType = this;
		listClientType ();
		return $selectClientType;
	};

})(jQuery);
