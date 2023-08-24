/*  
 *  Мониторинг склада
 *
 *  Copyright (c) 2011 Skychko Denys
 */

var statusBar = null;

$(document).ready(function(){
    if($.touchscreen()){
        $('<link href="'+sps_css.KURSSKLAD+'/jquery.touchscreen.css" rel="stylesheet" type="text/css" media="screen"/>').appendTo('body');
    }
    function menu(action, el){
        eval(action+'.call($(el))');
    };
    $("<ul/>").attr("id",'dvSiteContextMenu').addClass("contextMenu")
        .html('<li class="change"><a href="#change">Выбрать склад</a></li>'+
              (typeof( window[ 'show_viewWSet' ] ) != 'undefined' && show_viewWSet == '1'?'<li class="selectAll separator"><a href="#viewWSet">Наборы</a></li>':'')+
              (typeof( window[ 'show_viewSale' ] ) != 'undefined' && show_viewSale == '1'?'<li class="selectAll"><a href="#viewSale">Отборка</a></li>':'')+
              '<li class="applicationGo"><a href="#searchWares">Товары</a></li>'+
              //(typeof( window[ 'congestion' ] ) != 'undefined' && congestion ? '<li class="information separator"><a href="#infoDload">Загруженность</a></li>':'')+
              (typeof( window[ 'congestion' ] ) != 'undefined' && congestion ? '<li class="information separator"><a href="#infoDload2">Загруженность</a></li>':'')+
              (typeof( window[ 'show_Siteverify' ] ) != 'undefined' && show_Siteverify =='1' ? '<li class=" separator"><a href="#infoSiteverify">Выверка</a></li>':'')+
              (typeof( window[ 'show_crBadWares' ] ) != 'undefined' && show_crBadWares == '1'?'<li class="delete"><a href="#crBadWares">Проблемные заказы</a></li>':'')+
              (typeof( window[ 'show_badWares' ] ) != 'undefined' && show_badWares == '1'?'<li class="badWares"><a href="#badWares">Сроки годности</a></li>':'')+
              (typeof( window[ 'show_viewZones' ] ) != 'undefined' && show_viewZones == '1'?'<li class="viewZones"><a href="#viewZones">Зоны</a></li>':''))
    .appendTo($(document.body));
    var contheight = kScreenH();
    $('#dvData').css({'height':contheight,'width':'100%'});
    $('#dvSite').css({'height':'100%','width':'100%','float':'left','position':'relative'}).contextMenu({menu:'dvSiteContextMenu'},menu);

    change();
    $('#actions-buttons').hide()//.find('#badWaresBtn').unbind('click').click(badWares);
    statusBar = $.kStatusBar('status');
});

function badWares(){
    if( $('#dvBadWares').length ){
        var $d = $("#dvBadWares");
        if ($d.dialog("isOpen") ){
            var offset = $d.parents("div.ui-dialog:first").offset();
            $d.dialog("option","position",[offset.left,offset.top])
            $d.dialog("close");
        }
        else
            $d.dialog("open");
    }
    else dlgBadWares();
}

