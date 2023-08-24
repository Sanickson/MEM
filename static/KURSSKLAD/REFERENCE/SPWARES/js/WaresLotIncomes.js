// партии ( по приходам)
(function ($) {

  $.fn.WaresLotIncomes = function (options) {
    var options = $.extend({
      'wid': false, // товар
      'objid': false, // объект
      'wlincstatus': false
    }, options);

    if (!options.wid) {
      showMes('Внимание', 'Товар не найден!');
      return false;
    }


    var $container = $(this).html('<div style="position:relative;float:left;height:50%;width:100%;">\
                                         <div style="position:relative;float:left;height:100%;width:50%;"></div>\
                                         <div style="position:relative;float:left;height:100%;width:50%;"></div>\
                                       </div>\
                                       <div style="position:relative;float:left;height:50%;width:100%;"></div>');
    var params = {
      'wid': options.wid,
      'objid': options.objid
    }
    $.getJSON('listWaresLotInc', params, listWaresLotIncItems);
    return $(this);

    function listWaresLotIncItems(json) {
      if (!showErr(json)) {
        var html = '<table><thead><tr>\
                                <th ksort="shortDate">Произведен</th>\
                                <th ksort="">Кол-во</th>\
                                <th ksort="digit">Итого</th>\
                            </tr></thead><tbody>';
        var amount_sum = 0;
        for (var i = 0; i < json.data.length; i++) {
          var tr = json.data[i];
          var title = tr.VUCODE ? viewTitle(tr.MUCODE, tr.VUFACTOR, tr.VUCODE) : 'Единица отображения не установлена!';
          amount_sum += tr.AMOUNT;
          html += '<tr wlid="' + tr.WLID + '">' +
            '<td>' + kDate(tr.WLPRODUCTDATE) + '</td>' +
            '<td title="' + title + '">' + viewQuantity(tr.AMOUNT, tr.VUFACTOR, tr.VUCODE, tr.MUFACTOR, tr.MUCODE) + '</td>' +
            '<td class="number">' + kNumber(tr.AMOUNT) + '</td>' +
            '</tr>';
        }
        html += '</tbody><tfoot><tr class="buttons"><th>' + i + '</th><th colspan="1"></th><th>' + kNumber(amount_sum) + '</th></tr></tfoot></table>';
        $container.find('>div:first>div:first').html(html)
          .find('table')
          .kTblScroll()
          .kTblSorter()
          .rowFocus({
            rfSetDefFocus: true, rfFocusCallBack: function () {
              var params = {'wlid': $(this).attr('wlid')}
              $.getJSON('listWaresLotIncItems', params, listWaresLotIncItemsDetails);
              $.getJSON('listWaresLotIncDocsAll', params, listWaresLotIncItemsDocsAll);
            }
          })
      }
    }

    function listWaresLotIncItemsDocsAll(json) {
      if (!showErr(json)) {
        var html = '<table><thead><tr>\
              <th ksort="">Статус</th>\
              <th ksort="">Код</th>\
              <th ksort="text">Тип</th>\
              <th ksort="shortDate">Дата(Док)</th>\
              <th ksort="digit">Номер</th>\
              <th ksort="text">От кого</th>\
              <th ksort="text">Кому</th>\
          </tr></thead><tbody id="tbodyWLincomes">';
        for (var i = 0; i < json.data.length; i++) {
          var tr = json.data[i];
          html += '<tr wlinid="' + tr.WLINID + '" status="' + tr.STATUS + '">' +
            $.tdPlusMinus(tr.STATUS) +
            '<td class="">' + (tr.DOCID ? 'O' + kInt(tr.DOCID) : '') + '</td>' +
            '<td class="text">' + tr.DTNAME + '</td>' +
            '<td class="">' + kDate(tr.DOCDATE) + '</td>' +
            '<td class="">' + tr.DNUMBER + '</td>' +
            '<td class="text">' + tr.FROMOBJNAME + '</td>' +
            '<td class="text">' + tr.TOOBJNAME + '</td>' +
            '</tr>';
        }
        html += '</tbody><tfoot class="buttons"><tr><th>' + i + '</th><th colspan="7"></th></tr></tfoot></table>';

        $container.find('>div:first>div:last').html(html)
          .find('table')
          .kTblScroll()
          .kTblSorter()
          .find('tbody>tr').dblclick(function () {
            if (!options.wlincstatus)
              return false;
            var $tr = $(this);
            if ($tr.attr('status') == '0') {
              $.getJSON('changeWaresLotIncSt', {wlinid: $tr.attr('wlinid'), status: '1'}, trWLIncomeChgStat);
            }
            else {
              waresLotIncomeBlock($tr.attr('wlinid'));
            }
          })
      }
    }


    function listWaresLotIncItemsDetails(json) {
      if (!showErr(json)) {
        var html = '<table><thead><tr>\
                                <th ksort="text">МП</th>\
                                <th ksort="">Поддон</th>\
                                <th ksort="">Кол-во</th>\
                                <th ksort="digit">Итого</th>\
                                <th ksort="">Код</th>\
                                <th ksort="text">Тип</th>\
                                <th ksort="shortDate">Дата(Док)</th>\
                                <th ksort="">Номер</th>\
                                <th ksort="text">От кого</th>\
                                <th ksort="text">Кому</th>\
                            </tr></thead><tbody>';
        var wliamount_sum = 0;
        for (var i = 0; i < json.data.length; i++) {
          var tr = json.data[i];
          var title = tr.VUCODE ? viewTitle(tr.MUCODE, tr.VUFACTOR, tr.VUCODE) : 'Единица отображения не установлена!';
          wliamount_sum += tr.WLIAMOUNT;
          html += '<tr>' +
            '<td class="">' + tr.SNAME + '</td>' +
            '<td class="">' + (tr.PNUM ? tr.PNUM : '&nbsp;') + '</td>' +
            '<td title="' + title + '">' + viewQuantity(tr.WLIAMOUNT, tr.VUFACTOR, tr.VUCODE, tr.MUFACTOR, tr.MUCODE) + '</td>' +
            '<td class="number">' + kNumber(tr.WLIAMOUNT) + '</td>' +
            '<td class="">' + (tr.DOCID ? 'O' + kInt(tr.DOCID) : '&nbsp;') + '</td>' +
            '<td class="text">' + (tr.DTNAME ? tr.DTNAME : '&nbsp;') + '</td>' +
            '<td class="">' + kDate(tr.DOCDATE) + '</td>' +
            '<td class="">' + (tr.DNUMBER ? tr.DNUMBER : '&nbsp;') + '</td>' +
            '<td class="text">' + (tr.FROMOBJNAME ? tr.FROMOBJNAME : '&nbsp;') + '</td>' +
            '<td class="text">' + (tr.TOOBJNAME ? tr.TOOBJNAME : '&nbsp;') + '</td>' +
            '</tr>';
        }
        html += '</tbody><tfoot class="buttons"><tr>\
                            <th>' + i + '</th>\
                            <th colspan="2">&nbsp;</th>\
                            <th colspan="">' + kNumber(wliamount_sum) + '</th>\
                            <th colspan="6">&nbsp;</th>\
                        </tr></tfoot></table>';

        $container.find('>div:last').html(html)
          .find('table')
          .kTblScroll()
          .kTblSorter()
      }
    }
  }

  function trWLIncomeChgStat(json){
    if (!showErr(json)) {
      var $tr = $('#tbodyWLincomes>tr[wlinid="' + json.ext_data.wlinid + '"]');
      if ($tr)
        $tr.attr('status', json.data.STATUS).find('td:first').replaceWith($.tdPlusMinus(json.data.STATUS));
      if ($('#frmWaresLotIncomeBlock').length){
        $('#frmWaresLotIncomeBlock').dialog('close');
      }
    }
  }

  function waresLotIncomeBlock(wlinid){
    var $dv = $('#frmWaresLotIncomeBlock');
    if ($dv.length) {
      $dv.attr('wlinid', wlinid);
      $dv.find('textarea[name="description"]').val('');
      $dv.find('select[name="reasonid"]').val('null');
      $dv.dialog('open');
    }
    else{
      var html = '<select name="reasonid" style="width:100%;">' +
        '<option value="null">Выберите причину блокировки</option></select><br><br>' +
        '<textarea spellcheck="true" placeholder="Примечание (не обязательно)" ' +
        'style="width:100%;padding:0;resize:none;" name="description" maxlength="1024" rows="5"></textarea><hr>' +
        '<div style="width:100%;" class="buttons">\
          <button type="submit" id=""><img src="' + eng_img + '/actions/accept.png" border="0">Заблокировать</button>&nbsp;&nbsp;\
          <button type="button" id=""><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>\
         </div>';

      var $dv = $("<form/>").attr('wlinid', wlinid).attr("id", "frmWaresLotIncomeBlock").addClass("flora")
        .dialog({
          title: 'Блокировка партии',
          autoOpen: true, modal: true, closeOnEscape: true,
          resizable: false, draggable: false,
          overlay: {opacity: 0.5, background: "black"},
          height: 200, width: 350
        }).html(html).submit(function(){
          var P = $(this).kFormSubmitParam();
          if (P.reasonid == 'null'){
            alert('Выберите причину блокировки из списка!');
            return false;
          }
          P.wlinid = $(this).attr('wlinid');
          P.status = '0';
          $.getJSON('changeWaresLotIncSt', P, trWLIncomeChgStat);
          return false;
        }).find('button[type=button]').click(function(){
          $('#frmWaresLotIncomeBlock').dialog('close');
        }).end()
        .find('textarea[name=description]').width($('#frmWaresLotIncomeBlock select[name=reasonid]').width()).end();

      $.getJSON('listWaresLotIncomesBlockReasons',function(json){
        if (!showErr(json)){
          var html = '';
          for (var i=0; i<json.data.length; i++){
            var o = json.data[i];
            html += '<option value="' + o.ID + '">' + o.NAME + '</option>';
          }
          var $select = $('#frmWaresLotIncomeBlock select[name="reasonid"]');
          $select.html($select.html()+html);
        }
      });
    }
  }
})(jQuery);


