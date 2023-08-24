$(document).ready(function () {
  $.datepicker.setDefaults($.extend($.datepicker.regional['ru']));

  $.blockUI({message: '<h2>...загрузка зон...</h2>'});
  $.getJSON('getObjects', function (JSON) {
    for (var i = 0; i < JSON.data.length; ++i)
      $('#fromobj').append('<option value="' + JSON.data[i].OBJID + '" ' + (JSON.data[i].OBJID == JSON.ext_data.curzone ? 'selected' : '') + '>' + JSON.data[i].OBJNAME + '</option>');
    if (JSON.data.length == 1) $('#fromobj').attr({'disabled': 'disabled'})
    $.unblockUI();
  });

  $("#sdppm_min,#sdppm_max,#ovdd_max,#ovdd_min").kInputFloat().val('');

  $("#dbeg,#dend").datepicker().mask("99.99.9999")
    .filter(':first').val(kToday(-14)).end()
    .filter(':last').val(kToday());

  $('#dvMain').css({'height': kScreenH()});

  $("#btnPrint").click(function () {
    if ($("#tblData").length) {
      var wnd = window.open(sp_reports + '/print.html');
      wnd.onload = function () {
        wnd.document.getElementById("info").innerHTML = 'Оборачиваемость склада<br>Объект: ' + $('#fromobj>option:selectted').text() + ' Период: ' + $('#dbeg').val() + ' по ' + $('#dend').val();
        wnd.document.getElementById("tblPrint").innerHTML = $("#tblData").printHTML();
      };
    }
    else alert('Нет данных для печати');
  });

   $('#btnExcel').click(function () {
        if ($('#tblData').get(0)) {
            export_table_to_excel_name($('table').get(0), $('#sys-name').text() + ' ' + kNow() + '.xlsx')
        } else {
            alert('Заполните таблицу!')
        }
    });


  $('#sysmenu>form').submit(function () {
    var params = {};
    params.objid = $('#fromobj').val();
    params.dbeg = $('#dbeg').val();
    params.dend = $('#dend').val();
    $.getJSON('getWares', params, $.tblData);
    return false;
  });

});

function validValue(val) {
  return (val.length ? val : 'null');
}

