;
(function ($) {

  /**
   * Mark text using text color and background color
   * @param text string
   * @param options object
   * @returns object
   */
  /*$.fn.kMarkText = function(text, options){
   options = $.extend({
   tColor: 'white',
   bColor: 'blue'
   }, options);
   var regex = new RegExp('(' + text + ')', 'ig');
   return this.each(function () {
   $(this).contents().filter(function() {
   return this.nodeType == 3 && regex.test(this.nodeValue);
   }).each(function() {
   var str = this.nodeValue;
   $(this).replaceWith(str.replace(regex, '<span rel="textMark" style="background-color: ' + options.bColor +
   ';color: ' + options.tColor + '">$1</span>'));
   });
   });
   };*/

  $.fn.kMarkText = function (text, options) {
    options = $.extend({
      tColor: 'white',
      bColor: 'blue'
    }, options);
    //'<([\\w]+)[^>]*>(.*?)<\\/\1>';
    return this.each(function () {
      var regexp = new RegExp('(' + text + ')', 'ig');
      var html = $(this).html();
      html = html.replace(regexp, '<span rel="textMark" style="background-color: ' + options.bColor +
        ';color: ' + options.tColor + '">$1</span>');
      $(this).html(html);
      return this;
    });
  }

  /**
   * Unmark text
   * @returns object
   */
  $.fn.kUnmarkText = function () {
    return this.each(function () {
      var regexp = new RegExp('<span rel="textMark".*?>(.*?)</span>', 'ig')
      var html = $(this).html();
      html = html.replace(regexp, '$1');
      $(this).html(html);
      return this;
    });
  }

  /**
   * Load options for SELECT form input element
   * @param url string
   * @param data object
   * @param options object
   * @returns object
   */
  $.fn.kLoadOptions = function (url, data, options) {
    var $obj = this;
    $.getJSON(url, data, function (json) {
      var html = '';
      if (!showErr(json) && json.data.length > 0) {
        options = $.extend({
          key: Object.keys(json.data[0])[0],
          value: Object.keys(json.data[0])[1],
          addEmpty: false,
          emptyVal: '',
          defVal: null,
          extAttr: false
        }, options);
        var key1 = options.key;
        var key2 = options.value;
        if (options.addEmpty) {
          html += '<option value="">' + options.emptyVal + '</option>';
        }
        for (var i = 0; i < json.data.length; i++) {
          var row = json.data[i];
            var extAttr = '';
            if (options.extAttr) {
              if (typeof options.extAttr == 'function'){
                extAttr = options.extAttr(row);
              }
              else {
                extAttr = options.extAttr;
              }
            }
            if (options.defVal == row[key1]) {
                html += '<option selected value="' + row[key1] + '"' + extAttr + '>' + row[key2] + '</option>';
            } else {
                html += '<option value="' + row[key1] + '"' + extAttr + '>' + row[key2] + '</option>';
            }
        }
      }
      $obj.html(html);
    });
    return this;
  }

  $.fn.kFormSubmitParam = function (O) {

    var O = $.extend({nullVal: 'None'}, O)
    var param = {};
    this.each(function(){
      if ($(this).is('form') || $(this).is('div')){
        $(this).find('*[name]').each(function () {
          var val = $(this).attr('data-val') ? $(this).attr('data-val') : $(this).val();
          if (O.nullVal === false || val != O.nullVal) {
            param[$(this).attr('name')] = val;
          }
        });
      }
      else{
        var paramname = $(this).attr('name');
        if (paramname){
          var val = $(this).attr('data-val') ? $(this).attr('data-val') : $(this).val();
          if (O.nullVal === false || val != O.nullVal) {
            param[paramname] = val;
          }
        }
      }
    })
    return param;
  };

  $.fn.kFormFilter = function () {
    return this.css("width", "100%")
      .find("table").css("width", "100%").end()
      .find("select").css("width", "100%").end()
      .find("input").not(":checkbox").each(function () {
        var $input = $(this);
          if ($input.parents("td").find("input").length == 1) {
              $input.css("width", "96%").focus(function () {
                  $(this).select();
              });
          } else {
              $input.css("width", "47%");
          }
      }).end().end();
  };

  $.kScreen = function (options) {
    var options = $.extend({
      setHeight: true,
      setNoContext: true,
      CSS: false,
      result: "height"
    }, options);
    var $kScreen = $("#container-content");
      if (options.setNoContext && typeof $.fn.noContext == 'function') {
          $kScreen.noContext();
      }
      if (options.CSS) {
          $kScreen.css(options.CSS);
      }
    if (options.setHeight) {
      var footerOffset = $("#container-footer").offset();
      var bodyOffset = $kScreen.offset();
      var diff = $("#container-content-wrapper").height() - $kScreen.height();
      $("#container-content-wrapper").css({"height": footerOffset.top - bodyOffset.top});
      $kScreen.css({"height": footerOffset.top - bodyOffset.top - diff});
    }
      if (options.result == 'height') {
          return $kScreen.height();
      } else if (options.result == '$') {
          return $kScreen;
      } else {
          return $kScreen;
      }
  };

  $.kStatusBar = function (id) {
      if ($('#' + id).length) {
          return $('#' + id)
      }
    $('#container-footer').prepend($('<span/>').attr('id', id).css({'position': 'absolute'}));
    return $('#' + id)
  };

  $.addInfo = function (html) {
      if (html) {
          var $ai = $('#addinfo');
          if (!$ai.length) {
              $ai = $('<div/>').attr('id', 'addinfo').prepend($("#container-head"));
          }
          $ai.html(html);
      }
      else {
          return $('#addinfo').html();
      }
  };

  $.fn.dialogSpaceH = function () {
    var $dvDialog = this.parents('div.ui-dialog:first');
    var $dvTitle = $dvDialog.find('div.ui-dialog-titlebar:first');
    return $dvDialog.outerHeight() - $dvTitle.outerHeight();
  };

})(jQuery);

/**
 * Возвращает высоту доступную для контента
 * @returns {number}
 */
function kScreenH() {
    if (typeof $.fn.noContext == 'function') {
        $("#container-content").noContext();
    }
  var footerOffset = $("#container-footer").offset();
  var bodyOffset = $("#container-content").offset();
  var diff = $("#container-content-wrapper").height() - $("#container-content").height();
  $("#container-content-wrapper").css({"height": footerOffset.top - bodyOffset.top});
  //kast
  container_content_h = footerOffset.top - bodyOffset.top - diff;
  $("#container-content").css({"height": container_content_h/*,'width':$("#container-content").width()+'px'*/});
  $('#container-user-bar-accordion').css({'position': 'absolute', 'right': '0', 'z-index': '10'});
  return container_content_h;
};

/**
 * Возвращает ширину контенйнера
 * @returns {number}
 */
function kScreenW() {
  return $("#container-content").width();
}


;(function($) {
    var idSeparator = '_';

    $.kID = function(prefix,id){
        if (prefix && id) return prefix+idSeparator+id;
        if (prefix) return prefix.split(idSeparator)[1];
        if (id) return id.split(idSeparator)[1];
        return '';
    };

    $.fn.kID = function(prefix,id){
        if (id) return this.attr('id',(prefix ? prefix+idSeparator : '')+id);
        if (prefix) return this.attr('id',prefix);
        return $.kID(this.attr("id"));
    };
})(jQuery);