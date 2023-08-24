/**
 * Created by kashko.iu on 03.11.2016.
 */

(function ($) {
  var $object;


  $.fn.objIds = function () {
    var $tr = ($(this).is('tr') ? $(this) : $(this).parents('tr:first'));
    return tbl.trKeyId($tr.attr('id'));
  };

  $.fn.cngClients = function (options) {
    $object = $(this);
    var trId = $object.objIds();
    var data = tbl.trDataById(trId);
    var Obj = tbl.extdata.WHID;

    var options = $.extend({success: function(json){
                               $.trWaresUpd(json); //функция замены строчки
                           }
                          },options);

    function dv() {
      var $dvChg = $("#dvCLNT");

      $("#dvCLNT").attr('data-clid', tbl.trKeyId(trId)).attr('obj', Obj);

      $dvChg
        .find('select[name = "clienttypeid"]').val(data.TYPEID ? data.TYPEID : '').end()
        .find('select[name = "brandid"]').val(data.BRANDID ? data.BRANDID : '').end()
        .find('select[name = "region"]').val(data.REGID ? data.REGID : '').end()
        .find('textarea[name = "raddress"]').val(data.RADDRESS ? data.RADDRESS : '').end()
        .find('textarea[name = "address"]').val(data.ADDRESS ? data.ADDRESS : '').end()
        .find('textarea[name = "email"]').val(data.EMAIL ? data.EMAIL : '').end()
        .find('input[name = "trnpriority"]').val(data.TRNPRIORITY ? data.TRNPRIORITY : '').end()
        .find('input[name="palselvolume"]').val(data.PALSELVOLUME || '').end()
        .find('input[name="palselweight"]').val(data.PALSELWEIGHT || '').end()
        .find('input[name="objname"]').val(data.OBJNAME || '').end()
        .find('select[name="selectSeparator"]').val(data.TASKPICKSEPARATE || '').end()
      .end();

      if (data.ROUTELIST == '1') {
       $dvChg.find('input:checkbox').attr("checked","checked").end();
      }
      else {
       $dvChg.find('input:checkbox').removeAttr("checked").end();
      }

      if (data.ENTITYID) {
       $dvChg.find('input[name = "entityid"]').val(data.ENTITYNAME).attr('data-val', data.ENTITYID).end();
      }
      else {
       $dvChg.find('input[name = "entityid"]').trigger('rightClick').end();
      }

      if (data.PALLETWARESID) {
       $dvChg.find('input[name = "waresid"]').val(data.PALLETWARES).attr('data-val', data.PALLETWARESID).end();
      }
      else {
       $dvChg.find('input[name = "waresid"]').trigger('rightClick').end();
      }

      $("#dvCLNT").dialog('option', 'title', data.TONAME )
        .dialog("open").find('select:first').focus().end();

      $('#dvCLNT').attr('data-status', 'ready');
    }

    if ($("#dvCLNT").length)
      dv();
    else {
      $("<form/>").attr("id", "dvCLNT").attr('data-status', 'loading').addClass("flora")
        .dialog({
          autoopen: true, modal: true,
          height: 600, width: 380,
          resizable: false, draggable: false,
          overlay: {backgroundColor: '#000', opacity: 0.5}
        })
        .html('<div id="dvClientChgTabs"><ul>'+
          '<li><a href="#dvClientChgCommon"><span>Общие</span></a></li>'+
          //'<li><a href="#dvClientChgSelect"><span>Отборка</span></a></li>'+
        '</ul>'+
        '<div id=dvClientChgCommon></div>'+
        '<div id=dvClientChgSelect></div></div>' +
        '<div id="dvClientChgBottom"></div>');

      $('#dvClientChgBottom').addClass('buttons')
        .html('<br><button type="submit" id="dvCLNTSaveBtn"><img src="' + eng_img + '/actions/accept.png" border="0">Сохранить</button> ' +
          '<button type="button" id="dvCLNTCloseBtn"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>');
      $('#dvCLNTCloseBtn').click(function () {
        $("#dvCLNT").dialog('close');
      });

      $('#dvClientChgTabs').height($('#dvCLNT').height() - $('#dvClientChgBottom').height());

      $("#dvClientChgTabs").tabs({
        onShow: function (a) {
          var $div = $($(a).attr('href'));
          var h = $("#dvClientChgTabs").height() - $div.offset().top + $("#dvClientChgTabs").offset().top;
          $div.css({height: h, "min-height": h, "max-height": h});},
        initial: 1, remoteCount: 0, fxAutoHeight: false
      }).triggerTab();

      $('#dvCLNT').submit(function (){
        var formstatus = $(this).attr('data-status');
        if (formstatus != 'ready'){
          if (formstatus == 'loading')
            alert('Идет загрузка, подождите!');
          else if (formstatus == 'checking')
            alert('Идет проверка, подождите!');
          else if (formstatus == 'saving')
            alert('Идет сохранени, подождите!');
          else
            alert('Что-то выполняется, подождите!');
          return false;
        }

        function frmDataError(txt){
          alert (txt);
          $('#dvCLNT').attr('data-status', 'ready');
          return false;
        };

        $('#dvCLNT').attr('data-status', 'checking');

        var params = $('#dvCLNT').find('*[name]').kFormSubmitParam();
        params.objid = $("#dvCLNT").attr('data-clid');
        if (!params.clienttypeid || params.clienttypeid == "") {
          return frmDataError("Выберите тип клиента");
        }
        /*if (!params.region || params.region == "") {
          return frmDataError("Выберите регион клиента");
        }*/

        /*if ($('#dvCLNT').find('input:checkbox').is(':checked'))
          params.routel = "1";
        else {
          params.routel = "0";
          if (!params.entityid){
            return frmDataError('Не выбрано юр.лицо для магазинов!');
          }
        }*/

        params.email = params.email ? params.email.replace(/[\r\n]/g,' ') : '';
        if (params.email != "" && params.email.indexOf('@') == -1) {
          return frmDataError('Введите корректный электронный адрес');
        }
        if (params.address){
          params.address = $.trim(params.address).replace(/[\r\n]/g,' ').replace(/\s{2,}/g, ' ');
        }
        if (params.raddress){
          params.raddress = $.trim(params.raddress).replace(/[\r\n]/g,' ').replace(/\s{2,}/g, ' ');
        }

        $('#dvCLNT').attr('data-status', 'saving');
        $.post('setClient', params, function(json){
          $('#dvCLNT').attr('data-status', 'ready');
          if (!showErr(json)){
            options.success(json);
            $("#dvCLNT").dialog('close');
          }
        }, 'json');

        return false;
      });

      var html1 = '<table style="width: 100%; height: 100%;">';
      var html2 = '<table style="width: 100%; height: 100%;">';
      function getClTypes(){
        $.getJSON('getClientTypes', function (json) {
          if (showErr(json)) return;
          html1 += '<tr><td><b>Тип клиента:</b></td><td>';
          html1 += '<select name="clienttypeid" style="width: 100%" >' +
            '<option value="">Не выбрано</option>';
          for (var i = 0; i < json.data.length; i++)
            html1 += '<option value="' + json.data[i].CLIENTTYPEID + '">' + json.data[i].CLIENTTYPE + '</option>';
          html1 += '</select></td></tr>';

          finish();
        });
      }
      getClTypes();

      function getBrands(){
        $.getJSON('getBrand', {whid: Obj}, function (json) {
          if (showErr(json)) return;
          html1 += '<tr><td><b>Бренд:</b></td><td>' +
            '<select name="brandid" style="width: 100%">' +
            '<option value="">Не выбрано</option>';
          for (var u = 0; u < json.data.length; u++)
            html1 += '<option value="' + json.data[u].BRANDID + '">' + json.data[u].NAME + '</option>';
          html1 += '</select></td></tr>';

          getRegions();
        });
      };

      function getRegions(){
        $.getJSON('qRegionList', function (json) {
          if (showErr(json)) return;
          html1 += '<tr><td><b>Регион:</b></td><td>' +
            '<select name="region" style="width: 100%">' +
            '<option value="">Не выбрано</option>';
          for (var z = 0; z < json.data.length; z++)
            html1 += '<option value="' + json.data[z].ID + '">' + json.data[z].CODE + '=' + json.data[z].NAME + '</option>';
          html1 += '</select></td></tr>';

          getTaskPickSeparate();
        });
      }

      function getTaskPickSeparate(){
        $.getJSON('getChoice',{chtype: 'ps'},function(json) {
          if (showErr(json)) return;
          html2 += '<tr><td><b>Разделитель заданий:</b></td><td>';
          html2 += '<select name="selectSeparator" style="width: 100%" >' +
            '<option value="">Не выбрано (=ГО)</option>';
          for (var i = 0; i < json.data.length; i++)
            html2 += '<option value="' + json.data[i].CODE + '">' + json.data[i].CODE + '=' + json.data[i].NAME + '</option>';
          html2 += '</select></td></tr>';

          finish();
        });
      }

      var nullVal = 'None';

      function finish(){
        html1 += '<tr>'+
          '<td title="Название клиента для отображения на этикетке"><b>Название:</b></td>' +
          '<td><input type="text" name="objname" style="width: -webkit-fill-available;"></td></tr>'+
          '<tr><td><b>Адрес магазина:</b></td>' +
          '<td><textarea name="raddress" class="raddress" id="raddress" rows="2" placeholder="Адрес места нахождения" style="width: -webkit-fill-available; resize: none"></textarea></td></tr>' +
          '<tr><td><b>Эл.почта:</b></td>' +
          '<td><textarea name="email" class="email" id="notonemail" rows="2"  style="width: -webkit-fill-available; resize: none"></textarea></td></tr>';

        /*html1 += '<tr><td><b>Юр.лицо: </b></td>' +
          '<td><input name="entityid" style="width: -webkit-fill-available;" placeholder="Выбрать юрлицо" readonly></td></tr>' +
          '<tr><td><b>Адрес юр.лица:</b></td>' +
          '<td><textarea name="address" class="address" id="address" rows="2" placeholder="Полное наименование, адрес места нахождения, номер телефона" style="width: -webkit-fill-available; resize: none"></textarea></td></tr>';*/

        /*html1 += '<tr><td><b>Товар-паллет: </b></td>' +
          '<td><input name="waresid" style="width: -webkit-fill-available;" placeholder="Выбрать паллет" readonly></td></tr>';

        html1 += '<tr><td colspan="2"><b>Выносить в отдельный МЛ?</b> <input type="checkbox" value="1"></td></tr>' +
          '<tr><td colspan="2"><b>Транзитный приоритет</b>  <input type="text" name="trnpriority" size="10" style="width: 1cm"/></td></tr>';

        html1 += '</table>'

        html2 += '<tr><td colspan="2"><b>Объем паллета отборки (л)</b><input type="text" name="palselvolume" size="10"/></td></tr>';
        html2 += '<tr><td colspan="2"><b>Вес паллета отборки (кг)</b><input type="text" name="palselweight" size="10"/></td></tr>';
        html2 += '</table>';*/

        $("#dvClientChgCommon").html(html1)
            .find('table:first').css('border', '0px solid')
            .find('tbody, tr, td').css('border', '0px solid').end()
            .find('tr:hover td, tr td:hover').css('background-color', 'rgba(0, 0, 0, 0)').end()
            .find('input[name="trnpriority"]').kInputInt({textalign: 'left', minus: true}).end()
            .find('input[name="waresid"]').click(function () {
            var $inp = $(this);
            $.kWaresLocate({
              divId: "dvWaresLocateFnIncome",
              success: function (wid, wcode, wname) {
                $inp.attr('data-val', wid).val(wname);
              }
            });
          }).end()
            .find('input[name="entityid"]').click(function () {
            var $inp = $(this);
            $.entityList({
              divId: "dvEntity",
              success: function (clid, code, name) {
                $.getJSON("qAddressCl", {objid: clid}, function (JSON) {
                  if (!showErr(JSON)) {
                    $("#dvCLNT").find('>table')
                      .find('textarea[name = address]').val(JSON.data["0"].ADDRESS).end()
                      .end();
                    $inp.attr('data-val', clid).val(name);
                  }
                });
                return false;

              }
            });

          }).end()

            .find('input[name="waresid"], input[name="entityid"]').rightClick(function () { //должно быть последним
            $(this).attr('data-val', nullVal).val('');
          }).end()
            .end();

        $("#dvClientChgSelect").html(html2)
            .find('table:first').css('border', '0px solid')
            .find('tbody, tr, td').css('border', '0px solid').end()
            .find('tr:hover td, tr td:hover').css('background-color', 'rgba(0, 0, 0, 0)').end()
            .find('input[name="palselvolume"]').kInputInt({textalign: 'left', minus: false}).end()
            .find('input[name="palselweight"]').kInputInt({textalign: 'left', minus: false}).end();

        dv();
      }
    }
  };


  $.fn.cngClientEmail = function () {

    $object = $(this);

    var trId = $object.objIds();
    var data = tbl.trDataById(trId);
    // var Obj = tbl.extdata.WHID;

    function dvemail() {
      $("#dvCLNTemail").attr('data-clid', data.TOID).find('>form')
          .find('>textarea[name = email]').val(data.EMAIL).end()
        .end()
        .dialog('option', 'title', data.TONAME )
        .dialog("open").find('>form>textarea:first').focus().end();
    }

    if ($("#dvCLNTemail").length)
      dvemail();
    else {
      var html = '<form style="text-align:center;">';
      html += 'Эл.почта: <br><textarea name="email" class="email" id="onlemail" rows="3"  style="width: 90%; resize: none"></textarea></form>';

      html += '<br><br><hr><form><div class="buttons"><button type="submit" id="dvCLNTemailSaveBtn"><img src="' + eng_img + '/actions/accept.png" border="0">Сохранить</button> ' +
        '<button type="button" id="dvCLNTemailCloseBtn"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
        '</div></form>';

      $("<div/>").attr("id", "dvCLNTemail").addClass("flora")
        .dialog({
          autoopen: false,
          height: 200,
          width: 380,
          modal: true,
          resizable: false,
          draggable: false,
          overlay: {backgroundColor: '#000', opacity: 0.5}
        })
        .html(html)
          .find('>form').unbind('submit').bind("submit",function (){
            $('#dvCLNTemailSaveBtn').attr('disabled', 'disabled');
            var email = $('#onlemail').val();
            email = email.replace(/[\r\n]/g,' ');
            if (email != "" && email.indexOf('@') == -1) {
              alert('Введите корректный электронный адрес');
              $('#dvCLNTemailSaveBtn').removeAttr('disabled');
              return false;
            }

            $.post('setEmailClient', {objid: $("#dvCLNTemail").attr('data-clid'), email: email}, function(json){
              $.trWaresUpd(json); //функция замены строчки
            }, 'json');

            $('#dvCLNTemailSaveBtn').removeAttr('disabled');
            $("#dvCLNTemail").dialog('close');
            return false;
          })
          .find('#dvCLNTemailCloseBtn').click(function () {
            $("#dvCLNTemail").dialog('close');
          }).end()
          .end();


      dvemail();
    }
  };


  $.fn.cngClientPalletWares = function () {
    // var Obj = tbl.extdata.WHID;

    $.kWaresLocate({
      divId:"dvWaresLocateFnIncome",
      success:function(waresid) {
        var $tr = $('#'+tbl._tblId).rf$GetFocus().attr('id');
        $.post("setWaresClient",{clientid:tbl.trKeyId($tr),waresid:waresid},function(JSON) {
          if (!showErr(JSON)) $.trWaresUpd(JSON);
        }, 'json');
      }
    });
  };


  $.fn.cngClientAddress = function () {
    $object = $(this);
    var trId = $object.objIds();
    var data = tbl.trDataById(trId);
    // var Obj = tbl.extdata.WHID;

    function dvAddress() {
      $("#dvCLNTAddress").attr('data-clid', data.TOID).find('>form')
          .find('>textarea[name = address]').attr('data-entity', data.ENTITYID).val(data.ADDRESS).end()
          .find('>textarea[name = raddress]').val(data.RADDRESS).end()
          .find('>label[name = client]').text(data.TONAME).end()
          .find('>label[name = entity]').text(data.ENTITYNAME).end()
        .end()
        .dialog("open").find('>form>textarea:first').focus().end();
    }

    if ($("#dvCLNTAddress").length)
      dvAddress();
    else {
      var html = '<form style="text-align:center;">';
      html += 'Адрес магазина <label name="client"></label>: <br><textarea name="raddress" class="raddress" id="onlRAddress" rows="3"  ' +
              'placeholder="Адрес места нахождения" style="width: 90%; resize: none" required></textarea><br><br>';
      html += 'Контактные данные юр.лица <label name="entity"></label>: <br><textarea name="address" class="address" id="onlAddress" rows="3"   ' +
              'placeholder="Полное наименование, адрес места нахождения, номер телефона" style="width: 90%; resize: none" required></textarea>';

      html += '<br><br><hr><div class="buttons"><button type="submit" id="dvCLNTAddressSaveBtn"><img src="' + eng_img + '/actions/accept.png" border="0">Сохранить</button> ' +
        '<button type="button" id="dvCLNTAddressCloseBtn"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
        '</div></form>';


      $("<div/>").attr("id", "dvCLNTAddress").addClass("flora")
        .dialog({
          autoopen: false,
          height: 300,
          width: 400,
          modal: true,
          resizable: false,
          draggable: false,
          title: 'Настройка адресов',
          overlay: {backgroundColor: '#000', opacity: 0.5}
        })
        .html(html)
          .find('>form').unbind('submit').bind("submit",function (){
             $('#dvCLNTAddressSaveBtn').attr('disabled', 'disabled');

            var address = $.trim($('#onlAddress').val()).replace(/[\r\n]/g,' ').replace(/\s{2,}/g, ' ');//юридический адрес
            var entityId = $('#onlAddress').attr('data-entity');//ID юрлица

            var raddress = $.trim($('#onlRAddress').val()).replace(/[\r\n]/g,' ').replace(/\s{2,}/g, ' ');//фактический адреc

            $.post('setAddressClient', {objid: $("#dvCLNTAddress").attr('data-clid'), address: address, raddress: raddress, entityId:entityId},
              function(json){
              $.trWaresUpd(json); //функция замены строчки
            }, 'json');

            $('#dvCLNTAddressSaveBtn').removeAttr('disabled');
            $("#dvCLNTAddress").dialog('close');
            return false;
          })
          .find('#dvCLNTAddressCloseBtn').click(function () {
            $("#dvCLNTAddress").dialog('close');
          }).end()
          .end();


      dvAddress();
    }
  };


  $.fn.cngClientPriority = function () {
    $object = $(this);

    var trId = $object.objIds();
    var data = tbl.trDataById(trId);
    // var Obj = tbl.extdata.WHID;


    function dvPriority() {
      $("#dvCLNTPriority").attr('data-clid', data.TOID).find('form')
          .find('input:first').val(data.TRNPRIORITY).end()
        .end()
        .dialog("open").find('form input:first').focus().end();
    }

    if ($("#dvCLNTPriority").length)
      dvPriority();
    else {
      var html = '<form style="text-align:center;">';
      html += '<div class="buttons"><label name="client">Приоритет</label>: <input type="text" required size="10"/>&nbsp;<button type="button" id="dvCLNTPriorityClearBtn" title="Очистить приоритет"><img src="' + eng_img + '/actions/delete.png" border="0"></button></div><br>';
      html += '<br><br><hr><div class="buttons"><button type="submit" id="dvCLNTPrioritySaveBtn"><img src="' + eng_img + '/actions/accept.png" border="0">Сохранить</button> ' +
        '<button type="button" id="dvCLNTPriorityCloseBtn"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
        '</div></form>';

      $("<div/>").attr("id", "dvCLNTPriority").addClass("flora")
        .dialog({
          autoopen: false,
          height: 150,
          width: 250,
          modal: true,
          resizable: false,
          draggable: false,
          title: 'Настройка приоритета клиента',
          overlay: {backgroundColor: '#000', opacity: 0.5}
        })
        .html(html)
          .find('form').unbind('submit').bind("submit",function (){
             $('#dvCLNTPrioritySaveBtn').attr('disabled', 'disabled');
             var priority = $(this).find('input').val();

            $.post('setPriorityClient', {objid: $("#dvCLNTPriority").attr('data-clid'), priority: priority}, function(json){
              $.trWaresUpd(json); //функция замены строчки
            }, 'json');

            $('#dvCLNTPrioritySaveBtn').removeAttr('disabled');
            $("#dvCLNTPriority").dialog('close');
            return false;
          })
          .find('input').kInputInt({textalign: 'left',minus: true}).end()
          .find('#dvCLNTPriorityCloseBtn').click(function () {
            $("#dvCLNTPriority").dialog('close');
          }).end()
          .find('#dvCLNTPriorityClearBtn').click(function () {
             $('#dvCLNTPrioritySaveBtn').attr('disabled', 'disabled');

            $.post('setPriorityClient', {objid: $("#dvCLNTPriority").attr('data-clid')}, function(json){
              $.trWaresUpd(json); //функция замены строчки
            }, 'json');

            $('#dvCLNTPrioritySaveBtn').removeAttr('disabled');
            $("#dvCLNTPriority").dialog('close');
            return false;
          }).end()
          .end();


      dvPriority();
    }
  };


  $.fn.hideClient = function () {
    $object = $(this);

    var trId = $object.objIds();
    var data = tbl.trDataById(trId);
    // var Obj = tbl.extdata.WHID;

    $.getJSON('statusUpdClient', {objid: data.TOID, status: '0'}, function(json){
      if (!showErr(json)){
        tbl.trDel(trId);
      }
    });
  };


  $.fn.returnClient = function () {
    $object = $(this);

    var trId = $object.objIds();
    var data = tbl.trDataById(trId);
    if (data.STATUS != '0'){
      alert('Нельзя восстановить активного клиента!');
      return false;
    }
    else{
      $.getJSON('statusUpdClient', {objid: data.TOID, status: '1'}, function(json){
        if (!showErr(json)){
          tbl.data(json);
        }
      });
    }


  };

  $.fn.smPBL = function(){
    $object = $(this);
    var trId = $object.objIds();

    $.getJSON('cfgQPblList', {clientid: trId}, function(json){
      if (!showErr(json)){
        var clientid = json.ext_data.CLID;
        var html = '<table data-clientid="' + clientid + '" id="tblBPLClientSm"><thead><tr>' +
          '<th ksort="false"></th><th ksort="text">РХ</th><th ksort="text">Наименование</th></tr>' +
          '</thead><tbody>';
        for (var i=0; i<json.data.length; i++){
          var tr = json.data[i];
          html += '<tr data-id="' + tr.SMID + '">' +
              '<td class="chk"><input type="checkbox"' + (tr.CHECKED=='1' ? ' checked' : '') + '></td>' +
              '<td>' + tr.SMCODE + '</td>' +
              '<td class="text">' + tr.SMNAME + '</td>' +
              '</tr>';
        }
        html += '</tbody></table>';
        if ($('#dvPBLClientSm').length) $('#dvPBLClientSm').dialog('destroy').remove();
        $("<div/>").attr("id", "dvPBLClientSm").addClass("flora")
          .dialog({autoopen: false,
            height: $(document.body).height()*0.9,
            width: $(document.body).width()*0.9,
            modal: true, resizable: false, draggable: false,
            overlay: {backgroundColor: '#000', opacity: 0.5},
            title: tbl.trDataById(clientid).TONAME
          })
          .html(html)
          .find('table:first').kTblScroll().kTblSorter().whTdChk({
            onTdChange: function(){
              console.log($(this).attr('checked'));
              var P = {
                clientid: $(this).parents('table:first').attr('data-clientid'),
                smid: $(this).parents('tr:first').attr('data-id'),
                flag: $(this).attr('checked') ? '1' : '0'
              };
              $.getJSON('cfgQPblSet', P, function(json){
                if (!showErr(json)){
                  var d0 = json.data[0];
                  var $chk = $('#tblBPLClientSm[data-clientid='+json.ext_data.CLID+']')
                    .find('tbody>tr[data-id=' + d0.SMID +']>td.chk>input:checkbox');
                  if ($chk.length){
                    if (d0.CHECKED == '1')
                      $chk.attr('checked', 'checked');
                    else
                      $chk.removeAttr('checked');
                  }
                }
              });
              return false;
            }
        });
      }
    });
  };



})(jQuery);