;
(function ($) {
  $.tblData = function (json) {
    if (!showErr(json)) {

      var objid = json.ext_data.objid;
      var dbeg = json.ext_data.dbeg;
      var dend = json.ext_data.dend;
      var sdppm_min = validValue($('#sdppm_min').val());
      var sdppm_max = validValue($('#sdppm_max').val());
      var ovdd_min = validValue($('#ovdd_min').val());
      var ovdd_max = validValue($('#ovdd_max').val());


      var typeRest = $('#typeRest').val();
      var html = '<table id="tblData"><thead>\
							<tr>\
								<th colspan="3">Товар</th>\
								<th colspan="2">Остаток</th>\
								<th colspan="1"></th>\
								<th colspan="2">Продажа</th>\
								<th colspan="1"></th>\
							</tr>\
							<tr>' +
        '<th ksort="digit">Код</th>' +
        '<th ksort="text">Наименование</th>' +
        '<th ksort="digit">Цена</th>' +
        '<th ksort="text" title="Количество">Кол-во</th>' +
        '<th ksort="digit">Итого</th>' +
        //'<th ksort="digit" title="Документ">Док.</th>'+
        '<th ksort="digit">Сумма</th>' +
        '<th ksort="digit">ППМ</th>' + //Прод. за пред. месяц
        '<th ksort="digit" title="Среднедневная продажа позиции по магазинам">СДППМ</th>' + // ##Сред. дневная продажа пред. месяца
        //'<th ksort="digit" title="Документ">Док.</th>'+ //Остаток в днях (по док.)
        '<th ksort="digit" title="Остаток в днях">ОД</th>' + //Остаток в днях (по парт.)
        '</tr></thead><tbody>';


      if (json.data.length)
        var $progressbar = $.progressbar({canClose: false, minValue: 0, maxValue: (json.data.length)});


      var fromobjfilter = {};
      var cgSumma = 0.0, wlSumma = 0.0;
      var tr_count = 0;

      function getWaresRest($progressbar, tr, i) {
        if (i < tr.length) {
          var params = {};
          params.wid = tr[i].WARESID;
          params.objid = objid;
          params.dbeg = dbeg;
          params.dend = dend;
          //params.micargoid = tr[i].MAXINCOMECARGOID;
          $.ajax({
            url: 'getWaresDetail',
            dataType: 'json',
            data: params,
            success: function (json) {
              if (!showErr(json)) {


                // var td = json.data[i];

                if (json.data.AVGSALEAMOUNT && json.data.AVGSALEAMOUNT > 0.001) {
                  json.data.CGDAYS = tr[i].CGREST / json.data.AVGSALEAMOUNT;
                  json.data.WLDAYS = tr[i].WLREST / json.data.AVGSALEAMOUNT;
                }
                else {
                  json.data.CGDAYS = 0;
                  json.data.WLDAYS = 0;
                }

                json.data.CGSUMMA = json.data.PRICE, 0.000 * tr[i].CGREST;
                json.data.WLSUMMA = json.data.PRICE, 0.000 * tr[i].WLREST;
                var ovdd_days = (typeRest == 'p' ? json.data.WLDAYS : json.data.CGDAYS);
                var view_tr = ((json.data.AVGSALEAMOUNT > sdppm_min || sdppm_min == 'null') && (json.data.AVGSALEAMOUNT < sdppm_max || sdppm_max == 'null') )
                  &&
                  ((ovdd_days > ovdd_min || ovdd_min == 'null') && (ovdd_days < ovdd_max || ovdd_max == 'null' ));

                if (view_tr) {
                  html +=
                    '<tr>' +
                      '<td>' + json.data.WCODE + '</td>' +
                      '<td class="text">' + json.data.WNAME + '</td>' +
                      '<td class="number">' + kFloat(json.data.PRICE, 2) + '</td>' +
                      '<td class="" title="' + viewTitle(json.data.MUCODE, json.data.VUFACTOR, json.data.VUCODE) + '">' + viewQuantity((typeRest == 'p' ? tr[i].WLREST : tr[i].CGREST), json.data.VUFACTOR, json.data.VUCODE, json.data.MUFACTOR, json.data.MUCODE) + '</td>' +
                      '<td class="number">' + kNumber((typeRest == 'p' ? tr[i].WLREST : tr[i].CGREST)) + '</td>' +
                      '<td class="number">' + kFloat((typeRest == 'p' ? json.data.WLSUMMA : json.data.CGSUMMA), 2) + '</td>' +
                      '<td class="number">' + kFloat(json.data.SALEAMOUNT, 2) + '</td>' +
                      '<td class="number">' + kFloat(json.data.AVGSALEAMOUNT, 2) + '</td>' +
                      '<td class="number">' + kFloat((typeRest == 'p' ? json.data.WLDAYS : json.data.CGDAYS), 2) + '</td>' +
                      '</tr>';
                  tr_count++;
                  cgSumma += json.data.CGSUMMA;
                  wlSumma += json.data.WLSUMMA;
                }


                getWaresRest($progressbar.trigger("progressinc"), tr, ++i);
              }
            },
            global: false,
            timeout: 60000,
            error: function (jqXHR, status, errorThrown) {
              if (jqXHR.status == 403) {
                alert(jqXHR.responseText);
                location.reload();
              }
              else if (confirm('Ошибка получения данных! Повторить и продолжить?')) {
                getWaresRest($progressbar, tr, i)
              }
              else location.reload();
            }
          });
        }
        else {


          html += '</tbody><tfoot><tr>' +
            '<th>' + tr_count + '</th>' +
            '<th colspan="4"></td>' +
            '<th>' + kNumber((typeRest == 'p' ? wlSumma : cgSumma)) + '</th>' +
            '<th>&nbsp;</th>' +
            '<th>&nbsp;</th>' +
            '<th>&nbsp;</th>' +
            '</tr></tfoot></table>';

          $("#dvMain").html(html)
            .find('table')
            .kTblScroll()
            .kTblSorter()
        }
      }

      getWaresRest($progressbar, json.data, 0);

    }
  };

})(jQuery);