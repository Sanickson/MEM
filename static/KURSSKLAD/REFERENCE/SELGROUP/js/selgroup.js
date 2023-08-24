const mId = 'menuTblSelGroup';
const mTaraId = 'menuTblTara';

$(document).ready(function () {
  $('#dvTbl').css({'height': kScreenH()});

  $("<ul/>").attr("id",mId).addClass("contextMenu").css("width","190px")
      .html('<li class="add "><a href="#add">Добавить</a></li>'+
            '<li class="edit"><a href="#chg">Изменить</a></li>'+
            '<li class="delete"><a href="#del">Удалить</a></li>'+
            '<li class="print"><a href="#print">Печать</a></li>'+
            '<li class="config separator"><a href="#set">ГО товаров</a></li>'+
            '<li class="applicationGo "><a href="#selaccept">ПЗО товара</a></li>'+
            '<li class="selectAll separator"><a href="#tara">Тара</a></li>')
  .appendTo($(document.body));

  $("<ul/>").attr("id",mTaraId).addClass("contextMenu").css("width","190px")
      .html('<li class="add "><a href="#add">Добавить</a></li>'+
            '<li class="edit"><a href="#chg">Порядковый номер</a></li>'+
            '<li class="delete"><a href="#del">Удалить</a></li>')
  .appendTo($(document.body));

});

