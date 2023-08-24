;
(function ($) {


  var defaults = {
    id: 'tview_',			    // приставка к id всех элементов плагина
    useviewunit: true,          // использовать единицы отображения
    taskDetail: true,           // детализация задания
    twares: 'getTaskWares',	    // строка-метод, возвращающий товары в задании по taskid
    twareslot: 'getTaskWaresLot',// строка-метод, возвращающий партии по заданию и товару
    tpallet: 'getTaskPallet',	// строка-метод, возвращающий поддоны привязанные к заданию по taskid
    tobject: 'getTaskObject', 	// строка-метод, возвращающий объекты привязанные к заданию по taskid
    ttunit: 'getTaskTUnit',      // единицы транспортировки по заданию
    taskInfo: 'getTaskInfo',     // расширенная информация по заданию
    taskbond: 'listTaskBond',     // связанные задания
    ttara: 'listTaskTara',     // тара задания
    useemployee: false,          // возможность перепривязки сотрудника,
    urlTask: 'listTask',           // список заданий,

    textBan: 'Работа с этими данными запрещена!'
  };

  function TaskManagerView(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;
    this.init();
  }

  TaskManagerView.prototype.init = function () {
    this.element.html('<div id="' + this.options.id + 'tasks" style="float:left;position:relative;width:100%;height:' + (this.options.taskDetail ? '40%' : '100%') + ';"></div>\
                   <div id="' + this.options.id + 'tasks_info" style="' + (!this.options.taskDetail ? 'display:none;' : 'width:100%;height:60%;float:left;position:relative;') + '"></div>')
      .addClass('taskManagerView');
  };
  TaskManagerView.prototype.clear = function () {
    this.options.ttid = false;
    this.options.tmid = false;
    $('#' + this.options.id + 'tasks,#' + this.options.id + 'tasks_info').removeData().empty();
  };
  TaskManagerView.prototype.listTask = function (data) {
    var self = this;
    self.clear();

    var def_params = {
      tasktype: '',
      objid: '',
      dbeg: '',
      tbeg: '',
      dend: '',
      tend: '',
      status: '',
      taskmethod: '',
      taskid: '',
      docid: '',
      zone: '',
      men: ''};
    var params = self.options.urlTask == 'listTask' ? $.extend(def_params, data) : data;
    $.getJSON(self.options.urlTask, params, function (json) {
      if (!showErr(json)) {
        var html = '<table id="' + self.options.id + 'tblTaskes"><thead><tr>\
                                   <th ksort=text title="ШК Документа">Док</th>\
                                   <th ksort=false title="Статус">Ст</th>\
                                   <th ksort=text>Тип</th>\
                                   <th ksort=digit>Номер</th>\
                                   <th ksort=DateTime>Создано</th>\
                                   <th ksort=DateTime>Начато</th>\
                                   <th ksort=DateTime>Завершено</th>\
                                   <th ksort=DateTime>Назначено</th>\
                                   <th ksort=DateTime title="Запланированное начало выполнения">План</th>\
                                   <th ksort=text>МП</th>\
                                   <th ksort=text>Сотрудник</th>\
                                   <th ksort=text title="Алгоритм">А.</th>\
                                   <th ksort=text title="Группа отборки">ГО</th>\
                                   <th ksort=digitt>Вес</th>\
                                   <th ksort=digit>Объем</th>\
                                   <th ksort=digit title="Количество штучных единиц">КШЕ</th>\
                                   <th ksort=digit title="Количество весовых единиц">КВЕ</th>\
                                </tr></thead><tbody>';

        for (var i = 0; i < json.data.length; i++) {
          var r = json.data[i];
          html += '<tr taskid="' + r.TASKID + '" status="' + r.STATUS + '" ttid=' + r.TTYPEID + ' tmid="' + r.TMID + '"' +
            ' id="trT_' + r.TASKID + '" data-dbid="' + (r.DB_ID ? r.DB_ID : '') + '">' +
            '<td class="">' + (kInt(r.DOCID) > 0 ? 'O' + kInt(r.DOCID) : '') + '</td>' +
            (r.STATUS ? $.tdTaskStatus(r.STATUS, r.NAME) : '<td></td>') +
            '<td class="text">' + r.TTNAME + '</td>\
            <td class="">' + r.TASKID + '</td>\
            <td class="">' + r.CREATETIME + '</td>\
            <td class="">' + r.BEGINTIME + '</td>\
            <td class="">' + r.ENDTIME + '</td>\
            <td class="">' + r.ASSIGNTIME + '</td>\
            <td class="">' + r.PLANDATETIME + '</td>\
            <td class="">' + r.SITE + '</td>\
            <td class="text employee">' + r.FULLNAME + '</td>\
            <td class="" title="' + r.ALGNAME + '">' + r.ALGCODE + '</td>\
            <td class="" title="' + r.TSGNAME + '">' + r.TSGCODE + '</td>\
            <td class="number weight">' + kFloat(r.TWEIGHT, 3) + '</td>\
            <td class="number capacity">' + kFloat(r.TCAPACITY, 3) + '</td>\
            <td class="number cntunits">' + kInt(r.TCNTUNITS) + '</td>\
            <td class="number cntunitsw">' + kFloat(r.TCNTUNITSW, 3) + '</td>\
        </tr>';
        }

        html += '</tbody><tfoot class="buttons"><tr>\
                                <th>' + i + '</th><th colspan="16"><button class=printTbl><img src="' + eng_img + '/actions/printer.png"/>Печать</button></th>\
                            </tr></tfoot></table>';

        $('#' + self.options.id + 'tasks').html(html)
          .find('table')
          .kTblScroll()
          .kTblSorter()
          .rowFocus({
            rfSetDefFocus: false,
            rfFocusCallBack: function () {
              initTabs.call(self, this)
            }
          })
          .find('button.printTbl').click(printTbl).end();

        if (self.options.useemployee) {
          $('#' + self.options.id + 'tblTaskes>thead>tr>th.employee')
            .droppable({tolerance: 'mouse',
              accept: function (elem) {
                return $(elem).is("tr");
              },
              drop: function (event, ui) {
                var eid = $(ui.draggable).attr('empid');
                var $tbl = $('#' + self.options.id + 'tblTaskes>tbody>tr');

                function setWorkerAll(index, $progressbar) {
                  if (index < $tbl.length) {
                    var params = {};
                    params.taskid = $($tbl[index]).attr('taskid');
                    params.emplid = eid;
                    $.getJSON('setWorker', params, function (json) {
                      if (!showErr(json)) {
                        $('#' + self.options.id + 'tblTaskes>tbody>tr[taskid="' + json.ext_data.taskid + '"]')
                          .find('>td.employee').text(json.data.EMPLNAME)
                        if ($progressbar)  setWorkerAll(++index, $progressbar.trigger("progressinc"));
                      }
                    });

                  }
                }

                setWorkerAll(0, $.progressbar({maxValue: $tbl.length}))
              }
            })
            .end()
            .find('tbody>tr')
            .droppable({tolerance: 'mouse',
              accept: function (elem) {
                return $(elem).is("tr");
              },
              drop: function (event, ui) {
                var tid = $(ui.element).attr('taskid')
                var eid = $(ui.draggable).attr('empid');
                setWorker(tid, eid);
              }
            })
            .contextMenu({menu: (self.options.useemployee ? mId() : false)}, function (action, el) {
              if (action == 'unLink') setWorker($(el).attr("taskid"), false, true);
              if (action == 'taskStatistics') taskStatistics.call(self, $(el).attr("taskid"), $(el).attr("data-dbid"));
              if (action == 'delete') delTask.call(self, el);
            })
            .find('>td.employee')
            .dblclick(function () {
              if (self.options.useemployee) {
                tblTaskEmployeeInit.call(self)
              }
            }).end()
        }
      }
    });

  };
  function initTabs(tr) {
    var self = this,
      $tr = $(tr), params = {'taskid': $tr.attr('taskid')};

    if ($tr.attr('data-dbid')) {
      params.dbid = $tr.attr('data-dbid');
    }

    if ($('#' + self.options.id + 'tblTaskWaresLot').length)
      $('#' + self.options.id + 'tblTaskWaresLot').dialog('destroy').remove();

    if ($tr.attr('ttid') == self.options.ttid && $tr.attr('tmid') == self.options.tmid) {
      eval($('#' + self.options.id + 'dvTabs li.tabs-selected>a').attr('url') + '.call( self,' + $tr.attr('taskid') + ',' + ($tr.attr('data-dbid') || 'false') + ')');
      return false;
    }
    $.getJSON('listTabs', params, function (json) {
      if (!showErr(json)) {
        $('#' + self.options.id + 'tasks_info').html(
          '<div id="' + self.options.id + 'dvTabs" style="text-align:left;position:relative;height:100%;width:100%;">\
                        <ul>' +
            '<li><a href="#' + self.options.id + 'dvTInfo" url=taskInfo><span>Инфо</span></a></li>' +
            (json.data.TTABSWARESCAPTION ? '<li><a href="#' + self.options.id + 'dvTWares" url=listTaskWares><span>' + json.data.TTABSWARESCAPTION + '</span></a></li>' : '') +
            (json.data.TTABSPALLETCAPTION ? '<li><a href="#' + self.options.id + 'dvTPallet" url=listTaskWaresPallet><span>' + json.data.TTABSPALLETCAPTION + '</span></a></li>' : '') +
            (json.data.TTABSOBJECTSCAPTION ? '<li><a href="#' + self.options.id + 'dvTObject" url=listTaskWaresObj><span>' + json.data.TTABSOBJECTSCAPTION + '</span></a></li>' : '') +
            (json.data.TTABSTUNITCAPTION ? '<li><a href="#' + self.options.id + 'dvTTUnit" url=listTaskWaresTUnit><span>' + json.data.TTABSTUNITCAPTION + '</span></a></li>' : '') +
            (json.data.TTABSTBONDCAPTION ? '<li><a href="#' + self.options.id + 'dvTTBond" url=listTaskBond><span>' + json.data.TTABSTBONDCAPTION + '</span></a></li>' : '') +
            (json.data.TTABSTARACAPTION ? '<li><a href="#' + self.options.id + 'dvTTara" url=listTaskTara><span>' + json.data.TTABSTARACAPTION+ '</span></a></li>' : '') +
            '</ul>' +
            '<div id="' + self.options.id + 'dvTInfo"></div>' +
            (json.data.TTABSWARESCAPTION ? '<div style="position:relative;float:left;width:100%;" id="' + self.options.id + 'dvTWares"></div>' : '') +
            (json.data.TTABSPALLETCAPTION ? '<div id="' + self.options.id + 'dvTPallet"></div>' : '') +
            (json.data.TTABSOBJECTSCAPTION ? '<div id="' + self.options.id + 'dvTObject"></div>' : '') +
            (json.data.TTABSTUNITCAPTION ? '<div id="' + self.options.id + 'dvTTUnit"></div>' : '') +
            (json.data.TTABSTBONDCAPTION ? '<div id="' + self.options.id + 'dvTTBond"></div>' : '') +
            (json.data.TTABSTARACAPTION ? '<div id="' + self.options.id + 'dvTTara"></div>' : '') +
            '</div>'
        );


        var $tbl = $('#' + self.options.id + 'tblTaskes');
        var $tr = $tbl.rf$GetFocus();
        self.options.ttid = $tr.attr('ttid');
        self.options.tmid = $tr.attr('tmid');
        $('#' + self.options.id + 'dvTabs').tabs({
          onShow: function (a) {
            if ($('#' + self.options.id + 'tblTaskWaresLot').length)
              $('#' + self.options.id + 'tblTaskWaresLot').dialog('destroy').remove();

            var $div = $($(a).attr('href'));
            var h = kInt($div.attr('h'));

            $div.height(h);

            if ($tbl.length && $tr.length) {

              eval($(a).attr('url') + '.call( self, ' + $tbl.rf$GetFocus().attr('taskid') + ',' + ($tbl.rf$GetFocus().attr('data-dbid') || 'false') + ')');

            }
          },
          onClick: function (a, target) {
            $(target).empty();
          },
          initial: 0, remoteCount: 0, fxAutoHeight: false
        });
        $('#' + self.options.id + 'dvTabs>div').attr({'h': $('#' + self.options.id + 'tasks_info').height() - $('ul.tabs-nav').height()});
        taskInfo.call(self, $tbl.rf$GetFocus().attr('taskid'), $tbl.rf$GetFocus().attr('data-dbid'));

      }
    })
  }

  function mId() {
    var m = 'menuTblTaskes';
    if ($("#" + m).length == 0)
      $("<ul/>").attr("id", m).addClass("contextMenu")
        .html('<li class="clear"><a href="#unLink">Отвязать</a></li>' +
          '<li class="applicationGo"><a href="#taskStatistics">Статистика</a></li>' +
          '<li class="delete separator"><a href="#delete">Удалить</a></li>'
        )
        .appendTo($(document.body));
    return m;
  }

  function setWorker(tid, eid, fl) {
    fl = fl || false;
    var params = {};
    params.taskid = tid;
    if (fl) params.fl = true;
    else params.emplid = eid;
    $.getJSON('setWorker', params, function (json) {
      if (!showErr(json)) {
        $('#' + self.options.id + 'tblTaskes>tbody>tr[taskid="' + json.ext_data.taskid + '"]>td.employee').text((json.data.EMPLNAME ? json.data.EMPLNAME : ''))
      }
    });
  }

  function printTbl() {
    var $tbl = $(this).parents('table:first');
    var wnd = window.open(sps_reports.TASKMANAGER + '/printTask.html');
    wnd.onload = function () {
      wnd.document.getElementById('info').innerHTML = $tbl.attr('print') ? $tbl.attr('print') : '';
      wnd.document.getElementById('tbldetail').innerHTML = $tbl.printHTML();
    }
  }

  function taskInfo(taskid, dbid) {
    var self = this,
      params = {};
    params.taskid = taskid;
    if (dbid) {
      params.dbid = dbid;
    }
    $.getJSON(self.options.taskInfo, params, function (json) {
      if (!showErr(json)) {

        var r = json.data, ex = json.ext_data;

        var html_doc = '<table><thead><tr>\
                                    <th colspan=2>Документ</th>\
                                </tr></thead><tbody>\
                                    <tr><td class=text>ШК</td><td>' + (r.DOCID ? 'O' + r.DOCID : '') + '</td></tr>\
                                    <tr><td class=text>Тип</td><td>' + r.DOCTYPE + '</td></tr>\
                                    <tr><td class=text>От кого</td><td>' + r.FROMOBJNAME + '</td></tr>\
                                    <tr><td class=text>Через кого</td><td>' + r.THROUGHOBJNAME + '</td></tr>\
                                    <tr><td class=text>Кому</td><td>' + r.TOOBJNAME + '</td></tr>\
                                    <tr><td class=text>Дата</td><td>' + kDate(r.DOCDATE) + '</td></tr>\
                                </tbody>\
                                <tfoot><tr><th colspan=2>&nbsp;</th></tr></tfoot></table>';

        var html_task = '<table>\
                                    <thead>\
                                        <tr>' +
          (ex.KATIMECAPTION ? '<th>' + ex.KATIMECAPTION + '</th>' : '') +
          (ex.KBEGINTIMECAPTION ? '<th>' + ex.KBEGINTIMECAPTION + '</th>' : '') +
          (ex.KENDTIMECAPTION ? '<th>' + ex.KENDTIMECAPTION + '</th>' : '') +
          (ex.KCREATETIMECAPTION ? '<th>' + ex.KCREATETIMECAPTION + '</th>' : '') +
          (ex.OWNERTASKCAPTION ? '<th title="Родительское задание">' + ex.OWNERTASKCAPTION + '</th>' : '') +
          (ex.INFOCAPTION ? '<th title="">' + ex.INFOCAPTION + '</th>' : '') +
          '<th>Зона</th>\
          <th>Вес</th>\
          <th>Объем</th>\
          <th title="Количество учетных единиц">УЕ</th>\
      </tr>\
  </thead>\
  <tbody>\
      <tr>';
        var footColSpan = 0;
        if (ex.KATIMECAPTION) {
          html_task += '<td>' + r.ASSIGNTIME + '</td>';
          footColSpan++;
        }
        if (ex.KBEGINTIMECAPTION) {
          html_task += '<td>' + r.BEGINTIME + '</td>';
          footColSpan++;
        }
        if (ex.KENDTIMECAPTION) {
          html_task += '<td>' + r.ENDTIME + '</td>';
          footColSpan++;
        }
        if (ex.KCREATETIMECAPTION) {
          html_task += '<td>' + r.CREATETIME + '</td>';
          footColSpan++;
        }
        if (ex.OWNERTASKCAPTION) {
          html_task += '<td class="ownertask">' + r.OWNERTASK + '</td>';
          footColSpan++;
        }
        if (ex.INFOCAPTION) {
          html_task += '<td class=text>' + r.INFO + '</td>';
          footColSpan++;
        }
        footColSpan += 4;
        html_task += '<td class=text>' + r.SZNAME + '</td>' +
          '<td class=number>' + kFloat(r.WEIGHT, 3) + '</td>' +
          '<td class=number>' + kFloat(r.CAPACITY, 3) + '</td>' +
          '<td class=number>' + kInt(r.CNTUNITS) + '</td>' +
          '</tr></tbody><tfoot><tr><th colspan=' + footColSpan + '>&nbsp;</th></tr></tfoot></table>';

        $('#' + self.options.id + 'dvTInfo')
          .html('<div style="width:25%;height:100%;float:left;">' + html_doc + '</div>\
                           <div style="width:75%;height:100%;float:left;">' + html_task + '</div>')
          .find('table')
          .kTblScroll()
          .find('td.ownertask').dblclick(function () {
            if (!$(this).text()) {
              return false;
            }
            if ($('#' + self.options.id + 'tblOwnerTask').length) {
              $('#' + self.options.id + 'tblOwnerTask').dialog('destroy').remove();
            }

            var $dv = $("<div/>").attr("id", self.options.id + 'tblOwnerTask').addClass("flora").css("text-align", "center")
              .dialog({closeOnEscape: false, title: 'Родительское задание', autoOpen: true,
                resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
                height: kScreenH() /** 0.95*/, width: kScreenW() /** 0.95*/, position: ['center', 'center']});

            var ownerTaskManagerView = $dv.taskManagerView({
              useviewunit: useviewunit,
              useemployee: true,
              id: 'ownertask_' + $(this).text()
            });
            ownerTaskManagerView.listTask({'taskid': $(this).text()});
          })
      }
    });
  }

  function listTaskWares(taskid, dbid) {
    var self = this;

    function td(caption, mcode, vcode, mfactor, vfactor, amount) {
      return (caption ? (self.options.useviewunit ? ('<td title="' + viewTitle(mcode, vfactor, vcode) + '">' + viewQuantity(amount, vfactor, vcode, mfactor, mcode) + '</td>') : '') + '<td class="number">' + kNumber(amount, 3) + '</td>' : '');
    }

    var params = {taskid: taskid};
    if (dbid) {
      params.dbid = dbid;
    }

    $.getJSON(self.options.twares, params, function (json) {

      if (!showErr(json)) {
        var f_tr = '<th colspan=3>Товар</th>';

        var s_tr = '<th ksort="false">Ст</th><th ksort="digit">Код</th><th ksort="text">Наименование</th>';

        var full_c = 2, cur_c = 0;

        /* задание */
        if (json.ext_data.TWUSERCAPTIONTITLE) {
          s_tr += '<th ksort=text>' + json.ext_data.TWUSERCAPTIONTITLE + '</th>';
          cur_c++;
        }
        if (json.ext_data.KBEGINTIMECAPTION) {
          s_tr += '<th ksort="DateTime">' + json.ext_data.KBEGINTIMECAPTION + '</th>';
          cur_c++;
        }
        if (json.ext_data.KENDTIMECAPTION) {
          s_tr += '<th ksort="DateTime">' + json.ext_data.KENDTIMECAPTION + '</th>';
          cur_c++;
        }

        if (cur_c) {
          f_tr += '<th colspan=' + cur_c + '>Задание</th>';
          full_c += cur_c;
          cur_c = 0;
        }
        /* паллет */
        if (json.ext_data.KPALLETCAPTION) {
          s_tr += '<th ksort="text">' + json.ext_data.KPALLETCAPTION + '</th>';
          cur_c++;
        }
        if (json.ext_data.SITECAPTION) {
          s_tr += '<th ksort="text">' + json.ext_data.SITECAPTION + '</th>';
          cur_c++;
        }

        if (cur_c) {
          f_tr += '<th colspan=' + cur_c + '>Поддон</th>';
          full_c += cur_c;
          cur_c = 0;
        }
        /* quantity */
        if (json.ext_data.KQUANTITYCAPTION) {
          f_tr += '<th colspan=' + (1 + self.options.useviewunit) + '>' + json.ext_data.KQUANTITYCAPTION + '</th>';
          s_tr += (self.options.useviewunit ? '<th ksort="false">Кол-во</th>' : '') + '<th ksort=digit>Итого</th>'
          full_c += 1 + self.options.useviewunit;
        }
        /* scancount */
        if (json.ext_data.KSCANCOUNTCAPTION) {
          f_tr += '<th colspan=' + (1 + self.options.useviewunit) + '>' + json.ext_data.KSCANCOUNTCAPTION + '</th>';
          s_tr += (self.options.useviewunit ? '<th ksort="false">Кол-во</th>' : '') + '<th ksort=digit>Итого</th>'
          full_c += 1 + self.options.useviewunit;
        }
        /* successscan */
        if (json.ext_data.KSUCCESSSCANCAPTION) {
          f_tr += '<th colspan=' + (1 + self.options.useviewunit) + '>' + json.ext_data.KSUCCESSSCANCAPTION + '</th>';
          s_tr += (self.options.useviewunit ? '<th>Кол-во</th>' : '') + '<th ksort=digit>Итого</th>'
          full_c += 1 + self.options.useviewunit;
        }
        /* scanquant */
        if (json.ext_data.KSCANQUANTCAPTION) {
          f_tr += '<th colspan=' + (1 + self.options.useviewunit) + '>' + json.ext_data.KSCANQUANTCAPTION + '</th>';
          s_tr += (self.options.useviewunit ? '<th>Кол-во</th>' : '') + '<th ksort=digit>Итого</th>'
          full_c += 1 + self.options.useviewunit;
        }

        var html = '<table id="' + self.options.id + 'tblTaskWares" print="Таблица товаров, привязанных к заданию №' + taskid + '" tid=' + taskid + '><thead><tr>' +
          f_tr + '</tr><tr>' + s_tr + '</tr></thead><tbody>';

        for (var i = 0; i < json.data.length; i++) {
          var tr = json.data[i];
          var vfactor = tr.VIEWUFACTOR,
            mfactor = tr.MAINUFACTOR,
            mcode = tr.MAINUCODE,
            vcode = tr.VIEWUCODE;
          html += '<tr wid="' + tr.WID + '" twid="' + tr.TWID + '" data-dbid="' + json.ext_data.dbid + '">' +
            (tr.STAT ? $.tdTaskStatus(tr.STAT) : '<td></td>') +
            '<td class="number">' + tr.WCODE + '</td>' +
            '<td class="text">' + tr.WNAME + '</td>' +
            (json.ext_data.TWUSERCAPTIONTITLE ? '<td class="text">' + tr.FULLNAME + '</td>' : '') +
            (json.ext_data.KBEGINTIMECAPTION ? '<td>' + kDateTime(tr.BEGINTIME) + '</td>' : '') +
            (json.ext_data.KENDTIMECAPTION ? '<td>' + kDateTime(tr.ENDTIME) + '</td>' : '') +
            (json.ext_data.KPALLETCAPTION ? '<td class="pnumber">' + tr.NUMBER + '</td>' : '') +
            (json.ext_data.SITECAPTION ? '<td>' + tr.SITENAME + '</td>' : '') +
            td(json.ext_data.KQUANTITYCAPTION, mcode, vcode, mfactor, vfactor, tr.QUANTITY) +
            td(json.ext_data.KSCANCOUNTCAPTION, mcode, vcode, mfactor, vfactor, tr.SCANCOUNT) +
            td(json.ext_data.KSUCCESSSCANCAPTION, mcode, vcode, mfactor, vfactor, tr.SUCCESSSCAN) +
            td(json.ext_data.KSCANQUANTCAPTION, mcode, vcode, mfactor, vfactor, tr.SCANQUANT) +
            '</tr>';
        }


        html += '</tbody><tfoot><tr><th>' + i + '</th><th colspan="' + full_c + '" class="buttons">' +
          '<button><img src="' + eng_img + '/actions/printer.png"/>Печать</button></th></tr></tfoot></table>';

        $('#' + self.options.id + 'dvTWares').html(html)
          .find('table').kTblScroll().kTblSorter().rowFocus({rfSetDefFocus: false})
          .find('tbody>tr')
          .dblclick(function () {
            tblTaskWaresLot.call(self, $(this).attr('twid'), $(this).attr('wid'), $(this).attr('data-dbid'))
          }).end()
          .find('button:first').click(printTbl).end()

      }
    });

  }

  function listTaskTara(taskid, dbid) {
    var self = this;

    function td(caption, mcode, vcode, mfactor, vfactor, amount) {
      return (caption ? (self.options.useviewunit ? ('<td title="' + viewTitle(mcode, vfactor, vcode) + '">' + viewQuantity(amount, vfactor, vcode, mfactor, mcode) + '</td>') : '') + '<td class="number">' + kNumber(amount, 3) + '</td>' : '');
    }

    var params = {taskid: taskid};
    if (dbid) {
      params.dbid = dbid;
    }

    $.getJSON(self.options.ttara, params, function (json) {

      if (!showErr(json)) {
        var html = '<table id="' + self.options.id + 'tblTaskTara" print="Таблица тары, привязанной к заданию №' + taskid + '" tid=' + taskid + '><thead><tr>' +
            '<th>Код</th>'+
            '<th>Наименование</th>'+
            '<th>Количество</th></tr></thead><tbody>';

        for (var i = 0; i < json.data.length; i++) {
          var tr = json.data[i];
          html += '<tr wid="' + tr.WID + '">' +
            '<td class="number">' + tr.WCODE + '</td>' +
            '<td class="text">' + tr.WNAME + '</td>' +
            '<td class="amount">' + kNumber(tr.AMOUNT) + '</td>' +
            '</tr>';
        }


        html += '</tbody><tfoot><tr><th>' + i + '</th><th colspan="2" class="buttons">' +
          '<button><img src="' + eng_img + '/actions/printer.png"/>Печать</button></th></tr></tfoot></table>';

        $('#' + self.options.id + 'dvTTara').html(html)
          .find('table').kTblScroll().kTblSorter().rowFocus({rfSetDefFocus: false})
          .find('button:first').click(printTbl).end()
      }
    });

  }

  function tblTaskEmployeeInit() {
    var self = this;

    function tblTaskEmployee() {
      function events($tbl) {
        $tbl.kTblScroll()
          .tablesorter()
          .rowFocus({rfSetDefFocus: false})
          .find('>tbody>tr')
          .draggable({
            cursor: 'crosshair',
            helper: function (event) {
              return $('<div/>')
                .html($(this).find("td:first").text())
                .css({'position': 'absolute',
                  'z-index': '2000',
                  'font-weight': '800'})
                .appendTo($(document.body));
            },
            helperPos: 'mouse'
          }).end()
          .find('input').change(function () {
            if (activeonly)
              $tbl.find('tbody>tr').removeClass('hide')
            else $tbl.find('tbody>tr').not('.nothide').addClass('hide')
            activeonly = !activeonly;
            $tbl.kTblScroll()
          })
      }

      var params = {};
      params.taskid = $('#' + self.options.id + 'tblTaskes').rf$GetFocus().attr('taskid');
      $.getJSON('getEmployeeList', params, function (JSON) {
        if (!showErr(JSON)) {
          var html = '<table><thead><tr>\
										<th>ФИО</th>\
										<th title="Активность">А</th>\
										<th title="Количество заданий">КЗ</th>\
								</tr></thead><tbody>';
          for (var i = 0; i < JSON.data.length; i++) {
            var tr = JSON.data[i];
            html += '<tr empid="' + tr.IDUSER + '" class="' + ((kInt(tr.SID)) ? 'nothide' : '') + ((activeonly && !kInt(tr.SID)) ? ' hide' : '') + '">\
                                    <td class="text">' + tr.FIO + '</td>\
                                    <td>' + $.iconYesNo(tr.SID) + '</td>\
                                    <td>' + tr.TCOUNT + '</td>\
                                 </tr>';
          }
          html += '</tbody><tfoot><tr>\
                                <th colspan="">Всего: ' + i + '</th>\
                                <th colspan=""><input type="checkbox" ' + (activeonly ? 'checked' : '') + '></th>\
                                <th colspan="">&nbsp;</th>\
                            </tr></tfoot></table>';

          if ($('#' + self.options.id + 'tblTaskEmployee').length) {
            //$('#'+self.options.id+'tblTaskEmployee').dialog('destroy').remove();
            events($('#' + self.options.id + 'tblTaskEmployee')
              .html(html).find('table'))

          }
          else {
            var $dv = $("<div/>").attr("id", self.options.id + 'tblTaskEmployee').addClass("flora").css("text-align", "center")
              .dialog({closeOnEscape: false, title: 'Список сотрудников', autoOpen: true,
                resizable: false, draggable: true, modal: false, overlay: {opacity: 0.5, background: "black"},
                height: 300, width: 350, position: ['left', 'bottom']})
              .bind('dialogclose', function () {
                clearInterval(interval)
                $(this).dialog('destroy').remove()
              })
              .html(html)
              .find('table')
            events($dv)
          }
        }
        else {
          clearInterval(interval);
        }
      });
    }

    var interval = false,
      activeonly = true;
    if (!interval) tblTaskEmployee();
    interval = setInterval(tblTaskEmployee, 6 * 10000);
  }

  function listTaskWaresPallet(taskid, dbid) {
    var self = this;

    function statusPallet(s) {
      if (s == '0') return 'сняли';
      if (s == '1') return 'подтвердили';
      if (s == '2') return 'поставили';
      return 'подтвердили';
    }

    var params = {taskid: taskid};
    if (dbid) {
      params.dbid = dbid;
    }

    $.getJSON(self.options.tpallet, params, function (json) {
      if (!showErr(json)) {
        var html = '<table id="' + self.options.id + 'tblTaskPallet" print="Таблица поддонов, привязанных к заданию №' + taskid + '"><thead><tr>' +
          '<th ksort=false>Статус</th>' +
          '<th ksort=>ИД Поддона</th>' +
          '<th ksort=>ШК</th>' +
          '<th ksort=text>Местоположение</th>' +
          '</tr></thead><tbody>';

        for (var i = 0; i < json.data.length; i++) {
          var tr = json.data[i];
          html += '<tr palletid="' + tr.PALLETID + '">' +
            '<td class="">' + statusPallet(tr.STATUS) + '</td>' +
            '<td>' + tr.PALLETID + '</td>' +
            '<td>' + tr.PBARCODE + '</td>' +
            '<td>' + tr.PSNAME + '</td>' +
            '</tr>'
        }

        html += '</tbody><tfoot><tr><th>' + i + '</th><th colspan="3" class="buttons">\
                            <button><img src="' + eng_img + '/actions/printer.png"/>Печать</button></th></tr></tfoot></table>';
        $('#' + self.options.id + 'dvTPallet').html(html)
          .find('table').kTblScroll().kTblSorter().rowFocus({rfSetDefFocus: false})
          .find('button:first').click(printTbl);

      }
    });
  }

  function listTaskWaresObj(taskid, dbid) {
    var self = this,
      params = {taskid: taskid};
    if (dbid) {
      params.dbid = dbid;
    }
    $.getJSON(self.options.tobject, params, function (json) {
      if (!showErr(json)) {
        var html = '<table id="' + self.options.id + 'tblTaskObject"\
                            print="Таблица объектов, привязанных к заданию №' + taskid + '"><thead><tr>\
                            <th ksort="text">Тип</th>\
                            <th ksort="shortDate">С</th>\
                            <th ksort="shortDate">По</th>\
                            <th ksort="text">Объект</th>\
                        </tr></thead><tbody>';
        for (var i = 0; i < json.data.length; ++i) {
          var tr = json.data[i];
          html += '<tr objid="' + tr.OBJID + '">\
                                <td class="text">' + tr.TBNAME + '</td>\
                                <td>' + tr.DATE1 + '</td>\
                                <td>' + tr.DATE2 + '</td>\
                                <td class="name">' + tr.OBJNAME + '</td>\
                           </tr>';
        }
        html += '</tbody><tfoot><tr><th>' + i + '</th><th colspan="3" class="buttons">\
                            <button><img src="' + eng_img + '/actions/printer.png"/>Печать</button></th></tr></tfoot></table>';
        $('#' + self.options.id + 'dvTObject').html(html)
          .find('table').kTblScroll().kTblSorter().rowFocus({rfSetDefFocus: false})
          .find('button:first').click(printTbl);
      }
    });
  }

  function listTaskWaresTUnit(taskid, dbid) {
    var self = this, params = {};
    params.taskid = taskid;
    if (dbid) {
      params.dbid = dbid;
    }
    $.getJSON(self.options.ttunit, params, function (json) {
      if (!showErr(json)) {
        var html = '<table print="Таблица единиц транспортировки, привязанных к заданию №' + taskid + '"><thead><tr>\
                                <th ksort="false" title="Статус">Ст</th>\
                                <th ksort="text">Сотрудник</th>\
                                <th ksort="text" title="Единица транспортировки">Ед.т.</th>\
                                <th ksort="DateTime">Время</th>\
                                <th ksort="text">Инфо</th>\
                            </tr></thead><tbody>';
        for (var i = 0; i < json.data.length; i++) {
          var tr = json.data[i];
          html += '<tr>\
                                <td class="">' + $.tUnitStatusImgPath(tr.STATUS) + '</td>\
                                <td class="text">' + tr.EMPLNAME + '</td>\
                                <td class="text">' + tr.TUNAME + '</td>\
                                <td class="">' + tr.LASTDATE + '</td>\
                                <td class="text">' + tr.INFO + '</td>\
                            </tr>'
        }
        html += '</tbody><tfoot class=buttons><tr>\
                            <th>' + i + '</th>\
                            <th colspan="4"><button><img src="' + eng_img + '/actions/printer.png"/>Печать</button></th>\
                        </tr></tfoot></table>';
        $('#' + self.options.id + 'dvTTUnit').html(html)
          .find('table')
          .kTblScroll()
          .kTblSorter()
          .find('button:first').click(printTbl)
      }
    })
  }

  function tblTaskWaresLot(twid, wid, dbid) {
    var self = this,
      params = {
        twid: twid,
        wid: wid
      };
    if (dbid && dbid != 'null') {
      params.dbid = dbid;
    }
    $.getJSON(self.options.twareslot, params, function (json) {
      if (!showErr(json)) {
        var html = '<table><thead><tr>\
                                <th ksort="text">Поддон</th>\
                                <th title="Местоположение" ksort="text">МП</th>\
                                <th ksort=>Дата производства</th>\
                                <th ksort="digit">Приход</th>\
                                <th title="Количество" ksort="">Кол-во</th>\
                                <th ksort="digit">Итого</th>\
                                <th ksort=>Дата</th>\
                                <th ksort="text">Сотрудник</th>\
                            </tr></thead><tbody>';
        for (var i = 0; i < json.data.length; i++) {
          var tr = json.data[i];
          html += '<tr>\
                                <td class="">' + tr.PNUMBER + '</td>\
                                <td class="">' + tr.SNAME + '</td>\
                                <td class="">' + kDate(tr.PDATE) + '</td>\
                                <td class="">' + tr.WLINCID + '</td>\
                                <td title="' + viewTitle(tr.MAINUCODE, tr.VIEWUFACTOR, tr.VIEWUCODE) + '">' + viewQuantity(tr.QUANTITY, tr.VIEWUFACTOR, tr.VIEWUCODE, tr.MAINUFACTOR, tr.MAINUCODE) + '</td>\
                                <td class="number">' + kNumber(tr.QUANTITY) + '</td>\
                                <td class="">' + tr.LDATE + '</td>\
                                <td class="text">' + tr.FULLNAME + '</td>\
                            </tr>';
        }
        html += '</tbody><tfoot><tr><th>' + i + '</th><th colspan="7">&nbsp;</th></tr></tfoot></table>';

        var $dv = $('#' + self.options.id + 'tblTaskWaresLot')
        if (!$dv.length) {
          $dv = $("<div/>").attr("id", self.options.id + 'tblTaskWaresLot').addClass("flora").css("text-align", "center")
            .dialog({closeOnEscape: false, title: json.ext_data.CODE + '&nbsp;' + json.ext_data.WNAME, autoOpen: true,
              resizable: false, draggable: true, modal: false, overlay: {opacity: 0.5, background: "black"},
              height: kScreenH() / 2, width: kScreenW() / 2, position: ['right', 'bottom']})
        }
        else {
          $dv.dialog('open')
        }

        $dv.html(html)
          .find('table')
          .kTblScroll()
          .kTblSorter()
          .rowFocus({rfSetDefFocus: false})


      }
    });
  }

  function listTaskBond(taskid, dbid) {
    var self = this, params = {};
    params.taskid = taskid;
    if (dbid) {
      params.dbid = dbid;
    }
    $.getJSON(self.options.taskbond, params, function (json) {
      if (!showErr(json)) {
        var html = '<table><thead><tr>\
                                <th ksort=text title="Документ">Док</th>\
                                <th ksort=false>Статус</th>\
                                <th ksort=text>Тип</th>\
                                <th ksort=digit>Номер</th>\
                                <th ksort=DateTime>Создано</th>\
                                <th ksort=DateTime>Начато</th>\
                                <th ksort=DateTime>Завершено</th>\
                                <th ksort=text>МП</th>\
                                <th ksort=text>Сотрудник</th>\
                            </tr></thead><tbody>';
        for (var i = 0; i < json.data.length; i++) {
          var tr = json.data[i];
          html += '<tr tid="' + tr.TASKID + '">\
                                 <td class="">O' + tr.DOCID + '</td>' +
            $.tdTaskStatus(tr.TSTATUS) +
            '<td class="text">' + tr.TTNAME + '</td>\
                                <td class="">' + tr.TASKID + '</td>\
                                 <td class="">' + tr.CTIME + '</td>\
                                 <td class="">' + tr.BTIME + '</td>\
                                 <td class="">' + tr.ETIME + '</td>\
                                 <td class="">' + tr.SNAME + '</td>\
                                 <td class="text">' + tr.EMPNAME + '</td>\
                            </tr>';
        }
        html += '</tbody><tfoot><tr><th>' + i + '</th><th colspan="8">&nbsp;</th></tr></tfoot></table>';

        $('#' + self.options.id + 'dvTTBond').html(html)
          .find('table')
          .kTblScroll()
          .kTblSorter()
          .rowFocus({rfSetDefFocus: false})
          .find('tbody>tr').dblclick(function () {
            if ($('#'+self.options.id + 'tblBondTask').length) {
              $('#'+self.options.id + 'tblBondTask').dialog('destroy').remove();
            }

            var $dv = $("<div/>").attr("id", self.options.id + 'tblBondTask').addClass("flora").css("text-align", "center")
              .dialog({closeOnEscape: false, title: 'Свяанные задания - ' + $(this).attr('tid'), autoOpen: true,
                resizable: false, draggable: false, modal: true, overlay: {opacity: 0.5, background: "black"},
                height: kScreenH() /** 0.95*/, width: kScreenW() /** 0.95*/, position: ['center', 'center']});

            var bondTaskManagerView = $dv.taskManagerView({
              useviewunit: useviewunit,
              useemployee: true,
              id: 'bondtask_' + $(this).attr('tid')
            });
            bondTaskManagerView.listTask({'taskid': $(this).attr('tid')});

          });


      }
    });
  }

  function taskStatistics(taskid, dbid) {
    var self = this;
    if ($('#frmTaskStatistics'))
      $('#frmTaskStatistics').dialog('destroy').remove();

    var params = {taskid: taskid};
    if (dbid) {
      params.dbid = dbid;
    }

    $.getJSON('getTaskStatistics', params, function (json) {
      if (!showErr(json)) {

        var t = json.data;
        $("<form/>").attr("id", "frmTaskStatistics").attr("data-taskid", t.TID)
          .addClass("flora").css("text-align", "center")
          .dialog({closeOnEscape: false, title: t.TID, autoOpen: true,
            resizable: false, draggable: true, modal: false, overlay: {opacity: 0.5, background: "black"},
            height: 200, width: 300})
          .html('<div>Вес: ' + kFloat(t.TWEIGHT, 3) + ' --> ' +
            '<input size=6 type="text" name="weight" value="' + kFloat(t.NWEIGHT, 3) + '"></div>' +
            '<div>Объем: ' + kFloat(t.TCAPACITY, 3) + ' --> ' +
            '<input size=6 type="text" name="capacity" value="' + kFloat(t.NCAPACITY, 3) + '"></div>' +
            '<div>КШЕ: ' + kInt(t.TCNTUNITS) + ' --> ' +
            '<input size=6 type="text" name="cntunits" value="' + kInt(t.NCNTUNITS, 3) + '"></div>' +
            '<div>КВЕ: ' + kFloat(t.TCNTUNITSW, 3) + ' --> ' +
            '<input size=6 type="text" name="cntunitsw" value="' + kFloat(t.NCNTUNITSW, 3) + '"></div>' +
            '<hr>' +
            '<div style="width:100%;" class="buttons">' +
            '<button type="submit">' +
            '<img src="' + eng_img + '/actions/accept.png" border="0">Сохранить' +
            '</button>&nbsp;&nbsp;&nbsp;' +
            '<button type="button">' +
            '<img src="' + eng_img + '/actions/cancel.png" border="0">Отмена' +
            '</button>' +
            '</div>')
          .submit(function (e) {
            e.preventDefault();
            if (dbid) {
              showMes('Внимание', self.options.textBan);
              return false;
            }
            var param = $(this).kFormSubmitParam();
            param.taskid = $(this).attr('data-taskid');
            $.getJSON('setTaskStatistics', param, function (json) {
              if (!showErr(json)) {
                $("#frmTaskStatistics").dialog('close');
                var t = json.data;
                $('#trT_' + t.TID)
                  .find('>td.weight').text(kFloat(t.TWEIGHT, 3)).end()
                  .find('>td.capacity').text(kFloat(t.TCAPACITY, 3)).end()
                  .find('>td.cntunits').text(kInt(t.TCNTUNITS)).end()
                  .find('>td.cntunitsw').text(kFloat(t.TCNTUNITSW, 3)).end()
                  .parents('table:first').kTblSorter();
                //$('#' +self.options.id + 'tblTaskes').kTblSorter();
              }
            });
            return false;
          })
          .find("button:last").click(function () {
            $("#frmTaskStatistics").dialog("close");
          }).end()
          .find('input[name=weight],input[name=capacity],input[name=cntunitsw]').kInputFloat().end()
          .find('input[name=cntunits]').kInputInt().end();
      }
    })
  }

  function delTask($tr) {
    var self = this;
    if ($tr.attr('data-dbid')) {
      showMes('Внимание', self.options.textBan);
      return false;
    }
    $tr.showConf({
      text: 'Вы действительно хотите удалить задание ?',
      confirm: function () {
        $.getJSON('deltask', {taskid: $tr.attr('taskid')}, function (json) {
          if (!showErr(json)) {
            var $tbl = $tr.parents('table:first');
            $tr.remove();
            $tbl.kTblScroll();
            $('#' + self.options.id + 'dvTabs>div').empty();
            var $cntTask = $tbl.find('>tfoot>tr>th:first');
            $cntTask.html(parseInt($cntTask.html(), 10) - 1);
          }
        });
      }
    });
  }

  $.fn.taskManagerView = function (options) {
    return new TaskManagerView(this, options);
  };


}(jQuery));