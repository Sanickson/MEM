let tbl

$(document).ready(function () {
    let zoneArr = []
    let zone = null
    let priorityCode = [0,1,2,-1]
    let priority = ['Обычный','Высокий','Срочный','Запрет']
    let priorityArr = [1,2,-1]

    $('#btnSalePriority').attr('data-priority', priorityArr.join(','))
    $.getJSON('getZone', null, (JSON) => {
        zone = JSON.data
        zone.forEach(zone=>{
            zoneArr.push(Number(zone.ID))
    })
        $('#btnWaresGroup').attr('data-zone', zoneArr.join(','))
    })

    $('#btnWaresGroup').click(() => {
        $('#dvZone').dialog({
          closeOnEscape: true,
          title: 'Группы отборки',
          autoOpen: false,
          resizable: false,
          draggable: false,
          modal: true,
          overlay: {
            opacity: 0.5,
            background: "black"
          },
          height: 300,
          width: 300
        }).dialog("open")
            .html('<table id="tblZone"><thead><tr><th class="chk"><input id="checkZone" type="checkbox" /></th><th>Код</th><th>Наименование</th></tr></thead><tbody>')
            .find('table')
            .kTblScroll()

        if (zoneArr.length === zone.length) {
          $('#checkZone').attr('checked', true)
        }

        $('#checkZone').click(()=>{
          if($('#checkZone').attr('checked')) {
            $('#tblZone tbody tr td').find('input[type="checkbox"]').attr('checked', true)
          } else {
            $('#tblZone tbody tr td').find('input[type="checkbox"]').removeAttr('checked')
          }
        })

        zone.forEach(z=>{
          $('#tblZone tbody').append(`<tr><td><input type="checkbox" id="${z.ID}" ${zoneArr.includes(Number(z.ID)) ? "checked='true'" : null}"></td><td>${z.CODE}</td><td style="text-align: left">${z.NAME}</td></tr>`)
        })

        $('a.ui-dialog-titlebar-close').click(() =>{
          zoneArr = []
          $('#tblZone tbody tr td').find('input:checked').each((i,e)=>{
            zoneArr.push(Number($(e).attr('id')))
          })
          $('#btnWaresGroup').attr('data-zone', zoneArr.join(',') + ',')
        })
  })

    $('#btnSalePriority').click(() => {
        $('#dvPriority').dialog({
          closeOnEscape: true,
          title: 'Приоритеты продаж',
          autoOpen: false,
          resizable: false,
          draggable: false,
          modal: true,
          overlay: {
            opacity: 0.5,
            background: "black"
          },
          height: 300,
          width: 300
        }).dialog("open")
            .html('<table id="tblPriority"><thead><tr><th class="chk"><input id="checkPriority" type="checkbox" /></th><th>Наименование</th></tr></thead><tbody>')
            .find('table')
            .kTblScroll()

        if (priorityArr.length === priorityCode.length) {
          $('#checkPriority').attr('checked', true)
        }

        $('#checkPriority').click(()=>{
          if($('#checkPriority').attr('checked')) {
            $('#tblPriority tbody tr td').find('input[type="checkbox"]').attr('checked', true)
          } else {
            $('#tblPriority tbody tr td').find('input[type="checkbox"]').removeAttr('checked')
          }
        })

        for (let i=0;i<priority.length;i++) {
          $('#tblPriority tbody').append(`<tr><td><input type="checkbox" id="${priorityCode[i]}" ${priorityArr.includes(Number(priorityCode[i])) ? "checked='true'" : null}"></td><td style="text-align: left">${priority[i]}</td></tr>`)
        }

        $('a.ui-dialog-titlebar-close').click(() =>{
          priorityArr = []
          $('#tblPriority tbody tr td').find('input:checked').each((i,e)=>{
            priorityArr.push(Number($(e).attr('id')))
          })
          $('#btnSalePriority').attr('data-priority', priorityArr.join(',') + ',')
        })
    })

    $('#dvMain').css({'height': kScreenH(), 'width': '100%'});

    tbl = $('#dvMain').Tbl({
            code: 'SALEPRIORITY',
            rowFocus: {rfSetDefFocus: false},
            contextMenu: {}
        })

    $('form').submit(e=>{
        e.preventDefault()
        tbl.empty()
        const param = {
            pr: $('#btnSalePriority').attr('data-priority'),
            zone: $('#btnWaresGroup').attr('data-zone')
        }
        $.getJSON('getSalepriorityList', param
        , json => {
                if (json.data.length === 0) {
                    alert('Задание не найдено');
                } else { tbl.data(json); }
            })
    })
})

