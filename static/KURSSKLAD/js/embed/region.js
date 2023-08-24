/**
 * Created by kashko.iu on 18.01.2017.
 */
;(function ($) {

	var $selectRegion;

	function listRegion () {

		$.blockUI && $.blockUI({message: 'Построение списка регионов'});

		$.ajax({
			url: 'qRegionList',
			dataType: 'json',
			success: function (json) {
				var html = '';

				$.each(json.data, function (key, item) {
						html += '<option value=' + item.ID + '> ' + item.CODE +':  '+ item.NAME + '</option>';

				});
				html = '<option value="null">Все регионы   ' + ' </option>' +
			    '<option disabled>-------------------------</option>' + html;
				$selectRegion.html(html);

				$.unblockUI && $.unblockUI();
			},
			async: false
		});
	}
	$.fn.selectRegion = function () {
		$selectRegion = this;
		listRegion ();
		return $selectRegion;
	};

})(jQuery);
