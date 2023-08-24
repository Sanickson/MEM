var tblCode = 'RSTORAGELIFE_RBADWARESLOT';
var tbl;

$(document).ready(function () {
  var height = kScreenH();
  $('#daysbeg').kInputInt({minus: true});
  $('#daysend').kInputInt();
  $("#dvData").css({height: height, width: "100%"});

  tbl = $('#dvData').Tbl({code: tblCode, rowFocus: true}); //определяем таблицу

  function reportCreate(json) {
    var jsonFull = {data: []};
    var dz2;
    var typep = $('#ptype').attr('typep');
    var dz1 = $('#daysbeg').val();
    if ($('#daysend').val()) {
      dz2 = kInt($('#daysend').val());
    }
    else {
      dz2 = 0;
    }
    $.progressDo({
      arr: json.data,
      extParams: {daysbeg: dz1, daysend: dz2, whid: json.ext_data.WHID, typepal: typep },//входящие параметры
      arrNullAlert: 'Товары не найдены',
      url: 'qBadWaresLotData',
      funcParams: function (item) {
        return {wid: item.WID};
      },
      funcIter: function (json) {
        for (var i=0; i<json.data.length; i++){//если fetch="all"
          jsonFull.data.push(json.data[i]);
        }
      },
      funcEnd: function () {
        tbl.data(jsonFull);
      }

    });
  }

  $("#frmFilter").unbind('submit').bind("submit", function () {
    tbl.empty();
    var P = $(this).kFormSubmitParam();//собирает параметры формы frmfilter..
    delete P.daysbeg; //удаление из параметров формы days
    delete P.daysend; //удаление из параметров формы days
    $.getJSON('qRestListWares', P, reportCreate);
    return false;
  });
});



