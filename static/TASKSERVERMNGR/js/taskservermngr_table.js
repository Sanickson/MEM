var tblTaskServer;
var $dv;
;

function getStr(td) {
    var numItem = tblTaskServer._cfg.clmSortKey.indexOf(td) + 1;
    return 'td:nth-child(' + numItem +')';
}

$.Overfulfill = function () {
    var taskid = $(this).attr("id");
    var queueId = tblTaskServer.trKeyId(taskid);
    var getSt = tblTaskServer.trDataById(taskid).STATUS;
    var jsonFull = {data: [], ext_data: queueId};
    if (getSt === "1" || getSt === "E") {
        $.ajax({
            url: 'taskserver_overfulfillStatus',
            dataType: 'json',
            data: {'taskid': queueId},
            success: function (json) {
                $.ajax({
                    url: 'taskserver_item',
                    dataType: 'json',
                    data: {'taskid': queueId},
                    success: function (json) {
                        jsonFull.data.push(json.data);
                        tblTaskServer.data(jsonFull);
                    }
                })
            }
        })
    } else { alert("Задание нельзя перевыполнить!"); }
};

$.Deletetask = function () {
   var taskid = $(this).attr("id");
   var queueId = tblTaskServer.trKeyId(taskid);
   if (confirm('Вы действительно хотите удалить задание?')) {
       $.ajax({
           url: 'taskserver_deleteTask',
           dataType: 'json',
           data: {'taskid': queueId},
           success: function (json) {
               tblTaskServer.trDel(taskid);
           }
       });
   }
};

$.Updatetask = function () {
    var taskid = $(this).attr("id");
    var queueId = tblTaskServer.trKeyId(taskid);
    var jsonFull = {data: [], ext_data: queueId};
    $.ajax({
        url: 'taskserver_item',
        dataType: 'json',
        data: {'taskid': queueId},
        success: function (json) {
            jsonFull.data.push(json.data);
            tblTaskServer.data(jsonFull);
        }
    });
};

