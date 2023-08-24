;
(function ($) {
    $.datepicker.setDefaults($.extend($.datepicker.regional['ru']));

    var validator = {}; // объект плугина "validator"
    $.validator.addMethod("typeId", function(value, element) {
        return value != 'unselected';
    }, "&nbsp;"+_("Отсутсвуют типы оборудования выбранного вида"));

    $(
        function () {
            $("#dlgadd").dialog({
              'autoOpen': false,
        //      title: '',
              modal: true,
              width: 460,
              height: 250,
              resizable: true,
              draggable: true,
              position: "center",
              overlay:{opacity:0.5, background:"black"}
            });

            $("#dlgTypes").dialog({
              'autoOpen': false,
        //      title: '',
              modal: true,
              width: 400,
              height: 250,
              resizable: true,
              draggable: true,
              position: "center",
              overlay:{opacity:0.5, background:"black"},
              closeOnEscape: false
            });

            $("#dlgaddType").dialog({
              'autoOpen': false,
        //      title: '',
              modal: true,
              width: 460,
              height: 150,
              resizable: true,
              draggable: true,
              position: "center",
              overlay:{opacity:0.5, background:"black"}
            });

            //view
            //$("#tbl_equipment tr").css("cursor","pointer");

            //Events
            //$("#brefresh").click(function(){loadEquipments();});
            //$("#badd").click(function(){addEquip(undefined, false)});

            //Действия
            loadEquipments();
        }
    );

    //на вновь добавленный tr не вешается автоматом
    $.fn.bindContextMenu = function () {
        this.find(">tbody>tr").contextMenu({menu: 'menuEquip'},
            function (action, el, pos) {
                if (action == 'addEquip') {
                    addEquip(undefined, false);
                }
                else if (action == 'editEquip') {
                    //получить cur
                    addEquip(el, true);
                }
                else if (action == 'delEquip') {
                    delEquip(el);
                }
                else if (action == 'deactivateEquip') {
                    deactivateEquip(el);
                }
                else if (action == 'refreshEquip') {
                    loadEquipments();
                }
                else if(action=='closeSession') {
                    closeSession(el);
                }
            });
        return this;
    };

    //на вновь добавленный tr не вешается автоматом
    $.fn.bindContextMenuTypes = function () {
        this.find(">tbody>tr").contextMenu({menu: 'menuTypes'},
            function (action, el, pos) {
                if (action == 'addType') {
                    addType(undefined, false);
                }
                else if (action == 'editType') {
                    //получить cur
                    addType(el, true);
                }
                else if (action == 'delType') {
                    delType(el);
                }
                else if (action == 'refreshType') {
                    types();
                }
            });
        return this;
    };

    function getCurEquipName(elem) {
        return $(elem).closest("tr").find('td.equip_name').text();
    }

    function getCurEquip(elem) {
        return $(elem).closest("tr").attr('id');
    }

    function getCurTypeName(elem) {
        return $(elem).closest("tr").find('td.type_name').text();
    }

    function getCurType(elem) {
        return $(elem).closest("tr").attr('id_type');
    }

    function enum_equip() {
        $("#tbl_equipment > tbody > tr > td.enum").each(function (index) {
            $(this).text(index + 1);
        });
    }

//loads equipment list
    function loadEquipments(){
        $.blockUI({message: '<h1>'+_('Поиск оборудования...')+'</h1>'});
        //Сохраняем после перезагрузки
        var stEq = $('#stEq').val();
        var equipKndFilter = $('#equipKndFilter').val();
        var equipStatus = $('#equipStatus').val();

        $("#content").load('equipment_equipment', function () {
            //Features and Events
            $("#tbl_equipment")
            //sortable
            .tablesorter({ dateFormat:"dd.mm.yyyy",
                            widgets:['zebra'],
                            headers:{ 0: {sorter:"digit"}, //в„– Рї/Рї
                                      1: {sorter:"text"}, //Название
                                      2: {sorter: "text"}, //Статус
                                      3: {sorter:"text"}, //Серийный номер
                                      4: {sorter:"digit"}, //Регистрационный номер
                                      5: {sorter:"text"}, //Тип оборудования
                                      6: {sorter:"text"}, //ФИО сотрудника
                                      7: {sorter:"DateTimeWoSec"} //Работает с
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
            $('#stEq, #equipKndFilter, #equipStatus').unbind('change').change(function () {
                var stEq = $('#stEq').val();
                var equipKndFilter = $('#equipKndFilter').val();
                var equipStatus = $('#equipStatus').val();
                //var pr = $('#stPr').val();
                var kolvo = $('#tbl_equipment>tbody>tr').show().length;
                $('#tbl_equipment>tbody>tr').each(function () {
                    if ((stEq == 1 && !($(this).find('td.begin_time').text()))
                        || (stEq == 0 && $(this).find('td.begin_time').text())
                        || (equipKndFilter == 'T' && $(this).find('td.equip_kind').attr('equip_kind') == 'M')
                        || (equipKndFilter == 'M' && $(this).find('td.equip_kind').attr('equip_kind') == 'T')
                        || (equipStatus == 'A' && $(this).find('td.equip_status').hasClass('equip_inactive'))
                        || (equipStatus == 'N' && $(this).find('td.equip_status').hasClass('equip_active'))
                       ){
                        $(this).hide();
                        --kolvo;
                    }
                });
                //$('#tblBadWares').kTblScroll();
                $('#thAmountEquip').text(kolvo);
                $("#tbl_equipment").kScrollableToDown();
            });

            $('#stEq').val(stEq);
            $('#equipKndFilter').val(equipKndFilter);
            $('#equipStatus').val(equipStatus);
            $('#stEq').change();

            $("#tbl_equipment")
            //scroll
            .kScrollableToDown({width: '100%', widths: {0: '80px', 2: '52px', 4: '80px', 5: '52px', 7: '250px', 8: '107px'}})
            //rowFocus
            //.rowFocus({'rfbody':'#tbl_equipment_tbody'})
            //contextMenu
            .bindContextMenu();
            //rowFocus
            setRowFocus();
            $("#brefresh").click(function () {
                loadEquipments();
            });
            $("#badd").click(function () {
                addEquip(undefined, false);
            });
            $("#btypes").click(function () {
                types();
            });
            setHistory();  // after .bindContextMenu and rowFocus
            $.unblockUI();
        });
    }

    function setHistory() {
        $('#tbl_equipment>tbody>tr').unbind("dblclick").bind("dblclick", function () {
            var $this = $(this);
            var id_equipment = $this.attr('id');
            var html = '<div style="background-color: #000000; height: 27px;"><form id="frmFilter" class="buttons">' +
                'Период <input id="dBeg" name="begin_time" type="text" class="date" size=8>&nbsp;' +
                '<input id="dEnd" name="end_time" type="text" class="date" size=8>' +
                '<input style="display: none;" id="id_equip" name="id_equipment" type="text" class="number" size=8>' +
                '<button style="button" type=submit>' +
                '<img src="' + eng_img + '/arrows/arrow_right.png"/>' +
                '</button></form></div>' +
                '<div id="dvHistoty" style="height: 95%"></div>';
            var $dlg = $('#dvSessionsHistory');
            if ($dlg.length) {
                $dlg.find('#id_equip').val($(this).attr('id'));
                $dlg.find('#frmFilter').submit();
                $dlg.dialog('open');
            }
            else {
                $("<div/>").attr("id", "dvSessionsHistory")
                    .addClass("flora").css("text-align", "center")
                    .dialog({height: 350, width: 450, modal: false, resizable: false, draggable: true, title: "История", overlay: {backgroundColor: '#000', opacity: 0.5}})
                    .html(html)
                    .find('table').kTblScroll('100%');//.rowFocus({rfSetDefFocus: false, rfFocusCallBack: subm}).end();
                $("#dBeg").datepicker().val(kToday(-180));
                $("#dEnd").datepicker().val(kToday(1));
                $("#id_equip").val(id_equipment);
                $("#frmFilter").unbind('submit').bind('submit', function () {
                    var params = {};
                    var table = '<table id="tblHistory"><thead><tr><th>ФИО</th><th>Начало</th><th>Окончание</th></tr></thead><tbody>';
                    params = $(this).kFormSubmitParam();
                    $.getJSON('equipment_sessions_history', params, function (JSON) {
                        var jd = JSON.data;
                        for (var i = 0; i < jd.length; ++i) {
                            table += '<tr>' +
                                '<td>' + jd[i].FIO + '</td>' +
                                '<td class="hac">' + jd[i].BEGIN_TIME + '</td>' +
                                '<td class="hac">' + jd[i].END_TIME + '</td>' +
                                '</tr>';
                        }
                        table += '</tbody><tfoot><tr><th>' + jd.length + '</th><th></th><th></th></tr></tfoot></table>';
                        $('#dvHistoty').html(table).find('#tblHistory')
                            .kTblScroll()
                            .tablesorter({ dateFormat: "dd.mm.yyyy",
                                widgets: ['zebra'],
                                headers: { 0: {sorter: "text"}, //в„– Рї/Рї
                                    1: {sorter: "DateTimeWoSec"}, //Название
                                    2: {sorter: "DateTimeWoSec"} //Статус
                                }
                            });
                    });

                    return false;
                });
            }
        })
        .unbind("click").bind("click", function() {
            var $dlg = $('#dvSessionsHistory');
            if ($dlg.length) {
                if ($dlg.dialog('isOpen')) {
                    $dlg.find('#id_equip').val($(this).attr('id'));
                    $dlg.find('#frmFilter').submit();
                }
            }
        });
    }

    //т.к. на вновь добавленный tr автоматом не вешается
    function setRowFocus() {
        $("#tbl_equipment").rowFocus({'rfbody':'#tbl_equipment_tbody',
            'rfSetDefFocus': false,
            'rfFocusCallBack':
                function() {
                    $('#menuEquip > li.deactivate a').html(
                        ($('#'+$('#tbl_equipment').rfGetFocus()+' td.equip_status').hasClass('equip_inactive')?
                        _('Активировать'):_('Деактивировать'))
                    );

                    // Пункты контекстного меню enabled/disabled
                    // Нельзя отвязать оборудование (закрыть сессию), если не заполнено время начала
                    if ($.trim($('#'+$('#tbl_equipment').rfGetFocus()+' td.begin_time').text()) != '') {
                        $('#menuEquip').enableContextMenuItems("#closeSession");
                    }
                    else {
                        $('#menuEquip').disableContextMenuItems("#closeSession");
                    }
                }
        });
    }

    //т.к. на вновь добавленный tr автоматом не вешается
    function setRowFocusTypes() {
        $("#tbl_types").rowFocus({'rfbody':'#tbl_types_tbody'});
    }

    function getCurRegNum(elem) {
      return $(elem).closest("tr").find('td.reg_num').text();
    }

    function getCurFio(elem) {
      return $(elem).closest("tr").find('td.fio').text();
    }

    function delEquip(elem) {
        var id_equipment = getCurEquip(elem);
        var equip_name = getCurEquipName(elem);

        if (!confirm('Удалить оборудование ' + equip_name + '?'))
            return;

        $.getJSON('equipment_del', {id_equipment: id_equipment},
            function (data) {
                if (data.data.ERROR_CODE)
                    alert('Ошибка при удалении оборудования "'+equip_name+'":\n'+data.data.ERROR_MSG);
                else
                {
                  //$("#tbl_equipment > tbody > tr#"+id_equipment).remove();
                  //$("#tbl_equipment").kScrollableToDown().trigger("update");
                  //enum_equip();
                  ////alert('Оборудование "'+equip_name+'" удалено');
                  ////rowFocus
                  //setRowFocus();

                  //Применим фильтр
                  loadEquipments();
                }
            }
        );
    }

    function deactivateEquip(elem)
    {
      var id_equipment = getCurEquip(elem);
      var equip_name = getCurEquipName(elem);
      var inactive = $('#'+$('#tbl_equipment').rfGetFocus()+' td.equip_status').hasClass('equip_inactive');
      if (!inactive && !confirm ('Деактивировать оборудование "'+equip_name+'"? После деактивации нельзя будет открывать на него сессии. Активировать неактивное оборудование можно в любой момент в этом же интерфейсе.'))
        return;

      $.getJSON('equip_deactivate', {id_equipment: id_equipment, inactive: (inactive?1:0)},
        function (data)
        {
          if (data.data.ERROR_CODE)
              alert('Ошибка при '+(inactive?'активации':'деактивации')+' оборудования "'+equip_name+'":\n'+data.data.ERROR_MSG);
          else
          {
            //$("#tbl_layers > tbody > tr#"+layer_id).remove();
            //перезагружаем, т.к. должен примениться фильтр "Показать отключенные"
            //установить LASTDATE
            //loadTarifs();
            //enum_layer();
            var $tr = $("#tbl_equipment > tbody > tr#"+id_equipment);
            if (inactive) {
              $tr.find("td.equip_status").removeClass('equip_inactive')
                                         .addClass('equip_active')
                                         .html('<img src="'+sps_img.KURSSKLAD+'/YesNo/yes.png" border="0">')
                                         .attr('title', _('Активное'));
            }
            else {
              $tr.find("td.equip_status").removeClass('equip_active')
                                         .addClass('equip_inactive')
                                         .html('<img src="'+sps_img.KURSSKLAD+'/YesNo/no.png" border="0">')
                                         .attr('title', _('Не активное'));
            }
            //$("#tbl_equipment").kScrollableToDown().trigger("update");

            //Применим фильтр
            loadEquipments();
          }
        }
      );
    }

    function addEquipDialog(id_equipment, is_edit){
       // инициализация диалога
       if (is_edit) {
         var $tr = $("#tbl_equipment > tbody > tr#"+id_equipment);
         $('#dlgadd').dialog('option', 'title', _('Редактирование оборудования'));
         $('#dlgadd_typeId_cmb').val($tr.find(' > td.type_name').attr('id_type'));
         $('#dlgadd_kindId_cmb').val($tr.find(' > td.equip_kind').attr('equip_kind'));
         //$("#dlgroleedit_id_edt").show();
         //$("#dlgroleedit_id_edt").val(id_equipment);
         //$("#dlgroleedit_id_edt").removeAttr("disabled");
         //$("#dlgroleedit_id_edt").attr("readonly", "readonly");
         $("#dlgadd_equip_name").val($tr.find(' > td.equip_name').text());
         $("#dlgadd_reg_num").val($tr.find(' > td.reg_num').text());
         $("#dlgadd_serial_num").val($tr.find(' > td.serial_num').text());
       }
       else {
         $('#dlgadd').dialog('option', 'title', _('Добавление оборудования'));
         //$("#dlgroleedit_id_edt").hide();
         //$("#dlgroleedit_id_edt").removeAttr("readonly");
         //$("#dlgroleedit_id_edt").attr("disabled", "disabled");
         $("#dlgadd_form").get(0).reset();
       }
       $("#dlgadd").unbind('keypress').keypress(function (e) {
          if (e.keyCode == 13) {
            $("#dlgadd_save_btn").click();
            e.preventDefault(); // предотвратить submit по Enter
            //return false; тоже работает, чтобы предотвратить submit по Enter
          }
       });

       $('#dlgadd_kindId_cmb').unbind('change').change(function(){
           var sel_kind = $(this).find("option:selected").val();
           $('#dlgadd_typeId_cmb option').show().filter(function(){
               return $(this).attr('equip_kind') != sel_kind;
           }).hide();
           if ($('#dlgadd_typeId_cmb option:visible').length == 0){
               $('#dlgadd_typeId_cmb').prepend($('<option value="unselected"></option>'));
           }
           else {
               $('#dlgadd_typeId_cmb option[value="unselected"]').remove();
           }
           $('#dlgadd_typeId_cmb option:visible:first').attr("selected", "selected");
       });

       // определение кнопок
       $("#dlgadd_cancel_btn").unbind('click').click(function(){$("#dlgadd").dialog("close");});
       $("#dlgadd_save_btn").unbind('click').click(function()
        {
          // валидируем
          if (!$("#dlgadd_form").valid()) {
            //validator.focusInvalid();
            return;
          }

          // закрываем
          //$("#dlgadd").dialog("close");

          //валидатор не валидирует почему-то
          if ($('#dlgadd_typeId_cmb').val() == 'unselected'){
              alert(_("Отсутсвуют типы оборудования выбранного вида"));
              return;
          }
          // отсылаем на сервак
          if (is_edit){
            //$.getJSON('ajaxEditRole',params,dlgaddCallback);
            $.getJSON('equipment_edit',
                        {id_equipment: id_equipment,
                        equip_name: $('#dlgadd_equip_name').val(),
                        id_type: $('#dlgadd_typeId_cmb').val(),
                        reg_num: $('#dlgadd_reg_num').val(),
                        serial_num: $('#dlgadd_serial_num').val()},
                      dlgaddCallback);
          }
          else {
            $.getJSON('equipment_add',
                        {equip_name: $('#dlgadd_equip_name').val(),
                        id_type: $('#dlgadd_typeId_cmb').val(),
                        reg_num: $('#dlgadd_reg_num').val(),
                        serial_num: $('#dlgadd_serial_num').val()},
                      dlgaddCallback);
          }
          // обрабатываем ответ
          function dlgaddCallback(data)
          {
            if (data.data.ERROR_CODE)
                alert(_('Ошибка при сохранении оборудования:')+'\n'+data.data.ERROR_MSG);
            else
            {
                //alert('Роль "'+$("#dlgroleedit_name_edt").val()+'" успешно сохранёна!');

                if (is_edit){
                  //edit
                  // закрываем
                  $("#dlgadd").dialog("close");
//                  var $tr = $("#tbl_equipment > tbody > tr#"+id_equipment);
//                  $tr.find("td.equip_name").text($("#dlgadd_equip_name").val());
//                  $tr.find("td.serial_num").text($("#dlgadd_serial_num").val());
//                  $tr.find("td.reg_num").text($("#dlgadd_reg_num").val());
//                  $tr.find("td.equip_kind").html($("#dlgadd_kindId_cmb").val() == 'T' ?
//                                                   '<img src="'+eng_img+'/actions/terminal.png" border="0">'
//                                                 : '<img src="'+eng_img+'/actions/mobile.png" border="0">')
//                                           .attr('equip_kind', $("#dlgadd_kindId_cmb").val())
//                                           .attr('title', $("#dlgadd_kindId_cmb option:selected").text());
//                  $tr.find("td.type_name").text($("#dlgadd_typeId_cmb option:selected").text());
//                  $tr.find("td.equip_status").attr('title', _('Активное')).addClass('equip_active').html('<img src="'+sps_img.KURSSKLAD+'/YesNo/yes.png" border="0">');
                }
                else {
//                  var new_id = data.data.ID_EQUIPMENT;
//
//                  //insert
//                  $("#tbl_equipment > tbody").append(jQuery.format(
//                     '<tr id="{0}">'
//                    +'<td class="har enum"></td>'
//                    +'<td class="equip_name">{1}</td>'
//                    +'<td class="equip_status equip_active" title="'+_('Активное')+'" style="text-align: center;"><img src="'+sps_img.KURSSKLAD+'/YesNo/yes.png" border="0"></td>'
//                    +'<td class="serial_num">{2}</td>'
//                    +'<td class="har reg_num">{3}</td>'
//                    +'<td class="equip_kind" equip_kind="{4}" title="{5}" style="text-align: center;">{6}</td>'
//                    +'<td class="type_name" id_type={7}>{8}</td>'
//                    +'<td class="fio"></td>'
//                    +'<td class="begin_time hac"></td>'
//                     +'</tr>'
//                     ,
//                     new_id,
//                     $("#dlgadd_equip_name").val(),
//                     $("#dlgadd_serial_num").val(),
//                     $("#dlgadd_reg_num").val(),
//                     $("#dlgadd_kindId_cmb").val(),
//                     $("#dlgadd_kindId_cmb option:selected").text(),
//                     $("#dlgadd_kindId_cmb").val() == 'T' ? '<img src="'+eng_img+'/actions/terminal.png" border="0">'
//                                                          : '<img src="'+eng_img+'/actions/mobile.png" border="0">',
//                     $("#dlgadd_typeId_cmb").val(),
//                     $("#dlgadd_typeId_cmb option:selected").text()
//                    ));
//                  //$("#tbl_equipment > tbody > tr#"+new_id).rowFocus({'rfbody':'#tbl_equipment_tbody'});
//                  //$("#tbl_equipment > tbody > tr:nth-child(odd)#"+new_id).css("background-color", "#E6E6FA");

                  //сохраняем вид и тип для массового добавления
                  var old_kind = $("#dlgadd_kindId_cmb").val();
                  var old_type = $("#dlgadd_typeId_cmb").val();
                  $("#dlgadd_form").get(0).reset();
                  $("#dlgadd_typeId_cmb").val(old_type);
                  $("#dlgadd_kindId_cmb").val(old_kind);

                  $("#dlgadd_equip_name").focus().select();

//                  enum_equip();
                }
//                $("#tbl_equipment")
//                    .bindContextMenu()
//                    .kScrollableToDown()
//                    .trigger("update");
//                //rowFocus
//                setRowFocus();
//                setHistory();  // after .bindContextMenu and rowFocus

                //Применим фильтры
                loadEquipments();
            }
          }
        });

       // запуск диалога
       $("#dlgadd").show().dialog("open");
       $("#dlgadd_equip_name").focus().select();

       //выставляем dlgadd_typeId_cmb в зависимости от dlgadd_kindId_cmb
       $('#dlgadd_kindId_cmb').change();
    }

    function addEquip(elem, is_edit){
      if (elem)
          var id_equipment = getCurEquip(elem);
      else
          var id_equipment = undefined;

      //alert ('addEquip is_edit='+is_edit+' id_equipment='+id_equipment);

      // всегда инициализируем, т.к. equip_types может меняеться
      //if ($("#dlgadd").children().length == 0)
      //{ //ещё не загружено - инициализируем 1-й раз
        $("#dlgadd").load('equipment_dlgadd_load',
        function()
        {
          validator = $("#dlgadd_form").validate(
          {
            rules:
            {
              dlgadd_equip_name: "required",
              dlgadd_kindId_cmb: "required",
              dlgadd_typeId_cmb: {required: true, typeId: true},
              dlgadd_reg_num: "required"
            },
            messages:
            {
              dlgadd_equip_name: {required: _("Введите название")},
              dlgadd_kindId_cmb: {required: _("Выберите вид")},
              dlgadd_typeId_cmb: {required: _("Выберите тип")},
              dlgadd_reg_num: {required: _("Введите рег. номер")}
            },
            errorPlacement: function(error, element)
            {
              error.appendTo(element.parent("td")/*.next("td")*/ );
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

          addEquipDialog(id_equipment, is_edit);
        });
      //}
      //else
      //{ //уже загружено
      //  //alert('already loaded:'+ $("#dlgroleedit").html());
      //  validator.resetForm(); //delete error messages
      //  addEquipDialog(id_equipment, is_edit);
      //}
    }

    function closeSession(elem) {
      var id_equipment = getCurEquip(elem);
      var reg_num = getCurRegNum(elem);
      var equip_name = getCurEquipName(elem);
      var fio = getCurFio(elem);

      if (!confirm ('Закрыть принудительно сессию по оборудованию "'+equip_name
        +'", привязанному на данный момент к пользователю ' + fio + '?'))
        return;

      $.getJSON('session_close_query', {reg_num: reg_num},
        function (data)
        {
            if (data.data.ERROR_MSG && !confirm (data.data.ERROR_MSG+'\n'+
                  'Закрыть принудительно сессию по оборудованию "'+equip_name
                  +'" несмотря на это?'))
                  return;

            $.getJSON('session_close', {reg_num: reg_num},
                function (data)
                {
                  if (data.data.ERROR_MSG)
                      alert('Ошибка при принудительном закрытии сессии по оборудованию "'+equip_name+'":\n'+data.data.ERROR_MSG);
                  else
                  {
                    //var $tr = $("#tbl_equipment > tbody > tr#"+id_equipment);
                    //$tr.find("td.begin_time").text('');
                    //$("#tbl_equipment").kScrollableToDown().trigger("update");

                    //Применим фильтр
                    loadEquipments();
                  }
                }
            )
        }
      )
    }

    function types() {
        $('#dlgTypes').dialog('option', 'title', _('Типы оборудования'));
        $.blockUI({message: '<h1>'+_('Поиск типов оборудования...')+'</h1>'});
        $("#dlgTypes").load('types', function () {
            //Features and Events
            $("#tbl_types")
            //sortable
            .tablesorter({ dateFormat:"dd.mm.yyyy",
                            widgets:['zebra'],
                            headers:{ 0: {sorter:"text"}, //Вид
                                      1: {sorter:"text"}, //Название
                                      2: {sorter:"DateTimeWoSec"} //Изменён
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

            $("#tbl_types")
            //scroll
            //.kScrollableToDown({width: '100%', widths: {0: '52px', 2: '107px'}})
            //rowFocus
            //.rowFocus({'rfbody':'#tbl_equipment_tbody'})
            //contextMenu
            .bindContextMenuTypes();
            //rowFocus
            setRowFocusTypes();

            // определение кнопок
            $("#dlgTypes_close_btn").unbind('click').click(function(){$("#dlgTypes").dialog("close");});

            // показать
            $("#dlgTypes").show().dialog("open");

            $("#tbl_types")
            //scroll
            //.kScrollableToDown({width: '100%', widths: {0: '52px', 2: '107px'}});
            .Scrollable(160, '100%', {widths: {0: '52px', 2: '107px'}});

            $.unblockUI();
        });
    }

    function delType(elem) {
        var id_type = getCurType(elem);
        var type_name = getCurTypeName(elem);

        if (!confirm('Удалить тип ' + type_name + '?'))
            return;

        $.getJSON('type_del', {id_type: id_type},
            function (data) {
                if (data.data.ERROR_CODE)
                    alert('Ошибка при удалении оборудования "'+type_name+'":\n'+data.data.ERROR_MSG);
                else
                {
                  $("#tbl_types > tbody > tr[id_type='"+id_type+"']").remove();
                  $("#tbl_types").Scrollable().trigger("update");
                  //enum_equip();
                  //alert('Оборудование "'+equip_name+'" удалено');
                //rowFocus
                setRowFocusTypes();
              }
            }
        );
    }

    function addTypeDialog(id_type, is_edit){
       // инициализация диалога
       if (is_edit) {
         var $tr = $("#tbl_types > tbody > tr[id_type='"+id_type+"']");
         $('#dlgaddType').dialog('option', 'title', _('Редактирование типа оборудования'));
         $('#dlgaddType_kindId_cmb').val($tr.find(' > td.equip_kind').attr('equip_kind'));
         //$("#dlgroleedit_id_edt").show();
         //$("#dlgroleedit_id_edt").val(id_equipment);
         //$("#dlgroleedit_id_edt").removeAttr("disabled");
         //$("#dlgroleedit_id_edt").attr("readonly", "readonly");
         $("#dlgaddType_type_name").val($tr.find(' > td.type_name').text());
       }
       else {
         $('#dlgaddType').dialog('option', 'title', _('Добавление типа оборудования'));
         //$("#dlgroleedit_id_edt").hide();
         //$("#dlgroleedit_id_edt").removeAttr("readonly");
         //$("#dlgroleedit_id_edt").attr("disabled", "disabled");
         $("#dlgaddType_form").get(0).reset();
       }
       $("#dlgaddType").unbind('keypress').keypress(function (e) {
          if (e.keyCode == 13) {
            $("#dlgaddType_save_btn").click();
            e.preventDefault(); // предотвратить submit по Enter
            //return false; тоже работает, чтобы предотвратить submit по Enter
          }
       });

       // определение кнопок
       $("#dlgaddType_cancel_btn").unbind('click').click(function(){$("#dlgaddType").dialog("close");});
       $("#dlgaddType_save_btn").unbind('click').click(function()
        {
          // валидируем
          if (!$("#dlgaddType_form").valid()) {
            //validator.focusInvalid();
            return;
          }

          // закрываем
          //$("#dlgadd").dialog("close");

          // отсылаем на сервак
          if (is_edit){
            //$.getJSON('ajaxEditRole',params,dlgaddCallback);
            $.getJSON('type_edit',
                        {id_type: id_type,
                        type_name: $('#dlgaddType_type_name').val(),
                        is_mobile: $('#dlgaddType_kindId_cmb').val() == 'M'?'1':'0'
                        },
                      dlgaddCallback);
          }
          else {
            $.getJSON('type_add',
                        {type_name: $('#dlgaddType_type_name').val(),
                        is_mobile: $('#dlgaddType_kindId_cmb').val() == 'M'?'1':'0'
                        },
                      dlgaddCallback);
          }
          // обрабатываем ответ
          function dlgaddCallback(data)
          {
            if (data.data.ERROR_CODE)
                alert(_('Ошибка при сохранении типа оборудования:')+'\n'+data.data.ERROR_MSG);
            else
            {
                //alert('Роль "'+$("#dlgroleedit_name_edt").val()+'" успешно сохранёна!');
                var lastdate = data.data.LASTDATE;

                if (is_edit){
                  //edit
                  // закрываем
                  $("#dlgaddType").dialog("close");
                  var $tr = $("#tbl_types > tbody > tr[id_type='"+id_type+"']");
                  $tr.find("td.type_name").text($("#dlgaddType_type_name").val());
                  $tr.find("td.equip_kind").html($("#dlgaddType_kindId_cmb").val() == 'T' ?
                                                   '<img src="'+eng_img+'/actions/terminal.png" border="0">'
                                                 : '<img src="'+eng_img+'/actions/mobile.png" border="0">')
                                           .attr('equip_kind', $("#dlgaddType_kindId_cmb").val())
                                           .attr('title', $("#dlgaddType_kindId_cmb option:selected").text());
                  $tr.find("td.lastdate").text(lastdate);
                }
                else {
                  var new_id = data.data.ID_TYPE;

                  //insert
                  $("#tbl_types > tbody").append(jQuery.format(
                     '<tr id_type="{0}">'
                    +'<td class="equip_kind" equip_kind="{1}" title="{2}" style="text-align: center;">{3}</td>'
                    +'<td class="type_name">{4}</td>'
                    +'<td class="lastdate hac">{5}</td>'
                     +'</tr>'
                     ,
                     new_id,
                     $("#dlgaddType_kindId_cmb").val(),
                     $("#dlgaddType_kindId_cmb option:selected").text(),
                     $("#dlgaddType_kindId_cmb").val() == 'T' ? '<img src="'+eng_img+'/actions/terminal.png" border="0">'
                                                          : '<img src="'+eng_img+'/actions/mobile.png" border="0">',
                     $("#dlgaddType_type_name").val(),
                     lastdate
                    ));
                  //$("#tbl_equipment > tbody > tr#"+new_id).rowFocus({'rfbody':'#tbl_equipment_tbody'});
                  //$("#tbl_equipment > tbody > tr:nth-child(odd)#"+new_id).css("background-color", "#E6E6FA");

                  //сохраняем вид и тип для массового добавления
                  var old_kind = $("#dlgaddType_kindId_cmb").val();
                  $("#dlgaddType_form").get(0).reset();
                  $("#dlgaddType_kindId_cmb").val(old_kind);

                  $("#dlgaddType_type_name").focus().select();

                  //enum_equip();
                }
                $("#tbl_types")
                    .bindContextMenuTypes()
                    .Scrollable()
                    .trigger("update");
                //rowFocus
                setRowFocusTypes();
                //setHistory();  // after .bindContextMenu and rowFocus
            }
          }
        });

       // запуск диалога
       $("#dlgaddType").show().dialog("open");
       $("#dlgaddType_type_name").focus().select();

       //выставляем dlgaddType_typeId_cmb в зависимости от dlgaddType_kindId_cmb
       //$('#dlgaddType_kindId_cmb').change();
    }

    function addType(elem, is_edit){
      if (elem)
          var id_type = getCurType(elem);
      else
          var id_type = undefined;

      //alert ('addEquip is_edit='+is_edit+' id_equipment='+id_equipment);

      // всегда инициализируем, т.к. equip_types может меняеться
      //if ($("#dlgadd").children().length == 0)
      //{ //ещё не загружено - инициализируем 1-й раз
        $("#dlgaddType").load('types_dlgaddtype_load',
        function()
        {
          validator = $("#dlgaddType_form").validate(
          {
            rules:
            {
              dlgaddType_type_name: "required",
              dlgaddType_kindId_cmb: "required"
            },
            messages:
            {
              dlgaddType_type_name: {required: _("Введите название")},
              dlgaddType_kindId_cmb: {required: _("Выберите вид")}
            },
            errorPlacement: function(error, element)
            {
              error.appendTo(element.parent("td")/*.next("td")*/ );
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

          addTypeDialog(id_type, is_edit);
        });
      //}
      //else
      //{ //уже загружено
      //  //alert('already loaded:'+ $("#dlgroleedit").html());
      //  validator.resetForm(); //delete error messages
      //  addEquipDialog(id_equipment, is_edit);
      //}
    }

})(jQuery);
