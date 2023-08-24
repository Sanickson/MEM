var tblCode = 'EXPIRATIONDATE_PALLETS';

$(document).ready(function () {
  var height = kScreenH();
  $('#perc').kInputInt();
  $("#dvData").css({height: height, width: "100%"});

  var tblWaresO = {
    idTable: 'tbl'
  };


  /*$('#ptype').click(function(){
var p = {};
    p.flag = 'R';
    if ($("#dvZone").length)
        $("#dvZone").dialog("open");//.remove();
    else {
        $.blockUI({message:'<h2>...загрузка типов...</h2>'});
        $.getJSON('pallettypelist', p ,function(JSON){
            var html = '<table id="tblZone"><thead><tr><th class="chk"><input type="checkbox" /></th><th>Код</th><th>Наименование</th></tr></thead><tbody>'
            for(var i=0;i<JSON.data.length;i++)
                html += '<tr><td class="chk"><input type="checkbox" typeid="'+JSON.data[i].PTID+'" /></td><td>'+JSON.data[i].PTCODE+'</td><td>'+JSON.data[i].PTNAME+'</td></tr>';
            html += '</tbody><tfoot><tr><th colspan=3>&nbsp;</th></tr></tfoot></table>';
            var $dv = $("<div/>").attr("id","dvZone").addClass("flora").css("text-align","center")
                .dialog({closeOnEscape:true,title:'Типы паллетов',autoOpen:true,
                         resizable:false,draggable:false,modal:true,overlay:{opacity:0.5,background:"black"},
                         height:300,width:300})
                .bind("dialogbeforeclose", function( event, ui ) {
                    var typeid = '';
                    if ($('#tblZone>tbody>tr').length!=$('#tblZone>tbody>tr>td>input:checked').length) {
                        $('#tblZone>tbody>tr>td>input:checked').each(function(){
                            typeid += $(this).attr('typeid') + ',';
                        });
                        $('#ptype').attr('typep',typeid);
                    } else $('#ptype').attr('typep','')
                } )
                .html(html)
                    .find('table')
                        .kTdChk()
                        .kTblScroll()

            //$dv.bind("beforeclose", function( event, ui ) {console.log('close')} );

            $.unblockUI();
        });
    }

  });*/

  $.whTblDBOptions(tblCode, tblWaresO);

  function reportCreate(json) {
    var $dv = $('#dvData');
    var jsonFull = {data: []};

    $.progressDo({

      arr: json.data,
      extParams: { pid: json.PID},//входящие параметры
      arrNullAlert: 'Товары не найдены',
      url: 'qWaresPallet',
      funcParams: function (item) {
        return {pid: item.PID};
      },
      funcIter: function (json) {
        for (var i = 0; i < json.data.length; i++) {//если fetch="all"
          jsonFull.data.push(json.data[i]);
        }
      },
      funcEnd: function () {
        var html = $.whTblHTML(jsonFull, tblWaresO);
        $dv.html(html).find('table:first').css('width', '100%').whTblContextMenu().kTblSorter().kTblScroll();

      }

    });
  }
  
  $("#frmFilter").unbind('submit').bind("submit", function () {
    var params = {}
        params.whid = $("#whid").val();
		params.clid = $("#clid").val();
        params.szid= $('#szid').val();
		params.whmodeid= $('#whmodeid').val();
		params.sgid= $('#sgid').val();
        $.getJSON("qRestTRNPalList",params,reportCreate);

		return false;
  });
});