function dlgBadWares(){
    function clearDiv( $dv ){
        if( $dv == undefined ){
            $("#dvSlots div.error").removeClass('error');
            $("#dvSlots div.warning").removeClass('warning');
            $("#dvSite div.errorBW").removeClass('errorBW');
            $("#dvSite div.warningBW").removeClass('warningBW');
        }
        else{
            $dv.removeClass('errorBW warningBW error warning');
        }
    }


    function searchBadWares(){
        $('#tblBadWares').parents('.kTblScrollFF-wrap').remove();
        $('#tblBadWares').remove();
        if (!$('#btnWareHouses').attr('warehouses')) {
            showMes('Внимание','<div class="dvMes">Выберите склад(ы) для поиска сроков годности!<div>');
            return;
        }
        $.getJSON("getBadWLots",{days:$("#days").val(), siteid: $('#dvSite').attr('siteid'), objs:$('#btnWareHouses').attr('warehouses')},function(JSON){
            if ( !showErr(JSON) ) {
                var html = '<table id="tblBadWares"><thead><tr>'+
                            //'<th title="Локальный код товара">Производитель</th>'+
                            '<th title="Локальный код товара">Группа</th>'+
                            '<th title="Локальный код товара">Код</th>'+
                            '<th title="Наименование товара">Наименование</th>'+
                            '<th title="Срок хранения товара на складе в днях">СХ</th>'+
                            '<th title="Срок хранения товара на складе">СХ</th>'+
                            '<th title="Процент от даты производства">%</th>'+
                            '<th title="Местоположение товара">МП</th>'+
                            '<th title="Номер поддона">Поддон</th>'+
                            '<th title="Количество товара в единицах отображения">Кол-во</th>'+
                            '<th title="Количество товара в единицах хранения">Итого</th>'+
                            '<th title="Дата производства">ДП</th>'+
                            '<th title="Дата окончания срока хранения">ДОСХ</th>'+
                            '</tr></thead><tbody>';
                var kolBadLot = JSON.data.length;
                var wgroup = '|||';
                //var producer = '|||';
                for (var i=0;i<kolBadLot;i++){
                    var tr = JSON.data[i];
                    /*if( producer.indexOf('|||'+tr.PRODID+'||'+tr.PRODUCER+'|||') == -1 )
                        producer += (tr.PRODID+'||'+tr.PRODUCER+'|||');*/
                    if( wgroup.indexOf('|||'+tr.WGID+'||'+tr.WARESGROUP+'|||') == -1 )
                        wgroup += (tr.WGID+'||'+tr.WARESGROUP+'|||');
                    var title = tr.VUCODE ? ' title="'+viewTitle(tr.MUCODE,tr.VUFACTOR,tr.VUCODE)+'"' : '';
                    html += '<tr sid="'+tr.SID+'" hid="'+tr.HID+'" badstatus="'+tr.BADSTATUS+'" prodid="'+tr.PRODID+'" wgid="'+tr.WGID+'">'+
                                //'<td class="text">'+tr.PRODUCER+'</td>'+ //0
                                '<td class="text">'+tr.WARESGROUP+'</td>'+ //1
                                '<td class="number">'+tr.WCODE+'</td>'+ //2
                                '<td class="text">'+tr.WNAME+'</td>'+ //3
                                '<td class="number">'+kInt(tr.USEBYDATE)+'</td>'+ //4
                                '<td class="">'+tr.UBDSTR+'</td>'+ //4
                                '<td>'+kFloat(tr.PERCENT,2)+'</td>'+ //5
                                '<td class="text">'+tr.SNAME+'</td>'+
                                '<td class="text">'+tr.PNUM+'</td>'+
                                '<td'+title+'>'+viewQuantity(tr.AMOUNT,tr.VUFACTOR,tr.VUCODE,tr.MUFACTOR,tr.MUCODE)+'</td>'+
                                '<td class="number">'+kNumber(tr.AMOUNT,3)+'</td>'+
                                '<td>'+kDate(tr.PRODUCTDATE)+'</td>'+
                                '<td>'+kDate(tr.PRODUCTEND)+'</td>'+
                            '</tr>';
                }
                //producer = producer.replace(/^\|\|\|/gi,'').replace(/\|\|\|$/gi,'').split('|||').sort() ;
                wgroup = wgroup.replace(/^\|\|\|/gi,'').replace(/\|\|\|$/gi,'').split('|||').sort();
                var selWh = '<select id="stWg" style="text-transform:none;width:150px;"><option value="null">Не выбрано</option>';
                for( var i=0;i<wgroup.length;++i )
                    selWh += '<option value="'+wgroup[i].split('||')[0]+'">'+wgroup[i].split('||')[1]+'</option>';
                html += '</tbody><tfoot><tr class="buttons"><th>'+selWh+'</th><th id="thBadLot">'+kolBadLot+'</th><th colspan="10" style="text-align:right;">'+
                            '<button type="button" title="Печать"><img src="'+eng_img+'/actions/printer.png" border="0"></button>&nbsp;&nbsp;&nbsp;'+
                            '<button type="button" title="Очистить"><img src="'+eng_img+'/actions/application.png" border="0"></button>&nbsp;&nbsp;&nbsp;'+
                            '<button type="button" title="Показать на местоположениях"><img src="'+eng_img+'/actions/application_view_detail.png" border="0"></button>'+
                        '</th></tr></tfoot></table>';
                $("#dvBadWares").append(html).find("table").rowFocus().kTblScroll() //.tablesorter()
                    .tablesorter({dateFormat:'dd.mm.yyyy',widgets:['zebra'],
                                  headers:{ 0:{sorter:"text"},1:{sorter:"text"},2:{sorter:"digit"},3:{sorter:"text"},4:{sorter:"digit"},5:{sorter:"digit"},
                                            6:{sorter:"text"},7:{sorter:"text"},8:{sorter:"text"},9:{sorter:"digit"},10:{sorter:"longDate"},11:{sorter:"longDate"}
                                          }
                                });
                $('#tblBadWares')
                    .find('button:eq(0)').unbind('click').click(function(){
                        var wnd = window.open(sp_reports+'/print.html');
                        wnd.onload = function(){
                            wnd.document.getElementById("dvDateTime").innerHTML = kNow();
                            wnd.document.getElementById("dvHeader").innerHTML = 'Отчет по сроком годности';
                            wnd.document.getElementById("tbl").innerHTML = $('#tblBadWares>thead').html()+$('#tblBadWares>tbody').html();
                        };
                    }).end()
                    .find('button:eq(2)').unbind('click').click(function(){
                        clearDiv();
                        $('#tblBadWares>tbody>tr').each(function(){
                            var classBL = $(this).attr('badstatus') == '1' ? 'error' : 'warning';
                            var $dvSr = $('#dvSr_'+$(this).attr('sid') );
                            var $dvS = $('#dvS_'+$(this).attr('hid') );
                            if( $dvS.length ){
                                clearDiv($dvS);
                                $dvS.addClass(classBL+'BW');
                            }
                            if( $dvSr.length ){
                                clearDiv($dvSr);
                                $dvSr.addClass(classBL);
                            }
                        });
                    }).end()
                    .find('button:eq(1)').unbind('click').click(function(){ clearDiv(); });
                $('#tblBadWares>tfoot').find('select').unbind('change').change(function(){
                    var wg = $('#stWg').val();
                    //var pr = $('#stPr').val();
                    var kolvo = $('#tblBadWares>tbody>tr').length;
                    $('#tblBadWares>tbody>tr').show().each(function(){
                        if( wg != 'null' && wg != $(this).attr('wgid') ){
                            $(this).hide();
                            --kolvo
                        }
                        /*else
                            if( pr != 'null' && pr != $(this).attr('prodid') ){
                                $(this).hide();
                                --kolvo;
                            }    */
                    });
                    $('#tblBadWares').kTblScroll();
                    $('#thBadLot').text(kolvo);
                });
            }
        });
    }

    var $dlg = $('<div/>').attr('id','dvBadWares').addClass('flora').css("text-align","center")
                .dialog({height:400,width:kScreenW()-200,title:'Сроки годности',modal:false,draggable:true,resizable:true,
                        closeOnEscape:false, position:["right","bottom"],
                        resizeStop:function(e,ui){
                            var $tbl = $("#tblBadWares");
                            ( $tbl.length &&  $tbl.kTblScroll() );
                        }
                }).bind('dialogclose',function(){clearDiv();});
    $dlg.html('<div id="dvDays" class="buttons"><b>Количество дней: </b><input id="days" type="text" values="7">'+
                '<button type="button" id="btnSearchBW"><img src="'+eng_img+'/actions/find.png" border="0"></button>'+
                '<button type="button" title="Склады"  id="btnWareHouses" tasktypes="" wh=""><img src="'+eng_img+'/actions/application_view_detail.png" alt="">Склады</button></div>');
    $('#dvDays').css({'width':'100%','height':'30px'}).find('>input[type="text"]').css('width','50px').end()
        .find('#btnSearchBW').focus().unbind('click').click(searchBadWares);
    $('#btnWareHouses').click(function () {
        $.getJSON('userWareHouses', function (json) {
        var html = '<table id="tblWareHouses"><thead><tr>\
                            <th class="chk"><input type="checkbox" checked="checked" value=""></th>\
                            <th>Наименование</th>\
                        </tr></thead><tbody>';
        var wh = ''
        for (var i = 0; i < json.data.length; i++) {
          if (json.data[i].WHID == "1420" ) continue;
          html += '<tr><td class="chk"><input type="checkbox" checked="checked" value="' + json.data[i].WHID + '">\
                             <td class="text">' + json.data[i].WHNAME + '</td></tr>';
          wh += json.data[i].WHID + ',';
        }
        html += '</tbody><tfoot><tr><th colspan="2">&nbsp;</th></tr></tfoot></table>';

        $('#btnWareHouses')
          .attr('warehouses', wh);
            var $dv = $('#dvWareHousesDialog');
            if ($dv.length) {
              $dv.dialog('open');
            }
            else {
              var $dv = $("<div/>").attr("id", "dvWareHousesDialog").addClass("flora").css("text-align", "center")
                .dialog({closeOnEscape: false, title: 'Список складов', autoOpen: true,
                  resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
                  height: 300, width: 350})
                .html('<div style="position:relative;loat:left;width:100%;height:85%;">' + html + '</div>\
                                           <div style="width:100%;height:15%;" class="buttons"><br>\
                                            <button type="button" id=""><img src="' + eng_img + '/actions/accept.png" border="0">Ок</button>&nbsp;&nbsp;\
                                            <button type="button" id=""><img src="' + eng_img + '/actions/cancel.png" border="0">Отменить</button>\
                                           </div>')

              $dv.find('table')
                .kTdChk().kTblScroll().end()
                .find('button')
                .filter(':first').click(function () {
                  var wh = '', i = 0;
                  $('#tblWareHouses tbody>tr>td>input').each(function () {
                    if ($(this).is(':checked')) {
                      wh += $(this).val() + ',';
                      i++;
                    }
                  })
                  $('#btnWareHouses').attr('warehouses', wh);
                  if (i == json.data.length + 1) {
                    $('#btnWareHouses').attr('warehouses', '')
                    $('#btnWareHouses>img').attr('src', eng_img + '/actions/application_view_detail.png');
                  }
                  else if (wh.length)
                    $('#btnWareHouses>img').attr('src', eng_img + '/actions/application_view_detail.png');
                  else
                    $('#btnWareHouses>img').attr('src', eng_img + '/actions/application.png')
                  $dv.dialog('close')
                }).end()
                .filter(':last').click(function () {
                  $dv.dialog('close')
                })
            }
      });
    });
    $("#days").val(7).kInputInt({minus:true}).keypress(function(e){
        if( e.which == 13 )
            searchBadWares();
    });
}

