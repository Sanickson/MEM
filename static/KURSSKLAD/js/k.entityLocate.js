/**
 * Created by kashko.iu on 25.10.2018.
 */
;(function(jQuery){


  jQuery.entityList = function(options)
  {   // defaults
      var options = jQuery.extend({title:'Поиск клиента', // Заголовок
                                   success: false, // Success function
                                   locCode: true, // Искать ли по коду
                                   locName: true, // Искать ли по наименованию
                                   divId: "getListEntity" // Искать ли по наименованию
                                  },options);

      var $dialog = $("#"+options.divId);
      if ($dialog.length==0)
      {   var $dialog = $("<div/>").attr("id",options.divId).addClass("flora").css("text-align","center").dialog({height:100,width:200,modal:true,resizable:false,draggable:true,title:options.title,overlay:{backgroundColor:'#000',opacity: 0.5}});
          $dialog.html('<form action="getListEntity">'+
                          '<select style="width:50px">'+
                                  ( options.locCode ? '<option value="acode">Код</option>' : '')+
                                  ( options.locName ? '<option value="aname">Наименование</option>' : '')+
                          '</select>'+
                          '&nbsp;'+
                          '<input type="text" style="width:100px" value=""/>'+
                          '<div class="buttons" style="padding:3px">'+
                              '<button type="submit"><img src="'+eng_img+'/actions/magnifier.png" border="0">Искать</button>'+
                          '</div></form>');

          $("form",$dialog).unbind("submit").bind("submit",function()
          {   if (!$("select",$dialog).val()) {errShowText('Нечего искать!'); return;}

              var action = 'getListEntity';
              var data = {};

              var selectVal = $("select",$dialog).val();
              if (selectVal=='acode') data.acode = $("input",$dialog).val();
              else if (selectVal=='aname') data.aname = $("input",$dialog).val();

              $.getJSON(action,data,function(JSON)
              {   if (!showErr(JSON))
                  {   if (JSON.data.length==1)
                      {
                          if (options.success) options.success(JSON.data[0].COMPID,JSON.data[0].EXTID,JSON.data[0].NAME);
                          $dialog.dialog("close");
                      }
                      else
                      {   var $d = $("<div/>").addClass("flora").css("text-align","center").dialog({height:250,width:500,modal:true,resizable:false,draggable:true,title:"Выбор",overlay:{backgroundColor:'#000',opacity: 0.5}});
                          var html = "<table><thead><tr><th>Код</th><th>Наименование</th></tr></thead><tbody>";
                          for (var i=0; i<JSON.data.length; i++)
                              html += '<tr clid="'+JSON.data[i].COMPID+'"><td class="number">'+JSON.data[i].EXTID+'</td><td class="text">'+JSON.data[i].NAME+'</td></tr>';
                          $d.html(html);
                          $("table",$d).tablesorter().kTblScroll()
                              .find("tbody>tr").click(function()
                              {   var $tr = $(this);
                                  if (options.success) options.success($tr.attr("clid"),$tr.find("td:first").text(),$tr.find("td:last").text());
                                  $d.dialog("close");
                                  $dialog.dialog("close");
                              });
                          if (data.aname) {
                            $("table",$d).find('td').kUnmarkText().kMarkText(data.aname);
                            // $('#tblClients tbody>tr').hide().find('span').closest('tr').show();
                          } else {
                            $("table",$d).find('td').kUnmarkText();
                          }
                          $d.unbind("dialogclose").bind("dialogclose",function(event,ui){  $d.empty().remove(); });
                          $d.dialog("open");
                      }
                  }
              });
              return false;
          })
          .find("input").unbind("focus").focus(function(){$(this).select();});
      }
      $dialog.dialog("open");
      $dialog.find("input").focus();
      return false;
  };

  jQuery.fn.entityList = function(options)
  {   var $self = this;
      var options = jQuery.extend({title:'Поиск клиента', // Заголовок
                                   locCode: true, // Искать ли по коду
                                   locName: true, // Искать ли по наименованию
                                   success: function(clid,code,name){
                                       var text = wcode+'-'+wname;
                                       $self.attr("data-val",clid).val(name);
                                   }
                                  },options);


      $self.unbind("click").bind("click",function(event)
      {   $.entityList({title:options.title,
                        success: options.success,
                        locCode: options.locCode,
                        locName: options.locName,
                        divId: options.divId?options.divId:"dvClient"
                       });
      });

      if ($("#ulClientLocate").length==0)
      {   $(document.body).append('<ul id="ulClientLocate" class="contextMenu">'+
                                      '<li class="locate"><a href="#locate">Искать</a></li>'+
                                      '<li class="clear"><a href="#clear">Очистить</a></li>'+
                                  '</ul>');
          $("#ulClientLocate>li.locate>a").css("background-image","url("+eng_img+"/actions/magnifier.png)");
          $("#ulClientLocate>li.clear>a").css("background-image","url("+eng_img+"/actions/application.png)");
      }

      $self.attr("title","Кликните для выбора").attr("readonly","readonly");

      return $self;
  };
})(jQuery);
