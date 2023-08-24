var tbl;

$.Deletetask = function () {
   var taskid = $(this).attr("id");
   var queueId = tbl.trKeyId(taskid);
   if (confirm('Вы действительно хотите удалить задание?')) {
       $.ajax({
           url: 'taskserver_deleteTask',
           dataType: 'json',
           data: {'taskid': queueId},
           success: function (json) {
               tbl.trDel(taskid);
           }
       });
   }
};

$.Updatetask = function () {
    var taskid = $(this).attr("id");
    var queueId = tbl.trKeyId(taskid);
    var jsonFull = {data: [], ext_data: queueId};
    $.ajax({
        url: 'taskserver_item',
        dataType: 'json',
        data: {'taskid': queueId},
        success: function (json) {
            jsonFull.data.push(json.data);
            tbl.data(jsonFull);
        }
    });
};

function getStr(td) {
    var numItem = tbl._cfg.clmSortKey.indexOf(td) + 1;
    return 'td:nth-child(' + numItem +')';
}

function taskParams() {
   var taskid = $(this).parent().attr('id');
   var dlg = $("div#dvDialogTask");
   var queueId = tbl.trKeyId(taskid);
   var titleDialog = "Задание №" + queueId + ": Параметры";
   dlg.css("display", "block");
   dlg.dialog({
       resizable: true,
       height: 100,
       width: 600,
   });
   dlg.dialog('option', 'title' ,titleDialog);
   var params = tbl.trDataById(taskid).PARAMS;
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
   var queueId = tbl.trKeyId(taskid);
   var titleDialog = "Задание №" + queueId + ": Название файла";
   dlg.css("display", "block");
   dlg.dialog({
       resizable: true,
       height: 110,
       width: 600,
   });
   dlg.dialog('option', 'title' ,titleDialog);
   var filename = tbl.trDataById(taskid).FILENAME;
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
    var queueId = tbl.trKeyId(taskid);
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

var buttonStWork = "<button id='work'>Запущен<img src='/KURSSKLAD/images/work.png' style='vertical-align: bottom; margin-left: 1px;' title='Работает' ></button>";
var buttonStDont_work = "<button id='dont_work'>Отключен<img src='/KURSSKLAD/images/dont_work.png' style='vertical-align: bottom; margin-left: 1px;' title='Не работает' ></button>";

function statusTaskserver() {
    $.ajax({
        url: 'get_statusTaskserver',
        dataType: 'json',
        success: function (json) {
            if (json.ext_data.res == 'Active') {
                startTaskserver();
            }
            if (json.ext_data.res == 'Inactive'){
                stopTaskserver();
            }
        }
    });
}

function startTaskserver(){
    var divStatus = $('div#dvStatusTaskserver div#imgStatus');
    $(divStatus).empty();
    $(divStatus).append(buttonStWork);
    $(divStatus).find('button#work').click(function () {
        if (confirm('Остановить выполнение?')) {
            $.ajax({
                url: 'stop_Taskserver',
                dataType: 'json',
                success: function (json) {
                    statusTaskserver();
                }
            })
        }
    });
}

function stopTaskserver(){
    var divStatus = $('div#dvStatusTaskserver div#imgStatus');
    $(divStatus).empty();
    $(divStatus).append(buttonStDont_work);
    $(divStatus).find('button#dont_work').click(function () {
        if (confirm('Запустить выполнение?')) {
            $.ajax({
                url: 'start_Taskserver',
                dataType: 'json',
                success: function (json) {
                    statusTaskserver();
                }
            })
        }
    });
}

$(document).ready(function () {
    statusTaskserver();
    $('#sysmenu').css({'background': '#2b2b2b'});
    var timer;
    $('div#dvSelLoad').change(function () {
        var ms = $('div#dvSelLoad select').val();

        clearInterval(timer);
        if (ms !== 'none'){
        timer = setInterval(()=>{
            $.getJSON('taskserverPerf_list', function (json) {
                tbl.data(json);
            });
            },
            ms);
        }
    });


    $('#dvData').css({'height': kScreenH(), 'width': '100%'});
        tbl = $('#dvData').Tbl({
            code: 'TASKSERVERMNGR',
            rowFocus: {rfSetDefFocus: false},
            events: function(){
                $(this).find('tbody>tr>' + getStr('PARAMS')).unbind('dblclick').dblclick(taskParams);
                $(this).find('tbody>tr>' + getStr('FILENAME')).unbind('dblclick').dblclick(taskFilename);
                $(this).find('tbody>tr>' + getStr('STATUS')).unbind('dblclick').dblclick(getResult);
            },
            contextMenu: {
                    optSortKey: ['Updatetask', 'Deletetask'],
                    funcUpdatetask: $.Updatetask, classUpdatetask: 'Updatetask', nameUpdatetask: 'Обновить задание',
                    funcDeletetask: $.Deletetask, classDeletetask: 'Deletetask', nameDeletetask: 'Удалить задание',
            }
        });

       $.getJSON('taskserverPerf_list', function (json) {
            tbl.data(json);
    });
       return false;
});
