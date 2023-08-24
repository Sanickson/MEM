(function ($) {

  $.fn.kTdChkSet = function (nVal) {
    nVal = nVal ? 1 : 0;
    return this.each(function () {
      var $this = $(this), $chk = false;
      if ($this.is("input:checkbox")) $chk = $this;
      else if ($this.is("td")) $chk = $this.find(">input:checkbox");
      if ($chk && nVal !== ( $chk.attr("checked") ? 1 : 0 )) $chk.parents("td:first").trigger("click");
    });
  };

  $.fn.kTdChk = function (options) {
    var options = $.extend({className: "chk", onTdChange: false}, options);

    function tdChkClick(e, $summary) {
      var diff = $(this).attr("checked") ? 1 : -1;
      if ($summary && $summary.length) {
        $summary.text(kInt($summary.text()) + diff);
      }
      if (typeof options.onTdChange == 'function') options.onTdChange.call($(this));
      e.stopPropagation();
    };

    function tdClick(e, $summary) {
      var $chk = $(this).find("input:checkbox"), diff = 0;
      if ($chk.attr("checked")) {
        $chk.removeAttr("checked");
        diff = -1;
      }
      else {
        $chk.attr("checked", "checked");
        diff = 1;
      }

      if ($summary && $summary.length) {
        $summary.text(kInt($summary.text()) + diff);
      }
      e.stopPropagation();
      if (typeof options.onTdChange == 'function') options.onTdChange.call($chk);
    };

    if (this.is("table")) {

      var $summary = this.find(">tfoot>tr>th." + options.className);
      if ($summary.length) $summary.text('0');

      this.find('thead>tr>th.' + options.className).click(function (e) {
        var $chk = $(this).find("input:checkbox");
        var chk = $chk.attr("checked") ? false : true;
        e.stopPropagation();
        $(this).parents("table:first").find(">tbody>tr:visible>td." + options.className + ">input:checkbox").kTdChkSet(chk);
        if (!chk) $chk.removeAttr("checked");
        else $chk.attr("checked", "checked");
      })
        .find('input:checkbox').click(function (e) {
          var chk = $(this).attr("checked") ? true : false;
          e.stopPropagation();
          $(this).parents("table:first").find(">tbody>tr:visible>td." + options.className + ">input:checkbox").kTdChkSet(chk);
        });

      this.find('tbody td.' + options.className).each(function () {
        var $chk = $(this).find("input:checkbox");
        if ($chk.length > 0) {
          $(this).click(function (e) {
            tdClick.call(this, e, $summary);
          });
          $chk.click(function (e) {
            tdChkClick.call(this, e, $summary);
          });
        }
      });
    }
    else if (this.is("tr")) {
      var $summary = this.parents("table:first").find(">tfoot>tr>th." + options.className);
      this.find('>td.' + options.className).each(function () {
        var $chk = $(this).find("input:checkbox");
        if ($chk.length > 0) {
          $(this).click(function (e) {
            tdClick.call(this, e, $summary);
          });
          $chk.click(function (e) {
            tdChkClick.call(this, e, $summary);
          });
        }
      });
    }
    else if (this.is("td") && this.hasClass(options.className)) {
      var $summary = this.parents("table:first").find(">tfoot>tr>th." + options.className);
      this.find('>input').each(function () {
        if ($(this).hasClass(options.className)) {
          var $chk = $(this).find("input:checkbox");
          if ($chk.length > 0) {
            $(this).click(function (e) {
              tdClick.call(this, e, $summary);
            });
            $chk.click(function (e) {
              tdChkClick.call(this, e, $summary);
            });
          }
        }
      });
    }
    return this;
  };

  $.fn.kTdChkGet = function (className) {
    if (!className) className = 'chk';
    return this.find(">tbody>tr:visible>td." + className + ">input:checkbox[checked]");
  };
})(jQuery);