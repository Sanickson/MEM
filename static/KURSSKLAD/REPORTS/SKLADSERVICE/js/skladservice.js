$(document).ready(function(){
	$.datepicker.setDefaults($.extend($.datepicker.regional['ru']));
	
	/*$.blockUI({message:'<h2>...загрузка зон...</h2>'});
	$.getJSON('getObjects',function(JSON){
        for(var i=0;i<JSON.data.length;++i)
            $('#fromobj').append('<option value="'+JSON.data[i].OBJID+'" '+(JSON.data[i].OBJID==JSON.ext_data.curzone?'selected':'')+'>'+JSON.data[i].OBJNAME+'</option>');
		if (JSON.data.length == 1) $('#fromobj').attr({'disabled':'disabled'})
        $.unblockUI();
    });*/
    if ($("#dvZone").length)
        $("dvZone").remove();
    $.blockUI({message: '<h2>...загрузка зон...</h2>'});
    $.getJSON('getObjects', function (JSON) {
        var html = '<table id="tblZone"><thead><tr><th class="chk"><input type="checkbox" /></th><th>Наименование</th></tr></thead><tbody>';
        for (var i = 0; i < JSON.data.length; i++)
            html += '<tr><td class="chk"><input type="checkbox" objid="' + JSON.data[i].OBJID + '" /></td><td class="name">' + JSON.data[i].OBJNAME + '</td></tr>';
        html += '</tbody><tfoot><tr><th colspan=2>&nbsp;</th></tr></tfoot></table>';
        var $dv = $("<div/>").attr("id", "dvZone").addClass("flora").css("text-align", "center")
            .dialog({closeOnEscape: true, title: 'Склады', autoOpen: false,
                resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
                height: 300, width: 300})
            .bind("dialogbeforeclose", function (event, ui) {
                var objid = '';
                if ($('#tblZone>tbody>tr').length != $('#tblZone>tbody>tr>td>input:checked').length) {
                    $('#tblZone>tbody>tr>td>input:checked').each(function () {
                        objid += $(this).attr('objid') + ',';
                    });
                    $('#zone').attr('data-val', objid);
                } else $('#zone').attr('data-val', '');
            })
            .html(html)
            .find('table')
            .kTdChk();

        //$dv.bind("beforeclose", function( event, ui ) {console.log('close')} );

        $.unblockUI();
    });

	$('#bdate,#edate').datepicker().mask('99.99.9999').val(kToday());
	//$('#bdate').val(kToday(-120))

	var containerheight = kScreenH();
    $("#dvMain").css({"height":containerheight});
	$("#toobjid").whMultiObj();
	//$("#toobjid").kObjAutoComplete({hiddenName:"toobj"});
	
	$("form#services").unbind('submit').submit(function(){
		/*var params = {};
		params.dbeg = $('#bdate').val();
        params.dend = $('#edate').val();
        //params.fromobj = $('#fromobj').val();
        params.toobj = $('#toobjid').attr('data-val');
        params.objid = $('#zone').attr('obj');*/
		$('#dvSkladService,#dvSkladServiceDetail').empty();
		var P = $(this).kFormSubmitParam();
		var tp = $('#tp').val();
		if (tp === 'dt')
			$.getJSON('skladServByDate',P,$.skladServByDate);
		else if (tp === 'ca')
			$.getJSON('skladServByCompany',P,$.skladServByCompany)
		return false;
	});

	 $('#btnExcel').click(function () {
        if ($('#dvSkladService table').get(0)) {
            export_table_to_excel_name($('table').get(0), $('#sys-name').text() + ' ' + kNow() + '.xlsx')
        } else {
            alert('Заполните таблицу!')
        }
    });
	
	
	$('#btPrint').click(function(){
		var $tbl = $('#dvSkladService table');
		if (!$tbl.length) {showMes('Внимание','Нет данных!');return false;}
		var wnd = window.open(sp_reports+'/printSkladService.html');
		var toobj = $tbl.attr('toobj');
		var fromobj =  $tbl.attr('fromobj');
        //var objid = $('#zone').attr('obj');
        var $zone = $('#dvZone table>tbody');
        var zoneid = $tbl.attr('fromobj');
        if (zoneid == 'null'){
            fromobj_text = '';
            var $zonename = $zone.find(".name");
            for (var i=0; i<$zonename.length; ++i){
                fromobj_text += $zonename[i].innerHTML + (i < $zonename.length - 1 ? ', ' : '');
            }
            /*$zone.find(".name").each(function(){
                fromobj_text +=  $(this)[0].innerHTML + ', ';
            });*/
        }
        else{
            var arr = zoneid.split(',');
            fromobj_text = '';
            for (var i = 0; i<arr.length - 1; ++i){
                fromobj_text += $zone.find('input[objid=' + arr[i] + ']').parent().parent().find('.name').text();
                fromobj_text += i < arr.length - 2 ? ', ' : '';
            }
        }
		//fromobj_text = $('#fromobj>option[value="'+fromobj+'"]').text();
		toobj_text = (toobj!='null'?(' Контрагент '+$('#toobjid').val()):'');
		wnd.onload = function(){
			wnd.document.getElementById("dvHeader").innerHTML = 'Уровень сервиса склада с '+ $tbl.attr('dbeg') + ' по '
                + $tbl.attr('dend') + '<br>Объекты: ' + fromobj_text + toobj_text;
			wnd.document.getElementById("tbl").innerHTML = $tbl.printHTML();
		}
	});

    $('#btShow').click(function(){
        /*var params = {};
        params.dbeg = $('#bdate').val();
        params.dend = $('#edate').val();
        params.toobj = $('#toobjid').attr("data-val");
        params.objid = $('#zone').attr('obj');*/
		var P = $("form#services").kFormSubmitParam();
        if ($("#dvShow").length)
            $("dvShow").remove();
        $.blockUI({message: '<h2>...загрузка документов...</h2>'});
        $.getJSON('getDocument', P, function(JSON){
            if (!showErr(JSON)) {
                var html = '<table id="tblShow"><thead><tr>'+
                    '<th title="Статус">Ст</th>' +
                    '<th>Номер</th>' +
                    '<th>Дата(док)</th>' +
                    '<th>Дата(факт)</th>' +
                    '<th>Откого</th>' +
                    '<th>Кому</th>' +
                    '<th>Сумма</th>' +
                    '</tr></thead><tbody>';
                for (var i = 0; i < JSON.data.length; i++){
                    var td = JSON.data[i];
                    html += '<tr>' + $.tdDocStatus(td.STATUS) +
                        '<td>' + td.DOCNUMBER + '</td>' +
                        '<td>' + kDate(td.REALDOCDATE) + '</td>' +
                        '<td>' + kDate(td.DOCDATE) + '</td>' +
                        '<td>' + td.DFROMNAME + '</td>' +
                        '<td>' + td.DTONAME + '</td>' +
                        '<td>' + kFloat(td.DOCSUM,2) + '</td>' +
                        '</tr>';
                }
                var $dv = $("<div/>").attr("id", "dvShow").addClass("flora").css("text-align", "center")
                    .dialog({closeOnEscape: true, title: 'Неучтенные документы', autoOpen: true,
                        resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
                        height: '80%', width: '90%'})
                    .html(html)
                    .find('table')
                    .kTblScroll()
                    .kTblSorter();
            }
            $.unblockUI();
        });
    });

    $('#zone').click(function () {

        if ($("#dvZone").length){
            $("#dvZone").dialog("open")
                .find('table').kTblScroll();

        }
    });
})

