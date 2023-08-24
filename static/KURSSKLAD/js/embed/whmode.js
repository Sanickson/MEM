;(function ($) {

	var $selectStorageMode;
	var lastParam = {};

	function listStorageMode (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Получение списка режимов хранения'});

		$.ajax({
			url: 'listObjModes',
			dataType: 'json',
			data: O,
			success: function (json) {
				var html = '<option value="None">Без фильтра</option>' +
				                '<option disabled>------------------------------</option>';
				$.each(json.data, function (key, item) {
					html += '<option value="' + item.MODEID + '">' + item.MODENAME + '</option>';
				});
				$selectStorageMode.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			},
			async: false
		});
	}

	/*$.fn.changeStorageMode = function () {
		this.change(function () {
			var O = {};
			O[$(this).attr('name')] = $(this).val();
			listStorageMode(O);
		}).change();
		return this;
	};*/

	$.fn.changeStorageMode = function () {
		function change(){
			var O = {};
			O[$(this).attr('name')] = $(this).val();
			listStorageMode(O);
        }
        this.change(change);
        change.call(this);
		return this;
	};

	$.fn.selectStorageMode = function () {
		$selectStorageMode = this;
		return $selectStorageMode;
	};

	$('#labelSM').is('label') ? $('#labelSM').html('<b>РХ</b>:') : $('#labelSM').text('Режим хранения');
})(jQuery);