$.Queuebond = function () {
    var taskid = $(this).attr("id");
    var dlg = $("div#dvQueueBond");
    var queueId = tblTaskServer.trKeyId(taskid);
    var titleDialog = "Задание №" + queueId + ": Связи";
    dlg.css({"display":"block",
            "overflow":"auto"});
    dlg.dialog({
        resizable: true,
        width: 1160,
        height: 400
    });
    dlg.dialog('option', 'title' ,titleDialog);
    $.ajax({
        url: 'taskserver_selectQueuebond',
        dataType: 'json',
        data: {'taskid': queueId},
        success: function (json) {
            if (json.data.length !== 0) {
                dlg.html("");
                for (var i=0; i < json.data.length; i++) {
                    var queueHtml = "<div class='QB_Block'>" +
                        "<div><div class='QB_Elem'>" +
                        "<p class='QB_Title'>Номер связи</p>" +
                        "<p class='QB_Text'>" + json.data[i].QUEUEBONDID + "</p>" +
                        "</div>" +
                        "<div class='QB_Elem'>" +
                        "<p class='QB_Title'>Тип связи</p>" +
                        "<p class='QB_Text'>" + json.data[i].QUEUEBONDTYPE + "</p>" +
                        "</div>" +
                        "<div class='QB_Elem'>" +
                        "<p class='QB_Title' title='Время последнего изменения'>ВПИ</p>" +
                        "<p class='QB_Text'>" + json.data[i].LASTDATE + "</p>" +
                        "</div></div>";
                    var docHtml = "<div><div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Документ</p>" +
                                    "<p class='QB_Text'>" + json.data[i].DOCID + "</p>" +
                                    "</div>" +
                                    "<div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Номер документа</p>" +
                                    "<p class='QB_Text'>" + json.data[i].DOCNUMBER + "</p>" +
                                    "</div>" +
                                    "<div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Тип документа</p>" +
                                    "<p class='QB_Text'>" + json.data[i].DOCTYPE + "</p>" +
                                    "</div>" +
                                    "<div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Статус документа</p>" +
                                    "<p class='QB_Text'>" + json.data[i].DOCSTATUS + "</p>" +
                                    "</div>" +
                                    "<div class='QB_Elem'>" +
                                    "<p class='QB_Title'>От кого</p>" +
                                    "<p class='QB_Text'>" + json.data[i].DOCFROMOBJ + "</p>" +
                                    "</div>" +
                                    "<div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Кому</p>" +
                                    "<p class='QB_Text'>" + json.data[i].DOCTOOBJ + "</p>" +
                                    "</div>" +
                                    "<div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Дата</p>" +
                                    "<p class='QB_Text'>" + json.data[i].DOCDATE + "</p>" +
                                    "</div></div>"
                    var objHtml = "<div style ='display:inline-block;'><div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Объект</p>" +
                                    "<p class='QB_Text'>" + json.data[i].OBJCODE + "</p>" +
                                    "</div>" +
                                    "<div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Наименование объекта</p>" +
                                    "<p class='QB_Text'>" + json.data[i].OBJNAME + "</p>" +
                                    "</div></div>";
                    if (json.data[i].OBJCODE === "") {
                       objHtml = "<div style ='display:inline-block;'><div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Наименование объекта</p>" +
                                    "<p class='QB_Text'>" + json.data[i].OBJNAME + "</p>" +
                                    "</div></div>";
                    }
                    var waresHtml = "<div style ='display:inline-block;'><div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Товар</p>" +
                                    "<p class='QB_Text'>" + json.data[i].WARESCODE + "</p>" +
                                    "</div>" +
                                    "<div class='QB_Elem'>" +
                                    "<p class='QB_Title'>Наименование товара</p>" +
                                    "<p class='QB_Text'>" + json.data[i].WARESNAME + "</p>" +
                                    "</div></div>";

                    if (json.data[i].DOCID !== "" && json.data[i].OBJID !== "" && json.data[i].WARESID !== "") {
                        dlg.append(queueHtml + docHtml + objHtml + waresHtml);
                    }
                    else if (json.data[i].DOCID !== "" && json.data[i].OBJID !== "") {
                        dlg.append(queueHtml + docHtml + objHtml);
                    }
                    else if (json.data[i].DOCID !== "" && json.data[i].WARESID !== "") {
                        dlg.append(queueHtml + docHtml + waresHtml);
                    }
                    else if (json.data[i].OBJID !== "" && json.data[i].WARESID !== "") {
                        dlg.append(queueHtml + objHtml + waresHtml);
                    }
                    else if (json.data[i].DOCID !== "" ) {
                        dlg.append(queueHtml + docHtml);
                    }
                    else if (json.data[i].OBJID !== "") {
                        dlg.append(queueHtml + objHtml);
                    }
                    else if (json.data[i].WARESID !== "") {
                        dlg.append(queueHtml + waresHtml);
                    }
                    else { dlg.append(queueHtml); }
                }
            } else {
                dlg.html("");
                dlg.html("<p id='task_text'>Нет связей</p>");
            }
                dlg.find('div.QB_Block').css({'border-bottom':'2px solid #000',
                                              'margin':'3px',
                                              'padding':'10px 0'});
                dlg.find('div.QB_Elem').css({'display':'inline-block',
                                              'vertical-align': 'top',
                                              'border':'1px solid #000',
                                              'width':'150px',
                                              'margin':'3px'});
                dlg.find('div.QB_Block p.QB_Title').css({'font-weight':'bold',
                                                         'color':'#fff',
                                                         'padding':'3px',
                                                         'background-color':'#000'});
                dlg.find('div.QB_Block p.QB_Text').css({'word-wrap':'wrap',
                                                        'padding':'3px',
                                                        'color':'#000'});
        }
    });
    dlg.find("div.buttons button.btnclose").unbind("click").bind("click", function() {
       dlg.dialog("close");
    });
    dlg.dialog("open");
};

