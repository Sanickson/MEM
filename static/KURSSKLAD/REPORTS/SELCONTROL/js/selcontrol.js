$(document).ready(function(){
    if ($("#dvZone").length)
        $("#dvZone").remove();
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
                    $('#zone').attr('obj', objid);
                } else $('#zone').attr('obj', '');
            })
            .html(html)
            .find('table')
            .kTdChk();

        //$dv.bind("beforeclose", function( event, ui ) {console.log('close')} );

        $.unblockUI();
    });

	$('#bdate,#edate').val(whToday());
	$('#btime').val('00:00:00');
	$('#etime').val('23:59:59');

	var containerheight = kScreenH();
    $("#dvMain").css({"height":containerheight});
    $.request({
        url: 'getSelectUsers',
        success: function(resp){
            $.each(resp.data, function(key, value){
                $('#select').append('<option value="'+value.ID_USER+'">' + value.FIO);
            });

        }
    });
    $.request({
        url: 'getAlgorithm',
        success: function(resp){
            $.each(resp.data, function(key, value){
                $('#algorithm').append('<option value="'+value.METHODID+'">' + value.TMNAME);
            });

        }
    });
    $.request({
        url: 'getControlUsers',
        success: function(resp){
            $.each(resp.data, function(key, value){
                $('#control').append('<option value="'+value.ID_USER+'">' + value.FIO);
            });

        }
    });
	// $("#toobjid").kObjAutoComplete({hiddenName:"toobj"});

	// $('#wares').kWaresLocate({
	// 	success: function(wid,wcode,wname){
	// 		$('#wares').attr('data-id', wid);
	// 		$('#cancel').attr('title', wcode + ' ' + wname).show();
	// 	}
	// });

	$('#cancel').bind('click', function(){
		$('#wares').removeAttr('data-id');
		$('#cancel').hide();
	});
	
	$('form').unbind('submit').submit(function(){
		var params = getParams();
        $("#dvMaster,#dvDetail,#dvTask").empty();
        $.blockUI({message: '<h2>...загрузка...</h2>'});
        $.getJSON('master', params, function(JSON){
            if (!showErr(JSON)) {
                var html = '<table id="tblMaster"><thead><tr>' +
					'<th>Магазин' +
					'<th title="Количество заданий контроля">Задания' +
					'<th title="Количество заданий контроля с расхождениями">Расхождения' +
                    '</tr></thead><tbody>';
                var cnttask=0; cntfailed=0;
                for (var i = 0; i < JSON.data.length; i++){
                    var td = JSON.data[i];
                    html += '<tr data-objid="'+td.OBJID+'" style="'+(td.CNTFAILED > 0 ? 'background: red;' : '')+'">' +
                        '<td class="text">' + td.OBJNAME + '</td>' +
                        '<td class="number">' + td.CNTTASK + '</td>' +
                        '<td class="number" title="'+td.FAILEDFIO+'">' + td.CNTFAILED + '</td>' +
                        '</tr>';
                    cnttask += td.CNTTASK;
                    cntfailed += td.CNTFAILED;
                }
                html += '</tbody><tfoot><tr><th>'+JSON.data.length+'</th><th>'+cnttask+'</th><th>'+cntfailed+'</th></tr></tfoot>';
                $('#dvMaster')
                    .html(html)
                    .find('table')
                    .kTblScroll()
                    .kTblSorter()
                    .rowFocus({rfFocusCallBack: masterFocus, rfSetDefFocus: false});
            }
            $.unblockUI();
        });

		return false;
	});

    $('#zone').click(function () {

        if ($("#dvZone").length){
            $("#dvZone").dialog("open")
                .find('table').kTblScroll();

        }
    });

    function getParams(){
        var params = {};
        params.dbeg = $('#bdate').val() + ' ' + $('#btime').val();
        params.dend = $('#edate').val() + ' ' + $('#etime').val();
        params.fromobj = $('#zone').attr('obj');
        params.select = $('#select').val();
        params.control = $('#control').val();
        params.algorithm = $('#algorithm').val();
        return params;
    }

    function masterFocus(){
        $('#dvDetail,#dvTask').empty();
        var tr = $(this);
        var params = getParams();
        params.objid = tr.attr('data-objid');
        $.request({
            url: 'detail',
            data: params,
            success: function(resp){
                var html = '<table id="tblDetail"><thead><tr>' +
					'<th ksort="digit" title="Номер задания контроля"> № Контроля' +
					'<th ksort="text">Паллет' +
					'<th>Начато' +
					'<th>Завершено' +
					'<th ksort="text">Контролер' +
                    '<th ksort="digit" title="Номер задания отборки">№ Отборки' +
					'<th ksort="text">Отборщик' +
                    '</tr></thead><tbody>';
                for (var i = 0; i < resp.data.length; i++){
                    var td = resp.data[i];
                    html += '<tr data-taskid="'+td.CONTROLTASKID+'" style="'+(td.FAILED > 0 ? 'background: red;' : '')+'">' +
                        '<td>' + td.CONTROLTASKID + '</td>' +
                        '<td>' + td.PBARCODE + '</td>' +
                        '<td>' + td.BEGTIME + '</td>' +
                        '<td>' + td.ENDTIME + '</td>' +
                        '<td class="text">' + td.CONTROLFIO + '</td>' +
                        '<td>' + td.SELTASKID + '</td>' +
                        '<td class="text"> ' + td.SELFIO + '</td>' +
                        '</tr>';
                }
                $('#dvDetail')
                    .html(html)
                    .find('table')
                    .kTblScroll()
                    .kTblSorter()
                    .rowFocus({rfFocusCallBack: detailFocus});
            }
        })
    }

    function detailFocus(){
        $('#dvTask').empty();
        var tr = $(this);
        $.request({
            url: 'task',
            data: {taskid: tr.attr('data-taskid')},
            success: function(json){
                var html = '<table id="tblTaskWares"><thead>'+
                              '<tr><th colspan=5>Товар</th>' +
                              '<th colspan=4>Отобрано</th>' +
                              '<th colspan=4>Проверено</th></tr>' +
                  '<tr>' +
                  '<th ksort="digit">Код</th>' +
                  '<th ksort="text">Наименование</th>' +
                  '<th ksort="text" title="Заказ в единицах отображения">Заказ ЕО</th>' +
                  '<th ksort="digit" title="Заказ в основной единице измерений">Заказ ОЕИ</th>' +
                  '<th ksort="dateTime">Время контроля</th>' +
                  '<th ksort="digit" title="Вес тары">ВТ</th>' +
                  '<th ksort="digit" title="Количество тарных единиц">КТЕ</th>'+
                  '<th ksort="text" title="Количество в единицах отображения">КЕО</th>' +
                  '<th ksort="digit" title="Количество в основной единице измерения">КОЕИ</th>'+
                  '<th ksort="digit" title="Вес тары">ВТ</th>' +
                  '<th ksort="digit" title="Количество тарных единиц">КТЕ</th>'+
                  '<th ksort="text" title="Количество в единицах отображения">КЕО</th>' +
                  '<th ksort="digit" title="Количество в основной единице измерения">КОЕИ</th>'+
                  '</tr></thead><tbody>';
                for (var i=0; i<json.data.length; i++) {
                    var tr = json.data[i]
                    html += '<tr style="'+(Math.abs(tr.QSEL - tr.QCHK) > 0 ? 'background: red;' : '')+'">'+
                      '<td class="number">'+tr.WCODE+'</td>'+
                      '<td class="text">'+tr.WNAME+'</td>'+
                      '<td title="'+viewTitle(tr.MUC,tr.VUF,tr.VUC)+'">'+viewQuantity(tr.QPLAN,tr.VUF,tr.VUC,tr.MUF,tr.MUC)+'</td>' +
                      '<td class="number">'+kNumber(tr.QPLAN)+'</td>' +
                      '<td>'+(tr.ETIME ? kDateTime(tr.ETIME) : '')+'</td>'+
                      '<td>' + (tr.TWSEL ? kNumber(tr.TWSEL) : '') + '</th>' +
                      '<td>' + (tr.SUSEL || '') + '</th>' +
                      '<td title="'+viewTitle(tr.MUC,tr.VUF,tr.VUC)+'">'+viewQuantity(tr.QSEL,tr.VUF,tr.VUC,tr.MUF,tr.MUC)+'</td>' +
                      '<td class="number">'+kNumber(tr.QSEL)+'</td>' +
                      '<td>' + (tr.TWCHK ? kNumber(tr.TWCHK) : '') + '</th>' +
                      '<td>' + (tr.SUCHK || '') + '</th>' +
                      '<td title="'+viewTitle(tr.MUC,tr.VUF,tr.VUC)+'">'+viewQuantity(tr.QCHK,tr.VUF,tr.VUC,tr.MUF,tr.MUC)+'</td>' +
                      '<td class="number">'+kNumber(tr.QCHK)+'</td>'+
                      '</tr>';
                }
                html += '</tbody></table>';

                $('#dvTask')
                    .html(html)
                    .find('table')
                    .kTblScroll()
                    .kTblSorter()
            }
        })
    }
})

;(function($){


})(jQuery);