function change(){
    if ($("#dvWarehouses").length) $("#dvWarehouses").dialog("destroy").remove();
    if ($("#dlgViewSale").length) $("#dlgViewSale").dialog("destroy").remove();

    html = '<table><thead><tr><th>Склад</th></tr></thead><tbody>';
    $.getJSON('ajaxGetWarehouses',function(JSON){
        if(!showErr(JSON)){
            if(JSON.data.length == 1) {subm(); return;}
            for(var i=0;i<JSON.data.length;++i)
                html+='<tr value="'+JSON.data[i].SITEID+'"><td>'+JSON.data[i].NAME+'</td></tr>';
        }
        function subm(){
            var row = $('#dvWarehouses table').rf$GetFocus();
            siteidin = row.attr('value');
            if(!row.length) siteidin = JSON.data[0].SITEID;
            $('#dvSite').attr('siteid',siteidin);
            //$('#caption').html(row.find('td:eq(0)').text());
            //if(!row.length) $('#caption').html(JSON.data[0].NAME)
            $('#dvSite').empty().initConfig(siteidin,function(siteid){
                var $dv = $(this);
                $.getJSON('getSiteChild',{siteid:siteid},function(JSON){
                    if( !showErr(JSON) ){
                        $dv.siteViewMaster(JSON.data,false);
                        $('#dvSite').find('div[spcode="L"]').click($.titleInfo);
                    /*    $('#dvSite').find('div[spcode="L"]').mouseover(function(){
                            $hover_L = $(this);
                            timer = setTimeout("showTtl()",1000);
                        })
                        .mouseout(function(){
                            clearTimeout(timer);
                        });*/
                    }
                });
            });
            $("#dvWarehouses").dialog("close");
            $('#actions-buttons').show();
        }
        html+='</tbody></table>';
        $("<div/>").attr("id","dvWarehouses")
            .addClass("flora").css("text-align","center")
            .dialog({height:300,width:300,modal:true,resizable:false,draggable:true,title:"Выбор склада",overlay:{backgroundColor:'#000',opacity: 0.5}})
            .html(html)
                .find('table').kTblScroll('100%').rowFocus({rfSetDefFocus:false,rfFocusCallBack:subm}).end();
    });
}

