/**
 * Created by Kast on 28.07.14.
 */
//todo: печать
$(document).ready(function () {
  $.datepicker.setDefaults($.extend($.datepicker.regional['ru']));

  $('#dbeg,#dend').datepicker().mask('99.99.9999').val(kToday(-1));

  var containerheight = kScreenH();
  $("#dvMain").css({"height": containerheight});

  $.request({
    url: 'getAuto',
    async: false,
    success: function (json) {
      var html = '';
      for (var i = 0; i < json.data.length; i++) {
        html += '<option value="{AID}">{NAME}</option>'.format(json.data[i]);
      }
      $('#autoid').html(html);
    }
  });

  var height = kScreenH() - $("#dvFilter").height();
  $.request({
      url: 'getAuto',
      async: false,
      success: function (json) {
        //sadsadsad

        var html = '<table id="tblAuto"><thead><tr>' +
          '<th class="chk"><input type="checkbox" checked="checked" value=""></th>' +
          '<th>Наименование</th>' +
          '</tr></thead><tbody>';
        var aid = '';
        for (var i = 0; i < json.data.length; i++) {
          html += '<tr><td class="chk"><input type="checkbox" checked="checked" value="' + json.data[i].AID + '">' +
            '<td class="text">' + json.data[i].NAME + '</td></tr>';
          aid += json.data[i].AID + ',';
        }
        html += '</tbody><tfoot><tr><th colspan="2">&nbsp;</th></tr></tfoot></table>';

        $('#btnAutoDlg')
          .attr('aid', aid)
          .click(function () {
            var $dv = $('#dvAutoDlg');
            if ($dv.length) {
              $dv.dialog('open');
            }
            else {
              var $dv = $("<div/>").attr("id", "dvAutoDlg").addClass("flora").css("text-align", "center")
                .dialog({closeOnEscape: false, title: 'Автомобии', autoOpen: true,
                  resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
                  height: height * 0.8, width: 350})
                .html('<div style="position:relative;loat:left;width:100%;height:90%;">' + html + '</div>\
                                       <div style="width:100%;height:10%;" class="buttons"><br>\
                                        <button type="button" id=""><img src="' + eng_img + '/actions/accept.png" border="0">Ок</button>&nbsp;&nbsp;\
                                        <button type="button" id=""><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>\
                                       </div>')

              $dv.find('table')
                .kTdChk()
                .kTblScroll().end()
                .find('button')
                .filter(':first').click(function () {
                  var auto = '', i = 0;
                  $('#tblAuto>tbody input').each(function () {
                    if ($(this).is(':checked')) {
                      auto += $(this).val() + ',';
                      i++;
                    }
                  })
                  $('#btnAutoDlg').attr('auto', auto);
                  if (i == json.data.length + 1) {
                    $('#btnAutoDlg').attr('auto', '')
                    $('#btnAutoDlg>img').attr('src', eng_img + '/actions/application_view_detail.png');
                  }
                  else if (auto.length)
                    $('#btnAutoDlg>img').attr('src', eng_img + '/actions/application_view_detail.png');
                  else
                    $('#btnAutoDlg>img').attr('src', eng_img + '/actions/application.png')
                  $dv.dialog('close')
                }).end()
                .filter(':last').click(function () {
                  $dv.dialog('close')
                })
            }
          });
        $.unblockUI();
        ///asdasdasdasd

      }
    }
  );

  $('form.filter_form')
    .submit(getLoadAutoTask);

  $('#btnPrint').click(function () {
      var wnd = window.open(sp_reports + '/print.html');
      wnd.onload = function () {
        wnd.document.getElementById("dvDateTime").innerHTML = $('#dbeg').val() + ' 00:00:00 - ' + $('#dend').val() + ' 23:59:59';
        wnd.document.getElementById("dvHeader").innerHTML = 'Отчет по погрузке авто';
        wnd.document.getElementById("tblPrint").innerHTML = $('#dvMain').find('table').printHTML();
      };
    }
  )

});

function getLoadAutoTask(e) {
  e.preventDefault();
  var params = $(this).kFormSubmitParam();
  params.dbeg += ' 00:00:00.0000';
  params.dend += ' 23:59:59.0000';
  params.autoid = $('#btnAutoDlg').attr('auto');
  if (!params.autoid) {
    showMes('Внимание', 'Не выбраны автомобили!');
    return false;
  }
  $.request({
    url: 'getLoadAutoTask',
    data: params,
    success: getLoadPalletTask
  });
}