;(function ($) {
  //var selectMethodHTML = '', selectObjectHTML = '', selectSelAcceptHTML = '';

  $.fn.trSelGroupEvents = function(){
    this.dblclick(cngSelGroup).contextMenu({menu:mId},menuSelGroup)
      .find('td.taraweight>input:checkbox').click(function(){
        var mes, val;
        if ($(this).attr('checked')){
          mes = 'Вы действительно хотите ВКЛЮЧИТЬ использование тары для товаров выбранной группы отборки?';
          val = '1';
        }
        else{
          mes = 'Вы действительно хотите ОТКЛЮЧИТЬ использование тары для товаров выбранной группы отборки?';
          val = '0';
        }
        if (confirm(mes)){
          $.getJSON('useTaraWeightSet', {sgid: $(this).parents('tr:first').attr('sgid'), utw: val}, function(json){
            if (!showErr(json)){
              var $chb = $('#tblSelgroup tbody>tr[sgid='+ json.data.SGID+']>td.taraweight>input:checkbox');
              if ($chb.length){
                if (json.data.UTW == '1')
                  $chb.attr('checked', 'checked');
                else
                  $chb.removeAttr('checked');
              }
            }
          });
        }
        return false;
      }).end()
    return this;
  };

  function menuSelGroup(action, el){
      switch (action){
        case 'add':
          addSelGroup.call(el);
          break;
        case 'chg':
          cngSelGroup.call(el);
          break;
        case 'del':
          delSelGroup.call(el);
          break;
        case 'print':
          printSelGroup();
          break;
        case 'set':
          showWaresGroup();
          break;
        case 'selaccept':
          waresGroupSelAccept();
          break;
        case 'tara':
          sgTara.call(el);
          break;
        default:
          alert('Для выбранной опции меню нет обработчика');
      };
  };

  function listSelgroup() {
    $.getJSON('listSelgroup', {}, function (JSON) {
      if (!showErr(JSON)) {
        var html = '<table id="tblSelgroup"><thead><tr>' +
          '<th colspan = "4">Группа отборки</th>' +
          '<th colspan = "8">Отборка</th>' +
          '<th colspan = "2">Приемка</th></tr>' +
          '<tr><th>Код</th>' +
          '<th>Наименование</th>' +
          '<th>Объект</th>' +
          '<th title="Вес тары: только для весовых товаров">ВТ</th>' +
          '<th title="Срок продажи товара(%)">Срок (%)</th>' +
          '<th>Метод</th>' +
          '<th title="Предварительное сканирование товара в отборке позиции">ПСТ</th>' +
          '<th title="Подтверждение завершения отборки">ПЗО</th>' +
          '<th title="Максимальный объем товара по заданию отборки">Объем (л)</th>' +
          '<th title="Максимальный вес товара по заданию отборки">Вес (кг)</th>' +
          '<th title="Максимальное количество позиций в задании отборки">Макс КП</th>' +
          '<th title="Единица транспортировки">ЕТ</th>' +
          '<th title="Срок приемки товара(%)">Срок (%)</th>' +
          '<th title="Метод приемки">Метод</th></tr>' +
          '</thead><tbody>';

        for (var i = 0, n = JSON.data.length; i < n; ++i)
          html += trHtml(JSON.data[i]);
        html += '</tbody><tfoot><tr><th class="buttons" colspan="14">\
                            <button type="button" title="Добавить" class="sgadd"><img src="' + eng_img + '/actions/add.png" border="0"></button>\
                            <button type="button" title="Изменить" class="sgcng"><img src="' + eng_img + '/actions/edit.png" border="0"></button>\
                            <button type="button" title="Удалить" class="sgdel"><img src="' + eng_img + '/actions/delete.png" border="0"></button>\
                            <button type="button" title="Печать" class="sgprint"><img src="' + eng_img + '/actions/printer.png" border="0"></button>\
                            <button type="button" title="Установить" class="sgset"><img src="' + eng_img + '/actions/config.png" border="0"></button>\
                            <button type="button" title="Подтверждение завершения отборки" class="selaccept"><img src="' + eng_img + '/actions/application_go.png" border="0"></button>\
                        </th></tr></tfoot></table>';
        $('#dvTbl').html(html)
          .find('>table')
          .kTblScroll().tablesorter().rowFocus({rfSetDefFocus: true})
          .tablesorter()
          .find("tbody>tr").trSelGroupEvents().end()
          .find("button")
          .filter('.sgcng').click(cngSelGroup).end()
          .filter('.sgadd').click(addSelGroup).end()
          .filter('.sgdel').click(delSelGroup).end()
          .filter('.sgprint').click(printSelGroup).end()
          .filter('.sgset').click(showWaresGroup).end()
          .filter('.selaccept').click(waresGroupSelAccept).end();
      }
    });
  }

  listSelgroup();
  function trHtml(data) {
    var html = '<tr sgid="' + data.ID + '" tmid="' + data.TMID + '" objid="' + data.OBJID + '" tutid="' + data.TUTID + '" tm_income="' + data.TMINCID + '">' +
      '<td class="code">' + data.CODE + '</td>' +
      '<td class="text name">' + data.NAME + '</td>' +
      '<td class="text object">' + data.FULLNAME + '</td>' +
      '<td class="taraweight"><input type="checkbox"' + (data.USETARAWEIGHT == '1' ? ' checked' : '') + '></td>' +
      '<td class="number saleterm">' + data.SALETERM + '</td>' +
      '<td class="text tmname">' + data.TMNAME + '</td>' +
      '<td class="prescan" title="' + data.SPNAME + '">' + data.SPCODE + '</td>' +
      '<td class="sacode" title="' + data.SANAME + '">' + data.SACODE + '</td>' +
      '<td class="number capacity">' + data.CAPACITY + '</td>' +
      '<td class="number weight">' + data.WEIGHT + '</td>' +
      '<td class="number selectmaxpos">' + data.SELECTMAXPOS + '</td>' +
      '<td class="text tutype">' + data.TUTNAME + '</td>' +
      '<td class="number acceptterm">' + data.ACCEPTTERM + '</td>' +
      '<td class="text tm_income">' + data.TMINCNAME + '</td>' +
      //'<td class="needtunit"><input disabled type=checkbox' + (data.NEEDTUNIT == '1' ? ' checked' : '') + '></td>'+

      '</tr>';
    return html;
  }

  function showWaresGroup() {
    var $tr = $('#tblSelgroup').rf$GetFocus();
    var $sgname = $tr.find('td.name').text();
    var $sgid = $tr.attr('sgid');
    $.sgWaresLocateTree({divId: "dvWaresLocate", title: 'Группа отбора: ' + $sgname, WsgId: $sgid});
  }


  function addSelGroup() {
    /*function frmSubmit(param){
     $.getJSON("addSelGroup",param,function(JSON){
     if(!showErr(JSON)){
     var html = $('#tblSelgroup').find('tbody').html();
     html+=trHtml(JSON.data);
     $('#dvTbl').find('tbody').html(html);
     $('#tblSelgroup').kTblScroll().tablesorter().rowFocus({rfSetDefFocus:false});
     $("#dvSelGroup").dialog("close");
     }
     });
     }*/
    $selGroupDialogs({title: 'Добавление группы отбора'}, {/*frmSubmit:frmSubmit,*/btnConfTitle: 'Добавить'});
  }

  function cngSelGroup() {
    var $tr = $('#tblSelgroup').rf$GetFocus();
    /*
     function frmSubmit(param){
     $.getJSON('cngSelGroup',param,function(JSON){
     if(!showErr(JSON)){
     $tr.replaceWith(trHtml(JSON.data));
     $('#tblSelgroup').kTblScroll().tablesorter().rowFocus({rfSetDefFocus:false});
     $("#dvSelGroup").dialog("close");
     }
     });
     }*/
    $selGroupDialogs({title: 'Изменение группы отбора'}, {/*frmSubmit:frmSubmit,*/btnConfTitle: 'Изменить', $tr: $tr});
  }

  function delSelGroup() {
    var $tr = $('#tblSelgroup').rf$GetFocus();
    /*
     function frmSubmit(param){
     $(this).showConf({ text: 'Вы действительно хотите удалить группу отбора?',
     confirm: function() {
     $.getJSON('delSelGroup',param,function(){
     $tr.remove();
     $('#tblSelgroup').kTblScroll().tablesorter().rowFocus({rfSetDefFocus:false});
     $("#dvSelGroup").dialog("close");
     });
     },
     cancel: function() {
     $("#dvSelGroup").dialog("close");
     }
     });
     }*/
    $selGroupDialogs({title: 'Удаление группы отбора'}, {/*frmSubmit:frmSubmit,*/btnConfTitle: 'Удалить', $tr: $tr});
  }

  function printSelGroup() {
    var dvData = $('#tblSelgroup');
    var wnd = window.open(sp_reports + '/print.html');
    wnd.onload = function () {
      wnd.document.getElementById("dvData").innerHTML = dvData.printHTML();
    };
  }

  function $selGroupDialogs(dvOptions, prOptions) {
    var dvOptions = $.extend({
      closeOnEscape: false, title: '',
      autoOpen: true, resizable: false,
      draggable: false, modal: true,
      overlay: {opacity: 0.5, background: "black"},
      height: 450, width: 340
    }, dvOptions);
    var prOptions = $.extend({$tr: false, frmSubmit: false, btnConfTitle: false}, prOptions);

    if ($("#dvSelGroup").length) {
      $("#dvSelGroup").dialog("destroy").remove();
    }

    var selectMethodHTML = '<option value="">Не выбран</option>';
    var tmid = prOptions.$tr ? prOptions.$tr.attr('tmid') : false;
    $.ajax({
      url: 'ajaxGetMethod',
      success: function (json) {
        for (var j = 0; j < json.data.length; ++j) {
          var r = json.data[j];
          selectMethodHTML += '<option value=' + r.METHODID + ' ' + (tmid == r.METHODID ? 'selected' : '') + '>' + r.NAME + '</option>';
        }
      },
      dataType: 'json',
      async: false
    });


    var selectObjectHTML = '';
    var objid = prOptions.$tr ? prOptions.$tr.attr('objid') : false;
    $.ajax({
      url: 'ajaxGetObject',
      success: function (json) {
        for (var j = 0; j < json.data.length; ++j) {
          var r = json.data[j];
          selectObjectHTML += '<option value=' + r.OBJID + '  ' + (objid == r.OBJID ? 'selected' : '') + '>' + r.FULLNAME + '</option>';
        }
      },
      dataType: 'json',
      async: false
    });


    var selectTUTypeHTML = '<option value="">Не выбран</option>';
    var tutid = prOptions.$tr ? prOptions.$tr.attr('tutid') : false;
    $.ajax({
      url: 'ajaxGetTUType',
      success: function (json) {
        for (var j = 0; j < json.data.length; ++j) {
          var r = json.data[j];
          selectTUTypeHTML += '<option value="' + r.TUTID + '" ' + (tutid == r.TUTID ? 'selected' : '') + '>' + r.TUTNAME + '</option>';
        }
      },
      dataType: 'json',
      async: false
    });


    var selectTM_IncomeHTML = '<option value="">Не выбран</option>';
    var tm_income = prOptions.$tr ? prOptions.$tr.attr('tm_income') : false;
    $.ajax({
      url: 'ajaxGetTM_Income',
      success: function (json) {
        for (var j = 0; j < json.data.length; ++j) {
          var r = json.data[j];
          selectTM_IncomeHTML += '<option value="' + r.TMINCID + '" ' + (tm_income == r.TMINCID ? 'selected' : '') + '>' + r.TMINCNAME + '</option>';
        }
      },
      dataType: 'json',
      async: false
    });


    var code = prOptions.$tr ? prOptions.$tr.find('td.sacode').text() : false;
    var optionSelAcceptHTML = '<option value="">Не выбран</option>';
    $.ajax({
      url: 'ajaxGetSelAccept',
      success: function (json) {
        for (var j = 0; j < json.data.length; ++j) {
          var r = json.data[j];
          optionSelAcceptHTML += '<option value="' + r.CODE + '" ' + (code == r.CODE ? 'selected' : '') + '>' + r.NAME + '</option>';
        }
      },
      dataType: 'json',
      async: false
    });

    var prescancode = prOptions.$tr ? prOptions.$tr.find('td.prescan').text() : false;
    var optionPreScanHTML = '<option value="">Сканирование не нужно</option>';
    $.ajax({
      url: 'ajaxGetPreScanWares',
      success: function (json) {
        for (var j = 0; j < json.data.length; ++j) {
          var r = json.data[j];
          optionPreScanHTML += '<option value="' + r.CODE + '" ' + (prescancode == r.CODE ? 'selected' : '') + '>' + r.NAME + '</option>';
        }
      },
      dataType: 'json',
      async: false
    });


    var html = '<form><table style="width: 100%"><tbody><input type="hidden" name="sgid" value="' + (prOptions.$tr ? prOptions.$tr.attr('sgid') : '') + '">' +
      '<tr><td class="text">Код</td><td><input style="width: 200px;" type="text" name="code" maxlength="3" title="Максимум 3 символа" style="text-align: right"/></td></tr>\
      <tr><td class="text">Наименование</td><td><input style="width: 200px;" type="text" name="name" maxlength="80" title="Максимум 80 символов" style="text-align: right"/></td></tr>\
      <tr><td class="text">Объект</td><td><select style="width: 200px;" name="objid">' + selectObjectHTML + '</select></td></tr>\
            <tr><td colspan="2">Отборка</td></tr>\
						<tr><td class="text">Срок отборки(%)</td><td><input style="width: 200px;" type="text" name="saleterm" value="0" placeholder="По умолчанию = 100%"/></td></tr>\
						<tr><td class="text">Метод</td><td><select style="width: 200px;" name="tmid">' + selectMethodHTML + '</select></td></tr>\
						<tr><td class="text" title="Предварительное сканирование товара в отборке позиции">ПреСкан</td><td><select style="width: 200px;" name="prescan">' + optionPreScanHTML + '</select></td></tr>\
						<tr><td class="text" title="Подтверждение завершения отборки">ПЗО</td><td><select style="width: 200px;" name="selaccept">' + optionSelAcceptHTML + '</select></td></tr>\
						<tr><td class="text" title="Максимальный объем товара по заданию отборки">Объем</td><td><input style="width: 200px;" type="text" name="capacity" /></td></tr>\
						<tr><td class="text" title="Максимальный вес товара по заданию отборки">Вес</td><td><input style="width: 200px;" type="text" name="weight" /></td></tr>\
						<tr><td class="text" title="Максимальное количество позиций в задании отборки">Макс КП</td><td><input style="width: 200px;" type="text" name="selectmaxpos" /></td></tr>\
						<tr><td class="text" title="Единица транспортировки">ЕТ</td><td><select style="width: 200px;" name="tutype">' + selectTUTypeHTML + '</select></td></tr>\
						<tr><td colspan="2">Приемка</td></tr>\
						<tr><td class="text">Срок приемки(%)</td><td><input style="width: 200px;" type="text" name="acceptterm" value="0" /></td></tr>\
						<tr><td class="text">Метод приёмки</td><td><select style="width: 200px;" name="tm_income">' + selectTM_IncomeHTML + '</select>\
            </tbody></table><br><hr>\
         		       <div class="buttons" style="width:100%;">' +
      (prOptions.btnConfTitle ? '<button type="submit" id="dvDocConfOk"><img src="' + eng_img + '/actions/accept.png" border="0">' + prOptions.btnConfTitle + '</button>&nbsp;&nbsp;&nbsp;' : '') +
      '<button type="button" id="dvDocConfCanc"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
      '</div></form>';

    var $dv = $('<div/>').attr("id", "dvSelGroup").addClass("flora")
      .css("text-align", "center")
      .dialog(dvOptions)
      .html(html).find('table')
      .find('input[name="capacity"]').kInputFloat().end()
      .find('input[name="weight"]').kInputFloat().end()
      .find('input[name="saleterm"]').kInputInt().end().end()
      .find('input[name="acceptterm"]').kInputInt().end().end()
      .find('input[name="selectmaxpos"]').kInputInt().end().end()
      .find("button:last")
      .click(function () {
        $("#dvSelGroup").dialog("close");
      }).end();

    if (dvOptions.title != 'Добавление группы отбора') {
      var $tr = prOptions.$tr.find('td');
      $("#dvSelGroup")
        .find('input[name="code"]').val($tr.filter('.code').text()).end()
        .find('input[name="name"]').val($tr.filter('.name').text()).end()
        .find('input[name="capacity"]').val($tr.filter('.capacity').text()).end()
        .find('input[name="weight"]').val($tr.filter('.weight').text()).end()
        .find('input[name="selectmaxpos"]').val($tr.filter('.selectmaxpos').text()).end()
        .find('input[name="acceptterm"]').val($tr.filter('.acceptterm').text()).end()
        .find('input[name="saleterm"]').val($tr.filter('.saleterm').text()).end()
      //if ($tr.filter('.needtunit').find('input:checkbox').is(':checked')){
      //    $("#dvSelGroup").find('input[name="needtunit"]').attr('checked', 'checked');
      //}
      //else{
      //    $("#dvSelGroup").find('input[name="needtunit"]').removeAttr('checked');
      //}
    }

    if (dvOptions.title == 'Удаление группы отбора') {
      $("#dvSelGroup").find("input,select").attr({'disabled': 'disabled'});
      //$("#dvSelGroup").find("select").attr({'disabled':'disabled'});
    }


    $("#dvSelGroup>form").find('button:last').click(function () {
      $("#dvSelGroup").dialog("close");
    });

    $("#dvSelGroup>form").submit(function () {
      var param = $(this).kFormSubmitParam();
      //param.needtunit = $(this).find('input[name="needtunit"]').attr('checked') ? '1' : '0';
      if ((param.code == '') || (param.name == '') || (param.capacity == '') || (param.weight == '') || (param.objid == '')) {
        alert('Введите все значения');
        return false;
      }
      if (param.acceptterm == '') {
        alert('Срок приемки не может быть пустой строкой');
        return false;
      }
      if (dvOptions.title == 'Изменение группы отбора') {
        var P = {
          sgId: param.sgid,
          sgCode: param.code,
          sgName: param.name,
          sgCap: param.capacity,
          sgWght: param.weight,
          sgObjId: param.objid,
          sgTmId: param.tmid,
          sgSelAccept: param.selaccept,
          sgAcceptTerm: param.acceptterm,
          sgPreScan: param.prescan,
          sgSaleTerm: param.saleterm,
          tutype: param.tutype,
          tm_income: param.tm_income,
          selectmaxpos: param.selectmaxpos
        };
        $.getJSON('cngSelGroup', P, function (json) {
          if (showErr(json))
            return false;

          var $dvSelGroup = $('#dvSelGroup');
          if (dvOptions.title != 'Добавление группы отбора') {
            $('#tblSelgroup').rf$GetFocus()
              .find('td.code').text($dvSelGroup.find('input[name="code"]').val()).end()
              .find('td.name').text($dvSelGroup.find('input[name="name"]').val()).end()
              .find('td.capacity').text($dvSelGroup.find('input[name="capacity"]').val()).end()
              .find('td.weight').text($dvSelGroup.find('input[name="weight"]').val()).end()
              .find('td.selectmaxpos').text($dvSelGroup.find('input[name="selectmaxpos"]').val()).end()
              .find('td.acceptterm').text($dvSelGroup.find('input[name="acceptterm"]').val()).end()
              .find('td.saleterm').text($dvSelGroup.find('input[name="saleterm"]').val()).end()
            //.find('td.needtunit input').attr('checked', param.needtunit == '1' ? true : false ).end()
              .find('td.tutype').text($dvSelGroup.find('select[name="tutype"]').val() == '' ? '' : $dvSelGroup.find('select[name="tutype"]').find('option:selected').text()).end()
              .find('td.tm_income').text($dvSelGroup.find('select[name="tm_income"]').val() == '' ? '' : $dvSelGroup.find('select[name="tm_income"]').find('option:selected').text()).end()
              .find('td.object').text($dvSelGroup.find('select[name="objid"]').find('option:selected').text()).end()
              .find('td.tmname').text($dvSelGroup.find('select[name="tmid"]').val() == '' ? '' : $dvSelGroup.find('select[name="tmid"]').find('option:selected').text()).end()
              .find('td.sacode').text($dvSelGroup.find('select[name="selaccept"]').val() == '' ? '' : $dvSelGroup.find('select[name="selaccept"]').find('option:selected').val())
              .attr('title', $dvSelGroup.find('select[name="selaccept"]').find('option:selected').text()).end()
              .find('td.prescan').text($dvSelGroup.find('select[name="prescan"]').val() == '' ? '' : $dvSelGroup.find('select[name="prescan"]').find('option:selected').val())
              .attr('title', $dvSelGroup.find('select[name="prescan"]').find('option:selected').text()).end()
              .attr('tmid', param.tmid)
              .attr('objid', param.objid)
              .attr('tm_income', param.tm_income)
              .attr('tutid', param.tutype);

            $("#dvSelGroup").dialog("close");
          }
        })
      }
      else if (dvOptions.title == 'Добавление группы отбора') {
        var P = {
          sgCode: param.code,
          sgName: param.name,
          sgCap: param.capacity,
          sgWght: param.weight,
          sgObjId: param.objid,
          sgTmId: param.tmid,
          sgSelAccept: param.selaccept,
          sgPreScan: param.prescan,
          sgAcceptTerm: param.acceptterm,
          sgSaleTerm: param.saleterm,
          tutype: param.tutype,
          tm_income: param.tm_income,
          selectmaxpos: param.selectmaxpos
        };
        $.getJSON('addSelGroup', P, function (json) {
          if (showErr(json)) {
            return false;
          }
          var html = $('#tblSelgroup').find('tbody').html();
          var data = [{
            "CODE": param.code,
            "CAPACITY": param.capacity,
            "ACCEPTTERM": param.acceptterm,
            "SALETERM": param.saleterm,
            FULLNAME: $('#dvSelGroup').find('select[name="objid"]').find('option:selected').text(),
            ID: json.data.ID,
            NAME: param.name,
            OBJID: param.objid,
            TMID: param.tmid,
            TUTID: param.tutype,
            TMINCID: param.tm_income,
            TMNAME: $('#dvSelGroup').find('select[name="tmid"]').val() == '' ? '' : $('#dvSelGroup').find('select[name="tmid"]').find('option:selected').text(),
            WEIGHT: param.weight,
            SACODE: param.selaccept,
            SELECTMAXPOS: param.selectmaxpos,
            SANAME: $('#dvSelGroup').find('select[name="selaccept"]').val() == '' ? '' : $('#dvSelGroup').find('select[name="selaccept"]').find('option:selected').text(),
            PSNAME: $('#dvSelGroup').find('select[name="prescan"]').val() == '' ? '' : $('#dvSelGroup').find('select[name="prescan"]').find('option:selected').text(),
            TUTNAME: $('#dvSelGroup').find('select[name="tutype"]').val() == '' ? '' : $('#dvSelGroup').find('select[name="tutype"]').find('option:selected').text(),
            TMINCNAME: $('#dvSelGroup').find('select[name="tm_income"]').val() == '' ? '' : $('#dvSelGroup').find('select[name="tm_income"]').find('option:selected').text()
          }];
          html += trHtml(data[0]);
          $('#dvTbl').find('tbody').html(html);
          $('#tblSelgroup').kTblScroll().tablesorter().rowFocus({rfSetDefFocus: false})
            .find("tbody>tr").trSelGroupEvents().end();
          $("#dvSelGroup").dialog("close");
        })
      }
      else {
        $.getJSON('delSelGroup', {sgId: param.sgid}, function (json) {
          if (showErr(json))
            return false;
          $tr.remove();
          $('#tblSelgroup').kTblScroll().tablesorter().rowFocus({rfSetDefFocus: false});
          $("#dvSelGroup").dialog("close");
        });
      }
      return false;
    })
  }

  $.sgWaresLocateTree = function (options) {
    var options = jQuery.extend({
      divId: "dvWaresLocate",
      title: "Выбор из справочника товаров"
    }, options);
    var WsgId = options.WsgId;
    var $dialog = $("#" + options.divId + '-tree');
    if ($dialog.length != 0) {
      $dialog.empty().remove();
      var $dialog = $("#" + options.divId + '-tree');
    }
    if ($dialog.length == 0) {
      var $dialog = $("<div/>").attr("id", options.divId + '-tree').addClass("flora treeView").css("text-align", "center").dialog({
        height: 500,
        width: 950,
        modal: true,
        resizable: false,
        draggable: true,
        title: options.title,
        overlay: {backgroundColor: '#000', opacity: 0.5}
      });
      $dialog.html('<div class="tree">' +
        '<ul class="ulWaresGroup treeview" style="float:left;position:relative;height:450px;width:200px;overflow:auto;text-align:left;background-color:white;"></ul>' +
        '</div><div class="SelGroup" style="height:35%;"></div>' +
        '</div><div class="wares" style="height:65%;"></div>')
        .find('ul.ulWaresGroup').treeWaresGroups({
        url: "waresGroup", click: function () {
          $dialog.find('div.SelGroup').empty();
          $dialog.find('div.wares').empty();
          var clickthis = $(this);
          var GroupName = $(this).text();
          var wgid = $(this).parents("li").kID();
          $.getJSON('waresByGroupLocateSG', {wgid: $(this).parents("li").kID()}, function (JSON) {
            var html = '<table><thead><tr><th colspan="4">' + GroupName + '</th></tr>' +
              '<tr><th>Код</th><th>Наименование</th><th>Кол-во</th><th></th></tr></thead><tbody>';
            for (var i = 0; i < JSON.data.length; i++) {
              var tr = JSON.data[i];
              html += '<tr wsgid="' + tr.WSELGRID + '">' +
                '<td>' + tr.WSELGRCODE + '</td>' +
                '<td class="text">' + tr.WSELGRNAME + '</td>' +
                '<td>' + tr.AMOUNT + '</td>' +
                '<td><input type="checkbox" waresid="' + tr.WSELGRID + '" /> </td>' +
                '</tr>';
            }
            html += '</tbody><tfoot><tr><th class="buttons" colspan="6">\
                                                <button type="button" title="Установить" class="sgset"><img src="' + eng_img + '/actions/apply.gif" border="0">Установить</button>\
											</th></tr></tfoot>';
            html += '</table>';


            function clickTr() {
              var wsgid = $(this).attr('wsgid');
              $dialog.find('div.wares').empty();
              $.getJSON('waresBySelGroupLocate', {wgid: wgid, wsgid: wsgid}, function (JSON) {
                var html = '<table><thead><tr><th>Код</th><th>Наименование</th></tr></thead><tbody>';
                for (var i = 0; i < JSON.data.length; i++) {
                  var tr = JSON.data[i];
                  html += '<tr waresid="' + tr.WID + '">' +
                    '<td>' + tr.WCODE + '</td>' +
                    '<td class="text">' + tr.WNAME + '</td>' +
                    '</tr>';
                }
                html += '</tbody></table>';
                $dialog.find('div.wares').html(html).css({
                  'float': 'left',
                  'width': '700px',
                  'height': '65%',
                  'padding-left': 10
                })
                  .find('table').kTblScroll('100%').tablesorter();
              });
            }

            $dialog.find('div.SelGroup').html(html).css({
              'float': 'left',
              'width': '700px',
              'height': '35%',
              'padding-left': 10
            })
              .find('table').kTblScroll('100%').tablesorter().rowFocus({rfSetDefFocus: false, rfFocusCallBack: clickTr})
              .find('button')
              .filter('.sgset').click(function () {
              setSelGroup(wgid, WsgId);
            }).end().end();
          });

          function setSelGroup(wgid, setWsgId) {
            var inpCh = $('div.SelGroup').find('table').find('input:checked');
            if (inpCh.length) {
              var newWSGID = $('#tblSelgroup').rf$GetFocus().attr('sgid');
              var oldWSGs = [];
              inpCh.each(function () {
                oldWSGs.push($(this).parents('tr:first').attr('wsgid'));
              });
              $.getJSON('waresBySelGroupSet', {
                wgid: wgid,
                wsgids: oldWSGs.join(','),
                setwsgid: newWSGID
              }, function (json) {
                if (showErr(json)) {
                  return false;
                }
                clickthis.click();
              });
            }
          }
        }
      });
    }
    $dialog.dialog('open');
    return false;
  };

  function waresGroupSelAccept() {

    if ($('#dvSelAccept').length) {
      $('#dvSelAccept').dialog('open');
    }
    else {
      $('<div/>')
        .attr("id", 'dvSelAccept')
        .addClass("flora treeView")
        .css("text-align", "center")
        .dialog({
          height: 500, width: 950, modal: true,
          resizable: false, draggable: true, title: 'Подтверждение завершения отборки',
          overlay: {backgroundColor: '#000', opacity: 0.5}
        })
        .html('<div class="tree" style="float:left;position:relative;height:100%;width:25%;background: #ffffff;">\
                        <ul class="ulWaresGroup treeview" style="height:90%;width:100%;overflow:auto;text-align:left;"></ul>\
                        <table style="width:100%;" id="tblObj"><tbody><tr><th>Объект</th></tr><tr><td><select id="objid" style="width:100%;"></select></td></tr></tbody></table></div>\
                        <div id="dvWares" style="float:left;position:relative;height:100%;width:50%;"></div>\
                        <div id="dvSelAcceptCode" style="float:left;position:relative;height:100%;width:25%;"></div>')
    }


    //--
    function tblWares(json) {
      var html = '<table><thead><tr>' +
        '<th ksort="digit">Код</th>' +
        '<th ksort="text">Наименование</th>' +
        '<th ksort="text">ПЗО</th>' +
        '</tr></thead><tbody>';

      for (var i = 0; i < json.data.length; i++) {
        html += '<tr data-wid="{WID}">\
                            <td>{WCODE}</td>\
                            <td class="text wname">{WNAME}</td>\
                            <td class="" title="{SANAME}">{SACODE}</td>\
                         </tr>'.format(json.data[i]);
      }
      html += '</tbody><tfoot><tr><th colspan="3">&nbsp;</th></tr></tfoot></table>';

      $('#dvWares').html(html)
        .find('table')
        .kTblScroll()
        .kTblSorter()
        .find('tbody>tr')
        .draggable({
          cursor: 'crosshair',
          helper: function (event) {
            return $('<div/>').addClass('helper').css({'z-index': '1005'}).html($(this).find(">td.wname").text()).appendTo($(document.body));
          },
          helperPos: 'mouse'
        })
    }

    $('ul.ulWaresGroup').treeWaresGroups({
      url: "waresGroup",
      click: function () {
        $('#dvSelAccept').data('wg', $(this).parents('li').attr('id'));
        $.request({
          url: 'waresByGroupSelAccept',
          data: {wgid: $(this).parents("li").kID(), objid: $('#objid').val()},
          success: tblWares
        });
      },
      cb: function (el) {
        $(el).find('li')
          .draggable({
            cursor: 'crosshair',
            helper: function (e) {
              return $('<div/>').addClass('helper').css({'z-index': '1005'}).html($(this).find(">a").text()).appendTo($(document.body));
            },
            helperPos: 'mouse'
          })
      }
    });


    $.request({
      url: 'ajaxGetSelAccept',
      async: false,
      success: function (json) {
        var html = '<table><thead><tr>\
                                    <th ksort="text">Метод</th>\
                               </tr></thead><tbody>';

        for (var i = 0; i < json.data.length; i++) {
          html += '<tr data-code="{CODE}" style="height:50px;">\
                                <td class="text" style="font-size:25px;">{NAME}</td>\
                             </tr>'.format(json.data[i]);
        }
        html += '<tr data-code="" style="height:50px;">\
                                <td class="text" style="font-size:25px;">Отвязать</td>\
                             </tr>';
        html += '</tbody><tfoot><tr><th colspan="1">&nbsp;</th></tr></tfoot></table>';

        $('#dvSelAcceptCode').html(html)
          .find('table')
          .kTblScroll()
          .kTblSorter()
          .find('tbody>tr')
          .droppable({
            tolerance: 'mouse',
            accept: function (elem) {
              return ($(elem).is("tr") || $(elem).is('li'));
            },
            drop: function (event, ui) {
              // ui.draggable - Перетаскиваемый элемент
              // ui.element - Элемент, на который перетащили
              //console.log(ui.draggable);
              var $elem = $(ui.draggable);
              var sacode = $(ui.element).attr('data-code');
              if ($elem.is('tr')) {
                $.request({
                  url: 'setWaresSelAccept',
                  data: {wid: $elem.attr('data-wid'), sacode: sacode, objid: $('#objid').val()},
                  success: function (json) {
                    //var $a = $('#'+$('#dvSelAccept').data('wg')).find('a:first');
                    //$a.trigger('click');
                    $elem.find('td:last').text(sacode).attr('title', $(ui.element).attr('data-text'));
                  }
                });
              }
              if ($elem.is('li')) {
                $.request({
                  url: 'setGroupSelAccept',
                  data: {wgid: $elem.attr('id').split('_')[1], sacode: sacode, objid: $('#objid').val()},
                  success: function (json) {
                    var $a = $('#' + $elem.attr('id')).find('a:first');
                    $a.trigger('click');
                  }
                });
              }
            }
          });

      }
    });
    $.request({
      url: 'listZoneObjects',
      success: function (json) {
        var html = '';
        for (var i = 0; i < json.data.length; i++)
          html += '<option value={OBJID}>{OBJNAME}</option>'.format(json.data[i]);
        $("#objid").html(html)
          .change(function () {
            $('#dvWares').empty();
          });
      }
    })
  }

  function sgTara(){
    var $sg = $(this);
    var $dv = $('#dvTara');
    if ($dv.length == 0){
      $dv = $('<div/>').attr("id", "dvTara").addClass("flora").css("text-align", "center")
        .dialog({
          closeOnEscape: false, title: '',
          autoOpen: true, resizable: false,
          draggable: false, modal: true,
          overlay: {opacity: 0.5, background: "black"},
          height: $(document.body).height()*0.6, width: $(document.body).width()*0.6
        });
    }
    else {
      $dv.dialog('open');
    }
    sgTaraReLoad($(this).attr('sgid'));
  }

  function sgTaraReLoad(sgid){
    $('#dvTara').empty().dialog('option', 'title', 'Загрузка').removeAttr('data-sgid');
    $.getJSON('taraList', {sgid: sgid}, sgDataFill);
  };

  function sgDataFill(json){
    if (!showErr(json)){
      var $sg = $('#tblSelgroup tbody>tr[sgid='+json.ext_data.SGID+']');
      $('#dvTara').dialog('option', 'title', $sg.find('>td.code').text()+': '+$sg.find('>td.name').text())
        .attr('data-sgid', json.ext_data.SGID);
      var html = '<table><thead><tr>' +
        '<th title="Номер по порядку">№пп</th>' +
        '<th>Код</th>' +
        '<th>Наименование</th></tr></thead><tbody>';
      for(var i=0; i<json.data.length; i++){
        var trI = json.data[i];
        html += '<tr data-wid='+trI.WID+'>'+
          '<td class="number numorder">'+trI.NUMORDER+'</td>'+
          '<td class="number">'+trI.WCODE+'</td>'+
          '<td class="text">'+trI.WNAME+'</td>'+
          '</tr>';
      }
      html += '</tbody><tfoot><th colspan="3" class="buttons">' +
        '<button type="button" title="Добавить" class="taraadd"><img src="' + eng_img + '/actions/add.png" border="0"></button>'+
        '</th></tfoot>';

      $('#dvTara').html(html).find('table').kTblSorter().kTblScroll().rowFocus()
        .find('button.taraadd').click(sgTaraAdd).end()
        .find('tbody>tr').contextMenu({menu:mTaraId},menuTara).end();
      ;
    }
  }

  function menuTara(action, el){
      switch (action){
        case 'add':
          sgTaraAdd(el);
          break;
        case 'chg':
          sgTaraChg.call(el);
          break;
        case 'del':
          sgTaraDel.call(el);
          break;
        default:
          alert('Для выбранной опции меню нет обработчика');
      };
  };

  function sgTaraAdd(){
    $.kWaresLocate({title:'Поиск тары', success: function(wid){
      var sgid = $('#dvTara').attr('data-sgid');
      $.getJSON('taraAdd',{sgid:$('#dvTara').attr('data-sgid'), waresid: wid}, sgDataFill)
    }
    });
  }

  function sgTaraChg(){
    var numorder = prompt('Введите порядковый номер: ', $(this).find('td.numorder').text());
    if (numorder){
      if (/^[1-9]\d*$/.test(numorder)){
        var P = {sgid:$('#dvTara').attr('data-sgid'), waresid: $(this).attr('data-wid'),numorder:numorder};
        $.getJSON('taraUpd', P, sgDataFill)
      }
      else {
        alert('Номер должен быть целым положительным числом!')
      }
    }
  }

  function sgTaraDel(){
    if (confirm('Вы действительно хотите удалить выбранную тару?')){
      $.getJSON('taraDel',{sgid:$('#dvTara').attr('data-sgid'), waresid: $(this).attr('data-wid')}, sgDataFill)
    }
  }
})(jQuery);