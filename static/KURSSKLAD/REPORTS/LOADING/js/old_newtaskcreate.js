/**
 * Created by kashko.iu on 03.05.2017.
 */
var rfFocusClass = 'rf-focused'; // class Focus
(function ($) {
  $.isNotCirillic = function (str) {
    //если в строке есть хоть один симмвол отличный от русского алфавита или точки или пробелы вернет true
    return (/[^а-я. ]/ig).test(str);
  };
  $.fn.kInputFio = function () {
    $(this).unbind("keydown").bind("keydown", function (e) {
      var keyCode = e.charCode ? e.charCode : e.keyCode;
      var key = e.originalEvent.key;
        if ((keyCode >= 48 && keyCode <= 57) ||(keyCode >= 48 && keyCode <= 57) || keyCode == 187 || keyCode == 189 || keyCode == 220 || //верхние цифры
           (keyCode >= 96 && keyCode <= 105) || keyCode == 106 || keyCode == 107 || keyCode == 109 || keyCode == 111 || // правые цифры и символы
           (keyCode == 110 && key != '.') || (keyCode == 191 && key != '.') || (keyCode == 190 && (key!= '.' && key.match(/[ю\Ю]/g) == null)) ||
           (keyCode == 188 &&  key.match(/[б\Б]/g) == null) ||
           (keyCode == 222 &&  key.match(/[э\Э]/g) == null) ||
           (keyCode == 186 &&  key.match(/[ж\Ж]/g) == null) ||
           (keyCode == 219 &&  key.match(/[х\Х]/g) == null) ||
           (keyCode == 221 &&  key.match(/[ъ\Ъ]/g) == null) ||
           (keyCode == 192 &&  key.match(/[ё\Ё]/g) == null)
        ) {
          if (e.preventDefault) {
            //FF, Opera
            e.preventDefault();
            return false;
          }
          e.returnValue = false;
            //IE
        }
    });
    return this;
  };

  let INP_PHOLDER = null
  let INP_MASK = null

 /* $.proveRoute = function (inp) {
    var cntnumber = 0;
    function dvPR() {
        $("#dvPR")
            .attr('pl_id',inp.pl_id ? inp.pl_id : '')
            .attr('url',inp.url)
            .attr('taskid',inp.taskid ? inp.taskid : '')
          .dialog("open");
    }
    if ($("#dvPR").length)
      $("#dvPR").dialog('destroy').remove();

    $.getJSON('listRouteClient',{taskid: inp.pl_id} , function (json) {
			if ( !showErr(json)) {

        var html = '<form style="text-align:left; height: 100%"><div style="height: 70%"><table><thead><tr><th class="rtnumber">№п/п</th><th>Пункт доставки</th><th>Кол-во ТЕ</th></tr></thead>' +
          '<tbody>';
        // for (var i = 0; i < 15; i++) {
        for (var i = 0; i < json.data.length; i++) {
          html += '<tr><td class="rtnumber"><input type="text" name="rtnumber"  title="Нажмите, чтобы пронумеровать"  readonly data-clid="'+json.data[i].IMOBJID+'"></td>' +
            '<td>' + json.data[i].IMNAME + '</td>' +
            '<td>'+ json.data[i].LISTTU+'</td></tr>';
		}


        html += '</tbody></table></div><br><br><hr><div class="buttons">' +
          '<button type="submit"><img src="' + eng_img + '/actions/accept.png" border="0">Подтвердить</button> ' +
          '<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
          '</div></form>';

        $("<div/>").attr("id", "dvPR").addClass("flora")
          .dialog({
            autoopen: false,
            height: 400,
            width: 300,
            modal: true,
            resizable: false,
            draggable: false,
            title: 'Постройте маршрут',
            overlay: {backgroundColor: '#000', opacity: 0.5}
          })
          .html(html)
          .find('form').unbind('submit').bind("submit", function (e) {
          e.preventDefault();
          var param = {wordnum: '', wordclid:''
                      };
          //Обязательно важен порядок!!
          var $inp = $(this).find('input[name="rtnumber"]').sort(sortDescending);
          function sortDescending(a, b) {
            return $(a).val() > $(b).val() ? 1 : -1;
          }
          var flag = true;
          $inp.each(function(){
            if (!$(this).val()){
              alert('Пронумеруйте весь маршрут');
              flag = false;
              return false;
            }
            param.wordnum += $(this).val() + ',' ;
            param.wordclid += $(this).attr('data-clid') + ',';
          });

          if(!flag)
            return flag;

          $.searchLic(param);

          $("#dvPR").dialog('close');

          return false;
        })
            .find('table').kTblScroll().end()
            .find('td.rtnumber').click(function () {
              if($(this).is('td')){
                var $inp = $(this).find('input[name="rtnumber"]');
              }
              else{
                var $inp = $(this);
              }
              var $allinp = $("#dvPR").find('form input[name="rtnumber"]');

              var val = kInt($inp.val());
              if (!val){
                cntnumber ++;
                $inp.val(cntnumber);
              }
              else{
                cntnumber --;
                $inp.val('');
                var ilen = $allinp.length - val;
                for (var i = 0; i < ilen; i++) {
                  val++;
                  $("#dvPR").find('form input[name="rtnumber"][value="'+val+'"]').val(val-1);
                }
                // cntnumber = val-1;
              }
            }).end()
            .find('th.rtnumber').click(function () {
              cntnumber = 0;
              $("#dvPR").find('form input[name="rtnumber"]').each(function(){
                cntnumber ++;
                $(this).val(cntnumber);
              });
            }).end()
            .find('>div>button:last').click(function () {
              $("#dvPR").dialog('close');
            }).end()
          .end();

        dvPR();
      }
    })
  };*/

  $.strToJSONold = function (){
    var headjson = $("#dvSL").attr('oldparam') ? JSON.parse($("#dvSL").attr('oldparam')) : false,
        oldparam ={};
    if (headjson){
      var descript = headjson.data.DESCRIPT;
      if (descript != '')  {
        descript = JSON.parse(descript);
        oldparam.owhmode = descript.whmode;
        oldparam.onumstump = descript.numstump;
        oldparam.onumtrailer = descript.numtrailer;
      }
      oldparam.odriverid = headjson.data.DRIVERID;
      oldparam.otruckid = headjson.data.TRUCKID;
      oldparam.otrailerid = headjson.data.TRAILERID;
      oldparam.ogateid = headjson.data.GATEID;
      oldparam.otaskid = headjson.data.TASKID;
    }
    return oldparam;
  };

  $.searchLic = function (taskid) {

    function dvSL() {
      if ($("#dvPR").attr('taskid')){
        $.getJSON('GateTaskList',{'taskid': taskid},  function (headjson) {
          if (!showErr(headjson)){
            $("#dvSL").attr('oldparam', JSON.stringify(headjson)).find('>form')
              .find('>input[name="license"]').val(headjson.data.LICENSE).end()
              .end()
              .dialog("open").find('>form>input:first').focus().end();
          }
        })
      }
      else{
        $("#dvSL").removeAttr('oldparam').find('>form')
          .find('>input:first').val('').end()
          .end()
          .dialog("open").find('>form>input:first').focus().end();
      }
    }

    if ($("#dvSL").length)
      $("#dvSL").dialog('destroy').remove();

    var html = '<form style="text-align:center;">';

    html += 'Тип госномера <br><select id="typeLicense"></select><br><br>';

    html += '<span name="license">Гос.номер </span><input type="text" placeholder="x000xx 00" name="license" required value="">';

    html += '<br><br><hr><div class="buttons">' +
      '<button type="submit"><img src="' + eng_img + '/actions/find.png" border="0">Найти</button> ' +
      '<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
      '</div></form>';

    $("<div/>").attr("id", "dvSL").addClass("flora")
      .dialog({
        autoopen: false,
        height: 180,
        width: 200,
        modal: true,
        resizable: false,
        draggable: false,
        title: 'Выбор автомашины',
        overlay: {backgroundColor: '#000', opacity: 0.5}
      })
      .html(html)
      .find('>form').unbind('submit').bind("submit", function (e) {
        e.preventDefault();
        var param = $(this).kFormSubmitParam();
        param.license = $.auto_layout_keyboard(param.license);

        if (param.license.length < 5 ){
          alert('Введите корректный гос.номер');
          return false;
        }

        $.ajax({
          url: 'listCarsLic',
          dataType: 'json',
          data: param,
          success: function (json) {
            if (!showErr(json)){
              $("#dvSL").dialog('close');
              // var oldparam = $.strToJSONold();
              if (json.data.CARID){
                //с данными
                var infoC = {
                  // pltaskid: data.pltaskid,
                  // taskid: data.taskid,
                  // url: data.url,
                  //wordnum: data.wordnum,
                  //wordclid: data.wordclid,
                  taskid: taskid,
                  carid: json.data.CARID,
                  truckid: json.data.TRUCKID,
                  carnumber: json.data.LICENSE,
                  truckname: json.data.TRUCK,
                  carname: json.data.CARNAME
                };
                $.chooseTruckDriver(infoC);
                return false;
              }
              else{
                  var infoC = {
                      // pltaskid: data.pltaskid,
                      // taskid: data.taskid,
                      // url: data.url,
                      //wordnum: data.wordnum,
                      //wordclid: data.wordclid,
                      taskid: taskid,
                      carnumber: param.license
                  };
                  $.addTruck(infoC);//новый
                  return false;
              }
          }},
          async: false
        });
        $("#dvSL").dialog('close');

      return false;
      })
       .find('>div>button:last').click(function () {
          $("#dvSL").dialog('close');
        }).end()
      .end();

    $.ajax({
        url: 'listCarsMask',
        dataType: 'json',
        success: function (json) {
            json.data.map((m,i)=>{
                if(i===0) {
                    INP_MASK = m.MASK
                    INP_PHOLDER = m.PLACEHOLDER
                }
                $('#typeLicense').append(`<option value="${m.MASK}" data-id="${m.ID} data-code="${m.CODE} data-placeholder="${m.PLACEHOLDER}">${m.NAME}</option>`)
            })
            $("#dvSL input[name='license']").attr('placeholder', INP_PHOLDER).mask(INP_MASK)
        }
    })

    $('#typeLicense').change(()=>{
        const option = $('#typeLicense option:selected')
        INP_MASK = option.val()
        INP_PHOLDER = option.attr('data-placeholder')
        $("#dvSL input[name='license']").remove()
        $("#dvSL form span[name='license']").append(`<input name="license" placeholder="${INP_PHOLDER}">`)
        $("#dvSL input[name='license']").mask(INP_MASK)
    })


    //$("#dvSL input[name='license']").mask("t999tt 99?9");

    //$("#dvSL input[name='license']").mask("uu9999uu");

    dvSL();


  };


  $.chooseTruckDriver = function (data) {

    function dvTD() {
      var oldparam = $.strToJSONold();
      $("#dvTD").find('>form')
        .find('>input:first').val('').end()
        .end()
        .dialog("open").find('>form>input:first').focus().end();
      if(oldparam.odriverid){
        $('#tblDrivers')
          .find('tr[driverid='+ oldparam.odriverid+']')
          .rfSetFocus();
      }
      if(oldparam.otrailerid){
        $('#tblNumtrailer')
          .find('tr[carid='+ oldparam.otrailerid+']')
          .rfSetFocus();
      }
    }

    if ($("#dvTD").length){
      $("#dvTD").dialog("destroy").remove();
      createDialogTD();
    }
    else {
      createDialogTD();
    }


    function htmlDriverTr(JSON){
      var html='';
      for (var i = 0; i < JSON.data.length; i++) {
        var driver = JSON.data[i];
        html +=
            '<tr driverid="' + driver.DRIVERID + '" truckid="'+driver.TRUCKID+'"'+'>' +
              '<td name="fio" class="text">'+driver.FIO+'</td>' +
              '<td name="phone" class="text">'+driver.PHONE+'</td>' +
            '</tr>';
      }
      return html;
    }
    function createDialogTD (){
      $.getJSON('listTruck', function (truck) {
        $.getJSON('listDrivers',{truckid: data.truckid}, function (JSON) {
          $.getJSON('listNumTrailer',{truckid: data.truckid, type: 'прицеп'}, function (json) {
            if (!showErr(json) && !showErr(JSON) && !showErr(truck)) {
              var select = '<select name="listTrucks">';
              for (var i = 0; i < truck.data.length; i++) {
                select +='<option value="'+truck.data[i].TRUCKID+'" '+(truck.data[i].TRUCKID== data.truckid ? 'selected' : '')+'>'+truck.data[i].NAME+'</option>';
              }
              select += '</select>';

              var html = '<div class="modal-body" style="height:100%;"><div style="width:100%;"><div class="tblSc" style="float: left; width: 48%;  text-align: center">' +
                '<table id="tblDrivers" style="width: 100%;">' +
                '<thead><tr><th>Водители'+select+'</th><th>Контактные данные</th></tr></thead>' +
                  '<tbody>'+htmlDriverTr(JSON);
                html += '</tbody>'+
                '</table>' +
                '</div>';

                html+='<div class="tblSc" style="display: inline-block; width: 2%; "></div>' +
                '<div  class="tblSc" style="display: inline-block; width: 48%;  text-align: center; vertical-align: top">' +
                '<table id="tblNumtrailer">' +
                '<thead><tr><th>Номер прицепа</th><th>Грузоподъемность</th><th>Вместимость</th><th>Паллет</th></tr></thead><tbody>';
                for (var i = 0; i < json.data.length; i++) {
                  var trailer = json.data[i];
                  html +=
                      '<tr carid="' + trailer.CARID + '">' +
                        '<td name="license" class="text">'+trailer.LICENSE+'</td>' +
                        '<td name="carrying" class="text">'+trailer.CARRYING+'</td>' +
                        '<td name="capacity" class="text">'+trailer.CAPACITY+'</td>' +
                    '<td name="capacitypal" class="text">'+trailer.CAPACITYPAL+'</td>' +
                      '</tr>';
                }
                html += '</tbody>'+
                '</table></div>' +
                '</div><br><br>';

                html+='<div style="width:100%;" class="divInp">' +
                '<div  style="float: left; width: 48%;  text-align: left; ">' +
                 '<div class="rightTC" style="text-align: left;"><input class="chkDr" type="checkbox"/><b>Добавить водителя </b></div><br><br>'+
                   '<form id="formDrivers" style="text-align: left">' +
                    '<div class="rightTC">Водитель: </div><div class="leftTC"><input class="driver" type="text"  name="fio" value="" disabled></div><br><br>'+
                    '<div class="rightTC">Контактные данные: </div><div class="leftTC"><input class="driver"  type="text" name="phone" value="" disabled></div>'+
                  '</form>' +
                '</div>';

                html+='<div style="display: inline-block; width: 2%; "></div>' +
                '<div class="formInp"  style="display: inline-block; width: 48%;  text-align: left; ">' +
                 '<div class="rightTC" style="text-align: left;"><input class="chkTr" type="checkbox"/><b>Добавить прицеп </b></div><br><br>'+
                   '<form id="formTrailer" style="text-align: left">' +
                    '<div class="rightTC">Номер прицепа: </div><div class="leftTC"><input class="trailer" type="text"  name="license" value="" disabled></div><br><br>'+
                    '<div class="rightTC">Грузоподъемность (т): </div><div class="leftTC"><input class="trailer"  type="text" name="carrying" value="" disabled></div><br><br>'+
                    '<div class="rightTC">Вместимость (куб.м): </div><div class="leftTC"><input class="trailer"  type="text" name="capacity" value="" disabled></div><br><br>'+
                '<div class="rightTC">Вместимость (пал): </div><div class="leftTC"><input class="trailer"  type="text" name="capacitypal" value="" disabled></div>'+
                  '</form>' +
                '</div>' +
                '</div>';


                html +='<div style="width:100%;"><form id="subm"><div class="buttons" style="float: left; width: 100%; height: 10%"><hr>' +
                '<button type="submit" id="dvTDSaveBtn"><img src="' + eng_img + '/actions/accept.png" border="0">Далее</button> ' +
                '<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>'+
                '</div></form></div>';


              var dialogW = kScreenW()*0.8;
              var dialogH = kScreenH()*0.7;

              dialogH < 400 ? dialogH =400 :  dialogH;
              dialogW < 650 ? dialogW =650 :  dialogW;

              $("<div/>").attr("id", "dvTD").addClass("flora")
                .dialog({
                  autoopen: false,
                  height: dialogH,
                  width: dialogW,
                  modal: true,
                  resizable: false,
                  draggable: false,
                  title: 'Выбор водителя для автомашины: '+ data.carnumber +' ТК('+data.truckname+')',
                  overlay: {backgroundColor: '#000', opacity: 0.5}
                })
                .html(html)
                .find('#subm').unbind('submit').bind("submit", function (e) {
                  e.preventDefault();
                  var mainparam = {
                    truckid: data.truckid,
                    truckname: data.truckname,
                    carname: data.carname
                  };

                  var $trT = $('#tblNumtrailer').rf$GetFocus();
                  var $trD = $('#tblDrivers').rf$GetFocus();


                  if (!$trD.length && $(':checkbox.chkDr').attr('checked')) {
                    var paramD = $('#formDrivers').kFormSubmitParam();
                    paramD.truckid = mainparam.truckid;
                    paramD.driverid = '';
                    paramD.fio = $.trim(paramD.fio.replace(/\s+/g,' '));

                    if (paramD.fio =='' || paramD.phone ==''){
                     alert('Введите все данные водителя');
                     return false;
                    }
                    if($.isNotCirillic(paramD.fio)){
                     alert('ФИО должно содержать только русские буквы и точки');
                     return false;
                    }
                    if(paramD.fio.match(/[.]/g)!= null && paramD.fio.match(/[.]/g).length > 3 ){
                     alert('В ФИО не должно быть больше 2 точек');
                     return false;
                    }
                    if(paramD.fio.match(/[А-Я]/g)== null || !(paramD.fio.match(/[А-Я]/g).length > 1 && paramD.fio.match(/[А-Я]/g).length < 5)){
                     alert('Введите корректное ФИО, с заглавными буквами');
                     return false;
                    }
                  }

                  if (!$trT.length && $(':checkbox.chkTr').attr('checked')) {
                    var paramT = $('#formTrailer').kFormSubmitParam();
                    paramT.type = 'прицеп';
                    paramT.truckid = mainparam.truckid;

                    paramT.license = $.auto_layout_keyboard(paramT.license);

                    if (paramT.license =='' || paramT.carrying =='' || paramT.capacity =='' || paramT.capacitypal ==''){
                     alert('Введите все данные прицепа');
                     return false;
                   }
                  }

                  if ($(':checkbox.chkDr').attr('checked')){
                    var p = false;
                    $.ajax({
                      url: 'cngDriver',
                      dataType: 'json',
                      data: paramD,
                      success: function (json) {
                        if (!showErr(json)){
                          mainparam.driverid = json.data['0'].DRIVERID;
                          mainparam.driverfio = paramD.fio;
                          p = true;
                        }
                      },
                      async: false
                    });

                    if (!p)
                      return false;
                  }
                  else if ($trD.length) {
                    mainparam.driverid = kInt($trD.attr('driverid'));
                    mainparam.driverfio =  $trD.find('td[name=fio]').text();
                  }
                  else{
                     alert('Выберите водителя');
                     return false;
                  }


                  if ($(':checkbox.chkTr').attr('checked')){
                    var p = false;
                    $.ajax({
                      url: 'cngTrailer',
                      dataType: 'json',
                      data: paramT,
                      success: function (json) {
                        if (!showErr(json)){
                          mainparam.trailid = json.data['0'].CARID;
                          mainparam.trailer = paramT.license;
                          p =  true;
                        }
                      },
                      async: false
                    });
                    if (!p)
                      return false;
                  }
                  else if ($trT.length) {
                    mainparam.trailid = kInt($trT.attr('carid'));
                    mainparam.trailer =  $trT.find('td[name=license]').text();
                  }
                  else {
                    mainparam.trailid = '';
                    mainparam.trailer =  '-';
                  }

                  mainparam = $.extend(data, mainparam);
                  console.log(mainparam)

                  $("#dvTD").dialog('close');
                  $.taskcreate(mainparam);
                  return false;
                })
                 .find('>div>button:last').click(function () {
                    $("#dvTD").dialog('close');
                  }).end()
                .end()
                .find(':checkbox.chkTr').change(function () {
                  if(this.checked){
                   $('#tblNumtrailer').rf$GetFocus().removeClass(rfFocusClass);
                   $('#formTrailer')
                      .find('input.trailer[name=license]').val('').removeAttr('disabled').end()
                      .find('input.trailer[name=carrying]').val('').removeAttr('disabled').end()
                      .find('input.trailer[name=capacitypal]').val('').removeAttr('disabled').end()
                      .find('input.trailer[name=capacity]').val('').removeAttr('disabled').end();
                  }
                  else {
                   $('#formTrailer')
                      .find('input.trailer[name=license]').val('').attr('disabled', true).end()
                      .find('input.trailer[name=carrying]').val('').attr('disabled', true).end()
                      .find('input.trailer[name=capacitypal]').val('').attr('disabled', true).end()
                      .find('input.trailer[name=capacity]').val('').attr('disabled', true).end();
                  }
                 }).end()
                .find(':checkbox.chkDr').change(function () {
                  $('#tblDrivers tbody td[name="fio"]').kUnmarkText();
                  if(this.checked){
                   $('#tblDrivers').rf$GetFocus().removeClass(rfFocusClass);
                   $('#formDrivers')
                      .find('input.driver[name=fio]').val('').removeAttr('disabled').end()
                      .find('input.driver[name=phone]').val('').removeAttr('disabled').end();
                  }
                  else{
                    $('#formDrivers')
                      .find('input.driver[name=fio]').val('').attr('disabled', true).end()
                      .find('input.driver[name=phone]').val('').attr('disabled', true).end();
                  }
                 }).end()
                .find('select[name="listTrucks"]').unbind('change').change(function () {
                  var truckID = $(this).val();
                  $.getJSON('listDrivers',{truckid: truckID}, function (JSON) {
                    $('#tblDrivers tbody').html(htmlDriverTr(JSON));

                    $('#tblDrivers')
                      .kTblScroll()
                      // .kTblSorter()
                      .rowFocus({rfSetDefFocus:false, rfFocusCallBack: function (){
                         $(':checkbox.chkDr').removeAttr('checked');

                         $('#tblDrivers tbody td[name="fio"]').kUnmarkText();

                         var fio = $(this).find('>td[name=fio]').text();
                         var phone = $(this).find('>td[name=phone]').text();
                         $('#formDrivers')
                           .find('input.driver[name=fio]').val(fio).attr('disabled', true).end()
                           .find('input.driver[name=phone]').val(phone).attr('disabled', true).end();
                      }});

                  });
                  return false;
                 }).end()
                .find('input[name=carrying]').kInputFloat().end()
                .find('input[name=capacity], input[name=capacitypal]').kInputFloat().end()
                .find('input.driver[name=fio]').kInputFio().unbind('keyup').keyup(function () {
                  var search = $(this).val();
                  if (search.length >= 3){
                      $('#tblDrivers tbody td[name="fio"]').kUnmarkText().kMarkText(search);
                      $('#tblDrivers tbody td[name="fio"]').find('span:first').closest('tr').kScrollToTr();
                  } else {
                      $('#tblDrivers tbody td[name="fio"]').kUnmarkText();
                  }
                 }).end();

                var modalH = $('#dvTD div.modal-body:first').height();
                var contHeight = $('#dvTD div.formInp').height();
                var butH = $('#subm div.buttons').height();
                $('div.divInp').css('height', contHeight);
                $('div.tblSc').css('height', modalH - contHeight - butH - 30);

                $('#tblDrivers')
                  .kTblScroll()
                  // .kTblSorter()
                  .rowFocus({rfSetDefFocus:false, rfFocusCallBack: function (){
                     $(':checkbox.chkDr').removeAttr('checked');
                     $('#tblDrivers tbody td[name="fio"]').kUnmarkText();

                     var fio = $(this).find('>td[name=fio]').text();
                     var phone = $(this).find('>td[name=phone]').text();
                     $('#formDrivers')
                       .find('input.driver[name=fio]').val(fio).attr('disabled', true).end()
                       .find('input.driver[name=phone]').val(phone).attr('disabled', true).end();
                  }});

                $('#tblNumtrailer')
                  .kTblScroll()
                  .kTblSorter()
                  .rowFocus({rfSetDefFocus:false, rfFocusCallBack: function (){
                     $(':checkbox.chkTr').removeAttr('checked');

                     var license = $(this).find('>td[name=license]').text();
                     var carrying = $(this).find('>td[name=carrying]').text();
                     var capacity = $(this).find('>td[name=capacity]').text();
                     var capacitypal = $(this).find('>td[name=capacitypal]').text();
                     $('#formTrailer')
                       .find('input.trailer[name=license]').val(license).attr('disabled', true).end()
                       .find('input.trailer[name=capacity]').val(capacity).attr('disabled', true).end()
                       .find('input.trailer[name=capacitypal]').val(capacitypal).attr('disabled', true).end()
                       .find('input.trailer[name=carrying]').val(carrying).attr('disabled', true).end();
                  }});

                $("#formTrailer input[name='license']").mask(INP_MASK);

              dvTD();
            }
          });
        });
      });
    }

  };


  $.addTruck = function (data) {
      console.log(data)

    function dvAdTr() {
      $("#dvAdTr")
        .dialog("open");

      var oldparam = $.strToJSONold();

      if(oldparam.otruckid){
        $('#tblTrucks')
          .find('tr[truckid='+ oldparam.otruckid+']')
          .rfSetFocus();
      }
    }

    if ($("#dvAdTr").length){
      $("#dvAdTr").dialog("destroy").remove();
      createDialogAdTr();
    }
    else {
      createDialogAdTr();
    }

    function createDialogAdTr (){
      var html = '<div class="modal-body" style="height:100%;"><div style="width:100%;  text-align: center;">' +
        '<div class="info" style="float: left; width: 38%;"><b>Выбрать ТК из справочника</b></div>' +
        '<div class="info" style="display: inline-block; width: 1%; "></div>'+
        '<div class="info" style="display: inline-block; width: 30%; "><input class="chkTruck" type="checkbox"/><b>Добавить ТК вручную</b></div>'+
        '<div class="info" style="display: inline-block; width: 1%; "></div>'+
        '<div class="info" style="display: inline-block; width: 30%; "><b>Данные автомашины</b></div></div>'+
        '<div style="width:100%;"><div class="tblSc" style="float: left; width: 38%;  text-align: center">' ;

      $.ajax({
				url: 'listTruck',
				dataType: 'json',
				success: function (json) {
					if (!showErr(json)){
						html += '<table id="tblTrucks" style="width: 100%;">' +
            '<thead><tr><th>Транспортная компания</th><th>ФС</th><th>№ договора</th><th>Контактные данные</th></tr></thead><tbody>';
            for (var i = 0; i < json.data.length; i++) {
              var truck = json.data[i];
              html +=
                  '<tr truckid="' + truck.TRUCKID + '">' +
                    '<td name="name" class="text">'+truck.NAME+'</td>' +
                    '<td name="type" class="text">'+truck.TYPENAME+'</td>' +
                    '<td name="contract" class="text">'+truck.CONTRACT+'</td>' +
                    '<td name="address" class="text">'+truck.ADDRESS+'</td>' +
                  '</tr>';
            }
            html += '</tbody>'+
            '</table>' +
            '</div>';
					}
				},
				async: false
			});

      $.ajax({
				url: 'listTypeOwnerSh',
				dataType: 'json',
				success: function (json) {
					if (!showErr(json)){
						html+='<div class="tblSc" style="display: inline-block; width: 1%; "></div>' +
              '<div style="width:30%; display: inline-block;" class="tblSc">' +
            '<div class="formInp" style="float: left; width: 100%;  text-align: left; ">' +
             '<br><br>'+
               '<form id="formTruck" style="text-align: left">' +
                '<div class="rightTC">Наименование: </div><div class="leftTC"><input class="truck" type="text"  name="name" value="" disabled ></div><br><br>'+
                '<div class="rightTC">Форма собственности: </div><div class="leftTC"><select class="truck" name="type" disabled><option value="">Не выбрано</option>';
                  for (var i = 0; i < json.data.length; i++)
                    html += '<option value="' + json.data[i].ID + '" >' + json.data[i].NAME + '</option>';
                  html += '</select>'+
                '</div><br><br>'+
                '<div class="rightTC">Номер договора: </div><div class="leftTC"><input class="truck"  type="text" name="contract"  disabled value=""></div><br><br>'+
                '<div class="rightTC">Контактные данные: </div><div class="leftTC">' +
                    '<textarea class="truck" name="address" placeholder="Полное наименование, адрес места нахождения, номер телефона" disabled rows="3" style="width: 100%; resize: none"></textarea>' +
                    '</div>'+
              '</form>' +
            '</div></div>';
					}
				},
				async: false
			});


      html+='<div class="tblSc" style="display: inline-block; width: 1%; "></div>' +
            '<div  class="tblSc" style="display: inline-block; width: 30%;  text-align: center; vertical-align: top"><br><br>' +
            '<form id="formCar" style="text-align: left">' +
                '<div class="rightTC">Наименование ТС: </div><div class="leftTC"><input class="car"  type="text" name="carname" ></div><br><br>'+
                '<div class="rightTC">Гос.номер ТС: </div><div class="leftTC"><input class="car"  type="text"  placeholder="' + INP_PHOLDER + '" name="license" ></div><br><br>'+
                '<div class="rightTC">Вид автомобиля: </div><div class="leftTC"><select name="kind" ><option value="">Не выбрано</option>';

      $.ajax({
				url: 'listKindCar',
				dataType: 'json',
				success: function (json) {
					if (!showErr(json)){
						for (var i = 0; i < json.data.length; i++)
									html += '<option value="' + json.data[i].ID + '">' + json.data[i].NAME + '</option>';
					}
				},
				async: false
			});

      html += '</select></div><br><br>'+
                '<div class="rightTC">Грузоподъемность (т): </div><div class="leftTC"><input class="car"  type="text" name="carrying" value="" ></div><br><br>'+
                '<div class="rightTC">Вместимость (куб.м): </div><div class="leftTC"><input class="car"  type="text" name="capacity" value="" ></div><br><br>'+
                '<div class="rightTC">Вместимость (Паллет): </div><div class="leftTC"><input class="car"  type="text" name="capacitypal" value="" ></div><br><br>'+
              '</form>' +
            '</div>' +
            '</div>';



            html +='<div style="width:100%;"><form id="submCar"><div class="buttons" style="float: left; width: 100%; height: 10%"><hr>' +
            '<button type="submit" id="dvAdTrSaveBtn"><img src="' + eng_img + '/actions/accept.png" border="0">Далее</button> ' +
            '<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>'+
            '</div></form></div>';


          var dialogW = kScreenW()*0.9;
          var dialogH = kScreenH()*0.6;

          $("<div/>").attr("id", "dvAdTr").addClass("flora")
            .dialog({
              autoopen: false,
              height: dialogH,
              width: dialogW,
              modal: true,
              resizable: false,
              draggable: false,
              title: 'Добавление автомашины: '+ data.carnumber,
              overlay: {backgroundColor: '#000', opacity: 0.5}
            })
            .html(html)
            .find('#submCar').unbind('submit').bind("submit", function (e) {
              e.preventDefault();
              console.log(data)
              var mainparam = data;

              var paramCar = $('#formCar').kFormSubmitParam();
               paramCar.license = $.auto_layout_keyboard(paramCar.license);
               paramCar.carid = '';
               paramCar.typecar = '';
               paramCar.type = 'Автомобиль';
               if (paramCar.license =='' || paramCar.kind =='' || paramCar.carrying =='' || paramCar.capacity ==''|| paramCar.capacitypal =='' || paramCar.name ==''){
                 alert('Введите все данные автомобиля');
                 return false;
               }

              var $trTr = $('#tblTrucks').rf$GetFocus();

              if ($(':checkbox.chkTruck').attr('checked')){
               var param = $('#formTruck').kFormSubmitParam();
               param.truckid = '';
               param.status = '1';
               param.guid = '';
               param.name = $.trim(param.name.replace(/\s+/g,' '));
               if (param.name!='' && param.type!='' && param.contract!='' && param.address!=''){
                if (confirm('Добавить транспортную компанию в справочник?')) {
                  $.ajax({
                    url: 'cngTruck',
                    dataType: 'json',
                    data: param,
                    success: function (json) {
                      if (!showErr(json)){
                        var truck = json.data['0'];
                        mainparam.truckid = truck.TRUCKID;
                        mainparam.truckname = param.name;
                      }
                      else
                        return false;
                    },
                    async: false
                  });
                }
                else{
                  return false;
                }
               }
               else{
                 alert('Введите все данные транспортной компании');
                 return false;
               }
              }
              else if ($trTr.length) {
                mainparam.truckid = kInt($trTr.attr('truckid'));
                mainparam.truckname =  $trTr.find('td[name=name]').text();
              }
              else {
                 alert('Выберите ТК');
                 return false;
              }

              paramCar.truckid = mainparam.truckid;

              console.log(mainparam)

              $.ajax({
                url: 'cngCar',
                dataType: 'json',
                data: paramCar,
                success: function (json) {
                  if (!showErr(json)){
                    mainparam.carid = json.data['0'].CARID;
                    mainparam.carnumber = paramCar.license;
                    mainparam.carname = json.data['0'].CARNAME;

                    $.chooseTruckDriver(mainparam);
                    return false;
                  }
                  else
                    return false;
                },
                async: false
              });



              $("#dvAdTr").dialog('close');
              return false;
            })
             .find('>div>button:last').click(function () {
                $("#dvAdTr").dialog('close');
              }).end()
            .end()
            .find('input[name=carrying]').kInputFloat().end()
						.find('input[name=capacity], input[name=capacitypal]').kInputFloat().end()
            .find(':checkbox.chkTruck').change(function () {
              if(this.checked){
               $('#tblTrucks').rf$GetFocus().removeClass(rfFocusClass);
               $('#formTruck')
                  .find('input.truck[name=name]').val('').removeAttr('disabled').end()
                  .find('input.truck[name=contract]').val('').removeAttr('disabled').end()
                  .find('textarea.truck[name=address]').val('').removeAttr('disabled').end()
                  .find('select.truck[name=type]').val('').removeAttr('disabled').end();
              }
              else{
                $('#formTruck')
                  .find('input.truck[name=name]').val('').attr('disabled', true).end()
                  .find('input.truck[name=contract]').val('').attr('disabled', true).end()
                  .find('textarea.truck[name=address]').val('').attr('disabled', true).end()
                  .find('select.truck[name=type]').val('').attr('disabled', true).end();
              }
             }).end();

            var modalH = $('#dvAdTr div.modal-body:first').height();
            var butH = $('#submCar div.buttons').height();
            $('div.divInp').css('height', modalH - butH - 30);
            $('div.tblSc').css('height', modalH - butH - 30);

            $('#tblTrucks')
              .kTblScroll()
              .kTblSorter()
              .rowFocus({rfSetDefFocus:false, rfFocusCallBack: function (){
                 $(':checkbox.chkTruck').removeAttr('checked');

                 var name = $(this).find('>td[name=name]').text();
                 var type = $(this).find('>td[name=type]').text();
                 var contract = $(this).find('>td[name=contract]').text();
                 var address = $(this).find('>td[name=address]').text();
                 $('#formTruck')
                   .find('input.truck[name=name]').val(name).attr('disabled', true).end()
                   .find('select.truck[name=type]').val(type).attr('disabled', true).end()
                   .find('input.truck[name=contract]').val(contract).attr('disabled', true).end()
                   .find('textarea.truck[name=address]').val(address).attr('disabled', true).end();
              }});

            $("#formCar input[name='license']").val(data.carnumber).mask(INP_MASK);


          dvAdTr();
    }

  };

  $.taskcreate = function (aldata) {
      console.log(aldata)

    function dvTask() {
        $.getJSON('listGates', {'taskid': $("#dvPR").attr('pl_id')}, function (json) {
          if (!showErr(json)){
            var oldparam = $.strToJSONold();
            $('#gatelist option').remove();
            $("#dvTCR").find('#formInfo #gatelist').append('<option value="0">Выберите ворота</option>');
            for (var i = 0; i < json.data.length; i++) {
              $("#dvTCR").find('#formInfo #gatelist').append('<option value="'+json.data[i].GATEID+'">'+json.data[i].GATENAME+'</option>');
            }
            $("#dvTCR")
              .dialog("open").find('>form>select:first').focus().end();
            if(oldparam.ogateid){
              $("#dvTCR").find('#gatelist [value='+oldparam.ogateid+']').attr("selected", "selected").end()
            }
            if(oldparam.owhmode){
              $("#dvTCR").find('input[name=whmode]').val(oldparam.owhmode).end()
            }
            if(oldparam.onumstump){
              $("#dvTCR").find('input[name=numstump]').val(oldparam.onumstump).end()
            }
          }
      })
    }


    if ($("#dvTCR").length){
      $("#dvTCR").dialog("destroy").remove();
      createDialogCT();
    }
    else {
      createDialogCT();
    }
    function createDialogCT () {

      var html = '<div style="width:100%;" class="divInp"><div class="formInp" style="float: left; width: 48%;  text-align: left">' +
        '<form id="formInfoDis" style="text-align: center; width: 100%">'+
            '<div class="rightTC"><b>Транспортная компания: </b></div><div class="leftTC"><input type="text" name="name" value="'+aldata.truckname+'" disabled></div><br><br>'+
            '<div class="rightTC"><b>Водитель: </b></div><div class="leftTC"><input type="text" name="driverfio" value="'+aldata.driverfio+'" disabled></div><br><br>'+
            '<div class="rightTC"><b>Гос.номер авто: </b></div><div class="leftTC"><input type="text"  name="carnumber" value="'+aldata.carnumber+'" disabled></div><br><br>'+
          '</form>' +
        '</div>';

      html+='<div class="formInp"  style="display: inline-block; width: 2%; "></div>' +
        '<div class="formInp"  style="display: inline-block; width: 48%;  text-align: left; ">' +
        '<form id="formInfo" style="text-align: center; width: 100%;">' +
          '<div class="rightTC"><b>Наименование авто: </b></div><div class="leftTC"><input type="text"  name="carname" value="'+aldata.carname+'" disabled></div><br><br>'+
          '<div class="rightTC"><b>№ прицепа: </b></div><div class="leftTC"><input type="text"  name="numtrailer" value="'+aldata.trailer+'" disabled></div><br><br>'+
            //'<div class="rightTC"><b>№ ворот: </b></div><div class="leftTC"><select name="gateid" id="gatelist"></select></div><br><br>'+
            '<div class="rightTC" ><b>№ пломбы: </b></div><div class="leftTC"><input  type="text" name="numstump" value="" ></div><br><br>'+
          '</form>' +
          '</div>' +
        '</div>';


       html +='<div style="width:100%;"><form id="submT"><div class="buttons" style="float: left; width: 100%; height: 10%"><hr>' +
        '<button type="submit" id="dvTDSaveBtn"><img src="' + eng_img + '/actions/accept.png" border="0">Сохранить</button> ' +
        '<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>'+
        '</div></form></div>';



      $("<div/>").attr("id", "dvTCR").addClass("flora")
        .dialog({
          autoopen: false,
          height: 220,
          width: 750,
          modal: true,
          resizable: false,
          draggable: false,
          title: 'Сохранить задание',
          overlay: {backgroundColor: '#000', opacity: 0.5}
        })
        .html(html)
        .find('#submT').unbind('submit').bind("submit", function (e) {
          e.preventDefault();
          var param = {}//$('#formInfo').kFormSubmitParam();
          if (param.gateid == "0") {
            alert ('Выберите ворота');
            return false;
          }
          //param.descript = '{"whmode": "' + param.whmode + '", "numstump" : "' + param.numstump + '"}' ;
          //param.pltaskid = $("#dvPR").attr('pl_id');
          //param.taskid = $("#dvPR").attr('taskid');
          param.driverid = aldata.driverid;
          param.carid = aldata.carid;
          param.trailerid = aldata.trailid;
          param.numstump = $('#formInfo').find('input[name="numstump"]').val()
          //param.wordnum = aldata.wordnum;
          //param.wordclid = aldata.wordclid;
          param.truckid = aldata.truckid;
          param.taskid = aldata.taskid

          $.ajax({
            url: 'taskAuto',//$("#dvPR").attr('url'),
            dataType: 'json',
            data: param,
            success: function (json) {
              /*if (!showErr(json)){
                var wnd = window.open('printGateTaskList?taskid=' + (param.taskid ? param.taskid : json.data['TASKID']));
                wnd.onload = function () {

                  //wnd.document.getElementById("barcodeInfo").innerHTML = html;
                  $(wnd.document).find('.barcode').each(function () {

                    var $this = $(this);
                    var barcode = $this.text();
                    $this.text('');
                    $this.barcode(barcode, 'code128', {barWidth: '2', barHeight: '55', fontSize: '0'});
                    $this.css({'padding-left': (($this.parent().width() - $this.width()) / 2), 'overflow': 'hidden'});
                  });
                };

                $("#dvTCR").dialog('close');
                $.drawUpdTasksTable(json);

            }*/},
            async: false
          });
          $("#dvTCR").dialog('close');
          $.ajax({
              url: 'reloadTaskInfo',
              dataType: 'json',
              data: {taskid: param.taskid},
              success: function (json) {
                $.reloadTaskInfo(json.data)
              }
          })

        return false;
        })
         .find('>div>button:last').click(function () {
            $("#dvTCR").dialog('close');
          }).end()
        .end();

          dvTask();

    }
  };



})(jQuery);