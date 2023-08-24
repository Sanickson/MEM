;(function ($) {

	var $selectSiteZone;
	var lastParam = {};

	function listSiteZone (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Получение ЗМП'});

		$.ajax({
			url: 'listZone',
			dataType: 'json',
			data: O,
			success: function (json) {
				var html = '<option value="None">Все зоны</option>' +
					        '<option disabled>-------------------------</option>';
				var selectedID;

				$.each(json.data, function (key, item) {
					if (O.whid == item.OBJID) {
						html += '<option value=' + item.ZONEID + '>' + item.ZONENAME + '</option>';
						//if (json.ext_data.ZONEID == item.ZONEID) {
						//	selectedID = item.ZONEID;
						//}
					}
				});
				$selectSiteZone.html(html);
				//$selectSiteZone.val(selectedID);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			},
			async: false
		});
	}

	/*$.fn.changeSiteZone = function () {
		this.change(function () {
			var O = {};
			O[$(this).attr('name')] = $(this).val();
			listSiteZone(O);
		}).change();
		return this;
	};*/

	$.fn.changeSiteZone = function () {
		function change(){
			var O = {};
			O[$(this).attr('name')] = $(this).val();
			listSiteZone(O);
		}
		this.change(change);
		change.call(this);
		return this;
	};
    

	$.fn.selectSiteZone = function () {
		$selectSiteZone = this;
		return $selectSiteZone;
	};

	$('#labelSZ').is('label') ? $('#labelSZ').html('<b>ЗМП</b>:') : $('#labelSZ').text('Зона МП');
})(jQuery);