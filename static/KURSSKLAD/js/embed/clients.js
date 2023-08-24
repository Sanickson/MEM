/**
 * Created by kashko.iu on 18.01.2017.
 */
;(function ($) {

	var $selectClient;
	var lastParam = {};

	function listClient (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Построение списка клиентов'});

		$.ajax({
			url: 'clientListReference',
			dataType: 'json',
			data: O,
			success: function (json) {
				var sCnt = 0;
				var html = '';

				$.each(json.data, function (key, item) {

						sCnt += parseInt(item.CLPALCNT, 10);
						html += '<option value=' + item.TOID + '> ' + item.TONAME +':  '+ item.EXTID + '</option>';

				});
				html = '<option value="0">Все клиенты   ' + ' </option>' +
			    '<option disabled>-------------------------</option>' + html;
				$selectClient.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			}
		});
	}

	// $.fn.changeListClient = function () {
	// 	this.change(function () {
	// 		var O = {};
	// 		O[$(this).attr('name')] = $(this).val();
	// 		listClient(O);
	// 	}).change();
	// 	return this;
	// };
	$.fn.changeListClient = function (callChg) {
		 function change(){
			  var O = {};
			  O[$(this).attr('name')] = $(this).val();
			  listClient(O);
		 }
		 this.change(change);
		 if(callChg){ //чтобы не было множественного вызова
			 change.call(this);
		 }
		 return this;
	};

	$.fn.selectClient = function () {
		$selectClient = this;
		return $selectClient;
	};

})(jQuery);
