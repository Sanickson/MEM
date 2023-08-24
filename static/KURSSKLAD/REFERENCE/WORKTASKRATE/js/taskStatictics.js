/**
 * Created by Nickson on 03.04.14.
 */
$(document).ready(function () {
  $.datepicker.setDefaults($.extend($.datepicker.regional['ru']));
  $('#dvWH').css({'height': kScreenH(), 'width': '100%'});
  $('#dbeg,#dend').datepicker().mask('99.99.9999').val(kToday());
  $('#tbeg,#tend').mask("99:99")
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
  $('#tbeg').val('00:00');
  $('#tend').val('23:59');

  $.blockUI({message: '<h2>Получение списка типов заданий</h2>'});
  $.getJSON('qTaskTypeList', function (JSON) {
    for (var i = 0; i < JSON.data.length; ++i)
      $('#ttid').append('<option value="' + JSON.data[i].ID + '">' + JSON.data[i].NAME + '</option>');
    $('#ttid').css('width', '120px');
    $.unblockUI();
  });

  $('#waresname').kWaresLocate({idHE: 'waresid'});

  $("#frm").submit(function(){
    var param = {
      'dtbeg': $('#dbeg').val() + ' ' + $('#tbeg').val() + ':00',
      'dtend': $('#dend').val() + ' ' + $('#tend').val() + ':59',
      'ttid': $('#ttid').val(),
      'wid': $('#waresid').val()
    };

    $.getJSON('taskStatisticsList', param, $.taskList);
    return false;
  });
});

