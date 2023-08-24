/**
 * Created by kashko.iu on 03.10.2018.
 */
// var tblCode = 'TBLUSERS';//код таблицы в IFACE_TBL
// var tbl;
var O = {
  idTbl: 'userTbl',
  idTrPrefix: 'trU'
};
var optRowFocus = {'rfSetDefFocus': false,
        'rfFocusCallBack':
            function() {
                if($(this).attr('status')=='0' ){
                  $('#menuUser > li.deactiveUser').hide();
                  $('#menuUser > li.activeUser').show();
                }
                if($(this).attr('status')=='1' ){
                  $('#menuUser > li.deactiveUser').show();
                  $('#menuUser > li.activeUser').hide();
                }
                // Пункты контекстного меню enabled/disabled
            }};
$(document).ready(function() {
  var height = kScreenH();
  $("#dvMain").css({height: height, width: "100%"});

  if (focused_id) {
    if (!$('#'+O.idTbl).length || $('#'+O.idTbl).length == 0){
      tablIns();
    }
    funcUpdate({'OLD_ID':focused_id, 'ID_USER':focused_id},false);
  }

  $('#addUser').unbind('click').click(addUser);

  $('form').unbind('submit').submit(function () {
		var $dv = $('#dvMain');
		var P = {};

		if ($("#fio").val() != '') {
			P.fio = $("#fio").val();
		}
		if ($("#email").val() != '') {
			P.email = $("#email").val();
		}
		if ($("#status").val() != 'None') {
			P.status = $("#status").val();
		}
		if ($("#ad").val() != 'None') {
			P.ad = $("#ad").val();
		}

		$.getJSON('qusersList',P,  function(json){
      if(!showErr(json)){
        if(json.data.length == 0 ){
          alert('Пользователь не найден');
          return false;
        }

        tablIns();

        var $tbl = $('#' + O.idTbl);
        var $tbody = $tbl.find('tbody:first');
        var $tfoot = $tbl.find('tfoot:first');
        var bodyhtml = trHtml(json);
        $tbody.html(bodyhtml);
        $tfoot.html(footTr(json));
        $tbl.kTblScroll().kTblSorter().rowFocus(optRowFocus).bindContextMenu();
      }
    });
		return false;
	});

});


