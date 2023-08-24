var tblCode = 'RSTORAGELIFE_FORECAST';
var tbl;

$(document).ready(function () {

	$.datepicker.setDefaults($.extend($.datepicker.regional['ru']));
	$('#bdate,#edate').datepicker().mask('99.99.9999');
	$('#bdate').val(kToday(-22));
	$('#edate').val(kToday(-1));

  $("#dvData").css({height: kScreenH(), width: "100%"});
  tbl = $('#dvData').Tbl({code: tblCode, rowFocus: true}); //определяем таблицу


	$("#frmFilter").unbind('submit').bind("submit", function () {

		tbl.empty();

		var params = $(this).kFormSubmitParam();
		delete params.bdate;
		delete params.edate;

		$.getJSON("qRestListWares", params, reportCreate);

		return false;
	});

	function reportCreate (json) {

		var jsonFull = {data: []};

		$.progressDo({
			arr: json.data,
			extParams: {
				bdate: $('#bdate').val(),
				edate: $('#edate').val(),
				whid: json.ext_data.WHID
			},
			arrNullAlert: 'Товары не найдены',
			url: 'qForecastWaresData',
			funcParams: function (item) {
				return {wid: item.WID};
			},
			funcIter: function (json) {
				for (var i = 0, len = json.data.length; i < len; i++) {
					jsonFull.data.push( json.data[i] );
				}
			},
			funcEnd: function () {
				tbl.data(jsonFull);
			}
		});
	}

});