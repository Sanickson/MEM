/**
 * Created by kashko.iu on 14.06.2018.
 */

jQuery(
  function(){
    function showRepeatVerdict(){
        //Если что-то введено
        if ($("#passwd2").val().length != 0) {
            $("#passwd2").closest("td").find("div.errormsg").remove();
            //Показываем контейнер с текстовым пояснением к повтору пароля
            $("#repeat-text").css("display", "block");
            $("#verdict_passwd2").css("display", "inline");

            var w = $("#passwd2").width()-2;
            $("#repeat-text").width(w);
            var l = $("#passwd2").position().left-$("#passwd2").parent().position().left
                - $("#createaccount-form").width() / 2 + w / 2 + 12;
            $("#repeat-text").css("left", l);

            //Значок вердикта
            $("#repeat-text").get(0).className = "";
            if ($("#passwd").val() == $("#passwd2").val()) {
                $("#verdict_passwd2").get(0).className = "verdict verdict_yes";
                $("#repeat-text").text("Пароли совпадают").addClass("pc-green");
            }
            else {
                $("#verdict_passwd2").get(0).className = "verdict verdict_no";
                $("#repeat-text").text("Пароли не совпадают").addClass("pc-critical");
            }
        }
        else {
            //В противном случае, скрываем
            $("#repeat-text").hide();
            $("#verdict_passwd2").hide();
        }
    }
    $("#passwd").unbind("keyup").bind("keyup", function(){
        $.getJSON("get_pwd_complexity_status", {password: $("#passwd").val()},
            function(JSON){
                $("#passwd").closest("td").find("div.errormsg").remove();
                //console.log(JSON);
                //Если что-то введено
                if ($("#passwd").val().length != 0) {
                    //Показываем контейнер с элементами

                    $("#pc-container").show().css({"display": "inline-block"});
                    $("#verdict_passwd").show().css("display", "inline-block");

                    //\$("#pc-container").css('left', 0);
                    //\$("#pc-indicator").css('left', 0);
                    var w = $("#passwd").width()+2;
                    //var picw = 22//\$("#verdict_passwd").outerWidth(true);
                    $("#pc-indicator, #pc-indicator-text, #pc-indicator-inline").width(w);

                    //Значок вердикта
                    if (JSON.ext_data.VERDICT) {
                        $("#verdict_passwd").get(0).className = "verdict verdict_yes";
                    }
                    else {
                        $("#verdict_passwd").get(0).className = "verdict verdict_no";
                    }
                    $("#pc-indicator-text").get(0).className = "";
                    $("#pc-indicator-inline").get(0).className = "";

                    var perc = Math.min(parseFloat(JSON.ext_data.COMPLEXITY)*100, 100);
                    $("#pc-indicator-inline").width(perc == 100 ? w-4 : perc >= 97 ? w-7 : perc.toFixed(0)+"%");
                    $("#pc-indicator-text").text(JSON.ext_data.STATUS);

                    if (JSON.ext_data.STATUS == "Лёгкий пароль" || JSON.ext_data.STATUS == "Слишком короткий") {
                        $("#pc-indicator-text").addClass("pc-critical");
                        $("#pc-indicator-inline").get(0).className = "pc-i-critical";
                    }

                    else if (JSON.ext_data.STATUS == "Средней сложности") {
                        $("#pc-indicator-text").addClass("pc-yellow");
                        $("#pc-indicator-inline").get(0).className = "pc-i-yellow";
                    }

                    //"Оптимальный'
                    else{
                        $("#pc-indicator-text").addClass("pc-green");
                        $("#pc-indicator-inline").get(0).className = "pc-i-green";
                    }
                }
                else {
                    //В противном случае, скрываем
                    $("#pc-container").hide();
                    $("#pc-indicator-inline").width(0);
                    $("#verdict_passwd").hide();
                }
                showRepeatVerdict();
            }
        );
    });

    $("#passwd2").unbind("keyup").bind("keyup", function(){
        showRepeatVerdict();
    });
  }
)
