/**
 * Created by kashko.iu on 20.05.2019.
 */

;(function ($) {

	var $dvSG, $inputSG;
	var lastParam = {};
    var url = 'qSelGroup';

	function listSG (O) {
		var O = $.extend(lastParam, O);

		$.blockUI && $.blockUI({message: 'Построение списка групп отборки'});

		$.ajax({
			url: url,
			dataType: 'json',
			data: O,
			success: function (JSON) {
				var html = '<table style="width: 100%"><thead><tr><th class="chk" data-sgid="all"><input type="checkbox"/></th>' +
                '<th>Код</th><th>Наименование</th>' +
                '</tr></thead><tbody>';
				for(var i=0;i<JSON.data.length;i++){
                    html += '<tr><td class="chk"><input type="checkbox" data-sgid="'+JSON.data[i].ID+'" /></td>' +
                      '<td>'+JSON.data[i].CODE+'</td><td class="text">'+JSON.data[i].NAME+'</td></tr>';
                }

				html += '</tbody><tfoot><tr><th class="chk">0</th><th colspan=5>&nbsp;</th></tr></tfoot></table>';
				$dvSG.find('div.tbl').html(html).find('table').kTblSorter().kTdChk();

				$.unblockUI && $.unblockUI();
				lastParam = O;
			}
		});
	}

	$.fn.changeDVSelgroup = function (callChg) {
		 function change(){
			  var O = {};
			  O[$(this).attr('name')] = $(this).val();
        $inputSG.trigger('rightClick');
			  listSG(O);
		 }
		 this.change(change);
		 if(callChg){ //чтобы не было множественного вызова
			 change.call(this);
		 }
		 return this;
	};

	$.fn.dvSelgroup = function (param) {
		$inputSG = this;
        var param = $.extend({
            dvId: "dvSGListTree",
            nullVal: 'None',
            attrVal: 'data-val'
        }, param);
        if (param.url){
            url=param.url;
        }


        function onClick(e) {
          var val = $inputSG.attr(param.attrVal);
          $dvSG.dialog('open');
          if (val != param.nullVal){
            var arr = val.split(',');
            $dvSG.find('table').kTblScroll()
              .find('input').each(function(){
                if (arr.indexOf($(this).attr('data-sgid')) != -1){
                  $(this).closest('td.chk').kTdChkSet(1);
                }
                else{
                  $(this).closest('td.chk').kTdChkSet(0);
                }
              });
          }
          else{
              if (!$dvSG.find('table').find('thead th.chk input[type="checkbox"]').attr('checked')){
                 $dvSG.find('table').kTblScroll()
              .find('thead th.chk').trigger("click").end();
              }

          }

        }

        function onRightClick(e) {
            $inputSG.removeAttr('title').attr(param.attrVal, param.nullVal).val('Все ГО');
            $inputSG.change();
        }

        param = $.extend({
            onClick: onClick,
            onRightClick: onRightClick
        }, param);
        $inputSG.click(param.onClick).rightClick(param.onRightClick);


        $dvSG = $("<div/>").attr("id", param.dvId).addClass("flora").css("text-align", "center")
          .dialog({
            closeOnEscape: true, title: 'Группы отборки', autoOpen: false,
            resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
            height: (kScreenH()*0.7 > 10 ? kScreenH()*0.7 : 500), width: 600
          });

          $dvSG.html('<div class="tbl" style="width: 100%;height: 85%;"></div>' +
              '<br><div class="buttons" style="width: 100%;max-height: 10%;">' +
                '<button type="submit" id="dvSGListSaveBtn"><img src="' + eng_img + '/actions/save.png" border="0">Сохранить</button> ' +
                '<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>' +
              '</div>')
          .find('#dvSGListSaveBtn').click(function (event, ui) {
            var sgid = '', cnt = 0;
            if ($dvSG.find('table>tbody>tr').length != $dvSG.find('table>tbody>tr>td>input:checked').length) {
              $dvSG.find('table>tbody>tr>td>input:checked').each(function () {
                sgid += $(this).attr('data-sgid')+',';
                cnt += 1;
              });
              if(cnt == 0){
                sgid = 'false';
              }
              else{
                  sgid = sgid.slice(0,-1); //удаляем запятую последнюю
              }
              $inputSG.attr(param.attrVal, sgid).val(cnt+' ГО');
            }
            else {
              $inputSG.attr(param.attrVal, param.nullVal).val('Все ГО');
            }
            $inputSG.change();
            $dvSG.dialog("close");
          }).end()
          .find("button:last").click(function(){$dvSG.dialog("close")});

    $inputSG.removeAttr('title').attr(param.attrVal, param.nullVal).val('Все ГО');
    $('#labelSG').is('label') ? $('#labelSG').html('<b>ГО</b>:') : $('#labelSG').text('Группа отборки');
    return $inputSG;
	};

})(jQuery);


