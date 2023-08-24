/**
 * Created by Shybkoi on 06.09.2017
 */

;(function($) {
    $.fn.waresEx = function( options ) {
		this.click(function () {
		// Создаём настройки по-умолчанию, расширяя их с помощью параметров, которые были переданы
		var settings = $.extend( {
          'title'  : 'Исключить товары',
		  'action' : 'waresExclusion',
          'tableid': 'tblNoWaresSite'
		}, options);

        if ($('#dvShowObjEx').length){
            $('#dvShowObjEx').parent().parent().remove();
        }
        var $this_btn = this;

         $.getJSON(settings.action, function(JSON){
            if (!showErr(JSON)) {
                var html = '<div id="dv1">' +
                    '<table id="tblShowControl"><thead><tr>' +
                    '<th>' +
                    '<a href="addEx" onclick="return false;" title="Добавить товарную позицию"><img src="/ENGINE/images/actions/add.png" border="0"></a>' +
                    '<a href="delEx" onclick="return false;" title="Удалить выбранную товарную позицию"><img src="/ENGINE/images/actions/delete.png" border="0"></a>' +
                    '</th></tr></thead></table>' +
                    '<table id="tblShowObj"><thead><tr>' +
                    '<th style="width: 10%;">Код</th>' +
                    '<th style="width: 90%;">Наименование</th>' +
                    '</tr></thead><tbody>';
                for (var i = 0; i < JSON.data.length; i++) {
                    var td = JSON.data[i];
                    html += '<tr objid="' + td.WID + '"><td style="width: 10%;">' + td.CODE + '</td>' +
                        '<td style="text-align:left;width: 90%;">' + td.NAME + '</td></tr>';
                }
                html += '</tbody></table></div>';

                var $dv = $("<div/>").attr("id", "dvShowObjEx").addClass("flora")
                    .dialog({
                        closeOnEscape: true, title: settings.title, autoOpen: true,
                        resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
                        height: 335, width: 500,
                    })
                    .html(html);

                $("<ul/>").attr("id","exMenu").addClass("contextMenu").css('width','190px')
                    .html('<li class="add"><a href="#addEx">Добавить</a></li>'+
                          '<li class="delete"><a href="#delEx">Удалить</a></li>')
                    .appendTo($(document.body));

                $("#dv1").css({'height': '270px', 'width':'100%', 'border':'1px solid grey','padding': '1px'});
                //$("#tblShowControl").css({'position': 'absolute', 'bottom': '45px', 'width':'473px'});
                $("#tblShowObj").rowFocus({rfSetDefFocus: true}).css({'height': '100%', 'width':'100%'})
                    .kTblSorter().find("tbody>tr").contextMenu({menu:"exMenu"},menu);
                $(".ui-dialog-buttonpane button").wrapAll("<div class='buttons'/>");
                $(".ui-dialog-buttonpane button:first").html("<img src='/ENGINE/images/actions/accept.png' border='0'>Ок");
                $(".ui-dialog-buttonpane button:last").html("<img src='/ENGINE/images/actions/cancel.png' border='0'>Отмена");

                $('#tblShowControl>thead>tr>th')
                    .find('a[href="addEx"]').click(function(){
                        cgAdd(); return false;
                    }).end()
                    .find('a[href="delEx"]').click(function(){
                        var $tr = $('#tblShowObj').rf$GetFocus();
                        if ($tr.length) cgDel($tr);
                        else alert('Нет выбранного товара!');
                        return false;
                    });

                var arr_obj = $($this_btn).attr('obj').split(',');
                arr_obj.forEach(function(item, i, arr) {
                    var $tr = $("#tblShowObj [objid='"+ item +"']");
                    $("#tblChoice").append($tr);
                });
                if ($("#tblShowObj tbody tr").length > 0){
                    $("#tblShowObj").kTblScroll();
                }
            }});
  	})};
})(jQuery);

function menu(action, el){
    if (action == 'addEx'){
        cgAdd();
    }else if(action == 'delEx'){
        cgDel(el);
    }
}

function cgAdd(){
    function frmSubmit(param){

        if ($("#tblShowObj tbody tr[objid="+param.wid+"]").length) {
            alert("Товар уже добавлен в исключения!");
            return false;
        }
        $.getJSON('insertExclusion', {'wid': param.wid}, function(JSON){
            if (!showErr(JSON)) {
                var html = '<tr objid="' + param.wid + '"><td style="width: 10%;">' + param.code + '</td>' +
                    '<td style="text-align:left;width: 90%;">' + param.name + '</td></tr>';
                $('#tblShowObj tbody').append(html);
                $("#tblShowObj").kTblSorter().rowFocus({rfSetDefFocus: true})
                    .kTblScroll().find("tbody>tr").contextMenu({menu: "exMenu"}, menu);
                $("#tblShowObj").css({'height': '100%', 'width': '100%'});
                $("#dvCargo").dialog("close");
            }});
    };

    $cgDialog({title:'Добавить товар'},{frmSubmit:frmSubmit,btnConfTitle:'Добавить'});
};

