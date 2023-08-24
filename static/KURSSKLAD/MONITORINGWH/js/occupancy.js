function infoDload2() {
  var prefix = ['', '-ms-', '-webkit-', '-o-', '-moz-'];

  function lg173(proc) {
    var result = '';
    $.each(prefix, function (i, value) {
      result += 'background-image: ' + value + 'linear-gradient(left , rgb(173,95,95) ' + proc + '%, rgb(246,247,212) 0%) !important;';
    });
    return result;
  }

  function lg104(proc) {
    var result = '';
    $.each(prefix, function (i, value) {
      result += 'background-image: ' + value + 'linear-gradient(left , rgb(104,158,101) ' + proc + '%, rgb(246,247,212) 0%) !important;';
    });
    return result;
  }

  function lg93(proc) {
    var result = '';
    $.each(prefix, function (i, value) {
      result += 'background-image:' + value + 'linear-gradient(left , rgb(93,131,148) ' + proc + '%, rgb(202,218,235) 0%) !important;';
    });
    return result;
  }

  function menu(action, el) {
    var split = action.split('_');
    if (split[0] == 'printwares') {
      eval('printwares' + '.call($(el), $(el).attr("rowid"), split[1])');
    }
    else {
      if (split[0] === 'print') {
        eval('print' + '.call($(el), $(el).attr("rowid"), split[1])');
      }
    }
  }

  defaultView();
  var siteid = $('#dvSite').attr('siteid');

  function siteBG(proc) {
    var result = '';
    $.each(prefix, function (i, value) {
      result += 'background-image:' + value + 'linear-gradient(right bottom, rgb(59,100,143) ' + proc + '%, rgb(167,178,196) 0%) !important;';
    })
    return result;
  }

  $.blockUI({message: '<h2>...загрузка информации...</h2>'});

  $.getJSON('checkDload', {siteid: siteid}, function (JSONR) {
    if (!showErr(JSONR)) {
      $.getJSON('monitoringInfo', {siteid: siteid}, function (JSON) {
        if (!showErr(JSON)) {
          var rowMetaData = JSON.ext_data.rowMetaData;
          var showName = {'Место отборки': 'МО', 'Место хранения': 'МХ'};
          var row = JSON.ext_data.row;
          var rowid = JSON.ext_data.rowid;
          var rd = JSON.data.DATA;
          var astillage = JSON.ext_data.astillage;
          var sumAS = 0;
          var sum = new Array(rowMetaData.length);
          var li = '', html = '';
          html = '<table style="width: 100%" id="tblRow"><thead><tr>' +
            '<th colspan="2">' + kDateTime(kNow()) + '</th>';
          for (var j = 0; j < rowMetaData.length; ++j) {
            html += '<th ssid="' + JSON.ext_data.ssid[j] + '" colspan="4">' + rowMetaData[j] + '</th>';
            sum[j] = [0, 0, 0];
            li += '<li class="print"><a href="#print_' + JSON.ext_data.ssid[j] + '">Свободные ' + showName[rowMetaData[j]] || rowMetaData[j] + '</a></li>';
            li += '<li class="print"><a href="#printwares_' + JSON.ext_data.ssid[j] + '">Занятые ' + showName[rowMetaData[j]] || rowMetaData[j] + '</a></li>';
          }
          html += '</tr><tr>' +
            '<th>Ряд</th>' +
            '<th title="Количество стеллажей">КС</th>';
          for (j = 0; j < rowMetaData.length; ++j) {
            html += '<th>Всего</th>' +
              '<th>Занято</th>' +
              '<th>%</th>' +
              '<th title="Паллетомест">ПМ</th>';
          }
          html += '</tr></thead><tbody>';
          var proc = 0;
          var td;
          var backgrnd;
          for (i = 0; i < rd.length; ++i) {
            html += '<tr rowid="' + rowid[i] + '"><td>' + row[i] + '</td>' +
              '<td>' + astillage[i] + '</td>';
            sumAS += astillage[i];
            for (j = 0; j < rowMetaData.length; ++j) {
              td = rd[i][j];
              proc = td.mp ? (td.cp / td.mp) * 100 : 0;

              backgrnd = (proc >= 90) ? lg173(proc) : lg104(proc);
              html += '<td>' + kInt(td.mp) + '</td>' +
                '<td>' + kInt(td.cp) + '</td>' +
                '<td style="' + backgrnd + '">' + parseInt(proc, 10) + '%</td>' +
                '<td>' + kFloat(td.pv, 2) + '</td>';
              sum[j][0] += kInt(td.mp);
              sum[j][1] += kInt(td.cp);
              sum[j][2] += td.pv;
            }
            html += '</tr>';
          }
          html += '</tody><tfoot><tr>';
          html += '<th></th><th>' + sumAS + '</th>';
          for (i = 0; i < rowMetaData.length; ++i) {
            proc = (sum[i][1] / sum[i][0]) * 100;
            backgrnd = (proc >= 90) ? lg173(proc) : lg104(proc);
            html += '<th>' + sum[i][0] + '</th>' +
              '<th>' + sum[i][1] + '</th>' +
              '<th>' + kInt(proc) + '%</th>' +
//                    '<th style="color ="black";' + backgrnd + '">' + parseInt(proc, 10) + '%</th>' +
              '<th>' + kFloat(sum[i][2], 2) + '</th>';
          }
          html += '</tfoot></table>';

          if ($('#dlgSiteLoad').length > 0) {
            $('#dlgSiteLoad').remove();
          }
          var $dlg = $('<div/>').attr('id', 'dlgSiteLoad').addClass('flora').css('text-align', 'center')
            .dialog({height: 500, width: 700, title: 'Заполненность склада', modal: false, draggable: true, resizable: false,
              closeOnEscape: false, position: ['right', 'top'],
            });
          $dlg.html(html).find('#tblRow').kTblScroll().kTblSorter().css('width', '100%').end()
            .dialog('open');
          $("<ul/>").attr("id", 'dvRowContextMenu').addClass("contextMenu")
            .html(li)
            .appendTo($(document.body));
          $('#tblRow>tbody>tr').contextMenu({menu: 'dvRowContextMenu'}, menu);
          //$('#tblRow').kTblScroll().css('width','100%');

        }
        for (var i = 0; i < JSONR.data.length; i++) {
          $dv = $('#dvS_' + JSONR.data[i].ID_SITE);
          if ($dv.length > 0) {
            proc = parseInt(JSONR.data[i].CURPALLET, 10) / parseInt(JSONR.data[i].MAXPALLET, 10) * 100;
            title = $dv.attr('title');
            /*infoDload.hist.push({'id': $dv.attr('id'),
             'title': title,
             'css': {'background-image': $dv.css('background-image'), 'opacity': $dv.css('opacity')} });*/
            $dv.css({'opacity': '0.6'})
              .attr('title', (title + ' Паллеты: ' + JSONR.data[i].CURPALLET + ' из ' + JSONR.data[i].MAXPALLET)).attr('style', $dv.attr('style') + siteBG(proc));
          }
        }
        $.unblockUI();
      });

    }
  });

  function print(siteid, ssid) {
    $.getJSON('GetPrintInfo', {siteid: siteid, ssid: ssid}, function (JSON) {
      if (!showErr(JSON)) {
        var td = JSON.data;
        var innerHTML = '<thead><tr><th colspan="4">Свободные</th></tr></thead></th></tr></thead><tbody>';
        for (var i = 0; i < parseInt(td.length / 4); ++i) {
          innerHTML += '<tr>' +
            '<td>' + td[4 * i].SNAME + '</td>' +
            '<td>' + td[4 * i + 1].SNAME + '</td>' +
            '<td>' + td[4 * i + 2].SNAME + '</td>' +
            '<td>' + td[4 * i + 3].SNAME + '</td>' +
            '</tr>';
        }
        if (4 * i < td.length) {
          innerHTML += '<tr><td>' + td[4 * i].SNAME + '</td>';
          innerHTML += (4 * i + 1 < td.length) ? ('<td>' + td[4 * i + 1].SNAME + '</td>') : '<td></td>';
          innerHTML += (4 * i + 2 < td.length) ? ('<td>' + td[4 * i + 2].SNAME + '</td>') : '<td></td>';
          innerHTML += (4 * i + 3 < td.length) ? ('<td>' + td[4 * i + 3].SNAME + '</td>') : '<td></td>';
          innerHTML += '</tr>';
        }

        innerHTML += '</tbody>';
        var wnd = window.open(sp_reports + '/printFree.html');
        wnd.onload = function () {
          wnd.document.getElementById("dvDateTime").innerHTML = kNow();
          wnd.document.getElementById("tbl").innerHTML = innerHTML;
        };
      }
    });
  }

  function printwares(siteid, ssid) {
    $.getJSON('GetPrintInfoWares', {siteid: siteid, ssid: ssid}, function (JSON) {
      if (!showErr(JSON)) {
        var td = JSON.data;
        var innerHTML = '<thead><tr><th>МП</th><th>(Код товара)Наименование=Кол-во(Итого)</th></tr></thead></th></tr></thead><tbody>';
        for (var i = 0; i < parseInt(td.length); ++i) {
          innerHTML += '<tr>' +
            '<td>' + td[i].SNAME + '</td>' +
            '<td>' + td[i].CNAME + '</td>' +
            '</tr>';
        }
        innerHTML += '</tbody>';
        var wnd = window.open(sp_reports + '/printBusy.html');
        wnd.onload = function () {
          wnd.document.getElementById("dvDateTime").innerHTML = kNow();
          wnd.document.getElementById("tbl").innerHTML = innerHTML;
        };
      }
    });
  }
}