/*function infoDload(){
    var prefix = ['','-ms-','-webkit-','-o-','-moz-'];
    function lg173(proc){
        var result = '';
        $.each(prefix, function(i, value){
            result +='background-image: '+value+'linear-gradient(left , rgb(173,95,95) '+proc+'%, rgb(246,247,212) 0%) !important;';
        })
        return result;
    }
    function lg104(proc){
        var result = '';
        $.each(prefix, function(i, value){
            result +='background-image: '+value+'linear-gradient(left , rgb(104,158,101) '+proc+'%, rgb(246,247,212) 0%) !important;';
        })
        return result;
    }
    function lg93(proc){
        var result = '';
        $.each(prefix, function(i, value){
            result +='background-image:'+value+'linear-gradient(left , rgb(93,131,148) '+proc+'%, rgb(202,218,235) 0%) !important;';
        })
        return result;
    }

    function siteBG(proc){
        var result = '';
        $.each(prefix, function(i, value){
            result +='background-image:'+value+'linear-gradient(right bottom, rgb(59,100,143) '+proc+'%, rgb(167,178,196) 0%) !important;';
        })
        return result;
    }
    defaultView();
    infoDload.hist = [];
    var siteid = $('#dvSite').attr('siteid');
    $.getJSON('checkDload',{siteid:siteid},function(JSONR){
        if( !showErr(JSONR) ){
            $.getJSON('checkDloadFull',{siteid:siteid},function(JSON){
                if( !showErr(JSON) ){
                    var html = '<table id="tblLoadFullInfo"><thead><tr>'+
                                '<th>Ряд</th>'+
                                '<th>Описание</th>'+
                                '<th>Занято</th>'+
                                '<th title="Занято процентов">Занято %</th>'+
                                '<th>Свободно</th>'+
                                '<th>Всего</th>'+
                               '</tr></thead><tbody>';
                    var stype = '', sname = '', id = '';
                    var sum1=0, sum2=0, sum3=0;
                    var sum1f=0, sum2f=0, sum3f=0;
                    var sum1v=0, sum2v=0, sum3v=0;
                    var curpt = 0;
                    var maxpt = 0;
                    var proc = 0;
                    var backgrnd;
                    for(var i=0;i<JSON.data.length;i++){
                        sname = '';
                        id = '';
                        curpt = kFloat(JSON.data[i].CURPALLET);
                        maxpt = kFloat(JSON.data[i].MAXPALLET);
                        proc = curpt/maxpt*100;
                        if( JSON.data[i].STYPE[0] == 'r'  ){
                            id = 'id="'+JSON.data[i].ID_SITE+'"';
                            if( JSON.data[i].STYPE[1] == undefined || JSON.data[i].STYPE[1] == ' ' )
                                stype = 'Ряд';
                            else{
                                if( JSON.data[i].STYPE[1] == 'f' ){
                                    stype = 'Ряд(Физический)';
                                    sum1f += curpt;
                                    sum2f += maxpt-curpt;
                                    sum3f += maxpt;
                                }
                                else{
                                    stype = 'Ряд(Виртуальный)';
                                    sum1v += curpt;
                                    sum2v += maxpt-curpt;
                                    sum3v += maxpt;
                                }
                            }
                            sname = JSON.data[i].SNAME;
                            sum1 += curpt;
                            sum2 += maxpt-curpt;
                            sum3 += maxpt;
                            backgrnd = lg93(proc)
                        }
                        else
                            if( JSON.data[i].STYPE == 'f' ){
                                stype = 'Физические стеллажи';
                                sum1f += curpt;
                                sum2f += maxpt-curpt;
                                sum3f += maxpt;

                                if( proc >= 90 )
                                    backgrnd = lg173(proc);
                                else
                                    backgrnd = lg104(proc)
                            }
                            else{
                                stype = 'Виртуальные стеллажи';
                                sum1v += curpt;
                                sum2v += maxpt-curpt;
                                sum3v += maxpt;

                                if( proc >= 10 )
                                    backgrnd = lg173(proc);
                                else
                                    backgrnd = lg104(proc)
                            }
                        html += '<tr '+id+' higher="'+JSON.data[i].HIGHER+'" num="'+(i+1)+'">'+
                                    '<td class="text">'+sname+'</td>'+
                                    '<td class="text">'+stype+'</td>'+
                                    '<td>'+JSON.data[i].CURPALLET+'</td>'+
                                    '<td style="'+backgrnd+'">'+parseInt(proc,10)+'%</td>'+
                                    '<td>'+(maxpt-curpt)+'</td>'+
                                    '<td>'+JSON.data[i].MAXPALLET+'</td>'+
                                '</tr>';
                    }
                    proc = parseInt(sum1f/sum3f*100,10);
                    if( proc >= 90 )
                        backgrnd = 'color:black;'+lg173(proc)
                    else
                        backgrnd = 'color:black;'+lg104(proc)

                    var proc1 = 0, proc2 = 0, backgrnd1 = 0, backgrnd2 = 0;
                    proc1 = parseInt(sum1v/sum3v*100,10)
                    if( proc1 >= 10 )
                        backgrnd1 = 'color:black;'+lg173(proc1)
                    else
                        backgrnd1 = 'color:black;'+lg104(proc1)

                    proc2 = parseInt(sum1/sum3*100,10)
                    backgrnd2 = 'color:black;'+lg93(proc2)

                    html += '</tbody><tfoot><tr>'+
                                '<th colspan="2">Физические</th><th>'+sum1f+'</th>'+
                                '<th style="'+backgrnd+'">'+proc+'%</th>'+
                                '<th>'+sum2f+'</th><th>'+sum3f+'</th>'+
                            '</tr><tr>'+
                                '<th colspan="2">Виртуальные</th><th>'+sum1v+'</th>'+
                                '<th style="'+backgrnd1+'">'+proc1+'%</th>'+
                                '<th>'+sum2v+'</th><th>'+sum3v+'</th>'+
                            '</tr><tr>'+
                                '<th colspan="2">Всего</th><th>'+sum1+'</th>'+
                                '<th style="'+backgrnd2+'">'+proc2+'%</th>'+
                                '<th>'+sum2+'</th><th>'+sum3+'</th>'+
                            '</tr><tr>'+
                                '<th colspan=6 class="buttons"><button title="Печать"><img src="'+eng_img+'/actions/printer.png"/></button></th>'+
                            '</tr></tfoot></table>';

                    if( $('#dlgSiteDLoad').length > 0 ){
                        $('#dlgSiteDLoad').dialog('open');
                        $('#dlgSiteDLoad').dialog('option',{'height':400,'width':500,'position':['right','bottom']});
                        $('#dlgSiteDLoad').html(html);
                    }
                    else{
                        var $dlg = $('<div/>').attr('id','dlgSiteDLoad').addClass('flora').css('text-align','center')
                                    .dialog({height:400,width:500,title:'Заполненность склада',modal:false,draggable:true,resizable:false,
                                            closeOnEscape:false, position:['right','bottom'],
                                    }).bind('dialogclose',function(){
                                        for(var i=0;i<infoDload.hist.length;++i){
                                            $('#'+infoDload.hist[i].id).attr('title',infoDload.hist[i].title)
                                                .css(infoDload.hist[i].css);
                                        }
                                    });
                        $dlg.html(html).dialog('close').dialog('open');
                    }

                    $('#tblLoadFullInfo').find('button').click(function(){
                        var w = window.open(sp_reports+'/printDLoad.html'),pdate = '';
						w.onload = function(){
							w.document.getElementById("dvHeader").innerHTML = 'Загруженность склада на '+kDateTime(kNow()) + ' ('+$('#caption').text()+')';
							w.document.getElementById("tbl").innerHTML = $('#tblLoadFullInfo').printHTML();
						}
                    });

                    var parents=[];
                    $("#tblLoadFullInfo>tbody>tr").each(function (i){
                        var higher = $(this).attr('higher');
                        if( higher != '' ){
                            parents.push( $("#tblLoadFullInfo>tbody>tr[id='"+higher+"']").attr('num') );
                        }
                        else
                            parents.push(0);
                    });

                    $('#tblLoadFullInfo').css('width','100%').find('>tbody').jqTreeTable(parents,{
                            openImg: eng_img+'/treetable/tv-collapsable.gif',
                            shutImg: eng_img+'/treetable/tv-expandable.gif',
                            leafImg: eng_img+'/treetable/tv-item.gif',
                            lastOpenImg: eng_img+'/treetable/tv-collapsable-last.gif',
                            lastShutImg: eng_img+'/treetable/tv-expandable-last.gif',
                            lastLeafImg: eng_img+'/treetable/tv-item-last.gif',
                            vertLineImg: eng_img+'/treetable/vertline.gif',
                            blankImg: eng_img+'/treetable/blank.gif',
                            collapse: [],
                            column: 0,
                            striped: false,
                            highlight: false,
                            state: false
                        });
                    $('#tblLoadFullInfo').kTblScroll();
                    var proc, $dv, title;
                    infoDload.hist = [];
                    for(var i=0;i<JSONR.data.length;i++){
                        $dv = $('#dvS_'+JSONR.data[i].ID_SITE);
                        if( $dv.length > 0 ){
                            proc = parseInt(JSONR.data[i].CURPALLET,10)/parseInt(JSONR.data[i].MAXPALLET,10)*100;
                            title = $dv.attr('title');
                            infoDload.hist.push({'id':$dv.attr('id'),
                                                 'title':title,
                                                 'css':{'background-image':$dv.css('background-image'),'opacity':$dv.css('opacity')} });
                            $dv.css({'opacity':'0.6'})
                               .attr('title',(title+' Паллеты: '+JSONR.data[i].CURPALLET+' из '+JSONR.data[i].MAXPALLET) ).attr('style', $dv.attr('style')+  siteBG(proc));
                        }
                    }
                }
            });
        }
    });
}*/
function defaultView(){
    if( $('#dlgSiteDLoad').length > 0 && $('#dlgSiteDLoad').dialog('isOpen')  )
        $('#dlgSiteDLoad').dialog('close');
    if( $('#dlgViewSale').length > 0 && $('#dlgViewSale').dialog('isOpen') )
        $('#dlgViewSale').dialog('close');
    if( $('#dlgESlot').length > 0 && $('#dlgESlot').dialog('isOpen') )
        $('#dlgESlot').dialog('close');
    if( $('#dlgCrBadWares').length > 0 && $('#dlgCrBadWares').dialog('isOpen') )
        $('#dlgCrBadWares').dialog('close');
    if( $('#dlgViewWSet').length > 0 && $('#dlgViewWSet').dialog('isOpen') )
        $('#dlgViewWSet').dialog('close');
    if( $('#dlgSiteverify').length > 0 && $('#dlgSiteverify').dialog('isOpen') )
        $('#dlgSiteverify').dialog('close');
    if( $.fn.popup.closeShowTitle != undefined )
        $.fn.popup.closeShowTitle();
}

