/**
 * Created by kashko.iu on 02.10.2018.
 */

;(function ($) {

	var $dvClient, $inputClient;
	var lastParam = {};

	function listClient (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Построение списка клиентов'});

		$.ajax({
			url: 'clientListReference',
			dataType: 'json',
			data: O,
			success: function (JSON) {
				var html = '<table><thead><tr><th class="chk" data-clid="all"><input type="checkbox"/></th>' +
          '<th>Тип</th><th>Бренд</th><th>Регион</th>' +
          '<th>Код</th><th>Наименование</th>' +
          '</tr></thead><tbody>';

				for(var i=0;i<JSON.data.length;i++){
				  // if(JSON.data[i].ENABLED == 1){ //костыль для активных клиентов
            html += '<tr><td class="chk"><input type="checkbox" data-clid="'+JSON.data[i].TOID+'" /></td>' +
              '<td title="'+JSON.data[i].TYPENAME+'">'+JSON.data[i].TYPECODE+'</td>' +
              '<td>'+JSON.data[i].BRANDNAME+'</td>' +
              '<td title="'+JSON.data[i].REGNAME+'">'+JSON.data[i].REGCODE+'</td>' +
              '<td>'+JSON.data[i].EXTID+'</td><td class="text">'+JSON.data[i].TONAME+'</td></tr>';
				  // }
        }

				html += '</tbody><tfoot><tr><th class="chk">0</th><th colspan=5>&nbsp;</th></tr></tfoot></table>';
				$dvClient.find('div.tbl').html(html).find('table').kTblSorter().kTdChk();

				$.unblockUI && $.unblockUI();
				lastParam = O;
			}
		});
	}

	$.fn.changeDVListClient = function (callChg) {
		 function change(){
			  var O = {};
			  O[$(this).attr('name')] = $(this).val();
        $inputClient.trigger('rightClick');
			  listClient(O);
		 }
		 this.change(change);
		 if(callChg){ //чтобы не было множественного вызова
			 change.call(this);
		 }
		 return this;
	};

	$.fn.dvClient = function (param) {
		$inputClient = this;
    var param = $.extend({
        dvId: "dvClientListTree",
        nullVal: 'None',
        attrVal: 'data-val'
    }, param);


    function onClick(e) {
      var val = $inputClient.attr(param.attrVal);
      $dvClient.dialog('open');
      if (val != param.nullVal){
        var arr = val.split(',');
        $dvClient.find('table').kTblScroll()
          .find('input').each(function(){
            if (arr.indexOf($(this).attr('data-clid')) != -1){
              $(this).closest('td.chk').kTdChkSet(1);
            }
            else{
              $(this).closest('td.chk').kTdChkSet(0);
            }
          });
      }
      else{
        $dvClient.find('table').kTblScroll()
          .find('thead th.chk').trigger("click").end();
          // .find('td.chk').kTdChkSet(1);
      }

    }

    function onRightClick(e) {
        $inputClient.removeAttr('title').attr(param.attrVal, param.nullVal).val('Все клиенты');
    }

    param = $.extend({
        onClick: onClick,
        onRightClick: onRightClick
    }, param);
    $inputClient.click(param.onClick).rightClick(param.onRightClick);


    $dvClient = $("<div/>").attr("id", param.dvId).addClass("flora").css("text-align", "center")
      .dialog({
        closeOnEscape: true, title: 'Клиенты', autoOpen: false,
        resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
        height: kScreenH()*0.7, width: 600
      });

      $dvClient.html('<div class="tbl" style="width: 100%;height: 85%;"></div>' +
          '<br><div class="buttons" style="width: 100%;max-height: 10%;">' +
            '<button type="submit" id="dvClientListSaveBtn"><img src="' + eng_img + '/actions/save.png" border="0">Сохранить</button> ' +
            '<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
          '</div>')
      .find('#dvClientListSaveBtn').click(function (event, ui) {
        var clid = '', cnt = 0;
        if ($dvClient.find('table>tbody>tr').length != $dvClient.find('table>tbody>tr>td>input:checked').length) {
          $dvClient.find('table>tbody>tr>td>input:checked').each(function () {
            clid += $(this).attr('data-clid')+',';
            cnt += 1;
          });
          if(cnt == 0){
            clid = 'false';
          }
          $inputClient.attr(param.attrVal, clid).val(cnt+' клиент');
        }
        else {
          $inputClient.attr(param.attrVal, param.nullVal).val('Все клиенты');
        }
        $dvClient.dialog("close");
      }).end()
      .find("button:last").click(function(){$dvClient.dialog("close")});
		return $inputClient;
	};

})(jQuery);