;(function($){
	$.skladServByDate = function(JSON) {
		if (!showErr(JSON)) {
			var ed = JSON.ext_data;
			var html = '<table id="" dbeg="'+ed.dbeg+'" dend="'+ed.dend+'" fromobj="'+ed.fromobj+'" toobj="'+ed.toobj+'">\
						<thead>\
							<tr>\
								<th rowspan="2" title="День недели">ДН</th>\
								<th rowspan="2">Дата</th>\
								<th colspan="4">Заказ</th>\
								<th colspan="5">Задания</th>\
								<th colspan="4">Отобрано</th>\
								<th title="Уровень сервиса склада">УСС</th>\
							</tr>\
							<tr>\
								<th ksort="text" title="Контрагент">Контр.</th>\
								<th ksort="text" title="Документ">Док.</th>\
								<th ksort="digit" title="Позиций">Поз</th>\
								<th ksort="digit">Сумма</th>\
								<th ksort="digit">Кол-во</th>\
								<th ksort="digit">Сумма</th>\
								<th ksort="digit">Вычерк</th>\
								<th ksort="digit">Без вычерка</th>\
								<th ksort="digit" title="Коэффициент присутствия товара">%КПТ</th>\
								<th ksort="digit">Сумма</th>\
								<th ksort="digit" title="Сумма в минус">С-</th>\
								<th ksort="digit" title="Сумма в плюс">С+</th>\
								<th ksort="digit" title="Коэффициент отбираемости товара">%КОТ</th>\
								<th ksort="digit">%</th>\
							</tr>\
						</thead><tbody>';
			var cntdtoobj_s = 0, cntdoc_s = 0
			var cntpos_s = 0, cnttask_s = 0, sumtask_s = 0.0, badselect_s=0.0, sumselect_s = 0.0,
				sumselectminus_s = 0.0, sumselectplus_s = 0.0;
			for(var i = 0; i<JSON.data.length; i++) {
				var tr = JSON.data[i];
				var sumtask_p = kFloat((tr.SUMTASK-tr.BADSELECT)*100/tr.SUMTASK,2);
				var sumselect_p = kFloat((tr.SUMSELECT-tr.SUMSELECTPLUS)*100/(tr.SUMTASK-tr.BADSELECT),2);
				var servicepercent = kFloat(100 - (tr.BADSELECT+tr.SUMSELECTMINUS)*100/tr.SUMTASK,2);
				html += '<tr dt="'+kDate(tr.DOCDATE)+'">'+
						 '<td class="">'+tr.DOW+'</td>'+
						 '<td class="">'+kDate(tr.DOCDATE)+'</td>'+
						 '<td class="number">'+tr.CNTDTOOBJ+'</td>'+
						 '<td class="number">'+tr.CNTDOC+'</td>'+
						 '<td class="number">'+tr.CNTPOS+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMTASK,2)+'</td>'+
						 '<td class="number">'+tr.CNTTASK+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMTASK,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.BADSELECT,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMTASK-tr.BADSELECT,2)+'</td>'+
						 '<td class="number">'+sumtask_p+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMSELECT,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMSELECTMINUS,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMSELECTPLUS,2)+'</td>'+
						 '<td class="number">'+sumselect_p+'</td>'+
						 '<td class="number">'+servicepercent+'</td>'+
						 '</tr>';
				cntdtoobj_s += tr.CNTDTOOBJ;
				cntdoc_s += tr.CNTDOC;
				cntpos_s += tr.CNTPOS;
				cnttask_s += tr.CNTTASK;
				sumtask_s += tr.SUMTASK;
				badselect_s += tr.BADSELECT;
				sumselect_s += tr.SUMSELECT;
				sumselectminus_s += tr.SUMSELECTMINUS;
				sumselectplus_s += tr.SUMSELECTPLUS;
			} 
			html += '</tbody><tfoot><tr>'+
						'<th colspan="2">'+i+'</th>'+
						'<th>'+cntdtoobj_s+'</th>'+
						'<th>'+cntdoc_s+'</th>'+
						'<th>'+cntpos_s+'</th>'+
						'<th>'+kFloat(sumtask_s,2)+'</th>'+
						'<th>'+cnttask_s+'</th>'+
						'<th>'+kFloat(sumtask_s,2)+'</th>'+
						'<th>'+kFloat(badselect_s,2)+'</th>'+
						'<th>'+kFloat(sumtask_s-badselect_s,2)+'</th>'+
						'<th>'+'</th>'+
						'<th>'+kFloat(sumselect_s,2)+'</th>'+
						'<th>'+kFloat(sumselectminus_s,2)+'</th>'+
						'<th>'+kFloat(sumselectplus_s,2)+'</th>'+
						'<th>'+'</th>'+
						'<th>'+'</th>'+
						'</tr></tfoot></table>';
			$('#dvSkladService').html(html)
				.find('table')
					.kTblScroll()
					.kTblSorter()
					.rowFocus({rfSetDefFocus:false,
							rfFocusCallBack:function(){
									var params = {};
									params.dbeg = $(this).attr('dt');
									params.dend = $(this).attr('dt');
									//params.fromobj = $('#dvSkladService table').attr('fromobj');// $('#fromobj').val();
									params.objid = $('#dvSkladService table').attr('fromobj');// $('#fromobj').val();
                                    //params.objid = $('#zone').attr('obj');
									params.toobj = $('#dvSkladService table').attr('toobj');//$('#dvSkladService table').attr('toobj')  + ", ";$('input[name="toobj"]').val();
								$.getJSON('skladServDocs',params,skladServDocs);
							}})

		}
	};
	
	$.skladServByCompany = function(JSON) {
		if (!showErr(JSON)) {
			var ed = JSON.ext_data;
			var html = '<table id="" dbeg="'+ed.dbeg+'" dend="'+ed.dend+'" fromobj="'+ed.fromobj+'" toobj="'+ed.toobj+'" >\
						<thead>\
							<tr>\
								<th rowspan="2">Контрагент</th>\
								<th colspan="3">Заказ</th>\
								<th colspan="5">Задания</th>\
								<th colspan="4">Отобрано</th>\
								<th title="Уровень сервиса склада">УСС</th>\
							</tr>\
							<tr>\
								<th ksort="digit" title="Документ">Док.</th>\
								<th ksort="digit" title="Позиций">Поз</th>\
								<th ksort="digit">Сумма</th>\
								<th ksort="digit">Кол-во</th>\
								<th ksort="digit">Сумма</th>\
								<th ksort="digit">Вычерк</th>\
								<th ksort="digit">Без вычерка</th>\
								<th ksort="digit" title="Коэффициент присутствия товара">%КПТ</th>\
								<th ksort="digit">Сумма</th>\
								<th ksort="digit" title="Сумма в минус">С-</th>\
								<th ksort="digit" title="Сумма в плюс">С+</th>\
								<th ksort="digit" title="Коэффициент отбираемости товара">%КОТ</th>\
								<th ksort="digit">%</th>\
							</tr>\
						</thead><tbody>';
			var cntdtoobj_s = 0, cntdoc_s = 0
			var cntpos_s = 0, cnttask_s = 0, sumtask_s = 0.0, badselect_s=0.0, sumselect_s = 0.0,
				sumselectminus_s = 0.0, sumselectplus_s = 0.0;
			for(var i = 0; i<JSON.data.length; i++) {
				var tr = JSON.data[i];
				var sumtask_p = kFloat((tr.SUMTASK-tr.BADSELECT)*100/tr.SUMTASK,2);
				var sumselect_p = kFloat((tr.SUMSELECT-tr.SUMSELECTPLUS)*100/(tr.SUMTASK-tr.BADSELECT),2);
				var servicepercent = kFloat(100 - (tr.BADSELECT+tr.SUMSELECTMINUS)*100/tr.SUMTASK,2);
				html += '<tr obj="'+tr.CNTDTOOBJ+'">'+
						 '<td class="text">'+tr.TOOBJNAME+'</td>'+
						 '<td class="number">'+tr.CNTDOC+'</td>'+
						 '<td class="number">'+tr.CNTPOS+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMTASK,2)+'</td>'+
						 '<td class="number">'+tr.CNTTASK+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMTASK,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.BADSELECT,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMTASK-tr.BADSELECT,2)+'</td>'+
						 '<td class="number">'+sumtask_p+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMSELECT,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMSELECTMINUS,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMSELECTPLUS,2)+'</td>'+
						 '<td class="number">'+sumselect_p+'</td>'+
						 '<td class="number">'+servicepercent+'</td>'+
						 '</tr>';
				cntdoc_s += tr.CNTDOC;
				cntpos_s += tr.CNTPOS;
				cnttask_s += tr.CNTTASK;
				sumtask_s += tr.SUMTASK;
				badselect_s += tr.BADSELECT;
				sumselect_s += tr.SUMSELECT
				sumselectminus_s += tr.SUMSELECTMINUS;
				sumselectplus_s += tr.SUMSELECTPLUS;
			} 
			html += '</tbody><tfoot><tr>'+
						'<th>'+i+'</th>'+
						'<th>'+cntdoc_s+'</th>'+
						'<th>'+cntpos_s+'</th>'+
						'<th>'+kFloat(sumtask_s,2)+'</th>'+
						'<th>'+cnttask_s+'</th>'+
						'<th>'+kFloat(sumtask_s,2)+'</th>'+
						'<th>'+kFloat(badselect_s,2)+'</th>'+
						'<th>'+kFloat(sumtask_s-badselect_s,2)+'</th>'+
						'<th>'+'</th>'+
						'<th>'+kFloat(sumselect_s,2)+'</th>'+
						'<th>'+kFloat(sumselectminus_s,2)+'</th>'+
						'<th>'+kFloat(sumselectplus_s,2)+'</th>'+
						'<th>'+'</th>'+
						'<th>'+'</th>'+
						'</tr></tfoot></table>';
			$('#dvSkladService').html(html)
				.find('table')
					.kTblScroll()
					.kTblSorter()
					.rowFocus({rfSetDefFocus:false,
							rfFocusCallBack:function(){
                                var params = {};
                                params.dbeg = $('#bdate').val();
                                params.dend = $('#edate').val();
                                //params.fromobj = $('#fromobj').val();
                                //params.objid = $('#zone').attr('obj');
                                params.toobj = $(this).attr('obj') + ", ";
                                params.objid = $('#dvSkladService table').attr('fromobj');// $('#fromobj').val();*/
                                $.getJSON('skladServDocs',params,skladServDocs);
							}})
		}
	}
	
	function skladServDocs(JSON) {
		if (!showErr(JSON)) {
			var html = '<table id="">\
						<thead>\
							<tr>\
								<th colspan="5">Документ</th>\
								<th colspan="2">Заказ</th>\
								<th colspan="5">Задания</th>\
								<th colspan="4">Отобрано</th>\
								<th title="Уровень сервиса склада">УСС</th>\
							</tr>\
							<tr>\
								<th ksort="text">Тип</th>\
								<th ksort="text">Статус</th>\
								<th ksort="number">Номер</th>\
								<th ksort="text">Кому</th>\
								<th ksort="ShortDate">Дата</th>\
								<th ksort="digit" title="Позиций">Поз</th>\
								<th ksort="digit">Сумма</th>\
								<th ksort="digit">Кол-во</th>\
								<th ksort="digit">Поз</th>\
								<th ksort="digit">Сумма</th>\
								<th ksort="digit">Вычерк</th>\
								<th ksort="digit" title="Коэффициент присутствия товара">%КПТ</th>\
								<th ksort="digit">Сумма</th>\
								<th ksort="digit" title="Сумма в минус">С-</th>\
								<th ksort="digit" title="Сумма в плюс">С+</th>\
								<th ksort="digit" title="Коэффициент отбираемости товара">%КОТ</th>\
								<th ksort="digit">%</th>\
							</tr>\
						</thead><tbody>';
			var cntpos_s = 0, cnttask_s = 0, sumtask_s = 0.0, badselect_s = 0.0, sumselect_s = 0.0,
				sumselectminus_s = 0.0, sumselectplus_s = 0.0;
			for(var i = 0; i<JSON.data.length; i++) {
				var tr = JSON.data[i];
				var sumtask_p = kFloat((tr.SUMTASK-tr.BADSELECT)*100/tr.SUMTASK,2);
				var sumselect_p = kFloat((tr.SUMSELECT-tr.SUMSELECTPLUS)*100/(tr.SUMTASK-tr.BADSELECT),2);
				var servicepercent = kFloat(100 - (tr.BADSELECT+tr.SUMSELECTMINUS)*100/tr.SUMTASK,2);
				html += '<tr docid="'+tr.DOCID+'">'+
						 '<td class="">'+tr.DSTYPE+'</td>'+
						 $.tdDocStatus(tr.DSTATUS)+ 
						 '<td class="number">'+tr.DNUMBER+'</td>'+
						 '<td class="text">'+tr.TOOBJNAME+'</td>'+
						 '<td class="">'+kDate(tr.DOCDATE)+'</td>'+
						 '<td class="number">'+tr.CNTPOS+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMTASK,2)+'</td>'+
						 '<td class="number">'+tr.CNTTASK+'</td>'+
						 '<td class="number">'+tr.CNTPOS+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMTASK,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.BADSELECT,2)+'</td>'+
						 '<td class="number">'+sumtask_p+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMSELECT,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMSELECTMINUS,2)+'</td>'+
						 '<td class="number">'+kFloat(tr.SUMSELECTPLUS,2)+'</td>'+
						 '<td class="">'+sumselect_p+'</td>'+
						 '<td class="">'+servicepercent+'</td>'+
						 '</tr>';
				cntpos_s += tr.CNTPOS;
				cnttask_s += tr.CNTTASK;
				sumtask_s += tr.SUMTASK;
				badselect_s += tr.BADSELECT;
				sumselect_s += tr.SUMSELECT;
				sumselectminus_s += tr.SUMSELECTMINUS;
				sumselectplus_s += tr.SUMSELECTPLUS;
			} 
			html += '</tbody><tfoot><tr>'+
						'<th>'+i+'</th>'+
						'<th colspan="4"></th>'+
						'<th>'+cntpos_s+'</th>'+
						'<th>'+kFloat(sumtask_s,2)+'</th>'+
						'<th>'+cnttask_s+'</th>'+
						'<th>'+cntpos_s+'</th>'+
						'<th>'+kFloat(sumtask_s,2)+'</th>'+
						'<th>'+kFloat(badselect_s,2)+'</th>'+
						'<th>'+'</th>'+
						'<th>'+kFloat(sumselect_s,2)+'</th>'+
						'<th>'+kFloat(sumselectminus_s,2)+'</th>'+
						'<th>'+kFloat(sumselectplus_s,2)+'</th>'+
						'<th>'+'</th>'+
						'<th>'+'</th>'+
						'</tr></tfoot></table>';
			$('#dvSkladServiceDetail').html(html)
				.find('table')
					.kTblScroll()
					.kTblSorter()
					.rowFocus({rfSetDefFocus:false})
				.find('tbody>tr').dblclick(skladServDocsDetail)
		}
	}
	
	function skladServDocsDetail () {
		var docid = $(this).attr('docid');
		
		if ($("#dvTaskes").length) 
			$("#dvTaskes").dialog("destroy").remove();
		
		var $dv = $("<div/>").attr("id","dvTaskes").addClass("flora").css("text-align","center")
                    .dialog({closeOnEscape:false,title:'Задания',autoOpen:true,
                             resizable:false,draggable:false,modal:true,overlay:{opacity:0.5,background:"black"},
                             height:kScreenH(),width:kScreenW()})
					.html('<div id="dvSkladServiceTasks" style="width:100%;height:50%;float:left;position:relative;"></div>\
					       <div id="dvSkladServiceTasksDetail" style="width:100%;height:50%;float:left;position:relative;"></div>')
		var params = {};
		params.docid = docid;
        $.getJSON('skladServTasks',params,function(JSON) {
			if (!showErr(JSON)) {
				var html = '<table><thead>\
								<tr>\
									<th rowspan="2">Номер</th>\
									<th rowspan="2">Метод</th>\
									<th rowspan="2">Сотрудник</th>\
									<th colspan="2">Время</th>\
									<th colspan="2">Заказ</th>\
									<th colspan="4">Задания</th>\
									<th colspan="4">Отобрано</th>\
									<th title="Уровень сервиса склада">УСС</th>\
								</tr>\
								<tr>\
									<th ksort="DateTime" title="">Начало</th>\
									<th ksort="DateTime" title="">Завершение</th>\
									<th ksort="digit" title="Позиций">Поз</th>\
									<th ksort="digit">Сумма</th>\
									<th ksort="digit">Поз</th>\
									<th ksort="digit">Сумма</th>\
									<th ksort="digit">Вычерк</th>\
									<th ksort="digit" title="Коэффициент присутствия товара">%КПТ</th>\
									<th ksort="digit">Сумма</th>\
									<th ksort="digit" title="Сумма в минус">С-</th>\
									<th ksort="digit" title="Сумма в плюс">С+</th>\
									<th ksort="digit" title="Коэффициент отбираемости товара">%КОТ</th>\
									<th ksort="digit">%</th>\
								</tr>\
				           </thead><tbody>';
				var cntpos_s = 0, sumtask_s = 0.0, badselect_s = 0.0, sumselect_s = 0.0,
				sumselectminus_s = 0.0, sumselectplus_s = 0.0;
				for(var i = 0; i<JSON.data.length; i++) {
					var tr = JSON.data[i];
					var sumtask_p = kFloat((tr.SUMTASK-tr.BADSELECT)*100/tr.SUMTASK,2);
					var sumselect_p = kFloat((tr.SUMSELECT-tr.SUMSELECTPLUS)*100/(tr.SUMTASK-tr.BADSELECT),2);
					var servicepercent = kFloat(100 - (tr.BADSELECT+tr.SUMSELECTMINUS)*100/tr.SUMTASK,2);
					html += '<tr taskid="'+tr.TASKID+'">'+
							 '<td class="">'+tr.TASKID+'</td>'+
							 '<td class="text">'+tr.TMNAME+'</td>'+
							 '<td class="text">'+tr.UNAME+'</td>'+
							 '<td class="">'+tr.BTIME+'</td>'+
							 '<td class="">'+tr.ETIME+'</td>'+
							 '<td class="number">'+tr.CNTPOS+'</td>'+
							 '<td class="number">'+kFloat(tr.SUMTASK,2)+'</td>'+
							 '<td class="number">'+tr.CNTPOS+'</td>'+
							 '<td class="number">'+kFloat(tr.SUMTASK,2)+'</td>'+
							 '<td class="number">'+kFloat(tr.BADSELECT,2)+'</td>'+
							 '<td class="number">'+sumtask_p+'</td>'+
							 '<td class="number">'+kFloat(tr.SUMSELECT,2)+'</td>'+
							 '<td class="number">'+kFloat(tr.SUMSELECTMINUS,2)+'</td>'+
							 '<td class="number">'+kFloat(tr.SUMSELECTPLUS,2)+'</td>'+
							 '<td class="">'+sumselect_p+'</td>'+
							 '<td class="">'+servicepercent+'</td>'+
							 '</tr>';
					cntpos_s += tr.CNTPOS;
					sumtask_s += tr.SUMTASK;
					badselect_s += tr.BADSELECT;
					sumselect_s += tr.SUMSELECT;
					sumselectminus_s += tr.SUMSELECTMINUS;
					sumselectplus_s += tr.SUMSELECTPLUS;
				} 
				html += '</tbody><tfoot><tr>'+
							'<th>'+i+'</th>'+
							'<th colspan="4"></th>'+
							'<th>'+cntpos_s+'</th>'+
							'<th>'+kFloat(sumtask_s,2)+'</th>'+
							'<th>'+cntpos_s+'</th>'+
							'<th>'+kFloat(sumtask_s,2)+'</th>'+
							'<th>'+kFloat(badselect_s,2)+'</th>'+
							'<th>'+'</th>'+
							'<th>'+kFloat(sumselect_s,2)+'</th>'+
							'<th>'+kFloat(sumselectminus_s,2)+'</th>'+
							'<th>'+kFloat(sumselectplus_s,2)+'</th>'+
							'<th>'+'</th>'+
							'<th>'+'</th>'+
							'</tr></tfoot></table>';
				$('#dvSkladServiceTasks').html(html)
					.find('table')
						.kTblScroll()
						.kTblSorter()
						.rowFocus({rfSetDefFocus:false,
								 rfFocusCallBack:function() {
									var params = {};
									params.taskid = $(this).attr('taskid');
									$.getJSON('skladServTasksDetail',params,skladServTaskDetail)
								 }
								 })
			}
		});
		
	}

	function skladServTaskDetail(JSON) {
		if (!showErr(JSON)) {
			var html = '<table><thead>\
								<tr>\
									<th rowspan="2">Код</th>\
									<th rowspan="2">Наименование</th>\
									<th colspan="2">Время</th>\
									<th colspan="1">Заказ</th>\
									<th colspan="3">Задания</th>\
									<th colspan="4">Отобрано</th>\
									<th title="Уровень сервиса склада">УСС</th>\
								</tr>\
								<tr>\
									<th ksort="DateTime" title="">Начало</th>\
									<th ksort="DateTime" title="">Завершение</th>\
									<th ksort="digit">Сумма</th>\
									<th ksort="digit">Сумма</th>\
									<th ksort="digit">Вычерк</th>\
									<th ksort="digit" title="Коэффициент присутствия товара">%КПТ</th>\
									<th ksort="digit">Сумма</th>\
									<th ksort="digit" title="Сумма в минус">С-</th>\
									<th ksort="digit" title="Сумма в плюс">С+</th>\
									<th ksort="digit" title="Коэффициент отбираемости товара">%КОТ</th>\
									<th ksort="digit">%</th>\
								</tr>\
				           </thead><tbody>';
				var cntpos_s = 0, sumtask_s = 0.0, badselect_s = 0.0, sumselect_s = 0.0,
				sumselectminus_s = 0.0, sumselectplus_s = 0.0;
				for(var i = 0; i<JSON.data.length; i++) {
					var tr = JSON.data[i];
					var sumtask_p = kFloat((tr.SUMTASK-tr.BADSELECT)*100/tr.SUMTASK,2);
					var sumselect_p = kFloat((tr.SUMSELECT-tr.SUMSELECTPLUS)*100/(tr.SUMTASK-tr.BADSELECT),2);
					var servicepercent = kFloat(100 - (tr.BADSELECT+tr.SUMSELECTMINUS)*100/tr.SUMTASK,2);
					html += '<tr>'+
							 '<td class="">'+tr.WCODE+'</td>'+
							 '<td class="text">'+tr.WNAME+'</td>'+
							 '<td class="">'+tr.BTIME+'</td>'+
							 '<td class="">'+tr.ETIME+'</td>'+
							 '<td class="number">'+kFloat(tr.SUMTASK,2)+'</td>'+
							 '<td class="number">'+kFloat(tr.SUMTASK,2)+'</td>'+
							 '<td class="number">'+kFloat(tr.BADSELECT,2)+'</td>'+
							 '<td class="number">'+sumtask_p+'</td>'+
							 '<td class="number">'+kFloat(tr.SUMSELECT,2)+'</td>'+
							 '<td class="number">'+kFloat(tr.SUMSELECTMINUS,2)+'</td>'+
							 '<td class="number">'+kFloat(tr.SUMSELECTPLUS,2)+'</td>'+
							 '<td class="">'+sumselect_p+'</td>'+
							 '<td class="">'+servicepercent+'</td>'+
							 '</tr>';
					sumtask_s += tr.SUMTASK;
					badselect_s += tr.BADSELECT;
					sumselect_s += tr.SUMSELECT;
					sumselectminus_s += tr.SUMSELECTMINUS;
					sumselectplus_s += tr.SUMSELECTPLUS;
				} 
				html += '</tbody><tfoot><tr>'+
							'<th>'+i+'</th>'+
							'<th colspan="3"></th>'+
							'<th>'+kFloat(sumtask_s,2)+'</th>'+
							'<th>'+kFloat(sumtask_s,2)+'</th>'+
							'<th>'+kFloat(badselect_s,2)+'</th>'+
							'<th>'+'</th>'+
							'<th>'+kFloat(sumselect_s,2)+'</th>'+
							'<th>'+kFloat(sumselectminus_s,2)+'</th>'+
							'<th>'+kFloat(sumselectplus_s,2)+'</th>'+
							'<th>'+'</th>'+
							'<th>'+'</th>'+
							'</tr></tfoot></table>';
				$('#dvSkladServiceTasksDetail').html(html)
					.find('table')
						.kTblScroll()
						.kTblSorter()
		}
	}

})(jQuery);