(function ($) {
tablIns = function () {
  $("#dvMain").html('<table id="' + O.idTbl + '" style="border: 2px ridge #FFE4E1; border-spacing: 2px"><thead><tr>' +
  '<th ksort="false">Ст</th>' +
  '<th ksort="digit">ID</th>' +
  '<th ksort="text">Логин</th>' +
  '<th ksort="text">ФИО</th>' +
  '<th ksort="false">Роли</th>' +
  '<th ksort="false" title="AD-авторизация">AD</th>' +
  '<th ksort="text">E-MAIL</th>' +
  '<th ksort="text">Телефон</th>' +
  '<th ksort="text">Изменён</th>' +
  '<th ksort="text">Комментарий</th>' +
  '</tr></thead><tbody></tbody><tfoot></tfoot></table>');
};

funcUpdate = function (ext_data , is_edit) {
  $.getJSON('qUserInfo',{id_user: ext_data.ID_USER},function (json) {
    trUpdate(json, ext_data.OLD_ID, ext_data.ID_USER, is_edit);
  });
  return false;
};

trUpdate = function (json, old_id, new_id, is_edit) {
  var $tr;
  if (is_edit){
    $tr = $('#'+$.kID(O.idTrPrefix, old_id));
    $tr.replaceWith(tr(json.data));
    $tr = $('#'+$.kID(O.idTrPrefix, old_id));
  }
  else{
    $('#'+O.idTbl).append(tr(json.data));
    var $th =$('#'+O.idTbl).find('tfoot th[name="cntUser"]');
    $th.text(kInt($th.text())+1);
    $tr = $('#'+$.kID(O.idTrPrefix, new_id));
  }
  $('#'+O.idTbl)
    .bindContextMenu()
    .kTblScroll()
    .rowFocus(optRowFocus)
    ;
  $('#'+O.idTbl).rfSetFocus($tr);
  $tr.kScrollToTr();
};

trRemove = function (trId) {
  $('#'+$.kID(O.idTrPrefix, trId)).remove();
  $('#'+O.idTbl)
    .bindContextMenu()
    .rowFocus(optRowFocus)
    .kTblScroll();
  var $th = $('#'+O.idTbl).find('tfoot th[name="cntUser"]');
  $th.text(parseInt($th.text)+1);
};

trHtml =function (JSON) {
  var html ='';
  for (var i=0; i<JSON.data.length; i++){
    var d = JSON.data[i];
    html += tr(d);
  }
  return html;
};

tr =function (d) {
  var html = '<tr id="'+$.kID(O.idTrPrefix,d.ID_USER)+'" status="'+d.STATUS+'">' +
    '<td class="hac" title="'+usrStatusTitle(d.STATUS)+'"><img src="'+usrStatusImgPath(d.STATUS)+'" border="0"></td>'+
    '<td class="number har">'+d.ID_USER+'</td>'+
    '<td class="text login">'+d.LOGIN+'</td>'+
    '<td class="text fio">'+d.FIO+'</td>'+
    '<td class="cnt_roles hac" title="'+(kInt(d.LIST_ROLES)==0 ? 'Назначьте роль пользователю">' : 'Роли пользователя: '+d.LIST_ROLES+'">')+d.CNT_ROLES+'</td>'+
    '<td class="chk author_ad hac"><input type="checkbox"' + (d.AUTHOR_AD == 1 ? ' checked' : '') + ' disabled ></td>' +
    '<td class="text email">'+d.EMAIL+'</td>'+
    '<td class="text phonenumber">'+d.PHONENUMBER+'</td>'+
    '<td class="lastdate">' + kDateTime(d.LASTDATE) + '</td>'+
    '<td class="text comments">'+d.COMMENTS+'</td></tr>';
  return html;
};

function usrStatusImgPath(status){
  switch (status){
    case "0":
        return eng_img+'/actions/stop.png';
    case "1":
        return eng_img+'/actions/accept.png';
  }
};

function usrStatusTitle(status){
  switch (status){
    case "0":
        return 'Заблокированный';
    case "1":
        return 'Активный';
  }
};

//на вновь добавленный tr не вешается автоматом
$.fn.bindContextMenu = function() {
  this.find(">tbody>tr").contextMenu({menu:'menuUser'},
    function(action, el, pos){
        if(action=='editUser') {
            el.editUser(true);
        }
        else if(action=='rightsUser') {
            el.rightsUser();
        }
        else if(action=='editUserRoles') {
            el.editUserRoles();
        }
        else if(action=='changePasswd') {
            el.changePasswd();
        }
        else if(action=='deleteUser') {
            el.deleteUser();
        }
        else if(action=='deactiveUser') {
            el.deactiveUser();
        }
        else if(action=='activeUser') {
            el.activeUser();
        }
      }
  );
  return this;
};

footTr = function  (json) {
  return '<tr><th name="cntUser">'+json.data.length+'</th><th class="buttons" colspan="9">' +
         '</th></tr>';
};

$(
  function()
  {
    //Dialogs
    $("#dlgedit").dialog(
    {
      'autoOpen': false,
//      title: 'Редактирование пользователя',
      modal: true,
      width: 400,
      height: 350,
      resizable: true,
      draggable: true,
      position: "center",
      overlay:{opacity:0.5, background:"black"}
    });

    $("#dlgrights").dialog(
    {
      'autoOpen': false,
//      title: '',
      modal: true,
      width: 570,
      height: 500,
      resizable: true,
      draggable: true,
      position: "center",
      overlay:{opacity:0.5, background:"black"}
    });

    $("#dlgurrights").dialog(
    {
      'autoOpen': false,
//      title: '',
      modal: true,
      width: 752,
      height: 420,
      resizable: true,
      draggable: true,
      position: "center",
      overlay:{opacity:0.5, background:"black"}
    });

    $("#dlgchangepasswd").dialog(
    {
      'autoOpen': false,
//      title: '',
      modal: true,
      width: 460,
      height: 400,
      resizable: true,
      draggable: true,
      position: "center",
      overlay:{opacity:0.5, background:"black"}
    });
  }
);


var validator = {}; // объект плугина "validator"

addUser = function (){
  $(this).editUser(false);
};

editDialog = function (id_user,is_edit){
 // инициализация диалога

 if (is_edit) {
   //Доступ к СКУД?
   var $tr = $('#'+$.kID(O.idTrPrefix,id_user));
   var fio= $tr.find('.fio').text(), login = $tr.find('.login').text(), author_ad = $tr.find('.author_ad').text(),
       email = $tr.find('.email').text(), phonenumber = $tr.find('.phonenumber').text();
   $.ajax({async: false,
              url: "ajaxGetGuid1C",
              data: {id_user: id_user},
              dataType: "json",
              success: function (json, textStatus)
              {
                  if (json.data.SKUD_INTEGRATION == 1){
                      $("#tr_guid_1c").show();
                      $("#dlgedit_guid_1c_edt").val(json.data.GUID_1C);
                  }
                  else {
                      $("#tr_guid_1c").hide();
                  }
              }
   });
   $('#dlgedit').dialog('option', 'title', 'Редактирование пользователя');
   var auth_v = author_ad;
   var auth_dis = auth_v == '1' ? true : false;

   $("#tr_id_edt").show();
   $("#dlgedit_old_id_edt").val(id_user);
   $("#dlgedit_id_edt").val(id_user);
   $("#dlgedit_login_edt").val(login).attr('disabled',auth_dis);
   $("#dlgedit_fio_edt").val(fio);
   $("#dlgedit_old_fio_edt").val(fio);


   $("#dlgedit_passw_edt").attr('checked', auth_dis).val(auth_v);
   $("#dlgedit_email_edt").val(email);
   var phoneformask = phonenumber;

   $("#dlgedit_phonenumber_edt_mask").hide().attr('disabled',true);
   $("#dlgedit_phonenumber_edt").show().attr('disabled',false).val(phoneformask);
 }
 else {
   $('#dlgedit').dialog('option', 'title', 'Добавление пользователя');
   $("#dlgedit_form").get(0).reset();

   $("#tr_id_edt").hide();
   $('#dlgedit_phonenumber_edt_mask').hide().attr('disabled',true);
   $('#dlgedit_phonenumber_edt').show().attr('disabled',false);
   $('#dlgedit_login_edt').attr('disabled', true);
   $('#dlgedit_email_edt').attr('disabled', true);
   $('#dlgedit_passw_edt').attr('disabled', true)
     .removeAttr('checked').val('0');

 }
 $("#dlgedit").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgedit_save_btn").click();}});

 // определение кнопок
 $("#dlgedit_fio_btn").unbind('click').click(function() {
   $('#dlgedit_fio_btn').attr('disabled', true);
   var params = {};
   var fio = $('#dlgedit_fio_edt').val();
   if ( fio != '') {
     var ufio = fio.replace(/\s+/g, " ").split(' ');
     params.lastname = ufio[0];
     params.name = ufio[1];
     $.getJSON('userFioInfo', params, function (json) {
       if (!showErr(json)) {
         $('#dlgedit_login_edt').attr('disabled', true).val(json.data.LOGIN);
         $('#dlgedit_email_edt').attr('disabled', true).val(json.data.EMAIL);
         $('#dlgedit_phonenumber_edt_mask').hide().attr('disabled',true);
         $('#dlgedit_passw_edt').attr('checked', true).val('1');
         $('#dlgedit_phonenumber_edt').show().val(json.data.TELEPHONE).attr('disabled',false);
       }
     });
   }
   else {
     alert('Введите Фамилию Имя пользователя');
   }
   $('#dlgedit_fio_btn').attr('disabled', false);
 });

 $("#dlgedit_man_btn").unbind('click').click(function(){
   $('#dlgedit_login_edt').attr('disabled', false).val('');
   $('#dlgedit_email_edt').attr('disabled', false).val('');
   $('#dlgedit_passw_edt').attr('checked', false).val('0');
   $('#dlgedit_phonenumber_edt_mask').show().val('').attr('disabled',false);
   $("#dlgedit_phonenumber_edt").hide().attr('disabled',true);
 });
 $("#dlgedit_cancel_btn").unbind('click').click(function(){$("#dlgedit").dialog("close");});
 $("#dlgedit_save_btn").unbind('click').click(function(){
    // валидируем
    if (!$("#dlgedit_form").valid()) {
      return;
    }

    var disLogin = $("#dlgedit_login_edt").attr('disabled');
    var disEmail = $("#dlgedit_email_edt").attr('disabled');
    $("#dlgedit_passw_edt, #dlgedit_login_edt, #dlgedit_email_edt").attr('disabled', false);
    var param = $('#dlgedit_form').serialize();
    if (is_edit){
      $.getJSON('ajaxEditUser?'+param, null, dlgeditCallback);
    }
    else {
      $.getJSON('ajaxNewUser?'+param, null, dlgeditCallback);
    }
    $("#dlgedit_passw_edt").attr('disabled', true);
    $("#dlgedit_login_edt").attr('disabled', disLogin);
    $("#dlgedit_email_edt").attr('disabled', disEmail);
    // обрабатываем ответ
    function dlgeditCallback(data){
      if (data.data.ERROR_MSG){
        alert(data.data.ERROR_MSG);
        return;
      }
      if(!showErr(data)){
        $("#dlgedit").dialog("close");
        if (!$('#'+O.idTbl).length || $('#'+O.idTbl).length == 0){
          tablIns();
        }
        funcUpdate(data.ext_data,is_edit);
      }
    }
 });

 // запуск диалога
 $("#dlgedit").show().dialog("open");
 $("#dlgedit_login_edt").focus().select();
};

function rightsDialog(id_user, superadmin_see_all)
{
   // инициализация диалога
   // рисуем таблицу прав
   var $tr = $('#'+O.idTbl).find('#'+$.kID(O.idTrPrefix,id_user));
   var fio= $tr.find('.fio').text();

   $("#dlgrights_caption").text(fio);
   $.ajax
   ({async: false,
          url: "ajaxRights",
          data: {id_user: id_user, superadmin_see_all: superadmin_see_all},
          dataType: "json",
          success: function (data, textStatus)
          {
            if (!showErr(data))
            {
              //insert
              $("#dlgrights_rights_tbl > tbody").empty();
              for (var i = 0; i < data.data.length; i++)
              {
                $("#dlgrights_rights_tbl > tbody").append($.format(
                   '<tr id="dlgrights_{0}" higher="{4}">'
                   +'<td id="dlgrights_show_name_{0}" class="hal">{1}{2}</td>'
                   +'<td class="hac">'
                   +'{1}<input id="dlgrights_right_cb_{0}" type="checkbox" {3}>'
                   +'</td>'
                   +'<td id="dlgrights_lastdate_{0}">{5}</td>'
                   +'</tr>'
                   ,
                   data.data[i].ID_SYSTEM,
                   data.data[i].SPACES,
                   data.data[i].SHOW_NAME,
                   (data.data[i].ID_RIGHT?"checked":""),
                   data.data[i].HIGHER_OUT,
                   data.data[i].LASTDATE?data.data[i].LASTDATE:''
                ));
              }
              $("#dlgrights_rights_tbl > tbody input:checkbox").unbind('click').click(function()
              {
                var cb=this;
                var tr=$(this).closest("tr");
                var id_system=tr.attr("id").substring(10);
                var higher=tr.attr("higher");
                if (this.checked)
                {
                  $.ajax
                  ({    async: false,
                        url: "ajaxAddRight",
                        data: {id_user: id_user, id_system: id_system},
                        dataType: "json",
                        success: function (data, textStatus)
                        {
                          if (!showErr(data))
                          //    alert('Ошибка при добавлении права пользователю "'+fio+'":\n'+data.mes);
                          //    //alert('ajaxListRoles data'+data);
                          // else if (data.data.ERROR_CODE)
                          //     alert('Ошибка при добавлении права пользователю "'+fio+'":\n'+data.data.ERROR_MSG);
                          // else
                          {
                            cur_higher=higher;
                            $("#dlgrights_lastdate_"+id_system).text(data.data.LASTDATE);
                            do
                            {
                              $("#dlgrights_rights_tbl > tbody > tr#dlgrights_"+cur_higher+" :checkbox").attr("checked", "checked");
                              $("#dlgrights_lastdate_"+cur_higher).text(data.data.LASTDATE);
                              cur_higher=$("#dlgrights_rights_tbl > tbody > tr#dlgrights_"+cur_higher).attr("higher");
                            } while (cur_higher);
                          }
                        }
                  });
                }
                else {
                  $.ajax
                  ({    async: false,
                        url: "ajaxDelRight",
                        data: {id_user: id_user, id_system: id_system},
                        dataType: "json",
                        success: function (data, textStatus)
                        {
                          if (!showErr(data))
                          //    alert('Ошибка при удалении права пользователю "'+fio+'":\n'+data.mes);
                          //    //alert('ajaxListRoles data'+data);
                          // else if (data.data.ERROR_CODE)
                          //     alert('Ошибка при удалении права пользователю "'+fio+'":\n'+data.data.ERROR_MSG);
                          // else
                          {
                            function rec_uncheck_self_and_childs(id_system)
                            {
                              //self
                              $("#dlgrights_rights_tbl > tbody > tr#dlgrights_"+id_system+" :checkbox").removeAttr("checked");
                              $("#dlgrights_lastdate_"+id_system).text('');
                              //childs
                              $("#dlgrights_rights_tbl > tbody > tr[higher="+id_system+"] :checkbox")
                                .each(
                                  function (ind){
                                    $(this).removeAttr("checked");
                                    var tr = $(this).closest("tr");
                                    var id_system=tr.attr("id").substring(10);
                                    $("#dlgrights_lastdate_"+id_system).text('');
                                    rec_uncheck_self_and_childs(id_system);
                                  }
                                )
                            }
                            rec_uncheck_self_and_childs(id_system);
                          }
                        }
                  });
                }
              });
            }
          }
    });

   $("#dlgrights").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgrights_save_btn").click();}});

   // определение кнопок
   $("#dlgrights_save_btn").unbind('click').click(function()
    {
      // валидируем
      // закрываем
      $("#dlgrights").dialog("close");
    });

   // запуск диалога
   $("#dlgrights").show().dialog("open");
   $("#dlgrights_rights_tbl").Scrollable(390,'100%');
}

$.fn.rightsUser = function() {
  var id_user = $(this).kID();
  var superadmins_selected = ($('#filter_cmb').val()=='-2' ? 1 : 0);

  if ($("#dlgrights").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
    $("#dlgrights").load("user_dlgrights_load", {show_all: superadmins_selected},
    function()
    {
      $("#cbShowAll").unbind('click').click(function()
      {
        rightsDialog(id_user, (this.checked ? 1 : 0));
      });

      rightsDialog(id_user, superadmins_selected);
    });
  }
  else
  { //уже загружено
    $("#cbShowAll").attr("checked", superadmins_selected);
    rightsDialog(id_user, superadmins_selected);
  }
};

$.fn.deleteUser = function ()
{
  var $tr = $(this);
  var trId = $tr.kID();
  var fio= $tr.find('.fio').text();

  if (confirm ('Подтвердите удаление пользователя \n'+fio+'?')){
    $.getJSON('ajaxDelUser', {id_user: trId}, function (json) {
      if (!showErr(json)){
        trRemove(trId);
      }
    });
  }
};

$.fn.deactiveUser = function ()
{
  var $tr = $(this);
  var trId = $tr.kID();
  var fio= $tr.find('.fio').text();
  if (confirm ('Подтвердите блокировку пользователя \n'+fio+'?')){
    engineStatUpd(trId, '0');
  }
};

$.fn.activeUser = function ()
{
  var $tr = $(this);
  var trId = $tr.kID();
  engineStatUpd(trId, '1');
};

function engineStatUpd (id_user, status){
  $.getJSON('updStatusUser', {id_user: id_user, status: status}, function (json) {
    if (!showErr(json)){
      funcUpdate({'OLD_ID': json.ext_data.ID_USER, 'ID_USER': json.ext_data.ID_USER},true);
    }
  });
  return false;
}

function editUserRolesDialog(id_user, fio, elem){
    //встроенный диалог прав ролей
    function detailEmbedDialog(id_role){
        rightsRoleDialog(id_role, null, true);
    }
    // заполняем список ролей, обязательно синхронно, чтоб далее проставился правильно выбранный элемент
    $.ajax({async: false,
            url: "ajaxListRoles",
            data: {id_user:id_user}, // необязательно
            dataType: "json",
            success: function (data, textStatus)
            {
              if (!showErr(data))
              //    alert('ошибка при запросе списка ролей из БД:\n'+data.mes);
              //    //alert('ajaxListRoles data'+data);
              // else
              {
                $("#dlgurrights_roles_tbl > tbody").empty();
                for (var i = 0; i < data.data.length; i++)
                {
                  $("#dlgurrights_roles_tbl > tbody").append("<tr id='urrights_role_"+data.data[i].ID_ROLE+"'>"
                                                                +"<td>"+data.data[i].ROLE_NAME+"</td>"
                                                                +"<td class='hac'><input type='checkbox' "+(data.data[i].ID_USER_ROLE?"checked":"")+"></td>"
                                                                +"<td id='urrights_lastdate_"+data.data[i].ID_ROLE+"'>"+(data.data[i].LASTDATE?data.data[i].LASTDATE:'')+"</td>"
                                                            +"</tr>");
                }
              }
            }
    });
    $("#dlgurrights_roles_tbl")
    .rowFocus({
     'rfbody':'#dlgurrights_roles_tbl_body',
     'rfFocusCallBack':function()
        {
          if ($("#dlgurrights_rights_div").children().length == 0)
          {
            $("#dlgurrights_rights_div").load(sp_forms+"/dlgrolerights.html", null,
            function()
            {
              detailEmbedDialog($("#dlgurrights_roles_tbl").rfGetFocus().substring(14));
            });
          }
          else {
            $("#dlgurrights").show().dialog("open"); //надо для правильного вешания Scrollable
            //должна вызываться после show dialog
            detailEmbedDialog($("#dlgurrights_roles_tbl").rfGetFocus().substring(14));
          }
        }
     });
    $('#dlgurrights_caption').html('<b>'+fio+'</b>');

    $("#dlgurrights_roles_tbl > tbody :checkbox").click(function()
    {
      cb=this;
      id_role=$(this).closest("tr").attr("id").substring(14);
      if (this.checked)
      {
        $.ajax
        ({    async: false,
              url: "ajaxAssignRoleToUser",
              data: {id_user: id_user, id_role: id_role},
              dataType: "json",
              success: function (data, textStatus)
              {
                if (!showErr(data))
                //    alert('Ошибка при назначении роли пользователю "'+fio+'":\n'+data.mes);
                //    //alert('ajaxListRoles data'+data);
                // else if (data.data.ERROR_CODE)
                //    alert('Ошибка при назначении роли пользователю "'+fio+'":\n'+data.data.ERROR_MSG);
                // else
                {//success!
                  $('#urrights_lastdate_'+id_role).text(data.data.LASTDATE?data.data.LASTDATE:'');
                }
              }
        });
      }
      else {
        $.ajax
        ({    async: false,
              url: "ajaxUnassignRoleFromUser",
              data: {id_user: id_user, id_role: id_role},
              dataType: "json",
              success: function (data, textStatus)
              {
                if (!showErr(data))
                //    alert('Ошибка при удалении роли пользователя "'+fio+'":\n'+data.mes);
                // else if (data.data.ERROR_CODE)
                //    alert('Ошибка при удалении роли пользователя "'+fio+'":\n'+data.data.ERROR_MSG);
                // else
                {//success!
                  $('#urrights_lastdate_'+id_role).text('');
                }
              }
        });
      }
    });

   $("#dlgurrights").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgurrights_save_btn").click();}})
                    .unbind('dialogclose').bind("dialogclose",function(event,ui)
                                              { //считаем к-во ролей
                                                $(elem).text($("#dlgurrights_roles_tbl > tbody :checkbox:checked").length)
                                                .attr('title', 'Роли пользователя: ' + $("#dlgurrights_roles_tbl > tbody > tr:has(:checkbox:checked) > td:first-child").map(function(i, el){return $(el).text()}).get().join(', '));
                                              });

   // определение кнопок
   $("#dlgurrights_save_btn").unbind('click').click(function()
    {
      // закрываем
      $("#dlgurrights").dialog("close");
    });

   // запуск диалога
   $("#dlgurrights").show().dialog("open");
   $("#dlgurrights_roles_tbl").Scrollable(300,'100%', {allwaysFullHeight: true});
   $("#dlgurrights").focus().select();
}

$.fn.editUserRoles = function(){
  var $tr = $(this);
  var id_user = $tr.kID();
  var fio= $tr.find('.fio').text();
  var tdElem = $tr.find('.cnt_roles');

  if ($("#dlgurrights").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
    $("#dlgurrights").load(sp_forms+"/dlgurrights.html", null,
    function()
    {
      editUserRolesDialog(id_user, fio,tdElem);
    });
  }
  else
  { //уже загружено
    editUserRolesDialog(id_user, fio,tdElem);
  }
};

$.fn.editUser = function(is_edit){
  var id_user = $(this).kID();
  if ($("#dlgedit").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
    $("#dlgedit").load(sp_forms+"/dlgedit.html", null,
    function()
    {
      validator = $("#dlgedit_form").validate(
      {
        rules:
        {
          dlgedit_login_edt: "required",
          dlgedit_fio_edt: "required",
          dlgedit_email_edt: {required: false, email: true}
        },
        messages:
        {
          dlgedit_login_edt: {required: "Введите логин"},
          dlgedit_fio_edt: {required: "Введите ФИО"},
          dlgedit_email_edt: {email: "Введите верный e-mail или оставьте поле пустым"}
        },
        errorPlacement: function(error, element)
        {
          error.appendTo(element.parent("td").next("td") );
        },
        errorClass: "invalid",
        errorElement: "em",
        highlight: function(element, errorClass) {
           $(element).fadeOut(function() {
             $(element).fadeIn(function() {validator.focusInvalid();})
           })
        },
        onfocusout: false //воизбежание зацикленных перемещений между полями
      });

      //Маска ввода,телефона
      $("#dlgedit_phonenumber_edt_mask").mask("(999) 999-9999");

      editDialog(id_user, is_edit);
    });
  }
  else
  {
    validator.resetForm(); //delete error messages
    editDialog(id_user, is_edit);
  }
};

//
// ПАРОЛЬ
//

function changePasswdDialog(id_user, fio, login, author_ad){
    //диалог изменения пароля

   $('#fio_txt').text(fio);
   $('#id_txt').text(id_user);
   $('#login_txt').text(login);
   $('#id_txt').data('id_user', id_user);
   $('#id_txt').data('login', login);


   $("#dlgchangepasswd").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgchangepasswd_save_btn").click();}})

   // определение кнопок
   $("#dlgchangepasswd_generate_btn").unbind('click').click(generatePasswd);
   $("#dlgchangepasswd_list_bc_btn").unbind('click').click(listBC);
   $("#show_passwd_chk").unbind('change').change(function(){showTogglePasswd(false)});
   $("#auth_ad_chk").unbind('change').change(function()
    {
      if ($(this).attr('checked')) {
        $('#dlgchangepasswd_form')
          .find('#show_passwd_chk').attr({'disabled': true}).end()
          .find('input[name^="passwd"]').val('').attr('disabled', true).end();
        $('#dlgchangepasswd_generate_btn').attr({'disabled': true});
        //скрываем подказки о пароле
        $('#pc-container, #verdict_passwd, #repeat-text, #verdict_passwd2').hide();
        $("#pc-indicator-inline").width(0);
      }
      else {
        $('#dlgchangepasswd_form')
          .find('input[name^="passwd"]').removeAttr('disabled').end()
          .find('#show_passwd_chk').removeAttr('disabled').end();
        $('#dlgchangepasswd_generate_btn').attr({'disabled': false});
      }
    });


   $("#auth_ad_chk").attr('checked', author_ad == '1' ?  true : false).change();


   $("#dlgchangepasswd_cancel_btn").unbind('click').click(function(){$("#dlgchangepasswd").dialog("close");});
   $("#dlgchangepasswd_save_btn").unbind('click').click(function()
    {
      $.getJSON('ajaxChangePassword',
                {login: login, passwd: $('#passwd').val(), passwd2: $('#passwd2').val(), send_mail: ($('#send_mail_chk').is(':checked') ? '1' : ''),
                 author_ad: ($('#auth_ad_chk').is(':checked') ? '1' : '0')},
                dlgeditCallback);

      // обрабатываем ответ
      function dlgeditCallback(json)
      {
          if (json.ext_data.RES=='ok'){
             // закрываем
            $("#dlgchangepasswd").dialog("close");
            trUpdate(json,null,json.data.ID_USER, true);
          }
          // на всяк случай обрабатываем passwd_invalid и passwd2_invalid
          else if (json.ext_data.RES=='passwd_invalid'){
            $('#verdict_passwd').show().css('display', 'inline');
            $('#pc-indicator-text').get(0).className = 'pc-critical';
            $("#pc-indicator-inline").get(0).className = "pc-i-critical";
            $("#pc-container").show();
            $('#verdict_passwd').get(0).className = 'verdict verdict_no';
            $("#pc-indicator-text").show().text(json.ext_data.ERROR_MSG);
          }
          else if (json.ext_data.RES=='passwd2_invalid'){
            $('#verdict_passwd2').css('display', 'inline');
            $("#repeat-text").show().css('display', 'block').text(json.ext_data.ERROR_MSG);
          }
          else if (json.ext_data.RES=='unk_user_ad'){
            ///че-нить замутить красивое
            $("#pc_error").text('Для данного логина недоступна');
            $("#pc_error").get(0).className = "pc-critical";//Стили в passwd_verify.tmpl

            $("#auth_ad_chk").attr({'disabled': true, 'checked': false});

            $('#dlgchangepasswd_form')
              .find('input[name^="passwd"]').attr('disabled', false).end();
            $("#show_passwd_chk").attr({'disabled': false});
            $('#dlgchangepasswd_generate_btn').attr({'disabled': false});


            alert('Ошибка при изменении пароля:\n'+json.ext_data.ERROR_MSG)
          }
          else {
            alert('Ошибка при изменении пароля:\n'+json.ext_data.ERROR_MSG);
          }
      }
    });

   // запуск диалога
   $("#dlgchangepasswd").show().dialog("open");
   $("#passwd").focus().select();
   //перенавешиваем плагин, чтоб не съезжали столбцы
   // $('#tbl_users').kScrollableToDown();
}

$.fn.changePasswd = function() {
  var $tr = $(this);
  var id_user = $tr.kID();
  var fio= $tr.find('.fio').text(), login = $tr.find('.login').text(), author_ad = $tr.find('.author_ad').text();

  $("#dlglistBC").dialog("destroy").remove(); //удалить диалог и div, который иначе остаётся в конце body и тут снова загружается пустой
  $("#dlgchangepasswd").load("admin_users_dlgchangepasswd",
  function()
  {
    changePasswdDialog(id_user, fio, login, author_ad);
  });
};
function showTogglePasswd(show)
{  //show - только отображать или toggle-ить
   if ($('#passwd').attr('type') == 'password'){
     $('#passwd').after('<input type="text" value="'+$('#passwd').val()+'" size="30" id="passwd" name="passwd">').remove();
     $('#passwd2').after('<input type="text" value="'+$('#passwd2').val()+'" size="30" id="passwd2" name="passwd2">').remove();
     $('#show_passwd_chk').attr('checked', 'checked');
   }
   else if (typeof show == 'undefined' || !show){
     $('#passwd').after('<input type="password" value="'+$('#passwd').val()+'" size="30" id="passwd" name="passwd">').remove();
     $('#passwd2').after('<input type="password" value="'+$('#passwd2').val()+'" size="30" id="passwd2" name="passwd2">').remove();
   }
}

function generatePasswd()
{
   var r;
   var digit = ["0","1","2","3","4","5","6","7","8","9"];
   var bigs = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","Y","Z"];
   var smalls = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","y","z"];
   var signs = ["-","'","~","`","!","@","#","$","%","^","&","*","+","=","_","|","\\","/","(",")","[","]","{","}","<",
       ">",",",".",";",":","?"];
   var pasw = "";

   for (var i=0; i<PWD_MIN_LEN; i++)
   {
      r = Math.random();
      if ( (r - 1.0/4.0) < 0.0)
      {
         r = Math.floor(Math.random() * digit.length);
         pasw += digit[r];
      }
      else if ( (r - 2.0/4.0) < 0.0)
      {
         r = Math.floor(Math.random() * bigs.length);
         pasw += bigs[r];
      }
      else if ( (r - 3.0/4.0) < 0.0)
      {
         r = Math.floor(Math.random() * smalls.length);
         pasw += smalls[r];
      }
      else
      {
         r = Math.floor(Math.random() * signs.length);
         pasw += signs[r];
      }
   }
   $('#passwd').val(pasw);
   $('#passwd2').val(pasw);
   $('#passwd').keyup();
   showTogglePasswd(true);
}

function listBCDialog(id_user, fio)
{
     // инициализация диалога
     $("#dlglistBC_caption").text(fio);

     function deleteBC(a)
     {
        if(confirm(_('Вы действительно хотите удалить ШК типа "'+ $(a).closest("tr").find("td.bc_type_name").text() +'" пользователя '+fio+'?'))) {
                $.ajax({
                    url: 'ajaxBarcodeDel',
                    dataType: 'json',
                    data: {id_type: $(a).closest('tr').attr('id').substring(10), id_user: id_user},

                    async: false,
                    success: function(JSON) {
                        //if(JSON.data.RES=='1') {
                        $(a).closest("tr").remove();
                        $('#dlglistBC_bc_tbl').trigger("update");
                        $("#dlglistBC_bc_tbl").Scrollable();

                        //} else {
                        //    alert(JSON.data.ERRMESS);
                        //    return;
                        //}
                    }
                });
        }
    }

    //Печать ШК и QR

    function printBC(a)
    {
        //печатаем ШК
        $.ajax
        ({async: false,
              url: "ajaxBarcodeHTML",
              data: {id_user: id_user, id_type: $(a).closest('tr').attr('id').substring(10), is_qr: 0},
              dataType: "json",
              success: function (json, textStatus)
              {
                  if (json.data.RES!='ok'){
                    alert(_('Ошибка при формировании карты доступа с ШК авторизации:\n')+json.data.ERROR_MSG);
                  }
                  else{
                      var wnd = window.open(null);
                      if (wnd) {
                          wnd.document.write(json.data.HTML);
                          wnd.document.close();//без этого загрузка не завершается
                      }
                      else{
                          alert(_('Карта доступа с ШК не может быть сформирована, поскольку всплывающие окна в браузере заблокированы! Разрешите их для данного сайта и повторите процедуру печати!'));
                      }
                  }
              }
         });
    }

    function printQR(a)
    {
        //печатаем QR-код
        $.ajax
        ({async: false,
              url: "ajaxBarcodeHTML",
              data: {id_user: id_user, id_type: $(a).closest('tr').attr('id').substring(10), is_qr: 1},
              dataType: "json",
              success: function (json, textStatus)
              {
                  if (json.data.RES!='ok'){
                    alert(_('Ошибка при формировании карты доступа с QR-кодом авторизации:\n')+json.data.ERROR_MSG);
                  }
                  else{
                      var wnd = window.open(null);
                      if (wnd) {
                          wnd.document.write(json.data.HTML);
                          wnd.document.close();//без этого загрузка не завершается
                      }
                      else{
                          alert(_('Карта доступа с QR-кодом не может быть сформирована, поскольку всплывающие окна в браузере заблокированы! Разрешите их для данного сайта и повторите процедуру печати!'));
                      }
                  }
              }
         });
    }

    $('#dlglistBC_bc_tbl').rowFocus().Scrollable(300,'100%',{prettyPadding: 2});

   $("#dlglistBC").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlglistBC_close_btn").click();}});

   // определение кнопок
   $("#dlglistBC_gen_btn").unbind('click').click(function()
    {
      genBC();
    });

   $(".delete_bc>a").die("click").live("click",function(){deleteBC(this)});
   $(".print_bc>a").die("click").live("click",function(){printBC(this)});
   $(".print_qr>a").die("click").live("click",function(){printQR(this)});

   // определение кнопок
   $("#dlglistBC_close_btn").unbind('click').click(function()
    {
      $("#dlglistBC").dialog("close");
    });

   // запуск диалога
   $("#dlglistBC").show().dialog("open");
}

function listBC()
{
  var id_user = $('#id_txt').data('id_user');
  var fio = $('#fio_txt').text();

  if ($("#dlglistBC").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
      $("#dlgokcancel").dialog("destroy").remove(); //удалить диалог и div, который иначе остаётся в конце body и тут снова загружается пустой
      //загружаем всегда, т.к. меняется id_user
      $("#dlglistBC").html('<strong>Загрузка...</strong>').load('users_barcodes', {id_user: id_user}, function(){
        $("#dlglistBC").dialog(
        {
          'autoOpen': false,
          title: 'Список кодов авторизации пользователя',
          modal: true,
          width: 550,
          height: 400,
          resizable: true,
          draggable: true,
          position: "center",
          overlay:{opacity:0.5, background:"black"}
        });
        listBCDialog(id_user, fio);
      });
  }
  else
  { //уже загружено
    listBCDialog(id_user, fio);
  }
}

//Генерация ШК

function generateBC()
{
    //добавляем в таблицу штрихкодов
    var id_user = $('#id_txt').data('id_user');
    var id_type = $("#dlgbcgen_type_cmb>option:selected").val();
    var type_name = $("#dlgbcgen_type_cmb>option:selected").text();

   $.ajax
   ({async: false,
    url: "ajaxBarcodeGen",
    data: {id_user: id_user, id_type: id_type, send_mail: ($('#send_mail_chk').is(':checked') ? '1' : '')},
    dataType: "json",
    success: function (json, textStatus)
    {
      if (json.data.RES=='ok'){
        //Удаляем старый ШК этого типа, если есть
        $("#dlglistBC_bc_tbl > tbody > tr[id='dlglistBC_" + id_type + "']").remove();

        //Добавляем в таблицу штрихкодов
        $("#dlglistBC_bc_tbl > tbody").append($.format(
             '<tr id="dlglistBC_{0}">'
             +'<td class="hal bc_type_name">{1}</td>'
             +'<td class="hac bc">{2}</td>'
             +'<td class="lastdate">{3}</td>'
             +'<td class="hac delete_bc"><a title="Удалить код" href="javascript:void(0);"><img style="background-color: transparent" border=0 src="/ENGINE/images/actions/delete.png" /></a></td>'
             +'<td class="hac print_bc"><a title="'+_('Печатать ШК')+'" href="javascript:void(0);"><img style="background-color: transparent" border=0 src="/ENGINE/images/actions/bc.png" /></a></td>'
             +'<td class="hac print_qr"><a title="'+_('Печатать QR-код')+'" href="javascript:void(0);"><img style="background-color: transparent" border=0 src="/ENGINE/images/actions/qr.png" /></a></td>'
             +'</tr>'
             ,
             id_type,
             type_name,
             json.data.BC,
             json.data.LASTDATE?json.data.LASTDATE:''
        ));
        $("#dlglistBC_bc_tbl").trigger("update").Scrollable();

        alert(_('Код доступа сгенерирован. Распечатайте его ШК- или QR-вариант.'));
      }
      else{
        alert(_('Ошибка при генерации кода доступа:\n')+json.data.ERROR_MSG);
      }
    }
    });
}

function genBCDialog(){
    // инициализация диалога
  $("#dlgokcancel_content").html('<strong>Загрузка...</strong>').load('users_barcode_dlggen', function(){
      // определение кнопок
      $("#dlgokcancel_ok_btn").unbind('click').click(function()
      {
         //добавляем в таблицу штрихкодов и печатаем ШК - модально
         generateBC();

         // закрываем
         $("#dlgokcancel").dialog("close");
      });
  });
  // события
  $("#dlgokcancel").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgokcancel_ok_btn").click();}});

  // определение кнопок
  $("#dlgokcancel_cancel_btn").unbind('click').click(function(){$("#dlgokcancel").dialog("close");});

  if ($.browser.msie) {
      $( "#dlgokcancel" ).unbind( "dialogclose").bind( "dialogclose", function(event, ui) {
          $('#dlgbcgen_type_cmb').css('visibility', 'hidden');
      });
  }
  // запуск диалога
  $("#dlgokcancel").show().dialog("open");
  //обязательно после show dialog
  if ($.browser.msie) {
      $('#dlgbcgen_type_cmb').css('visibility', 'visible');
      $('#dlgokcancel .full_height').css('height', '86px');
  }

}

function genBC() {
  if ($("#dlgokcancel").children().length == 0)
  {
    //ещё не загружено - инициализируем 1-й раз
    $("#dlgokcancel").load('systems_okcancel', function(){
        //Dialog Gen BC
        $("#dlgokcancel").dialog(
        {
          'autoOpen': false,
          modal: true,
          resizable: true,
          draggable: true,
          position: "center",
          overlay:{opacity:0.5, background:"black"}
        });

      $('#dlgokcancel').dialog('option', 'title', 'Генерация ШК');
      $('#dlgokcancel').dialog('option', 'width', 430);
      $('#dlgokcancel').dialog('option', 'height', 140);
      genBCDialog();
    });
  }
  else
  { //уже загружено
    genBCDialog();
  }
}
})(jQuery);