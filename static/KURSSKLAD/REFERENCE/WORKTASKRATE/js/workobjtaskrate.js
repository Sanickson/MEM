/**
 * Created by Nickson on 03.04.14.
 */
$(document).ready(function () {
  $.datepicker.setDefaults($.extend($.datepicker.regional['ru']));
  $('#dvWH').css({'height': kScreenH(), 'width': '100%'});
  $('#dbeg,#dend').datepicker().mask('99.99.9999').val(kToday());

  $.blockUI({message: '<h2>Получение списка складов</h2>'});
  $.getJSON('coreQUserWareHouses', function (JSON) {
    for (var i = 0; i < JSON.data.length; ++i)
      $('#whid').append('<option value="' + JSON.data[i].WHID + '">' + JSON.data[i].WHNAME + '</option>');
    $('#whid').css('width', '120px');
    $.unblockUI();

    $.blockUI({message: '<h2>Получение списка типов заданий</h2>'});
    $.getJSON('qTaskTypeList', function (JSON) {
      for (var i = 0; i < JSON.data.length; ++i)
        $('#ttid').append('<option value="' + JSON.data[i].ID + '">' + JSON.data[i].NAME + '</option>');
      $('#ttid').css('width', '120px');
      $.unblockUI();
    });
  });

  $("#frm").submit(function () {
    $.getJSON('ttorQList', $(this).kFormSubmitParam(), $.workTaskTypeRate);
    return false;
  });
});

