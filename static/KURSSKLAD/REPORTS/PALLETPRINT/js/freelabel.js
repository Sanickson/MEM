$(document).ready(function () {

    var height = kScreenH(); // - $("#dvFilter").height();
    $("#dvScreen").css({
        "height": height,
        "width": "100%",
        "overflow-x": "auto",
        "overflow-y": "hidden",
        "padding-bottom": "16px"
    });
    $("#frmFreePrint").css({
        "text-align": "center",
        "padding": "5px"
    });
    $("#frmFreePrint div").css({
       "padding": "5px"
    });
    $("#frmFreePrint input,textarea,select").css({
       "width": "170px",
       "text-align": "left"
    });
    $("#frmFreePrint button").css({
       "width": "70px"
    });

    $('#labelSize').html('<option value="1">100х75 мм</option><option value="2">58х40 мм</option>');
    $('#labelAmount').kInputInt();
    $.getJSON('printers', function (json) {
        var html ='';
        for (var i = 0; i < json.data.length; ++i)
            html += '<option value="' + json.data[i].ALIAS + '">' + json.data[i].ALIAS + '</option>';
        $('#printers').html(html);
    });

    $("#frmFreePrint").submit(function () {
        //$('#dvScreen').empty();
        if (!$('#labelAmount').val() || $('#labelAmount').val()=='0'){
            alert('Не задано количество этикеток!');
            return false;
        }
        var params = {
            ltext: $('#dvLabelText').val(),
            lbarcode: $('#dvBarcode').val(),
            lsize: $('#labelSize').val(),
            lamount: $('#labelAmount').val(),
            lprinter: $('#printers').val()
        };
        $.getJSON('print_free_label', params,
            function(json) {
                        if (!showErr(json)){
                            alert("Этикетка отправлена на печать")};
                            return false;
                    });
    });
});
