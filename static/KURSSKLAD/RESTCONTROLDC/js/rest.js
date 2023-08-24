// Остатки товаров
var tblRC;
var tblPal;
var $dv;
;
(function ($) {

SetTr = function (data, clmSortKey) {
  var html = '<tfoot><tr>';
  for (var i = 0; i < clmSortKey.length; i++) {
    switch (clmSortKey[i]) {
      case 'Q':
            html += '<th>' +kNumber(data['Q']) + '</th>';
            break;
      case 'QS':
            html += '<th>' + kNumber(data['QS']) + '</th>';
            break;
      case 'QB':
            html += '<th>' + kNumber(data['QB']) + '</th>';
            break;
      case 'QR':
            html += '<th>' + kNumber(data['QR']) + '</th>';
            break;
      case 'QT':
            html += '<th>' + kNumber(data['QT']) + '</th>';
            break;
      case 'QN':
            html += '<th>' + kNumber(data['QN']) + '</th>';
            break;
      case 'QE':
            html += '<th>' + kNumber(data['QE']) + '</th>';
            break;
      case 'WCODE':
            html += '<th>' + kNumber(data['amn']) + '</th>';
            break;
      default:
        html += '<th></th>';
    }
  }
  html += '</tr></tfoot>';
  return html;
};
SetTrPal = function (data, clmSortKey) {
  var html = '<tfoot><tr>';
  for (var i = 0; i < clmSortKey.length; i++) {
    switch (clmSortKey[i]) {
      case 'Q2':
            html += '<th>' +kNumber(data['Q']) + '</th>';
            break;
      case 'PNUMBER':
            html += '<th>' + kNumber(data['amn']) + '</th>';
            break;
      default:
        html += '<th></th>';
    }
  }
  html += '</tr></tfoot>';
  return html;
};

CalcTr = function(tr, tFootData){
  tFootData['Q'] = (tFootData['Q'] == undefined ? 0 : tFootData['Q']) + kFloat(tr['Q']);
  tFootData['QS'] = (tFootData['QS'] == undefined ? 0 : tFootData['QS']) + kFloat(tr['QS']);
  tFootData['QB'] = (tFootData['QB'] == undefined ? 0 : tFootData['QB']) + kFloat(tr['QB']);
  tFootData['QR'] = (tFootData['QR'] == undefined ? 0 : tFootData['QR']) + kFloat(tr['QR']);
  tFootData['QT'] = (tFootData['QT'] == undefined ? 0 : tFootData['QT']) + kFloat(tr['QT']);
  tFootData['QN'] = (tFootData['QN'] == undefined ? 0 : tFootData['QN']) + kFloat(tr['QN']);
  tFootData['QE'] = (tFootData['QE'] == undefined ? 0 : tFootData['QE']) + kFloat(tr['QE']);
  tFootData['amn'] = (tFootData['amn'] == undefined ? 0 : tFootData['amn']) + 1;
};

CalcTrPal = function(tr, tFootData){
  tFootData['Q'] = (tFootData['Q'] == undefined ? 0 : tFootData['Q']) + kFloat(tr['Q']);
  tFootData['amn'] = (tFootData['amn'] == undefined ? 0 : tFootData['amn']) + 1;
};



expeditionRestWares = function () {
  var $tr = $(this).closest('tr');
  var tblExtData = $tr.TblExtData()['0'];
  var objTr = $tr.TblTrDataById();

  var str = $(this).attr('class');
  var reg = /rest\s\w/gi; // 'rest S'

  var params = {
    objid: tblExtData.OBJID,
    zoneid: tblExtData.SZID,
    wid: objTr.WID,
    restcontroltype: str.match(reg)[0].replace(/rest\s/gi,'')
  };

  if (!params.restcontroltype) {
    return false;
  }

  if (tblPal)
      tblPal = $.TblDel(tblPal);
  tblPal = $dv.Tbl({
    code: 'RESTCONTROLPAL',
    foot: {footCalc: CalcTrPal, footSet: SetTrPal},
  });

  $.getJSON('qRestPallet', params, function (json) {
    if (!showErr(json)) {
      $dv.dialog('option', 'title', objTr.WCODE + ' ' + objTr.WNAME).dialog("open");
      tblPal.data(json);
    }
  });
  return false

};

printReport = function (json) {
  var jsonFull = {data: [], ext_data:[json.ext_data]};
  $.progressDo({
    arr: json.data,
    extParams: { whid: json.ext_data.OBJID, szid: json.ext_data.SZID },//входящие параметры
    arrNullAlert: 'Товары не найдены',
    url: 'qRestWaresCalc',
    funcParams: function (item) {
      return {waresid: item.WID};
    },
    funcIter: function (JSON) {
      var d = JSON.data;
      d.QBCLASS = 'rest B';
      d.QSCLASS = 'rest S';
      d.QRCLASS = 'rest R';
      d.QTCLASS = 'rest T';
      d.QECLASS = 'rest E';
      d.QNCLASS = 'rest N';
      jsonFull.data.push(JSON.data);
    },
    funcEnd: function () {
        if(jsonFull.data.length > 0)
          tblRC.data(jsonFull);
        else
          alert ('Нет товаров');
    }

  });
}

})(jQuery);

$.Excel = function () {
  if ($('table').get(0)) {
    export_table_to_excel_name($('table').get(0), $('#sys-name').text() + ' ' + kNow() + '.xlsx')
  } else {
    alert('Заполните таблицу!')
  }
};

$(document).ready(function () {
  $('#dvData').css({'height': kScreenH(), 'width': '100%'});


  $dv = $("<div/>").attr("id", 'dvDialogExpedition').addClass("flora").css("text-align", "center")
        .dialog({closeOnEscape: false,  autoOpen: false,
          resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
          height: kScreenH() * 0.8, width: kScreenW() * 0.8, position: ['center', 'center']});

  $("form.buttons").unbind('submit').submit(function () {
    var P = $(this).kFormSubmitParam();
    if (tblRC)
      tblRC = $.TblDel(tblRC);
    tblRC = $('#dvData').Tbl({
      code: 'RESTCONTROL',
      rowFocus: {rfSetDefFocus: false},
      events: function(){
        $(this).find('tbody>tr>td[class*=rest]').unbind('dblclick').dblclick(expeditionRestWares)
      },
      foot: {footCalc: CalcTr,footSet: SetTr},
      contextMenu: {
        optSortKey: ['Excel'],
        funcExcel: $.Excel, classExcel: 'Excel', nameExcel: 'Файл',
      }
    });



    $.getJSON('qRestWaresList', P, printReport);
    return false;
  });
});