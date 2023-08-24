var tblCode = 'RSTORAGELIFE_ROTATION';
var tbl;

$(document).ready(function () {
  $("#dvData").css({height: kScreenH(), width: "100%"});
  tbl = $('#dvData').Tbl({code: tblCode, rowFocus: true}); //определяем таблицу

  $("#frmFilter").unbind('submit').bind("submit", function () {
    tbl.empty();
    var params = $(this).kFormSubmitParam();
    $.getJSON("qRotationWaresList", params, reportCreate);

    return false;
  });

  function reportCreate(json) {
    if (showErr(json))
      return false;
    var jsonFull = {data: []};
    $.progressDo({
      arr: json.data,
      arrNullAlert: 'Список товаров у которых остаток в МО позднее, чем есть на МХ не найден',
      url: 'qRotationWaresData',
      funcParams: function (item) {
        return {
          wid: item.WID,
          whid: json.ext_data.WHID,
          prdate: item.PRODUCTDATEB
        };
      },
      funcIter: function (json) {
        for (var i = 0; i < json.data.length; i++) {
          if (json.data[i].WLOTID)
            jsonFull.data.push(json.data[i]);
        }
      },
      funcEnd: function () {
        if (jsonFull.data.length > 0)
          tbl.data(jsonFull); //строим таблицу с данными
        else
          alert('Список товаров у которых остаток в МО позднее, чем есть на МХ не найден')
      }
    });
  }

});