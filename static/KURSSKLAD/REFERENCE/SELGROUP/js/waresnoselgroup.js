/**
 * Created by KUA on 016 16.02.19.
 */
$(document).ready(function () {
  function createNode() {
    var name = this.WGCNT ? this.WGNAME + ' = ' + this.WGCNT : this.WGNAME;
    var parent = this.WGHIGHER ? $('#' + $.kID("liWG", this.WGHIGHER) + '>ul') : $('#dvWaresBySelgroupUlTree');
    var current = $("<li/>").attr("id", $.kID("liWG", this.WGID))
      .html("<a href='#'>" + name + "</a>").appendTo(parent);

    current.find("a").bind("click", clickWG);
    if (this.WGCHILD && this.WGCHILD == '1') {
      $("<ul/>").appendTo(current);
      current.addClass("hasChildren");
    }
  }

  function clickWG() {
    $('#dvWaresBySelgroupDvWares').empty();
    var param = {
      wgid: $(this).parents('li:first').kID(),
      whid: $('#wh').val()
    };
    $.getJSON('ajaxWaresNoSelGroupWGWares', param, function (json) {
      var html = '<table data-wgid="' + json.ext_data.WGID + '"><thead><tr>' +
        '<th ksort="text">Товарная группа</th>' +
        '<th ksort="false" class="chk"><input type="checkbox"/></th>' +
        '<th ksort="digit">Код</th>' +
        '<th ksort="text">Наименование</th>' +
        '</tr></thead><tbody>'
      $.each(json.data, function () {
        html += '<tr data-waresid=' + this.WID + '>' +
          '<td class="text">' + this.WGNAME + '</td>' +
          '<td class="chk"><input type="checkbox"></td>' +
          '<td class="number">' + this.WCODE + '</td>' +
          '<td class="text">' + this.WNAME + '</td>' +
          '</tr>';
      });
      html += '</tbody><tfoot><tr>' +
        '<th class="trcnt">' + json.data.length + '</th>' +
        '<th class="chk">0</th>' +
        '<th class="buttons" colspan="3"><button type="button" id="dvWaresBySelgroupBtnSet">' +
        '<img src="' + eng_img + '/actions/tick.png" border="0"> Установить</button></th>' +
        '</tr></tfoot></table>';

      $('#dvWaresBySelgroupDvWares').html(html)
        .find('table:first').kTblScroll().kTblSorter().kTdChk().rowFocus();

      $('#dvWaresBySelgroupBtnSet').click(setSelGroup);
    });
  }

  function setSelGroup() {
    function trHtml(data) {
      var html = '<tr data-sgid="'+data.ID+'" tmid="'+data.TMID+'" objid="'+data.OBJID+'" tutid="'+data.TUTID+'" tm_income="'+data.TMINCID+'">'+
                  '<td class="code">'+data.CODE+'</td>'+
                  '<td class="text name">'+data.NAME+'</td>'+
                  '<td class="number capacity">'+data.CAPACITY+'</td>'+
                  '<td class="number weight">'+data.WEIGHT+'</td>'+
                  '<td class="text object">'+data.FULLNAME+'</td>'+
                  '<td class="text tmname">'+data.TMNAME+'</td>'+
                  '<td class="sacode" title="'+data.SANAME+'">'+data.SACODE+'</td>'+
                  '<td class="number acceptterm">'+data.ACCEPTTERM+'</td>'+
                  '<td class="text tutype">'+data.TUTNAME+'</td>'+
                  '<td class="text tm_income">'+data.TMINCNAME+'</td>'+
                  //'<td class="needtunit"><input disabled type=checkbox' + (data.NEEDTUNIT == '1' ? ' checked' : '') + '></td>'+

                 '</tr>';
      return html;
    }

    var $chkes = $('#dvWaresBySelgroupDvWares').find('table:first').kTdChkGet();
    if (!$chkes.length) {
      alert('Нет выбранных товаров');
      return;
    }

    var $dv = $('#dvWaresBySelgroupDvSelectSG');
    if ($dv.length == 0) {
        $.getJSON('listSelgroup', function (json) {
          if (!showErr(json)) {
            var html = '<table id="tblSelgroup"><thead><tr>' +
              '<th colspan = "2">Группа отборки</th>' +
              '<th colspan = "2">Паллет</th>' +
              '<th rowspan = "2">Объект</th>' +
              '<th rowspan = "2">Метод отборки</th>' +
              '<th rowspan = "2" title="Подтверждение завершения отборки">ПЗО</th>' +
              '<th rowspan = "2" title="Срок приемки товара(%)">Срок приемки(%)</th>' +
              '<th rowspan = "2" title="">Единица транспортировки</th>' +
              '<th rowspan = "2" title="">Метод приёмки</th></tr>' +
              '<tr><th>Код</th>' +
              '<th>Наименование</th>' +
              '<th>Объем (л)</th>' +
              '<th>Вес (кг)</th>' +
             '</tr></thead><tbody>';
            for (var i = 0, n = json.data.length; i < n; ++i) {
              var d = json.data[i];
              html += trHtml(d);
            }
            html += '</tbody></table>';

            $("<div/>").attr('id', 'dvWaresBySelgroupDvSelectSG').addClass('flora')
              .dialog({
                title: 'Выберите  группу отборки',
                height: $(document.body).height() * 0.8,
                width: $(document.body).width() * 0.8,
                modal: true,
                resizable: false,
                draggable: true,
                overlay: {backgroundColor: '#000', opacity: 0.5},
              }).html(html).find('table:first')
               .kTblScroll().tablesorter().rowFocus({rfSetDefFocus:false})
              .find('tbody>tr').dblclick(function () {
                $('#dvWaresBySelgroupDvSelectSG').dialog('close')
                var sgid = $(this).attr('data-sgid');
                waresSetSelGroup($('#dvWaresBySelgroupDvWares').find('table:first').kTdChkGet(), 0, sgid,
                  $.progressbar({canClose: false, minValue: 0, maxValue: $chkes.length}));
              });

              $('.ui-dialog').addClass('flora');
          }
        });
    }
    else
      $dv.dialog('open');
  }

  function waresSetSelGroup($chkes, index, sgid, $progress) {
    if (index < $chkes.length) {
      var waresid = $chkes.eq(index).parents('tr:first').attr('data-waresid');
      $.getJSON('ajaxWaresSetSelgroup', {waresid: waresid, selgroupid: sgid}, function (json) {
        if (!showErr(json)) {
          $('#dvWaresBySelgroupDvWares').find('table:first tbody>tr[data-waresid=' + json.ext_data.WARESID + ']').remove();
          for (var i = 0; i < json.data.length; i++) {
            var $a = $('#' + $.kID("liWG", json.data[i].WGID) + '>a');
            var spl = $a.text().split('=');
            spl[spl.length - 1] = ' ' + kInt(spl[spl.length - 1]) - 1;
            $a.text(spl.join('='));
          }
          waresSetSelGroup($chkes, ++index, sgid, $progress.trigger('progressinc'));
        }
      })
    }
    else {
      var $tbl = $('#dvWaresBySelgroupDvWares').find('table:first');
      $tbl.find('tfoot>tr').find('>th.trcnt').text($tbl.find('tbody>tr').length);
      $tbl.find('tfoot>tr').find('>th.chk').text(0);
      $tbl.kTblSorter().kTblScroll();
    }
  }

  var dvHeight = kScreenH();
  $('#dvTbl').css({'height': dvHeight});

  $('#dvTbl').html('<div id="dvWaresBySelgroupDvData">' +
    '<div id="dvWaresBySelgroupDvTree">' +
      '<div id="dvWHList"><select id="wh"></select></div>' +
      '<ul id=dvWaresBySelgroupUlTree class="ulWaresGroup treeview"></ul> ' +
    '</div>' +
    '<div id="dvWaresBySelgroupDvWares"></div>' +
    '</div>' +
    '</div>');

  $('#dvWaresBySelgroupDvTree').css({
    'float': 'left',
    'position': 'relative',
    'height': dvHeight,
    'width': '25%'
  });

  //Пока склады не отображаем
  $('#dvWHList').css({
    'float': 'left',
    'position': 'relative',
    'width': '100%'
  }).hide();

  $('#wh').css('width', '100%');

  $('#dvWaresBySelgroupUlTree').css({
    'float': 'left',
    'position': 'relative',
    'height': dvHeight - $('#dvWHList').height(),
    'width': '100%',
    'overflow': 'auto',
    'text-align': 'left',
    'background-color': 'white'
  });

  $('#dvWaresBySelgroupDvWares').css({
    'float': 'left',
    'position': 'relative',
    'height': dvHeight,
    'width': '75%'
  });



  $.getJSON('listZoneObjects', function (JSON) {
    if (!showErr(JSON)) {
      var html = '';
      for (var i = 0; i < JSON.data.length; i++)
        html += '<option value=' + JSON.data[i].OBJID + '>' + JSON.data[i].OBJNAME + '</option>';
      $('#wh').html(html);
      if (JSON.ext_data.OBJID) {
        $('#wh').val(JSON.ext_data.OBJID);
      }
      $.getJSON('ajaxWaresNoSelGroupListWG', function (json) {
        $.each(json.data, createNode);
        $('#dvWaresBySelgroupUlTree').treeview({collapsed: true});
      });
    }
  });
});
