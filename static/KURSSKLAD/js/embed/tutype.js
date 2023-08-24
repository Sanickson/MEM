;(function ($) {

	var $selectTUType;
	var lastParam = {};

	function listTUType (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Получение типов ТЕ'});

		$.ajax({
			url: 'listTUtypes',
			dataType: 'json',
			data: O,
			success: function (json) {
				var html = '<option value="Null">Все виды</option>' +
					        '<option disabled>-------------------------</option>';

				$.each(json.data, function (key, item) {
						html += '<option value=' + item.TUTID + '>' + item.NAME + '</option>';
				});
				$selectTUType.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			},
			async: false
		});
	}

	$.fn.changeTUType = function (callChg) {
		 function change(){
			  var O = {};
			  O[$(this).attr('attr-name')] = $(this).attr("checked") ? 1 : 'None';
			  listTUType(O);
		 }
		 this.change(change);
		 if(callChg){ //чтобы не было множественного вызова
			 change.call(this);
		 }
		 return this;
	};

	$.fn.selectTUType = function () {
		$selectTUType = this;
		//listTUType();
		return $selectTUType;
	};
	
})(jQuery);