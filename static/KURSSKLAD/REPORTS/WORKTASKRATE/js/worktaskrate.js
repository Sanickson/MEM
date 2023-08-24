$(document).ready(function () {
  $('#dvFilterDateBeg,#dvFilterDateEnd').val(getToday(-1)).mask("99.99.9999").datepicker().css('text-align', 'center');
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

  var height = kScreenH() - $("#dvFilter").height();
  $("#dvScreen").css({"height": height,
    "width": "100%",
    "overflow-x": "auto",
    "overflow-y": "hidden",
    "padding-bottom": "16px"});
  $('#btnPrint').click(function () {
    if (!$('#tblWorkers').length) {
      showMes('Внимание', 'Нет данных для печати!');
      return false;
    }
    var wnd = window.open(sp_reports + '/worktaskratedetail.html');
    wnd.onload = function () {
      wnd.document.getElementById("timebeg").innerHTML = $('#dvFilterDateBeg').val() + ' ' + $('#dvFilterTimeBeg').val() + ':00';
      ;
      wnd.document.getElementById("timeend").innerHTML = $('#dvFilterDateEnd').val() + ' ' + $('#dvFilterTimeEnd').val() + ':00';
      wnd.document.getElementById("tblPrint").innerHTML = $('#tblWorkers').printHTML();
    }
  });

  $('#btnExcel').click(function () {
        if ($('#tblWorkers').get(0)) {
            export_table_to_excel_name($('table').get(0), $('#sys-name').text() + ' ' + kNow() + '.xlsx')
        } else {
            alert('Заполните таблицу!')
        }
    });

  $('#btnTimer').click(function () {
    if ($('#dvTimer').length)
      $('#dvTimer').dialog('destroy').remove();

    var html = '<form><div style="width:100%;height:30px;" class="' + ($.globalTimer ? 'hide' : '') + '">' +
      '<label>Интервал&nbsp;<select name="timer">' +
      '<option value="5">5 мин</option>' +
      '<option value="10">10 мин</option>' +
      '<option value="15">15 мин</option>' +
      '</select></label>' +
      '</div>' +
      '<div class="buttons" style="width:100%;height:30px;">' +
      '<button type="submit"><img src="' + eng_img + '/actions/accept.png" border="0">' + (!$.globalTimer ? 'Установить' : 'Отключить') + '</button>&nbsp;&nbsp;&nbsp;' +
      '<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
      '</div></form>';
    $('<div/>')
      .attr("id", "dvTimer").addClass("flora").css("text-align", "center")
      .dialog({title: 'Таймер',
        autoOpen: true,
        resizable: false, draggable: false,
        modal: true,
        overlay: {opacity: 0.5, background: "black"},
        height: 130,
        width: ($.globalTimer ? 250 : 350)})
      .html(html)
      .find('form').submit(function (e) {
        e.preventDefault();
        var params = $(this).kFormSubmitParam();
        if (!$.globalTimer) {
          $.globalTimer = true;
          $.globalTimerInterval = params.timer * 60000;
          $('#btnTimer').css({'background': '#ADFF2F'});
          //$.Workers();
          Workers();
        }
        else {
          clearTimeout($.globalTimer);
          $.globalTimerInterval = false;
          $.globalTimer = false;
          $('#btnTimer').css({'background': ''})
        }
        $('#dvTimer').dialog('close');
      }).end()
      .find('button[type=button]').click(function () {
        $('#dvTimer').dialog('close');
      })

  });

  listTT();
});

//;(function($) {
function ID(text) {
  return text.split('_')[1];
};

$.fn.ID = function () {
  return ID(this.attr('id'));
};

