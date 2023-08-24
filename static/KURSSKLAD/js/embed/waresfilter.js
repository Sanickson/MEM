/**
 * Created by kashko.iu on 18.01.2017.
 */
;(function ($) {

	var urlS;
	var urlF;
	var funcS;
	//скрыть/показать фильтр
     $.sp = function() {
      if ($("#dvFilter").attr('whsize') == 'min') {
        $("#dvFilter").dialog("option", "height", '580px')
        .attr('whsize', 'max');
      }
      else {
        var heig = $(".ui-dialog-titlebar").height();
        $("#dvFilter").dialog("option", "height", heig)
         .attr('whsize', 'min');
       // $("#dvFilter").dialog("option", "position", ["left", "top"]);
      }
   };

	$.selectFilter = function (O) {
		$('#filter').kFormFilter();
		urlS = O.scan;
		urlF = O.filter;
		funcS = O.funcS;

			$("#frmProducer").css({'width':'96%'});
			$("#clear").css({'width':'15%'});
			$("#barcode").css({'width':'80%'});
			if ($("#dvFilter").length)
					$("#dvFilter").dialog("open");//.remove();
			else {
				 var $dv = $("<div/>").attr("id","dvFilter").addClass("flora").css("text-align","center")
					.dialog({closeOnEscape:false,title:'Фильтры',autoOpen:true,
									 resizable:false,draggable:true, position: ["left", "top"],
									 dialogClass: 'test',
									 height:580,width:250});
          document.getElementById('dvFilter').appendChild(document.getElementById('frmFilter'));
					// .html($("#filter").show())
					$dv.parent()
					.find("a.ui-dialog-titlebar-close").hide().end() //скрываем close
					.find(".ui-dialog-titlebar").attr('ondblClick', '$.sp()') //двойное нажатие на область скрывает и раскрывает фильтр
					.end();

					var adda = $('<a href="#" onClick="$.sp()" title="Скрыть/показать">')
					.addClass('hiderer')//waresoptions.css
					.append("<span ></span>");
					$("#dvFilter").dialog().parent().children().children('.ui-dialog-titlebar-close').before(adda);//добавляю в титл новую кнопку
			}
	};


	$.scanSubm =  function () {
		var P = {};
		P.barcode = $('#barcode').val();
		P.barcode = P.barcode.replace(/\s+/g,'');
		P.whid = $('#whid').val();
		if (P.barcods != ""){
			$.getJSON(urlS, P, eval(funcS));
		}
		else {
			alert('Введите штрихкод или код товара');
		}
		$(".ui-dialog-titlebar").dblclick();
		return false;
	};


	$.clear =  function () {
		$("#dvScreen").empty();
		$('#barcode').val('');
		return false;
	};

	$.filtSubm =  function () {
		var P = $(this).kFormSubmitParam();//собирает параметры формы
		P.whid = $('#whid').val();
		if ($("#amnt").is(':checked')) {
			P.amnt = $('#amnt').val();
		}
		$("#dvScreen").empty();
		$.getJSON(urlF, P, $.wareslist);

		$(".ui-dialog-titlebar").dblclick();
		return false;
	};


})(jQuery);
