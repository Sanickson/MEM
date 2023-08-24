$(document).ready(function(){
	var containerheight = kScreenH();
    $('#dvTable').css({'width':'50%','height':containerheight});

	$.getJSON('listAuto',$.tblMain);
});


;(function($) {
	function tr(json) {
		var html = '';
		for (var i=0;i<json.data.length;i++) {
			var tr = json.data[i];
			html += '<tr aid="'+tr.AID+'" barcode="' + tr.BARCODE + '">\
						<td class="text">'+tr.NAME+'</td>\
					</tr>';
		}
		return html;
	}
	$.tblMain = function(json) {
		if (!showErr(json)) {
			var html = '<table id="tblAuto">\
			             <thead>\
						  <tr>\
						    <th ksort="text">Наименование</th>\
						  </tr>\
						 </thead>\
						<tbody>'
			            + tr(json)
			            + '</tbody><tfoot><tr><th class="buttons" colspan="">\
						    <button type="button" title="Добавить" class="add" code="add"><img src="'+eng_img+'/actions/add.png" border="0"></button>\
						    <button type="button" title="Изменить" class="cng" code="cng"><img src="'+eng_img+'/actions/edit.png" border="0"></button>\
						    <button type="button" title="Удалить" class="del" code="del"><img src="'+eng_img+'/actions/delete.png" border="0"></button>\
						    <button type="button" title="Печать" class="print" code=""><img src="'+eng_img+'/actions/printer.png" border="0"></button>\
						    <button type="button" title="Перегенерировать ШК автомобиля" class="barcode"><img src="'+eng_img+'/actions/reset.gif" border="0"></button>\
					    </th></tr></tfoot></table>';
                        
			$('#dvTable').html(html)
				.find('table')
					.kTblScroll()
					.kTblScroll()
					.rowFocus()
				.find('>tfoot>tr>th>button')
					.filter('.add').click(add).end()
					.filter('.cng').click(cng).end()
					.filter('.del').click(del).end()
					.filter('.barcode').click(cngbarcode).end()
					.filter('.print').click(print).end();
		}
	}

	function print() {
        var wnd = window.open(sp_reports+'/barcode.html');
        var $tr = $('#tblAuto').rf$GetFocus();
        wnd.onload = function(){
            var aName = $tr.find('td:eq(0)').text();
            var aNameSpl = aName.split(' ');
            var aNameNew = '';
            var aNumNew = '';
            if (aNameSpl.length > 1){
                for (var i=0; i <= aNameSpl.length-2;  i++) aNameNew += aNameSpl[i]+' ';
                aNumNew = aNameSpl[aNameSpl.length-1];
            }
            else {
                aNameNew = aName;
            }
            wnd.document.getElementById("dvData").innerHTML =  '<div class="">'+
                                                                    '<div class=aname>'+aNameNew+'</div>'+
                                                                    '<div class=barcode>*'+$tr.attr('barcode')+'*</div>'+
                                                                    '<div class=anum>'+aNumNew+'</div>'+
                                                                '</div>'
        }
    }

	function add() {
		function frmSubmit(param){
            $.getJSON("cngAuto",param,function(json){
                if (!showErr(json)) {
					$('#tblAuto>tbody')
						.append(tr(json));

                    $('#tblAuto')
						.kTblScroll()
						.kTblSorter()
                        .rowFocus({rfSetDefFocus:true});

					$("#dvDialog").dialog("close");
				}

            });
        };
        $crudDialog({title:'Добавление автомобиля'},{code:$(this).attr('code'),frmSubmit:frmSubmit,btnConfTitle:'Добавить'});
	}

    function cngbarcode() {
        if(confirm('Вы действительно хотите перегенерировать ШК авто?'))
            var aid = $('#tblAuto').rf$GetFocus().attr("aid");
            console.log(aid);
            $.getJSON("cngBarcode",{aid: aid}, function (json){
                console.log($('#tblAuto>tbody>tr')[0]);
                $.tblMain(json);
                console.log($('#tblAuto>tbody>tr')[0]);
            });
    }

	function cng() {
		function frmSubmit(param){
            $.getJSON("cngAuto",param,function(json){
                if (!showErr(json)) {
					$('#tblAuto>tbody>tr[aid="'+json.data[0].AID+'"]')
						.replaceWith(tr(json))
					$('#tblAuto')
						.kTblScroll()
						.kTblSorter()
						.rowFocus({rfSetDefFocus:true})

					$("#dvDialog").dialog("close");
				}
            });
        };
        $crudDialog({title:'Изменение автомобиля'},{code:$(this).attr('code'),frmSubmit:frmSubmit,btnConfTitle:'Изменить',aid:$('#tblAuto').rf$GetFocus().attr('aid')});
	}

	function del() {
		function frmSubmit(param){
			$(this).showConf({ text: 'Вы действительно хотите удалить транспортную единицу?',
				confirm: function() {
					$.getJSON("delAuto",param,function(json){
						if (!showErr(json)) {
							$('#tblAuto>tbody>tr[aid="'+json.ext_data.AID+'"]').remove();
							$('#tblAuto')
                                .kTblScroll()
                                .kTblSorter();
							$("#dvDialog").dialog("close");
						}
					});
				},
				cancel: function() {
					$("#dvDialog").dialog("close");                                
				}
			});
        };
        $crudDialog({title:'Удаление автомобиля'},{code:$(this).attr('code'),frmSubmit:frmSubmit,btnConfTitle:'Удалить',aid:$('#tblAuto').rf$GetFocus().attr('aid')});
	}
	
	
	function $crudDialog (dvOptions,dopOptions) {
		var dvOptions = $.extend({closeOnEscape:false,title:'',
		                               autoOpen:true,resizable:false,
									  draggable:false,modal:true,
									    overlay:{opacity:0.5,background:"black"},
										 height:160,width:340},dvOptions);
        var dopOptions = $.extend({code:false,aid:false,frmSubmit:false,btnConfTitle:false},dopOptions);
		
        if ($("#dvDialog").length) 
			$("#dvDialog").dialog("destroy").remove();
        var params = {}    
        if (dopOptions.aid) params.aid = dopOptions.aid;
        else params.aid = 0;
        $.getJSON('listAuto',params,function(json){
            if (!showErr(json)) {
                if (!json.data[0]) json.data[0] = {}
                /*
                var types = '', tutypes = JSON.parse('{'+json.ext_data.tutypes+'}');
                for (var i in tutypes)
                    types += '<option value="'+i+'" '+(i==json.data[0].TUTID?'selected':'')+'>'+tutypes[i]+'</option>';
                var status = {'0':'Не активный','1':'Активный'}, sts = ''
                for (var i in status)    
                    sts += '<option value="'+i+'" '+(i==json.data[0].STATUS?'selected':'')+'>'+status[i]+'</option>';
                */
                var html = '<form>\
                                <label class="lbl" for="">Наименование</label><input type="text" class="rght" name="aname" value="'+verifyVal(json.data[0].NAME)+'">\
                                <input type="hidden" name="aid" value="'+verifyVal(json.data[0].AID)+'"><br>\
                                <br><div style="width:100%;" class="buttons">'+
                                   (dopOptions.btnConfTitle ? '<button type="submit" id="dvDocConfOk"><img src="'+eng_img+'/actions/accept.png" border="0">'+dopOptions.btnConfTitle+'</button>&nbsp;&nbsp;&nbsp;' : '')+
                                   '<button type="button" id="btnFilterClear"><img src="'+eng_img+'/actions/cancel.png" border="0">Отмена</button>\
                             </div></form>';
                             
                var $dv = $('<div/>').attr("id","dvDialog").addClass("flora")
                            .css("text-align","left")
                            .dialog(dvOptions)
                                .html(html)
                                    .find("button:last").click(function(){ $("#dvDialog").dialog("close"); }).end();

                $("#dvDialog>form").submit(function(){
                    var param = $(this).kFormSubmitParam();
                    dopOptions.frmSubmit(param);
                    return false;
                });
            
            }
            
        });
        
        function verifyVal(v) {return (v?v:'')}

	}

})(jQuery);