$.globalTimer = false;
$.globalTimerInterval = false;
function calcWorkerTask($trs, index, $progressbar, params, sum_task) {
  if (index < $trs.length) {
    $.getJSON('calcWorkerTask', {timebeg: params.timebeg, timeend: params.timeend,
      manid: $trs.eq(index).ID(), ttid: params.ttid, whid: params.whid},
      function (json) {
      if (showErr(json)) {
        if ($progressbar) $progressbar.remove();
      }
      else {
        for (var i = 0; i < json.data.length; i++) {
          var ttid = json.data[i].TTID;
          if (!sum_task[ttid]) {
            sum_task[ttid] = [json.data[i].NOUSETASKTIME,
              kInt(json.data[i].CNTTASK),
              kFloat(json.data[i].WEIGHT), kFloat(json.data[i].CAPACITY),
              kInt(json.data[i].CNTUNITS), kFloat(json.data[i].CNTUNITSW), kFloat(json.data[i].COSTUNITS)];
          }
          else {
            sum_task[ttid][1] += kInt(json.data[i].CNTTASK);
            sum_task[ttid][2] += kFloat(json.data[i].WEIGHT);
            sum_task[ttid][3] += kFloat(json.data[i].CAPACITY);
            sum_task[ttid][4] += kInt(json.data[i].CNTUNITS);
            sum_task[ttid][5] += kFloat(json.data[i].CNTUNITSW);
            sum_task[ttid][6] += kFloat(json.data[i].COSTUNITS);
          }
          if ($('#tblWorkers>thead>tr:first>th[ttid="' + ttid + '"]:first').length) {
            var $td = $('#trM_' + json.ext_data.manid + '>td[ttid="' + ttid + '"]:first').text(json.data[i].CNTTASK)
            $td.next().text(kFloat(json.data[i].WEIGHT, 3))
              .next().text(kFloat(json.data[i].CAPACITY, 3))
              .next().text(kNumber(json.data[i].CNTUNITS))
              .next().text(kFloat(json.data[i].CNTUNITSW, 3))
              .next().text(kFloat(json.data[i].COSTUNITS,2));
            var $summary = $('#trM_' + json.ext_data.manid).find('>td.mansum');
            $summary.text(kFloat(kFloat($summary.text()) + kFloat(json.data[i].COSTUNITS), 2))
          }
          else {
            var colspan = 6;
            $("#tblWorkers>thead>tr")
              .filter(':first').append('<th colspan=' + colspan + ' ttid=' + ttid + '>' + json.data[i].TTNAME + '</th>').end()
              .filter(':last').append('<th title="Количество заданий" ksort=digit>КЗ</th>' +
                '<th>Вес</th><th>Объем</th><th title="Количество штучных единиц">КШЕ</th>' +
                '<th title="Количество весовых единиц">КВЕ</th><th title="Стоимость единиц">СЕ</th>');

            $("#tblWorkers>tbody>tr").each(function () {
              var $this = $(this);
              if ($this.ID() == json.ext_data.manid){
                $this.append('<td ttid=' + ttid + '>' + kInt(json.data[i].CNTTASK) + '</td>' +
                  '<td ttid=' + ttid + '>' + kFloat(json.data[i].WEIGHT, 3) + '</td>' +
                  '<td ttid=' + ttid + '>' + kFloat(json.data[i].CAPACITY, 3) + '</td>' +
                  '<td ttid=' + ttid + '>' + kInt(json.data[i].CNTUNITS) + '</td>' +
                  '<td ttid=' + ttid + '>' + kFloat(json.data[i].CNTUNITSW, 3) + '</td>' +
                  '<td ttid=' + ttid + '>' + kFloat(json.data[i].COSTUNITS,2) + '</td>'
                )
                var $summary = $this.find('>td.mansum');
                $summary.text(kFloat(kFloat($summary.text()) + kFloat(json.data[i].COSTUNITS), 2))
              }
              else
                $this.append('<td ttid=' + ttid + '></td>' +
                  '<td ttid=' + ttid + '></td>' +
                  '<td ttid=' + ttid + '></td>' +
                  '<td ttid=' + ttid + '></td>' +
                  '<td ttid=' + ttid + '></td>' +
                  '<td ttid=' + ttid + '></td>'
                )
            });

            $("#tblWorkers>tfoot>tr:first").append('<th ttid="' + ttid + '" class="cnttask"></th>' +
              '<th></th><th></th><th></th><th></th><th></th>'
            )
          }
        }
        calcWorkerTask($trs, ++index, $progressbar.trigger('progressinc'), params, sum_task);
      }
    });
  }
  else {
    //if ($progressbar) {
    $("#tblWorkers>tfoot>tr:first>th.cnttask").each(function () {
      var $this = $(this);
      var ttid = $this.attr('ttid');
      $this.text(kInt(sum_task[ttid][1]))
        .next().text(kFloat(sum_task[ttid][2],3))
        .next().text(kFloat(sum_task[ttid][3],3))
        .next().text(kInt(sum_task[ttid][4]))
        .next().text(kFloat(sum_task[ttid][5], 3))
        .next().text(kFloat(sum_task[ttid][6], 2));
    })

    if ($.globalTimer) {
      $('#tblWorkers').kTblScroll()//.kTblSorter()
    }
    else {
      $('#tblWorkers').kTblScroll().kTblSorter()
        .find('tbody>tr').dblclick(function () {

          var ttid = $(this).attr('ttid');
          if ($("#dvTaskes").length) $("#dvTaskes").dialog("destroy").remove();
          var $dv = $("<div/>").attr("id", "dvTaskes")
            .addClass("flora").css("text-align", "center")
            .dialog({closeOnEscape: false, title: 'Задания', autoOpen: true,
              resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
              height: kScreenH(), width: kScreenW()})

          var wh = $('#btnWareHouses').attr('warehouses') ? '&warehouses='+ $('#btnWareHouses').attr('warehouses') : '';
          var tt = $('#btnTaskTypes').attr('tasktypes') ? '&ttid='+ $('#btnTaskTypes').attr('tasktypes') : '';

          $('#dvTaskes').taskView({url: 'listTask' +
            '?tbeg=' + $('#dvFilterDateBeg').val() + ' ' + $('#dvFilterTimeBeg').val() + ':00' +
            '&tend=' + $('#dvFilterDateEnd').val() + ' ' + $('#dvFilterTimeEnd').val() + ':00' +
            '&manid=' + ID($(this).attr('id')) + tt + wh,
            toview: false,
            useviewunit: true});
        })
    }
    restart();
    //$('#dvScreen').css('height',$("#dvScreen").height()+16);
    //$progressbar.trigger('progressend');
    $progressbar = null;
    //}
  }
};

