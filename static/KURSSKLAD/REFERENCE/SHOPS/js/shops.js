var tblCodeClient = 'SHOPS_CLIENT';//код таблицы в IFACE_TBL
//var tblCodeBrand = 'SHOPS_BRAND';//код таблицы в IFACE_TBL
var prefTr = 'trW'; //префикс атрибута строки
var tbl;
(function ($) {
     function whid(){
      return tbl.extdata.WHID;
     }
     // обновление измененных строк таблицы
     $.trWaresUpd = function(json){
        if (!showErr(json)) {
          tbl.data(json);
        }
    };


     //изменение 1-го элемента по двойному нажатию
     $.td1 = function() { //при 2нажатии не зависит от checked
       var tdInd = $(this)["0"].cellIndex; //индекс выбранной ячейки


       var $tbl = $('#'+tbl._tblId+' > thead > tr:first');
       var ClientSel = [];

       if ($tbl.find('>th[data-clm = TYPENAME]').length)
         ClientSel.push($tbl.find('>th[data-clm = TYPENAME]')["0"].cellIndex);

       if ($tbl.find('>th[data-clm = BRANDNAME]').length)
         ClientSel.push($tbl.find('>th[data-clm = BRANDNAME]')["0"].cellIndex);

       if ($tbl.find('>th[data-clm = ENTITYNAME]').length)
         ClientSel.push($tbl.find('>th[data-clm = ENTITYNAME]')["0"].cellIndex);

       if ($tbl.find('>th[data-clm = REGCODE]').length)
         ClientSel.push($tbl.find('>th[data-clm = REGCODE]')["0"].cellIndex);

       if ($tbl.find('>th[data-clm = ENTITYCODE]').length)
         ClientSel.push($tbl.find('>th[data-clm = ENTITYCODE]')["0"].cellIndex);

       if ($tbl.find('>th[data-clm = Rl]').length)
         ClientSel.push($tbl.find('>th[data-clm = Rl]')["0"].cellIndex);

       if ($tbl.find('>th[data-clm = EMAIL]').length)
         ClientSel.push($tbl.find('>th[data-clm = EMAIL]')["0"].cellIndex);



       if ($.inArray(tdInd, ClientSel) != -1) {//если попадаем в область,  открывается изменение
          $(this).cngClients();
          return false;
       }

       var waresSel = [];

       if ($tbl.find('>th[data-clm = PALLETWARES]').length)
         waresSel.push($tbl.find('>th[data-clm = PALLETWARES]')["0"].cellIndex);


       if ($.inArray(tdInd, waresSel) != -1) {//если попадаем в область,  открывается изменение
          $(this).cngClientPalletWares();
          return false;
       }

       var address = [];

       if ($tbl.find('>th[data-clm = ADDRESS]').length)
         address.push($tbl.find('>th[data-clm = ADDRESS]')["0"].cellIndex);

       if ($tbl.find('>th[data-clm = RADDRESS]').length)
         address.push($tbl.find('>th[data-clm = RADDRESS]')["0"].cellIndex);


       if ($.inArray(tdInd, address) != -1) {//если попадаем в область,  открывается изменение
          $(this).cngClientAddress();
          return false;
       }

       var trnpriority = [];

       if ($tbl.find('>th[data-clm = TRNPRIORITY]').length)
         trnpriority.push($tbl.find('>th[data-clm = TRNPRIORITY]')["0"].cellIndex);

       if ($tbl.find('>th[data-clm = TRNPRIORITY]').length)
         trnpriority.push($tbl.find('>th[data-clm = TRNPRIORITY]')["0"].cellIndex);


       if ($.inArray(tdInd, trnpriority) != -1) {//если попадаем в область,  открывается изменение
          $(this).cngClientPriority();
          return false;
       }


     };

     //изменение для выбранных элементом по контекстному меню
     $.tdsCl = function() {
       $(this).cngClients();
     };
     //изменение для выбранных элементом по контекстному меню
     $.tdsClEmail = function() {
       $(this).cngClientEmail();
     };

     //изменение для выбранных элементом по контекстному меню
     $.tdsClAddress = function() {
       $(this).cngClientAddress();
     };

     $.tdsClPriority = function() {
       $(this).cngClientPriority();
     };

     $.tdsClHide = function() {
       $(this).hideClient();
     };

     $.tdsClReturn = function() {
       $(this).returnClient();
     };

     $.smPBL = function() {
       $(this).smPBL();
     };

     $.inactiveClient = function () {
        $.getJSON("qShop",{status:'0'}, function (json) {
          if(!showErr(json) && json.data.length>0){
            tbl.data(json);
            $('#'+tbl.trId(json.data[0].TOID)).rowFocus().kScrollToTr();
          }
        });
        return false;
     }



})(jQuery);

