$(document).ready(function () {

  $("#dvMain").css({"height": kScreenH()});

  $('#frm').submit(frmSubmit);

  $.blockUI({message: '<h2>...загрузка складов...</h2>'});
  $.request({
    url: 'getObjects',
    async: false,
    success: function (json) {
      $.unblockUI();
      if (showErr(json)) return;
      if (json.data.length > 0){
        var html = '';
        for (var i = 0; i < json.data.length; ++i)
          html += '<option value="' + json.data[i].OBJID + '" ' + (json.data[i].OBJID == json.ext_data.curzone ? 'selected' : '') + '>' + json.data[i].OBJNAME + '</option>';
        $('#whid').html(html).change(function () {
          frmSubmit.call($(this).parents('form:first'));
        }).change();
      }
    }
  });

  function frmSubmit(){
    var P = $(this).kFormSubmitParam();
    if (!P.whid){
      alert('Не установлен склад');
    }
    else{
      $.blockUI({message: '<h2>...формирование отчета...</h2>'});
      $.getJSON('qInBlocking', P, $.inBlocking);
    }
    return false;
  }
})

;
(function ($) {
  $.inBlocking = function (json) {
    if (!showErr(json)) {
      var html = '<table id="tbl" whid="' + json.ext_data.whid + '"><thead><tr>\
							<th colspan="5" ksort="text">Блокировка</th>\
							<th colspan="3" ksort="text">Документ</th>\
							<th colspan="5" ksort="text">Товар</th>\
							</tr><tr>\
							<th ksort="text">Сотрудник</th>\
							<th ksort="false" title="Статус">Ст</th>\
							<th ksort="DateTime" title="Дата и время блокировки">Дата Время</th>\
							<th ksort="text" title="Причина блокировки">Причина</th>\
							<th ksort="text">Описание</th>\
							<th title="" ksort="text">Номер</th>\
							<th title="Дата документа" ksort="shortDate">Дата</th>\
							<th title="" ksort="text">Клиент</th>\
							<th title="Код товара" ksort="text">Код</th>\
							<th title="" ksort="text">Наименование</th>\
							<th title="Дата производства" ksort="shortDate">Дата</th>\
							<th title="Количество" ksort="text">Кол-во</th>\
							<th ksort="text" title="Местоположение">МП</th>\
						</tr></thead><tbody>';
      for (var i = 0; i < json.data.length; i++) {
        var tr = json.data[i];
        var sitename = tr.SITENAME.split(',');
        sitename = (sitename.length > 7) ? tr.SITENAME.split(',', 7).join(', ') + ', ...' : sitename.join(', ');
        var title = tr.VUCODE ? viewTitle(tr.MUCODE, tr.VUFACTOR, tr.VUCODE) : 'Единица отображения не установлена!';
        html += '<tr wliid="' + tr.ID + '">' +
          '<td class="text">' + tr.MANNAME + '</td>' +
          $.tdPlusMinus(tr.STATUS) +
          '<td class="date">' + tr.LASTDATE + '</td>' +
          '<td class="text">' + tr.REASON + '</td>' +
          '<td class="text">' + tr.DESCRIPTION + '</td>' +
          '<td class="text">' + tr.DOCNUMBER + '</td>' +
          '<td class="date">' + kDate(tr.DOCDATE) + '</td>' +
          '<td class="text">' + tr.CLIENTNAME + '</td>' +
          '<td class="text">' + tr.GCODE + '</td>' +
          '<td class="text">' + tr.GNAME + '</td>' +
          '<td class="date">' + kDate(tr.PRDATE) + '</td>' +
          '<td title="' + title + '">' + viewQuantity(tr.AMOUNT, tr.VUFACTOR, tr.VUCODE, tr.MUFACTOR, tr.MUCODE) + '</td>' +
          '<td class="text" title="' + tr.SITENAME + '">' + sitename + '</td>' +
          '</tr>';
      }
      html += '</tbody><tfoot class="buttons"><tr>' +
        '<th>' + i + '</th>' +
        '<th colspan="13"><button type="button" title="Печать"><img src="' + eng_img + '/actions/printer.png" border="0">Печать</button></th>' +
        '</tr></tfoot></table>';
      $('#dvMain').html(html)
        .find('table:first').kTblScroll().kTblSorter().rowFocus({rfSetDefFocus: false})
        .find('button').click(function () {
          var wnd = window.open(sp_reports + '/printWaresLotIncomeHist.html');
          var objid = $('#tbl').attr('whid');
          var obj_text = $('#whid>option[value="' + objid + '"]').text();
          wnd.onload = function () {
            wnd.document.getElementById("dvHeader").innerHTML = 'Заблокированные парии. Склад: ' + obj_text;
            wnd.document.getElementById("tbl").innerHTML = $('#tbl').printHTML();
          }
        })
    }
    $.unblockUI();
  };

})(jQuery);