function taskParams() {
   var taskid = $(this).parent().attr('id');
   var dlg = $("div#dvDialogTask");
   var queueId = tblTaskServer.trKeyId(taskid);
   var titleDialog = "Задание №" + queueId + ": Параметры";
   dlg.css("display", "block");
   dlg.dialog({
       resizable: true,
       height: 100,
       width: 600,
   });
   dlg.dialog('option', 'title' ,titleDialog);
   var params = tblTaskServer.trDataById(taskid).PARAMS;
   if(params !== "") {
       dlg.html("");
       dlg.html("<p id='task_text'></p>");
       dlg.find("p#task_text").text(params);
   } else {
       dlg.html("");
       dlg.html("<p id='task_text'>Нет параметров</p>");
   }
   dlg.find("div.buttons button.btnclose").unbind("click").bind("click", function() {
       dlg.dialog("close");
   });
   dlg.dialog("open");
}

function taskFilename() {
   var taskid = $(this).parent().attr('id');
   var dlg = $("div#dvDialogTask");
   var queueId = tblTaskServer.trKeyId(taskid);
   var titleDialog = "Задание №" + queueId + ": Название файла";
   dlg.css("display", "block");
   dlg.dialog({
       resizable: true,
       height: 110,
       width: 600,
   });
   dlg.dialog('option', 'title' ,titleDialog);
   var filename = tblTaskServer.trDataById(taskid).FILENAME;
   if(filename !== "") {
       dlg.html("");
       dlg.html("<p id='task_text'>" + filename + "</p>" +
                         "<button id='openFile' style='margin: 5px;'>Открыть файл</button>");
       var path = $("p#task_text").html();
       $('button#openFile').unbind('click').click( function () {
           $.ajax({
            url: 'taskserver_getFile',
            dataType: 'json',
            data: {'path': path},
            success: function (json) {
                if (json.data.MES) {
                    alert(json.data.MES);
                } else { window.open(path); }
            }
            });
       });
   } else {
       dlg.html("");
       dlg.html("<p id='task_text'>Нет файла</p>");
   }
   dlg.find("div.buttons button.btnclose").unbind("click").bind("click", function() {
       dlg.dialog("close");
   });
   dlg.dialog("open");
}

function getResult() {
    var taskid = $(this).parent().attr('id');
    var dlg = $("div#dvDialogTask");
    var queueId = tblTaskServer.trKeyId(taskid);
    var titleDialog = "Задание №" + queueId + ": Дополнительная информация";
    dlg.css("display", "block");
    dlg.dialog({
        resizable: true,
        height: 110,
        width: 600,
    });
    dlg.dialog('option', 'title' ,titleDialog);
    $.ajax({
        url: 'taskserver_getResult',
        dataType: 'json',
        data: {'taskid': queueId},
        success: function (json) {
            if (json.data.RESULT !== "") {
                dlg.html("");
                dlg.html("<p id='task_text'>" + json.data.RESULT + "</p>");
                var findText = json.data.RESULT.match(/[А-я\s]+[А-я]+/ig);
                for (var i=0; i<findText.length; i++) {
                    var boldText = dlg.find('p#task_text').html().replace(findText[i], "<b style='color:#000000'> " + findText[i] +" </b>");
                    dlg.html("<p id='task_text'>" + boldText + "</p>");
                }
            } else {
                dlg.html("");
                dlg.html("<p id='task_text'>Нет дополнительной информации</p>");
            }
        }
    });
    dlg.find("div.buttons button.btnclose").unbind("click").bind("click", function() {
        dlg.dialog("close");
    });
    dlg.dialog("open");
}

