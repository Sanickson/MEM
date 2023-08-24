$(document).ready(function () {
	$('#dvMain, #dvDrivers').css({'width': '90%', 'height': kScreenH()});

	$.listDrivers = function () {
		$.getJSON('listDrivers', function (json) {
			if (!showErr(json)) {
				var html = '';
				for (var i = 0; i < json.data.length; i++) {
					var row = json.data[i];
					html += trDriver(row);
				}
				$('#tblDrivers tbody')
					.html(html)
					.closest('table')
					.kTblSorter()
					.rowFocus({rfSetDefFocus: true})
					.find('>tfoot>tr>th>button')
					.filter('.add').click(addDriver).end()
					.filter('.cng').click(cngDriver).end()
					.filter('.del').click(delDriver).end()
					.filter('.print').click(printDriver).end();


				$('#tblDrivers').kTblScroll();
			}
		})
	};

	function trDriver (row) {
		return '<tr driverid="' + row.DRIVERID + '">' +
		         '<td class="text">' + row.FIO + '</td>' +
		         '<td class="text">' + row.PHONE + '</td>' +
		         '<td class="text" truckid="'+row.TRUCKID+'">' + row.TRUCKNAME + '</td>' +
		       '</tr>';
	}
	
	function addDriver () {
		crudDialog({ title: 'Добавление Водителя' }, { frmSubmit: frmSubmit, btnConfTitle: 'Добавить' });

		function frmSubmit ( param ) {
			if (!param.truckid) {
				alert('Выберите транспортную компанию');
				return false;
			}
			param.fio = $.trim(param.fio.replace(/\s+/g,' '));

			$.getJSON("cngDriver", param, function ( json ) {
				if ( !showErr(json) ) {
					$('#tblDrivers>tbody')
						.append(trDriver(json.data[0]))
						.closest('table')
						.kTblSorter()
						.rowFocus({ rfSetDefFocus: true })

					$('#tblDrivers').kTblScroll();

					$("#dvDialog")
						.dialog("close");
				}
			});
		};
	}
	
	function cngDriver () {
		var driverid = $('#tblDrivers').rf$GetFocus().attr('driverid');
		var truckid = $('#tblDrivers').rf$GetFocus().find('td:last').attr('truckid');


		crudDialog(
			{title: 'Изменение Водителя'},
			{
				frmSubmit: frmSubmit,
				btnConfTitle: 'Изменить',
				driverid: driverid,
				truckid: truckid
			}
		);

		function frmSubmit ( param ) {
			if (!param.truckid) {
				alert('Выберите транспортную компанию');
				return false;
			}
			param.fio = $.trim(param.fio.replace(/\s+/g,' '));

			$.getJSON("cngDriver", param, function ( json ) {
				if ( !showErr(json) ) {
					$('#tblDrivers>tbody>tr[driverid="' + json.data[0].DRIVERID + '"]')
						.replaceWith(trDriver(json.data[0]));

					$('#tblDrivers')
						.kTblSorter()
						.rowFocus({ rfSetDefFocus: true });

				  $('#tblDrivers').kTblScroll();

					$("#dvDialog")
						.dialog("close");
				}
			});
		};
	}
	
	function delDriver () {
		var driverid = $('#tblDrivers').rf$GetFocus().attr('driverid');
		if (confirm('Удалить?')) {
			$.getJSON("delDriver", {driverid: driverid}, function (json) {
				if (!showErr(json)) {
					$('#tblDrivers>tbody>tr[driverid="' + json.ext_data.DRIVERID + '"]').remove();
					$('#tblDrivers')
						.kTblSorter().kTblScroll();;
				}
			});
		}
	}
	
	function printDriver () {
		
	}

	function crudDialog(dvOptions, dopOptions) {
		dvOptions = $.extend({
			closeOnEscape: false, title: '',
			autoOpen: true, resizable: false,
			draggable: false, modal: true,
			overlay: {opacity: 0.5, background: "black"},
			height: 310, width: 400
		}, dvOptions);
		dopOptions = $.extend({code: false, aid: false, frmSubmit: false, btnConfTitle: false}, dopOptions);

		if ($("#dvDialog").length) {
			$("#dvDialog").dialog("destroy").remove();
		}
		var params = {};

		if (dopOptions.driverid) {
			$.getJSON('listDrivers', {driverid: dopOptions.driverid}, function (json) {
				if (!showErr(json)) {
					createDvHTML(json.data[0]);

				}
			});
		}
		else {
			createDvHTML({'DRIVERID': 0, 'FIO': 0, 'PHONE':0, 'TRUCKID': 0});
		}

		function createDvHTML(DRV) {

			$.getJSON('listTruck',function(json) {
				if (!showErr(json)) {

					var html =
						'<form style="height: 220px">\
							<label class="lbl" for="name">ФИО</label>\
							&emsp;&emsp;&ensp;<input required style="width: 80%;" type="text" class="rght" name="fio" value="' + verifyVal(DRV.FIO) + '">\
							<br><br><label class="lbl" for="name">Контакты</label>\
							<input required style="width: 80%;" type="text" class="rght" name="phone" value="' + verifyVal(DRV.PHONE) + '">\
							<br><br>\
						   <table name="truckid" style="width: 100%; margin-bottom: 15px" id="tblTruckList"><thead><tr><th ksort="text">Транспортная компания</th></tr></thead><tbody></tbody></table>\
								<input type="hidden" name="driverid" value="' + verifyVal(DRV.DRIVERID) + '">\
								<div class="buttons">' +
									(dopOptions.btnConfTitle ? '<button type="submit" id="dvDocConfOk"><img src="' + eng_img + '/actions/accept.png" border="0">' + dopOptions.btnConfTitle + '</button>&nbsp;&nbsp;&nbsp;' : '') +
									'<button type="button" id="btnFilterClear"><img src="' + eng_img + '/actions/cancel.png" border="0">Отмена</button>\
								</div>\
						</form>';

					$('<div/>').attr("id", "dvDialog").addClass("flora")
						.css("text-align", "left")
						.dialog(dvOptions)
						.html(html)
						.find("button:last").click(function () {
						$("#dvDialog").dialog("close");
					}).end();

					$("#dvDialog > form")
						.kUpDown({selectOnFocus: true})
						.submit(function () {
							var param = $(this).kFormSubmitParam();
							var $tr = $('#tblTruckList').rf$GetFocus();

							param = $.extend(param, {truckid:$tr.attr('truckid')});

							dopOptions.frmSubmit(param);
							return false;
						});


					$('.ui-dialog').addClass('flora');
					$('#dvDialog').css('width', 'auto');

					var html = '';
					for (var i = 0; i < json.data.length; i++) {
						var truck = json.data[i];

/*						if (DRV.TRUCKID == json.data[i].TRUCKID)
							html += '<option selected value="'+json.data[i].TRUCKID+'">'+json.data[i].NAME+'</option>';
						else
							html += '<option value="'+json.data[i].TRUCKID+'">'+json.data[i].NAME+'</option>';*/
						if (truck.STATUS == '1') {
							html +=
								'<tr truckid="' + truck.TRUCKID + '">' +
									'<td class="text">'+truck.NAME+'</td>' +
								'</tr>';
						}

					}
					//$("select[name='truckid']").html(html);
					$("#tblTruckList tbody")
						.html(html)
						//.closest('table')
						//.kTblScroll()
						//.kTblSorter()
						//.rowFocus({rfSetDefFocus: true});

					$("#tblTruckList")
						.kTblScroll()
						.kTblSorter()
						.rowFocus({rfSetDefFocus:false})
						.rfSetFocus($('#tblTruckList [truckid='+dopOptions.truckid+']'));

					$('#tblTruckList [truckid='+dopOptions.truckid+']').kScrollToTr();

					$("#tblTruckList tr").dblclick(function () {
						var param = $("#dvDialog > form").kFormSubmitParam();
						var $tr = $('#tblTruckList').rf$GetFocus();


						param = $.extend(param, {truckid:$tr.attr('truckid')});

						dopOptions.frmSubmit(param);
					});
				}
			});


		}

		function verifyVal(v) {
			return (v ? v : '');
		}
	}

});