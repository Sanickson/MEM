include(eng_js + '/options.js');
	var tblCode = 'CARS';//код таблицы в IFACE_TBL
var prefTr = 'trC'; //префикс атрибута строки
var idTable = 'tblCars';
var viewCarChngGUID = false;
var tblContextO={};
var tbl;


$(document).ready(function () {

	$('#dvScreen').css({'width': '100%', 'height': kScreenH()});
	$.listCars();

});

(function ($){
  var $object;
     // обновление измененных строк таблицы
    $.trCarUpd = function(json){
        if (!showErr(json)) {
          tbl.data(json);
        }
    };
	$.fn.objIds = function () {
		var $tr = ($(this).is('tr') ? $(this) : $(this).parents('tr:first'));
		return tbl.trKeyId($tr.attr('id'));
	};

	$.addCar = function  () {
		$.crudDialog({ title: 'Добавление ТС' }, { frmSubmit: frmSubmit, btnConfTitle: 'Добавить' });

		function frmSubmit (param) {
			$.getJSON("cngCar", param, function ( json ) {
				if ( !showErr(json) ) {
					$("#dvDialog")
						.dialog("close");
					$.trCarUpd(json);		 //дорисовать в табличку
				}
			});
		}
	};

	$.cngCar = function  () {
		$object = $(this);
		var trId = $object.objIds();
		var data = tbl.trDataById(trId);

		var carid = data.CARID;
		var truckid = data.TRUCKID;

		$.crudDialog(
			{title: 'Изменение ТС'},
			{
				frmSubmit: frmSubmit,
				btnConfTitle: 'Изменить',
				carid: carid,
				truckid: truckid
			}
		);

		function frmSubmit ( param ) {
			if (!param.carid) {
				alert('Выберите транспортное средство');
				return false;
			}
			$.getJSON("cngCar", param, function ( json ) {
				if ( !showErr(json) ) {

					$.trCarUpd(json);	//изменить строчку в табличке
					//$('#'+idTable)
					//	.kTblScroll();

					$("#dvDialog")
						.dialog("close");
				}
			});
		}
	};

	$.GUIDchng = function  () {
		$object = $(this);
		var trId = $object.objIds();
		var carid = tbl.trKeyId(trId);

		function dv() {
			$.getJSON('listCars', {carid: carid}, function (json) {
				if (!showErr(json)) {
				  $("#dvDialogGUID").attr('carid',carid)
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
						param.carid = $("#dvDialogGUID").attr('carid');
						if (!param.guid || param.guid =="" ){
							alert ('Заполните все данные');
							return false;
						}
						$.getJSON("cngCarGUID", param, function ( json ) {
							if ( !showErr(json) ) {
								$("#dvDialogGUID").dialog("close");
								$.trCarUpd(json);		 //дорисовать в табличку
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

	$.delCar = function  () {
		$object = $(this);
		var trId = $object.objIds();
		var carid = tbl.trKeyId(trId);
		if (confirm('Удалить?')) {
			$.getJSON("delCar", {carid: carid}, function (json) {
				if (!showErr(json)) {
        			tbl.trDel(trId);
				}
			});
		}
	};

	$.crudDialog = function (dvOptions, dopOptions) {
		dvOptions = $.extend({
			closeOnEscape: false, title: '',
			autoOpen: true, resizable: false,
			draggable: false, modal: true,
			overlay: {opacity: 0.5, background: "black"},
			height: 450, width: 300
		}, dvOptions);
		dopOptions = $.extend({code: false, aid: false, frmSubmit: false, btnConfTitle: false}, dopOptions);

		if ($("#dvDialog").length) {
			$("#dvDialog").dialog("destroy").remove();
		}
		var params = {};

		if (dopOptions.carid) {
			$.getJSON('listCars', {carid: dopOptions.carid}, function (json) {
				if (!showErr(json)) {
					createDvHTML(json.data[0]);
				}
			});
		}
		else {
			createDvHTML({'CARID': 0, 'TRUCK': 0, 'LICENSE':0, 'TYPECAR': 0, 'CARRYING': 0, 'CAPACITY':0, 'CAPACITYPAL':0, 'KIND': 0});
		}

		function createDvHTML(CR) {
			var html ='<form style="height: 80%">\
									<br><div class="lbl">Тип ТС</div>\
											<div class="rght"><select name="typecar" ><option value="">Не выбрано</option>';

			$.ajax({
				url: 'listTypeCar',
				dataType: 'json',
				success: function (json) {
					if (!showErr(json)){
						for (var i = 0; i < json.data.length; i++)
									html += '<option value="' + json.data[i].TYPEID + '" '+((CR.TYPECAR == json.data[i].NAME) ? 'selected' :'')+ '>' + json.data[i].NAME + '</option>';
					}
				},
				async: false
			});

			html += '</select></div>\
						<br><br><div class="lbl">Наименование</div>\
						<div class="rght"><input required type="text" size="" name="carname" value="' + verifyVal(CR.CARNAME) + '"></div>\
						<br><br><div class="lbl">Гос.номер ТС</div>\
						<div class="rght"><input required type="text" size=""  name="license" value="' + verifyVal(CR.LICENSE) + '">' +
																' </div>';
			html += '<br><br><div class="lbl">Вид автомобиля</div>\
					<div class="rght"><select name="kind" ><option value="">Не выбрано</option>';

			$.ajax({
				url: 'listKindCar',
				dataType: 'json',
				success: function (json) {
					if (!showErr(json)){
						for (var i = 0; i < json.data.length; i++)
									html += '<option value="' + json.data[i].ID + '" '+((CR.KIND == json.data[i].NAME) ? 'selected' :'')+ '>' + json.data[i].NAME + '</option>';
					}
				},
				async: false
			});

			html += '</select></div>';

			html += '<br><br><div class="lbl">Грузоподъемность (т)</div>\
					<div class="rght"><input type="text" name="carrying" value="' + verifyVal(CR.CARRYING) + '"></div>';

			html += '<br><br><div class="lbl">Вместимость (куб.м)</div>\
					<div class="rght"><input type="text" name="capacity" value="' + verifyVal(CR.CAPACITY) + '"></div>';

			html += '<br><br><div class="lbl">Вместимость (пал)</div>\
					<div class="rght"><input type="text" name="capacitypal" value="' + verifyVal(CR.CAPACITYPAL) + '"></div>';

			html+='<br><br>\
					 <table name="truckid" style="width: 100%; margin-bottom: 15px; height: 30%" id="tblTruckList"><thead><tr><th ksort="text">Транспортная компания</th></tr></thead><tbody>';


			$.ajax({
				url: 'listTruck',
				dataType: 'json',
				success: function (json) {
					if (!showErr(json)){
						for (var i = 0; i < json.data.length; i++) {
							var truck = json.data[i];
							if (truck.STATUS == '1') {
								html +=
									'<tr truckid="' + truck.TRUCKID + '">' +
										'<td class="text">'+truck.NAME+'</td>' +
									'</tr>';
							}
						}
					}
				},
				async: false
			});
			html +='</tbody></table>\
						<input type="hidden" name="carid" value="' + verifyVal(CR.CARID) + '">\
						<div class="buttons">' +
							(dopOptions.btnConfTitle ? '<button type="submit" id="dvDocConfOk"><img src="' + eng_img + '/actions/accept.png" border="0">' + dopOptions.btnConfTitle + '</button>&nbsp;&nbsp;&nbsp;' : '') +
							'<button type="button" id="btnFilterClear"><img src="' + eng_img + '/actions/cancel.png" border="0">Отмена</button>\
						</div>\
				</form>';

			$('<div/>').attr("id", "dvDialog").addClass("flora")
				.css("text-align", "left")
				.dialog(dvOptions)
				.html(html)
				.find("table:first")
					.kTblScroll()
					.kTblSorter()
					.rowFocus({rfSetDefFocus:false})
					.rfSetFocus($('#tblTruckList [truckid='+dopOptions.truckid+']')).end()
				.find('input[name=carrying], input[name=capacity], input[name=capacitypal]').kInputFloat().end()
				.find("button:last").click(function () {
					$("#dvDialog").dialog("close");
				}).end();



			$("#dvDialog > form")
				//.kUpDown({selectOnFocus: true})
				.submit(function () {
					var param = $(this).kFormSubmitParam();
					var $tr = $('#tblTruckList').rf$GetFocus();
					param.license = $.auto_layout_keyboard(param.license);//удаляем прорбелы, заменяем латиницу на кириллицу

					param = $.extend(param, {truckid:$tr.attr('truckid')});
					param.type='';
					if (param.license =="" || param.typecar =="" ){
						alert ('Заполните все данные');
						return false;
					}

					dopOptions.frmSubmit(param);
					return false;
				});

			$('.ui-dialog').addClass('flora');
			$('#dvDialog').css('width', 'auto');

			$('#tblTruckList [truckid='+dopOptions.truckid+']').kScrollToTr();


			$("#tblTruckList tr").dblclick(function () {
				var param = $("#dvDialog > form").kFormSubmitParam();
				var $tr = $('#tblTruckList').rf$GetFocus();


				param = $.extend(param, {truckid:$tr.attr('truckid')});

				dopOptions.frmSubmit(param);
			});


			//$("#dvDialog input[name='license']").mask("t999tt 99?9");//Маска ввода госномера


		}

		function verifyVal(v) {
			return (v ? v : '');
		}

	};

	$.listCars = function(){
		if (tbl)
			tbl = $.TblDel(tbl);
		viewCarChngGUID = opt('view', null, 'contextCarChngGUID') ? true : false;
		tbl = $('#dvScreen').empty().Tbl({
			code: tblCode,
			//events: tblEvents,
			contextMenu: {
				optSortKey: ['CarEdit', 'CarAdd','GUIDchng', 'CarDelete'],
				funcCarEdit: $.cngCar, classCarEdit: 'edit separator', nameCarEdit: 'Изменить ТС',
				funcCarAdd: $.addCar, classCarAdd: 'add separator', nameCarAdd: 'Добавить ТС',
				funcCarDelete: $.delCar, classCarDelete: 'delete separator', nameCarDelete: 'Удалить ТС',
				funcGUIDchng: $.GUIDchng, classGUIDchng: 'edit separator', nameGUIDchng: 'Изменить GUID',notneedGUIDchng: viewCarChngGUID ? false : true
			},
			//foot: {footSet: SetTr},
			rowFocus: {rfSetDefFocus: false}
		});

		$.getJSON("listCars", function(json){
        	tbl.data(json);
			//	var html = $.whTblHTML(json, tblCarO);
		  //$('#dvScreen').html(html).find('table:first').whTblContextMenu(tblContextO).kTblSorter().kTblScroll()
			//			.rowFocus({rfSetDefFocus: false})
						//.find('>tfoot>tr>th>button')
						//.filter('.add').click($.addCar).end()
						//.filter('.cng').click($.cngCar).end()
						//.filter('.del').click($.delCar).end();
		});
	}
})(jQuery);


