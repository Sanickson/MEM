;(function ($) {

	var $selectWScales;
	var lastParam = {};

	function listWScales (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Получение списка весов'});

		$.ajax({
			url: 'qObjScaleList',
			dataType: 'json',
			data: O,
			success: function (json) {
				var html = '<option disabled>Выберите весы</option>';

				$.each(json.data, function (key, item) {
						html += '<option value=' + item.ID + '>' + item.NAME + '</option>';
				});
				$selectWScales.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			},
			async: false
		});
	}

	// $.fn.changeWScale = function () {
	// 	this.change(function () {
	// 		var O = {};
	// 		O[$(this).attr('name')] = $(this).val();
	// 		listWScales(O);
	// 	}).change();
	// 	return this;
	// };
	$.fn.changeWScale = function () {
		 function change(){
			  var O = {};
			  O[$(this).attr('name')] = $(this).val();
			  listWScales(O);
		 }
		 this.change(change);
		 change.call(this);
		 return this;
	};

	$.fn.selectWScale = function () {
		$selectWScales = this;
		return $selectWScales;
	};
	
})(jQuery);