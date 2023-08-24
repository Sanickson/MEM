
$(document).ready(function () {
    function createNode(elem) {
        var name = /*this.WGCNT ? this.WGNAME + ' = ' + this.WGCNT :*/ elem.WGNAME;
        var parent = elem.WGHIGHER ? $('#' + $.kID("liWG", elem.WGHIGHER) + '>ul') : $('#dvWaresBySelgroupUlTree');
        var current = $("<li/>").attr("id", $.kID("liWG", elem.WGID))
            .html("<a href='#'>" + name + "</a>").appendTo(parent);

        current.find("a").bind("click", clickWG);
        if (elem.WGCHILD && elem.WGCHILD == '1') {
            $("<ul/>").appendTo(current);
            current.addClass("hasChildren");
        }
    }

    function clickWG() {
        $('#dvWaresBySelgroupDvWares').empty();
        var param = {
            wgid: $(this).parents('li:first').kID(),
            whid: $('#wh').val()
        };
        $.getJSON('waresNoBarcodeWares', param, json => drawTable(json));
    }

    var dvHeight = kScreenH();
    $('#dvMain').css({'height': dvHeight});

    $('#dvMain').html('<div id="dvWaresBySelgroupDvData">' +
        '<div id="dvWaresBySelgroupDvTree">' +
        '<div id="dvWHList"><select id="wh"></select></div>' +
        '<ul id=dvWaresBySelgroupUlTree class="ulWaresGroup treeview"></ul> ' +
        '</div>' +
        '<div id="dvWaresBySelgroupDvWares"></div>' +
        '</div>' +
        '</div>');

    $('#dvWaresBySelgroupDvTree').css({
        'float': 'left',
        'position': 'relative',
        'height': dvHeight,
        'width': '25%'
    });

    //Пока склады не отображаем
    $('#dvWHList').css({
        'float': 'left',
        'position': 'relative',
        'width': '100%'
    }).hide();

    $('#wh').css('width', '100%');

    $('#dvWaresBySelgroupUlTree').css({
        'float': 'left',
        'position': 'relative',
        'height': dvHeight - $('#dvWHList').height(),
        'width': '100%',
        'overflow': 'auto',
        'text-align': 'left',
        'background-color': 'white'
    });

    $('#dvWaresBySelgroupDvWares').css({
        'float': 'left',
        'position': 'relative',
        'height': dvHeight,
        'width': '75%'
    });

    function drawTable(json) {
        $('#tblData').empty();
        var html = '<table id="tblData"><thead><tr>' +
            '<th ksort="text">Товарная группа</th>' +
            '<th ksort="digit">Код</th>' +
            '<th ksort="text">Наименование</th>' +
            '<th ksort="text">Ед.изм</th>'+
            '</tr></thead><tbody>'
        $.each(json.data, function () {
            html += '<tr data-waresid=' + this.WID + '>' +
                '<td class="text">' + this.WGNAME + '</td>' +
                '<td class="number">' + this.WCODE + '</td>' +
                '<td class="text">' + this.WNAME + '</td>' +
                '<td class="text">' + this.MUCODE + '</td>'+
                '</tr>';
        });
        html += '</tbody><tfoot><tr>' +
            '<th class="trcnt">' + json.data.length + '</th>' +
            '<th class="trcnt" colspan="4"><button id="btnExcel"><img src="' + eng_img + '/apps/excel.png"/></button></th>' +
            '</tr></tfoot></table>';

        $('#dvWaresBySelgroupDvWares').html(html)
            .find('table:first').kTblScroll().kTblSorter().kTdChk().rowFocus();

        $('#btnExcel').click(function () {
            if ($('#tblData').get(0)) {
                export_table_to_excel_name($('table').get(0), $('#sys-name').text() + ' ' + kNow() + '.xlsx')
            } else {
                alert('Заполните таблицу!')
            }
        });

        $.unblockUI();
    }

    $.getJSON('listZoneObjects', function (JSON) {
        if (!showErr(JSON)) {
            var html = '';
            for (var i = 0; i < JSON.data.length; i++)
                html += '<option value=' + JSON.data[i].OBJID + '>' + JSON.data[i].OBJNAME + '</option>';
            $('#wh').html(html);
            if (JSON.ext_data.OBJID) {
                $('#wh').val(JSON.ext_data.OBJID);
            }
            $.getJSON('waresNoBarcodeList',function (json) {
                for (let i = 0; i < json.data.length; i++) {
                    createNode(json.data[i]);
                    if (i + 1 === json.data.length) {
                        $('#dvWaresBySelgroupDvTree').append('<p style="margin-top: 10px"><a href="#" id="allWares">Все товары</a></p>');
                    }
                }
                $('#dvWaresBySelgroupUlTree').treeview({collapsed: true});

                $('#allWares').click(e => {
                    e.preventDefault();
                    $.blockUI({message: '<h2>...загрузка</h2>'});
                    $.getJSON('waresNoBarcodeAllWares',json => drawTable(json));
                })
            });
        }
    });
});