;
(function ($) {
  function menuId() {
    var mId = 'menuTblWTR';
    if ($("#" + mId).length == 0) {
      $("<ul/>").attr("id", mId).addClass("contextMenu").css("width", "190px")
        .html('<li class="add "><a href="#add">Добавить</a></li>' +
          '<li class="edit"><a href="#upd">Изменить</a></li>' +
          '<li class="delete"><a href="#del">Удалить</a></li>')
        .appendTo($(document.body));
    }
    return mId;
  }

  function menu(action, el) {
    if (action == 'add') add();
    else if (action == 'upd') upd();
    else if (action == 'del') del();
  }

  function trHTML(tr) {
    return '<td class="text wh" data-val="' + tr.WHID + '">' + tr.WHNAME + '</td>' +
      '<td class="text tasktype" data-val="' + tr.TTID + '">' + tr.TTNAME + '</td>' +
      '<td class="number rateunit">' + kFloat(tr.RATEUNIT, 2) + '</td>' +
      '<td class="number rateunitw">' + kFloat(tr.RATEUNITW, 2) + '</td>' +
      '<td class="number rateweight">' + kFloat(tr.RATEWEIGHT, 2) + '</td>' +
      '<td class="number ratevolume">' + kFloat(tr.RATEVOLUME, 2) + '</td>' +
      '<td class="number ratetask">' + kFloat(tr.RATETASK, 2) + '</td>' +
      '<td class="dbeg">' + tr.DBEG + '</td>' +
      '<td class="dend">' + tr.DEND + '</td>';
  }

  $.workTaskTypeRate = function (json) {
    var html = '<table id="tblWTR"><thead><tr>' +
      '<th ksort="text">Склад</th>' +
      '<th ksort="text">Тип задания</th>' +
      '<th ksort="digit" title="Тариф штучной единицы">Шт</th>' +
      '<th ksort="digit" title="Тариф весовой единицы">Кг</th>' +
      '<th ksort="digit">Вес/кг</th>' +
      '<th ksort="digit">Объем/л</th>' +
      '<th ksort="digit" title="Тариф одного задания">Задание</th>' +
      '<th ksort="date">Начало</th>' +
      '<th ksort="date">Завершение</th>' +
      '</tr></thead><tbody>';

    for (var i = 0; i < json.data.length; i++) {
      var tr = json.data[i];
      html += '<tr id="trWTR_' + tr.ID + '">' + trHTML(tr) + '</tr>';
    }

    html += '</tbody><tfoot>' +
      '<tr>' +
      '<th colspan="9" class="buttons">' +
      '<button type="button" title="Добавить" id="btnAdd">' +
      '<img src="' + eng_img + '/actions/add.png" border="0">' +
      '</button>' +
      '<button type="button" title="Изменить" id="btnUpd">' +
      '<img src="' + eng_img + '/actions/edit.png" border="0">' +
      '</button>' +
      '<button type="button" title="Удалить" id="btnDel">' +
      '<img src="' + eng_img + '/actions/delete.png" border="0">' +
      '</button>' +
      '</th>' +
      '</tr>' +
      '</tfoot></table>';

    $('#dvWH').html(html).find('table:first').css('width', '100%').kTblScroll().kTblSorter().rowFocus()
      .find('tbody>tr').contextMenu({menu: menuId()}, menu);

    $('#btnAdd').click(add);
    $('#btnUpd').click(upd);
    $('#btnDel').click(del);
  }

  function add() {
    var $dv = $('#frmAdd');
    if (!$dv.length) {
      var html = '<div><label class="lbl" for="">Склад: </label>' +
        '<select id="frmAddWhid" name="whid" style="width:165px">' + $('#whid').html() + '</select></div>' +
        '<div><label class="lbl" for="">Тип задания: </label>' +
        '<select id="frmAddTtid" name="ttid" style="width:125px">' + $('#ttid').html() + '</select></div>' +
        '<div><label class="lbl" for="">Период: </label>' +
        '<input id="frmAddDBeg" name="dbeg" type="text" size="8">&nbsp;' +
        '<input id="frmAddDEnd" name="dend" type="text" size="8"></div>' +
        '<div><label class="lbl" for="">Единица штучного товара: </label>' +
        '<input id="frmAddRateUnit" name="rateunit" type="text" size="8"></div>' +
        '<div><label class="lbl" for="">Единица весового товара: </label>' +
        '<input id="frmAddRateUnitW" name="rateunitw" type="text" size="8"></div>' +
        '<div><label class="lbl" for="">Тариф веса за килограмм: </label>' +
        '<input id="frmAddRateWeight" name="rateweight" type="text" size="8"></div>' +
        '<div><label class="lbl" for="">Тариф объема за литр: </label>' +
        '<input id="frmAddRateVolume" name="ratevolume" type="text" size="8"></div>' +
        '<div><label class="lbl" for="">Тариф одного задания: </label>' +
        '<input id="frmAddRateTask" name="ratetask" type="text" size="8"></div>' +
        '<hr>' +
        '<div style="width:100%;" class="buttons">' +
        '<button type="submit">' +
        '<img src="' + eng_img + '/actions/accept.png" border="0">Сохранить' +
        '</button>&nbsp;&nbsp;&nbsp;' +
        '<button type="button">' +
        '<img src="' + eng_img + '/actions/cancel.png" border="0">Отмена' +
        '</button>' +
        '</div>';

      $('<form/>').attr("id", "frmAdd").addClass("flora").css("text-align", "left")
        .dialog({closeOnEscape: false, title: 'Добавление',
          autoOpen: true, resizable: false,
          draggable: false, modal: true,
          overlay: {opacity: 0.5, background: "black"},
          height: 285, width: 300})
        .html(html)
        .submit(function () {
          $.getJSON('ttorQAdd', $(this).kFormSubmitParam(), function (json) {
            if (!showErr(json)) {
              $("#frmAdd").dialog('close');
              trRefresh(json);
            }
          });
          return false;
        })
        .find("button:last").click(function () {
          $("#frmAdd").dialog("close");
        }).end();

      $('#frmAddDBeg,#frmAddDEnd').datepicker().mask('99.99.9999').val(kToday());
      $('#frmAddWhid').val($('#whid').val()).find('>option[value=0]').remove();
      $('#frmAddTtid').val($('#ttid').val()).find('>option[value=0]').remove();
      $('#frmAddRateUnit,#frmAddRateUnitW,#frmAddRateWeight,#frmAddRateVolume,#frmAddRateTask').kInputFloat();
    }
    else {
      $dv.dialog('open');
    }
  }

  function upd() {
    if (!$('#tblWTR').rf$GetFocus().length) {
      alert('Нет выбранной записи');
      return;
    }
    var $dv = $('#frmUpd');
    if (!$dv.length) {
      var html = '<div><label class="lbl" for="">Склад: </label>' +
        '<select id="frmUpdWhid" name="whid" style="width:165px">' + $('#whid').html() + '</select></div>' +
        '<div><label class="lbl" for="">Тип задания: </label>' +
        '<select id="frmUpdTtid" name="ttid" style="width:125px">' + $('#ttid').html() + '</select></div>' +
        '<div><label class="lbl" for="">Период: </label>' +
        '<input id="frmUpdDBeg" name="dbeg" type="text" size="8">&nbsp;' +
        '<input id="frmUpdDEnd" name="dend" type="text" size="8"></div>' +
        '<div><label class="lbl" for="">Единица штучного товара: </label>' +
        '<input id="frmUpdRateUnit" name="rateunit" type="text" size="8"></div>' +
        '<div><label class="lbl" for="">Единица весового товара: </label>' +
        '<input id="frmUpdRateUnitW" name="rateunitw" type="text" size="8"></div>' +
        '<div><label class="lbl" for="">Тариф веса за килограмм: </label>' +
        '<input id="frmUpdRateWeight" name="rateweight" type="text" size="8"></div>' +
        '<div><label class="lbl" for="">Тариф объема за литр: </label>' +
        '<input id="frmUpdRateVolume" name="ratevolume" type="text" size="8"></div>' +
        '<div><label class="lbl" for="">Тариф за задание: </label>' +
        '<input id="frmUpdRateTask" name="ratetask" type="text" size="8"></div>' +
        '<hr>' +
        '<div style="width:100%;" class="buttons">' +
        '<button type="submit">' +
        '<img src="' + eng_img + '/actions/accept.png" border="0">Сохранить' +
        '</button>&nbsp;&nbsp;&nbsp;' +
        '<button type="button">' +
        '<img src="' + eng_img + '/actions/cancel.png" border="0">Отмена' +
        '</button>' +
        '</div>';

      $dv = $('<form/>').attr("id", "frmUpd").addClass("flora").css("text-align", "left")
        .dialog({closeOnEscape: false, title: 'Изменение',
          autoOpen: false, resizable: false,
          draggable: false, modal: true,
          overlay: {opacity: 0.5, background: "black"},
          height: 285, width: 300})
        .html(html)
        .submit(function () {
          var param = $(this).kFormSubmitParam();
          param.id = $('#tblWTR').rf$GetFocus().attr('id').split('_')[1];
          $.getJSON('ttorQUpd', param, function (json) {
            if (!showErr(json)) {
              $("#frmUpd").dialog('close');
              trRefresh(json);
            }
          });
          return false;
        })
        .find("button:last").click(function () {
          $("#frmUpd").dialog("close");
        }).end();

      $('#frmUpdDBeg,#frmUpdDEnd').datepicker().mask('99.99.9999');
      $('#frmUpdWhid').find('>option[value=0]').remove();
      $('#frmUpdTtid').find('>option[value=0]').remove();
      $('#frmUpdRateUnit,#frmUpdRateUnitW,#frmUpdRateWeight,#frmUpdRateVolume,#frmUpdRateTask').kInputFloat();
    }

    var $tr = $('#tblWTR').rf$GetFocus();
    $('#frmUpdDBeg').val($tr.find('>td.dbeg').text());
    $('#frmUpdDEnd').val($tr.find('>td.dend').text());
    $('#frmUpdWhid').val($tr.find('>td.wh').attr('data-val'));
    $('#frmUpdTtid').val($tr.find('>td.tasktype').attr('data-val'));
    $('#frmUpdRateUnit').val($tr.find('>td.rateunit').text());
    $('#frmUpdRateUnitW').val($tr.find('>td.rateunitw').text());
    $('#frmUpdRateWeight').val($tr.find('>td.rateweight').text());
    $('#frmUpdRateVolume').val($tr.find('>td.ratevolume').text());
    $('#frmUpdRateTask').val($tr.find('>td.ratetask').text());

    $dv.dialog('open');
  }

  function del() {
    var $tr = $('#tblWTR').rf$GetFocus();
    if (!$tr.length) {
      alert('Нет выбранной записи');
    }
    else if (confirm('Вы действительно хотите удалить выделенную запись?'))
      $.getJSON('ttorQDel', {id: $tr.attr('id').split('_')[1]}, function (json) {
        if (!showErr(json)) {
          var $tr = $('#trWTR_' + json.ext_data.ID);
          if ($tr.length) {
            $tr.remove();
            $('#tblWTR').kTblScroll().kTblSorter();
          }
        }
      });
  }

  function trRefresh(json) {
    var $tr = $('#trWTR_' + json.data.ID);
    if ($tr.length) {
      $tr.html(trHTML(json.data)).rowFocus().parents('table:first').kTblScroll().kTblSorter();
    }
    else {
      var $tbl = $('#tblWTR');
      $('<tr/>').attr('id', 'trWTR_' + json.data.ID).html(trHTML(json.data)).appendTo($tbl)
        .rowFocus().contextMenu({menu: menuId()}, menu);
      $tbl.kTblScroll().kTblSorter();
    }
  }
})(jQuery);