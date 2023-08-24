;(function ($) {

	var $selectSelGroup;
	var lastParam = {};

	function listSelGroup (O) {
		//if (O.whid && lastParam.whid != O.whid) {
		//	O.whmodeid = "None";
		//}

		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Получение списка групп отборки склада'});

		$.ajax({
			url: 'qSelGroup',
			dataType: 'json',
			data: O,
			success: function (json) {
				var html = '<option value="None">Без фильтра</option>' +
				           '<option disabled>------------------------------</option>';
				for (var i = 0 ; i < json.data.length ; i++) {
					var R = json.data[i];
					html += '<option value="' + R.ID + '">' + R.CODE + '=' + R.NAME + '</option>';
				}
				$selectSelGroup.html(html);

				$.unblockUI && $.unblockUI();
				lastParam = O;
			},
			async: false
		});
	}

	/*$.fn.changeSelGroup = function (json) {
		var O = {};
		if (json)
			O = json;
		this.change(function () {
			O[$(this).attr('name')] = $(this).val();
			listSelGroup(O);
		}).change();
		return this;
	};
*/
	$.fn.changeSelGroup = function (callChg, json) {
		var O = {};
		if (json)
			O = json;
		function change(){
			O[$(this).attr('name')] = $(this).val();
			listSelGroup(O);        
        }
        this.change(change);
				if (callChg){
					change.call(this);
				}
		return this;
	};

	$.fn.selectSelGroup = function () {
		
		$selectSelGroup = this;
		return $selectSelGroup;
	};

	$('#labelSG').is('label') ? $('#labelSG').html('<b>ГО</b>:') : $('#labelSG').text('Группа отборки');
})(jQuery);