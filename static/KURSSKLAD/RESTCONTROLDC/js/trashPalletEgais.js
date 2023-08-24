// Остатки товаров
var tblReport;

$(document).ready(function () {
  $('#dvData').css({'height': kScreenH(), 'width': '100%'});

  $('#btnExcel').click(function () {
        if ($('#tblRS tbody tr').length > 0) {
            export_table_to_excel_name($('#tblRS').get(0), $('#sys-name').text() + ' ' + kNow() + '.xlsx')
        } else {
            alert('Заполните таблицу!')
        }
    });

  $("form.buttons").unbind('submit').submit(function () {
    var P = $(this).kFormSubmitParam();

    $.getJSON('qTrashPalletEgaisList', P, function (json) {
      if (showErr(json)){
        return;
      }
      if (tblReport)
        $.TblDel(tblReport);
      tblReport = $('#dvData')
        .Tbl({
          code: json.ext_data.egaisobj == 'box' ? 'RESTCTRL_EGAIS_BOX' : 'RESTCTRL_EGAIS_MARK',
          rowFocus: {rfSetDefFocus: false},
          events: function () {
            //$(this).find('tbody>tr>td[class*=rest]').unbind('dblclick').dblclick(expeditionRestWares)
          }
        });

      var jsonFull = {data: [], ext_data:[json.ext_data]};
      $.progressDo({
        arr: json.data,
        extParams: { whid: json.ext_data.OBJID},//входящие параметры
        arrNullAlert: 'Товары не найдены',
        url: json.ext_data.egaisobj == 'box' ? 'qTrashPalletEgaisBoxData' : 'qTrashPalletEgaisMarkData',
        funcParams: function (item) {
          return {egaisid: item.ID};
        },
        funcIter: function (json) {
          jsonFull.data.push(json.data);
        },
        funcEnd: function () {
            if(jsonFull.data.length > 0){
              tblReport.data(jsonFull);
            }
            else
              alert ('Нет товаров');
        }

      });
    });

    return false;
  });
});