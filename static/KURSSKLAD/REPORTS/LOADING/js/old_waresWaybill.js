let DOCSUM = 0
let DOCS = []
let OBJADDRESS = null
const CUR_YEAR = new Date().getFullYear()

$(document).ready(()=>{
    const dvData = $('#dvData')

    // - Отрисовка первого листа
    dvData.append('<page size="A4" id="firstPage"></page>')
    const firstPage = $('#firstPage')

    firstPage.append('<div class="header">' +
            '<h1 class="header__title">Товарно-транспортная накладная</h1>' +
            '<span for="wb_number" class="header__number">№</span>' +
            '<span for="wb_date" class="header__date">__.__.____</span>' +
        '</div>' +
        '<div class="main">' +
            '<div class="main__container">' +
                '<div class="main__container__field">' +
                    '<span>Автомобиль:</span>' +
                    '<div>' +
                        '<input type="text" name="car" list="carList" readonly><br>' +
                        //'<datalist id="carList"></datalist>' +
                        //'<div id="carList" class="datalist"></div>' +
                        '<label for="car">(Марка, модель, тип, регистрационный номер)</label>' +
                    '</div>' +
                '</div>' +
                '<div class="main__container__field trailer">' +
                    '<span>Прицеп/полуприцеп:</span>' +
                    '<div>' +
                        '<input type="text" name="trailer" readonly><br>' +
                        '<label for="trailer">(Марка, модель, тип, регистрационный номер)</label>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field">' +
                    '<span>Вид перевозок:</span>' +
                    '<div>' +
                        '<input type="text" name="drivetype" value="автомобильные перевозки" readonly>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field">' +
                    '<span>Автомобильный перевозчик:</span>' +
                    '<div>' +
                        '<input type="text" name="truck" readonly><br>' +
                        '<label for="driver">(ФИО, номер удостоверения водителя)</label>' +
                    '</div>' +
                '</div>' +
                '<div class="main__container__field driver">' +
                    '<span>Водитель:</span>' +
                    '<div>' +
                        '<input type="text" name="driver" readonly><br>' +
                        '<label for="driver">(ФИО)</label>' +
                    '</div>' +
                    '</div>' +
                '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field">' +
                    '<span>Заказчик:</span>' +
                    '<div>' +
                        '<input type="text" name="toobj"><br>' +
                        '<label for="toobj">(Наименование, ФИО)</label>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field">' +
                    '<span>Грузоотправитель:</span>' +
                    '<div>' +
                        '<input type="text" name="shipper" readonly><br>' +
                        '<label for="shipper">(Полное наименование, местонахождение / ФИО, место проживания)</label>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field">' +
                    '<span>Грузополучатель:</span>' +
                    '<div>' +
                        '<input type="text" name="consignee"><br>' +
                        '<label for="consignee">(Полное наименование, местонахождение / ФИО, место проживания)</label>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field">' +
                    '<span>Пункт погрузки:</span>' +
                    '<div>' +
                        `<input type="text" name="loading_point" readonly><br>` +
                        '<label for="loading_point">(Местонахождение)</label>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field">' +
                    '<span>Пункт разгрузки:</span>' +
                    '<div>' +
                        '<input type="text" name="unloading_point"><br>' +
                        '<label for="unloading_point">(Местонахождение)</label>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="main__container column">' +
                '<div class="main__container__field">' +
                    '<span>Переадресация груза:</span>' +
                    '<div>' +
                        '<input type="text" name="redirection"> ,<br>' +
                        '<label for="redirection">(Наименование, местонахождение / ФИО, место проживания нового грузополучателя; ФИО, должность и подпись ответственного лица)</label>' +
                    '</div>' +
                '</div>' +
                '<div class="main__container__field text">' +
                    '<span>отпуск по доверенности грузополучателя: ' +
                    'серия <input type="text" name="series">' +
                    '№ <input type="text" name="number">' +
                    'от "<input type="text" name="date_day">" ' +
                    `<input type="text" name="date_month"> ${CUR_YEAR}г., ` +
                    'выданною <input type="text" name="gave_out">' +
                    '</span>' +
                '</div>' +
            '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field text">' +
                    '<span>Груз  выдан для перевозок в состоянии, которое соответствует правилам перевозок соответственных грузов,<br>' +
                    'номер пломбы (при наличии) ' +
                    '<input type="text" name="numstump"><br>' +
                    'кол-во мест <input type="text" name="count_place">' +
                    'масса бруто, т/кг <input type="text" name="weight">' +
                    'получил водитель/экспедитор <input type="text" name="driver" readonly>' +
                    '</span>' +
                    '<label for="count_place">(Словами)</label>' +
                    '<label for="weight">(Словами)</label>' +
                    '<label for="forwarder">(Словами)</label>' +
                '</div>' +
            '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field text">' +
                    '<span>Бухгалтер (отправителя) <input type="text" name="booker"> ' +
                    'отгруз разрешил  <input type="text" name="man" readonly>' +
                    '</span>' +
                    '<label for="booker">(ФИО, должность, подпись)</label>' +
                    '<label for="man">(ФИО, должность, подпись)</label>' +
                '</div>' +
            '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field">' +
                    '<span>Всего отпущено на общую  сумму&nbsp;</span>' +
                    '<span><b name="docsum"></b></span>' +
                '</div>' +
            '</div>' +
            '<div class="main__container">' +
                '<div class="main__container__field">' +
                    '<span class="docsTitle">Сопр-ные док-ы на груз</span>' +
                    '<div>' +
                        '<span for="docs"></span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="main__container column">' +
                '<span>Транспорные услуги, которые предоставляются автомобильным перевозчиком:</span>' +
                '<div>' +
                    '<input type="text" name="text_field1" readonly><br>' +
                    '<input type="text" name="text_field2" readonly>' +
                '</div>' +
            '</div>' +
        '</div>'
    )

    // - Отрисовка второго листа
    dvData.append('<page size="A4" id="secondPage"></page>')
    const secondPage = $('#secondPage')

    secondPage.append(`<div>` +
            `<p class="title">Сведения о грузе</p>` +
            `<table border="1" id="tblWares">` +
                `<thead>` +
                    `<tr>` +
                        `<th>N п/п</th>` +
                        `<th>Наименование груза (номер контейнера), в случае перевозки небезопасных грузов: класс опасных веществ, к которому отнесен груз</th>` +
                        `<th>Единица измерения</th>` +
                        `<th>Кол-во мест</th>` +
                        `<th>Цена без за единицу, руб/грн.</th>` +
                        `<th>Общая сумма, руб.</th>` +
                        `<th>Вид упаковки</th>` +
                        `<th>Документи с грузом</th>` +
                        `<th>Масса брутто, т</th>` +
                    `</tr>` +
                    `<tr>` +
                        `<td>1</td>` +
                        `<td>2</td>` +
                        `<td>3</td>` +
                        `<td>4</td>` +
                        `<td>5</td>` +
                        `<td>6</td>` +
                        `<td>7</td>` +
                        `<td>8</td>` +
                        `<td>9</td>` +
                    `</tr>` +
                `</thead>` +
                `<tbody><tr>` +
                    `<td>1</td>` +
                    `<td>Товар согласно сопроводительных документов</td>` +
                    `<td>пал</td>` +
                    `<td name="palcount"></td>` +
                    `<td></td>` +
                    `<td name="docsum"></td>` +
                    `<td>Пал</td>` +
                    `<td name="docs"></td>` +
                    `<td></td>` +
                `</tr></tbody>` +
                `<tfoot>` +
                    `<tr>` +
                        `<td colspan="2">Всего:</td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td name="docsum"></td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td name="docweight"><input type="text" name="docweight"></td>` +
                    `</tr>` +
                `</tfoot>` +
            `</table>` +
        `</div>` +
        `<div class="persons">` +
            `<span name="shipper">Сдал (ответственный представитель грузоотправителя)</span>` +
            `<span name="driver">Принял водитель/експедитор</span>` +
            `<span name="driver">Сдал водитель/експедитор</span>` +
            `<span>Принял (ответственный представитель грузополучателя)</span>` +
            `<span for="shipper">_____________</span>` +
            `<span for="driver">_____________</span>` +
            `<span for="driver">_____________</span>` +
            `<span>_____________</span>` +
        `</div>` +
        `<p class="title">Погрузочно-разгрузочные операции</p>` +
        `<div>` +
            `<table border="1" style="width: 100%">` +
                `<thead>` +
                    `<tr>` +
                        `<th rowspan="2">Операция</th>` +
                        `<th rowspan="2">Масса брутто, т</th>` +
                        `<th colspan="3">Время (час, мин.)</th>` +
                        `<th rowspan="2">Подпись ответственного представителя</th>` +
                    `</tr>` +
                    `<tr>` +
                        `<th>Прибытие</th>` +
                        `<th>Убытие</th>` +
                        `<th>Простой</th>` +
                    `</tr>` +
                    `<tr>` +
                        `<td>10</td>` +
                        `<td>11</td>` +
                        `<td>12</td>` +
                        `<td>13</td>` +
                        `<td>14</td>` +
                        `<td>15</td>` +
                    `</tr>` +
                `</thead>` +
                `<tbody>` +
                    `<tr>` +
                        `<td>Погруз</td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td></td>` +
                    `</tr>` +
                    `<tr>` +
                        `<td>Разгруз</td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td></td>` +
                    `</tr>` +
                `</tbody>` +
            `</table>` +
        `</div>`
    )

    const url = document.URL
    const ext_data = url.split('waresWaybill?taskid=')[1]
    const taskid = ext_data.split('&')[0]
    const cid = ext_data.split('&cid=')[1]

    $.getJSON('whRouteInfo', {'taskid': taskid}, json => {
        $('input[name="car"]').val(`${json.data.CARKIND}, ${json.data.CARLICENSE}, ${json.data.CARNAME}`)
        $('input[name="trailer"]').val(json.data.TRAILERTYPE ? `${json.data.TRAILERTYPE}, ${json.data.TRAILERLICENSE}` : '')
        $('input[name="truck"]').val(`${json.data.COMPANY}`)
        $('input[name="count_place"]').val(`${json.data.PALCOUNT}`)
        $('input[name="weight"]').val(/*`${json.data.PALCOUNT}`*/1)
        $('input[name="man"]').val(`${json.data.SHIPPER}`)
        $('input[name="driver"]').val(`${json.data.DRIVER}`)
        $('span[for="driver"]').text(json.data.DRIVER)
        $('span[for="shipper"]').text(json.data.OBJNAME)
        $('input[name="shipper"]').val(`${json.data.ADDRESS}`)
        $('input[name="loading_point"]').val(`${json.data.ADDRESS}`)
        $('input[name="numstump"]').val(`${json.data.NUMSTUMP}`)
        $('span[for="wb_date"]').text(json.data.ENDTIME.split(' ')[0])
        $('span[for="wb_number"]').text(`№ ${json.data.ROID}${cid}`)
        $('td[name="palcount"]').text(`${json.data.PALCOUNT}`)
    })

    $.getJSON('pWaresInfo', {'tid': taskid, 'cid': cid}, json => {
        json.data.map((w,i) =>{
            DOCSUM += Number(w.DAMOUNT)
            DOCS.push(w.DNUMBER)
            if (i === 0) {
                OBJADDRESS = w.OBJADRESS
            }
        })
        $('#tblWares tfoot').find('td[name="docsum"]').html(`<b>${DOCSUM}</b>`)
        $('b[name="docsum"]').text(DOCSUM.toFixed(2))
        $('input[name="consignee"]').val(OBJADDRESS)
        $('input[name="unloading_point"]').val(OBJADDRESS)
        $('span[for="docs"]').text(DOCS.join(', '))
        DOCS.forEach((d, i)=>{
            if(i === DOCS.length -1) {
                $('td[name="docs"]').append(`${d}`)
            } else {
                $('td[name="docs"]').append(`${d},<br>`)
            }
        })
        $('td[name="docsum"]').text(`${DOCSUM.toFixed(2)}`)
        $('tfoot td[name="docsum"]').text(`${DOCSUM.toFixed(2)}`)
    })

})