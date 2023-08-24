;(function ($) {
var dt;
	$.fn.PalletType = function (F) {
        dt=F;
        $.getJSON('pallettypelist', F ,function(JSON){
           var typeid = '';
          for(var i=0;i<JSON.data.length;i++){
              typeid +=','+JSON.data[i].PTID;}
          typeid += ',';
          $('#ptype').attr('typep',typeid);
        });
        $('#ptype').click(selectPalletType);
        $('#labelPType').is('label') ? $('#labelPType').html('<b>Типы паллет</b>:') : $('#labelPType').text('Типы паллет');
	};
    
    function selectPalletType () {
    if ($("#dvZone").length){
        $("#dvZone").dialog("open");//.remove();
        $("#tblZone").kTblScroll();
    }
    else {
        ($.blockUI && $.blockUI({message:'<h2>...загрузка типов...</h2>'}));
        $.getJSON('pallettypelist', dt ,function(JSON){
            var html = '<table id="tblZone"><thead><tr><th class="chk"><input type="checkbox" checked /></th><th>Код</th><th>Наименование</th></tr></thead><tbody>'
            for(var i=0;i<JSON.data.length;i++)
                html += '<tr><td class="chk"><input type="checkbox" checked typeid="'+JSON.data[i].PTID+'" /></td><td>'+JSON.data[i].PTCODE+'</td><td>'+JSON.data[i].PTNAME+'</td></tr>';
            html += '</tbody><tfoot><tr><th colspan=3>&nbsp;</th></tr></tfoot></table>';
            var $dv = $("<div/>").attr("id","dvZone").addClass("flora").css("text-align","center")
                .dialog({closeOnEscape:true,title:'Типы паллетов',autoOpen:true,
                         resizable:false,draggable:false,modal:true,overlay:{opacity:0.5,background:"black"},
                         height:300,width:300})
                .bind("dialogbeforeclose", function( event, ui ) {
                    var typeid = '';
                    if ($('#tblZone>tbody>tr').length!=$('#tblZone>tbody>tr>td>input:checked').length) {
                        $('#tblZone>tbody>tr>td>input:checked').each(function(){
                            typeid += ',' + $(this).attr('typeid') ;
                        });
                        typeid += ',';
                        $('#ptype').attr('typep',typeid);
                    }
                    else {
                        $('#tblZone>tbody>tr>td>input:checked').each(function(){
                            typeid += ',' + $(this).attr('typeid') ;
                        });
                        typeid += ',';
                        $('#ptype').attr('typep',typeid);
                    }
                } )
                .html(html)
                    .find('table').kTblScroll().kTdChk();

            //$dv.bind("beforeclose", function( event, ui ) {console.log('close')} );
            ($.unblockUI && $.unblockUI());
        });
    }
	}
	
})(jQuery);
