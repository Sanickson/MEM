$.stringify = function(str){return JSON.stringify(str);}
copied = false;
editmode = false;
var statusMessage;
var WH_W, WH_H;

$.fn.bindDrop = function() {
    function mId(){
        var m = 'menuSite';
        if ($("#"+m).length==0)
            $("<ul/>").attr("id",m).addClass("contextMenu").css({'width':120})
                .html('<li class="edit"><a href="#edit">Изменить</a></li>'+
                      '<li class="copy"><a href="#copy">Копировать</a></li>'+
                      '<li class="paste"><a href="#paste">Вставить</a></li>'+
                      '<li class="delete"><a href="#delete">Удалить</a></li>'+
                      '<li class="information"><a href="#hidden">Скрытые</a></li>'+
                      '<li class="information"><a href="#hide">Скрыть</a></li>'+
                      '<li class="clear"><a href="#clear">Очистить</a></li>')
                .appendTo($(document.body)).find('.copy,.paste').hide();
        return m;
    };
    $(this).droppable({tolerance: 'mouse',
        accept: function(elem){
            var id = $(elem).parents('table:first').attr('id');
            return ($(elem).is("tr") && ( id=='ss' || id=='wh' || id=='hs') );
        },
        drop: function(event, ui) { 
            //console.log()
            // ui.draggable - Перетаскиваемый элемент
            // ui.element - Элемент, на который перетащили                        
            //var site = new Site();
            //SiteVector.push();
            if(ui.draggable.parents('table:first').attr('id') == 'wh'){
                // раскрутим существующий склад
                if(ui.element.hasClass('i-am-here')){
                    $('#place>div').not('#items').remove();
                    drawSklad(ui.draggable.attr('siteid'));
                    editmode = true;
                }
                
            }
            if(ui.draggable.parents('table:first').attr('id') == 'ss'){
                if(ui.element.hasClass('i-am-here')){
                    // строим диалог типа местоположения
                    ss_create_dialog(event,ui);
                    //$('#size').attr('disabled','disabled');
                }
            }
            if(ui.draggable.parents('table:first').attr('id') == 'hs'){
                if(ui.element.hasClass('i-am-here')){
                    // добавляем сайт на место
                    ui.draggable.remove();
                    var y = Math.round((event.pageY - $(ui.element).offset().top - 3)/size)+1;
                    var x = Math.round((event.pageX - $(ui.element).offset().left - 2)/size)+1;
                    //siteIerarchy(ui.draggable.attr('siteid'),x,y)
                    if(ui.draggable.hasClass('hidden')){
                        $('[id="'+ui.draggable.attr('siteid')+'"][name="'+ui.draggable.find('td').text()+'"]')
                            .css({left:(x-1)*size-1, top: (y-1)*size-1})
                            .attr({x:x,y:y})
                            .removeClass('hidden')
                            .show();
                        return false;
                    }
                    $.getJSON('getSite',{siteid:ui.draggable.attr('siteid')},function(JSON){
                        var site = createSite(ui.element,(x-1)*size-1,(y-1)*size-1,JSON.data.NAME,JSON.data.VIEWNAME,JSON.data.CODE,JSON.data.CLASSNAME,JSON.data.SUBTYPE,ui.draggable.attr('siteid'));
                        var w = kInt(JSON.data.SWIDTH);
                        var h = kInt(JSON.data.SLENGTH);
                        //if(confirm('Хотите ли вы изменить размер ячейки под размер склада ?')){
                        //size = kInt(Math.min($('#place').width()/w,$('#place').height()/h));
                        //$('#size').val(size);
                        //setGrid();
                        //}
                        site.attr({
                            'width': JSON.data.SWIDTH,
                            'height': JSON.data.SLENGTH
                        })
                        .css({
                            'width': JSON.data.SWIDTH*size-2,
                            'height': JSON.data.SLENGTH*size-2
                        })
                        siteIerarchy(site);
                    })
                    //ss_create_dialog(event,ui);
                    //$('#size').attr('disabled','disabled');
                }
            }
        }
    })
    .bind('mouseover',function(event){
        $(this).addClass('i-am-here');
        $('#'+mId()).find('.paste').hide();
        if(copied)
            $('#'+mId()).find('.paste').show();
        if($(this).hasClass('added-site')) {
            statusMessage.text($(this).attr('name'));
            $('#'+mId()).find('.copy').show();
        }
        else {
            $('#'+mId()).find('.copy').hide();
        }
        /*if($(this).parent().is('#place'))
            $('#'+mId()).find('.info').show();
        else
            $('#'+mId()).find('.info').hide();*/
        event.stopPropagation();
    })
    .bind('mouseout',function(event){
        $(this).removeClass('i-am-here');
        statusMessage.text('');
        event.stopPropagation();
    })
    .contextMenu({menu:mId()},function(action, el, data) {   
        if (action=='delete') {
            if(confirm('Удалить выбраное местоположение?')) {
                if(el.parent().is('#place')){
                    $.getJSON('deleteSklad',{siteid: el.attr('id')},function(JSON){
                        if(!showErr(JSON)){
                            el.remove();
                        }
                    });
                } else {
                    el.remove();
                }
            }
            //if($('#place').children().not('#items').length == 0) $('#size').removeAttr('disabled');
        }
        if (action=='edit') {
            editSite(el);
        }
        if (action=='copy') {
            copied = el;
        }
        if (action=='paste') {
            if(!copied.length) return;
            if(copied.attr('type') == 'R') {
                if($('#dvRenameRow').length) $('#dvRenameRow').dialog('destroy').remove();
                var html = 'Название <input type=text class="rowname"/><br>';
                           'Отобр. назв. <input type=text class="viewname"/>';
                html += '<div class="buttons" style="text-align:center;">'+
                            '<button type="submit"><img src="'+eng_img+'/actions/accept.png" border="0"> Подтвердить</button>&nbsp;'+
                            '<button type="button"><img src="'+eng_img+'/actions/cancel.png" border="0"> Отменить</button>'+                                  
                        '</div>';
                $("<form/>").attr("id","dvRenameRow").addClass("flora buttons").css("text-align","right")
                    .dialog({height:100,width:300,title:'Копироваие ряда',
                             modal:true,draggable:true,resizable:false,overlay:{opacity:0.5, background:"black"}
                           })
                    .html(html)
                    .find('button:last').click(function(){$('#dvRenameRow').dialog('close');}).end()
                    .dialog('open')
                    .find('.rowname').val(genNextNum()).focus().select().end()
                    .unbind('submit')
                    .submit(function(){
                        var copy = copied.clone(false);
                        var name = $('#dvRenameRow .rowname').val();
                        var viewname = $('#dvRenameRow .viewname').val();
                        copy.bindDrop().attr('id','null').find('.added-site')
                        .each(function(){
                            $(this).bindDrop().attr('id','null');
                            $(this).attr('ch',$(this).attr('ch').replace(RegExp(copy.attr('name'),'g'),name));
                            $(this).attr('ch',$(this).attr('ch').replace(/"id":[^,}]+/g,'"id":"null"'));
                            $(this).attr('title',$(this).attr('title').replace(copy.attr('title'),name));
                            $(this).attr('name',$(this).attr('name').replace(copy.attr('name'),name));
                            //$(this).attr('viewname',$(this).attr('viewname').replace(copy.attr('viewname'),viewname));
                        }).end()
                            .attr('name',copy.attr('name').replace(copy.attr('name'),name))
                            .attr('title',copy.attr('title').replace(copy.attr('title'),name))
                            .attr('viewname',copy.attr('viewname').replace(copy.attr('viewname'),name))
                            .find('>span.viewname').text(copy.attr('viewname'));
                            /*.find('span.viewname').each(function(){
                                if($(this).attr('viewname') != '')
                                    $(this).text(copy.attr('viewname').replace(copy.attr('viewname'),viewname));
                            })*/
                        var top = Math.round((data.docY - $(el).offset().top - 3)/size)*size - 1;
                        var left = Math.round((data.docX - $(el).offset().left - 2)/size)*size - 1;
                        $(el).append(copy)
                        copy.css({
                            'left': left,
                            'top': top
                        })
                            .attr({
                                'x': (left+1)/size+1,
                                'y': (top+1)/size+1
                            });
                        //copySite();
                        $('#dvRenameRow').dialog('close')
                        return false;
                    })
            }
        }
        if (action=='clear') {
            if(confirm('Вы действительно хотите очистить экран?')){
                $('#place>div').not('#items').remove();
                //$('#size').removeAttr('disabled');
            }
        }
        if (action=='hidden') {
            hiddenSite(el);
        }
        if (action=='hide') {
            if(confirm('Вы действительно хотите скрыть объект ?')){
                el.hide();
                el.attr({
                    x: 'null',
                    y: 'null'
                }).addClass('hidden');
            }
        }
    })
    if($(this).attr('id')!='place')
        $(this).resizable({
            start: function(event, ui) {
                //$.tooltip('show');
            },
            resize: function(event, ui) {
                if(ui.size.width != ui.originalSize.width)
                    ui.size.width = kInt(ui.size.width/size)*size-2;
                if(ui.size.height != ui.originalSize.height)
                    ui.size.height = kInt(ui.size.height/size)*size-2;
                statusMessage.text((ui.element.width()+2)/size + 'x' + (ui.element.height()+2)/size);
            },
            stop: function(event, ui) {
                statusMessage.text('');
                ui.element
                    .attr({'width': (ui.element.width()+2)/size,
                           'height': (ui.element.height()+2)/size});
            }
        })
        .draggable({zIndex: 1002})
        .bind('dragstart',function(event, ui){
            $(this).css({'z-index':1002, '-moz-box-shadow':'0 0 10px rgba(200,0,0,0.5)', 'box-shadow':'0 0 10px rgba(200,0,0,0.5)'});
        })
        .bind('drag',function(event, ui){
            var top = Math.round(($(this).offset().top - $(this).parent().offset().top - 3)/size)*size;
            var left = Math.round(($(this).offset().left - $(this).parent().offset().left - 2)/size)*size;
            statusMessage.text('x: '+kInt(left/size+1) + ', y: '+kInt(top/size+1));
        })
        .bind('dragstop',function(event, ui){
            var top = Math.round(($(this).offset().top - $(this).parent().offset().top - 3)/size)*size - 1;
            var left = Math.round(($(this).offset().left - $(this).parent().offset().left - 2)/size)*size - 1;
            $(this)
                .css({'top':top, 'left': left, '-moz-box-shadow': 'none', 'box-shadow': 'none'})
                .attr({'x':(left+1)/size+1,
                       'y':(top+1)/size+1});
            statusMessage.text('');
        });
    return $(this);
}

