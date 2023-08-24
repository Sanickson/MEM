include(eng_js + '/options.js');

$(document).ready(function () {
  var contextFundAdd = opt('view', null, 'contextFundAdd');
  $('#dvFilterDateBeg,#dvFilterDateEnd').val(getToday()).mask("99.99.9999").datepicker().css('text-align', 'center');
  $('#dvFilterTimeBeg,#dvFilterTimeEnd')
    .mask("99:99")
    .bind('change', function () {
      var str = $(this).val();
      if (str == '')
        str = '00:00';
      var hour = str.split(':')[0];
      var time = str.split(':')[1];
      if (parseInt(hour, 10) > 23)
        hour = '23';
      if (parseInt(time, 10) > 59)
        time = '59';
      $(this).val(hour + ':' + time);
    });

  var height = kScreenH(); // - $("#dvFilter").height();
  $("#dvScreen").css({"height": height,
    "width": "100%",
    "overflow-x": "auto",
    "overflow-y": "hidden",
    "padding-bottom": "16px"});

  $("#frmFilter").submit(function(){
    $('#dvScreen').empty();
    var P = {
      dtbeg: $('#dvFilterDateBeg').val() + ' ' + $('#dvFilterTimeBeg').val() + ':00',
      dtend: $('#dvFilterDateEnd').val() + ' ' + $('#dvFilterTimeEnd').val() + ':59'
    };
    $.getJSON('qpalleti', P, data);
    return false;
  });
  
  function data(json){
    if (showErr(json)){
      return;
    }
    var html = '<table id="tblPalleti"><thead><tr>' +
        '<th ksort="text" title="Признак использованной этикетки">И</th>' + 
        '<th ksort="text" title="Номер паллета">Номер</th>' +
        '<th ksort="DateTime" title="Дата и время печати">ДВ</th>' +
        '<th ksort="text" title="Пользователь, создавший задание на печать этикетки">Пользователь</th>' +
        '</tr></thead><tbody>';
    var cntPallets = 0;    
    for (var i=0; i<json.data.length; i++){
        var tr = json.data[i];
        html += '<tr>' +
            '<td pid="' + tr.PID + '"><input type=checkbox disabled' + ((tr.PID && ++cntPallets) ? ' checked' : '') + '></td>' +
            '<td>' + tr.PNUM + '</td>' +
            '<td>' + kDateTime(tr.DT) + '</td>' +
            '<td class="text">' + tr.MANFIO + '</td>' +
          '</tr>';
    }
    html += '</tbody><tfoot><tr><th>' + cntPallets + '</th><th>' + json.data.length + '</th><th colspan=4>&nbsp;</th></tfoot></table>';
    $('#dvScreen').html(html).find('table:first').kTblScroll().kTblSorter();
    $('#tblPalleti').tblPalletiEvents();
  }

  $.fn.tblPalletiEvents = function(){
		function menu(action, el){
			if (action == 'fundAdd')
				// fundAdd.call(el);
                //alert("it's work!");
                printLabel($("#tblPalleti").rf$GetFocus().find('td:eq(0)').attr('pid'));
		};

		var mId = 'menuTblPalleti';
		if ($("#"+mId).length==0){
				$("<ul/>").attr("id",mId).addClass("contextMenu").css("width","190px")
					.html('<li class="print"><a href="#fundAdd">Перепечатать этикетку</a></li>')
				.appendTo($(document.body));
		}

		if (contextFundAdd){
			if (this.is('tr'))
				this.rowFocus().contextMenu({menu:mId}, menu);
			else
				this.rowFocus().find('tbody>tr').contextMenu({menu:mId}, menu);
		}
		else{
			this.rowFocus();
		}

		return this;
	};

  function printLabel(pid) {
      if (pid == ''){
          alert('Этикетка еще не была использована, перепечать не возможна');
          return false}
      $.getJSON('printers', function (json) {
          var html = '<form id="formPrintLabel"><table style="width: 100%"><tbody><tr><td>Принтер для печати:</td>' +
              '<td style="align: right"><select id="printers" style="text-align: right">';
          for (var i = 0; i < json.data.length; ++i)
            html += '<option value="' + json.data[i].ALIAS + '">' + json.data[i].ALIAS + '</option>';
          html += '</select></td></tr><tr><td>Количество этикеток:</td><td style="align: right"><input type="text" id="cnt" size="2" value="1" style="text-align: right"></td></tr></tbody></table><br>' +
              '<div style="width:100%;height:15%;" class="buttons"><br>\
                                <button type="button" id=""><img src="' + eng_img + '/actions/accept.png" border="0">Ок</button>&nbsp;&nbsp;\
                                <button type="button" id=""><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>\
                               </div></form>';

          var $dv = $('#dvPrintLabel');
          if ($dv.length) {
              //$dv.dialog('open');
              $dv.remove();
          };

              var $dv = $("<div/>").attr("id", "dvPrintLabel").addClass("flora").css("text-align", "center")
                  .dialog({
                      closeOnEscape: false,
                      title: 'Печать этикетки',
                      autoOpen: true,
                      resizable: false,
                      draggable: false,
                      modal: true,
                      overlay: {opacity: 0.5, background: "black"},
                      height: 150,
                      width: 300
                  })
                  .html('<div style="position:relative;loat:left;width:100%;height:85%;">' + html + '</div>')
                  .find('#cnt').kInputInt().end()
                  .find("button:last").click(function(){ $("#dvPrintLabel").dialog("close"); }).end()
                  .find('button:first').click(function(){
                    if (($('#printers').val()=='') || (($('#cnt').val()=='') || ($('#cnt').val()=='0'))){
                        alert("Введите все значения");
                        return false
                    }

                    $.getJSON('print_label', {pid: pid, printer: $('#printers').val(), cnt: $('#cnt').val()},
                        function(json) {
                        if (showErr(json))
                            return false;
                    });
                    $("#dvPrintLabel").dialog("close");
                    alert('Этикетка отправлена на печать');
                  });

              $dv.find('table')
                  .filter(':last').click(function () {
                  $dv.dialog('close')
              });

      });
  }
});
