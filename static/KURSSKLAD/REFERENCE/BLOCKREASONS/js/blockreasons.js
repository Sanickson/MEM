$(document).ready(function () {
  var containerheight = kScreenH();
  $('#dvTable').css({'width': '50%', 'height': containerheight});

  $.getJSON('listBlockreasons', $.tblMain);
});


;(function ($) {
  function tr(json) {
    var html = '';
    for (var i = 0; i < json.data.length; i++) {
      var tr = json.data[i];
      html += '<tr brid="' + tr.ID + '">\
						<td class="code">' + tr.CODE + '</td>\
						<td class="text name">' + tr.NAME + '</td>\
					</tr>';
    }
    return html;
  }

  $.tblMain = function (JSON) {
    if (!showErr(JSON)) {
      var html = '<table id="tblBR">\
			             <thead>\
						  <tr>\
							<th>Код</th>\
						    <th>Наименование</th>\
						  </tr>\
						 </thead>\
						<tbody>';
      html += tr(JSON);
      html += '</tbody><tfoot><tr><th class="buttons" colspan="2">\
						<button type="button" title="Добавить" class="addbr"><img src="' + eng_img + '/actions/add.png" border="0"></button>\
						<button type="button" title="Изменить" class="cngbr"><img src="' + eng_img + '/actions/edit.png" border="0"></button>\
						<button type="button" title="Удалить" class="delbr"><img src="' + eng_img + '/actions/delete.png" border="0"></button>\
					</th></tr></tfoot></table>';
      $('#dvTable').html(html)
        .find('table')
        .kTblScroll()
        .tablesorter()
        .rowFocus()
        .find('>tfoot>tr>th>button')
        .filter('.addbr').click(addBR).end()
        .filter('.cngbr').click(cngBR).end()
        .filter('.delbr').click(delBR).end()
    }
  }

  function addBR() {
    function frmSubmit(param) {
      $.getJSON("cngBlockreasons", param, function (json) {
        if (!showErr(json)) {
          //var tr = JSON.data;
          var html = tr(json);
          $('#tblBR').children('tbody').append(html).end()
            .kTblScroll()
            .tablesorter()
            .rowFocus({rfSetDefFocus: false})
            .find('tr[brid="' + json.data[0].ID + '"]')
            .rfSetFocus()
            .kScrollToTr()
          $("#dvBR").dialog("close");
        }
      })
    };
    $brDialog({title: 'Добавление причины блокировки'}, {frmSubmit: frmSubmit, btnConfTitle: 'Добавить'});
  }

  function cngBR() {
    var $tr = $('#tblBR').rf$GetFocus();
    if ($tr.length==0){
      alert('Выберите причину для корректировки!');
      return;
    }
    function frmSubmit(param) {
      $.getJSON("cngBlockreasons", param, function (JSON) {
        if (!showErr(JSON)) {
          var html = tr(JSON);

          $('#tblBR>tbody>tr[brid="' + JSON.data[0].ID + '"]')
            .replaceWith(html)
          $('#tblBR')
            .kTblScroll()
            .tablesorter()
            .rowFocus({rfSetDefFocus: true})

          $("#dvBR").dialog("close");
        }
      });
    };
    $brDialog({title: 'Изменение причины'}, {
      frmSubmit: frmSubmit,
      btnConfTitle: 'Изменить',
      $tr: $('#tblBR').rf$GetFocus()
    });
  }

  function delBR() {
    $(this).showConf({
      text: 'Вы действительно хотите удалить причину?',
      confirm: function () {
        $.getJSON("delBlockreasons", {brid: $('#tblBR').rf$GetFocus().attr('brid')}, function (JSON) {
          if (!showErr(JSON)) {
            $('#tblBR>tbody>tr[brid="' + JSON.ext_data.ID + '"]').remove();
            $('#tblBR').kTblScroll();
            $("#dvBR").dialog("close");
          }
        });
      }
      /*cancel: function () {
        $("#dvBR").dialog("close");
      }*/
    });
  }


  function $brDialog(dvOptions, depOptions) {
    var dvOptions = $.extend({
      closeOnEscape: false, title: '',
      autoOpen: true, resizable: false,
      draggable: false, modal: true,
      overlay: {opacity: 0.5, background: "black"},
      height: 160, width: 340
    }, dvOptions);
    var depOptions = $.extend({$tr: false, frmSubmit: false, btnConfTitle: false}, depOptions);

    if ($("#dvBR").length)
      $("#dvBR").dialog("destroy").remove();

    var html = '<input type="hidden" name="brid" value="' + (depOptions.$tr ? depOptions.$tr.attr('brid') : '') + '">' +
      '<textarea placeholder="Текст причины блокировки" maxlength="80" rows="3" type="text" name="name" style="resize: None; width:100%;">'+
        (depOptions.$tr ? depOptions.$tr.find('td.name').text() : '') +
      '</textarea>\
         <hr>\
         <div class="buttons" style="width:100%;">' +
      (depOptions.btnConfTitle ? '<button type="submit" id="dvDocConfOk"><img src="' + eng_img + '/actions/accept.png" border="0">' + depOptions.btnConfTitle + '</button>&nbsp;&nbsp;&nbsp;' : '') +
      '<button type="button" id="dvDocConfCanc"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
      '</div>'
    $('<form/>').attr("id", "dvBR").addClass("flora")
      .css("text-align", "center")
      .dialog(dvOptions)
      .html(html).find('table')
      .kTblScroll().end()
      .find("button:last").click(function () {
        $("#dvBR").dialog("close");
      }).end();

    $("#dvBR").submit(function () {
      var param = $(this).kFormSubmitParam();
      if (!param.name){
        alert("Не заполнено наименование причины.");
      }
      else{
        depOptions.frmSubmit(param);
      }
      return false;
    }).find('textarea').focus(function(){
      $(this).select();
    }).focus();
  }

})(jQuery);