function selectTypetask () {
    var typeQueue = $('div#sysmenu form.buttons select#in_typequeueid');
    $.ajax({
        url: 'taskserver_tasktypeList',
        dataType: 'json',
        success: function (json) {
            for (var i=0; i<json.data.length;i++) {
                $(typeQueue).append("<option value=" + json.data[i].TASKID + ">" + json.data[i].TASKNAME + "</option>");
            }
        }
    });
}

function selectStatustask () {
    var statusQueue = $('div#sysmenu form.buttons select#in_statuscode');
    $.ajax({
        url: 'taskserver_statusList',
        dataType: 'json',
        success: function (json) {
            for (var i=0; i<json.data.length;i++) {
                $(statusQueue).append("<option value=" + json.data[i].CODE + ">" + json.data[i].NAME + "</option>");
            }
        }
    });
}

$.printReport =  function (json) {
    var jsonFull = {data: [], ext_data: [json.ext_data]};
    if(json.data.length<3000) {
        $.progressDo({
            arr: json.data,
            extParams: {taskid: json.ext_data.taskid},
            arrNullAlert: 'Задания не найдены',
            url: 'taskserver_item',
            funcParams: function (item) {
                return {taskid: item.QUEUEID};
            },
            funcIter: function (json) {
                jsonFull.data.push(json.data);
            },
            funcEnd: function () {
                if (jsonFull.data.length > 0) {
                    tblTaskServer.data(jsonFull);
                } else
                    alert('Нет заданий');
            }
        });
    } else { alert("Слишком много заданий, уменьшите период поиска!");}
};

$(document).ready(function () {
    selectTypetask();
    selectStatustask();
    document.getElementById('in_date').valueAsDate = new Date();
    var inputLabel = $('div#sysmenu form input[type="text"]');
    $(inputLabel).mouseup(function (event) {
       if ( event.which === 1) {
	        $(this).select();
	    }
    })

    $('#container-head').css({'background': '#2b2b2b'});
    $('#dvWH').css({'height': kScreenH(), 'width': '100%'});
    $('#dvData').css({'height': kScreenH(), 'width': '100%'});
    tblTaskServer = $('#dvData')
            .Tbl({
                code: 'TASKSERVERMNGR',
                rowFocus: {rfSetDefFocus: false},
                events: function () {
                    $(this).find('tbody>tr>' + getStr('PARAMS')).unbind('dblclick').dblclick(taskParams);
                    $(this).find('tbody>tr>' + getStr('FILENAME')).unbind('dblclick').dblclick(taskFilename);
                    $(this).find('tbody>tr>' + getStr('STATUS')).unbind('dblclick').dblclick(getResult);
                },
                contextMenu: {
                    optSortKey: ['Overfulfill', 'Updatetask', 'Deletetask', 'Queuebond'],
                    funcOverfulfill: $.Overfulfill, classOverfulfill: 'Overfulfill', nameOverfulfill: 'Перевыполнить задание',
                    funcUpdatetask: $.Updatetask, classUpdatetask: 'Updatetask', nameUpdatetask: 'Обновить задание',
                    funcDeletetask: $.Deletetask, classDeletetask: 'Deletetask', nameDeletetask: 'Удалить задание',
                    funcQueuebond: $.Queuebond, classQueuebond: 'Queuebond', nameQueuebond: 'Связи'
                }
            });
    $("form#searchList").unbind('submit').submit(function () {
        var P = $(this).kFormSubmitParam();
        if (P.in_date === "") {
            document.getElementById('in_date').valueAsDate = new Date();
            P.in_date = $('div#sysmenu form input#in_date').val();
        }
        tblTaskServer.empty();
        $.getJSON('taskserver_list', P, $.printReport);
        return false;
    });

    $("form#searchTask").unbind('submit').submit(function () {
        var P = $(this).kFormSubmitParam();
        tblTaskServer.empty();
        $.getJSON('taskserver_getTask', P, function (json) {
            if (json.data.length === 0) {
                alert('Задание не найдено');
            } else { tblTaskServer.data(json); }
        });
        return false;
    });
});


