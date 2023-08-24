let tblTask
let tblPallet
let clients = new Set()

$(document).ready(function () {
    $.datepicker.setDefaults($.extend($.datepicker.regional['ru']));
    $('#dbeg,#dend').datepicker().mask('99.99.9999').val(kToday(-1));

    function palletList() {
        clients = new Set()
        tblPallet.empty()
        const param = {
            tid: tblTask.trKeyId($(this).attr('id'))
        }
        $.getJSON('getLoadingPalletList', param, json => {
            tblPallet.data(json)
            json.data.forEach(p => clients.add(p.TOOBJID))
        })
    }

    $('#dvTask').css({'height': kScreenH(), 'width': '60%'});
    $('#dvPallet').css({'height': kScreenH(), 'width': '40%'});

    function getStr(td) {
        const numItem = tblTask._cfg.clmSortKey.indexOf(td) + 1;
        return 'td:nth-child(' + numItem +')';
    }

    $.WaresWaybill = function() {
        const AUTO = $(this).find(`${getStr('CARLICENSE')}`).text()
        const DRIVER = $(this).find(`${getStr('DRIVER')}`).text()
        if (AUTO === '' || DRIVER === '') {
            alert('Укажите автомобиль, водителя!')
        } else {
            for(let c of clients) {
                window.open(`waresWaybill?taskid=${tblTask.trKeyId($(this).attr('id'))}&cid=${c}`);
            }
        }
    }

    $.SetInfo = function() {
        const id = tblTask.trKeyId($(this).attr('id'))
        $.searchLic(id)
    }

    $.reloadTaskInfo = function(json) {
        const jsonFull = {data: [], ext_data: json.tid}
        jsonFull.data.push(json)
        tblTask.data(jsonFull);
    }

    tblTask = $('#dvTask').Tbl({
        code: 'LOADING_TASK',
        rowFocus: {
            rfSetDefFocus: false,
            rfFocusCallBack: palletList
        },
        contextMenu: {
            optSortKey: ['WaresWaybill', 'SetInfo'],
            funcWaresWaybill: $.WaresWaybill,
            classWaresWaybill: 'WaresWaybill',
            nameWaresWaybill: 'Ттн',
            funcSetInfo: $.SetInfo,
            classSetInfo: 'SetInfo',
            nameSetInfo: 'Заполнить инфо',
        }
    })

    tblPallet = $('#dvPallet').Tbl({
        code: 'LOADING_PALLET',
        rowFocus: {
            rfSetDefFocus: false
        },
        contextMenu: {}
    })

    $('form').submit(e=>{
        e.preventDefault()
        tblTask.empty()
        tblPallet.empty()
        const param = {
            dbeg: $('#dbeg').val() + ' 00:00:00',
            dend: $('#dend').val() + ' 23:59:59'
        }
        $.getJSON('getLoadingTaskList', param
        , json => {
            if (json.data.length === 0) {
                alert('Задания на погрузку не найдено')
            } else {
                tblTask.data(json)
            }
        })
    })
})

