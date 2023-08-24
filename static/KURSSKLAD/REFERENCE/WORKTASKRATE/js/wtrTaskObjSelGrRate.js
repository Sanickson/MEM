/**
 * Created by Kua on 29.01.19.
 */
var tbl;
$(document).ready(function () {
  $('#dvWH').css({'height': kScreenH(), 'width': '100%'});
  $('#btnAdd').click($.buttonAdd);

  $("#frm").submit(function () {
    var P = $(this).kFormSubmitParam();
    if (tbl)
      tbl = $.TblDel(tbl);
    tbl = $('#dvWH').Tbl({
      code: 'WTRTASKZONESG',
      rowFocus: {rfSetDefFocus: false},
      contextMenu: {
        optSortKey: ['Upd', 'Del'],
        funcUpd: $.upd, classUpd: 'edit', nameUpd: 'Изменить',
        funcDel: $.del, classDel: 'delete', nameDel: 'Удалить'
      },
      foot: {footSet: SetTr}
    });

    $.getJSON('taskObjSelList', P, $.printRef);
    return false;
  });
});

(function ($) {
  $.fn.objIds = function () {
    var $tr = ($(this).is('tr') ? $(this) : $(this).parents('tr:first'));
    return $tr.attr('id') ? tbl.trKeyId($tr.attr('id')) : false;
  };
    $.printRef = function (json) {
    var jsonFull = {data: [], ext_data:[json.ext_data]};
    $.progressDo({
      arr: json.data,
      extParams: {},//входящие параметры
      arrNullAlert: 'Тарифы не найдены',
      url: 'taskObjSelInfo',
      funcParams: function (item) {
        return {id: item.ID};
      },
      funcIter: function (JSON) {
        jsonFull.data.push(JSON.data);
      },
      funcEnd: function () {
          if(jsonFull.data.length > 0)
            tbl.data(jsonFull);
          else
            alert ('Нет тарифов');
      }
    });
  };

  SetTr = function (data, clmSortKey) {
    var html = '<tfoot><tr>';
    html += '<th colspan="'+clmSortKey.length+'" class="buttons">' +
      '</th>';
    html += '</tr></tfoot>';
    return html;
  };

  $.buttonAdd = function () {
    if (!tbl){
      tbl = $('#dvWH').Tbl({
        code: 'WTRTASKZONESG',
        rowFocus: {rfSetDefFocus: false},
        contextMenu: {
          optSortKey: ['Upd', 'Del'],
          funcUpd: $.upd, classUpd: 'edit', nameUpd: 'Изменить',
          funcDel: $.del, classDel: 'delete', nameDel: 'Удалить'
        },
        foot: {footSet: SetTr}
      });
    }
    $(this).openDialogSettings();
  };

  $.upd = function () {
    $(this).openDialogSettings();
  };

  $.del = function () {
    var id = $(this).objIds();
    if (confirm('Вы действительно хотите удалить выделенную запись?')){
      $.getJSON('delTaskObjSel', {id: id}, function (json) {
        if (!showErr(json)) {
          var trId =  tbl.trId(id);
          tbl.trDel(trId);
        }
      });
    }
  };

  function formatDate(dt)
  {
    if (!dt || dt=='None') return '&nbsp;';
    else
    {   var date = dt.split(' ')[0];
        if (date.indexOf('-')>-1)
        {
           return date;
        }
        else {
          var d1 = date.split('.')[0];
          var d2 = date.split('.')[1];
          var d3 = date.split('.')[2];
          if (d1.length>2) return d1+'-'+d2+'-'+d3;
          else return '20'+d3+'-'+d2+'-'+d1;
        }
    }
  }

  $.fn.openDialogSettings = function(){
    var $object = $(this);
    var trId = $object.objIds();
    var data={};
    if(trId)
      data = tbl.trDataById(trId);

    function dv() {
      var $tbl = $("#dvWTR").find('>table');

      if (trId){
        $("#dvWTR").attr('data-wtrid', tbl.trKeyId(trId));
      }
      else{
        $("#dvWTR").removeAttr('data-wtrid');
      }


      data.WHID ? $tbl.find('select[name = "whid"]').val(data.WHID).trigger('change') : $tbl.find('select[name = "whid"]').trigger('change');
      $tbl
        //.find('select[name = "whid"]').val(data.WHID ? data.WHID : '').trigger('change').end()
        .find('select[name = "ttid"]').val(data.TTID ? data.TTID : '').end()
        .find('select[name = "sgid"]').val(data.SGID ? data.SGID : '').end()
        .find('input[name = "dbeg"]').val(data.DBEG ? formatDate(data.DBEG) : whToday()).end()
        .find('input[name = "dend"]').val(data.DEND ? formatDate(data.DEND) : whToday()).end()
        .find('input[name = "rateunit"]').val(data.RATEUNIT ? data.RATEUNIT : 0).end()
        .find('input[name = "rateunitw"]').val(data.RATEUNITW ? data.RATEUNITW : 0).end()
        .find('input[name = "rateweight"]').val(data.RATEWEIGHT ? data.RATEWEIGHT : 0).end()
        .find('input[name = "ratevolume"]').val(data.RATEVOLUME ? data.RATEVOLUME : 0).end()
        .find('input[name = "ratetask"]').val(data.RATETASK ? data.RATETASK : 0).end()
        //.find('input[name = "ratewares"]').val(data.RATEWARES ? data.RATEWARES : 0).end()
      .end();

      $("#dvWTR").dialog('option', 'title', data.ID ? 'Изменение тарифа' : 'Добавление тарифа' )
        .dialog("open").find('select:first').focus().end();
    }

    if ($("#dvWTR").length)
      dv();
    else {
      var html = '';
      html += '<table style="width: 100%; height: 80%;"><tr><td><b>Склад:</b></td><td>';
      html+= '<select id="frmWhid" name="whid"  style="width: 100%"  required>';
      html += '</select></td></tr>' +
        '<tr><td><b>Тип задания:</b></td><td>'+
        '<select id="frmTtid" name="ttid" style="width: 100%" required>';
      html += '</select></td></tr>' +
        '<tr><td><b>Группа отборки:</b></td><td>'+
        '<select id="frmSgid" name="sgid" style="width: 100%" required>';
      html += '</select></td></tr>' +
        '<tr><td><b>Период:</b></td>'+
        '<td><input id="frmDBeg" name="dbeg" type="date" size="8" required>' +
        '<input id="frmDEnd" name="dend" type="date" size="8" required></td></tr>' +
        '<tr><td title="Единица штучного товара"><b>Шт:</b></td>'+
        '<td><input id="frmRateUnit" name="rateunit" type="text" attr="rate" size="8" style="width: -webkit-fill-available;" ></td></tr>'+
        '<tr><td title="Единица весового товара"><b>Кг:</b></td>'+
        '<td><input id="frmRateUnitW" name="rateunitw" type="text" attr="rate" size="8" style="width: -webkit-fill-available;" ></td></tr>'+
        '<tr><td title="Тариф веса за килограмм"><b>Вес/кг:</b></td>'+
        '<td><input id="frmRateWeight" name="rateweight" attr="rate" type="text" size="8" style="width: -webkit-fill-available;" ></td></tr>'+
        '<tr><td title="Тариф объема за литр"><b>Объем/л:</b></td>'+
        '<td><input id="frmRateVolume" name="ratevolume" attr="rate" type="text" size="8" style="width: -webkit-fill-available;" ></td></tr>'+
        '<tr><td title="Тариф одного задания"><b>Задание:</b></td>'+
        '<td><input id="frmRateTask" name="ratetask" attr="rate" type="text" size="8" style="width: -webkit-fill-available;" ></td></tr>';
        //'<tr><td title="Тариф одного товара"><b>Товар:</b></td>'+
        //'<td><input id="frmRateWares" name="ratewares" type="text" size="8" style="width: -webkit-fill-available;" ></td></tr>';

      html += '</table>';

      html += '<br><br><hr><form><div class="buttons"><button type="submit" id="dvWTRSaveBtn"><img src="' + eng_img + '/actions/accept.png" border="0">Сохранить</button> ' +
        '<button type="button" id="dvWTRCloseBtn"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
        '</div>';

    $("<div/>").attr("id", "dvWTR").addClass("flora")
      .dialog({
        autoopen: false,
        title: 'Настройка тарифа',
        height: 550,
        width: 300,
        modal: true,
        resizable: false,
        draggable: false,
        overlay: {backgroundColor: '#000', opacity: 0.5}
      })
      .html(html)
        .find('#dvWTRCloseBtn').click(function () {
          $("#dvWTR").dialog('close');
        }).end()
        .find('table:first').css('border', '0px solid')
          .find('tbody, tr, td').css('border', '0px solid').end()
          .find('tr:hover td, tr td:hover').css('background-color', 'rgba(0, 0, 0, 0)').end()
          .find('#frmRateUnit,#frmRateUnitW,#frmRateWeight,#frmRateVolume,#frmRateTask').kInputFloat().end()
          .find('select#frmWhid').selectWarehouse().end()
          .find('select#frmSgid').selectSelGroup().end()
          .find('select#frmTtid').selectTasktype().end()
          .find('select#frmWhid').changeSelGroup(true).end()
      .end();

    $('#dvWTRSaveBtn').click(function (){
      $('#dvWTRSaveBtn').attr('disabled', 'disabled');
      var params = $('#dvWTR').find('*[name][attr!="rate"]').kFormSubmitParam();
      params = $.extend(params, $('#dvWTR').find('*[name][attr="rate"]').kFormSubmitParam({nullVal: ''}));
      if ($("#dvWTR").attr('data-wtrid')){
        params.id = $("#dvWTR").attr('data-wtrid');
      }
      if(!params.whid || !params.ttid){
        alert('Заполнены не все данные');
        $('#dvWTRSaveBtn').removeAttr('disabled');
        return false;
      }

      $.getJSON('setTaskObjSel', params, function(json){
        if (!showErr(json)){
          trRefresh(json);
          $("#dvWTR").dialog('close');
        }
      }, 'json');

      $('#dvWTRSaveBtn').removeAttr('disabled');
      return false;
    });

    dv();
    }
  };

  function trRefresh(json) {
    var jsonFull = {data: [], ext_data:[json.ext_data]};
    var $trid = tbl.trId(json.data['ID']);
    jsonFull.data.push(json.data);
    tbl.data(jsonFull);
    $('#'+$trid).kScrollToTr();
  }
})(jQuery);

