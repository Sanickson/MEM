let tbl;

function tdMinToHour(tr, fld) {
    const field = tr[fld];
    if (field > 0 && field <= 60) {
        return `<td>${field} мин</td>`;
    } else if (field > 60) {
        return `<td>${Math.floor(field / 60)} ч ${(field % 60)} мин</td>`;
    } else {
        return `<td>-</td>`;
    }
}

const dlgCss = {
    "display": "block"
}

const dlgParams = {
    height: 500,
    width: 1000,
    resizable: false,
    draggable: false,
    modal: true,
    position: "center",
    overlay: {opacity: 0.5, background: "black"}
}

function getTasks() {
    const docid = $(this).attr('data-id');
    const dlg = $("div#dvDialogTasks");
    dlg.empty();
    dlg.css(dlgCss);
    dlg.dialog(dlgParams);
    dlg.dialog('option', 'title', 'Задания');
    $.getJSON('timeloadingautoTasks', {docid}, json => {
        if (json.data.length > 0) {
            dlg.append('<table id="tasks" style="width: 100%;"><thead><tr>' +
                '<th ksort="digit">Номер</th>' +
                '<th ksort="text">Метод</th>' +
                '<th ksort="text">Сотрудник</th>' +
                '<th ksort="text">Создано</th>' +
                '<th ksort="text">Начало</th>' +
                '<th ksort="text">Завершение</th>' +
                '</tr></thead><tbody></tbody></table>');
            json.data.forEach(d => {
                $('#tasks tbody').append(`<tr data-id="${d.TID}">
                    <td class="number">${d.TID}</td>
                    <td class="text">${d.OBJNAME}</td>
                    <td class="text">${d.METHOD}</td>
                    <td class="text">${d.CREATETIME}</td>
                    <td class="text">${d.BEGINTIME}</td>
                    <td class="text">${d.ENDTIME}</td>
                </tr>`);
            });
            $('#tasks').kTblScroll().kTblSorter().kTdChk().rowFocus();
        } else {
            alert('Задания не найдены!');
            dlg.close();
        }
    });
    dlg.dialog("open");
}

function getDocs() {
    const trId = $(this).attr('id');
    const dlg = $("div#dvDialogDocs");
    dlg.empty();
    const aid = tbl.trKeyId(trId);
    dlg.css(dlgCss);
    dlg.dialog(dlgParams);
    dlg.dialog('option', 'title', 'Документы');
    const P = {
        aid,
        dbeg: $("#dbeg").val() + ' 00:00',
        dend: $("#dbeg").val() + ' 23:59:'
    }
    $.getJSON('timeloadingautoDocs', P, json => {
        if (json.data.length > 0) {
            dlg.append('<table id="docs" style="width: 100%;"><thead><tr>' +
                '<th ksort="text">Номер</th>' +
                '<th ksort="text">Статус</th>' +
                '<th ksort="text">Дата</th>' +
                '<th ksort="text">Кому</th>' +
                '<th ksort="digit">Сумма</th>' +
                '<th ksort="datetime" title="Дата завершения последнего задания">Завершено</th>' +
                '</tr></thead><tbody></tbody></table>');
            json.data.forEach(d => {
                $('#docs tbody').append(`<tr data-id="${d.DOCID}">
                    <td class="text">${d.DOCNUMBER}</td>
                    ${$.tdDocStatus(d.DOCSTATUS)/*d.DOCSTATUS*/}
                    <td class="text">${d.DOCDATE}</td>
                    <td class="text">${d.TOOBJ}</td>
                    <td class="number">${d.AMOUNT}</td>
                    <td class="datetime">${d.TSENDTIME}</td>
                </tr>`);
            });
            $('#docs').kTblScroll().kTblSorter().kTdChk().rowFocus();
            $('#docs tbody tr').click(getTasks);
        } else {
            alert('Документы не найдены!');
            dlg.close();
        }
    });
    dlg.dialog("open");
}

$(document).ready(function () {
    $.datepicker.setDefaults($.extend($.datepicker.regional['ru']));
    $('#dbeg,#dend').datepicker().mask("99.99.9999").val(kToday(-1)).end()
    $('#dvMain').css({'height': kScreenH(), 'width': '100%'});
    tbl = $('#dvMain')
        .Tbl({
            code: 'TIMELOADINGAUTO',
            rowFocus: {rfSetDefFocus: false},
            userFunc: {tdMinToHour: tdMinToHour},
            events: function () {
                $(this).find('tbody>tr').click(getDocs);
            }
        });
    $("form").unbind('submit').submit(function () {
        let P = {
            dbeg: $("#dbeg").val() + ' 00:00',
            dend: $("#dbeg").val() + ' 23:59:'
        }
        tbl.empty();
        $.blockUI({message: '<h2>...загрузка...</h2>'});
        $.getJSON('timeloadingautolist', P, json => {
            if (json.data.length > 0) {
                tbl.data(json);
            } else {
                alert('Нет авто');
            }
            $.unblockUI();
        });
        return false;
    });

    $('#btnExcel').click(function () {
        const table = $('table[id*="TIMELOADINGAUTO"]');
        if (table.get(0)) {
            export_table_to_excel_name(table.get(0), $('#sys-name').text() + ' ' + kNow() + '.xlsx')
        } else {
            alert('Заполните таблицу!')
        }
    });
})