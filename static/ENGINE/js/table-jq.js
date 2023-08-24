/**
 * Created by User on 024 24.01.19.
 */

;
(function ($) {
  var tables = {};
  $.TblDel = function(t){
    $(t._higherElement).empty();
    delete tables[t._tblId];
  };

  $.fn.Tbl = function(O){
    var O = $.extend({
      code: false,
      events: false,
      tblSorter: true,
      tblScroll: true,
      contextMenu: true,
      rowFocus: false
    }, O);

    var t = new Tbl(O.code, this.get(0), O.userFunc, O.foot, O.addclm);
    tables[t._tblId] = t;

    t.events = function(){
      if (O.contextMenu === true){
        $(this).whTblContextMenu();
      }
      else if (O.contextMenu){
        $(this).whTblContextMenu(O.contextMenu);
      }

      if (O.rowFocus === true){
        $(this).rowFocus();
      }
      else if (O.rowFocus){
        $(this).rowFocus(O.rowFocus);
      }

      if (O.tblSorter === true){
        $(this).kTblSorter();
      }

      if (O.tblScroll === true){
        $(this).kTblScroll();
      }

      if (O.events) {
        O.events.call($(this));
      }
    };
    if (O.rowFocus !== false){
      t.funcAfterReDraw = function(){
        var $tr = $('#'+t.trId(this[this.length-1][t.fldId]));
        if (O.rowFocus === true){
          $tr.rowFocus();
        }
        else if (O.rowFocus){
          $tr.rowFocus(O.rowFocus);
        }
      }
    }

    return t;
  };

  $.fn.TblTrKeyId = function(){
    const $tbl = $(this).closest('table');
    return tables[$tbl.attr('id')].trKeyId($(this).attr('id'));
  };
  $.fn.TblData = function(){
    const $tbl = $(this).closest('table');
    return tables[$tbl.attr('id')].trKeyId($(this).attr('id'));
  };

  $.fn.TblTrDataById = function(){
    const $tbl = $(this).closest('table');
    return tables[$tbl.attr('id')].trDataById($(this).attr('id'));
  };

  $.fn.TblDataById = function(){
    const $tbl = $(this).closest('table');
    return tables[$tbl.attr('id')];
  };

  $.fn.TblTrId = function(valFldId){
    const $tbl = $(this).closest('table');
    return tables[$tbl.attr('id')].trId(valFldId);
  };

  $.fn.TblExtData = function(){
    const $tbl = $(this).closest('table');
    return tables[$tbl.attr('id')].extdata;
  };


  var dvId = 'dvTblCfg';
  var dvTitle = 'Настройка таблиц';
  var rfFocusClass = 'rf-focused'; // class Focus

  $.whTblCfg = function (tblId) {
    $.getJSON('coreQIfaceTblCfgList', {tblCodes: tables[tblId]._code}, function (json) {
      if (showErr(json)) return;

      var html = '<select id="' + dvId + 'IdTbl">';
      for (var i=0; i<json.data.length; i++) {
        var R = json.data[i];
        html += '<option value="' + R.TBLID + '">' + R.TBLNAME + '</option>';
      }


      var $d = $("#" + dvId);
      if ($d.length)
          $d.dialog('destroy').remove();

        $d = $("<div/>").attr("id", dvId).addClass("flora")
          .dialog({
            height: $(document.body).height() * 0.8,
            width: $(document.body).width() * 0.8,
            title: dvTitle,
            modal: true, draggable: false, resizable: false,
            overlay: {opacity: 0.5, background: "black"}
          })
          .html('<div></div><div></div><div></div><div></div><div></div>')
          .find('div').css({'float':'left','position':'relative'})
          .eq(0).css({'width': '100%', 'text-align': 'center'}).html(html).end()
          .end();

        var h = $d.innerHeight();
        if ($('#' + dvId + 'IdTbl>option').length == 1)
          $d.find('>div:first').hide();
        else
          h -= $d.find('>div:first').outerHeight();

        $d.find('>div')
          .eq(1).css({'width': '44%', 'height': h}).end()
          .eq(2).css({'width': '5%', 'height': h, 'text-align': 'center'}).addClass('buttons')
          .html(
            '<button type=button id="' + dvId + 'BtnLeft"><img src="' + sps_img.KURSSKLAD + '/arrows/left.png"/></button>' +
            '<br><button type=button id="' + dvId + 'BtnLeftAll"><img src="' + sps_img.KURSSKLAD + '/arrows/doubleleft.png"/></button>'+
            '<br><br><button type=button id="' + dvId + 'BtnRightAll"><img src="' + sps_img.KURSSKLAD + '/arrows/doubleright.png"/></button>' +
            '<br><button type=button id="' + dvId + 'BtnRight"><img src="' + sps_img.KURSSKLAD + '/arrows/right.png"/></button>'
          )
          .end()
          .eq(3).css({'width': '44%', 'height': h}).end()
          .eq(4).css({'width': '5%', 'height': h, 'text-align': 'center'}).addClass('buttons')
          .html(
            '<button type=button id="' + dvId + 'BtnUp"><img src="' + sps_img.KURSSKLAD + '/arrows/up.png"/></button>' +
            '<br>&nbsp;<br>' +
            '<button type=button id="' + dvId + 'BtnDown"><img src="' + sps_img.KURSSKLAD + '/arrows/down.png"/></button>' +
            '<br>&nbsp;<br>' +
            '<button type=button id="' + dvId + 'BtnSave"><img src="' + eng_img + '/actions/save.png"/></button>'
          )
          .end()

        $('#' + dvId + 'IdTbl').change(tblIdChg).change();
        //tblCodes.change(tblIdChg).change();
        $('#' + dvId + 'BtnLeft').click(btnLeftClick);
        $('#' + dvId + 'BtnLeftAll').click(btnLeftAllClick);
        $('#' + dvId + 'BtnRight').click(btnRightClick);
        $('#' + dvId + 'BtnRightAll').click(btnRightAllClick);
        $('#' + dvId + 'BtnUp').click(btnUpClick);
        $('#' + dvId + 'BtnDown').click(btnDownClick);
        $('#' + dvId + 'BtnSave').click(btnSaveClick);
    });

    function tblIdChg() {
      var tblId = $(this).val();
      $.getJSON('coreQIfaceTblCfgListClm', {tblId: tblId}, function (json) {
        if (showErr(json)) return;

        var tbl1 = '<table id="' + dvId + 'Tbl1"><thead><tr><th>&nbsp;</th><th>Заголовок</th></tr></thead><tbody>';
        var tbl2 = '<table id="' + dvId + 'Tbl2"><thead><tr><th>&nbsp;</th><th>Заголовок</th></tr></thead><tbody>';
        for (var i = 0; i < json.data.length; i++) {
          var R = json.data[i];

          if (R.NUMHEAD) {
            var tr = '<tr id="' + dvId + 'trFLD_' + R.ID + '"  data-header = '+R.NUMHEAD+ '>' +
            '<td  style=" font-weight: 900">'+
                '<div class="dvLeft"><img class="imgClickClose" src="/KURSSKLAD/REFERENCE/SITE/images/tv-collapsable.gif"></div>'+
                '<div class="dvLeft" >'+R.NAME+ '</div>'+ '</td>' +
            '<td class="text">' + R.TITLE + '</td>' +
            '</tr>';
            tbl2 += tr;
            tbl1 += tr;
          }
          else {
            var tr = '<tr  id="' + dvId + 'trFLD_' + R.ID + '"data-num=' + R.NUM + ' data-unum=' + R.UNUM + ' data-head = ' + R.THBLOCKID+'>' +
            '<td style="font-style: italic">'+
                '<div class="dvLeft"><img src="/KURSSKLAD/REFERENCE/SITE/images/tv-item.gif"></div>'+
                '<div class="dvLeft" >'+ R.NAME + '</div>' + '</td>' +
            '<td class="text" style="font-style: italic">' + R.TITLE + '</td>' +
            '</tr>';
            if (R.UNUM > 0){
              tbl2 += tr;

            }
            else{
              tbl1 += tr;
            }
          }
        }
        tbl1 += '</table';
        tbl2 += '</table';
        $('#' + dvId + '>div')
          .eq(1).html(tbl1).find('table').kTblScroll().rowFocus().end().end()
          .eq(3).html(tbl2).find('table').kTblScroll().rowFocus().end().end();

        $('#' + dvId + 'Tbl1 tbody>tr[data-header]').each(function () {
          var atrhd1 = kInt($(this).attr('data-header'));
            var $head =  $('#' + dvId + 'Tbl1').find('tr[data-head=' + atrhd1 + ']:first');
            var $tr2 = $(this).clone();
            $(this).remove();
            $tr2.insertBefore($head);
        });
        $('#' + dvId + 'Tbl2 tbody>tr[data-header]').each(function () {

          var atrhd2 = kInt($(this).attr('data-header'));
          var $head =  $('#' + dvId + 'Tbl2').find('tr[data-head=' + atrhd2 + ']:first');
          var $tr2 = $(this).clone();
          $(this).remove();
          $tr2.insertBefore($head);
        });

        $('#' + dvId + 'Tbl1 tbody').kTblScroll().rowFocus();
        $('#' + dvId + 'Tbl2 tbody').kTblScroll().rowFocus();
      });

          /*if (R.NUMHEAD) {
            var tr = '<tr id="' + dvId + 'trFLD_' + R.ID + '"  data-header = '+R.NUMHEAD+ '>' +
            '<td  style=" font-weight: 900">'+
                '<div class="dvLeft"><img class="imgClickClose" src="/KURSSKLAD/REFERENCE/SITE/images/tv-collapsable.gif"></div>'+
                '<div class="dvLeft" >'+R.NAME+ '</div>'+ '</td>' +
            '<td class="text">' + R.TITLE + '</td>' +
            '</tr>';
            tbl2 += tr;
            tbl1 += tr;
          }
          else {
            var tr = '<tr  id="' + dvId + 'trFLD_' + R.ID + '"data-num=' + R.NUM + ' data-unum=' + R.UNUM + ' data-head = ' + R.THBLOCKID+'>' +
            '<td style="font-style: italic">'+
                '<div class="dvLeft"><img src="/KURSSKLAD/REFERENCE/SITE/images/vertline.gif"></div>'+
                '<div class="dvLeft" >'+ R.NAME + '</div>' + '</td>' +
            '<td class="text" style="font-style: italic">' + R.TITLE + '</td>' +
            '</tr>';

          }

          if (R.UNUM > 0){
            tbl2 += tr;
          }
          else{
            tbl1 += tr;
          }*/

    }

    function btnLeftClick() {
      var $tr = $('#' + dvId + 'Tbl2').rf$GetFocus();
      $tr.removeClass(rfFocusClass);
      if ($tr.length && $tr.attr('data-header')) {
        var atrhd = kInt($tr.attr('data-header'));
        $tr.next().length ? $tr.next().click() : $tr.prev().click();
        var datanum = kInt($tr.attr('data-num'));
        if ($('#' + dvId + 'Tbl1').find('tr[data-header=' + atrhd + ']').length >= 1)
            $('#' + dvId + 'Tbl2').find('tr[data-header=' + atrhd + ']').remove();

        var $tr2 = $('#' + dvId + 'Tbl2').find('tr[data-head=' + atrhd +'],[data-header=' + atrhd + ']').clone().attr('data-unum', '0');
        $('#' + dvId + 'Tbl2').find('tr[data-head=' + atrhd +'],[data-header=' + atrhd + ']').remove();
        $('#' + dvId + 'Tbl2').kTblScroll();
        var fl = true;
        $('#' + dvId + 'Tbl1 tbody>tr[data-header=' + atrhd + ']').each(function () {
            fl = false;
            $tr2.insertAfter($(this));
            return;
        })
        if (fl) {
          $('#' + dvId + 'Tbl1 tbody>tr:last').each(function () {
            if (fl && kInt($(this).attr('data-num')) > datanum) {
              fl = false;
              $tr2.insertAfter($(this));
              return;
            }
          })
        }
        if (fl)
          $tr2.appendTo($('#' + dvId + 'Tbl1 tbody'));
        $('#' + dvId + 'Tbl1').kTblScroll();

      }

      if ($tr.length && $tr.attr('data-head')) {
        var atrhd = kInt($tr.attr('data-head'));
        var $tbl2 =  $('#' + dvId + 'Tbl2');
        $tr.next().length ? $tr.next().click() : $tr.prev().click();
        var datanum = kInt($tr.attr('data-num'));
        var $tr2 = $tbl2.find('tr[data-header=' + atrhd + ']').clone().attr('data-unum', '0');
        var $tr3 = $tr.clone();

        if ($tbl2.find('tr[data-head=' + atrhd + ']').length <= 1)
            $tbl2.find('tr[data-header=' + atrhd + ']').remove();
        $tr.remove();

        $('#' + dvId + 'Tbl1').kTblScroll();
        $tbl2.kTblScroll();
        var fl = true;
        $('#' + dvId + 'Tbl1 tbody>tr[data-header=' + atrhd + ']').each(function () {
            fl = false;
            $tr3.insertAfter($(this));
            return;
        })

        if (fl) {
            $('#' + dvId + 'Tbl1 tbody>tr').each(function () {
            fl = false;
            $tr3.insertAfter($(this));
            $tr2.insertAfter($(this));
            return;
          })
        }

        if (fl) {
            $tr2.appendTo($('#' + dvId + 'Tbl1 tbody'));
            $tr3.appendTo($('#' + dvId + 'Tbl1 tbody'));
        }


      }
      $('#' + dvId + 'Tbl2 tbody>tr[data-unum]').each(function (i) {
          $(this).attr('data-unum', i + 1);
        });
      $('#' + dvId + 'Tbl1 tbody>tr').each(function () {
        $(this).removeClass(rfFocusClass)
      });
      $('#' + dvId + 'Tbl1 tbody').rowFocus();
      $('#' + dvId + 'Tbl2 tbody').kTblScroll().rowFocus();//.kScrollToTr();

      if ($tr.length && !$tr.attr('data-header') && !$tr.attr('data-head')) {
        $tr.next().length ? $tr.next().click() : $tr.prev().click();
        $tr.removeClass(rfFocusClass);
        var datanum = kInt($tr.attr('data-num'));
        var $tr2 = $tr.clone().attr('data-unum', '0');
        $tr.remove();
        $('#' + dvId + 'Tbl2 tbody>tr').each(function (i) {
          $(this).attr('data-unum', i + 1);
        });
        $('#' + dvId + 'Tbl2').kTblScroll();
        var fl = true;
        $('#' + dvId + 'Tbl1 tbody>tr').each(function () {
          if (fl && kInt($(this).attr('data-num')) > datanum) {
            fl = false;
            $tr2.insertBefore($(this));
            return;
          }
        })
        if (fl)
          $tr2.appendTo($('#' + dvId + 'Tbl1 tbody'));
        $('#' + dvId + 'Tbl1').kTblScroll();
        $tr2.rowFocus().kScrollToTr();
      }
    }

    function btnLeftAllClick() {
      $('#' + dvId + 'Tbl2 tbody>tr').each(function () {
        $(this).click();
        btnLeftClick();
      });
    }

    function btnRightClick() {
      var $tr = $('#' + dvId + 'Tbl1').rf$GetFocus();
      $tr.removeClass(rfFocusClass);
      if ($tr.length && $tr.attr('data-header')) {
        var atrhd = kInt($tr.attr('data-header'));
        $tr.next().length ? $tr.next().click() : $tr.prev().click();
        if ($('#' + dvId + 'Tbl2').find('tr[data-header=' + atrhd + ']').length >= 1)
            $('#' + dvId + 'Tbl1').find('tr[data-header=' + atrhd + ']').remove();
        var $tr2 = $('#' + dvId + 'Tbl1').find('tr[data-head=' + atrhd +'],[data-header=' + atrhd + ']').clone();
        $('#' + dvId + 'Tbl1').find('tr[data-head=' + atrhd +'],[data-header=' + atrhd + ']').remove();

        $('#' + dvId + 'Tbl1').kTblScroll();
        var fl = true;
        $('#' + dvId + 'Tbl2 tbody>tr[data-header=' + atrhd + ']').each(function () {
            fl = false;
            $tr2.insertAfter($(this));
            return;
        })
        if (fl)
          $tr2.appendTo($('#' + dvId + 'Tbl2 tbody'));
        $('#' + dvId + 'Tbl2').kTblScroll();
      }

      if ($tr.length && $tr.attr('data-head')) {
        var atrhd = kInt($tr.attr('data-head'));
        var $tbl2 =  $('#' + dvId + 'Tbl2');
        var $tbl1 =  $('#' + dvId + 'Tbl1');
        $tr.next().length ? $tr.next().click() : $tr.prev().click();
        var datanum = kInt($tr.attr('data-num'));
        var $tr2 = $tbl1.find('tr[data-header=' + atrhd + ']').clone();
        var $tr3 = $tr.clone();

        if ($tbl1.find('tr[data-head=' + atrhd + ']').length <= 1)
            $tbl1.find('tr[data-header=' + atrhd + ']').remove();
        $tr.remove();
        $tbl1.kTblScroll();
        $tbl2.kTblScroll();
        var fl = true;
        $('#' + dvId + 'Tbl2 tbody>tr[data-header=' + atrhd + ']').each(function () {
            fl = false;
            $tr3.insertAfter($(this));
            return;
        })

        if (fl) {
            $('#' + dvId + 'Tbl2 tbody>tr').each(function () {
            fl = false;
            $tr3.insertAfter($(this));
            $tr2.insertAfter($(this));
            return;
          })
        }

        if (fl) {
            $tr2.appendTo($('#' + dvId + 'Tbl2 tbody'));
            $tr3.appendTo($('#' + dvId + 'Tbl2 tbody'));
        }

      }

      $('#' + dvId + 'Tbl2 tbody>tr[data-unum]').each(function (i) {
          $(this).attr('data-unum', i + 1);
        });

      $('#' + dvId + 'Tbl2 tbody>tr').each(function () {
        $(this).removeClass(rfFocusClass)
      });
      $('#' + dvId + 'Tbl2 tbody').rowFocus();
      $('#' + dvId + 'Tbl1 tbody').kTblScroll().rowFocus();//.kScrollToTr();


      if ($tr.length && !$tr.attr('data-header') && !$tr.attr('data-head')) {
        $tr.next().length ? $tr.next().click() : $tr.prev().click();
        $tr.removeClass(rfFocusClass);
        var $tr2 = $tr.clone();
        $tr.remove();
        $('#' + dvId + 'Tbl1').kTblScroll();
        var $trLast = $('#' + dvId + 'Tbl2 tbody>tr:last');
        var dataunum = $trLast.length ? kInt($trLast.attr('data-unum')) + 1 : 1;
        $tr2.appendTo($('#' + dvId + 'Tbl2 tbody'));
        $('#' + dvId + 'Tbl2').kTblScroll();
        $tr2.attr('data-unum', dataunum).rowFocus().kScrollToTr();
      }
    }

    function btnRightAllClick() {
      $('#' + dvId + 'Tbl1 tbody>tr').each(function () {
        $(this).click();
        btnRightClick();
      });
    }

    function btnUpClick() {
      var $tr = $('#' + dvId + 'Tbl2').rf$GetFocus();
      if ($tr.length && $tr.attr('data-header') && $tr.prev().length) {
        var atrhd = kInt($tr.attr('data-header'));
        //var $trPrev = $('table:last').find('tr[data-header=' + atrhead + ']');//предыдущий блок
        var $trPrev = $tr.prevAll( 'tr[data-header]:first' );//предыдущий блок
        var $tr2 = $('table:last').find('tr[data-head=' + atrhd +'],[data-header=' + atrhd + ']');
        var unum2 = kInt($trPrev.attr('data-unum'));

        $tr2.insertBefore($trPrev);

        $tr.attr('data-unum', unum2);
        unum2++;
        $tr.nextAll().each(function () {
          $(this).attr('data-unum', unum2);
          unum2++;
        });
        $tr.rowFocus();//.kScrollToTr();
      }

      if ($tr.length && $tr.attr('data-head')  && $tr.prev('tr[data-head='+$tr.attr('data-head')+']').length ) {
        var atrhd = kInt($tr.attr('data-head'));
        var $trPrev = $tr.prev( 'tr[data-head='+atrhd+']:first' );//предыдущая строка
        var $tr2 = $tr.clone();
        $tr.remove();
        $tr2.insertBefore($trPrev);
        $tr2.attr('data-unum', kInt($tr2.attr('data-unum')) - 1);
        $trPrev.attr('data-unum', kInt($trPrev.attr('data-unum')) + 1);
        $tr2.rowFocus();//.kScrollToTr();
      }

      if ($tr.length && kInt($tr.attr('data-unum')) > 1 && !$tr.attr('data-header') && !$tr.attr('data-head')) {
        var $trPrev = $tr.prev();
        var $tr2 = $tr.clone();
        $tr.remove();
        $tr2.insertBefore($trPrev);
        $tr2.attr('data-unum', kInt($tr2.attr('data-unum')) - 1);
        $trPrev.attr('data-unum', kInt($trPrev.attr('data-unum')) + 1);
        $tr2.rowFocus();//.kScrollToTr();
      }
    }

    function btnDownClick() {
      var $tr = $('#' + dvId + 'Tbl2').rf$GetFocus();
      if ($tr.length && $tr.attr('data-header') && $tr.next().length) {
        var atrhd = kInt($tr.attr('data-header'));
        var $headNext = $tr.nextAll( 'tr[data-header]:first' );
        var atrNext = $tr.nextAll( 'tr[data-header]:first' ).attr('data-header');// header следующего блока
        var $trNext = $('table:last').find('tr[data-head=' + atrNext +']:last'); //последняя строка следующего блока
        var $tr2 = $('table:last').find('tr[data-head=' + atrhd +'],[data-header=' + atrhd + ']');//выбранный блок
        var unum2 = kInt($tr.attr('data-unum'));
        $tr2.insertAfter($trNext);
        $headNext.attr('data-unum', unum2);
        unum2++;
        $headNext.nextAll( 'tr' ).each(function () {
          $(this).attr('data-unum', unum2);
          unum2++;
        });

        $tr.rowFocus();//.kScrollToTr();
      }

      if ($tr.length && $tr.attr('data-head')  && $tr.next('tr[data-head='+$tr.attr('data-head')+']').length ) {
        var atrhd = kInt($tr.attr('data-head'));
        var $trNext = $tr.next( 'tr[data-head='+atrhd+']:first' );//предыдущая строка
        var $tr2 = $tr.clone();
        $tr.remove();
        $tr2.insertAfter($trNext);
        $tr2.attr('data-unum', kInt($tr2.attr('data-unum')) + 1);
        $trNext.attr('data-unum', kInt($trNext.attr('data-unum')) -1);
        $tr2.rowFocus();//.kScrollToTr();
      }
      if ($tr.length && $tr.next().length && !$tr.attr('data-header') && !$tr.attr('data-head')) {
        var $trNext = $tr.next();
        var $tr2 = $trNext.clone();
        $trNext.remove();
        $tr2.insertBefore($tr);
        $tr2.attr('data-unum', kInt($tr2.attr('data-unum')) - 1);
        $tr.attr('data-unum', kInt($tr.attr('data-unum')) + 1);
        $tr2.rowFocus({rfSetDefFocus: false});
        //$tr.kScrollToTr();
      }
    }

    function btnSaveClick(){
      var clmList = '';
      $('#' + dvId + 'Tbl2 tbody>tr').each(function(){
        clmList += $(this).attr('id').split('_')[1] + ';';
      });
      var P = {
        tblId: $('#' + dvId + 'IdTbl').val(),
        clmList: clmList
      };
      if (clmList == '') {
        alert('Нет выбранных столбцов');
        return;
      }

      $.getJSON('coreQIfaceTblCfgListClmSave', P, function(json){
        if (!showErr(json)){
          tables[tblId].cfgLoad();
        }

        //location.reload();
      });

    }
  };

  $.fn.whTblCfg = function(){
    var tblId = (this.is('table') ? this : this.parents('table:first')).attr("id");
    (tblId && $.whTblCfg(tblId));
    return this;
  };

  $.fn.whTblRecCount = function () {
    var $tr = (this.is('table') ? this : this.parents('table:first')).find('tbody>tr:visible');
    var l2 = $tr.find('>td.chk>input[type=checkbox]:checked').length;
    var mes = 'Всего записей в таблице: ' + $tr.length + (l2 ? '\nОтмечено: ' + l2 : '');
    alert(mes);
    return this;
  };

  $.fn.whTblPrint = function (reportPath) {
    var $tbl = this.is('table') ? this : this.parents('table:first');
    var wnd = window.open(reportPath ? reportPath : sps_forms.KURSSKLAD + '/printTbl.html');
    wnd.onload = function () {
      wnd.document.getElementById("tblPrint").innerHTML = $tbl.html()
        .replace(/<button.*?\/button>/ig, '') //Удалили кнопки
        .replace(/<select.*?\/select>/ig, '') //Удалили выпадающие списки
        .replace(/<td[^>]*title="([^"]*)"[^>]*><img[^>]*>[^>]*<\/td>/gi, '<td>$1</td>')
        .replace(/<input.*?</gi, '<') // Удалил checkbox
        .replace(/<([a-z][a-z0-9]*)[^>]*style=["\'][^>]*?display: ?none;[^>]*?["\'][^>]*?>(.*?)<\/\1>/gi, '') //Удалили не видимые элементы
        .replace(/<img[^>]*alt=["\']([^>]*?)["\'][^>]*?>/gi, '$1') //заменили картинки на титлы
        .replace(/<img[^>]*?>/gi, '') //заменили картинки без титлов на пустое
        .replace(/ style=["\'].+?["\']/gi, '') //Удалили стили
        //html = html.replace(/<td[^>]*class="[^"]*number[^"]*">([^<]*)<\/td>/gi, function (m, p) {
        .replace(/<td[^>]*class="[^"]*number[^"]*"(.*?)>([^<]*)<\/td>/ig, function (m, p) {
        // .replace(/<td[^>]*class="[^"]*number[^"]*"[\s\S]*>([^<]*)<\/td>/gi, function (m, p) { //не работает, цепляет ввсё
          //Заменили . на , в td.number
          return m.replace(/\d+\.\d+(?=<\/td>)/gi, function (match) {
            return parseFloat(match).toLocaleString().replace(/\s/gi, '');
          });
        });
    }
    return this;
  };

  $.fn.whTblTrEvents = function () {
    function mId() {
      var m = 'menu';
      if ($("#" + m).length == 0)
        $("<ul/>").attr("id", m).addClass("contextMenu").html(
          '<li class="print"><a href="#print">Печать</a></li>' +
          '<li class="config separator"><a href="#config">Настройка</a></li>'
        )
          .css('width', '200px')
          .appendTo($(document.body));
      return m;
    };

    (this.is('tr') ? this : this.find('tbody>tr'))
      .contextMenu({menu: mId()}, function (action, el) {
        switch (action) {
          case 'print':
            $(el).whTblPrint();
            break;
          case 'config':
            $(el).whTblCfg();
            break;
        }
      });

    return this;
  };

  $.fn.whTblContextMenu = function(O){
    function optSortKeyFill(optSortKey){
      var separatorAdded = false;
      if (O.needTblPrint && optSortKey.indexOf('TblPrint') == -1) {
        optSortKey.push('TblPrint');
        if (O.classTblPrint.indexOf('separator') == - 1) O.classTblPrint += ' separator';
        separatorAdded = true;
      }
      if (O.needTblRecCount && optSortKey.indexOf('TblRecCount') == -1) {
        optSortKey.push('TblRecCount');
        if (!separatorAdded) {
          if (O.classTblRecCount.indexOf('separator') == -1) O.classTblRecCount += ' separator';
          //separatorAdded = true;
        }
      }
      if (O.needTblConfig && optSortKey.indexOf('TblConfig') == -1)
        optSortKey.push('TblConfig');
    };

    function contextHTML(optSortKey){
      var html = '';
      for (var i=0; i< optSortKey.length; i++) {
        var opt = optSortKey[i];
        html += '<li' + (O['class' + opt] ? ' class="' + O['class' + opt] : '') + '">' +
          '<a href="#'+ opt +'">' + (O['name' + opt] ? O['name' + opt] : opt) + '</a></li>';
      }
      return html;
    }

    var O = $.extend({
      optSortKey: [], optSortKeyHead: [],
      funcTblConfig: $.fn.whTblCfg, classTblConfig: 'config separator', nameTblConfig: 'Настройка таблицы', needTblConfig: true,
      funcTblPrint: $.fn.whTblPrint, classTblPrint: 'print', nameTblPrint: 'Печать таблицы', needTblPrint: true,
      funcTblRecCount: $.fn.whTblRecCount, classTblRecCount: 'sum', nameTblRecCount: 'Количество строк', needTblRecCount: true,
    }, O);

    var menuId = 'menu' + (this.is('table') ? this : this.parents('table:first')).attr("id");
    if ($("#" + menuId).length == 0){
      optSortKeyFill(O.optSortKey);
      $("<ul/>").attr("id", menuId).addClass("contextMenu")
        .html(contextHTML(O.optSortKey)).css('width', '200px').appendTo($(document.body));
    }

    /*var menuId = 'menu' + (this.is('table') ? this : this.parents('table:first')).attr("id");
    if ($("#" + menuId).length == 0){
      var separatorAdded = false;
      if (O.needTblPrint && O.optSortKey.indexOf('TblPrint') == -1) {
        O.optSortKey.push('TblPrint');
        if (O.classTblPrint.indexOf('separator') == - 1) O.classTblPrint += ' separator';
        separatorAdded = true;
      }
      if (O.needTblRecCount && O.optSortKey.indexOf('TblRecCount') == -1) {
        O.optSortKey.push('TblRecCount');
        if (!separatorAdded) {
          if (O.classTblRecCount.indexOf('separator') == -1) O.classTblRecCount += ' separator';
          //separatorAdded = true;
        }
      }
      if (O.needTblConfig && O.optSortKey.indexOf('TblConfig') == -1)
        O.optSortKey.push('TblConfig');

      var html = '';
      for (var i=0; i< O.optSortKey.length; i++) {
        var opt = O.optSortKey[i];
        html += '<li' + (O['class' + opt] ? ' class="' + O['class' + opt] : '') + '">' +
          '<a href="#'+ opt +'">' + (O['name' + opt] ? O['name' + opt] : opt) + '</a></li>';
      }

      $("<ul/>").attr("id", menuId).addClass("contextMenu").html(html).css('width', '200px').appendTo($(document.body));
    }*/

    (this.is('tr') ? this : this.find('tbody>tr'))
      .contextMenu({menu: menuId}, function (action, el) {
        (O['func'+action] && O['func' + action].call($(el)));
      });

    if (!this.is('tr')){
      var menuId = 'menu' + (this.is('table') ? this : this.parents('table:first')).attr("id") + '_head';
      if ($("#" + menuId).length == 0){
        optSortKeyFill(O.optSortKeyHead);
        $("<ul/>").attr("id", menuId).addClass("contextMenu")
          .html(contextHTML(O.optSortKeyHead)).css('width', '200px').appendTo($(document.body));
      }
      this.find('thead>tr>th').contextMenu({menu: menuId}, function (action, el) {
        (O['func'+action] && O['func' + action].call($(el)));
      });

    }

    return this;
  };

})(jQuery);