$(document).ready(function() {
    $.datepicker.setDefaults($.extend($.datepicker.regional['ru']));
	$('#dSale').datepicker().mask("99.99.9999").val(kToday(1));	
    $("#dvWH").css({"height":kScreenH(),'overflow-y':'auto'});
    $("#frm").bind("submit",function() {
        $('#dvWH').empty();
        $.getJSON("getDayInfo",{datesale:$("#dSale").val()},$.tblDayInfo);
		return false;
	});
    $("#btnPrint").click(function(){
        var wnd = window.open(sp_reports+'/print.html');
        wnd.onload = function() {
            wnd.document.getElementById('dSale').innerHTML = $('#dSale').val();
            wnd.document.getElementById('dayInfo').innerHTML = $("#dvWH").html();
        }
    });
});

;(function($) {

    $.tblDayInfo = function(JSON){
        if (!showErr(JSON) && JSON.data.length) {
            var t = JSON.data[0];
            var html = '<div class=client>'+t.CLNAME;
            html += '<div class=obj>'+t.OBJNAME+'. ';
            html += '<span class=doc> №' + t.DOCNUM + ': ';
            if (t.DOCSTAT=='g') 
                html += '<span class="gstat">НЕ ОТОБРАН; </span>';
            var cId = t.CLID, oId = t.OBJID, dId = t.DOCID;
            for (var i=0; i<JSON.data.length; i++) {
                var t = JSON.data[i];
                if (dId != t.DOCID){
                    html += '</span>';
                }
                if (cId != t.CLID){
                    html += '</div></div>';
                    html += '<div class=client>' + t.CLNAME;
                    html += '<div class=obj>'+t.OBJNAME+'. ';
                    cId = t.CLID;
                    oId = t.OBJID;
                }
                else if (oId != t.OBJID){
                    html += '</div>';
                    html += '<div class=obj>'+t.OBJNAME+'. ';
                    oId = t.OBJID;
                }
                
                if (dId != t.DOCID){
                    html += '<span class=doc> №'+t.DOCNUM+': ';
                    if (t.DOCSTAT=='g') 
                        html += '<span class="gstat">НЕ ОТОБРАН; </span>';					
                    dId = t.DOCID;                    
                }                
                if (t.DOCSTAT != 'g') {
                    html += (t.PALNUM ? t.PALNUM : t.CLCODE + '-' + kInt(t.TASKNUM)) +
                        '<span class=site>(' + t.SNAME + ');</span>';
                }
            }
            html += '</span></div></div>';
            $('#dvWH').html(html);
        }
    }
    
    
})(jQuery);