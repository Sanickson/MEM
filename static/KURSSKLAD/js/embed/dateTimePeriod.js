;(function ($) {
	var prefix = 'dtPeriod';
	var $BDate, $BTime, $EDate, $ETime;

	var dayMilliseconds = 1000 * 60 * 60 * 24;
	var today = new Date();
	var yesterday = new Date(today.valueOf() - dayMilliseconds);

	var arr = [
		{
			code: 'hands',
			name: 'Ввод режима вручную',
			enabled: {BDate: true, BTime: true, EDate: true, ETime: true},
			sets: {BTime: false, ETime: false, BDate: false, BEnd: false}
		},
		{
			code: 'yesterday',
			name: 'Вчера',
			enabled: {BDate: true, BTime: false, EDate: false, ETime: false},
			sets: {
				BDate: $.datepicker.formatDate('dd.mm.yy', yesterday), BTime: '08:00:00',
				EDate: $.datepicker.formatDate('dd.mm.yy', today), ETime: '07:59:59'
			}
		},
		{
			code: 'dayshift',
			name: 'Дневная смена',
			enabled: {BDate: true, BTime: false, EDate: false, ETime: false},
			sets: {BTime: '08:00:00', ETime: '19:59:59', BDate: false, EDate: '='}
		},
		{
			code: 'nightshift',
			name: 'Ночная смена',
			enabled: {BDate: true, BTime: false, EDate: false, ETime: false},
			sets: {BTime: '20:00:00', ETime: '07:59:59', BDate: false, EDate: '+1'}
		}
	];


	function DSet($Dto, $Dfrom, rule){
		if (/^\+\d+/.test(rule)) {
			var r1 = rule.substring(1);
			var d = new Date($Dfrom.datepicker('getDate').valueOf() + r1 * dayMilliseconds);
			$Dto.val($.datepicker.formatDate('dd.mm.yy', d));
		}
		else if (/^\-\d+/.test(rule)) {
			var r = rule.substring(1);
			var d = new Date($Dfrom.datepicker('getDate').valueOf() - r * dayMilliseconds);
			$Dto.val($.datepicker.formatDate('dd.mm.yy', d));
		}
		else if (rule === '=') {
			$Dto.val($Dfrom.val());
		}
		else {
			$Dto.val(rule);
		}
	};

	$.fn.dateTimePeriod = function(O){
		var O = $.extend({
			defCode: false,
			addNames: false
		}, O);
		$.datepicker.setDefaults($.extend($.datepicker.regional['ru']));

		var $this = $(this);
		for (var i=0; i<arr.length; i++){
			$this.append('<option value="' + i + '">' + arr[i].name + '</option>');
		}
		
		$BDate = $('#'+prefix+'BDate');
		if (!$BDate.length){
			$this.after('&nbsp;<input type=text size=7 id="' + prefix + 'BDate"' + (O.addNames ? ' name=bdate>' : '') + '>');
			$BDate = $('#' + prefix + 'BDate');
			$BDate.datepicker().mask("99.99.9999").val($.datepicker.formatDate('dd.mm.yy', yesterday));
		}

		$BTime = $('#' + prefix + 'BTime');
		if (!$BTime.length) {
			$BDate.after('<input type=text size=5 id="' + prefix + 'BTime"' + (O.addNames ? ' name=btime>' : '') + '>');
			$BTime = $('#' + prefix + 'BTime');
			$BTime.mask('99:99:99').val('00:00:00');
		}

		$EDate = $('#' + prefix + 'EDate');
		if (!$EDate.length) {
			$BTime.after('&nbsp;<input type=text size=7 id="' + prefix + 'EDate"' + (O.addNames ? ' name=edate>' : '') + '>');
			$EDate = $('#' + prefix + 'EDate');
			$EDate.datepicker().mask("99.99.9999").val($.datepicker.formatDate('dd.mm.yy', today));
		}

		$ETime = $('#' + prefix + 'ETime');
		if (!$ETime.length) {
			$EDate.after('<input type=text size=5 id="' + prefix + 'ETime"' + (O.addNames ? ' name=etime' : '') + '>');
			$ETime = $('#' + prefix + 'ETime');
			$ETime.mask('99:99:99').val('00:00:00');
		}

		$this.change(function(){
			var arrItem = arr[$(this).val()];

			arrItem.enabled.BDate === true ? $BDate.removeAttr('disabled') : $BDate.attr('disabled', 'disabled');
			arrItem.enabled.BTime === true ? $BTime.removeAttr('disabled') : $BTime.attr('disabled', 'disabled');
			arrItem.enabled.EDate === true ? $EDate.removeAttr('disabled') : $EDate.attr('disabled', 'disabled');
			arrItem.enabled.ETime === true ? $ETime.removeAttr('disabled') : $ETime.attr('disabled', 'disabled');

			if (arrItem.sets.BDate !== false || arrItem.sets.EDate !== false){
				if (arrItem.sets.BDate === false) {
					DSet($EDate, $BDate, arrItem.sets.EDate);
				}
				else if (arrItem.sets.EDate === false) {
					DSet($BDate, $EDate, arrItem.sets.BDate);
				}
				else {
					$BDate.val(arrItem.sets.BDate);
					$EDate.val(arrItem.sets.EDate);
				}
			}

			if (arrItem.sets.BTime)
				$BTime.val(arrItem.sets.BTime);

			if (arrItem.sets.ETime)
				$ETime.val(arrItem.sets.ETime);
		});

		if (O.defCode){
			for (var i=0; i<arr.length; i++){
				if (arr[i].code == O.defCode){
					$this.val(i).change();
					return $this;
				}
			}
		}

		return $this;
	};

	$.dateTimePeriodElement = function(code){
		switch (code.toLowerCase()) {
			case 'btime':
				return $BTime;
			case 'bdate':
				return $BDate;
			case 'etime':
				return $ETime;
			case 'edate':
				return $EDate;
			default:
				return false;
		}
	};
})(jQuery);

