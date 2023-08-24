//include(eng_js+'/utils.objects.js');

/* ==================================================
                Global selected data
================================================== */

////var sel_view=null;
//var sel_roles=[]/*['id_role1', 'id_role2']*/; //выбранные в фильтре данные
var filtered_roles=[]/*{{id_role: id_role1, role_name: role_name1}, {id_role: id_role2, role_name: role_name2}, ...}*/; //выбранные роли в диалоге selRoles()
//var filtered_attrs=[]/*[{attr: attr_id1, value: attr_value1}, {attr: attr_id2, value: attr_value2}]*/; //выбранные аттрибуты в диалоге selAttrs()
var cur_id_system=null, cur_name_system=null;
var cur_id_role=null, cur_role_name=null;
//var revert_step=''; // 'stepSystems'  или 'stepTree' - к чему возвращаться из stepViews - к списку систем или дереву опций
//var last_resizible_id, last_resizible_width; //для хранения на каждом шаге элементов, которые ресайзаблить при изменении размеров окна
//var bases_list = [];
//var email_list = [];
//var higher_list = [];
var options_list = []; //опции, определённые разработчиком в options.py
// var divider="&%#"; // for divide id_obj's and type_obj's, when pass this pairs from JS through JSON

$.validator.addMethod("obj_id", function(value, element) {
    return /^[_0-9a-zA-Z]+$/.test(value);
}, _("Разрешены английские буквы, цифры, _")); //русские не разрешены из-за ошибки с кодировками при поиске в Element (find) по obj_id
        //return this.optional(element) || /^http:\/\/mycorporatedomain.com/.test(value);
        //}, "Allowed")

$.validator.addMethod("obj_name", function(value, element) {
    return /^[ _\-0-9a-zA-ZабвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ]+$/.test(value);
}, "&nbsp;"+_("Разрешены англо-русские буквы, цифры, пробел _ -"));
        //return this.optional(element) || /^http:\/\/mycorporatedomain.com/.test(value);
        //}, "Allowed")

$.validator.addMethod("attr_id", function(value, element) {
    return value!='id' && /^[_a-zA-Z][0-9_a-zA-ZабвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ]*$/.test(value);
}, '<br>'+_('Разрешены англо-русские буквы, цифры, _. 1-й символ должен быть английской буквой или _. Не допускается имя "id"'));
        //return this.optional(element) || /^http:\/\/mycorporatedomain.com/.test(value);
        //}, "Allowed")

$.validator.addMethod("attr_value", function(value, element) {
    return !value || /^[ _\-+\.|0-9_a-zA-ZабвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ]+$/.test(value);
}, "<br>"+_("Разрешены англо-русские буквы, цифры, а также пробел _ - + . |"));
        //return this.optional(element) || /^http:\/\/mycorporatedomain.com/.test(value);
        //}, "Allowed");

$.validator.addMethod("merge_symbol", function(value, element) {
    return !value || /^[10 _\-+\.|]*$/.test(value);
}, "<br>"+_("Введите: 1 0 пробел _ - + . | или оставьте поле пустым"));
        //return this.optional(element) || /^http:\/\/mycorporatedomain.com/.test(value);
        //}, "Allowed");

var validator; // объект плугина "validator" для dlgoptedit
var validator_dlgattredit; // объект плугина "validator" для dlgattredit
var validator_dlgfromopts; // объект плугина "validator" для dlgfromopts

//var actions = []; // действия с xml-файлом в формате: [{action: 'add', path: {id_user: 45, type_id: 'element', obj_id='add_btn', opt_id='view'}, params:{}}, {action: }, ...], ибо фильтр не включает всех людей
//var affected_users = []; //['uid1', 'uid2', ...] список без повторений изменнённых юзеров, которых надо распарсить в дереве и перенести 1 к одному в xml-файл

var undefined; // Will speed up references to undefined, and allows munging its name.

/* ==================================================
                    Init
================================================== */

$(
  function()
  {
    //$("#tbl_roles > tbody > tr:nth-child(odd)").css("background-color", "#E6E6FA");

    $("#dlgroleedit").dialog(
    {
      'autoOpen': false,
//      title: 'Редактирование роли',
      modal: true,
      width: 460,
      height: 150,
      resizable: true,
      draggable: true,
      position: "center",
      overlay:{opacity:0.5, background:"black"}
    });

    //view
    $("#tbl_roles>thead>tr:nth-child(2)").css("cursor","pointer");

    //events
    $("#tbl_roles>tbody>tr>td:nth-child(1)>a").live("click",(function(){editRole(this,true)}));
    $("#tbl_roles>tbody>tr>td:nth-child(2)>a").live("click",(function(){rightsRole(this)}));
    $("#tbl_roles>tbody>tr>td:nth-child(3)>a").live("click",(function(){deleteRole(this)}));
    $("#tbl_roles>tbody>tr>td:nth-child(4)>a").live("click",(function(){roleUsers(this)}));
    $(".role_add_btn").click(function(){editRole(undefined,false)});

    //Features
    $("#tbl_roles")
    //rowFocus
    .rowFocus({'rfbody':'#tbl_roles_tbody'})
    //sortable
    .tablesorter({
                   // define a custom text extraction function
                   /* textExtraction: function(td) {
                        // extract data from markup and return it
                        if ($(':checkbox', $(td)).length)
                            return ($(':checkbox', $(td)).attr("checked")?'1':'0');
                        else
                            return td.innerHTML;
                    },*/
                    dateFormat:"dd.mm.yyyy",
                    widgets:['zebra'],
                    headers:{ 7:{sorter:"DateTime"}
                              //0:{sorter:"text"}, //Тип
                              //1:{sorter:"text"}, //Объект
                              //2:{sorter:"text"}, //Опция
                              //3:{sorter:"text"}, //Атрибуты
                              //4:{sorter:"text"} //Удалить
                              //5:{sorter:"digit"}, //Сортировка
                              //6:{sorter:"digit"}, //Срок действия (в днях)
                              //7:{sorter:"digit"}, //Напоминать за (дней)
                              //4:{sorter:"DateTimeWoSec"} //Изменено
                              //10:{sorter:"longDate"} //Дата тарифа
                              //10:{sorter:"DateTimeWoSec"} //Изменено
                              //11:{sorter:"DateTimeWoSec"}, //Изменено
                              /*1:{sorter:"digit"}, //ID
                              2:{sorter:"text"}, //SHOW_NAME
                              3:{sorter:"text"}, //REF_NAME
                              4:{sorter:"text"}, //FOLDER_NAME
                              */
                              //8:{sorter:"time"}, //CLASS_NAME
                              //10:{sorter:"text"}
                              /*6:{sorter:"text"}, //MODULE_NAME
                              //6:{sorter:"longDate"},
                              7:{sorter:"DateTime"},
                              //7:{sorter:false}, //LOGO
                              //8:{sorter:"digit"}, //HIGHER
                              7:{sorter:"digit"}, //ID_BASE
                              8:{sorter:"digit"}, //СЛАТЬ
                              9:{sorter:"digit"}, //ID_MAIL
                              10:{sorter:"text"}, //ФОРМАТ Д/В
                              11:{sorter:"text"}, //ОПЦИИ
                              //13:{sorter:"digit"}, //ORDERBY
                              12:{sorter:"text"}, //DISABLED
                              13:{sorter:"DateTime"}, //LASTDATE
                              14:{sorter:"text"} //COMMENTS*/
                            }
                })
    .kScrollableToDown({width: '100%', allwaysFullHeight: "footerdown"})
    ;
    /* scroll
    $('#master')
                .css('height', '250px')
                .css('width', '500px');
        $('#master-body')
                .css('height', '210px')
                .css('overflow', 'auto')
                .css('overflow-x', 'hidden');
    */
    //sortable
    /*$('#tbl_roles tbody tr').quicksearch({
      position: 'after',
      attached: '#tbl_roles thead tr td span',
      labelText: 'Быстрый поиск',
      loaderText: '',
      //loaderClass: '',
      fixWidths: true,
      onAfter: function(){$("#tbl_roles").trigger("update");}
    });*/
    //    $("#tbl_roles tfoot tr td span").after('<span id="span_add_quick_search" class="buttons" style="text-align: left"><button class="user_add_btn" type="button" onclick="javascript: loadQuickSearch();"><img src="'+eng_img+'/actions/addfind.png" style="vertical-align: middle">&nbsp;Загрузить быстрый поиск</button></span>');

    $("#dlgrolerights").dialog(
    {
      'autoOpen': false,
//      title: '',
      modal: true,
      width: 400,
      height: 400,
      resizable: true,
      draggable: true,
      position: "center",
      overlay:{opacity:0.5, background:"black"}
    });

    $("#dlgroleusers").dialog(
    {
      'autoOpen': false,
//      title: '',
      modal: true,
      width: 500,
      height: 400,
      resizable: true,
      draggable: true,
      position: "center",
      overlay:{opacity:0.5, background:"black"}
    });

    $("#dlgroleoptions").dialog(
    {
      'autoOpen': false,
//      title: '',
      modal: true,
      width: 800,
      height: 465,
      resizable: true,
      draggable: true,
      position: "center",
      overlay:{opacity:0.5, background:"black"}
    });
  }
);

/*function loadQuickSearch(){
    $.getScript(eng_js+"/jquery.quicksearch.min.js", function(){
        $("#span_add_quick_search").remove();
        $('#tbl_roles tbody tr').quicksearch({
            position: 'after',
            attached: '#tbl_roles tfoot tr td span',
            labelText: 'Быстрый поиск',
            loaderText: '',
            //loaderClass: '',
            fixWidths: true,
            onAfter: function(){$("#tbl_roles").trigger("update");}
        });
    });
}*/

var validator_roles = {}; // объект плугина "validator"

function getCurRole(elem) {return $(elem).closest("tr").attr('id');}
function getCurRoleName(elem) {return $(elem).closest("tr").find("td[id^='name']").text();}
function ad_integration(){
  return ($('#th_grooup_name').length > 0);
}

function getCurAttrId(elem) {
    return $(elem).closest("tr").attr('id');
}

function getCurAttrValue(elem) {
    return $(elem).closest("tr").attr('value');
}

function getCurAttrMergeSymbol(elem) {
    return $(elem).closest("tr").find("td.merge").text();
}

function getCurAttrMergeReadonly(elem) {
    return $(elem).closest("tr").attr('merge_readonly');
}

