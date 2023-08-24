include(eng_js + '/options.js');
var viewTruckChngGUID = false;
$(document).ready(function () {
	$('#dvMain, #dvTrucks').css({'width': '90%', 'height': kScreenH()});
	viewTruckChngGUID = opt('view', null, 'contextTruckChngGUID') ? true : false;
	//viewTruckChngGUID = true;
	$('#dvTrucks').html('<table id="tblTrucks">' +
			'<thead><tr>' +
			'<th ksort="text">Транспортная компания</th>' +
			'<th ksort="text">Статус</th>' +
			'<th ksort="text" title="Форма собственности">ФС</th>' +
			'<th ksort="text">№ Договора</th>' +
			'<th ksort="text">Контактные данные</th>' +
			'<th ksort="text">GUID</th>' +
			'</tr></thead>' +
			'<tbody></tbody>' +
			'<tfoot><tr>' +
			'<th class="buttons" colspan="6">' +
			'<button type="button" title="Добавить" class="add" code="add"><img src="'+eng_img+'/actions/add.png" border="0"></button>' +
			//'<button type="button" title="Изменить" class="cng" code="cng"><img src="$eng_img/actions/edit.png" border="0"></button>' +
			//'<button type="button" title="Удалить" class="del" code="del"><img src="$eng_img/actions/delete.png" border="0"></button>' +
			'</th></tr></tfoot></table>')
	var tblContextO = { //добавляем в стандартное контекстное меню новые ссылки
		optSortKey: ['TruckEdit', 'TruckAdd','GUIDchng', 'TruckDelete'],
		funcTruckEdit: cngTruck, classTruckEdit: 'edit separator', nameTruckEdit: 'Изменить',
		funcTruckAdd: addTruck, classTruckAdd: 'add separator', nameTruckAdd: 'Добавить',
		funcTruckDelete: delTruck, classTruckDelete: 'delete separator', nameTruckDelete: 'Удалить',
		funcGUIDchng: GUIDchng, classGUIDchng: 'edit separator', nameGUIDchng: 'Изменить GUID',notneedGUIDchng: viewTruckChngGUID ? false : true

	};
	$.listTruck = function () {
		$.getJSON('listTruck', function (json) {
			if (!showErr(json)) {
				var html = '';
				for (var i = 0; i < json.data.length; i++) {
					var row = json.data[i];

					html += trTruck(row);
				}
				$('#tblTrucks tbody')
					.html(html)
					.closest('table')
					.kTblSorter()
					.kTblScroll()
					.rowFocus({rfSetDefFocus: true})
					.whTblContextMenu(tblContextO)
					.find('>tfoot>tr>th>button')
					.filter('.add').click(addTruck).end();
					//.filter('.cng').click(cngTruck).end()
					//.filter('.del').click(delTruck).end()
					//.filter('.print').click(printTruck).end();

			}
		});
	};

	function trTruck (row) {
		return '<tr truckid="' + row.TRUCKID + '" typeid = "' + row.TYPEID + '">' +
		       '<td class="text">' + row.NAME + '</td>' +
		       '<td>' + $.iconYesNo(kInt(row.STATUS)) + '</td>' +
		       '<td>' + row.TYPENAME + '</td>' +
		       '<td>' + row.CONTRACT + '</td>' +
		       '<td>' + row.ADDRESS + '</td>' +
		       '<td>' + row.GUID + '</td>' +
		       '</tr>';
	}
	
	function addTruck () {
		crudDialog({ title: 'Добавление транспортной компании' }, { frmSubmit: frmSubmit, btnConfTitle: 'Добавить' });

		function frmSubmit ( param ) {
			$.getJSON("cngTruck", param, function ( json ) {
				if ( !showErr(json) ) {
					$('#tblTrucks>tbody')
						.append(trTruck(json.data[0]));
					$('#tblTrucks')
						.kTblScroll()
						.kTblSorter()
						.rowFocus({ rfSetDefFocus: false })
						.whTblContextMenu(tblContextO);

					$('#tblTrucks>tbody>tr[truckid="' + json.data[0].TRUCKID + '"]').kScrollToTr().addClass('rf-focused');

					$("#dvDialog")
						.dialog("close");
				}
			});
		};
	}

	function cngTruck () {
		var truckid = $(this).closest('tr').attr('truckid');
		//var truckid = $('#tblTrucks').rf$GetFocus().attr('truckid');

		crudDialog({title: 'Изменение  транспортной компании'}, {frmSubmit: frmSubmit, btnConfTitle: 'Изменить', truckid: truckid});

		function frmSubmit ( param ) {
			$.getJSON("cngTruck", param, function ( json ) {
				if ( !showErr(json) ) {
					$('#tblTrucks>tbody>tr[truckid="' + json.data[0].TRUCKID + '"]')
						.replaceWith(trTruck(json.data[0]));

					$('#tblTrucks')
						.kTblSorter()
						.rowFocus({ rfSetDefFocus: false })
						.kTblScroll()
						.whTblContextMenu(tblContextO);
					$('#tblTrucks>tbody>tr[truckid="' + json.data[0].TRUCKID + '"]').addClass('rf-focused');
					$("#dvDialog")
						.dialog("close");
				}
			});
		};
	}
	
	function delTruck () {
		var truckid = $(this).closest('tr').attr('truckid');
		//var truckid = $('#tblTrucks').rf$GetFocus().attr('truckid');
		if (confirm('Удалить?')) {
			$.getJSON("delTruck", {truckid: truckid}, function (json) {
				if (!showErr(json)) {
					$('#tblTrucks>tbody>tr[truckid="' + json.ext_data.TRUCKID + '"]').remove();
					$('#tblTrucks')
						.kTblSorter().kTblScroll();;
				}
			});
		}
	}


	function GUIDchng () {
		var truckid = $(this).closest('tr').attr('truckid');
		function dv() {
			$.getJSON('listTruck', {truckid: truckid}, function (json) {
				if (!showErr(json)) {
				  $("#dvDialogGUID").attr('truckid',truckid)
					.find('form')
					  .find('input[name="guid"]').val(json.data[0].GUID ? json.data[0].GUID : '').end()
					.end();
				  $("#dvDialogGUID")
					  .dialog("open").find('input:first').focus().end();
				}
			})
		}

		if ($("#dvDialogGUID").length)
		  dv();
		else{
			var html ='<form style="height: 100%">\
									<br><div class="lbl" style="width: 20%">GUID: </div>\
											<div class="rght" style="width: 70%"><input type="text" name="guid"></div>'+
					'<br><br><hr><div class="buttons">' +
							'<button type="submit"><img src="' + eng_img + '/actions/accept.png" border="0">Сохранить</button>&nbsp;&nbsp;&nbsp;' +
							'<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0">Отмена</button>\
						</div>\
				</form>';

			$('<div/>').attr("id", "dvDialogGUID").addClass("flora")
				.css("text-align", "left")
				.dialog({
					closeOnEscape: false, title: 'Изменить GUID',
					autoOpen: true, resizable: false,
					draggable: false, modal: true,
					overlay: {opacity: 0.5, background: "black"},
					height: 150, width: 450})
				.html(html)
				.find('form')
					.submit(function () {
						var param = $(this).kFormSubmitParam();
						param.truckid = $("#dvDialogGUID").attr('truckid');
						if (!param.guid || param.guid =="" ){
							alert ('Заполните все данные');
							return false;
						}
						$.getJSON("cngTruckGUID", param, function ( json ) {
							if ( !showErr(json) ) {
								$("#dvDialogGUID").dialog("close");
								$('#tblTrucks>tbody>tr[truckid="' + json.data[0].TRUCKID + '"]')
									.replaceWith(trTruck(json.data[0]));

								$('#tblTrucks')
									.kTblSorter()
									.rowFocus({ rfSetDefFocus: false })
									.kTblScroll()
									.whTblContextMenu(tblContextO);
								$('#tblTrucks>tbody>tr[truckid="' + json.data[0].TRUCKID + '"]').addClass('rf-focused');		 //дорисовать в табличку
							}
						});
						return false;
					})
					.find('input[name="guid"]').mask('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww').end()
					.find("button:last").click(function () {
						$("#dvDialogGUID").dialog("close");
					}).end();
			dv();
		}
	};


	function crudDialog(dvOptions, dopOptions) {
		dvOptions = $.extend({
			closeOnEscape: false, title: '',
			autoOpen: true, resizable: false,
			draggable: false, modal: true,
			overlay: {opacity: 0.5, background: "black"},
			height: 450, width: 500
		}, dvOptions);
		dopOptions = $.extend({code: false, aid: false, frmSubmit: false, btnConfTitle: false}, dopOptions);

		if ($("#dvDialog").length) {
			$("#dvDialog").dialog("destroy").remove();
		}
		var params = {};

		if (dopOptions.truckid) {
			$.getJSON('listTruck', {truckid: dopOptions.truckid}, function (json) {
				if (!showErr(json)) {
					createDvHTML(json.data[0]);
				}
			});
		}
		else {
			createDvHTML({'TRUCKID': 0, 'NAME': 0, 'STATUS': 0, 'ADDRES':0, 'GUID': ''});
		}

		function createDvHTML(JSON) {
			$.getJSON('listTypeOwnerSh',function(json) {
				if (!showErr(json)) {
					var html =
						'<form>\
								<table id="tblChgTruck" style="width:100%; border: none; margin-bottom: 15px;">\
							<tr>\
								 <td><label class="lbl" for="name">Наименование</label></td>\
								 <td><input required type="text" class="rght" name="name" style="width: 100%;" value="' + verifyVal(JSON.NAME) + '">'+
								 '<br><div class="buttons"><button type="button" title="Добавить адрес" id="btnAddress"><img src="' + sp_img + '/address.png" border="0"></button></div>\
							</td></tr>\
							<tr>\
								 <td>\
										<label class="lbl" for="type">Форма собственности</label>\
								</td>\
								<td>\
									<select class="rght" name="type" style="width: 100%"><option value="">Не выбрано</option>';
					for (var i = 0; i < json.data.length; i++)
						html += '<option value="' + json.data[i].ID + '" '+((JSON.TYPEID == json.data[i].ID) ? 'selected' :'')+ '>' + json.data[i].NAME + '</option>';
					html += '</select>\
								</td>\
							</tr>\
							<tr>\
								 <td>\
										<label class="lbl" for="contract">Номер договора</label>\
								</td>\
								<td>\
									<input required type="text" class="rght" name="contract" style="width: 100%;" value="' + verifyVal(JSON.CONTRACT) + '">\
								</td>\
							</tr>\
							<tr>\
								 <td>\
										<label class="lbl" for="status">Статус</label>\
								</td>\
								<td>\
									<select class="rght" name="status" style="width: 100%">\
										<option value="1"' + (kInt(JSON.STATUS)?' selected':'') + '>Активен\
										<option value="0"' + (kInt(JSON.STATUS)?'':' selected') + '>Неактивен\
									</select>\
								</td>\
							</tr>\
							<tr>\
								 <td>\
										<label class="lbl" for="status">GUID</label>\
								</td>\
								<td>\
									<input type="text" class="rght" name="guid" style="width: 100%;" value="' + verifyVal(JSON.GUID) + '" '+(viewTruckChngGUID ? '' : 'disabled') +'>\
								</td>\
							</tr>\
							<tr>\
								 <td>\
										<label class="lbl" for="address">Контактные данные</label>\
								</td>\
								<td>\
									<textarea class="rght" name="address" placeholder="Полное наименование, адрес места нахождения, номер телефона" rows="3" style="width: 100%; resize: none">' + verifyVal(JSON.ADDRESS) + '</textarea>\
								</td>\
							</tr>\
						</table>\
						<input type="hidden" name="truckid" value="' + verifyVal(JSON.TRUCKID) + '"></form>\
						<div style="height: 33%; overflow: hidden">\
								<table id="tblAddress" style="width:100%"><thead>\
								<tr><th>Контактные данные</th></tr></thead><tbody></tbody></table>\
								</div>\
						<hr><div class="buttons">' +
							(dopOptions.btnConfTitle ? '<button type="submit" id="dvDocConfOk"><img src="' + eng_img + '/actions/accept.png" border="0">' + dopOptions.btnConfTitle + '</button>&nbsp;&nbsp;&nbsp;' : '') +
							'<button type="button" id="btnFilterClear"><img src="' + eng_img + '/actions/cancel.png" border="0">Отмена</button>\
						</div>\
						';

					$('<div/>').attr("id", "dvDialog").addClass("flora")
						.css("text-align", "left")
						.dialog(dvOptions)
						.html(html)
						.find('input[name="guid"]').mask('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww').end()
						.find("button:last").click(function () {
						$("#dvDialog").dialog("close");
					}).end()
					;

					$("#dvDialog > form")
						.kUpDown({selectOnFocus: true});
					$('#dvDocConfOk').click(function () {
							var param = $("#dvDialog > form").kFormSubmitParam();
							param.name = $.trim(param.name.replace(/\s+/g,' '));
							if (param.type == ""){
								alert('Выберите форму собственности компании');
								return false;
							}
							if (param.contract == ""){
								alert('Введите номер договра');
								return false;
							}
							dopOptions.frmSubmit(param);
							return false;
						});

					$('#btnAddress').click(function () {
						var param = {};
						var v = $('input[name=name]').val();
						if (!v) {
							alert('Ничего не введено!');
							return;
						}
						else
							param.nametruck = $('input[name=name]').val();

						$.getJSON('listAddress', param, function (json) {
							var html = '';
							for (var i = 0; i < json.data.length; i++) {
								html += '<tr>' +
									'<td class="text">' + json.data[i].PRIINTDATA + '</td>' +
									'</tr>';
							}
							$('#tblAddress tbody').html(html).parents('table:first')
								.kTblScroll().kTblSorter()
								.rowFocus(({rfSetDefFocus:false, rfFocusCallBack: function(){
										var address = $(this).text();
										if (address!=''){
											$('textarea[name=address]').val(address);
										}
									}
								}));

							$('#tblAddress td').kUnmarkText().kMarkText(param.nametruck);
							$('#tblAddress tbody>tr').hide().find('span').closest('tr').show();
						});
					});



					$('.ui-dialog').addClass('flora');
					$('#dvDialog').css('width', 'auto');
		}})
		}

		function verifyVal(v) {
			return (v ? v : '');
		}
	}

});