$(document).ready(function(){
    $.kScreen();
    $('#place').css({
            'width':kScreenW(), 
            'height': kScreenH(), 
            // 'top':-kScreenH(),
            'border-color':getComputedStyle(document.body,'').getPropertyValue('background-color')
        })
        .bindDrop();
    // $('#grid').attr({'width':kScreenW(), 'height': kScreenH()})
    WH_W = kScreenW() / 10;
    WH_H = kScreenH() / 10;
    $('#items').draggable({zIndex: 3})
        .css({'left': kScreenW()-$('#items').width()-20})
        .find('#size').change(setGrid).change().end()
        .find('a')
            .eq(0).click(ss_dialog).end()
            .eq(1).click(zone_dialog).end()
            .eq(2).click(saveDialog).end();
    statusMessage = $.kStatusBar('status');
    $('#trash').droppable({tolerance: 'mouse',
        accept: function(elem){ 
            return ($(elem).is("div"));
        },
        drop: function(event, ui) { 
            // ui.draggable - Перетаскиваемый элемент
            // ui.element - Элемент, на который перетащили
            ui.draggable.remove();
            if($('#place').children().not('#items').length == 0) {
                //$('#size').removeAttr('disabled');
                editmode = false;
            }
        },
        hoverClass: 'drophover-trash'
    });
    $('.canvas').bind('scroll', onScrollCanvas);
    change();
});

function onScrollCanvas(){
    var canvas = $('.canvas').get(0);

    if(canvas.clientHeight + canvas.scrollTop === canvas.scrollHeight) {
        WH_H += 100 / size;
        // $('#grid').attr('height', parseInt($('#grid').attr('height'), 10) + 100);
        setGrid();
    }


    if(canvas.clientWidth + canvas.scrollLeft === canvas.scrollWidth) {
        // $('#grid').attr('width', parseInt($('#grid').attr('width'), 10) + 100);
        WH_W += 100 / size;
        setGrid();
    }
}

function change(){
    if ($("#dvWarehouses").length) $("#dvWarehouses").dialog("destroy").remove();
    
    html = '<table><thead><tr><th>Зона</th></tr></thead><tbody><tr value="null"><td>Без объекта</td></tr>';
    $.getJSON('ajaxGetZones',function(JSON){
        if(!showErr(JSON)){
            if(JSON.data.length == 1) {objid = JSON.data[0].OBJID; return;}
            for(var i=0;i<JSON.data.length;++i)
                html+='<tr value="'+(JSON.data[i].OBJID!='undefined'?JSON.data[i].OBJID:'null')+'"><td>'+JSON.data[i].NAME+'</td></tr>';
        }
        function subm(){
            var row = $('#dvWarehouses table').rf$GetFocus();
            objid = row.attr('value');
            if(!row.length) objid = JSON.data[0].SITEID;
            //$('#dvSite').attr('siteid',siteidin);
            //$('#caption').html(row.find('td:eq(0)').text());
            //if(!row.length) $('#caption').html(JSON.data[0].NAME)
            
            $("#dvWarehouses").dialog("close");
            $('#actions-buttons').show();
        }
        function addObj(){
            $.kObjLocate({afterSel: function(obj, text){
                if(confirm('Вы действительно хотите добавить: '+text+'?')){
                    objid = obj;
                    $("#dvWarehouses").dialog("close");
                    $('#actions-buttons').show();
                }
            }});
        }
        html+='</tbody><tfoot><tr><th class="buttons"><button type=button title="Добавить объект"><img src="'+eng_img+'/actions/add.png" /></button></th></tr></tfoot></table>';
        $("<div/>").attr("id","dvWarehouses")
            .addClass("flora").css("text-align","center")
            .dialog({height:300,width:300,modal:true,resizable:false,draggable:true,title:"Выбор объекта",overlay:{backgroundColor:'#000',opacity: 0.5}})
            .html(html)
                .find('table').kTblScroll().rowFocus({rfSetDefFocus:false,rfFocusCallBack:subm})
                    .find('button').click(addObj).end();
    });
}