function rightsRoleDialog(id_role, role_name, embed){
   // инициализация диалога
   // рисуем таблицу прав
   if (role_name)
     $("#dlgrolerights_caption").html('<b>'+role_name+'</b>');

   $.ajax
   ({async: false,
          url: "ajaxRoleRights",
          data: {id_role: id_role},
          dataType: "json",
          success: function (data, textStatus)
          {
            if (data.mes)
               alert('Ошибка при запросе дерева прав роли из БД:\n'+data.mes);
               //alert('ajaxRoleRights data'+data);
            else
            {
              //insert
              $("#dlgrolerights_rights_tbl > tbody").empty();
              for (var i = 0; i < data.data.length; i++)
              {
                $("#dlgrolerights_rights_tbl > tbody").append(jQuery.format(
                   '<tr id="dlgrolerights_{0}" higher="{4}">'
                   +'<td id="dlgrolerights_show_name_{0}" class="hal">{1}{2}</td>'
                   +'<td class="hac">'
                   +'{1}<input id="dlgrolerights_right_cb_{0}" type="checkbox" {3}>'
                   +'</td>'
                   +'<td class="hac edit_options_img">'
                   +(data.data[i].HAS_OPTIONS ?
                        '<a class="edit_role_options" title="Редактировать опции" href="javascript: void(0);"><img border=0 src="/ENGINE/images/actions/edit.png" style="background-color: transparent; vertical-align: middle"/></a>'
                       :
                        '<a class="add_role_options" title="Добавить опции" href="javascript: void(0);"><img src="/ENGINE/images/actions/add.png" style="vertical-align: middle"></a>'
                    )
                   +'</td>'
                   +'<td id="dlgrolerights_lastdate_{0}">{5}</td>'
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
              if (!embed) {
                  $("#dlgrolerights_rights_tbl > tbody input:checkbox").click(function()
                  {
                    var cb=this;
                    var id_system=$(this).closest("tr").attr("id").substring(14);
                    var higher=$(this).closest("tr").attr("higher");
                    if (this.checked)
                    {
                          $.ajax
                          ({    async: false,
                                url: "ajaxAddRoleRight",
                                data: {id_role: id_role, id_system: id_system},
                                dataType: "json",
                                success: function (data, textStatus)
                                {
                                  if (data.mes)
                                     alert('Ошибка при добавлении права роли "'+role_name+'":\n'+data.mes);
                                  else if (data.data.ERROR_CODE)
                                      alert('Ошибка при добавлении права роли "'+role_name+'":\n'+data.data.ERROR_MSG);
                                  else
                                  {
                                    $("#dlgrolerights_lastdate_"+id_system).text(data.data.LASTDATE);
                                    cur_higher=higher;
                                    do
                                    {
                                      $("#dlgrolerights_rights_tbl > tbody > tr#dlgrolerights_"+cur_higher+" :checkbox").attr("checked", "checked");
                                      $("#dlgrolerights_lastdate_"+cur_higher).text(data.data.LASTDATE);
                                      cur_higher=$("#dlgrolerights_rights_tbl > tbody > tr#dlgrolerights_"+cur_higher).attr("higher");
                                    } while (cur_higher);
                                  }
                                }
                          });
                    }
                    else {
                      /*if (!confirm('Пользователи роли, возможно, будут удалены из базы системы. Согласны?'))
                      {
                        cb.checked=true;
                        return;
                      }*/
                      $.ajax
                      ({    async: false,
                            url: "ajaxDelRoleRight",
                            data: {id_role: id_role, id_system: id_system},
                            dataType: "json",
                            success: function (data, textStatus)
                            {
                              if (data.mes)
                                 alert('Ошибка при удалении права роли "'+role_name+'":\n'+data.mes);
                              else if (data.data.ERROR_CODE)
                                  alert('Ошибка при удалении права роли "'+role_name+'":\n'+data.data.ERROR_MSG);
                              else
                              {
                                function rec_uncheck_self_and_childs(id_system)
                                {
                                  //self
                                  $("#dlgrolerights_rights_tbl > tbody > tr#dlgrolerights_"+id_system+" :checkbox").removeAttr("checked")
                                    .closest("tr").find('td[id^="dlgrolerights_lastdate_"]').text('');
                                  //childs
                                  $("#dlgrolerights_rights_tbl > tbody > tr[higher="+id_system+"] :checkbox")
                                    .each(
                                      function (ind){
                                        $(this).removeAttr("checked");
                                        $(this).closest("tr").find('td[id^="dlgrolerights_lastdate_"]').text('');
                                        rec_uncheck_self_and_childs($(this).closest("tr").attr("id").substring(14));
                                      }
                                    )
                                }
                                rec_uncheck_self_and_childs(id_system);
                              }
                            }
                      });
                    }
                  }); //checkbox click

                  $("a.edit_role_options").unbind("click").click(function(){roleOptionsFull(this);});
                  $("a.add_role_options").unbind("click").click(function(){roleOptionsFull(this);});

               } //if (!embed)
               else {
                  $("#dlgrolerights_rights_tbl > tbody input:checkbox").click(function() {
                      return false;
                  });
               }
            }
   //          alert('Синхронный ответ');
          }
   });

    //$("#dlgrolerights_rights_tbl > tbody > tr:nth-child(odd)").css("background-color", "#E6E6FA");

    //$("#dlgrolerights_form").get(0).reset();
    //$("#dlgrolerights_login_edt").focus().select();
   if (!embed) {
     if (!$("#dlgrolerights_caption").next().is('br'))
       $("#dlgrolerights_caption").after('<br/>');
     $("#dlgrolerights").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgrolerights_save_btn").click();}});

     // определение кнопок
     $("#dlgrolerights_save_btn").unbind('click').click(function()
      {
        // валидируем
        // alert ('Проверить вышестоящие чекбоксы');
        // закрываем
        $("#dlgrolerights").dialog("close");
      });

     // запуск диалога
     $("#dlgrolerights").show().dialog("open");
     //$("#dlgrolerights_login_edt").focus().select();

     $("#dlgrolerights_save_btn").show();
   }
   else {
     $("#dlgrolerights_save_btn").hide();
   }
   $("#dlgrolerights_rights_tbl").Scrollable(300,'100%');
}

function rightsRole(elem, id_role, role_name)
{
  if (typeof id_role=="undefined")
    id_role=getCurRole(elem);

  if (typeof role_name=="undefined")
    role_name=$("#name_"+id_role).text();

  cur_id_role = id_role;
  cur_role_name = role_name;

  if ($("#dlgrolerights").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
    $("#dlgrolerights").load(sp_forms+"/dlgrolerights.html", null,
    function()
    {
      rightsRoleDialog(id_role, role_name);
    });
  }
  else
  { //уже загружено
    rightsRoleDialog(id_role, role_name);
  }
}

function roleUsersDialog(id_role, role_name){
   // инициализация диалога
   // рисуем таблицу прав
   if (role_name)
     $("#dlgroleusers_caption").html("Пользователи роли <b>"+role_name+"</b>");

   $.ajax
   ({async: false,
          url: "ajaxRoleUsers",
          data: {id_role: id_role},
          dataType: "json",
          success: function (data, textStatus)
          {
            if (data.mes)
               alert('Ошибка при запросе пользователей роли из БД:\n'+data.mes);
            else
            {
              //insert
              $("#dlgroleusers_tbl > tbody").empty();
              for (var i = 0; i < data.data.length; i++)
              {
                $("#dlgroleusers_tbl > tbody").append(jQuery.format(
                   '<tr id="dlgroleusers_{0}">'
                   +'<td class="har">{0}</td>'
                   +'<td>{1}</td>'
                   +'<td>{2}</td>'
                   +'</tr>'
                   ,
                   data.data[i].ID_USER,
                   data.data[i].LOGIN,
                   data.data[i].FIO
                ));
              }
              $("#dlgroleusers_tbl > thead > tr").css("cursor","pointer");
              $("#dlgroleusers_tbl > tbody > tr").css("cursor","pointer").click(function(){location.href="users?focused_id="+$(this).closest("tr").attr('id').substring(13);});
              $("#dlgroleusers_tbl").tablesorter();
            }
   //          alert('Синхронный ответ');
          }
    });

     $("#dlgroleusers").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgroleusers_save_btn").click();}});

     // определение кнопок
     $("#dlgroleusers_save_btn").unbind('click').click(function()
      {
        // закрываем
        $("#dlgroleusers").dialog("close");
      });

     // запуск диалога
     $("#dlgroleusers").show().dialog("open");
     $("#dlgroleusers_tbl").Scrollable(300,'100%');
}

function roleUsers(elem)
{
  var id_role=getCurRole(elem);
  var role_name=$("#name_"+id_role).text();

  if ($("#dlgroleusers").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
    $("#dlgroleusers").load(sp_forms+"/dlgroleusers.html", null,
    function()
    {
      roleUsersDialog(id_role, role_name);
    });
  }
  else
  { //уже загружено
    roleUsersDialog(id_role, role_name);
  }
}

function deleteRole(elem)
{
  var id_role=getCurRole(elem);
  var role_name=getCurRoleName(elem);

  if (!confirm ('Удалить роль '+role_name+'?'))
    return;

  $.getJSON('ajaxDelRole', {id_role: id_role},
    function (data)
    {
      if (data.mes)
         alert('Ошибка при удалении роли "'+role_name+'":\n'+data.mes);
      else if (data.data.ERROR_CODE)
          alert('Ошибка при удалении роли "'+role_name+'":\n'+data.data.ERROR_MSG);
      else
      {
        $("#tbl_roles > tbody > tr#"+id_role).remove();
        $("#tbl_roles").trigger("update").kScrollableToDown();
        //alert('Роль "'+role_name+'" удалена');
      }
    }
  );
}

/* ==================================================
                    Dialog Add/Edit Role
================================================== */

function editRoleDialog(id_role, is_edit){
    if (ad_integration()){
        $("#tr_ad_group_name").show();
        if (is_edit) {
            $("#dlgroleedit_ad_group_name_edt").val($("#ad_group_name_"+id_role).text());
        }
    }
    else {
        $("#tr_ad_group_name").hide();
    }

   // инициализация диалога
   if (is_edit) {
     $('#dlgroleedit').dialog('option', 'title', 'Редактирование роли');
     //$("#dlgroleedit_id_edt").show();
     $("#dlgroleedit_id_tr").show();
     $("#dlgroleedit_id_edt").val(id_role);
     //$("#dlgroleedit_id_edt").removeAttr("disabled");
     //$("#dlgroleedit_id_edt").attr("readonly", "readonly");
     $("#dlgroleedit_name_edt").val($("#name_"+id_role).text());
   }
   else {
     $('#dlgroleedit').dialog('option', 'title', 'Добавление роли');
     //$("#dlgroleedit_id_edt").hide();
     $("#dlgroleedit_id_tr").hide();
     //$("#dlgroleedit_id_edt").removeAttr("readonly");
     //$("#dlgroleedit_id_edt").attr("disabled", "disabled");
     $("#dlgroleedit_form").get(0).reset();
   }
   $("#dlgroleedit").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgroleedit_save_btn").click();}});

   // определение кнопок
   $("#dlgroleedit_cancel_btn").unbind('click').click(function(){$("#dlgroleedit").dialog("close");});
   $("#dlgroleedit_save_btn").unbind('click').click(function()
    {
      // валидируем
      if (!$("#dlgroleedit_form").valid()) {
        //validator_roles.focusInvalid();
        return;
      }

      // закрываем
      //$("#dlgroleedit").dialog("close");

      // отсылаем на сервак
      if (is_edit){
        //$.getJSON('ajaxEditRole',params,dlgroleeditCallback);
        $.getJSON('ajaxEditRole?'+$('#dlgroleedit_form').serialize(), null, dlgroleeditCallback);
      }
      else {
        $.getJSON('ajaxNewRole?'+$('#dlgroleedit_form').serialize(), null, dlgroleeditCallback);
      }
      // обрабатываем ответ
      function dlgroleeditCallback(data)
      {
        if (data.mes)
            alert('Ошибка при сохранении роли:\n'+data.mes);
        else if (data.data.ERROR_CODE)
            alert('Ошибка при сохранении роли:\n'+data.data.ERROR_MSG);
        else
        {
            //alert('Роль "'+$("#dlgroleedit_name_edt").val()+'" успешно сохранёна!');
            var name = $("#dlgroleedit_name_edt").val();
            var lastdate = data.data.LASTDATE;
            var comments = data.data.COMMENTS;
            if (ad_integration())
                var ad_group_name = $("#dlgroleedit_ad_group_name_edt").val();

            if (is_edit){
              //edit
              // закрываем
              $("#dlgroleedit").dialog("close");
              var id = $("#dlgroleedit_id_edt").val();

              $("#name_"+id).text(name);
              $("#lastdate_"+id).text(lastdate);
              $("#comments_"+id).text(comments);
              if (ad_integration())
                  $("#ad_group_name_"+id).text(ad_group_name);
            }
            else {
              var new_id = data.data.OUT_ID_ROLE;
              var code = '';
              //insert
              $("#tbl_roles > tbody").append(jQuery.format(
                 '<tr id="{0}">'
                 +'<td class="hac"><a title="Редактировать роль" href="javascript: void(0);"><img style="background-color: transparent" border=0 src="/ENGINE/images/actions/edit.png"></a></td>'
                 +'<td class="hac"><a title="Права роли" href="javascript: void(0);"><img style="background-color: transparent" border=0 src="/ENGINE/images/actions/rights.gif"></a></td>'
                 +'<td class="hac"><a title="Удалить роль" href="javascript: void(0);"><img style="background-color: transparent" border=0 src="/ENGINE/images/actions/delete.png"></a></td>'
                 +'<td class="hac"><a title="Пользователи роли" href="javascript:void(0);"><img style="background-color: transparent" border=0 src="/ENGINE/images/actions/group.png"></a></td>'
                 +'<td id="id_{0}" class="har">{0}</td>'
                 +'<td id="name_{0}">{1}</td>'
                 +'<td id="code_{0}">{4}</td>'
                 +'<td id="lastdate_{0}">{2}</td>'
                 +'<td id="comments_{0}">{3}</td>'
                 +(ad_integration()? '<td id="ad_group_name_{0}">{5}</td>' : '')
                 +'</tr>'
                 ,
                 new_id,
                 name,
                 lastdate,
                 comments,
                 code,
                 ad_group_name
                                                          )
                                            );
              $("#tbl_roles > tbody > tr#"+new_id).rowFocus({'rfbody':'#tbl_roles_tbody'});
              //$("#tbl_roles > tbody > tr:nth-child(odd)#"+new_id).css("background-color", "#E6E6FA");

              $("#dlgroleedit_form").get(0).reset();
              $("#dlgroleedit_name_edt").focus().select();
            }
            $("#tbl_roles").trigger("update").kScrollableToDown();
        }
      }
    });

   // запуск диалога
   $("#dlgroleedit").show().dialog("open");
   $("#dlgroleedit_name_edt").focus().select();
}

function editRole(elem, is_edit)
{
  if (elem)
    id_role=getCurRole(elem);
  else
    id_role=undefined;

  //alert ('editRole is_edit='+is_edit+' id_role='+id_role+' elem='+elem);

  if ($("#dlgroleedit").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
    $("#dlgroleedit").load(sp_forms+"/dlgroleedit.html", null,
    function()
    {
      validator_roles = $("#dlgroleedit_form").validate(
      {
        rules:
        {
          dlgroleedit_name_edt: "required"
        },
        messages:
        {
          dlgroleedit_name_edt: {required: "Введите название роли"}
        },
        errorPlacement: function(error, element)
        {
          error.appendTo(element.parent("td").next("td") );
        },
        errorClass: "invalid",
        errorElement: "em",
        highlight: function(element, errorClass) {
           $(element).fadeOut(function() {
             $(element).fadeIn(function() {validator_roles.focusInvalid();})
           })
        },
        onfocusout: false //воизбежание зацикленных перемещений между полями
      });

      editRoleDialog(id_role, is_edit);
    });
  }
  else
  { //уже загружено
    //alert('already loaded:'+ $("#dlgroleedit").html());
    validator_roles.resetForm(); //delete error messages
    editRoleDialog(id_role, is_edit);
  }
}


/****************************************************
/***************** Roles Options ********************
/****************************************************

/* ==================================================
                    Utils
================================================== */

// пример использования "Выбрано "+ n +" "+plural_form(n, 'роль', 'роли', 'ролей');
function plural_form(n, form1, form2, form5)
{
    n = Math.abs(n) % 100;
    n1 = n % 10;
    if (n > 10 && n < 20) return form5;
    if (n1 > 1 && n1 < 5) return form2;
    if (n1 == 1) return form1;
    return form5;
}

// добавление в массив как во множество (unique)
/*function push_unique_array(exist_array, add_array) {
    for (var j in add_array)
        if ($.inArray(add_array[j], exist_array) != -1) {
            break;
        }
        else
            exist_array.push(add_array[j]);
}*/

/* ==================================================
          Parsing options and Filling inputs
================================================== */

function parseExrRoleIdTr(tr) {
    //return $(tr).attr("id").substring(12);
    var m = $(tr).attr("id").match(/(\d*)$/);
    if (m != null)
        return m[1];
    else
        return null;
}

function parseTypeObjOptIdText(text) {
    var m = text.match(/^.*\((.*)\)$/);
    if (m != null)
        return m[1];
    else
        return null;
}

function parseTypeObjOptIdTr(tr, td_css_class) {
    return parseTypeObjOptIdText($(tr).find('td.'+td_css_class).text());
}

function parseTypeObjOptNameText(text) {
    var m = text.match(/^(.*) \(.*\)$/);
    if (m != null)
        return m[1];
    else
        return null;
}

function parseTypeObjOptNameTr(tr, td_css_class) {
    return parseTypeObjOptNameText($(tr).find('td.'+td_css_class).text());
}

//returns attrs=[{attr:'attr1', value:'value1'}, {attr:'attr2', value:'value2'}, ...]
function parseAttrsTr(tr, td_css_class) {
    var attrs_td = $(tr).find('td.'+td_css_class).text();
    var attrs=[], myArray=[], myRe = /(^| )([^=,]+)=([^=,{]+)({(.)?})?(,|$)/g;
    while ((myArray = myRe.exec(attrs_td)) != null) {
         attrs.push({attr: myArray[2], value: myArray[3], merge_symbol: myArray[5], merge_readonly: '0'});
    }
    //alert ('attrs='+arrayToString(attrs));
    return attrs;
}

function get_obj_name_from_tree(obj_id, opt_id) {
    var tr = $("#dlgroleoptions_tbl>tbody>tr").filter(
            function (index) {
                return obj_id == parseTypeObjOptIdTr(this, "obj")
                    && opt_id == parseTypeObjOptIdTr(this, "opt");
            }
    );
    return parseTypeObjOptNameTr(tr, "obj");
}

function get_option_name_from_tree(obj_id, opt_id) {
    var tr = $("#dlgroleoptions_tbl>tbody>tr").filter(
            function (index) {
                return obj_id == parseTypeObjOptIdTr(this, "obj")
                    && opt_id == parseTypeObjOptIdTr(this, "opt");
            }
    );
    return parseTypeObjOptNameTr(tr, "opt");
}

//показать filtered_users в input'е'
function fill_input_filtered_roles() {
    if (filtered_roles.length == 0)
      $("#dlgoptedit_roles_edt").val('');
    else if (filtered_roles.length == 1){
      $("#dlgoptedit_roles_edt").val(filtered_roles[0].role_name); //+ ' (' + filtered_roles[0].id_role + ')');
    } else {
      var out_text = '';
      for (var i in filtered_roles) {
        if (out_text)
          out_text = out_text + ', ';
        out_text = out_text + filtered_roles[i].role_name; //+ ' (' + filtered_roles[i].id_role + ')';
      }
      out_text = filtered_roles.length + ' ' + plural_form(filtered_roles.length, 'роль', 'роли', 'ролей')
          + ': ' + out_text;
      $("#dlgoptedit_roles_edt").val(out_text);
    }
}

//заполнить id и название объекта
//если source='from_tree', то название берётся из списка опций роли (в этом случае используется opt_id)
//если source='from_table', то название берётся из списка объектов по типу
function fill_inputs_filtered_object(obj_id, source, opt_id) {
    if (obj_id == null){
        $("#dlgoptedit_obj_id_edt").val('');
        $("#dlgoptedit_obj_name_edt").val('');
    }
    else {
        $("#dlgoptedit_obj_id_edt").val(obj_id);
        if (source == 'from_tree') //из таблицы списка опций
            $("#dlgoptedit_obj_name_edt").val(get_obj_name_from_tree(obj_id, opt_id));
        else //из таблицы списка объектов по типу
            $("#dlgoptedit_obj_name_edt").val($("#tbl_systems_objects_by_type>tbody>tr[id="+obj_id+"]>td.name").text());
    }
}

//заполнить edit переданным opt_id и именем, взятым из таблицы списка опций (source='from_table') или дерева (source='from_tree')
//если source='from_tree', то obj_id не используется
//если передано явно opt_name, то используется оно
function fill_input_filtered_option(opt_id, source, obj_id, opt_name) {
    if (opt_id == null){
        $("#dlgoptedit_opt_edt").val('');
    }
    else {
        if (source == 'from_tree'){ //из таблицы опций роли
            if (!opt_name)
                opt_name = get_option_name_from_tree(obj_id, opt_id);
            $("#dlgoptedit_opt_edt").val(opt_name + ' (' + opt_id + ')' );
        }
        //'from_table' - из таблицы-справочника опций
        else {
            if (!opt_name) {
                var html_table; //таблица с именами опций
                if ($("#tbl_systems_options").length == 0) {
                    //Загружаем список опций, если еще не использовались
                    $.ajax({
                        url: 'roles_options_dict',
                        dataType: 'html',
                        //data: {'give_me': 'bases'},
                        async: false,
                        success: function(html) {
                            html_table = $(html);
                        }
                    });
                }
                else
                    html_table = $("#tbl_systems_options");

                //заполнить edit с id и именем опции
            //$("#dlgoptedit_opt_edt").val($("#tbl_systems_options>tbody>tr[id="+opt_id+"]>td.name").text() + ' (' + opt_id + ')' );
                opt_name = html_table.find(">tbody>tr[id="+opt_id+"]>td.name").text();
            }
            $("#dlgoptedit_opt_edt").val(opt_name + ' (' + opt_id + ')' );
        }
    }
}

/* ==================================================
                    Dialog All Options
================================================== */

function roleOptionsDialog(){
   $("#dlgroleoptions_caption").html("Расширенные права роли <b>"+cur_role_name+"</b><br/><br/> по системе <b>" + cur_name_system + "</b> (id=" + cur_id_system + ")");

    //Features and Events
    $("#dlgroleoptions_tbl")
    //sortable
    .tablesorter({
                   // define a custom text extraction function
                   /* textExtraction: function(td) {
                        // extract data from markup and return it
                        if ($(':checkbox', $(td)).length)
                            return ($(':checkbox', $(td)).attr("checked")?'1':'0');
                        else
                            return td.innerHTML;
                    },*/
                    dateFormat:"dd.mm.yyyy",
                    widgets:['zebra'],
                    headers:{ 0:{sorter:"text"}, //Тип
                              1:{sorter:"text"}, //Объект
                              2:{sorter:"text"}, //Опция
                              3:{sorter:"text"}, //Атрибуты
                              4:{sorter:"text"} //Удалить
                              //5:{sorter:"digit"}, //Сортировка
                              //6:{sorter:"digit"}, //Срок действия (в днях)
                              //7:{sorter:"digit"}, //Напоминать за (дней)
                              //4:{sorter:"DateTimeWoSec"} //Изменено
                              //10:{sorter:"longDate"} //Дата тарифа
                              //10:{sorter:"DateTimeWoSec"} //Изменено
                              //11:{sorter:"DateTimeWoSec"}, //Изменено
                              /*1:{sorter:"digit"}, //ID
                              2:{sorter:"text"}, //SHOW_NAME
                              3:{sorter:"text"}, //REF_NAME
                              4:{sorter:"text"}, //FOLDER_NAME
                              */
                              //8:{sorter:"time"}, //CLASS_NAME
                              //10:{sorter:"text"}
                              /*6:{sorter:"text"}, //MODULE_NAME
                              //6:{sorter:"longDate"},
                              //7:{sorter:"DateTime"},
                              //7:{sorter:false}, //LOGO
                              //8:{sorter:"digit"}, //HIGHER
                              7:{sorter:"digit"}, //ID_BASE
                              8:{sorter:"digit"}, //СЛАТЬ
                              9:{sorter:"digit"}, //ID_MAIL
                              10:{sorter:"text"}, //ФОРМАТ Д/В
                              11:{sorter:"text"}, //ОПЦИИ
                              //13:{sorter:"digit"}, //ORDERBY
                              12:{sorter:"text"}, //DISABLED
                              13:{sorter:"DateTime"}, //LASTDATE
                              14:{sorter:"text"} //COMMENTS*/
                            }
                });
    //scroll
    //.Scrollable(300,'100%');
    //rowFocus
    //.rowFocus({'rfbody':'#tbl_layers_tbody'})
    //contextMenu
    //.bindContextMenu();
    //rowFocus

   // клик на опции переводит в её редактирование
   //$("#dlgroleoptions_tbl tr").css("cursor","pointer").unbind('click').click(function(){
   //    editOpt(true, cur_id_role, cur_role_name, this);
   //});

   // клик на кнопку Добавить опцию
   $("#dlgroleoptions_add_opt_btn").unbind('click').click(function(){
       //cur_id_role = null;
       //cur_role_name = null;
       editOpt(false);
   });
   // клик на кнопку Добавить опцию
   $("#dlgroleoptions_refresh_btn").unbind('click').click(function(){
       roleOptions();
   });

   // клик на "Удалить все опции" в хедере
   $("#dlgroleoptions_clear_all_options").unbind('click').click(function(){clearOpts();});

    //$("#dlgrights_rights_tbl > tbody > tr:nth-child(odd)").css("background-color", "#E6E6FA");

    //$("#dlgrights_form").get(0).reset();
    //$("#dlgrights_login_edt").focus().select();

   $("#dlgroleoptions").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgroleoptions_save_btn").click();}});

   // определение кнопок
   $("#dlgroleoptions_save_btn").unbind('click').click(function()
    {
      // валидируем
      // alert ('Проверить вышестоящие чекбоксы');
      // закрываем
      $("#dlgroleoptions").dialog("close");
    });

    // изменяем иконку в дереве систем-прав редактировать или добавлять опции
    $("#dlgroleoptions").unbind("dialogclose").bind("dialogclose", function(event, ui) {
       var $a;
       if ($("#dlgroleoptions_tbl>tbody>tr").length){
         $a = $('<a class="edit_role_options" title="Редактировать опции" href="javascript: void(0);"><img border=0 src="/ENGINE/images/actions/edit.png" style="background-color: transparent; vertical-align: middle"/></a>');
       } else {
         $a = $('<a class="add_role_options" title="Добавить опции" href="javascript: void(0);"><img src="/ENGINE/images/actions/add.png" style="vertical-align: middle"></a>');
       }
       $('#dlgrolerights_'+cur_id_system+'>td.edit_options_img').html($a);
       $a.unbind("click").click(function(){roleOptionsFull(this);});
    });

   // запуск диалога
   $("#dlgroleoptions").show().dialog("open");
   //$("#dlgrights_login_edt").focus().select();
   //$("#dlgroleoptions_tbl").Scrollable(325, '100%', {allwaysFullHeight: true});

   process_options_trs();
}

function roleOptionsFull(a){
      cur_id_system = $(a).closest('tr').attr('id').substring(14);
      cur_name_system = $.trim($('td[id^="dlgrolerights_show_name_"]', $(a).closest('tr')).text());

      // получить опции, описанные разработчиком в файле options.py
      $.ajax({
        url: "get_all_system_options",
        dataType: 'json',
        data: {id_system: cur_id_system},
        async: false,
        success: function(JSON) {
            options_list = [];
            for(var i=0; i<JSON.data.length; i++) {
                var item = JSON.data[i];
                options_list.push(item);

            }
        }
      });
      roleOptions();
}

function roleOptions(){
  //$("div.ui-dialog").remove(); //плагин dialog перемещает div'ы в конец body, поэтому load не очистит старые div'ы

  //всегда грузим для свежести данных
  //if ($("#dlgroleoptions").children().length == 0)
  //{ //ещё не загружено - инициализируем 1-й раз
    $("#dlgroleoptions").load("ajaxDlgRoleOptions_load", {id_role: cur_id_role, id_system: cur_id_system},
    function()
    {
        //Dialog Add/Edit options
        $("#dlgoptedit").dialog(
        {
          'autoOpen': false,
    //      title: 'Редактирование опции',
          modal: true,
          width: 600,
          height: 370,
          resizable: true,
          draggable: true,
          position: "center",
          overlay:{opacity:0.5, background:"black"}
        });

        //Dialog Select Users
        $("#dlgokcancel").dialog(
        {
          'autoOpen': false,
          //title: 'Выберите пользователей',
          modal: true,
          //width: 550,
          //height: 500,
          resizable: true,
          draggable: true,
          position: "center",
          overlay:{opacity:0.5, background:"black"}
        });

      roleOptionsDialog();
    });
  //}
  //else
  //{ //уже загружено
  //  roleOptionsDialog(id_system, system_name, cur_id_role, cur_role_name);
  //}
}

/* ==================================================
                    Dialog Add/Edit Options
================================================== */

//Fill fields & Show
function editOptDialog(is_edit, tr){
    if (is_edit){
        //var exr_role_id = parseExrRoleIdTr(tr);
        var type_id = parseTypeObjOptIdTr(tr, "type");
        var obj_id = parseTypeObjOptIdTr(tr, "obj");
        var obj_name = parseTypeObjOptNameTr(tr, "obj");
        var opt_id = parseTypeObjOptIdTr(tr, "opt");
        var attrs = parseAttrsTr(tr, "attrs");
    }
    //alert("id_role="+id_role);
    //alert("type_id="+type_id);

    //alert("obj_id="+obj_id);
    //alert("is_edit="+is_edit);
    // инициализация диалога
    $("div.rewrite_rule_check").hide();
    if (is_edit) {
      $('#dlgoptedit').dialog('option', 'title', _('Редактирование опции'));
      $("#dlgoptedit_type_cmb")
      .add("#dlgoptedit_obj_id_edt")
      .add("#dlgoptedit_select_obj_btn")
      .add("#dlgoptedit_opt_edt")
      .add("#dlgoptedit_select_opt_btn")
        .attr('disabled', 'disabled');
      //$("#dlgedit_old_id_edt").val(id_role);
      //$("#dlgedit_id_edt").val(id_role);
      //$("#dlgedit_role_cmb").val($("#role_"+id_role).text());
    }
    else {
      //$("#dlgedit_id_edt").removeAttr("disabled");
      $('#dlgoptedit').dialog('option', 'title', _('Добавление опции'));
      $("#dlgoptedit_form").get(0).reset();
      $("#dlgoptedit_tbl_attrs>tbody").empty();
      $("#dlgoptedit_type_cmb")
      .add("#dlgoptedit_obj_id_edt")
      .add("#dlgoptedit_select_obj_btn")
      .add("#dlgoptedit_opt_edt")
      .add("#dlgoptedit_select_opt_btn")
        .removeAttr('disabled');
      //set default role, type, obj
    }

    //alert('editOptDialog1');
    //roles
    filtered_roles = [];
    if (cur_id_role != null)
        filtered_roles.push({id_role: cur_id_role, role_name: cur_role_name});
    //показать filtered_roles в input
    fill_input_filtered_roles();
    //alert('editOptDialog2');

    $('#dlgoptedit_type_cmb option').removeAttr('selected');
    $('#dlgoptedit_type_cmb option[value="'+type_id+'"]').attr('selected','selected');

    //object
    fill_inputs_filtered_object(obj_id, 'from_tree', opt_id);

    fill_input_filtered_option(opt_id, 'from_tree', obj_id);

    //attrs - only on edit
    if (is_edit) {
        $("#dlgoptedit_tbl_attrs>tbody").html(build_attrs_trs(attrs));//.find(">tr").css("cursor","pointer").unbind('click').click(function(){editAttr(this, true);});;
    }
    process_attrs_trs(); //for 100 width

    $("#dlgoptedit_save_btn").unbind('click').bind("click", function(e)
    {
        // валидируем
        if (!$("#dlgoptedit_form").valid()) {
            //validator.focusInvalid();
            return;
        }

        //Режим перезаписи (удаления старых атрибутов) (по одному юзеру - всегда синхронизация (перезапись))
        var rewrite = (filtered_roles.length == 1 ? 1 : ($("#rewrite_rule_box").is(":checked") ? 1 : 0));
        var attrs_out = null;
        //цикл по таблице атрибутов
        $("#dlgoptedit_tbl_attrs>tbody>tr").each(function (i) {
                //формируем новые атрибуты = таблице атрибутов
                var merge_symbol = $(this).find("td.merge").text();

                if (attrs_out)
                    attrs_out = attrs_out + ', ' + $(this).attr('id') + '=' + $(this).attr('value')
                                + (merge_symbol && merge_symbol!='1' ? '{'+merge_symbol+'}' : '');
                else
                    attrs_out = $(this).attr('id') + '=' + $(this).attr('value')
                                + (merge_symbol && merge_symbol!='1' ? '{'+merge_symbol+'}' : '');
        });

        // добавляем в дерево
        //addOptToDb($("#dlgoptedit").data('is_edit'));
        addOptToDb(is_edit, $("#dlgoptedit_obj_id_edt").val(), $("#dlgoptedit_obj_name_edt").val(),
                   $("#dlgoptedit_type_cmb>option:selected").val(),
                   parseTypeObjOptIdText($("#dlgoptedit_opt_edt").val()),
                   parseTypeObjOptNameText($("#dlgoptedit_opt_edt").val()),
                   attrs_out, rewrite);

        // добавляем в affected_roles
        // по каждому выбранному role-у
        //push_unique_array(affected_roles, filtered_roles);
        //enable_save_button(1);
       // закрываем
        $("#dlgoptedit").dialog("close");

        //process_options_trs(); - в addOptToDb
    }); //dlgoptedit_save_btn click

    // запуск диалога
    $("#dlgoptedit").show().dialog("open");
    //обязательно после show dialog
    if ($.browser.msie) {
        $('#dlgoptedit .full_height').css('height', '92%');
    }
    //$("#dlgeoptdit_login_edt").focus().select();
    //alert('editOptDialog3 - after open');
}

function editOpt(is_edit, tr){
//  var id_role, type_id, obj_id, opt_id;
//  if (elem){
//    id_role=getCurIdUser(elem);
//    //alert("editOpt: id_role=" + id_role);
//    type_id=getCurTypeId(elem);
//    obj_id=getCurObjId(elem);
//    opt_id=getCurOptId(elem);
//  }

  //alert ('editUser is_edit='+is_edit+' id_role='+id_role+' elem='+elem);

  $("#dlgoptedit").data('is_edit', is_edit);
  if ($("#dlgoptedit").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
    $("#dlgoptedit").load('ajaxDlgRoleOptionsEdit_load',
      /*{id_role: id_role, type_id: type_id, obj_id: obj_id},*/
      function(){
        //alert('load doned:'+ $("#dlgedit").html());
          validator = $("#dlgoptedit_form").validate(
          {
            rules:
            {
              dlgoptedit_roles_edt: "required",
              dlgoptedit_type_cmb: "required",
              dlgoptedit_obj_id_edt: {required: true, obj_id: true},
              dlgoptedit_obj_name_edt: {required: true, obj_name: true},
              dlgoptedit_opt_edt: "required"
              //,dlgedit_admin_chk: "required"
              //,dlgedit_email_edt: {required: false, email: true}
              //,dlgedit_role_cmb: "required"
            },
            messages:
            {
              dlgoptedit_roles_edt: {required: _("Выберите роль(-и)")},
              dlgoptedit_type_cmb: {required: _("Выберите тип")},
              dlgoptedit_obj_id_edt: {required: _("Введите или выберите ID объекта")},
              dlgoptedit_obj_name_edt: {required: _("&nbsp;Введите или выберите Имя объекта")},
              dlgoptedit_opt_edt: {required: _("Выберите опцию")}
            },
            errorPlacement: function(error, element)
            {
              error.appendTo(element.closest("td"));
            },
            errorClass: "invalid",
            errorElement: "em",
            highlight: function(element, errorClass) {
               $(element).fadeOut(function(){
                 $(element).fadeIn(function() {validator.focusInvalid();})
               })
            },
            onfocusout: false //воизбежание зацикленных перемещений между полями
          }); //validate

          /*$.getJSON('ajaxListRoles',null,function (data){
             //alert(data);
             $("#dlgedit_role_cmb").empty()
                                   .append("<option value=''>Выберите...</option>");
                for (var i = 0; i < data.length; i++){
                  $("#dlgedit_role_cmb").append("<option value='"+data[i].ID_ROLE+"'>"+data[i].ROLE_NAME+"</option>");
                }
           });*/
          $("#dlgoptedit_tbl_attrs").tablesorter().find("thead>tr").css("cursor","pointer");

          // определение событий для dlgoptedit
          $("#dlgoptedit").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgoptedit_save_btn").click();}});
          $("#dlgoptedit_select_roles_btn").unbind('click').click(function(){selRoles();});
          $("#dlgoptedit_select_obj_btn").unbind('click').click(function(){selObject();});
          $("#dlgoptedit_select_opt_btn").unbind('click').click(function(){selOption();});
          $("#dlgoptedit_select_attrs_btn").unbind('click').click(function(){selAttrs();});

          $("#dlgoptedit_from_all_options").unbind("click").bind("click", function() {
              //alert('$("#dlgoptedit").data("is_edit")=' + $("#dlgoptedit").data('is_edit'));
              selFromAllOptions($("#dlgoptedit").data('is_edit'));
          });

          $("#dlgoptedit_clear_attrs").unbind('click').click(function(){clearAttrs();});
          //$("#dlgoptedit_tbl_attrs").rowFocus({'rfbody':'#dlgoptedit_tbl_attrs_tbody'}); - не пашеть
          $("#dlgoptedit_add_opt_btn").unbind('click').click(function(){editAttr(null, false);});

          $("#dlgoptedit_cancel_btn").unbind('click').click(function(){$("#dlgoptedit").dialog("close");});

          //editOptDialog(id_role, type_id, obj_id, opt_id, $("#dlgoptedit").data('is_edit'));
          //alert('editOptDialog первая ветвь(is_edit)='+is_edit);
          editOptDialog(is_edit, tr);
          //alert("editOpt before ширина кнопок dlgoptedit_type_cmb.html="+$("#dlgoptedit_type_cmb").html());
          //alert("editOpt before ширина кнопок dlgoptedit_select_roles_btn.html="+$("#dlgoptedit_select_roles_btn").html());
          //работает только после показа диалога
          $("#dlgoptedit_type_cmb").width($("#dlgoptedit_type_cmb").parent().innerWidth());
          $("#dlgoptedit_roles_edt").width($("#dlgoptedit_obj_name_edt").position().left+$("#dlgoptedit_obj_name_edt").width()-$("#dlgoptedit_roles_edt").position().left);
          $("#dlgoptedit_opt_edt").width($("#dlgoptedit_obj_name_edt").position().left+$("#dlgoptedit_obj_name_edt").width()-$("#dlgoptedit_opt_edt").position().left);

          $("#dlgoptedit_select_roles_btn").width($("#dlgoptedit_select_obj_btn").outerWidth());
          $("#dlgoptedit_select_opt_btn").width($("#dlgoptedit_select_obj_btn").outerWidth());

          //Dialog Add/Edit Attributes
          $("#dlgattredit").dialog(
          {
            'autoOpen': false,
    //        title: 'Редактирование аттрибута',
            modal: true,
            width: 400,
            height: 230,
            resizable: true,
            draggable: true,
            position: "center",
            overlay:{opacity:0.5, background:"black"}
          });

      //alert("editOpt after ширина кнопок");
    }); //$("#dlgoptedit").load
  }
  else
  { //уже загружено
    //alert('already loaded:'+ $("#dlgedit").html());
    validator.resetForm(); //delete error messages
    //alert('before editOptDialog loaded');
    //alert('editOptDialog короткая ветвь(is_edit)='+is_edit);
    editOptDialog(is_edit, tr);
    //alert('after editOptDialog loaded');
  }
}

/* ==================================================
            Save/Delete Options
================================================== */

function process_options_trs() {
    // удаление опции
    $("#dlgroleoptions_tbl>tbody>tr>td>a.dlgroleoptions_del_opt").unbind('click').click(function(e){
        delOpt(this);
        e.stopPropagation()
    });

    // клик на опции переводит в её редактирование
    $("#dlgroleoptions_tbl>tbody>tr").css("cursor","pointer").unbind('click').click(function(){
       //cur_id_role = getCurRole(this);
       //cur_role_name = getCurRoleName(this);
       editOpt(true, this);
    });

    //setCntOptions();
    $("#dlgroleoptions_tbl").trigger("update").Scrollable(325, '100%', {allwaysFullHeight: true});
}

function clearOpts() {
  if (!confirm ('Удалить все опции роли "'+cur_role_name+'" по системе "'+cur_name_system+' ('+cur_id_system+')"?'))
    return;

  $.getJSON('roles_del_all_opts', {id_role: cur_id_role, id_system: cur_id_system},
    function (data)
    {
      $("#dlgroleoptions_tbl>tbody").empty();
      //$("#dlgoptedit_tbl_attrs").tablesorter('refresh');
      process_options_trs();
    }
  );
}

function delOpt(elem) {
  var tr = $(elem).closest('tr');
  var opt_id = parseTypeObjOptIdTr(tr, "opt");
  var opt_name = parseTypeObjOptNameTr(tr, "opt");
  var exr_role_id = parseExrRoleIdTr(tr);

  if (!confirm ('Удалить опцию "'+opt_name+' ('+opt_id+')" роли "'+cur_role_name+'" по системе "'+cur_name_system+' ('+cur_id_system+')"?'))
    return;

  $.getJSON('roles_del_opt', {exr_role_id: exr_role_id},
    function (data)
    {
        $(elem).closest('tr').remove(); //.closest('table').tablesorter('refresh'); - не пашет
        //$("#dlgoptedit_tbl_attrs").tablesorter('refresh');
        process_options_trs();
    }
  );
}

function addOptToDb(is_edit, obj_id, obj_name, type_id, opt_id, opt_name,
                    attrs_imploded, rewrite) {
  // чисто id-шники ролей
  // нужен текстовый список одним аргументом
  // var roles = $.map(filtered_roles, function (dic){return dic["id_role"];});
  var roles = '';
  for (var i in filtered_roles) {
      if (roles)
        roles = roles + ',';
      roles = roles + filtered_roles[i]["id_role"]
  }
  //alert(type_id);
  //alert(type_name);
  //return;
  //async, т.к. закрывается диалог и не хочется терять набранное
  $.ajax({
    async: false,
    url: "roles_add_opt",
    dataType: 'json',
    data: {roles: roles,
           obj_id: obj_id, obj_name: obj_name, type_id: type_id,
           id_system: cur_id_system, opt_id: opt_id, attrs: attrs_imploded, rewrite: rewrite},
    success: function(JSON) {
      if (JSON.data.ERROR_CODE)
          alert('Ошибка при '+(is_edit?'редактировании':'добавлении')
                +' опции "'+opt_name+' ('+opt_id+')"'
                +' роли "'+cur_role_name+'":\n'+JSON.data.ERROR_MSG);
      else
      {
        //всегда перечитываем, т.к. может даже измениться obj_name на других строках таблицы
        /*if (is_edit && $.inArray(String(exr_role_id), roles)){
          // при редактировании исправляем строку, не перечитывая из БД
          var $tr = $("#exr_role_id_"+exr_role_id);
          $('td.type', $tr).text(type_name + ' (' + type_id + ')');
          $('td.obj', $tr).text(obj_name + ' (' + obj_id + ')');
          $('td.opt', $tr).text(opt_name + ' (' + opt_id + ')');
          $('td.attrs', $tr).text(attrs_imploded);
        } else {
        */  // при добавлении перечитываем из БД, т.к. возможен ввод существующей опции и соединение атрибутов
          $("#dlgroleoptions").dialog("close");
          roleOptions();
        //}
        process_options_trs();
      }
    }
  });
}

/* ==================================================
                    Dialog Select Roles
================================================== */

function selRolesDialog(){
    //$("#dlgokcancel_title").text('');
    $("#dlgokcancel_title").show().text(_('Выберите из списка'));

    //$.getJSON('systems_view_name', {view_tag: 'users'}, function(json){
        //$('#dlgokcancel').dialog('option', 'title', json.ext_data);
        $('#dlgokcancel').dialog('option', 'title', _('Роли'));
        //alert($("#dlgokcancel_title").text());
    //});
    //alert('selRolesDialog1');
    var bi;
    function store_filtered_roles(){
      filtered_roles = $.map(bi[0].biGetSelected(['id'], 'array'),
                             function (dic){return {id_role: dic["id"],
                                 role_name: $("#tbl_roles_roles>tbody>tr#"+dic["id"]+'>td.role_name').text()}; });
    }

    // инициализация диалога
    $("#dlgokcancel_content").html('<strong>'+_('Загрузка...')+'</strong>').load('roles_roles', function(){
        //alert('async load content');
        bi = $("#tbl_roles_roles").Scrollable(380, '100%').tablesorter().find("thead>tr").css("cursor","pointer").end().BoxIt({tdClass: 'hac'});

        //alert(filtered_users);
        //checked_rows = [];
        //for (var i in filtered_users){
        //  checked_rows.push(filtered_users[i]);
        //}
        //alert('map(filtered_roles)='+arrayToString($.map(filtered_roles, function (dic){return dic["id_role"];})));
        //alert(typeof(filtered_roles[0].id_role));
        bi[0].BoxItSelectRows($.map(filtered_roles, function (dic){return dic["id_role"];}));

        // скрываем фильтр
        //    $("#tbl_systems_users tfoot").hide();

        // определение кнопок
        $("#dlgokcancel_ok_btn").unbind('click').click(function()
        {
           store_filtered_roles();
           fill_input_filtered_roles();

           // закрываем
           $("#dlgokcancel").dialog("close");
           //alert('after dlgokcancel.close');
           if(filtered_roles.length > 1) {
                $("div.rewrite_rule_check").show();
                $("input#rewrite_rule_box").removeAttr("checked");
           } else {
                $("input#rewrite_rule_box").removeAttr("checked");
                $("div.rewrite_rule_check").hide();
           }

        }); //dlgoptedit_save_btn click
        //alert('after filtered_users, bind');
    });

    //alert('selRolesDialog2');

    // события
    $("#dlgokcancel").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgokcancel_ok_btn").click();}});

    // определение кнопок
    $("#dlgokcancel_cancel_btn").unbind('click').click(function(){$("#dlgokcancel").dialog("close");});

    if ($.browser.msie) {
        $( "#dlgokcancel" ).unbind( "dialogclose").bind( "dialogclose", function(event, ui) {
            $('#dlgoptedit_type_cmb').css('visibility', 'visible');
        });
    }

    // запуск диалога
    $("#dlgokcancel").show().dialog("open");
    //обязательно после show dialog
    if ($.browser.msie) {
        $('#dlgoptedit_type_cmb').css('visibility', 'hidden');
        $('#dlgokcancel .full_height').css('height', '446px');
    }

    //$("#dlgeoptdit_login_edt").focus().select();

    //alert('selRolesDialog3');
}

function selRoles() {
  //$('#dlgokcancel').dialog('option', 'title', 'Выберите из списка');
  $('#dlgokcancel').dialog('option', 'width', 550);
  $('#dlgokcancel').dialog('option', 'height', 500);

  //alert('selRoles1');
  if ($("#dlgokcancel").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
    $("#dlgokcancel").load('roles_okcancel', function(){
        selRolesDialog();
        //alert('after selRoles loaded2');
    });
  }
  else
  { //уже загружено
    selRolesDialog();
    //alert('after selRoles loaded');
  }
}

/* ==================================================
                    Dialog Select Object
================================================== */

function selObjectDialog(){
    $('#dlgokcancel').dialog('option', 'title', _('Объекты'));
    $("#dlgokcancel_title").show().text(_('Выберите из списка'));

    // инициализация диалога
    $("#dlgokcancel_content").html('<strong>'+_('Загрузка...')+'</strong>').load('roles_objects_by_type', {id_system: cur_id_system, obj_type: $("#dlgoptedit_type_cmb>option:selected").val()}, function(){
        //alert('async load content');
        $("#tbl_systems_objects_by_type").Scrollable(180, '100%').tablesorter().find("thead>tr").css("cursor","pointer");

        if ($("#dlgoptedit_obj_id_edt").val())
            $("input:radio").val([$("#dlgoptedit_obj_id_edt").val()]);
        else
            $("input:radio").val([$("input:radio:first").val()]);

        // определение кнопок
        $("#dlgokcancel_ok_btn").unbind('click').click(function()
        {
           //fill_input_filtered_users();
           var sel_object_id=$('input:radio[name=sel_object]:checked').val();

           fill_inputs_filtered_object(sel_object_id, 'from_table');

           // закрываем
           $("#dlgokcancel").dialog("close");
           //alert('after dlgokcancel.close');

        }); //dlgoptedit_save_btn click
        //alert('after filtered_users, bind');
    });

    //alert('selRolesDialog2');

    // события
    $("#dlgokcancel").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgokcancel_ok_btn").click();}});

    // определение кнопок
    $("#dlgokcancel_cancel_btn").unbind('click').click(function(){$("#dlgokcancel").dialog("close");});

    if ($.browser.msie) {
        $( "#dlgokcancel" ).unbind( "dialogclose").bind( "dialogclose", function(event, ui) {
            $('#dlgoptedit_type_cmb').css('visibility', 'visible');
        });
    }
    // запуск диалога
    $("#dlgokcancel").show().dialog("open");
    //обязательно после show dialog
    if ($.browser.msie) {
        $('#dlgoptedit_type_cmb').css('visibility', 'hidden');
        $('#dlgokcancel .full_height').css('height', '250px');
    }
    //$("#dlgeoptdit_login_edt").focus().select();

    //alert('selRolesDialog3');
}

function selObject() {
  //alert('selRoles1');
  //$('#dlgokcancel').dialog('option', 'title', 'Выберите из списка');
  $('#dlgokcancel').dialog('option', 'width', 550);
  $('#dlgokcancel').dialog('option', 'height', 300);

  if ($("#dlgokcancel").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз

    $("#dlgokcancel").load('roles_okcancel', function(){
        //$.getJSON('systems_view_name', {view_tag: 'users'}, function(json){
            //$("#dlgokcancel_title").show().text(json.ext_data);
            //alert($("#dlgokcancel_title").text());
        //});
        selObjectDialog();
        //alert('after selRoles loaded2');
    });
  }
  else
  { //уже загружено
    selObjectDialog();
    //alert('after selRoles loaded');
  }
}

/* ==================================================
                    Dialog Select Option
================================================== */

function selOptionDialog(){
    $("#dlgokcancel_title").text('');
    $("#dlgokcancel_title").show().text(_('Выберите из списка'));

    //$.getJSON('systems_view_name', {view_tag: 'options'}, function(json){
        $('#dlgokcancel').dialog('option', 'title', _('Опции'));
        //$('#dlgokcancel').dialog('option', 'title', json.ext_data);
        //alert($("#dlgokcancel_title").text());
    //});

    // инициализация диалога
    $("#dlgokcancel_content").html('<strong>'+_('Загрузка...')+'</strong>').load('roles_options_dict', function(){
        //alert('async load content');
        $("#tbl_systems_options").Scrollable(280, '100%').tablesorter().find("thead>tr").css("cursor","pointer");

        if ($("#dlgoptedit_opt_edt").val())
            $("input:radio").val([parseTypeObjOptIdText($("#dlgoptedit_opt_edt").val())]);
        else
            //$("input:radio").val([$("input:radio:first").val()])
            ;

        // определение кнопок
        $("#dlgokcancel_ok_btn").unbind('click').click(function()
        {
           //fill_input_filtered_users();
           var sel_opt_id=$('input:radio[name=sel_option]:checked').val();

           fill_input_filtered_option(sel_opt_id, 'from_table', null, $('#tbl_systems_options>tbody>tr#'+sel_opt_id).find('td.name').text());

           // закрываем
           $("#dlgokcancel").dialog("close");
           //alert('after dlgokcancel.close');

        }); //dlgoptedit_save_btn click
        //alert('after filtered_users, bind');
    });

    //alert('selRolesDialog2');

    // события
    $("#dlgokcancel").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgokcancel_ok_btn").click();}});

    // определение кнопок
    $("#dlgokcancel_cancel_btn").unbind('click').click(function(){$("#dlgokcancel").dialog("close");});

    if ($.browser.msie) {
        $( "#dlgokcancel" ).unbind( "dialogclose").bind( "dialogclose", function(event, ui) {
            $('#dlgoptedit_type_cmb').css('visibility', 'visible');
        });
    }
    // запуск диалога
    $("#dlgokcancel").show().dialog("open");
    //обязательно после show dialog
    if ($.browser.msie) {
        $('#dlgoptedit_type_cmb').css('visibility', 'hidden');
        $('#dlgokcancel .full_height').css('height', '346px');
    }
    //$("#dlgeoptdit_login_edt").focus().select();
    //alert('selRolesDialog3');
}

function selOption() {
  //alert('selRoles1');
  //$('#dlgokcancel').dialog('option', 'title', 'Выберите из списка');
  $('#dlgokcancel').dialog('option', 'width', 550);
  $('#dlgokcancel').dialog('option', 'height', 400);

  if ($("#dlgokcancel").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз

    $("#dlgokcancel").load('roles_okcancel', function(){
        //$.getJSON('systems_view_name', {view_tag: 'users'}, function(json){
            //$("#dlgokcancel_title").show().text(json.ext_data);
            //alert($("#dlgokcancel_title").text());
        //});
        selOptionDialog();
        //alert('after selRoles loaded2');
    });
  }
  else
  { //уже загружено
    selOptionDialog();
    //alert('after selRoles loaded');
  }
}

/* ==================================================
                    Working with Attributes
================================================== */

//gets attrs = [{attr:'attr1', value:'value1', merge_symbol: 'merge_symbol1', merge_readonly: '1'/'0'},
// {attr:'attr2', value:'value2', merge_symbol: 'merge_symbol2', merge_readonly: '1'/'0'}, ...]
//return html trs 1 or many
function build_attrs_trs(attrs) {
    var i, trs='';
    for (i in attrs)
        trs += '<tr id="'+attrs[i].attr+'" value="'+attrs[i].value
                +'" merge_readonly="'+attrs[i].merge_readonly
                +'">'
           + '<td class="hac">'+attrs[i].attr+'</td>'
           + '<td class="hac">'+attrs[i].value+'</td>'
           + '<td class="hac merge">'+(attrs[i].merge_symbol==undefined || attrs[i].merge_symbol == '1' ? '' : attrs[i].merge_symbol)+'</td>'
           + '<td class="hac"><a class="dlgoptedit_tbl_attrs_a_del" title="Удалить" href="#"><img src="'+eng_img+'/actions/delete.png" alt="'+_('Удалить')+'"/></a></td>'
           + '</tr>';
    return trs;
}

function process_attrs_trs() {
    $("#dlgoptedit_tbl_attrs>tbody>tr").css("cursor","pointer").unbind('click').click(function(){editAttr(this, true);});
    $("#dlgoptedit_tbl_attrs>tbody>tr>td>a.dlgoptedit_tbl_attrs_a_del").unbind('click').click(function(e){delAttr(this);e.stopPropagation()});
    $("#dlgoptedit_tbl_attrs").Scrollable(130, '100%').tablesorter('refresh');
}

function clearAttrs() {
    $("#dlgoptedit_tbl_attrs>tbody").empty();
    //$("#dlgoptedit_tbl_attrs").tablesorter('refresh');
    process_attrs_trs();
}

function delAttr(elem) {
    $(elem).closest('tr').remove(); //.closest('table').tablesorter('refresh'); - не пашет
    //$("#dlgoptedit_tbl_attrs").tablesorter('refresh');
    process_attrs_trs();
}

/* ==================================================
//                 Dialog Add/Edit Attributes
================================================== */

function editAttrDialog(attr_id, attr_value, merge_symbol, merge_readonly, is_edit) {
    // инициализация диалога
    if (is_edit) {
      $('#dlgattredit').dialog('option', 'title', _('Редактирование атрибута'));
      $("#dlgattredit_id_edt").val(attr_id);
      $("#dlgattredit_value_edt").val(attr_value)
      $("#dlgattredit_merge_symbol_edt").val(merge_symbol);
      if (merge_readonly == '1'){
        $("#dlgattredit_merge_symbol_edt").attr("disabled", "disabled");
      }
      else{
        $("#dlgattredit_merge_symbol_edt").removeAttr("disabled");
      }
    }
    else {
      $('#dlgattredit').dialog('option', 'title', _('Добавление атрибута'));
      $("#dlgattredit_form").get(0).reset();
      $("#dlgattredit_merge_symbol_edt").removeAttr("disabled");
        //set default user, type, obj
    }

    // определение событий
    $("#dlgattredit").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgattredit_save_btn").click();}});

    $("#dlgattredit_cancel_btn").unbind('click').click(function(){$("#dlgattredit").dialog("close");});
    $("#dlgattredit_save_btn").unbind('click').bind("click", {is_edit: is_edit}, function(e)
    {
        // валидируем
        if (!$("#dlgattredit_form").valid()) {
            //validator.focusInvalid();
            return;
        }

        // сохраняем id и value в dlgoptedit_tbl_attrs
        var id = $("#dlgattredit_id_edt").val();
        var tr = build_attrs_trs([{attr: id, value: $("#dlgattredit_value_edt").val(),
                                  merge_symbol: $("#dlgattredit_merge_symbol_edt").val(),
                                  merge_readonly: merge_readonly}]);
        if (!e.data.is_edit) {
            // удаляем дубликаты в существующих аттрибутах
            var existing_trs_ids = $.map($("#dlgoptedit_tbl_attrs>tbody>tr").get(), function (tr){return tr.getAttribute("id");}); //['attr1', 'attr2']

            for (var i in existing_trs_ids) {
                if (existing_trs_ids[i]==id) {
                    $("#dlgoptedit_tbl_attrs>tbody>tr#"+existing_trs_ids[i]).remove();
                    break;
                }
            }
            $("#dlgoptedit_tbl_attrs>tbody").append(tr);//.find(">tr").css("cursor","pointer").unbind('click').click(function(){editAttr(this, true);});
        }
        else {
            $("#dlgoptedit_tbl_attrs>tbody>tr#"+attr_id).replaceWith(tr);
            //$("#dlgoptedit_tbl_attrs>tbody").find(">tr").css("cursor","pointer").unbind('click').click(function(){editAttr(this, true);});
            //$("#dlgoptedit_tbl_attrs>tbody>tr>td>a.dlgoptedit_tbl_attrs_a_del").unbind('click').click(function(){delAttr(this);});
        }
        //$("#dlgoptedit_tbl_attrs").tablesorter('refresh');
        process_attrs_trs();

        // закрываем
        $("#dlgattredit").dialog("close");
    }); //dlgattredit_save_btn click

    if ($.browser.msie) {
        $( "#dlgattredit" ).unbind( "dialogclose").bind( "dialogclose", function(event, ui) {
            $('#dlgoptedit_type_cmb').css('visibility', 'visible');
        });
    }
    // запуск диалога
    $("#dlgattredit").show().dialog("open");
    //обязательно после show dialog
    if ($.browser.msie) {
        $('#dlgoptedit_type_cmb').css('visibility', 'hidden');
        $('#dlgattredit .full_height').css('height', '123px');
    }

    if (!is_edit)
        $("#dlgattredit_id_edt").get(0).focus();//.select();
    else
        $("#dlgattredit_value_edt").get(0).select();
}

function editAttr(elem, is_edit){
  var attr_id, attr_value, merge_symbol, merge_readonly;
  if (elem){
    attr_id=getCurAttrId(elem);
    attr_value=getCurAttrValue(elem);
    merge_symbol=getCurAttrMergeSymbol(elem);
    merge_readonly=getCurAttrMergeReadonly(elem);
  }

  //alert ('editUser is_edit='+is_edit+' id_user='+id_user+' elem='+elem);

  if ($("#dlgattredit").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
    //$("#dlgattredit").data('is_edit', is_edit);
    $("#dlgattredit").load('roles_dlgattredit',
      //{attr_id: attr_id, attr_value: attr_value, merge_symbol: merge_symbol, merge_readonly: merge_readonly},
      function(){
    //alert('load doned:'+ $("#dlgedit").html());
      validator_dlgattredit = $("#dlgattredit_form").validate(
      {
        rules:
        {
          dlgattredit_id_edt: {required: true, attr_id: true},
          dlgattredit_value_edt: {required: true, attr_value: true},
          dlgattredit_merge_symbol_edt: {merge_symbol: true}
        },
        messages:
        {
          dlgattredit_id_edt: {required: "<br>"+_("Введите или выберите имя параметра")},
          dlgattredit_value_edt: {required: "<br>"+_("Введите или выберите значение параметра")}
        },
        errorPlacement: function(error, element)
        {
          error.appendTo(element.closest("td"));
        },
        errorClass: "invalid",
        errorElement: "em",
        highlight: function(element, errorClass) {
           $(element).fadeOut(function(){
             $(element).fadeIn(function() {validator_dlgattredit.focusInvalid();})
           })
        },
        onfocusout: false //воизбежание зацикленных перемещений между полями
      });

       /*$.getJSON('ajaxListRoles',null,function (data){
         //alert(data);
         $("#dlgedit_role_cmb").empty()
                               .append("<option value=''>Выберите...</option>");
            for (var i = 0; i < data.length; i++){
              $("#dlgedit_role_cmb").append("<option value='"+data[i].ID_ROLE+"'>"+data[i].ROLE_NAME+"</option>");
            }
       });*/
      //$("#dlgoptedit_tbl_attrs").Scrollable(100, '100%').tablesorter().find("thead>tr").css("cursor","pointer").unbind('click').click(function(){editAttr(this, true);});

      editAttrDialog(attr_id, attr_value, merge_symbol, merge_readonly, is_edit);//$("#dlgattredit").data('is_edit'));
      //работает только после показа диалога
      /*$("#dlgoptedit_type_cmb").width($("#dlgoptedit_type_cmb").parent().innerWidth());
      $("#dlgoptedit_users_edt").width($("#dlgoptedit_obj_name_edt").position().left+$("#dlgoptedit_obj_name_edt").width()-$("#dlgoptedit_users_edt").position().left);
      $("#dlgoptedit_opt_edt").width($("#dlgoptedit_obj_name_edt").position().left+$("#dlgoptedit_obj_name_edt").width()-$("#dlgoptedit_opt_edt").position().left);

      $("#dlgoptedit_select_users_btn").width($("#dlgoptedit_select_obj_btn").outerWidth());
      $("#dlgoptedit_select_opt_btn").width($("#dlgoptedit_select_obj_btn").outerWidth());
      */
    });
  }
  else
  { //уже загружено
    //alert('already loaded:'+ $("#dlgedit").html());
    validator_dlgattredit.resetForm(); //delete error messages
    //alert('before editOptDialog loaded');
    editAttrDialog(attr_id, attr_value, merge_symbol, merge_readonly, is_edit);
    //alert('after editOptDialog loaded');
  }
}

/* ==================================================
// Dialog Select Attributes (атрибуты из аналогичных у опции)
================================================== */

function selAttrsDialog(){
    $('#dlgokcancel').dialog('option', 'title', _('Атрибуты'));
    $("#dlgokcancel_title").show().text(_('Выберите из списка'));
    /*$.getJSON('systems_view_name', {view_tag: 'users'}, function(json){
        $("#dlgokcancel_title").show().text(json.ext_data);
        //alert($("#dlgokcancel_title").text());
    });*/
    var bi;

    // инициализация диалога
    $("#dlgokcancel_content").html('<strong>'+_('Загрузка...')+'</strong>').load('roles_attrs',
        {id_system: cur_id_system,
         obj_id: $('#dlgoptedit_obj_id_edt').val(),
         opt_id: parseTypeObjOptIdText($('#dlgoptedit_opt_edt').val())
        },
        function(){
            //alert('async load content');
            bi = $("#tbl_roles_attrs").Scrollable(280, '100%').tablesorter().find("thead>tr").css("cursor","pointer").end().BoxIt({tdClass: 'hac'});

            //bi[0].BoxItSelectRows(filtered_users);

            // определение кнопок
            $("#dlgokcancel_ok_btn").unbind('click').click(function()
            {
                //сохраняем неповторяющиеся выбранные опции в dlgoptedit_tbl_attrs
                var candidates_dupl = bi[0].biGetSelected(['id', 'value', 'merge_symbol'], 'array'); //[{id:'attr1', value:'value1', merge_symbol: 'merge_symbol1'}, ...]
                var existing_trs_ids = $.map($("#dlgoptedit_tbl_attrs>tbody>tr").get(), function (tr){return tr.getAttribute("id");}); //['attr1', 'attr2']

                //удаление дубликатов из candidates_dupl в candidates по attr - берём первый + заменяем ключи id на attr для build_attrs_trs
                var candidates = [], done = {};// candidates = [{attr:'attr1', value:'value1', merge_symbol: 'merge_symbol1'}, ...]
                for (var i=0, length=candidates_dupl.length; i<length; i++) {
                    var id = candidates_dupl[i].id;
                    if (!done[id]) {
                        done[id] = true;
                        candidates.push({attr: id, value: candidates_dupl[i].value,
                                         merge_symbol: candidates_dupl[i].merge_symbol, merge_readonly: '0'
                        });
                    }
                    else
                        alert(_('Выбраны противоречивые значения аттрибута')+' "'+id+'", '+_('используем первое')+' ('+$.grep(candidates, function(el, ind){return id==el.attr;})[0].value+')');
                }
                //удаление дубликатов из candidates, совпадающих по attr с существующими existing_trs_ids
                for (var i in existing_trs_ids) {
                    for (var j in candidates)
                        if (existing_trs_ids[i]==candidates[j].attr) {
                            var old_val = $('#dlgoptedit_tbl_attrs>tbody>tr#'+existing_trs_ids[i]).attr('value');
                            var new_val = candidates[j].value;
                            var new_merge_symbol = candidates[j].merge_symbol;
                            // если совпадает - удаляем, а добавляем после цикла только новые
                            candidates.splice(j, 1);
                            if (old_val != new_val && confirm(_('Заменить у атрибута')+' "'+existing_trs_ids[i]+'" '+_('существующее значение')+' "'+old_val
                                +'" '+_('на новое')+' "'+new_val+'"?'))
                                    $("#dlgoptedit_tbl_attrs>tbody>tr#"+existing_trs_ids[i]).replaceWith(
                                        build_attrs_trs([{attr: existing_trs_ids[i], value: new_val,
                                        merge_symbol: new_merge_symbol, merge_readonly: '0'}]));
                                    //$("#dlgoptedit_tbl_attrs>tbody>tr#"+existing_trs_ids[i]).remove();
                            //else
                            //    candidates.splice(j, 1);
                            break;
                        }
                }
                $("#dlgoptedit_tbl_attrs>tbody").append(build_attrs_trs(candidates));//.find(">tr").css("cursor","pointer").unbind('click').click(function(){editAttr(this, true);});
                //$("#dlgoptedit_tbl_attrs>tbody>tr>td>a.dlgoptedit_tbl_attrs_a_del").unbind('click').click(function(){delAttr(this);});
                //$("#dlgoptedit_tbl_attrs").tablesorter('refresh');
                process_attrs_trs();

                // закрываем
                $("#dlgokcancel").dialog("close");
            }); //dlgoptedit_save_btn click
        }
    );

    //alert('selRolesDialog2');

    // события
    $("#dlgokcancel").unbind('keypress').keypress(function(e){if(e.keyCode==13){$("#dlgokcancel_ok_btn").click();}});

    // определение кнопок
    $("#dlgokcancel_cancel_btn").unbind('click').click(function(){$("#dlgokcancel").dialog("close");});

    if ($.browser.msie) {
        $( "#dlgokcancel" ).unbind( "dialogclose").bind( "dialogclose", function(event, ui) {
            $('#dlgoptedit_type_cmb').css('visibility', 'visible');
        });
    }
    // запуск диалога
    $("#dlgokcancel").show().dialog("open");
    //обязательно после show dialog
    if ($.browser.msie) {
        $('#dlgoptedit_type_cmb').css('visibility', 'hidden');
        $('#dlgokcancel .full_height').css('height', '343px');
    }

    //$("#dlgeoptdit_login_edt").focus().select();

    //alert('selRolesDialog3');
}

function selAttrs() {
  if (!$("#dlgoptedit_obj_id_edt").val()) {
    alert(_('Введите или выберите ID объекта для поиска опций этого объекта'));
    return;
  }

  if (!$("#dlgoptedit_opt_edt").val()) {
    alert(_('Выберите опцию для поиска атрибутов аналогичных опций'));
    return;
  }

  //if (!$("#dlgoptedit_type_cmb>option:selected").val()) {
  //  alert(_('Выберите тип объекта для поиска опций объекта этого типа'));
  //  return;
  //}

  //$('#dlgokcancel').dialog('option', 'title', 'Выберите из списка');
  $('#dlgokcancel').dialog('option', 'width', 550);
  $('#dlgokcancel').dialog('option', 'height', 400);

  //alert('selRoles1');
  if ($("#dlgokcancel").children().length == 0)
  { //ещё не загружено - инициализируем 1-й раз
    $("#dlgokcancel").load('roles_okcancel', function(){
        selAttrsDialog();
        //alert('after selRoles loaded2');
    });
  }
  else
  { //уже загружено
    selAttrsDialog();
    //alert('after selRoles loaded');
  }
}

function selFromAllOptions(is_edit) {
    $("div#dlgfromopts")
        .attr("title",_("Выберите опцию из списка"))
        .dialog({

            "autoOpen": false,
            modal: true,
            width: 700,
            height: 430,
            resizeable: true,
            draggable: true
        }
    );

    //Диалог и его html
    var dlg = $("div#dlgfromopts");
    var html = '<div class="full_height">';

    //Таблица опций
    html += '<h2 class="header">'+_('Опции')+'</h2>';
    html += "<table id='tbl_dev_options' width='100%' class='flora' style='width: 100%;'><thead><tr><th>"+_("Тип")+"</th><th>"+_("ID объекта")+"</th><th>"+_("Название объекта")+"</th><th>"+_("ID опции")+"</th><th>"+_("Название опции")+"</th></tr></thead><tbody id='tbl_dev_options_tbody'>";
    var options_filled = false;
    if(options_list.length == 0) {
        html+= "<tr class='cheat'><td colspan='100'><center>"+_("Разработчик не определил опций")+"</center></td></tr>";
    } else {
        //перечитаем имена опций
        var html_table; //таблица с именами опций
        if ($("#tbl_systems_options").length == 0) {
            //Загружаем список опций, если еще не использовались
            $.ajax({
                url: 'roles_options_dict',
                dataType: 'html',
                //data: {'give_me': 'bases'},
                async: false,
                success: function(html) {
                    html_table = $(html);
                }
            });
        }
        else
            html_table = $("#tbl_systems_options");

        //заполнить edit с id и именем опции
        //$("#dlgoptedit_opt_edt").val($("#tbl_systems_options>tbody>tr[id="+opt_id+"]>td.name").text() + ' (' + opt_id + ')' );
        for(var i=0; i<options_list.length; i++) {
            var item = options_list[i];
            // если находимся в форме радактирования, то отображаем лишь соответствующие объект и опцию
            if (!is_edit || ($("input#dlgoptedit_obj_id_edt").val() == item.OBJECT_ID
                             && parseTypeObjOptIdText($("#dlgoptedit_opt_edt").val()) == item.OPTION)) {
                html += "<tr type='"+item.TYPE+"' object='"+item.OBJECT_ID+"' objname='"+item.OBJECT_NAME+"' option='"+item.OPTION+"'>"+
                            "<td>"+item.TYPE+"</td><td>"+item.OBJECT_ID+"</td><td>"+item.OBJECT_NAME+"</td><td>"+item.OPTION+"</td>"+
                            "<td class='opt_name'>"+html_table.find(">tbody>tr[id="+item.OPTION+"]>td.name").text()+"</td>"+
                            "</tr>";
                options_filled = true;
            }
        }
        if (!options_filled) {
            html+= "<tr class='cheat'><td colspan='100'><center>"
                +'Отсутствует опция "' + $("#dlgoptedit_opt_edt").val()
                   +'" по объекту "' + $("#dlgoptedit_obj_name_edt").val() + ' (' + $("#dlgoptedit_obj_id_edt").val() + ')"'
                +"</center></td></tr>";
        }
    }

    html += "</tbody></table><br/>";

    //Таблица атрибутов, сразу пустая
    html += '<h2 class="header">'+_('Атрибуты')+'</h2>';
    html += '<form id="dlgfromopts_form" name="dlgfromopts_form">';
    html += "<table id='tbl_dev_attrs' width='100%' class='flora' style='width: 100%;'><thead><tr><th>"+_("Имя")+"</th><th>"+_("Описание")+"</th><th>"+_("Допустимые значения")+"</th><th>"+_("Значение")+"</th><th>"+_("Слияние")+"</th></tr></thead><tbody>";
    html += "</tbody></table></form><br>";

    //Закрывыем div full_height
    html += '</div>';

    //кнопки
    //html += "<div class='buttons' style='position: absolute; right: 10px; bottom: 10px;'>"+
    //        "<button class='cancel button'><img src='"+eng_img+"/actions/cancel.png' />&nbsp;"+_("Закрыть")+"</button></div>";
    html += '<div class="buttons save footer_btns right_aligned_btns">'+
    '<button type="button" id="dlgfromopts_select_btn"><img src="'+eng_img+'/actions/accept.png" alt=""/>&nbsp;'+_('Выбрать')+'</button>&nbsp;'+
    '<button type="button" id="dlgfromopts_cancel_btn"><img src="'+eng_img+'/actions/cancel.png" alt=""/>&nbsp;'+_('Отмена')+'</button>'+
    '</div>';

    //добавляем в DOM
    dlg.html(html);

    //Добавляем поведение

    //Таблица опций
    $('#tbl_dev_options')
        //.Scrollable(100,'100%')
        //.find('tbody>tr').unbind('click').click(function() {
        .rowFocus({'rfbody':'#tbl_dev_options_tbody',
            'rfFocusCallBack':function()
            {
                var $tr = $("#tbl_dev_options").rf$GetFocus();

                //Чистим detail-body атрибутов
                var detail_tbody = $("#tbl_dev_attrs>tbody");
                detail_tbody.empty();

                var master_tbody = $(this).parent('tbody');
                var row_index = master_tbody.children('tr').index(this);

                var attrs_list = (options_filled && options_list[row_index] && options_list[row_index].ATTRIBUTES ? options_list[row_index].ATTRIBUTES : null);
                /*'ATTRIBUTES': {'attr1': {'ID': 'attr_name1',
                                         'DESCRIPTION': 'Описание атрибута1 опции code_wares очень очень очень очень очень очень очень очнеь очень очень очень очень очень длинное',
                                         'ALLOWED_VALUES': 'число от 1 до 1000000',
                                         'DEFAULT': '',
                                         'REGEXP': r'^(\d{0,6}|1000000)$',
                                         'MERGE': '1'},
                                'attr2': {'ID': 'attr_name2',
                                         'DESCRIPTION': 'Описание атрибута2 опции code_wares очень очень очень очень очень очень очень очнеь очень очень очень очень очень длинное',
                                         'ALLOWED_VALUES': '0 или 1',
                                         'DEFAULT': '0'},
                                'attr3': {'ID': 'attr_name3',
                                         'DESCRIPTION': 'Описание атрибута3 опции code_wares очень очень очень очень очень очень очень очнеь очень очень очень очень очень длинное',
                                         'ALLOWED_VALUES': 'строка "ВасЯ" или "Петя"',
                                         'DEFAULT': 'Вася'},
                                'attr3': {'ID': 'attr_name3',
                                         'DESCRIPTION': 'Описание атрибута4 опции code_wares очень очень очень очень очень очень очень очнеь очень очень очень очень очень длинное',
                                         'ALLOWED_VALUES': 'строка с допустимым текстом',
                                         'DEFAULT': ''}
                               }*/

                //Опция не имеет атрибутов
                if(!attrs_list || !attrs_list.length || attrs_list.length == 0) {
                    detail_tbody.append("<tr class='cheat'><td colspan='100'><center>"+_("Опция не имеет атрибутов")+"</center></td></tr>");
                } else {

                    //Массивы для валидатора
                    var rules = {};
                    //var messages = {};

                    for(var attr in attrs_list) {
                        var item = attrs_list[attr];

                        //ID обязательно
                        if (!item.ID)
                            continue;
                        item.DESCRIPTION = (item.DESCRIPTION == undefined ? '' : item.DESCRIPTION);
                        item.ALLOWED_VALUES = (item.ALLOWED_VALUES == undefined ?'' : item.ALLOWED_VALUES);
                        item.DEFAULT = (item.DEFAULT == undefined ? '' : item.DEFAULT);
                        item.MERGE = ((item.MERGE == undefined || item.MERGE == '1') ? '' : item.MERGE);
                        // REGEXP проверяется дальше на истинность (false(False в python), '', undefined(нет ключа REGEXP) или null(None))

                        detail_tbody.append("<tr>"
                            +"<td class='attr-id'>"+item.ID+"</td><td>"+item.DESCRIPTION+"</td>"
                            +"<td>"+item.ALLOWED_VALUES+"</td>"
                            +"<td><input id='attr-defvalue-"+item.ID+"' name='attr-defvalue-"+item.ID
                                +"' class='attr-defvalue' type='text' size='40' value='"+item.DEFAULT+"'></td>"
                            +"<td><input disabled id='attr-merge-"+item.ID+"' name='attr-merge-"+item.ID
                                +"' class='attr-merge' type='text' size='2' value='"+item.MERGE+"'></td>"+
                            //"<td class='attr-id'>"+item.ID+"</td><td>"+item.DESCRIPTION+"</td><td>"+item.ALLOWED_VALUES+"</td><td><input class='attr-defvalue' type='text' size='40' value='"+item.DEFAULT+"'></td>"+
                        "</tr>");

                        //Системным требованиям всегда соответствие
                        rules["attr-defvalue-"+item.ID] = {};
                        rules["attr-defvalue-"+item.ID]['attr_value'] = true;

                        //если определено REGEXP, то ДОПОЛНИТЕЛЬНО определяем правило
                        if (item.REGEXP){
                            $("#attr-defvalue-"+item.ID).data("regexp", item.REGEXP);
                            $.validator.addMethod("attr_custommethod_"+item.ID, function(value, element) {
                                //нет возможности удалить метод, поэтому нужно вручную устанавливать и проверять на null
                                if ($(element).data("regexp"))
                                    return !value || new RegExp($(element).data("regexp")).test(value);
                                else
                                    return true;
                            }, "<br>"+_("Неверное значение атрибута"));

                            rules["attr-defvalue-"+item.ID]['attr_custommethod_'+item.ID] = true;

                            //messages["attr-defvalue-"+item.ID]['attr_customvalue_'+item.ID] = "<br>"+_("Неверное значение атрибута")};
                            // messages для rule='attr+value' определены в методе attr_value
                        }
                        else
                            $("#attr-defvalue-"+item.ID).data("regexp", null);
                    }

                    validator_dlgfromopts = $("#dlgfromopts_form").validate(
                    {
                        rules: rules,
                        //messages: messages,
                        /*rules:
                        {
                          dlgattredit_value_edt: {required: true, attr_value: true}
                        },
                        messages:
                        {
                          //dlgattredit_value_edt: {required: "<br>"+_("Введите или выберите значение атрибута")}
                          '.attr-defvalue': {required: "<br>"+_("Введите или выберите значение атрибута")}
                        },*/
                        errorPlacement: function(error, element)
                        {
                          error.appendTo(element.closest("td"));
                          //error.appendTo(element);
                        },
                        errorClass: "invalid",
                        errorElement: "em",
                        highlight: function(element, errorClass) {
                           $(element).fadeOut(function(){
                             $(element).fadeIn(function() {validator_dlgfromopts.focusInvalid();})
                           })
                        },
                        onfocusout: false //воизбежание зацикленных перемещений между полями
                   });
                   //$.validator.addClassRules("attr-defvalue", {required: true, attr_value: true});
                   //.addClassMessages("attr-defvalue", {required: "<br>"+_("Введите или выберите значение атрибута")})
                   //;
                   //$.validator.addClassRules("customer", { cRequired: true, cMinlength: 2 });
                   //setTimeout("$('input[id^=attr-defvalue]').get(0).focus().select()", 0); //обычный вызов говорит, что input'а нет
                   $('input[id^=attr-defvalue]:eq(0)').focus().select();
                }
                $('#tbl_dev_attrs').Scrollable(230,'100%'); //вешаем здесь, иначе остаётся полоса слева от таблички

          } //rfFocusCallBack
        }) //rowFocus

        .Scrollable(100,'100%'); //tbl_dev_options

    $("#tbl_dev_options>tbody>tr").css("cursor","pointer");

    //$('#tbl_dev_attrs')
    //    .Scrollable(230,'100%');

    $("#dlgfromopts_cancel_btn").unbind("click").bind("click", function() {
        dlg.dialog("close");
    });

    // для отмены обработки submit - у нас своя обработка, submit нужен лишь для валидации
    /*$("#dlgfromopts_form").submit(function(){
        console.log('submit called');
        return false;
    });*/

    $("#dlgfromopts_select_btn").unbind("click").bind("click", function(e){

        //$("#dlgfromopts_form").submit();//для валидации
        // валидируем
        if (!$("#dlgfromopts_form").valid()) {
            //validator.focusInvalid();
            return;
        }

        //e.preventDefault();
        var $tr = $("#tbl_dev_options").rf$GetFocus();
        //ничего не выбрано
        if (!options_filled || !$tr.length) {
            //validator.focusInvalid();
            dlg.dialog("close");
            return;
        }

        $("select#dlgoptedit_type_cmb option[value="+$tr.attr("type")+"]").attr("selected","selected");
        $("input#dlgoptedit_obj_id_edt").val($tr.attr("object"));
        $("input#dlgoptedit_obj_name_edt").val($tr.attr("objname"));
        fill_input_filtered_option($tr.attr("option"), "from_table", null, $tr.find('td.opt_name').text());

        //заполняем таблицу новых атрибутов (добавляем параметры в конец)
        //var attrs=[]; //attrs=[{attr:'attr1', value:'value1'}, {attr:'attr2', value:'value2'}, ...]
        if ($("#dlgoptedit_tbl_attrs>tbody>tr").length)
            if (confirm(_('Удалить уже введённые атрибуты опции перед добавлением новых? Отмена - объединение.')))
                $("#dlgoptedit_tbl_attrs>tbody").empty();

        //по каждому заполненному атрибуту, определенному разработчиками
        $("#tbl_dev_attrs>tbody>tr").each(function(){
            if (!$(this).find('>td>input').val())
                return true;
            //attrs.push({attr : $(this).find('td.attr-id').text(), value : $(this).find('input.attr-defvalue').val()});

            // сохраняем id и value в таблицу будущих атрибутов dlgoptedit_tbl_attrs
            var id = $(this).find('td.attr-id').text();
            var value = $(this).find('input.attr-defvalue').val();
            var merge_symbol = $(this).find('input.attr-merge').val();
            var tr = build_attrs_trs([{attr: id, value: value, merge_symbol: merge_symbol, merge_readonly: '1'}]); //html trs

            // удаляем дубликаты в существующих аттрибутах

            // получаем существующие id атрибутов
            var existing_trs_ids = $.map($("#dlgoptedit_tbl_attrs>tbody>tr").get(), function (tr){return tr.getAttribute("id");}); //['attr1', 'attr2']

            var found = false;
            for (var i in existing_trs_ids) {
                if (existing_trs_ids[i] == id) {
                    found = true;
                    $("#dlgoptedit_tbl_attrs>tbody>tr#"+id).replaceWith(tr);
                    break;
                }
            }
            if (!found)
                $("#dlgoptedit_tbl_attrs>tbody").append(tr);//.find(">tr").css("cursor","pointer").unbind('click').click(function(){editAttr(this, true);});

        });
        //$("#dlgoptedit_tbl_attrs>tbody").append(build_attrs_trs(attrs));
        //$("#dlgoptedit_tbl_attrs").Scrollable();
        //$("#dlgoptedit_tbl_attrs").tablesorter('refresh');
        process_attrs_trs();

        dlg.dialog("close");
    });

    $('#tbl_dev_options>tbody>tr:first').click();
    //dlg.bind("dialogopen", function(event, ui) {
        //setTimeout("$('input[id^=attr-defvalue]').get(0).focus();$('input[id^=attr-defvalue]').get(0).select()", 0);
        setTimeout("$('input[id^=attr-defvalue]:eq(0)').focus().select();", 0);
    //});
    dlg.dialog("open");
}
