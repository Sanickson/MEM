$(document).ready(function() {

	$('#selectWH').change(function () {
		var whid = $(this).val();
		$.blockUI({message: 'Получение списка групп отборки склада'});
		$.getJSON('qSelGroup', {objid: whid}, function (json) {
			var html = '<option value="None">Без фильтра</option>' +
			           '<option disabled>------------------------------</option>';
			for (var i = 0 ; i < json.data.length ; i++) {
				var R = json.data[i];
				html += '<option value="' + R.ID + '">' + R.CODE + '=' + R.NAME + '</option>';
			}
			$('#sgid').html(html);
			$.unblockUI();
			console.log("SG")
		});
	});
});