function cgDel(el) {
    if (confirm("Вы уверены, что хотите удалить товар из исключений?")){
        $.getJSON('deleteExclusion', {'wid': el.attr('objid')}, function(JSON){
            if (!showErr(JSON)) {
                $(el).remove();
                $("#tblShowObj").kTblScroll();
            }});
    }
}

 function $cgDialog(dvOptions,cgOptions){
    var dvOptions = $.extend({closeOnEscape:false,title:'',autoOpen:true,resizable:false,draggable:false,modal:true,overlay:{opacity:0.5,background:"black"},height:150,width:550},dvOptions);
    var cgOptions = $.extend({cargoid:false,wid:false,wcode:'',wname:'',amount:false,price:false,docsum:false,frmSubmit:false,btnConfTitle:false,readonly:false},cgOptions);

    function waresSet(wid,wcode,wname){
        $("#dvCargoWaresInfo").html(wcode+' - '+wname).attr('wid',wid);
    };

    if ($("#dvCargo").length) $("#dvCargo").dialog("destroy").remove();

    var html = '';
    if (!cgOptions.readonly)
        html += '<form id="frmCargoWares" action="waresLocateC" class="buttons">'+
                '<select style="width:50px">'+
                    '<option value="wcode">Код</option>'+
                    '<option value="wname">Наименование</option>'+
                    '<option value="wbarcode">Штрих-код</option>'+
                '</select>&nbsp;'+
                '<input type="text" id="frmCargoWaresInput" style="width:100px" value="">&nbsp;'+
                '<button type="submit"><img src="'+eng_img+'/actions/magnifier.png" border="0">Искать</button>'+
                '<button type="button"><img src="'+eng_img+'/actions/view_tree.png" border="0">Товары</button>'+
              '</form><hr>';
    html += '<b><div id="dvCargoWaresInfo" style="width:100%;">&nbsp;</div></b><hr>'+
            '<form id="frmCargo" class="buttons">'+
                    '<button type="submit" id="dvShowConfOk"><img src="'+eng_img+'/actions/accept.png" border="0">Добавить</button>&nbsp;&nbsp;&nbsp;' +
                    '<button type="button" id="dvShowConfCancel"><img src="'+eng_img+'/actions/cancel.png" border="0">Отменить</button>'+
            '</form>';

    var $dv = $("<div/>").attr("id","dvCargo")
        .addClass("flora").css("text-align","center")
        .dialog(dvOptions)
        .html(html);

    $("#dvShowConfCancel").click(function(){
        $("#dvCargo").dialog("close");
    });

    $("#frmCargoWares").submit(function(){
        var data = {};

        var selectVal = $("select",$(this)).val();
        if (selectVal=='wcode') data.wcode = $("input",$(this)).val();
        else if (selectVal=='wname') data.wname = $("input",$(this)).val();
        else if (selectVal=='wbarcode') data.wbarcode = $("input",$(this)).val();

        $.getJSON($(this).attr("action"),data,function(JSON){
            if (!showErr(JSON)) {
                if (JSON.data.length==1) {
                    waresSet(JSON.data[0].WARESID,JSON.data[0].WARESCODE,JSON.data[0].WARESNAME);
                }
                else {
                    var $d = $("<div/>").addClass("flora").css("text-align","center").dialog({height:250,width:500,modal:true,resizable:false,draggable:true,title:"Выбор",overlay:{backgroundColor:'#000',opacity: 0.5}});
                    var html = "<table><thead><tr><th>Код</th><th>Наименование</th></tr></thead><tbody>";
                    for (var i=0; i<JSON.data.length; i++)
                        html += '<tr wid="'+JSON.data[i].WARESID+'"><td class="number">'+JSON.data[i].WARESCODE+'</td><td class="text">'+JSON.data[i].WARESNAME+'</td></tr>';
                    $d.html(html);
                    $("table",$d).tablesorter().kTblScroll()
                        .find("tbody>tr").click(function() {
                            var $tr = $(this);
                            waresSet($tr.attr("wid"),$tr.find("td:first").text(),$tr.find("td:last").text())
                            $d.dialog("close");
                            $('#cgPrice').val('');
                            chgPrice();
                        });
                    $d.unbind("dialogclose").bind("dialogclose",function(event,ui){  $d.empty().remove(); });
                    $d.dialog("open");
                }
            }
        });
        return false;
    }).find("button:last").click(function(){
        $.kWaresLocateTree({divId:"dvWaresLocate",success:waresSet});
    });

    $("#frmCargo").submit(function(){
        var param = {};
        param.wid = $("#dvCargoWaresInfo").attr('wid');
        if (!param.wid) {alert('Выберите товар!!!'); return false;}
        param.code = $("#dvCargoWaresInfo").text().split(' - ')[0];
        param.name = $("#dvCargoWaresInfo").text().split(' - ')[1];
        (cgOptions.frmSubmit && cgOptions.frmSubmit.call(this, param));
        return false;
    });

    $dv.dialog("open");
    if (cgOptions.wid) waresSet(cgOptions.wid,cgOptions.wcode,cgOptions.wname);
    else
            setTimeout(function (){
                $("#frmCargoWaresInput").focus();
            },0);
    return $dv;
 };