function getLoadPalletTask(json) {

  if (json.data.length) {
    var $pb = $.progressbar({
      canClose: false,
      minValue: 0,
      maxValue: json.data.length
    });
  }
  var ext_data = json.ext_data;
  var data_all = [],
    json_obj = {},
    json_toobj = {};

  function pbfunc($pb, tasks, i) {
    if (i < tasks.length) {
      $.request({
        url: 'getLoadPalletTask',
        data: {taskid: tasks[i].TASKID},
        message: false,
        success: function (json) {
          //$('#dvMain').append(JSON.stringify(json.data));

          for (var j = 0; j < json.data.length; j++) {
            var item = json.data[j];
            if (!json_obj[item.OBJID]) {
              json_obj[item.OBJID] = item.OBJNAME
            }
            if (!json_toobj[item.TOOBJ]) {
              json_toobj[item.TOOBJ] = item.TOOBJNAME
            }
            data_all.push(item);
          }


          pbfunc($pb.trigger("progressinc"), tasks, ++i);
        }
      });
    }
    else {

      var html_thead_first = '<th colspan="3" data-objid="">Всего</th>',
        html_thead_second = '<th ksort="" >Вес</th><th ksort="" title="">Объём</th><th ksort="" title="Количество паллетов">КП</th>';

      var obj = [];
      var json_tfoot = {};
      for (var item in json_obj) {
        html_thead_first += '<th colspan="3" data-objid="' + item + '">' + json_obj[item] + '</th>';
        html_thead_second += '<th ksort="" >Вес</th><th ksort="" title="">Объём</th><th ksort="" title="Количество паллетов">КП</th>';
        obj.push(item);

        json_tfoot[item] = {
          'WEIGHT': 0.000,
          'CAPACITY': 0.000,
          'TCOUNT': 0
        }

      }

      var html = '<table data-dbeg="' + ext_data.dbeg + '" data-dend="' + ext_data.dend + '" data-autoid="' + ext_data.autoid + '"><thead><tr><th rowspan="2"></th>' + html_thead_first + '</tr><tr>' + html_thead_second + '</tr></thead><tbody>';

      var json_data_all = {};

      for (var i = 0; i < data_all.length; i++) {
        var item = data_all[i],
          key = item.OBJID + '_' + item.TOOBJ;

        if (!json_data_all[key]) {
          json_data_all[key] = {
            'WEIGHT': 0.000,
            'CAPACITY': 0.000,
            'TCOUNT': 0

          };
        }
        json_data_all[key]['WEIGHT'] += item.WEIGHT;
        json_data_all[key]['CAPACITY'] += item.CAPACITY;
        json_data_all[key]['TCOUNT'] += item.TCOUNT;
      }

      var sum_all_weight = 0,
        sum_all_capacity = 0,
        sum_all_tcount = 0;
      for (var item in json_toobj) {

        var html_temp = '',
          sum_weight = 0,
          sum_capacity = 0,
          sum_tcount = 0;

        for (var j = 0; j < obj.length; j++) {
          key = obj[j] + '_' + item;
          if (json_data_all[key]) {
            html_temp += '<td class="number" data-objid="' + obj[j] + '" data-toobj="' + item + '">' + kNumber(json_data_all[key].WEIGHT) + '</td>' +
              '<td class="number" data-objid="' + obj[j] + '" data-toobj="' + item + '">' + kNumber(json_data_all[key].CAPACITY) + '</td>' +
              '<td class="number" data-objid="' + obj[j] + '" data-toobj="' + item + '">' + json_data_all[key].TCOUNT + '</td>';

            json_tfoot[obj[j]]['WEIGHT'] += json_data_all[key].WEIGHT;
            json_tfoot[obj[j]]['CAPACITY'] += json_data_all[key].CAPACITY;
            json_tfoot[obj[j]]['TCOUNT'] += json_data_all[key].TCOUNT;

            sum_weight += json_data_all[key].WEIGHT;
            sum_capacity += json_data_all[key].CAPACITY;
            sum_tcount += json_data_all[key].TCOUNT;
          }
          else {
            html_temp += '<td class="number">0</td>' +
              '<td class="number">0</td>' +
              '<td class="number">0</td>';
          }
        }
        html += '<tr><td class="text" data-toobj="' + item + '">' + json_toobj[item] + '</td>' +
          '<td class="number" data-toobj="' + item + '">' + kNumber(sum_weight) + '</td>' +
          '<td class="number" data-toobj="' + item + '">' + kNumber(sum_capacity) + '</td>' +
          '<td class="number" data-toobj="' + item + '">' + sum_tcount + '</td>' +
          html_temp + '</tr>';

        sum_all_weight += sum_weight;
        sum_all_capacity += sum_capacity;
        sum_all_tcount += sum_tcount;
      }

      html += '</tbody><tfoot><tr>' +
        '<th colspan="">&nbsp;</th><th class="number">' + kNumber(sum_all_weight) + '</th>' +
        '<th class="number">' + kNumber(sum_all_capacity) + '</th>' +
        '<th class="number">' + kNumber(sum_all_tcount) + '</th>';

      for (var j = 0; j < obj.length; j++) {
        html += '<th class="number">' + kNumber(json_tfoot[obj[j]].WEIGHT) + '</th>' +
          '<th class="number">' + kNumber(json_tfoot[obj[j]].CAPACITY) + '</th>' +
          '<th class="number">' + json_tfoot[obj[j]].TCOUNT + '</th>';
      }


      html += '</tr></tfoot></table>';

      $('#dvMain').html(html).height(kScreenH())//todo: исправить высоту
        .find('table')
        .kTblScroll()
        .kTblSorter()
        .rowFocus()
        .find('tbody td').dblclick(getLoadPalletTaskInfo).end().end().height('');
    }


  }

  pbfunc($pb, json.data, 0);


}

function getLoadPalletTaskInfo() {
  var $this = $(this),
    $tbl = $this.parents('table:first');
  var params = {
    objid: $this.attr('data-objid'),
    toobj: $this.attr('data-toobj'),
    autoid: $tbl.attr('data-autoid'),
    dbeg: $tbl.attr('data-dbeg'),
    dend: $tbl.attr('data-dend')
  };
  if (!params.objid) {
    params.objid = null;
  }


  //console.log('OBJID',$this.attr('data-objid'))
  //console.log('TOOBJ',$this.attr('data-toobj'))

  var $dv = $("<div/>").attr("id", 'taskInfoDialog').addClass("flora").css("text-align", "center")
    .dialog({closeOnEscape: false, title: 'Список заданий', autoOpen: true,
      resizable: false, draggable: true, modal: false, overlay: {opacity: 0.5, background: "black"},
      height: $(window).height() * 0.8, width: $(window).width() * 0.8})
    .bind('dialogclose', function () {
      $(this).dialog('destroy').remove()
    });

  var $tmv = $dv.taskManagerView({'urlTask': 'getLoadPalletTaskInfo'}).listTask(params);
}