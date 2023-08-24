var tblCode = 'RSTORAGELIFE_RESTWITHOUT';
var tbl;

$(document).ready(function() {
  $("#dvData").css({height: kScreenH(), width: "100%"});
  tbl = $('#dvData').Tbl({code: tblCode, rowFocus: true});

  $("#frmFilter").unbind('submit').bind("submit", function () {
    tbl.empty();
    var P = $(this).kFormSubmitParam();
    $.getJSON('qRestWithoutStorageLife', P, function(json){
      if (!showErr(json))
        tbl.data(json);
    });
    return false;
  });
});