;
(function ($) {
  function trHTML(tr){
    return '<td ksort="false" class="chk"><input type="checkbox"></td>' +
      '<td class="number">' + tr.TID + '</td>' +
      '<td class="text">' + tr.TTNAME + '</td>' +
      '<td title="' + tr.TMNAME + '">' + tr.TMALGO + '</td>' +
      '<td class="number cntunits">' + kInt(tr.CNTUNITS) + '</td>' +
      '<td class="number cntunitsw">' + kFloat(tr.CNTUNITSW, 3) + '</td>' +
      '<td class="number weight">' + kFloat(tr.WEIGHT, 3) + '</td>' +
      '<td class="number capacity">' + kFloat(tr.CAPACITY, 3) + '</td>' +
      '<td>' + kDateTime(tr.CRTIME) + '</td>' +
      '<td>' + kDateTime(tr.BTIME) + '</td>' +
      '<td>' + kDateTime(tr.ETIME) + '</td>' +
      '<td class="text">' + tr.MANFIO + '</td>';
  }

  $.taskList = function(json){
    var html = '<table id="tblTL"><thead><tr>' +
      '<th ksort="false" class="chk"><input type="checkbox"></th>' +
      '<th ksort="digit" title="Номер задания">Номер</th>' +
      '<th ksort="text">Тип задания</th>' +
      '<th ksort="text" title="Метод выполнения задания">М</th>' +
      '<th ksort="digit" title="Количество штучных единиц">КШЕ</th>' +
      '<th ksort="digit" title="Количество весовых единиц">КВЕ</th>' +
      '<th ksort="digit">Вес/кг</th>' +
      '<th ksort="digit">Объем/л</th>' +
      '<th ksort="DateTime">Создание</th>' +
      '<th ksort="DateTime">Начало</th>' +
      '<th ksort="DateTime">Завершение</th>' +
      '<th ksort="text">Сотрудник</th>' +
    '</tr></thead><tbody>';

    for (var i=0; i < json.data.length; i++){
      var tr = json.data[i];
      html += '<tr id="trT_' + tr.TID + '">' + trHTML(tr) + '</tr>';
    }

    html += '</tbody><tfoot>' +
      '<tr>' +
        '<th class="chk">0</th>' +
        '<th colspan="11" class="buttons">' +
          '<button type="button" id="btnReCalc">' +
            '<img src="' + eng_img + '/actions/recalc.png" border="0">Пересчитать' +
          '</button>' +
        '</th>' +
      '</tr>' +
    '</tfoot></table>';

    $('#dvWH').html(html).find('table:first').css('width','100%')
      .kTblScroll().kTblSorter().rowFocus().kTdChk()
      .find('tbody>tr').dblclick(taskDblClick).click(taskClick).end();

    $('#btnReCalc').click(reCalc);
  };

  function reCalc(){
    var $chk = $('#tblTL').kTdChkGet();
    if ($chk.length == 0)
      alert('Нет отмеченных заданий')
    else if (confirm('Отмечено: ' + $chk.length +'\nПересчитать?')){
      reCalcTask($chk, 0, $.progressbar({canClose: false, maxValue: $chk.length}));
    }
  };

  function reCalcTask($chk, i, $progress){
    if (i < $chk.length) {
      $.ajax({  url: 'taskStatisticsCalc',
        data: {tid: $chk.eq(i).parents('tr:first').attr('id').split('_')[1]},
        dataType: 'json',
        success: function (json) {
          if (!showErr(json)) {
            var $tr = $('#trT_' + json.ext_data.TID);
            if ($tr.length){
              var d = json.data;
              $tr.find('>td.cntunits').text(kInt(d.CNTUNITS)).end()
                .find('>td.cntunitsw').text(kFloat(d.CNTUNITSW, 3)).end()
                .find('>td.weight').text(kFloat(d.WEIGHT, 3)).end()
                .find('>td.capacity').text(kFloat(d.CAPACITY, 3)).end();
            }
            reCalcTask($chk, ++i, $progress.trigger('progressinc'));
          }
        },
        global: false,
        timeout: 60000,
        error: function (jqXHR) {
          if (jqXHR.status == 403) {
            alert(jqXHR.responseText);
            location.reload();
          }
          else if (confirm('Ошибка получения данных! Повторить и продолжить?')) {
            reCalcTask($chk, i, $progress);
          }
          else {
            location.reload();
          }
        }
      });
    }
    else {
      $('#tblTL').kTblScroll().kTblSorter();
    }
  }

  function taskDblClick() {
    var $d = $("#dvListTaskWares");
    if (!$d.length)
      $("<div/>").attr("id", "dvListTaskWares").addClass("flora")
        .dialog({height: kInt($(document.body).height() * 0.5), width: kInt($(document.body).width() * 0.5), title: 'Информация о задании', position: ["right", "bottom"],
          modal: false, draggable: true, resizable: false, overlay: {opacity: 0.5, background: "black"}
        })
        .bind('dialogbeforeclose', function () {
          var offset = $("#dvListTaskWares").parents("div.ui-dialog:first").offset();
          $("#dvListTaskWares").dialog("option", "position", [offset.left, offset.top])
        })
    $("#dvListTaskWares").dialog("open");
    taskWares.call(this);
  };

  function taskClick() {
    var $d = $("#dvListTaskWares");
    if ($d.length > 0 && $d.dialog("isOpen")) {
      $d.empty().dialog('option', 'title', 'Идет загрузка');
      taskWares.call(this);
    }
  };

  function taskWares() {
    $.getJSON('taskStatisticsWares', {tid: $(this).attr("id").split('_')[1]}, function (json) {
      var dvTitle = 'Задание №' + json.ext_data.TID;
      var ed = json.ext_data;
      var html = '<table><thead><tr>' +
        '<th colspan="2">Товар</th>' +
        (ed.TITLEQUANTITY ? '<th colspan="2">' + ed.TITLEQUANTITY + '</th>' : '')+
        (ed.TITLESCANCOUNT ? '<th colspan="2">' + ed.TITLESCANCOUNT + '</th>' : '')+
        (ed.TITLESUCCESSSCAN ? '<th colspan="2">' + ed.TITLESUCCESSSCAN + '</th>' : '')+
        (ed.TITLESCANQUANT ? '<th colspan="2">' + ed.TITLESCANQUANT + '</th>' : '')+
        '<th colspan="4">Расчет</th>' +
        '</tr>' +
        '<tr>' +
        '<th>Код</th><th>Наименование</th>' +
        (ed.TITLEQUANTITY ? '<th>Кол-во</th><th>Итого</th>' : '') +
        (ed.TITLESCANCOUNT ? '<th>Кол-во</th><th>Итого</th>' : '') +
        (ed.TITLESUCCESSSCAN ? '<th>Кол-во</th><th>Итого</th>' : '') +
        (ed.TITLESCANQUANT ? '<th>Кол-во</th><th>Итого</th>' : '') +
        '<th title="Количество штучных единиц">КШЕ</th>' +
        '<th title="Количество весовых единиц">КВЕ</th>' +
        '<th>Вес/кг</th>' +
        '<th>Объем/л</th></tr>' +
        '</thead><tbody>';

      var CNTUNITS = 0, CNTUNITSW = 0, WEIGHT = 0, CAPACITY = 0;

      for (var i = 0; i < json.data.length; i++) {
        var tr = json.data[i];
        var title = tr.VUCODE ? ' title="' + tr.VUCODE + ' = ' + kNumber(tr.VUFACTOR) + ' ' + tr.MUCODE + '"' : '';
        html += '<tr>' +
          '<td class="number">' + tr.WCODE + '</td>' +
          '<td class="text">' + tr.WNAME + '</td>';
        if (ed.TITLEQUANTITY){
          html += '<td' + title + '>' + viewQuantity(tr.Q1, tr.VUFACTOR, tr.VUCODE, tr.MUFACTOR, tr.MUCODE) + '</td>' +
            '<td class="number">' + kNumber(tr.Q1) + '</td>';
        }
        if (ed.TITLESCANCOUNT) {
          html += '<td' + title + '>' + viewQuantity(tr.Q2, tr.VUFACTOR, tr.VUCODE, tr.MUFACTOR, tr.MUCODE) + '</td>' +
            '<td class="number">' + kNumber(tr.Q2) + '</td>';
        }
        if (ed.TITLESUCCESSSCAN) {
          html += '<td' + title + '>' + viewQuantity(tr.Q3, tr.VUFACTOR, tr.VUCODE, tr.MUFACTOR, tr.MUCODE) + '</td>' +
            '<td class="number">' + kNumber(tr.Q3) + '</td>';
        }
        if (ed.TITLESCANQUANT) {
          html += '<td' + title + '>' + viewQuantity(tr.Q4, tr.VUFACTOR, tr.VUCODE, tr.MUFACTOR, tr.MUCODE) + '</td>' +
            '<td class="number">' + kNumber(tr.Q4) + '</td>';
        }
        html += '<td class="number">' + kInt(tr.CNTUNITS) + '</td>' +
                '<td class="number">' + kFloat(tr.CNTUNITSW, 3) + '</td>' +
                '<td class="number">' + kFloat(tr.WEIGHT, 3) + '</td>' +
                '<td class="number">' + kFloat(tr.CAPACITY, 3) + '</td>' +
          '</tr>';

        CNTUNITS += kFloat(tr.CNTUNITS);
        CNTUNITSW += kFloat(tr.CNTUNITSW);
        WEIGHT += kFloat(tr.WEIGHT);
        CAPACITY += kFloat(tr.CAPACITY);
      }
      html += '</tbody><tfoot><tr>' +
        '<th>' + json.data.length + '</th>' +
        '<th>&nbsp;</th>' +
        (ed.TITLEQUANTITY ? '<th colspan="2">&nbsp;</th>' : '') +
        (ed.TITLESCANCOUNT ? '<th colspan="2">&nbsp;</th>' : '') +
        (ed.TITLESUCCESSSCAN ? '<th colspan="2">&nbsp;</th>' : '') +
        (ed.TITLESCANQUANT ? '<th colspan="2">&nbsp;</th>' : '') +
        '<th>' + kInt(CNTUNITS) +'</th>'+
        '<th>' + kFloat(CNTUNITSW, 3) +'</th>'+
        '<th>' + kFloat(WEIGHT, 3) +'</th>'+
        '<th>' + kFloat(CAPACITY, 3) +'</th>'+
        '</tr></tfoot></table>';

      var $d = $("#dvListTaskWares");
      if (!$d.length)
        $("<div/>").attr("id", "dvListTaskWares").addClass("flora")
          .dialog({height: $(window).height() - $("#divTabs").offset().top, width: 750, title: dvTitle, position: ["right", "bottom"],
            modal: false, draggable: true, resizable: false, overlay: {opacity: 0.5, background: "black"}
          });
      $("#dvListTaskWares").html(html)
        .dialog('option', 'title', dvTitle)
        .find("table").kTblScroll().tablesorter().rowFocus().end();
    });
  };

})(jQuery);