function ss_dialog(){
    function delSS(el) {
        function frmSubmit(params) {
            $.getJSON('delSS',params,function(JSON){
                $('#dvSiteSpecies>table>tbody>tr[ssid="'+JSON.ext_data.ssid+'"]')
                    .remove()
                        .parents('table:first')
                            .kTblScroll()
                $('#dialogSS').dialog('destroy').remove();
            }); 
        }
        dialogSS({title:"Удаление типа МП"},{ssid:el.attr('ssid'),btnConfTitle:'Удалить',frmSubmit:frmSubmit})
    }
    function addSS(el) {
        function frmSubmit(params) {
            $.getJSON('saveSS',params,function(JSON){
                if (!showErr(JSON)) {
                
                    $('#dialogSS').dialog('destroy').remove();
                }
            });
        }
        dialogSS({title:'Добавление типа МП'},{ssid:el.attr('ssid'),btnConfTitle:'Добавить',frmSubmit:frmSubmit});
    }
    function chgSS(el) {
        function frmSubmit(params) {
            console.log('sub');
            $.getJSON('saveSS',params,function(JSON){
                if (!showErr(JSON)) {
                
                    $('#dialogSS').dialog('destroy').remove();
                }
            });
        }
        dialogSS({title:'Изменение типа МП'},{ssid:el.attr('ssid'),btnConfTitle:'Изменить',frmSubmit:frmSubmit});
    }
    
    function dialogSS(dvOptions,ssOptions) {
        //console.log(dvOptions)
        //console.log(ssOptions)
        var dvOptions = $.extend({closeOnEscape:false,title:'',autoOpen:true,resizable:false,draggable:false,modal:true,overlay:{opacity:0.5,background:"black"},height:250,width:340},dvOptions);
        var ssOptions = $.extend({ssid:false,frmSubmit:false,btnConfTitle:false},ssOptions);
        //console.log(ssOptions)
        var params = {};
        params.ssid = ssOptions.ssid;
        $.getJSON('getSSOptions',params,function(JSON){
            if (!showErr(JSON)) {
                var html = '', parenthtml='';
                $.ajax({
                    url: 'getParentSS',
                    dataType:'json',
                    async:false,
                    success: function(JSON) {
                        if (!showErr(JSON)) {
                            for (var i=0;i<JSON.data.length;i++)
                                parenthtml += '<option value="'+JSON.data[i].SITESPECIESID+'">'+JSON.data[i].SHORTNAME+'</option>'
                        }
                    }
                });
                html = '<div style="width:100%;height:100%;">'+
                           '<form class="buttons">'+
                           '<input type="hidden" name="ssid" value="'+ssOptions.ssid+'">';
                if (ssOptions.btnConfTitle == 'Удалить'){
                    html += '<span>Вы действительно хотите удалить тип местоположения?</span>';
                }
                else {
                    html += '<span class="ss right">Влияние на остатки</span>'+
                                '<span class="ss left"><input name="calcrest" type="checkbox" '+(JSON.data.CALCREST=='1'?'checked="checked"':'')+'></span><br>'+
                           '<span class="ss right">Возможность отборки</span>'+
                                '<span class="ss left"><input name="canselect" type="checkbox" '+(JSON.data.CANSELECT=='1'?'checked="checked"':'')+'></span><br>'+
                           '<span class="ss right">Имя класса</span>'+
                                '<span class="ss left"><input name="classname" type="text" value="'+JSON.data.CLASSNAME+'"></span><br>'+
                           '<span class="ss right">Родитель</span>'+
                                '<span class="ss left"><select name="higher">'+
                                    '<option value="null">Без родителя</option>'+
                                    parenthtml+
                                '</select></span><br>'+
                           '<span class="ss right">CHILDSPECIES</span>'+
                                '<span class="ss left"><select name="childspecies">'+
                                    '<option value="null">Без дочерних</option>'+
                                    parenthtml+
                                '</select></span><br>';
                           //'<span class="ss right">CREATEPALLETTYPE</span>'+
                           //     '<span class="ss left"><input name="createpallettype" type="text" value="null"></span>';
                }
                html +=      '<hr style="width:300px;" class="ss"><br>'+
                           '<span class="ss right"><button type="submit"><img src="'+eng_img+'/actions/accept.png" border="0">'+ssOptions.btnConfTitle+'</button>&nbsp;</span>'+
                                '<span class="ss left">&nbsp;<button type="button"><img src="'+eng_img+'/actions/cancel.png" border="0">Отмена</button></span><br>'
                           '</form>'+
                        '</div>';
                
                if ($('#dialogSS').length) 
                    $('#dialogSS').dialog('destroy').remove();
                    
                var dialog = $('<div/>')
                                .attr({'id':'dialogSS'})
                                .addClass('flora')
                                .dialog(dvOptions)
                                .html(html) 
                                    .find('form').submit(function(){
                                        //var params = $(this).kFormSubmitParam();
                                        var params = {};
                                        params.calcrest = ($(this).find('input[name="calcrest"]').attr('checked')?1:0);
                                        params.canselect = ($(this).find('input[name="canselect"]').attr('checked')?1:0);
                                        
                                        //for (i in params) {
                                        //    if (params[i]=='on')
                                        //        params[i] = 1;
                                         //   else if (params[i]=='off')
                                         //       params[i] = 0;
                                        //}
                                        console.log(params)
                                        //ssOptions.frmSubmit(params);
                                        return false;
                                    });
                                
                
            }
        });
    };
    
    $.getJSON('getSiteSpecies',function(JSON){
        if(!showErr(JSON)){
            var html = '<table id="ss"><thead><tr><th>Код</th><th title="Название">Назв.</th><th>Класс</th></tr></thead><tbody>';
            for(var i=0;i<JSON.data.length;++i){
                var r = JSON.data[i];
                html += '<tr ssid="'+r.SITESPECIESID+'">'+
                            '<td>'+r.CODE+'</td>'+
                            '<td>'+r.NAME+'</td>'+
                            '<td class="classname">'+r.CLASSNAME+'</td>'+
                        '</tr>';
            }
            html += '</tbody></table>';
            var $dv = $("#dvSiteSpecies");
            if ($dv.length) $dv.dialog("destroy").remove();
            
            var mId = 'menuTblSS'; 
            if ($("#"+mId).length==0){
                    $("<ul/>").attr("id",mId).addClass("contextMenu").css("width","190px")
                        .html('<li class="add "><a href="#addSS">Добавить</a></li>'+
                              '<li class="edit"><a href="#chgSS">Изменить</a></li>'+
                              '<li class="delete"><a href="#delSS">Удалить</a></li>')
                    .appendTo($(document.body));
            }
            function menu(action, el){
                if (action == 'addSS') addSS(el);
                else if (action == 'chgSS') chgSS(el);
                else if (action == 'delSS') delSS(el);
            };
            $dv = $("<div/>").attr("id","dvSiteSpecies").addClass("flora").css("text-align","center")
                .dialog({height:200,width:300,title:'Типы местоположений',
                         modal:false,draggable:true,resizable:false,
                         position: ["right", "bottom"]
                        })
                .html(html)
                    .find('>table').kTblScroll()
                    .find('>tbody>tr')
                        .draggable({
                            cursor: '',
                            helper:function(event) {
                                return $('<div/>').html( $(this).find(">td:eq(1)").text() )
                                            .css({'position':'absolute','z-index':'2000','font-weight':'800'}).appendTo( $(document.body) ); 
                            },
                            helperPos:'mouse'
                        })
                        .contextMenu({menu:mId},menu).end()
                    .end();
        }
    });
}

