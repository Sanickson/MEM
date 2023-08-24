$(document).ready(function () {

  $('#dvTbl').css({'width': kScreenW(), 'height': kScreenH(), 'float': 'none'});
  $('#objName').unbind('click').kObjAutoComplete({hiddenName: 'objid'});
  $('#frmFilter').submit(function(){
    var p = $(this).kFormSubmitParam({nullVal: 'null'});
    $.listBarcodes(p);
    return false;
  });
  //$.listBarcodes();
});

;
(function ($) {

  function listBarcodes(param) {
    function mTheadId() {
      var m = 'menuTblThead';
      if ($("#" + m).length === 0) {
        $("<ul/>").attr("id", m).addClass("contextMenu")
          .html('<li class="add"><a href="#add">Добавить</a></li>'
        )
          .css('width', '120px')
          .appendTo($(document.body));
      }
      return m;
    }

    function mTbodyTrId() {
      var m = 'menuTblTbodyTr';
      if ($("#" + m).length === 0) {
        $("<ul/>").attr("id", m).addClass("contextMenu")
          .html('<li class="add"><a href="#add">Добавить</a></li>' +
          '<li class="delete"><a href="#del">Удалить</a></li>'
        )
          .css('width', '120px')
          .appendTo($(document.body));
      }
      return m;
    }

    $.getJSON('listBarcodes', param, function (JSON) {
      if (!showErr(JSON)) {
        var html = '<table id="tbl" style="width:100%"><thead><tr>' +
            '<th>Клиент</th>' +
            '<th colspan="2">Товар</th>' +
            '<th>Маска</th>' +
            '<th colspan="2">Килограмм</th>' +
            '<th colspan="2">Грамм</th>' +
          '</tr>' +
          '<tr>' +
            '<th ksort="text">Наименование</th>' +
            '<th ksort="digit">Код</td>' +
            '<th ksort="text">Наименование</td>' +
            '<th ksort="text">Формат</td>' +
            '<th ksort="digit">С</td>' +
            '<th ksort="digit">По</td>' +
            '<th ksort="digit">С</td>' +
            '<th ksort="digit">По</td>' +
          '</tr>' +
          '</thead><tbody>';
        for (var i = 0, n = JSON.data.length; i < n; ++i)
          html += trHtml(JSON.data[i]);
        html += '</tbody></table>';
        $('#dvTbl').html(html)
          .find('>table')
          .kTblScroll().kTblSorter().rowFocus({rfSetDefFocus: true})
          .find('thead').contextMenu({menu: mTheadId()}, function(action, el){
            if (action == 'add')
              add();
          }).end();

          $('#tbl tbody>tr').contextMenu({menu: mTbodyTrId()}, function (action, el) {
            if (action == 'add')
              add();
            else if (action == 'del')
              del.call(el);
          }).end();
      }
    });
  }

  $.listBarcodes = listBarcodes;

  function trHtml(r) {
    var html = '<tr id=tr_' + r.WBWID + '>' +
      '<td class="text">' + r.OBJNAME + '</td>' +
      '<td class="number">' + r.WCODE + '</td>' +
      '<td class="text">' + r.WNAME + '</td>' +
      '<td>' + r.FORMATSTR + '</td>' +
      '<td class="number">' + r.KG1 + '</td>' +
      '<td class="number">' + r.KG2 + '</td>' +
      '<td class="number">' + r.MG1 + '</td>' +
      '<td class="number">' + r.MG2 + '</td>' +
      '</tr>';
    return html;
  }


  function add() {
    if ($("#frmAdd").length) {
      $("#frmAdd").dialog("destroy").remove();
    }

    var html = '<input type=hidden name=objid value="null">' +
      '<input type=hidden name=waresid id="frmAddWaresId" value="null">' +
      '<b>Клиент:</b> <input type=text id="frmAddClient" value=""><br>'+
      '<b>Товар:</b> <input type=text id="frmAddWares" value=""><br>' +
      '<b>Маска:</b> <input title="Цифры 0-9 и символ _ для обозначения любоий цифры. Пример: 2373522______" type=text id="frmAddMask" value="" name="mask"><br>' +
      '<b>Килограмм:</b> <input type=text id="frmAddKG1" size=2 value=0 name="kg1">-<input type=text id="frmAddKG2" size=2 value=0 name="kg2"><br>' +
      '<b>Грамм:</b> <input type=text id="frmAddMG1" size=2 value=0 name="mg1">-<input type=text id="frmAddMG2" size=2 value=0 name="mg2"><hr>' +
      '<button type=submit>Сохранить</button><button type=button>Закрыть</button>';

    $('<form/>').attr("id", "frmAdd").addClass("flora").addClass("buttons")
      .css("text-align", "center")
      .dialog({
        closeOnEscape: false, title: 'Добавление',
        autoOpen: true, resizable: false,
        draggable: false, modal: true,
        overlay: {opacity: 0.5, background: "black"},
        height: 200, width: 340
      })
      .html(html)
      .find("button:last").click(function () {
        $("#dvAdd").dialog("close");
      }).end();
    $('#frmAddClient').unbind('click').kObjAutoComplete({hiddenName: 'objid'});
    $('#frmAddWares').kWaresLocate({idHE: 'frmAddWaresId'});
    $('#frmAddKG1, #frmAddKG2, #frmAddMG1, #frmAddMG2').kInputInt();
    $('#frmAdd').submit(function(){
      var P = $(this).kFormSubmitParam();
      $.getJSON('addWBW', P, function(json){
        if (!showErr(json)){
          $('#frmAdd').dialog('close');
          listBarcodes();
        }
      });
      return false;
    })
  }

  function del(){
    $.getJSON('delWBW', {wbwid: $(this).attr('id').split('_')[1]}, function (json) {
      if (!showErr(json)) {
        listBarcodes();
      }
    });
  }

})(jQuery);