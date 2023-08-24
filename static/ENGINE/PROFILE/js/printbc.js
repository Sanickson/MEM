;(function($){

    //Генерация кода авторизации

    function generateBC()
    {
       $.ajax
       ({async: false,
              url: "ajaxBarcodeGen",
              data: {passwdBC: $('#passwdBC').val()},
              dataType: "json",
              success: function (json, textStatus)
              {
                  if (json.data.RES=='ok'){
                      $("#success_msg_bc").text(_('Код доступа сгенерирован. Распечатайте его ШК- или QR-вариант.'));
                      $(".errormsg").text('');
                  }
                  else{
                      $("#success_msg_bc").text('');
                      $(".errormsg").text(json.data.ERROR_MSG);
                  }
              }
       });
       $('#passwdBC').val('');
    }

    //Печать ШК

    function printBC()
    {
        $.ajax
        ({async: false,
            url: "ajaxBarcodeHTML",
            data: {is_qr: 0, passwdBC: $('#passwdBC').val()},
            dataType: "json",
            success: function (json, textStatus)
            {
                  if (json.data.RES!='ok'){
                      $("#success_msg_bc").text('');
                      $(".errormsg").text(json.data.ERROR_MSG);
                  }
                  else{
                      var wnd = window.open(null);
                      if (wnd) {
                          wnd.document.write(json.data.HTML);
                          wnd.document.close();//без этого загрузка не завершается
                          $("#success_msg_bc").text(_('Сформирована карта доступа с ШК. Отправьте её на печать средствами браузера.'));
                          $(".errormsg").text('');
                      }
                      else{
                          $("#success_msg_bc").text('');
                          $(".errormsg").text(_('Карта доступа с ШК не может быть сформирована, поскольку всплывающие окна в браузере заблокированы! Разрешите их для данного сайта и повторите процедуру печати!'));
                      }
                  }
            }
        });
        $('#passwdBC').val('');
    }

    //Печать QR

    function printQR()
    {
        $.ajax
        ({async: false,
            url: "ajaxBarcodeHTML",
            data: {is_qr: 1, passwdBC: $('#passwdBC').val()},
            dataType: "json",
            success: function (json, textStatus)
            {
                  if (json.data.RES!='ok'){
                      $("#success_msg_bc").text('');
                      $(".errormsg").text(json.data.ERROR_MSG);
                  }
                  else{
                      var wnd = window.open(null);
                      if (wnd) {
                          wnd.document.write(json.data.HTML);
                          wnd.document.close();//без этого загрузка не завершается
                          $("#success_msg_bc").text(_('Сформирована карта доступа с QR-кодом. Отправьте её на печать средствами браузера.'));
                          $(".errormsg").text('');
                      }
                      else{
                          $("#success_msg_bc").text('');
                          $(".errormsg").text(_('Карта доступа с QR-кодом не может быть сформирована, поскольку всплывающие окна в браузере заблокированы! Разрешите их для данного сайта и повторите процедуру печати!'));
                      }
                  }
            }
        });
        $('#passwdBC').val('');
    }

    $(
      function(){
        $('#genbcbutton').unbind('click').click(function(){
            generateBC();
        });
        $('#prnbcbutton').unbind('click').click(function(){
            printBC();
        });
        $('#prnqrbutton').unbind('click').click(function(){
            printQR();
        });
      });

})(jQuery);