function zone_dialog(){
    $.getJSON('getWH',{objid:objid},function(JSON){
        if(!showErr(JSON)){
            var html = '<table id="wh"><thead><tr><th title="Название">Название</th></tr></thead><tbody>';
            for(var i=0;i<JSON.data.length;++i){
                var r = JSON.data[i];
                html += '<tr siteid="'+(r.SITEID?r.SITEID:'null')+'">'+
                            '<td>'+r.NAME+'</td>'+
                        '</tr>';
            }
            html += '</tbody></table>';
            var $dv = $("#dvWH");
            if ($dv.length) $dv.dialog("destroy").remove();
            
            $dv = $("<div/>").attr("id","dvWH").addClass("flora").css("text-align","center")
                .dialog({height:200,width:300,title:'Склады',
                         modal:false,draggable:true,resizable:false,
                         position: ["right", "bottom"]
                        })
                .html(html)
                    .find('>table').kTblScroll()
                    .find('>tbody>tr')
                        .draggable({
                            cursor: '',
                            helper:function(event) {
                                return $('<div/>').html( $(this).find(">td:eq(0)").text() )
                                            .css({'position':'absolute','z-index':'2000','font-weight':'800'}).appendTo( $(document.body) ); 
                            },
                            helperPos:'mouse'
                        }).end()
                    .end();
        }
    });
}

