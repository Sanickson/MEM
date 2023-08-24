$(document).ready(function () {
  $('#dvFilterDateBeg,#dvFilterDateEnd').val(getToday()).mask("99.99.9999").datepicker().css('text-align', 'center');
  $('#dvFilterTimeBeg,#dvFilterTimeEnd')
    .mask("99:99")
    .bind('change', function () {
      var str = $(this).val();
      if (str == '')
        str = '00:00';
      var hour = str.split(':')[0];
      var time = str.split(':')[1];
      if (parseInt(hour, 10) > 23)
        hour = '23';
      if (parseInt(time, 10) > 59)
        time = '59';
      $(this).val(hour + ':' + time);
    });

  var height = kScreenH(); // - $("#dvFilter").height();
  $("#dvScreen").css({"height": height,
    "width": "100%",
    "overflow-x": "auto",
    "overflow-y": "hidden",
    "padding-bottom": "16px"});

  $("#frmFilter").submit(function(){
    $('#dvScreen').empty();
    var P = {
      dtbeg: $('#dvFilterDateBeg').val() + ' ' + $('#dvFilterTimeBeg').val() + ':00',
      dtend: $('#dvFilterDateEnd').val() + ' ' + $('#dvFilterTimeEnd').val() + ':59'
    };
    $.getJSON('qpalletsum', P, palletsum);
    return false;
  });

  function palletsum(json){
    if (showErr(json)){
      return;
    }
    var html = '<table id="income"><thead><tr>' +
        '<th ksort="text" title="Сотрудники" >Сотрудники</th>' +
        '<th ksort="digit" title="Количество отпечатанных этикеток приемки">Отпечатано(приемка)</th>' +
        '<th ksort="digit" title="Количество использованных этикеток приемки">Использовано(приемка)</th>' +
        '<th ksort="digit" title="Количество неиспользованных этикеток приемки">Не использовано(приемка)</th>' +
        '<th ksort="digit" title="Количество отпечатанных этикеток отборки" >Отпечатано этикеток отборки</th>' +
        '</tr></thead><tbody>';
    var sum_incomebarcodes = 0, sum_incomepallets = 0, sum_selectpallets = 0, sum_print = 0, sum_not_use = 0;
    for (var i=0; i<json.data.length; i++){
        var tr = json.data[i];
        var not_use = 0;
        not_use = Number(tr.INCOMEBARCODES) - Number(tr.INCOMEPALLETS);
        html += '<tr>' +
            '<td class="text">' + tr.MANFIO + '</td>' +
            '<td>' + tr.INCOMEBARCODES + '</td>' +
            '<td>' + tr.INCOMEPALLETS + '</td>' +
            '<td>' + ((not_use>0)?String(not_use):'') + '</td>' +
            '<td>' + tr.SELECTPALLETS + '</td>' +
          '</tr>';
        sum_incomebarcodes += Number(tr.INCOMEBARCODES);
        sum_incomepallets += Number(tr.INCOMEPALLETS);
        sum_selectpallets += Number(tr.SELECTPALLETS);
        sum_not_use += not_use;
        sum_print += Number(tr.INCOMEBARCODES) + Number(tr.SELECTPALLETS);
    }
    html += '</tbody><tfoot><tr><th title="Всего отпечатано этикеток приемки и отборки">Всего отпечатано: '+
        sum_print +'</th><th>'+ sum_incomebarcodes +'</th><th>'+ sum_incomepallets +'</th><th>' + sum_not_use + '</th><th>'+
        sum_selectpallets + '</th></tr></tfoot></table>';
    $('#dvScreen').html(html).find('#income:first').kTblScroll().kTblSorter();
  }
});