//$.Workers = function(){
function Workers() {
  $("#dvScreen").find('div,th,tr,td,table,tbody,thead,tfoot').removeData().empty();
  var params = {
    timebeg: $('#dvFilterDateBeg').val() + ' ' + $('#dvFilterTimeBeg').val() + ':00:00',
    timeend: $('#dvFilterDateEnd').val() + ' ' + $('#dvFilterTimeEnd').val() + ':00:00',
    ttid: $('#btnTaskTypes').attr('tasktypes'),
    whid: $('#btnWareHouses').attr('warehouses') ? $('#btnWareHouses').attr('warehouses') : ''
  };
  if (!params.ttid) {
    showMes('Внимание', 'Не выбраны типы заданий!');
    return false;
  }
  $.getJSON('listWorkers', params, function (JSON) {
    if (!showErr(JSON)) {
      var html = '<table id="tblWorkers"><thead><tr><th colspan="2">Сотрудник</th></tr>' +
        '<tr><th ksort=text>ФИО</th><th ksort=digit title="Стоимость единиц">СЕ</th></tr></thead><tbody>';
      for (var i = 0; i < JSON.data.length; i++)
        html += '<tr id="trM_' + JSON.data[i].MANID + '">' +
          '<td class="text">' + JSON.data[i].FIO + '</td>' +
          '<td class="number mansum">0.00</td>' +
        '</tr>';

      html += '</tbody><tfoot><tr><th colspan="2">Итого: ' + JSON.data.length + '</th></tr></tfoot></table>';
      var $trs = $("#dvScreen").css({float: 'left', position: 'relative'}).html(html).find('>table')/*.kTblScroll()*/.find('>tbody>tr');
      //timebeg = JSON.ext_data.beg;
      //timeend = JSON.ext_data.end;
      //ttid = JSON.ext_data.ttid;

      if (JSON.data.length)
        calcWorkerTask($trs, 0, $.progressbar({minValue: 0, maxValue: $trs.length}), params, {});
    }
  });
};
function restart() {
  if ($.globalTimer) {
    $.globalTimer = setTimeout(Workers, $.globalTimerInterval);
  }
}
//})(jQuery);


