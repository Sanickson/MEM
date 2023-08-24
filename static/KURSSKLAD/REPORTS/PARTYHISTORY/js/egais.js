var tblReport;

$(document).ready(function () {
  $("#dvInfo, #dvDetails, #dvNull").css({"height": kScreenH()});

  function dataEgais(json) {
    if (tblReport)
      $.TblDel(tblReport);
    tblReport = $('#dvDetails')
        .Tbl({
          code: json.ext_data.ECODE == 'ALCOMARK' ? 'egaisMarkHistory' : 'egaisBoxHistory',
          rowFocus: {rfSetDefFocus: false},
          contextMenu: false
        });

    $("#dvInfo").html('' +
        '<div style="float: left; position: relative; width: 100%;"><b>Общая информация</b></div><br><br>'+
        '<div style="float: left; position: relative; width: 40%; text-align: left"><b>Код товара</b></div>' +
            '<div style="float: left; position: relative; width: 60%; text-align: left">'+json.data[0].WCODE+'</div><br><br>'+
        '<div style="float: left; position: relative; width: 40%; text-align: left"><b>Наименование</b></div>' +
            '<div style="float: left; position: relative; width: 60%; text-align: left">'+json.data[0].WNAME+'</div><br><br>'+
        '<div style="float: left; position: relative; width: 40%; text-align: left"><b>Дата производства</b></div>' +
            '<div style="float: left; position: relative; width: 60%; text-align: left">'+kDate(json.data[0].PRODUCTDATE)+'</div><br><br>'+

        '<div style="float: left; position: relative; width: 40%; text-align: left"><b>Приход</b></div>' +
            '<div style="float: left; position: relative; width: 60%; text-align: left">'+json.ext_data.DOCNUMBER+'</div><br><br>'+
        '<div style="float: left; position: relative; width: 40%; text-align: left"><b>от</b></div>' +
            '<div style="float: left; position: relative; width: 60%; text-align: left">'+json.ext_data.FROMOBJ+'</div><br><br>'+
        '<div style="float: left; position: relative; width: 40%; text-align: left"><b>Дата</b></div>' +
            '<div style="float: left; position: relative; width: 60%; text-align: left">'+kDate(json.ext_data.DOCDATE)+'</div><br><br>'+

        (json.ext_data.ECODE == 'ALCO:BOX' ? '<div style="float: left; position: relative; width: 40%; text-align: left"><b>Кратность короба</b></div>' +
            '<div style="float: left; position: relative; width: 60%; text-align: left">'+(json.ext_data.BOXFACTOR ? json.ext_data.BOXFACTOR : '-')+'</div><br><br>' +
            '<div style="float: left; position: relative; width: 40%; text-align: left"><b>Количество марок</b></div>' +
                '<div style="float: left; position: relative; width: 60%; text-align: left">'+json.ext_data.ITEMCOUNT+'</div><br><br>'
         : '<div style="float: left; position: relative; width: 40%; text-align: left"><b>ШК короба</b></div>' +
                '<div style="float: left; position: relative; width: 60%; text-align: left">'+(json.ext_data.BOXBARCODE ? json.ext_data.BOXBARCODE : '-')+'</div><br><br>') +

        '<div style="float: left; position: relative; width: 40%; text-align: left"><b>Паллет</b></div>' +
        '<div style="float: left; position: relative; width: 60%; text-align: left">'+(json.ext_data.PALNUMBER ? json.ext_data.PALNUMBER : '-')+'</div><br><br>'+
            '<div style="float: left; position: relative; width: 40%; text-align: left"><b>МП паллета</b></div>' +
        '<div style="float: left; position: relative; width: 60%; text-align: left">'+(json.ext_data.PALSITE ? json.ext_data.PALSITE : '-')+'</div><br><br>'

    );
    $.getJSON("egais_ver", {'eid': json.ext_data.EID, 'ecode': json.ext_data.ECODE}, function(json){
        if(!showErr(json)){
            if (json.data.length > 0){
                tblReport.data(json);
            }
            else{
                alert('Информация не найдена');
            }
        }
    });
    return false;
  }

  $("form").unbind('submit').submit(function () {
    var P = $(this).kFormSubmitParam();
    $('#dvInfo, #dvDetails').empty();
    $.getJSON("search_barcode_egais", P, dataEgais);
    return false;
  });
});
