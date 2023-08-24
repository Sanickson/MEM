var tbl;

$(document).ready(function() {
    $.getJSON('getObjects',function (json) {
        if(!showErr(json)){
            var html='';
            for(var i=0;i<json.data.length;i++)
                html+='<option value="'+json.data[i].OBJID+'" '+'>'+json.data[i].OBJNAME+'</option>';
            $('#selectObj').html(html);
        }
    });

    $('#dvMain').css({'height': kScreenH(), 'width': '100%'});
    tbl = $('#dvMain').Tbl({
        code: 'INCORRECTSITE',
        rowFocus: {rfSetDefFocus: false}
    });

    $("form#frmSelectObj").unbind('submit').submit(function () {
        var objid = $("select#selectObj").val();
        var P = {whid: objid};
        tbl.empty();
        $.getJSON('IncorrectSiteList',P,function (json) {
            var html = json;
            var arr = new Set();
            for (var i=0; i<json.data.length; i++) {
                var curWid = json.data[i].WID;
                var curMP = json.data[i].MP;
                var WM = curWid + "," + curMP;
                var mpq = 0;
                if (!arr.has(WM)){
                    for (var j=0; j<html.data.length; j++) {
                        if (curWid === html.data[j].WID && curMP === html.data[j].MP) {
                            mpq += html.data[j].MPQ;
                        }
                    }
                    arr.add(WM + " = " + mpq);
                }
            }
            
            for (var x=0; x<html.data.length; x++) {
                var c = 0;
                var curWid = html.data[x].WID;
                for (let value of arr) {
                    var newStr = value.split(",");
                    if (Number(newStr[0]) === curWid){
                        if (c === 0){
                            html.data[x].MP = newStr[1];
                            c++;
                        } else { html.data[x].MP += ', ' + newStr[1]; }
                    }
                }
            }
            tbl.data(html);
        });
        return false;
    });
})