function coalesce(arr){
    if( arr != undefined ){
        for(var i=0;i<arr.length;++i){
            if(arr[i] != undefined && arr[i] != '')
                return arr[i];
        }
    }
}

function searchWares() {
	defaultView();

	//var height = kScreenH()*0.8;

    if( $('#dlgSearchWares').length > 0 )
        $('#dlgSearchWares').dialog('destroy').remove();

	var html = '<div style="position:relative;float:left;width:100%;height:100%;">\
					<div style="position:relative;float:left;width:100%;height:20%;">\
						<form id="frmCargoWares" action="waresLocateC" class="buttons">\
							<select style="width:50px">\
								<option value="wcode">Код</option>\
								<option value="wname">Наименование</option>\
								<option value="wbarcode">Штрих-код</option>\
							</select>&nbsp;\
							<input type="text" id="frmCargoWaresInput" style="width:100px" value=""></input>&nbsp;\
							<button type="submit"><img src="'+eng_img+'/actions/magnifier.png" border="0">Искать</button>\
							<button type="button"><img src="'+eng_img+'/actions/view_tree.png" border="0">Товары</button>\
					   </form><hr>\
					   <b><span id="dvCargoWaresInfo" style="width:100%;">&nbsp;</span></b><hr>\
					</div>\
					<div id="dvSWaresData" style="position:relative;float:left;width:100%;height:80%;">\
					</div>\
			   </div>';
    var $dlg = $('<div/>')
				  .attr('id','dlgSearchWares')
				  .addClass('flora')
				  .css('text-align','center')
                  .dialog({height:330,width:550,title:'Поиск товаров',modal:false,draggable:true,resizable:true,
                        closeOnEscape:false, position:['right','bottom'],
                        resizeStop:function(){
                            //var height = $('#dlgSearchWares').height();
                            //$('#dvSWaresFilter').css({'height':30});
                            //$('#dvSWaresData').css({'height':height-30});
                            if( $('#tblSWaresData').length )
                                $('#tblSWaresData').kTblScroll();
                        }
                })
				.html(html)
				.bind('dialogclose',function(){
                    $('#dvSite div.waresCont').removeClass('waresCont');
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
					var $d = $("<div/>")
					           .addClass("flora")
							   .css("text-align","center")
							   .dialog({height:250,width:500,modal:true,resizable:false,draggable:true,
							             title:"Выбор",overlay:{backgroundColor:'#000',opacity: 0.5}});
					var html = "<table><thead><tr><th>Код</th><th>Наименование</th></tr></thead><tbody>";
					for (var i=0; i<JSON.data.length; i++) {
						var tr = JSON.data[i];
						html += '<tr wid="'+tr.WARESID+'"><td class="number">'+tr.WARESCODE+'</td><td class="text">'+tr.WARESNAME+'</td></tr>';
					}
					$d.html(html);
					$("table",$d).tablesorter().kTblScroll()
						.find("tbody>tr").click(function() {
							var $tr = $(this);
							waresSet($tr.attr("wid"),$tr.find("td:first").text(),$tr.find("td:last").text())
							$d.dialog("close");
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

	function waresSet(wid,wcode,wname) {
		$("#dvCargoWaresInfo").html(wcode+' - '+wname).attr('wid',wid);
		$('#dvSite').find('div.waresCont').removeClass('waresCont');
		$.getJSON('searchWar',{siteid:$('#dvSite').attr('siteid'),waresid:wid},function(JSON){
            if(!showErr(JSON)){
                var html = '<table id="tblSWaresData"><thead><tr>'+
                                '<th>МП</th>'+
                                '<th>Тип МП</th>'+
                                '<th>Стеллаж</th>'+
                                (useviewunit?'<th>Кол-во</th>':'')+
                                '<th>Итого</th>'+
                           '</tr></thead><tbody>';
                var kolData = JSON.data.length;
                if( kolData > 0 ) {
					var title = viewTitle(JSON.data[0].MAINUCODE,JSON.data[0].VIEWUFACTOR,JSON.data[0].VIEWUCODE);
                    for(var i=0;i<kolData;++i) {
						var tr = JSON.data[i];
                        html += '<tr>'+
                                    '<td>'+tr.SNAME+'</td>'+
                                    '<td>'+tr.SPNAME+'</td>'+
                                    '<td>'+tr.STNAME+'</td>'+
                                    (useviewunit?('<td title="'+title+'">'+viewQuantity(tr.AMOUNT,tr.VIEWUFACTOR,tr.VIEWUCODE,tr.MAINUFACTOR,tr.MAINUCODE)+'</td>'):'')+
                                    '<td class="number">'+tr.AMOUNT+'</td>'+
                                '</tr>';
                        var $dv = $('#dvS_'+tr.ID_STSITE);
                        if( $dv.length )
                            $dv.addClass('waresCont');
                    }
				}
                else {
				    html += '<tr><td colspan="'+(useviewunit?5:4)+'">Ничего не найдено!</td></tr>';
				}
                html += '</tbody><tfoot><tr><th colspan="'+(useviewunit?5:4)+'">'+kolData+'</th></tr></tfoot></table>';
                $('#dvSWaresData').html(html).find('>table').kTblScroll();
            }
        });
	}

}

;(function($){
    //Функция будет содержать статические переменные 
    function configMP(){
        configMP.dvS = 'dvS_';      //приставка к id местоположений
        configMP.borderWidth = 1;   //ширина border
        configMP.addTop = 0;        //добавка к верхнему краю (для симпотичного отображения)
        configMP.addLeft = 0;       //добавка к левому краю (для симпотичного отображения)
        configMP.block_len = 0      //ширина=высота одного блока (блок считается квадратным)
    }

    $.fn.initConfig = function(siteid,callback){
        var $dv = $(this).css({'text-align':'left'});
        $dv.css({'width':'100%', height:'100%'});
        configMP();

        //console.log(dv_width);
        $.getJSON('getSiteInfo',{siteid:siteid},function(JSON){
            if( !showErr(JSON) ){
                $('#grid').css({
                    'width':kScreenW(),//dv_block_x*configMP.block_len+'px',
                    'height':kScreenH()//dv_block_y*configMP.block_len+'px'
                }).attr({
                    'width':kScreenW(),//dv_block_x*configMP.block_len,
                    'height':kScreenH()//dv_block_y*configMP.block_len
                });
                var dv_height = parseInt($dv.height(),10);
                //console.log(dv_height);
                var dv_width = parseInt($dv.width(),10);
                $dv.attr({'x':JSON.data.X,'y':JSON.data.Y});
                var dv_block_x = parseInt(JSON.data.SWIDTH,10);
                configMP.slength = dv_block_x;
                var dv_block_y = parseInt(JSON.data.SLENGTH,10);
                configMP.swidth = dv_block_y;
                if( dv_height*dv_width*dv_block_x*dv_block_y === 0 ){
                    showMes('Ошибка','<div class="dvMes">Неверные начальные параметры!<div>');
                    return;
                }
                if( dv_height/dv_block_y < dv_width/dv_block_x ){
                    configMP.block_len = dv_height/dv_block_y;
                    //configMP.addTop = (dv_height-dv_block_y*configMP.block_len)/2;
                }
                else{
                    configMP.block_len = dv_width/dv_block_x;
                    //configMP.addLeft = (dv_width-dv_block_x*configMP.block_len)/2;
                }
                if( callback != undefined && typeof callback == 'function' )
                    callback.call($dv,siteid);
                $dv.css({
                    'width':dv_block_x*configMP.block_len-2+'px',
                    'height':dv_block_y*configMP.block_len-2+'px'
                }).attr('title', JSON.data.SNAME);
                //clearCanvas();
                //setGrid(configMP.block_len)
                //configMP.block_len = 15;
                var fontSize = configMP.block_len - 2;
                $dv.css({'font-size':fontSize+'px'});

                $('style', $dv).remove();
                $('<style/>').text(JSON.data.CSSTEXT).appendTo($dv);
            }
        });
    }

    function clearCanvas(){
        var canvas = $("#grid")[0];
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function setGrid(size){
        var context = $('#grid')[0].getContext("2d");
        var $grid = $('#grid');
        context.lineWidth = 2;
        context.strokeStyle = "#eee";
        clearCanvas();
        context.beginPath();
        for(var x=0;x<=$grid.width();x+=size) {
            context.moveTo(x, 0);
            context.lineTo(x, $grid.height());
        }
        for(var y=0;y<=$grid.height();y+=size) {
            context.moveTo(0, y);
            context.lineTo($grid.width(), y);
        }
        context.stroke();
        context.closePath();
    }

    $.fn.siteViewMaster = function(data,callback){
        if( data.length > 0 ){
            var $dvS = $(this);
            var config = {'x':'1',
                          'y':'1',
                          'addTop':configMP.addTop,
                          'addLeft':configMP.addLeft,
                          'swidth':configMP.swidth,
                          'slength':configMP.slength,
                          'borderDrow':false};

            var site = new Site(config,data);
            $('#dvSite').css({
                'font-size':configMP.block_len,
                'border': '2px dashed black'
            })
            site.drawSiteXY($dvS,configMP.block_len);
        }
    }
})(jQuery);