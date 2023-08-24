let tbl;

$(document).ready(function() {
  var height = kScreenH();
  $("#dvScreen").css({height: height, width: "100%"});

  $('#frm').unbind('submit').submit(refresh);

  function refresh(){
    var $frm = $('#frm');
    $frm.find('button[type="submit"]').attr('disabled');
    if (tbl) tbl = $.TblDel(tbl);
      tbl = $('#dvScreen').empty().Tbl({
      code: 'NEW_CLIENT',
      contextMenu: {
        optSortKey: ['Add'/*,'New'*/],
        funcAdd: clientAdd, classAdd: 'edit', nameAdd: 'Настроить клиента',
        //funcNew: clientNew, classNew: 'add', nameNew: 'Перенести в клиенты'
      },
      rowFocus: {rfSetDefFocus: false}
    });
    var params = $frm.kFormSubmitParam();
    $.getJSON('qNewClients',params, function(json){
      tbl.data(json);
    });
    $frm.find('button[type="submit"]').removeAttr('disabled');
    return false;
  }

  function clientNew(){
    var trId = $(this).attr('id');

    $.getJSON('statusUpdClient', {objid: tbl.trKeyId(trId), status: 'N'}, function(json){
      if (!showErr(json)){
        tbl.trDel(trId);
      }
    });
  }

  function clientAdd (){
    $(this).cngClients({success: function(json){
      var trId =  tbl.trId(json.data['0'].TOID);
      tbl.trDel(trId);
    }});
  }
  refresh();
});