$(document).ready(function(){
    var height = kScreenH();
    $("#dvScreen").css({"height": height, "width": "100%" });

   	function tdRouteL(tr, fld){
     var kN = kNumber(tr[fld]);
     if (kN == 1 ) {
       return '<td title ="Выносить в отдельный МЛ"><img src="' + eng_img + '/actions/tick.png" border="0"></td>';
     }
     else {
       return '<td height="16" width="16"></td>';
     }}


    $('#dvWaresLocate')
            .dialog({
                autoOpen: false, title: 'Настройка товаров паллет',
                modal: true, resizable: false,
                draggable: false, width: 400, height: 250,
                overlay: {backgroundColor: '#000', opacity: 0.5}
            });

   function tdEnable(tr, fld){
    var kN = tr[fld];
    if (kN == 1 ) {
      return '<td title ="Активный"><img src="' + eng_img + '/actions/add.png" border="0"></td>';
    }
    else if (kN == 0) {
      return '<td title ="Неактивный"><img src="' + eng_img + '/actions/delete.png" border="0"></td>';
    }
    else if (kN == 'N') {
      return '<td title ="Ненастроенный"><img src="' + eng_img + '/actions/edit.png" border="0"></td>';
    }
  }

    SetTr = function  (data, clmSortKey) {
      return '<tfoot><tr><th class="buttons" colspan="'+clmSortKey.length+'">' +
        '<button type="button" title="Показать скрытые" class="add" onclick="$.inactiveClient()"><img src="'+eng_img+'/actions/open.png" border="0"></button>' +
        '</th></tr></tfoot>';
    }

    clientlist();

    function tblEvents(){
      if ($(this).is('tr')){
        $(this).find('td').unbind('dblclick').dblclick($.td1);
      }
      else{
        var $trs = $(this).find('tbody>tr');
        $trs.find('td').unbind('dblclick').dblclick($.td1);
      }
    }

    function clientlist(){
      if (tbl)
        tbl = $.TblDel(tbl);
      tbl = $('#dvScreen').empty().Tbl({
        code: tblCodeClient,
        events: tblEvents,
        contextMenu: {
          /*optSortKey: ['ShAddChng', 'ShAddEmail', 'ShAddAddress', 'ShTRNPriotity', 'ShDelete', 'Return', 'SMPBL'],
          funcShAddChng: $.tdsCl, classShAddChng: 'edit separator', nameShAddChng: 'Редактирование',
          funcShAddEmail: $.tdsClEmail, classShAddEmail: 'send separator', nameShAddEmail: 'Электронная почта',
          funcShAddAddress: $.tdsClAddress, classShAddAddress: 'address separator', nameShAddAddress: 'Адрес клиента',
          funcShTRNPriotity: $.tdsClPriority, classShTRNPriotity: 'statusUpDown separator', nameShTRNPriotity: 'Приоритет клиента',
          funcShDelete: $.tdsClHide, classShDelete: 'delete separator', nameShDelete: 'Удалить клиента',
          funcReturn: $.tdsClReturn, classReturn: 'add separator', nameReturn: 'Восстановить клиента',
          funcSMPBL: $.smPBL, classSMPBL: 'edit', nameSMPBL: 'Pick-By-Lite'*/
            optSortKey: ['ShAddChng', 'ShDelete', 'Return'],
          funcShAddChng: $.tdsCl, classShAddChng: 'edit separator', nameShAddChng: 'Редактирование',
          funcShDelete: $.tdsClHide, classShDelete: 'delete separator', nameShDelete: 'Удалить клиента',
          funcReturn: $.tdsClReturn, classReturn: 'add separator', nameReturn: 'Восстановить клиента',
        },
        foot: {footSet: SetTr},
        rowFocus: {rfSetDefFocus: false},
        userFunc: {tdRl: tdRouteL, tdEnable: tdEnable}
      });
      $.getJSON("qShop",{'status': '1,N'}, function (json) {
        tbl.data(json);
      });
      return false;
    }
});