function listWH(){
  //тип задания
  $.blockUI({message: '<h2>...список складов...</h2>'});
  $.getJSON('userWareHouses', function (json) {
    var html = '<table id="tblWareHouses"><thead><tr>\
                        <th class="chk"><input type="checkbox" checked="checked" value=""></th>\
                        <th>Наименование</th>\
                    </tr></thead><tbody>';
    var wh = ''
    for (var i = 0; i < json.data.length; i++) {
      html += '<tr><td class="chk"><input type="checkbox" checked="checked" value="' + json.data[i].WHID + '">\
                         <td class="text">' + json.data[i].WHNAME + '</td></tr>';
      wh += json.data[i].WHID + ',';
    }
    html += '</tbody><tfoot><tr><th colspan="2">&nbsp;</th></tr></tfoot></table>';

    $('#btnWareHouses')
      .attr('warehouses', wh)
      .click(function () {
        var $dv = $('#dvWareHouses');
        if ($dv.length) {
          $dv.dialog('open');
        }
        else {
          var $dv = $("<div/>").attr("id", "dvWareHouses").addClass("flora").css("text-align", "center")
            .dialog({closeOnEscape: false, title: 'Список складов', autoOpen: true,
              resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
              height: $("#dvScreen").height() * 0.8, width: 350})
            .html('<div style="position:relative;loat:left;width:100%;height:85%;">' + html + '</div>\
                                       <div style="width:100%;height:15%;" class="buttons"><br>\
                                        <button type="button" id=""><img src="' + eng_img + '/actions/accept.png" border="0">Ок</button>&nbsp;&nbsp;\
                                        <button type="button" id=""><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>\
                                       </div>')

          $dv.find('table')
            .kTdChk().kTblScroll().end()
            .find('button')
            .filter(':first').click(function () {
              var wh = '', i = 0;
              $('#tblWareHouses tbody>tr>td>input').each(function () {
                if ($(this).is(':checked')) {
                  wh += $(this).val() + ',';
                  i++;
                }
              })
              $('#btnWareHouses').attr('warehouses', wh);
              if (i == json.data.length + 1) {
                $('#btnWareHouses').attr('warehouses', '')
                $('#btnWareHouses>img').attr('src', eng_img + '/actions/application_view_detail.png');
              }
              else if (wh.length)
                $('#btnWareHouses>img').attr('src', eng_img + '/actions/application_view_detail.png');
              else
                $('#btnWareHouses>img').attr('src', eng_img + '/actions/application.png')
              $dv.dialog('close')
            }).end()
            .filter(':last').click(function () {
              $dv.dialog('close')
            })
        }
      });
    $.unblockUI();
    $("#dvFilterBtnLocate").click(Workers);
  });
}

function listTT(){
  //тип задания
  $.blockUI({message: '<h2>...типы заданий...</h2>'});
  $.getJSON('listTaskTypes', function (json) {
    var html = '<table id="tblTaskTypes"><thead><tr>\
                        <th class="chk"><input type="checkbox" checked="checked" value=""></th>\
                        <th>Наименование</th>\
                    </tr></thead><tbody>';
    var tasktypes = ''
    for (var i = 0; i < json.data.length; i++) {
      html += '<tr><td class="chk"><input type="checkbox" checked="checked" value="' + json.data[i].TTID + '">\
                         <td class="text">' + json.data[i].NAME + '</td></tr>';
      tasktypes += json.data[i].TTID + ',';
    }
    html += '</tbody><tfoot><tr><th colspan="2">&nbsp;</th></tr></tfoot></table>';

    $('#btnTaskTypes')
      .attr('tasktypes', tasktypes)
      .click(function () {
        var $dv = $('#dvTaskTypes');
        if ($dv.length) {
          $dv.dialog('open');
        }
        else {
          var $dv = $("<div/>").attr("id", "dvTaskTypes").addClass("flora").css("text-align", "center")
            .dialog({closeOnEscape: false, title: 'Типы заданий', autoOpen: true,
              resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
              height: $("#dvScreen").height() * 0.8, width: 350})
            .html('<div style="position:relative;loat:left;width:100%;height:85%;">' + html + '</div>\
                                       <div style="width:100%;height:15%;" class="buttons"><br>\
                                        <button type="button" id=""><img src="' + eng_img + '/actions/accept.png" border="0">Ок</button>&nbsp;&nbsp;\
                                        <button type="button" id=""><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>\
                                       </div>')

          $dv.find('table')
            .kTdChk()
            .kTblScroll().end()
            .find('button')
            .filter(':first').click(function () {
              var tasktypes = '', i = 0;
              $('#tblTaskTypes tbody>tr>td>input').each(function () {
                if ($(this).is(':checked')) {
                  tasktypes += $(this).val() + ',';
                  i++;
                }
              })
              $('#btnTaskTypes').attr('tasktypes', tasktypes);
              if (i == json.data.length + 1) {
                $('#btnTaskTypes').attr('tasktypes', '')
                $('#btnTaskTypes>img').attr('src', eng_img + '/actions/application_view_detail.png');
              }
              else if (tasktypes.length)
                $('#btnTaskTypes>img').attr('src', eng_img + '/actions/application_view_detail.png');
              else
                $('#btnTaskTypes>img').attr('src', eng_img + '/actions/application.png')
              $dv.dialog('close')
            }).end()
            .filter(':last').click(function () {
              $dv.dialog('close')
            })
        }
      });
    $.unblockUI();
    listWH();
  });
}