function clearCanvas(){
    var canvas = $("#grid")[0];
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function setGrid(){
    size = kInt($('#size').val());
    $('#place').css('font-size',size);
    var context = $('#grid')[0].getContext("2d");
    var $grid = $('#grid');
    if(WH_H && WH_W) {
        $grid.attr({
            width: Math.max(kScreenW(), WH_W * size),
            height: Math.max(kScreenH(), WH_H * size)
        });
        $('#place').css({
            width: Math.max(kScreenW(), WH_W * size),
            height: Math.max(kScreenH(), WH_H * size)
        });
    }
    context.lineWidth = 2;
    context.strokeStyle = "#eee";
    clearCanvas();
    context.beginPath();
    for(var x=0;x<$grid.width();x+=size) {
        context.moveTo(x, 0);
        context.lineTo(x, $grid.height());
    }
    for(var y=0;y<$grid.height();y+=size) {
        context.moveTo(0, y);
        context.lineTo($grid.width(), y);
    }
    context.stroke();
    context.closePath();
    $('#place div.added-site').each(function(){
        var top = (kInt($(this).attr('y'))-1)*size - 1;
        var left = (kInt($(this).attr('x'))-1)*size - 1;
        var width = kInt($(this).attr('width'))*size - 2;
        var height = kInt($(this).attr('height'))*size - 2;
        $(this).css({
            'width': width,
            'height': height,
            'top': top,
            'left': left
        })
    })
}

function getName(element){
    switch(element.attr('type')){
        case 'R':
            return element.attr('name')+'-';
            break;
        default:
            return '';
            break;
    }
}

function createSite(parent,left,top,name,viewname,type,classname, subtype,id,width,height){
    return $('<div/>').css({'position': 'absolute','top':top, 'left': left, 'width': size*(width||1)-2, 'height': size*(height||1)-2, 'border':'1px solid black'})
        .attr({'width': width||1,
               'height': height||1,
               'x': (left+1)/size+1,
               'y': (top+1)/size+1,
               'name': name,
               'viewname': viewname,
               'type': type,
               'title': name,
               'ch': '',
               'id': id!=undefined?id:'null',
               'classname': classname?classname:'',
               'subtype': subtype?subtype:''})
        .addClass('added-site')
        .append('<span class="viewname">'+(viewname?viewname:'')+'</span>')
        .appendTo(parent)
        .addClass(classname)
        .bindDrop();
}

function ss_create_dialog(event, ui){
    // ui.draggable - Перетаскиваемый элемент
    // ui.element - Элемент, на который перетащили
    if($('#dvAddSite').length) $('#dvAddSite').dialog('destroy').remove();
    var html = 'Название <input type=text class="siteName"/><br>'+
               'Отобр. назв. <input type=text class="siteViewName"/><br>';
    var type = ui.draggable.find('td:eq(0)').text();
    $.ajax({url:'getSSsubType', data:{type:type}, success:function(resp){
        html += 'Подтип <select style="width:146px;" class="subtype"><option value="">Без подтипа</option>';
        for(var i=0;i<resp.data.length;++i) 
            html += '<option value="'+resp.data[i].CODE+'">'+resp.data[i].NAME+'</option>';
        html += '</select><br>';
    }, dataType: 'json', async: false})
    var h = 0;
    switch(type){
        case 'R':
            h = 15;
            html+='<button type=button class="row-config"><img src="'+sp_img+'/settings.png" border="0">Доп. настройка</button><br>';
            break;
            
    }
    html += '<div class="buttons" style="text-align:center;margin-top:4px;">'+
                '<button type="submit"><img src="'+eng_img+'/actions/accept.png" border="0"> Подтвердить</button>&nbsp;'+
                '<button type="button"><img src="'+eng_img+'/actions/cancel.png" border="0"> Отменить</button>'+                                  
            '</div>';
    $("<form/>").attr("id","dvAddSite").addClass("flora buttons").css("text-align","right")
        .dialog({height:150+h,width:300,title:'Добавление элемента ('+ui.draggable.find('td:eq(1)').text()+')',
                 modal:true,draggable:true,resizable:false,overlay:{opacity:0.5, background:"black"}
               })
        .html(html)
        .find('button:last').click(function(){$('#dvAddSite').dialog('close');}).end()
        .dialog('open')
        .find('.siteName').val(getName(ui.element)).focus().end()
        .unbind('submit')
        .submit(function(){
            var name = $('#dvAddSite .siteName').val();
            var subtype = $('#dvAddSite .subtype').val();
            var viewname = $('#dvAddSite .siteViewName').val();
            if(!name) {alert('Введите имя!');return false;}
            var top = Math.round((event.pageY - $(ui.element).offset().top - 3)/size)*size - 1;
            var left = Math.round((event.pageX - $(ui.element).offset().left - 2)/size)*size - 1;
            size = kInt($('#size').val());
            var parent = createSite(ui.element,left,top,name,viewname,type,ui.draggable.find('td.classname').text(), subtype);
            if($('#dvAddSite button.row-config').length){
                createExtRow(parent);
            }
            $('#dvAddSite').dialog('close');
            return false;
        });
    switch(type){
        case 'R':
            $('#dvAddSite button.row-config').click(function(){
                extendedRowConfig();
            });
            $('#dvAddSite .siteName,#dvAddSite .siteViewName').val(genNextNum());
            break;
            
    }
}

function extendedRowConfig(){
    if($('#dvExtRowConf').length) {$('#dvExtRowConf').dialog('destroy').remove()};
    var html = 'Ширина <input type=text class="width" value=10 /><br>'+
               'Высота <input type=text class="height" value=2 /><br>'+
               'Кол-во стеллажей <input type=text class="cnt" value=20 /><br>'+
               'Расположение <input type=radio name=pos value=zig checked /> зигзаг<br>'+
               '<input type=radio name=pos value=dug /> дуга<br>'+
               'Ориентация <input type=radio name=or value=lr checked /> л-п<br>'+
               '<input type=radio name=or value=rl /> п-л<br>'+
               'Кол-во МХ <input type=text class="cnt-mh" value="3"/><br>'+
               'Размер <input type=text class="size-mh" value="1"/><br>';
    $.ajax({url:'getDefStoreplace',success:function(JSON){
        html += '<div style="max-height: 130px;height: 130px;"><table code="'+JSON.data.CODE+'" name="'+JSON.data.NAME+'"><thead><tr><th>положение</th><th>Название</th><th>Тип</th></tr></thead><tbody>';
        for(var i=1;i<4;++i)
            html+='<tr code="'+JSON.data.CODE+'"><td>'+i+'</td><td>'+i*10+'</td><td>'+JSON.data.NAME+'</td></tr>'
    },async: false, dataType: 'json'});
    
    html += '</tbody></table></div>';
    html += '<div class="buttons" style="text-align:center;">'+
                '<button type="submit"><img src="'+eng_img+'/actions/accept.png" border="0"> Подтвердить</button>&nbsp;'+
                '<button type="button"><img src="'+eng_img+'/actions/cancel.png" border="0"> Отменить</button>'+                                  
            '</div>';
    $("<form/>").attr("id","dvExtRowConf").addClass("flora buttons").css("text-align","right")
        .dialog({height:380,width:300,title:'Настройка',
                 modal:true,draggable:true,resizable:false,overlay:{opacity:0.5, background:"black"}
               })
        .html(html)
        .find('button:last').click(function(){$('#dvExtRowConf').dialog('close');}).end()
        .find('.cnt').kInputInt().val(readCookie('cnt')?readCookie('cnt'):'20').end()
        .find('.start').kInputInt().end()
        .find('.cnt-mh').kInputInt().val(readCookie('cntmh')?readCookie('cntmh'):'3').change().end()
        .find('.width').kInputInt().val(readCookie('w')?readCookie('w'):'10').end()
        .find('.height').kInputInt().val(readCookie('h')?readCookie('h'):'2').end()
        .find('[value="'+readCookie('pos')+'"]').attr('checked',true).end()
        .find('[value="'+readCookie('or')+'"]').attr('checked',true).end()
        .find('.size-mh').kInputInt().val(readCookie('sizemh')?readCookie('sizemh'):'1').end()
        .dialog('open')
        .unbind('submit')
        .submit(function(){
            $('#dvAddSite button.row-config')
                .attr({
                    'width':$(this).find('.width').val(),
                    'height':$(this).find('.height').val(),
                    'cnt':$(this).find('.cnt').val(),
                    'pos':$(this).find('input[name="pos"]:checked').val(),
                    'or':$(this).find('input[name="or"]:checked').val(),
                    'start':$(this).find('.start').val(),
                    'cnt-mh':$(this).find('.cnt-mh').val(),
                    'size-mh':$(this).find('.size-mh').val(),
                    'configured':'true'
                });
            $('#dvExtRowConf').dialog('close');
            return false;
        })
        .find('table').kTblScroll().end()
        .find('.cnt-mh').change(function(){
            var code = $('#dvExtRowConf table').attr('code');
            var name = $('#dvExtRowConf table').attr('name');
            html = '';
            for(var i=1;i<kInt($(this).val())+1;++i)
                html+='<tr code="'+code+'"><td>'+i+'</td><td>'+i*10+'</td><td>'+name+'</td></tr>';
            $('#dvExtRowConf table').find('tbody').html(html).end().kTblScroll();
            actionStoreplace($('#dvExtRowConf table'));
        }).change();
    actionStoreplace($('#dvExtRowConf table'));
}

function actionStoreplace(table){
    table.find('tbody>tr').each(function(){
        $(this).find('td:eq(0)').unbind('dblclick').dblclick(function(){
            var $this = $(this);
            changeStorPos.call(this,$this);
        });
        $(this).find('td:eq(1)').unbind('dblclick').dblclick(function(){
            var $this = $(this);
            changeStorName.call(this,$this);
        });
        $(this).find('td:eq(2)').unbind('dblclick').dblclick(function(){
            var $this = $(this);
            changeStorType.call(this,$this);
        });
    })
}

// изменение положения места хранения
function changeStorPos($this){
    if($('#dvChPos').length) {$('#dvChPos').dialog('destroy').remove()};
    var html = 'Положение <input type=text class="pos" value="'+$(this).text()+'" /><br>';
    html += '<div class="buttons" style="text-align:center;">'+
                '<button type="submit"><img src="'+eng_img+'/actions/accept.png" border="0"> Подтвердить</button>&nbsp;'+
                '<button type="button"><img src="'+eng_img+'/actions/cancel.png" border="0"> Отменить</button>'+                                  
            '</div>';
    $("<form/>").attr("id","dvChPos").addClass("flora buttons").css("text-align","right")
        .dialog({height:150,width:300,title:'Изменение положения',
                 modal:true,draggable:true,resizable:false,overlay:{opacity:0.5, background:"black"}
               })
        .html(html)
        .find('button:last').click(function(){$('#dvChPos').dialog('close');}).end()
        .find('.pos').focus().select().end()
        .submit(function(){
            $this.text($(this).find('.pos').val());
            $('#dvChPos').dialog('close');
			return false;
        });
}

// изменение имени места хранения
function changeStorName($this){
    if($('#dvChName').length) {$('#dvChName').dialog('destroy').remove()};
    var html = 'Название <input type=text class="name" value="'+$(this).text()+'" /><br>';
    html += '<div class="buttons" style="text-align:center;">'+
                '<button type="submit"><img src="'+eng_img+'/actions/accept.png" border="0"> Подтвердить</button>&nbsp;'+
                '<button type="button"><img src="'+eng_img+'/actions/cancel.png" border="0"> Отменить</button>'+                                  
            '</div>';
    $("<form/>").attr("id","dvChName").addClass("flora buttons").css("text-align","right")
        .dialog({height:150,width:300,title:'Изменение имени',
                 modal:true,draggable:true,resizable:false,overlay:{opacity:0.5, background:"black"}
               })
        .html(html)
        .find('button:last').click(function(){$('#dvChName').dialog('close');}).end()
        .find('.name').focus().select().end()
        .submit(function(){
            $this.text($(this).find('.name').val());
            $('#dvChName').dialog('close');
			return false;
        });
}

// изменение типа места хранения
function changeStorType($this){
    $.getJSON('getStoreplaces',function(JSON){
        if($('#dvChType').length) {$('#dvChType').dialog('destroy').remove()};
        var html = '<div style="height:150px;"><table><thead><tr><th>Код</th><th>Название</th></tr></thead><tbody>';
        for(var i=0;i<JSON.data.length;++i)
            html+='<tr><td>'+JSON.data[i].CODE+'</td><td>'+JSON.data[i].NAME+'</td></tr>';
        html+='</tbody></table></div>';
        html += '<div class="buttons" style="text-align:center;">'+
                    '<button type="submit"><img src="'+eng_img+'/actions/accept.png" border="0"> Подтвердить</button>&nbsp;'+
                    '<button type="button"><img src="'+eng_img+'/actions/cancel.png" border="0"> Отменить</button>'+                                  
                '</div>';
        $("<form/>").attr("id","dvChType").addClass("flora buttons").css("text-align","right")
            .dialog({height:250,width:300,title:'Изменение типа',
                     modal:true,draggable:true,resizable:false,overlay:{opacity:0.5, background:"black"}
                   })
            .html(html)
            .find('button:last').click(function(){$('#dvChType').dialog('close');}).end()
            .find('table').kTblScroll()
                .find('>tbody>tr').dblclick(function(){
                    $this.text($(this).find('td:eq(1)').text());
                    $this.parent().attr('code',$(this).find('td:eq(0)').text());
                    $('#dvChType').dialog('close');
                }).end();
    });
}

/*function getX(num,pos,or,w,h,width){
    //console.log(width)
    if(kInt(w)>kInt(h)) {
        var x = pos=='zig'?kInt(Math.round(num/2)):(num-1)%w+1;
        x = pos=='dug'?(getY(num,pos,or,w,h)==h?w-x+1:x):x;
        x*=width||1;
        return or=='lr'?x:w-x+1;
    } else {
        var x = pos=='zig'?(num%2==0?1:w):(kInt((num-1)/h)==0?w:1);
        x*=width||1;
        return x;
    }
}*/

function getX(num,pos,or,w,h,width){
    if(kInt(w)>kInt(h)) {
        var col = kInt(w/width)
        x = pos == 'zig'?(kInt((num-1)/2)*width):(num<=col?(num-1)*width:(2*col-num)*width);
        return or=='lr'?x:w-x-width;
    } else {
        var col = kInt(h/width);
        var x = pos=='zig'?(num%2==0?w-width:0):(num>col?w-width:0);
        return or=='lr'?x:(x==0?w-width:0);
    }
}

/*function getY(num,pos,or,w,h){
    if(kInt(w)>kInt(h)) {
        var y = pos=='zig'?(num%2==0?h:1):(kInt((num-1)/w)==0?1:h);
        return y;
    } else {
        var y = pos=='zig'?kInt(Math.round(num/2)):(num-1)%h+1;
        y = pos=='dug'?(getX(num,pos,or,w,h)==w?h-y+1:y):y;
        return or!='lr'?y:h-y+1;
    }
}*/

function getY(num,pos,or,w,h,width){
    if(kInt(w)>kInt(h)) {
        var col = kInt(w/width);
        var y = pos=='zig'?(num%2==0?(h-width):0):(num<=col?0:h-width);
        return or=='lr'?y:(y==0?h-width:0);
    } else {
        var col = kInt(h/width);
        var y = pos == 'zig'?(h-kInt((num-1)/2)*width-width):(h-(num<=col?(num-1)*width:(2*col-num)*width)-width);
        return or=='lr'?y:h-y-width;
    }
}

function getXY(num,pos,or,w,h,width){
    if(or=='lr'){
        return {x:getX(num,pos,or,w,h,width),y:getY(num,pos,or,w,h,width)}
    }
}

function createExtRow(row){
    var button = $('#dvAddSite button.row-config');
    if(!button.is('[configured]')) return;
    var cnt = kInt(button.attr('cnt'));
    createCookie('cnt',cnt);
    var cntmh = button.attr('cnt-mh');
    createCookie('cntmh',cntmh);
    var w = kInt(button.attr('width'));
    createCookie('w',w);
    var h = kInt(button.attr('height'));
    createCookie('h',h);
    var pos = button.attr('pos');
    createCookie('pos',pos);
    var or = button.attr('or');
    createCookie('or',or);
    var sizemh = button.attr('size-mh');
    createCookie('sizemh',sizemh);
    if(cnt>=w*h)
        if(!confirm('Площадь ряда меньше либо равна количеству мест хранения! Вы действительно хотите продолжить?')) return;
    row.attr({
        'width':w,
        'height':h,
    }).css({
        'width':size*w-2,
        'height':size*h-2,
    });
    var startname = kInt(button.attr('name'));
    for(var i=1;i<=cnt;++i){
        name = '00'+(startname + i).toString();
        var x = getX(i,pos,or,w,h,sizemh);
        var y = getY(i,pos,or,w,h,sizemh);
        var sitename = row.attr('name')+'-'+name.substring(name.toString().length - 3);
        var site = createSite(row,x*size-1,y*size-1,sitename,'','L','','','null',sizemh,sizemh);
        var child = [];
        var mh = $('#dvExtRowConf table>tbody>tr');
        //for(var j=1;j<=cntmh;++j){
        mh.each(function(){
            child.push({x:'null',y:'null',z:$(this).find('td:eq(0)').text(),width:sizemh,height:sizemh,type:$(this).attr('code'),name:sitename+'-'+$(this).find('td:eq(1)').text(),viewname:'',width:sizemh,height:sizemh, classname: ''})
        })
        site.attr('ch',$.stringify(child));
    }
}
var types={};
function getType(type){
    if(!(type in types)){
        $.ajax({url: 'getSiteSpecies',success:function(resp){
            for(var i=0;i<resp.data.length;++i){
                types[resp.data[i].CODE] = resp.data[i].NAME;
            }
        },async:false,dataType:'json'})
    }
    return types[type];
}

function editSite(el){
    if($('#dvEditSite').length) $('#dvEditSite').dialog('destroy').remove();
    var html = 'Название <input type=text class="siteName" value="'+el.attr('name')+'"/><br>'+
               'Отобр. назв. <input type=text class="siteViewName" value="'+el.attr('viewname')+'"/><br>'+
               'Стили <input type=text class="siteClass" value="'+el.attr('classname')+'"/><br>';
    var type = el.attr('type');
    var subtype = el.attr('subtype');
    $.ajax({url:'getSSsubType', data:{type:type}, success:function(resp){
        html += 'Подтип <select style="width:146px;" class="subtype"><option value="">Без подтипа</option>';
        for(var i=0;i<resp.data.length;++i) 
            html += '<option value="'+resp.data[i].CODE+'" '+(resp.data[i].CODE==subtype?'selected':'')+'>'+resp.data[i].NAME+'</option>';
        html += '</select><br>';
    }, dataType: 'json', async: false})
    var className = el.attr('classname');
    var classSite = el.attr('class');
    var height = 0;
    switch(type){
        case 'L':
            var children_mh = eval(el.attr('ch'));
            var cnt = children_mh!=undefined?children_mh.length+1:4;
            $.ajax({url:'getDefStoreplace',success:function(JSON){
                html += 'Кол-во МХ <input type=text class="cnt-mh" value="'+(cnt-1)+'"/><br><div style="max-height: 130px;height: 130px;"><table code="'+JSON.data.CODE+'" name="'+JSON.data.NAME+'"><thead><tr><th>положение</th><th>Название</th><th>Тип</th></tr></thead><tbody>';
                for(var i=1;i<cnt;++i)
                    html+='<tr code="'+(children_mh!=undefined?children_mh[i-1].type:JSON.data.CODE)+'" siteid="'+(children_mh!=undefined?children_mh[i-1].id:'null')+'">'+
                            '<td>'+(children_mh!=undefined?children_mh[i-1].z:i)+'</td>'+
                            '<td>'+(children_mh!=undefined?children_mh[i-1].name.split('-')[2]:i*10)+'</td>'+
                            '<td>'+(children_mh!=undefined?getType(children_mh[i-1].type):JSON.data.NAME)+'</td></tr>'
            },async: false, dataType: 'json'});
            
            html += '</tbody></table></div>';
            height = 150;
            break;
            
    }
    html += '<div class="buttons" style="text-align:center;margin-top:4px;">'+
                '<button type="submit"><img src="'+eng_img+'/actions/accept.png" border="0"> Подтвердить</button>&nbsp;'+
                '<button type="button"><img src="'+eng_img+'/actions/cancel.png" border="0"> Отменить</button>'+                                  
            '</div>';
    $("<form/>").attr("id","dvEditSite").addClass("flora").css("text-align","right")
        .dialog({height: height + 165,width:300,title:'Изменение элемента',
                 modal:true,draggable:true,resizable:false,overlay:{opacity:0.5, background:"black"}
               })
        .html(html)
        .find('button:last').click(function(){$('#dvEditSite').dialog('close');}).end()
        .dialog('open')
        .find('.siteName').focus().select().end()
        .unbind('submit')
        .submit(function(){
            if(!$(this).find('.siteName').val()) {alert('Введите имя!');return false;}
            var oldname = el.attr('name');
            el.attr('name',$(this).find('.siteName').val());
            el.attr('classname',$(this).find('.siteClass').val());
            el.attr('subtype',$(this).find('.subtype').val());
            el.attr('class',classSite.replace(className,'')+$(this).find('.siteClass').val());
            el.attr('viewname',$(this).find('.siteViewName').val());
            el.find('>span.viewname').text($(this).find('.siteViewName').val());
            
            // дополнительные настройки
            switch(type){
                case 'L':
                    var child = [];
                    var mh = $('#dvEditSite table>tbody>tr');
                    mh.each(function(){
                        child.push({x:'null',y:'null',z:$(this).find('td:eq(0)').text(),width:1,height:1,type:$(this).attr('code'),name:$('#dvEditSite .siteName').val()+'-'+$(this).find('td:eq(1)').text(),viewname:'',id:$(this).attr('siteid')})
                    })
                    el.attr('ch',$.stringify(child));
                    break;
                case 'R':
                    if(confirm('Переименовать все дочерние МП?')){
                        var name = $(this).find('.siteName').val();
                        el.find('.added-site').each(function(){
                            $(this).attr('ch',$(this).attr('ch').replace(RegExp(oldname,'g'),name));
                            $(this).attr('title',$(this).attr('title').replace(oldname,name));
                            $(this).attr('name',$(this).attr('name').replace(oldname,name));
                            $(this).attr('viewname',$(this).attr('viewname').replace(oldname,name));
                        });
                    }
                    break;
            }
            $('#dvEditSite').dialog('close');
            return false;
        });
    switch(type){
        case 'L':
            $('#dvEditSite table').kTblScroll();
            actionStoreplace($('#dvEditSite table'));
            $('#dvEditSite .cnt-mh').change(function(){
                var code = $('#dvEditSite table').attr('code');
                var name = $('#dvEditSite table').attr('name');
                html = '';
                var cnt = kInt($(this).val());
                $('#dvEditSite table>tbody>tr').each(function(i){
                    if(i+1 > cnt) $(this).remove();
                });
                for(var i=$('#dvEditSite table>tbody>tr').length+1;i<cnt+1;++i)
                    html+='<tr code="'+code+'" siteid="null"><td>'+i+'</td><td>'+i*10+'</td><td>'+name+'</td></tr>';
                $('#dvEditSite table').find('tbody').append(html).end().kTblScroll();
                actionStoreplace($('#dvEditSite table'));
            })
            break;
            
    }
}

function saveCollection(site){
    site = $(site);
    var s = site.attr('id')=='place'?{}:{
        'width': site.attr('width'),
        'height': site.attr('height'),
        'x': site.attr('x'),
        'y': site.attr('y'),
        'name': site.attr('name'),
        'viewname': site.attr('viewname'),
        'classname': site.attr('classname'),
        'subtype': site.attr('subtype'),
        'type': site.attr('type'),
        'id': site.attr('id')
    }
    if(site.children('.added-site').length){
        s.children = Array();
        for(var i=0;i<site.children('.added-site').length;++i){
            s.children.push(saveCollection(site.children('.added-site').get(i)));
        }
    }
    if(site.is('[ch]')) {
        s.children = Array();
        var ch = eval(site.attr('ch'));
        for(var i=0;i<ch.length;++i){
            s.children.push(ch[i]);
        }
    }
    return s;
}

function saveDialog(){
    if(confirm('Вы действительно хотите сохранить конфигурацию склада ?')){
        sklad = saveCollection($('#place'));
        $.blockUI({message:'...сохранение...'});
        $.post('createSklad',{sklad: $.stringify(sklad.children), objid:objid, editmode: editmode},function(JSON){
            if(!showErr(JSON)){
                alert('Сохранено');
                $('#place>div').not('#items').remove();
                drawSklad(JSON.data.SITEID);
                editmode = true;
            }
            $.unblockUI();
        },'json');
    }
}

function copySite(site){
    
}

function Site(data){
    this.width = data.width;
    this.height = data.height;
    this.x = data.x;
    this.y = data.y;
    this.name = data.name;
    this.id = data.id;
    this.parent = data.parent;
    this.div = data.div;
}

function drawSklad(id){
    $.getJSON('getSiteInfo',{siteid:id},function(JSON){
        var site = createSite($('#place'),(JSON.data.X-1)*size-1,(JSON.data.Y-1)*size-1,JSON.data.SNAME,JSON.data.VIEWNAME,JSON.data.SPCODE,'',JSON.data.SUBTYPE,id);
        WH_W = kInt(JSON.data.SWIDTH);
        WH_H = kInt(JSON.data.SLENGTH);
        $('#place').width(kScreenW()).height(kScreenH());
        //if(confirm('Хотите ли вы изменить размер ячейки под размер склада ?')){
        size = kInt(Math.min($('#place').width()/WH_W,$('#place').height()/WH_H)) || 1;
        if(size < 1) {
            size  = 1;
        }

        $('#grid').attr({
            width: Math.max(size * WH_W, $('#place').width()),
            height: Math.max(size * WH_H, $('#place').height())
        });

        $('#size').val(size);

        setGrid();
        $('.canvas').scrollTop(0).scrollLeft(0);
        //}
        site.attr({
            'width': JSON.data.SWIDTH,
            'height': JSON.data.SLENGTH
        })
        .css({
            'width': JSON.data.SWIDTH*size-2,
            'height': JSON.data.SLENGTH*size-2
        })
        siteIerarchy(site);
    })
}

function siteIerarchy(sitein,x,y){
    $.ajax({url:'getSiteChild',data:{siteid:sitein.attr('id')},async:false,dataType:'json', success: function(JSON){
        for(var i=0;i<JSON.data.length;++i){
            _x = x||JSON.data[i].X;
            _y = y||JSON.data[i].Y;
            var site = createSite(sitein,(_x-1)*size-1,(_y-1)*size-1,JSON.data[i].SNAME,JSON.data[i].VIEWNAME,JSON.data[i].SPCODE,JSON.data[i].CLASSNAME,JSON.data[i].SUBTYPE,JSON.data[i].SITEID);
            site.attr({
                'width': JSON.data[i].SWIDTH,
                'height': JSON.data[i].SLENGTH
            })
            .css({
                'width': JSON.data[i].SWIDTH*size-2,
                'height': JSON.data[i].SLENGTH*size-2
            })
            if(JSON.data[i].CNTPRINTCHILD>0){
                siteIerarchy(site);
            }

            if(JSON.data[i].SPCODE === 'L'){
                site.attr('ch', JSON.data[i].JSON);
            }
                    // $.ajax({url:'getLChildren',data:{siteid:JSON.data[i].SITEID},async:false,dataType:'json',success:function(JSON){
                    //     var child = [];
                    //     for(var i=0;i<JSON.data.length;++i){
                    //         child.push({
                    //             x:'null',
                    //             y:'null',
                    //             z:JSON.data[i].Z_COORD,
                    //             width:JSON.data[i].SWIDTH,
                    //             height:JSON.data[i].SHEIGHT,
                    //             type:JSON.data[i].CODE,
                    //             name:JSON.data[i].NAME,
                    //             viewname:'',
                    //             classname:'',
                    //             id: JSON.data[i].SITEID})
                    //     }
                    //     site.attr('ch',$.stringify(child));
                    // }});
        }
    }})
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+escape(value)+expires+"; path=/";
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

function hiddenSite(el){
    var siteid = el.attr('id');
    if(!siteid) return;
    $.getJSON('getHiddenSite',{siteid:siteid},function(JSON){
        if(!showErr(JSON)){
            var html = '<table id="hs"><thead><tr><th>Название</th></tr></thead><tbody>';
            for(var i=0;i<JSON.data.length;++i){
                if($('[id="'+JSON.data[i].SITEID+'"]').length) continue;
                html += '<tr siteid="'+JSON.data[i].SITEID+'">'+
                            '<td class="text">'+JSON.data[i].NAME+'</td>'+
                        '</tr>';
            }
            el.find('.hidden').each(function(){
                html += '<tr siteid="'+$(this).attr('id')+'" class="hidden">'+
                            '<td class="text">'+$(this).attr('name')+'</td>'+
                        '</tr>';
            });
            html += '</tbody></table>';
            
            $("<div/>").attr("id","dvHiddenSite").addClass("flora").css("text-align","center")
                .dialog({height: 300, width: 300,title: 'Без координат',
                         modal:false,draggable:true,resizable:false,overlay:{opacity:0.5, background:"black"}
                       })
                .html(html)
                .find('>table').kTblScroll()
                    .find('>tbody>tr').draggable({
                        cursor: '',
                        helper:function(event) {
                            return $('<div/>').html( $(this).find(">td:eq(0)").text() )
                                        .css({'position':'absolute','z-index':'2000','font-weight':'800'}).appendTo( $(document.body) ); 
                        },
                        helperPos:'mouse'
                    }).end();
        }
    })
}

function genNextNum(num){
    function plusOne(lastName, pos){
        var name = lastName;
        if(pos>=0) {
            var chr = name[pos];
            if((chr >= 'A' && chr <= 'Y') || (chr >= '0' && chr <= '8')){
                name[pos] = String.fromCharCode(chr.charCodeAt(0)+1);
            } else {
                if(chr == '9')
                    name[pos] = '0';
                else 
                    name[pos] = 'A';
                name = plusOne(name,pos-1);
            }
        } else {
            name = ['1'].concat(name);
        }
        return name;
    }
    if(!num){
        rows = $('div[type="R"]');
        names = [];
        rows.each(function(){
            names.push($(this).attr('name'));
        });
        names.sort();
        num = names[names.length-1];
        if(!num) return '1A';
    }
    num = num.split('');
    return plusOne(num, num.length-1).join('');
}