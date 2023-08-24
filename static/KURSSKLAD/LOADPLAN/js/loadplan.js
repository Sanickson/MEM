(function () {
  useviewunit = 1;
  $(function () {
    var h = kScreenH(), w = kScreenW();

    $('#dvMain').height(h);
    //$('#dvMain>div:first').width(w - 400);
    loadCars();

    $("<ul/>").attr("id", 'taskContext').addClass("contextMenu").css("width", "190px")
      .html('<li class="statusUp"><a href="#stopPlaning">Сформировать</a></li>' +
        '<li class="info"><a href="#editTask">Редактировать</a></li>')
      .appendTo($(document.body));
    $("<ul/>").attr("id", 'docsContext').addClass("contextMenu").css("width", "190px")
      .html('<li class="delete"><a href="#delDoc">Удалить</a></li>')
      .appendTo($(document.body));

    $('#dvDocs').find('table').kTblScroll().end()

    $('form#dvDocs').submit(function () {
      $.blockUI({message: '<h2>..загрузка..</h2>'});
      $.ajax({
        dataType: "json",
        url: 'getDocs',
        data: {date: this.date.value, whid: this.whid.value},
        success: function (resp) {
          if (!showErr(resp)) {
            var html = '';
            for (var i = 0; i < resp.data.length; ++i) {
              html += '<tr data-doc-id="' + resp.data[i].DOCID + '">' +
                $.tdDocStatus(resp.data[i].STATUS) +
                   '<td>' + resp.data[i].NUMBER + '</td>\
                    <td'+ (resp.data[i].DSTNAME ? ' title="'+resp.data[i].DSTNAME +'"' : '') +'>' + (resp.data[i].DSTCODE || '&nbsp;') + '</td>\
                    <td class="from text">' + resp.data[i].FROMNAME + '</td>\
                    <td class="to text">' + resp.data[i].TONAME + '</td>\
                </tr>';
            }
            $('#dvDocs').find('tbody').html(html).end()
              .find('.cnt').text(resp.data.length);
            var $trs = $('#dvDocs').find('table').kTblScroll().tablesorter()
              .find('tbody>tr').dblclick(openCargo).click(showCargo)
            if (editPermission){
              $trs.find('td.from, td.to')
                .draggable({
                  cursor: '',
                  helper: function (event) {
                    return $('<div/>').html($(this).text())
                      .css({'position': 'absolute', 'z-index': '2000', 'font-weight': '800'}).appendTo($(document.body));
                  },
                  helperPos: 'mouse'
                });
            }
          }
        },
        complete: function () {
          $.unblockUI();
        }
      });
      return false;
    }).find('input').datepicker().mask('99.99.9999').val(kToday());
  });

  function loadCars() {
    $.blockUI({message: '<h2>..загрузка..</h2>'});
    $.ajax({
      dataType: "json",
      url: 'getCars',
      success: function (resp) {
        if (!showErr(resp)) {
          var html = '<table><thead><tr><th>Авто</th><th title="Количество заданий">КЗ</th></tr></thead><tbody>';
          for (var i = 0; i < resp.data.length; ++i) {
            html += '<tr data-car-id="' + resp.data[i].AID + '" data-gate-id="' + resp.data[i].GATEID + '" data-status-id="' + resp.data[i].STATUS + '">\
                                <td class="text">' + resp.data[i].NAME + '</td>\
                                <td>' + resp.data[i].CNTTASK + '</td>\
                            </tr>';
          }
          html += '</tbody></table>';
          $('#dvCars').html(html).find('table').kTblScroll()//.find('tbody>tr')
            .rowFocus({
              rfFocusCallBack: function () {
                showCarTasks($(this).attr('data-car-id'));
              }, rfSetDefFocus: false
            })
            .find('tbody>tr')/*.droppable({tolerance: 'mouse',
             accept: function(elem){
             return ($(elem).is("td"));
             },
             drop: function(event, ui) {
             //console.log()
             // ui.draggable - Перетаскиваемый элемент
             // ui.element - Элемент, на который перетащили
             if(ui.element.attr('data-status-id') != '0'){
             alert('Добавлять документы можно только в загружаемых автомобиль!');
             return false;
             }
             if(ui.element.attr('data-gate-id') == ''){
             alert('Сначала установите на каких воротах будет стоять машина!');
             return false;
             }
             if(!confirm('Вы действительно хотите, чтобы документ '+ui.draggable.find('td:eq(0)').text()+' поехал в машине '+ui.element.find('td:eq(0)').text()+'?')) return;
             $.blockUI({message: '<h2>..сохранение..</h2>'});
             $.ajax({
             dataType: "json",
             url: 'addDoc',
             data: {docid: ui.draggable.attr('data-doc-id'), car: ui.element.attr('data-car-id')},
             success: function(resp){
             if(!showErr(resp)){
             ui.draggable.remove();
             $('#dvCars table').kTblScroll();
             $('#dvCars table').rfSetFocus($('#dvCars table').rf$GetFocus());
             }
             },
             complete: function() {
             $.unblockUI();
             }
             });
             console.log(ui.draggable, ui.element);
             }
             })*/
            /*.contextMenu({menu: 'carsContext'}, function (action, el){
             eval(action+'.call($(el))');
             })*/
            .each(function () {
              $(this).find('td:eq(2)').dblclick(chgGate);
            });
        }
      },
      complete: function () {
        $.unblockUI();
      }
    });
  }

  function showCarDocs(carid, taskid) {
    $.blockUI({message: '<h2>..загрузка..</h2>'});
    $.ajax({
      dataType: "json",
      url: 'getCarDocs',
      data: {task: taskid, car: carid},
      success: function (resp) {
        if (!showErr(resp)) {
          var html = '<table><thead><tr><th colspan=7>Документы</th></tr><tr><th></th>' +
            '<th title="Приоритет погрузки">ПП</th>' +
            '<th>Дата</th>' +
            '<th>Номер</th>' +
            '<th title="Подтип">ПТ</th>' +
            '<th>От</th>' +
            '<th>Кому</th>' +
            '</tr></thead><tbody>';
          for (var i = 0; i < resp.data.length; ++i) {
            html += '<tr data-doc-id="' + resp.data[i].DOCID + '" data-task-id="' + resp.data[i].NTASKID + '">' +
              $.tdDocStatus(resp.data[i].STATUS) +
              '<td>' + resp.data[i].PRIORITY + '</td>\
                <td>' + resp.data[i].DOCDATE + '</td>\
                <td>' + resp.data[i].NUMBER + '</td>\
                <td' + (resp.data[i].DSTNAME ? ' title="' + resp.data[i].DSTNAME +'"' : '') + '>' + (resp.data[i].DSTCODE || '') + '</td>\
                <td class=text>' + resp.data[i].FROMNAME + '</td>\
                <td class="text">' + resp.data[i].TONAME + '</td>\
             </tr>';
          }
          html += '</tbody><tfoot><tr><th>' + resp.data.length + '</th><th colspan=6 class=buttons>'+
            (editPermission ? '<button class="clear" title="Очистить задание"><img src="' + eng_img + '/actions/delete.png"></button>' : '') +
            '</th></tr></tfoot></table>';
          var $trs = $('#dvCarsDocs').html(html).find('table').kTblScroll().tablesorter().find('tbody>tr')
            .dblclick(openCargo).click(showCargo)
          if (editPermission){
            $trs.contextMenu({menu: 'docsContext'}, function (action, el) {
              eval(action + '.call($(el))');
            })
            .each(function () {
              $('td:eq(1)', this).dblclick(function (e) {
                chgPrior.call(this);
                e.stopPropagation();
                return false;
              })
            })
            $('#dvCarsDocs').find('.clear').click(clear);
          }
        }
      },
      complete: function () {
        $.unblockUI();
      }
    });

    function clear() {
      var task = $('#dvCarsTasks table').rf$GetFocus();
      //if(task.attr('data-status-id') != '4') {alert('Задание не позволяет редактирование!'); return false;}
      if (!confirm('Вы действительно хотите удалить все документы для погрузки ?')) return false;
      $.blockUI({message: '<h2>..очистка..</h2>'});
      $.ajax({
        dataType: "json",
        url: 'clearTask',
        data: {task: task.attr('data-task-id')},
        success: function (resp) {
          if (!showErr(resp)) {
            $('#dvCarsTasks table').rfSetFocus(task);
            $('#dvMain form').submit();
          }
        },
        complete: function () {
          $.unblockUI();
        }
      });
    }

    function chgPrior() {
      var tr = $(this).parent();
      if ($('#dvChgPrior').length) $('#dvChgPrior').dialog('destroy').remove();

      var html = 'Приоритет <input type=text name=prior value="' + $(this).text() + '" size=6><br>' +
        '<div class="buttons" style="text-align:center;">' +
        '<button type="submit"><img src="' + eng_img + '/actions/accept.png" border="0"> Изменить</button>&nbsp;' +
        '<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0"> Отменить</button>' +
        '</div>';
      ;
      $("<form/>").attr("id", "dvChgPrior").addClass("flora").css("text-align", "center")
        .dialog({
          closeOnEscape: false, title: 'Добавления задания', autoOpen: true,
          resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
          height: 120, width: 250
        })
        .html(html)
        .submit(subm)
        .find('input').focus().select().kInputInt();
      function subm() {
        var val = this.prior.value;
        $.blockUI({message: '<h2>..сохранение..</h2>'});
        $.ajax({
          dataType: "json",
          url: 'chgPrior',
          data: {task: tr.attr('data-task-id'), prior: val},
          success: function (resp) {
            if (!showErr(resp)) {
              $('td:eq(1)', tr).text(val);
              $('#dvCarsDocs table').tablesorter();
              $('#dvChgPrior').dialog('close');
            }
          },
          complete: function () {
            $.unblockUI();
          }
        });

        return false;
      }
    }
  }

  function showCarTasks(id) {
    $.blockUI({message: '<h2>..загрузка..</h2>'});
    $('#dvCarsDocs').empty();
    $.ajax({
      dataType: "json",
      url: 'getCarTasks',
      data: {car: id},
      success: function (resp) {
        if (!showErr(resp)) {
          var html = '<table data-car-id="' + id + '"><thead><tr><th colspan=3>Задания</th></tr><tr><th></th><th>Дата</th><th>Ворота</th></tr></thead><tbody>';
          for (var i = 0; i < resp.data.length; ++i) {
            html += '<tr data-task-id="' + resp.data[i].TASKID + '" data-status-id="' + resp.data[i].STATUS + '" data-site-id="' + resp.data[i].SITEID + '">' +
              $.tdTaskStatus(resp.data[i].STATUS) +
              '<td>' + resp.data[i].PLANDATETIME + '</td>\
                                <td>' + resp.data[i].SNAME + '</td>\
                            </tr>';
          }
          html += '</tbody>';
          if (editPermission){
            html += '<tfoot><tr><th colspan=3 class="buttons">' +
              '<button class="add" title="Добавить задание на постановку"><img src="' + eng_img + '/actions/add.png"></button>' +
              '<button class="delete" title="Удалить задание на постановку"><img src="' + eng_img + '/actions/delete.png"></button>' +
              '</th></tr></tfoot>';
            /*<button class="up" title="Вверх"><img src="'+eng_img+'/arrows/arrow_up.gif"></button>\
             <button class="down" title="Вниз"><img src="'+eng_img+'/arrows/arrow_down.gif"></button>\*/
          }
          html += '</table>';

          $('#dvCarsTasks').html(html).find('table').kTblScroll()
            .rowFocus({
              rfFocusCallBack: function () {
                showCarDocs(id, $(this).attr('data-task-id'));
              }, rfSetDefFocus: true
            })
            .find('tbody>tr').droppable({
            tolerance: 'mouse',
            accept: function (elem) {
              return ($(elem).is("td"));
            },
            drop: function (event, ui) {
              //console.log()
              // ui.draggable - Перетаскиваемый элемент
              // ui.element - Элемент, на который перетащили
              if (!editPermission){
                alert('В интерфейсе запрещено редактирование!');
                return false;
              }
              if (ui.element.attr('data-status-id') != '4') {
                alert('Добавлять документы можно только в формируемое задание!');
                return false;
              }
              var docs = ui.draggable.parent().attr('data-doc-id');
              if (ui.draggable.is('.to')) {
                var d = [];
                $('#dvDocs table tbody>tr').each(function () {
                  if (ui.draggable.text() == $('td.to', this).text())
                    d.push($(this).attr('data-doc-id'));
                });
                if (!confirm('Вы действительно хотите добавить все документы для ' + ui.draggable.text() + ' количеством ' + d.length + ' шт.?')) {
                  return false;
                }
                docs = d.join(',');
              } else {
                if (!confirm('Вы действительно хотите, чтобы документ ' + ui.draggable.find('td:eq(0)').text() + ' поехал в машине ' + ui.element.find('td:eq(0)').text() + '?')) return;
              }
              /*if(ui.element.attr('data-gate-id') == ''){
               alert('Сначала установите на каких воротах будет стоять машина!');
               return false;
               }*/

              $.blockUI({message: '<h2>..сохранение..</h2>'});
              $.ajax({
                dataType: "json",
                url: 'addDocs',
                data: {
                  docs: docs,
                  car: ui.element.parents('table').attr('data-car-id'),
                  task: ui.element.attr('data-task-id')
                },
                success: function (resp) {
                  if (!showErr(resp)) {
                    var d = docs.split(',');
                    for (var i = 0; i < d.length; ++i)
                      $('#dvDocs tr[data-doc-id="' + d[i] + '"]').remove();
                    $('#dvDocs table').kTblScroll();
                    $('#dvCarsTasks table').rfSetFocus($('#dvCarsTasks table').rf$GetFocus()).find('.cnt').text($('#dvCarsTasks table tbody>tr').length);

                  }
                },
                complete: function () {
                  $.unblockUI();
                }
              });
              console.log(ui.draggable, ui.element);
            }
          })
            .contextMenu({menu: 'taskContext'}, function (action, el) {
              eval(action + '.call($(el))');
            }).end()
          $('#dvCarsTasks button')
            .filter('.add').click(addTask).end()
            .filter('.delete').click(delTask).end()
            .filter('.up').click(numUp).end()
            .filter('.down').click(numDown).end();
        }
      },
      complete: function () {
        $.unblockUI();
      }
    });
  }

  function chgGate() {
    var car = $(this).parent();
    if ($('#dvGates').length) $('#dvGates').dialog('destroy').remove();

    $.blockUI({message: '<h2>..загрузка ворот..</h2>'});
    $.ajax({
      dataType: "json",
      url: 'getGates',
      success: function (resp) {
        if (!showErr(resp)) {
          var html = '<table><thead><tr><th>Ворота</th></tr></thead><tbody>';
          for (var i = 0; i < resp.data.length; ++i) {
            html += '<tr data-gate-id="' + resp.data[i].GATEID + '">\
                                <td>' + resp.data[i].NAME + '</td>\
                            </tr>';
          }
          html += '</tbody></table>';
          $("<div/>").attr("id", "dvGates").addClass("flora").css("text-align", "center")
            .dialog({
              closeOnEscape: false, title: 'Ворота', autoOpen: true,
              resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
              height: 400, width: 250
            })
            .html(html)
            .find('table').kTblScroll()
            .find('tbody>tr').dblclick(setGate);
        }
      },
      complete: function () {
        $.unblockUI();
      }
    });

    function setGate() {
      var gate = $(this);
      if (confirm('Вы действительно хотите привязать ворота к машине?')) {
        $.blockUI({message: '<h2>..загрузка ворот..</h2>'});
        $.ajax({
          dataType: "json",
          url: 'setGates',
          data: {car: car.attr('data-car-id'), gateid: gate.attr('data-gate-id')},
          success: function (resp) {
            if (!showErr(resp)) {
              car.attr('data-gate-id', gate.attr('data-gate-id'))
                .find('td:eq(2)').text(gate.find('td').text());
              $('#dvGates').dialog('close');
            }
          },
          complete: function () {
            $.unblockUI();
          }
        });
      }
    }
  }

  function statusUp() {
    var car = $(this);
    if (car.attr('data-status-id') != '0') {
      alert('Статус машины не позволяет данного действия!');
      return false;
    }
    if (confirm('Вы действительно хотите закончить формирование машины? \nДанное действие необратимо!')) {
      $.blockUI({message: '<h2>..загрузка ворот..</h2>'});
      $.ajax({
        dataType: "json",
        url: 'statusUp',
        data: {car: car.attr('data-car-id')},
        success: function (resp) {
          if (!showErr(resp)) {
            car.attr('data-status-id', '1').find('td:eq(1)').text(1);
          }
        },
        complete: function () {
          $.unblockUI();
        }
      });
    }
  }

  function addTask() {
    if ($('#dvAddTask').length) $('#dvAddTask').dialog('destroy').remove();

    $.blockUI({message: '<h2>..загрузка ворот..</h2>'});
    $.ajax({
      dataType: "json",
      url: 'getGates',
      success: function (resp) {
        if (!showErr(resp)) {
          var dt = new Date();
          var current_time = ((dt.getHours() < 10) ? "0" + dt.getHours() : dt.getHours()) + ":" + ((dt.getMinutes() < 10) ? "0" + dt.getMinutes() : dt.getMinutes());
          var html = 'Дата <input type=text name=date value="' + kToday(0) + '" size=6>&nbsp<input id="ctime" type="text" name=time value="' + current_time + '" size=5><br>Ворота <select name="gate">';
          for (var i = 0; i < resp.data.length; ++i) {
            html += '<option value="' + resp.data[i].GATEID + '">' + resp.data[i].NAME + '</option>';
          }
          html += '</select><br><br>' +
            '<div class="buttons" style="text-align:center;">' +
            '<button type="submit"><img src="' + eng_img + '/actions/accept.png" border="0"> Добавить</button>&nbsp;' +
            '<button id="cancel" type="button"><img src="' + eng_img + '/actions/cancel.png" border="0"> Отменить</button>' +
            '</div>';
          $("<form/>").attr("id", "dvAddTask").addClass("flora").css("text-align", "center")
            .dialog({
              closeOnEscape: false, title: 'Добавления задания', autoOpen: true,
              resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
              height: 130, width: 300
            })
            .html(html)
            .submit(subm)
            .find('input[name="date"]').datepicker();
          $("#cancel").click(function () {
            $('#dvAddTask').dialog('close');
          });
          $('#ctime').mask("99:99")
            .click(function () {
              $(this).val('__:__');
              $(this).focus();
              $('#ctime')[0].selectionStart = 0;
              $('#ctime')[0].selectionEnd = 0;
            })
            .change(function () {
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
        }
      },
      complete: function () {
        $.unblockUI();
      }
    });

    function subm() {
      var params = {}
      params.gate = this.gate.value;
      params.date = this.date.value + ' ' + this.time.value + ':00';
      params.car = $('#dvCars table').rf$GetFocus().attr('data-car-id');
      //params.task = $('#dvCarsTasks table').rf$GetFocus().attr('data-task-id');
      $.blockUI({message: '<h2>..сохранение..</h2>'});
      $.ajax({
        dataType: "json",
        url: 'addTask',
        data: params,
        success: function (resp) {
          if (!showErr(resp)) {
            var car = $('#dvCars table').rf$GetFocus();
            car.find('td:eq(2)').text(parseInt(car.find('td:eq(2)').text(), 10) + 1);
            $('#dvCars table').rfSetFocus(car);
            $('#dvAddTask').dialog('close');
          }
        },
        complete: function () {
          $.unblockUI();
        }
      });
      return false;
    }
  }

  function editTask() {
    var task = $('#dvCarsTasks table').rf$GetFocus(),
      date = task.find('td:eq(1)').text();
    if ($('#dvEditTask').length) $('#dvEditTask').dialog('destroy').remove();

    $.blockUI({message: '<h2>..загрузка ворот..</h2>'});
    $.ajax({
      dataType: "json",
      url: 'getGates',
      success: function (resp) {
        if (!showErr(resp)) {
          var html = 'Дата <input type=text name=date value="' + date.split(' ')[0] + '" size=6>&nbsp<input type="text" name="time" value="' + date.split(' ')[1] + '" size=4><br>Ворота <select name="gate">';
          for (var i = 0; i < resp.data.length; ++i) {
            html += '<option value="' + resp.data[i].GATEID + '">' + resp.data[i].NAME + '</option>';
          }
          html += '</select><br><br>' +
            '<div class="buttons" style="text-align:center;">' +
            '<button type="submit"><img src="' + eng_img + '/actions/accept.png" border="0"> Изменить</button>&nbsp;' +
            '<button type="button"><img src="' + eng_img + '/actions/cancel.png" border="0"> Отменить</button>' +
            '</div>';
          $("<form/>").attr("id", "dvEditTask").addClass("flora").css("text-align", "center")
            .dialog({
              closeOnEscape: false, title: 'Изменение задания', autoOpen: true,
              resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
              height: 130, width: 300
            })
            .html(html)
            .submit(subm)
            .find('select').val(task.attr('data-site-id')).end()
            .find('input[name="date"]').datepicker();
        }
      },
      complete: function () {
        $.unblockUI();
      }
    });

    function subm() {
      var params = {},
        form = this;
      params.gate = this.gate.value;
      params.date = this.date.value + ' ' + this.time.value;
      //params.car = $('#dvCars table').rf$GetFocus().attr('data-car-id');
      params.task = task.attr('data-task-id');
      $.blockUI({message: '<h2>..сохранение..</h2>'});
      $.ajax({
        dataType: "json",
        url: 'editTask',
        data: params,
        success: function (resp) {
          if (!showErr(resp)) {
            task.find('td:eq(1)').text(params.date).end()
              .find('td:eq(2)').text($('option:selected', form.gate).text()).end()
              .attr('data-site-id', params.gate);
            $('#dvEditTask').dialog('close');
          }
        },
        complete: function () {
          $.unblockUI();
        }
      });
      return false;
    }
  }

  function stopPlaning() {
    var task = $(this);
    if ($('#dvCarsDocs table tbody>tr').length == 0) {
      alert('Задание не содержит дочерних, завершение не возможно!');
      return false;
    }
    if (task.attr('data-status-id') != '4') {
      alert('Статус задания не позволяет данного действия!');
      return false;
    }
    if (confirm('Вы действительно хотите закончить формирование задания? \nДанное действие необратимо!')) {
      $.blockUI({message: '<h2>..загрузка..</h2>'});
      $.ajax({
        dataType: "json",
        url: 'stopPlaning',
        data: {task: task.attr('data-task-id')},
        success: function (resp) {
          if (!showErr(resp)) {
            task.attr('data-status-id', '0').find('td:eq(0)').replaceWith($.tdTaskStatus('0'));
          }
        },
        complete: function () {
          $.unblockUI();
        }
      });
    }
  }

  function numUp() {
    var task = $('#dvCarsTasks table').rf$GetFocus();
    $.blockUI({message: '<h2>..загрузка..</h2>'});
    $.ajax({
      dataType: "json",
      url: 'numUp',
      data: {task: task.attr('data-task-id')},
      success: function (resp) {
        if (!showErr(resp)) {
          //task.attr('data-status-id', '0').find('td:eq(0)').replaceWith($.tdTaskStatus('0'));
          var num = task.find('td:eq(3)').text();
          $('#dvCarsTasks table tbody>tr').each(function () {
            if ($(this).find('td:eq(3)').text() == num) $(this).find('td:eq(3)').text(parseInt(num, 10) - 1);
            else if ($(this).find('td:eq(3)').text() == (parseInt(num, 10) - 1).toString()) $(this).find('td:eq(3)').text(num);
          })
        }
      },
      complete: function () {
        $.unblockUI();
      }
    });
  }

  function numDown() {
    var task = $('#dvCarsTasks table').rf$GetFocus();
    $.blockUI({message: '<h2>..загрузка..</h2>'});
    $.ajax({
      dataType: "json",
      url: 'numDown',
      data: {task: task.attr('data-task-id')},
      success: function (resp) {
        if (!showErr(resp)) {
          //task.attr('data-status-id', '0').find('td:eq(0)').replaceWith($.tdTaskStatus('0'));
          var num = task.find('td:eq(3)').text();
          $('#dvCarsTasks table tbody>tr').each(function () {
            if ($(this).find('td:eq(3)').text() == num) $(this).find('td:eq(3)').text(parseInt(num, 10) + 1);
            else if ($(this).find('td:eq(3)').text() == (parseInt(num, 10) + 1).toString()) $(this).find('td:eq(3)').text(num);
          })
        }
      },
      complete: function () {
        $.unblockUI();
      }
    });
  }

  function openCargo() {
    var $d = $("#dvCargo");
    if (!$d.length)
      $("<div/>").attr("id", "dvCargo").addClass("flora")
        .dialog({
          height: $(document.body).height() / 2,
          width: $(document.body).width() / 2,
          title: 'Информация о товарах в документе',
          position: ["left", "bottom"],
          modal: false,
          draggable: true,
          resizable: false,
          overlay: {opacity: 0.5, background: "black"}
        })
        .bind('dialogbeforeclose', function () {
          var offset = $("#dvCargo").parents("div.ui-dialog:first").offset();
          $("#dvCargo").dialog("option", "position", [offset.left, offset.top])
        })
    if (!$("#dvCargo").dialog("isOpen"))
      $("#dvCargo").dialog("open");
    listCargo.call(this);
  }

  function showCargo(){
    var $d = $("#dvCargo");
    if ($d.length>0 && $d.dialog("isOpen")) {
      listCargo.call(this);
    }
  };


  function listCargo(){
    var _this = $(this);

    function trHTML(cg) {
      return '<td title="'+(cg.SGNAME || '')+'">' + (cg.SGCODE || '') + '</td>' +
        '<td class="number wcode">' + cg.WCODE + '</td>' +
        '<td class="text wname">' + cg.WNAME + '</td>' +
        '<td class="uname">' + cg.MUC + '</td>' +
        '<td title="' + viewTitle(cg.MUC, cg.VUF, cg.VUC) + '">' + viewQuantity(cg.AMOUNT, cg.VUF, cg.VUC, cg.MUF, cg.MUC) + '</td>' +
        '<td class="number amount">' + kNumber(cg.AMOUNT, 3) + '</td>' +
        '<td class="number price">' + kFloat(cg.PRICE, 4) + '</td>' +
        '<td class="number docsum">' + kFloat(cg.DOCSUM, 4) + '</td>';
    };

    $("#dvCargo").dialog("option","title","Загрузка").empty();

    $.ajax({
      dataType: "json",
      url: 'getCargo',
      data: {doc: _this.attr('data-doc-id')},
      success: function (resp) {
        if (!showErr(resp)) {
          var html = '<table id="tblDetail"><thead><tr>' +
            '<th>ГО</th><th>Код</th><th>Наименование</th><th>Ед.изм.</th>' + (useviewunit ? '<th>Кол-во</th>' : '') + '<th>Итого</th><th>Цена</th><th>Стоимость</th></tr></thead><tbody>';
          var docsum = 0;
          for (var i = 0; i < resp.data.length; i++) {
            var cg = resp.data[i];
            html += '<tr id="trD_' + resp.data[i].CARGOID + '">' + trHTML(cg) + '</tr>';
            docsum += kFloat(cg.DOCSUM);
          }
          html += '</tbody><tfoot><tr><th>&nbsp;</th><th>' + resp.data.length + '</th>' +
            '<th colspan="5"></th><th>' + kFloat(docsum, 4) + '</th></tfoot></table>';
          $("#dvCargo").dialog('option','title', resp.ext_data.DOCNUM).html(html).find('table').kTblScroll();
        }
      }
    });
  }

  function delTask() {
    var task = $('#dvCarsTasks table').rf$GetFocus();
    if (task.attr('data-status-id') != '4') {
      alert('Задание не позволяет редактирование!');
      return false;
    }
    if ($('#dvCarsDocs table tbody>tr').length > 0) {
      alert('Задание содержит дочерние!');
      return false;
    }
    if (!confirm('Вы действительно хотите удалить данное задание ?')) return false;
    $.blockUI({message: '<h2>..удаление..</h2>'});
    $.ajax({
      dataType: "json",
      url: 'delTask',
      data: {task: task.attr('data-task-id')},
      success: function (resp) {
        if (!showErr(resp)) {
          $('#dvCars table').rfSetFocus($('#dvCars table').rf$GetFocus());
        }
      },
      complete: function () {
        $.unblockUI();
      }
    });
  }

  function delDoc() {
    var doc = $(this);
    var task = $('#dvCarsTasks table').rf$GetFocus();
    //if(task.attr('data-status-id') != '4') {alert('Задание не позволяет редактирование!'); return false;}
    if (!confirm('Вы действительно хотите удалить данное задание ?')) return false;
    $.blockUI({message: '<h2>..удаление..</h2>'});
    $.ajax({
      dataType: "json",
      url: 'clearTask',
      data: {task: task.attr('data-task-id'), ntask: doc.attr('data-task-id')},
      success: function (resp) {
        if (!showErr(resp)) {
          doc.remove();
          $('#dvCarsDocs table').kTblScroll().tablesorter();
          $('#dvMain form').submit();
        }
      },
      complete: function () {
        $.unblockUI();
      }
    });
  }
})();