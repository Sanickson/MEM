Date.prototype.toWHDate = function(){
  return '' + ( (this.getFullYear() > 9) ? this.getFullYear() : '0' + this.getFullYear() ) +
    '-' + ( (this.getMonth() > 8) ? (this.getMonth() + 1) : '0' + (this.getMonth() + 1) ) +
    '-' + ( (this.getDate() > 9) ? this.getDate() : '0' + this.getDate() );
};

function kNullTo(expr,to)
{   return (!expr || expr=='None') ? to : expr; }

function kFloat(expr, precision){   
    if (precision) {
        var number = parseFloat(kNullTo(expr,0)).toFixed(precision);
        if ( /^-0((\.|\,)(0+))?$/.test(number) ) return number.substring(1);        
        else return number;
    }
    else return parseFloat(kNullTo(expr,0)); 
}

function kInt(expr)
{   return parseInt(kNullTo(expr,0),10);}

function kNumber(expr,precision){
    if (!precision) precision=3;
    var eFloat = parseFloat(kNullTo(expr,0));
    if (eFloat){
        var eFloatPrec = parseFloat(eFloat.toFixed(precision));
        i = 0;
        while (i<=precision){
            var res = eFloat.toFixed(i++);
            if (Math.abs(parseFloat(res)-eFloatPrec)<0.00001) return res;
        }        
    }
    return '0';
}

function qStr(Q,VUQ,VUCODE,MUQ,MUCODE){
    var str = '';
    if (kFloat(Q)>0.00001 || kFloat(Q)<-0.00001){
        if (kFloat(VUQ)>0.00001 || kFloat(VUQ)<-0.00001) str += kNumber(VUQ)+' '+VUCODE;
        if (kFloat(MUQ)>0.00001 || kFloat(MUQ)<-0.00001) str += ' '+kNumber(MUQ)+ ' ' + MUCODE;
    }
    else {
        str = '&nbsp;';
    }   
    return str;
};

function viewQuantity(q,viewufactor,viewucode,mainufactor,mainucode,viewamount) {
    viewamount = viewamount||false;
    var amount = q;
    var isminus = false;
    var viewuamount = 0,intviewuamount = 0, mainuamount = 0;
    if(amount<0) {
        amount=-amount;
        isminus = true;
    }
    amount = amount*mainufactor;
    if (viewufactor) viewuamount = amount / viewufactor;
    else { 
        viewuamount = 0
        viewufactor = 0
    }
    intviewuamount = Math.round(viewuamount);
    
    viewuamount = (intviewuamount>viewuamount && Math.abs(intviewuamount-viewuamount)>0.0000001 )?(intviewuamount - 1):intviewuamount;
    mainuamount = amount - viewuamount * viewufactor;
    mainuamount = mainuamount / mainufactor;
    
    if(isminus) {
        viewuamount = -viewuamount;
        mainuamount = -mainuamount;
    }

    switch(viewamount) {
        case false:
            return qStr(amount,viewuamount,viewucode,mainuamount,mainucode);
            break;
        case 1:
            return viewuamount;
            break;
    }
}

function viewTitle(mainucode,viewuamount,viewucode){
    return viewucode+' = '+ kNumber(viewuamount)+' '+mainucode;
}
    
function kDate(dt)
{   if (!dt || dt=='None') return '&nbsp;' 
    else 
    {   var date = dt.split(' ')[0];
        if (date.indexOf('-')>-1)
        {   var d1 = date.split('-')[0];
            var d2 = date.split('-')[1];
            var d3 = date.split('-')[2];
            if (d1.length>2) return d3+'.'+d2+'.'+d1;
            else return d1+'.'+d2+'.'+d3;
        }
        else return date;
    }      
}

function kIncDate(dt,addDay){
    if (!addDay) return dt;
    var dt = $.trim(dt);
    var date = dt.split(' ')[0];
    var separator = false;
    var numstr = '';
    var arr = [];
    for (var i=0; i<date.length; i++){
        var s = date[i];
        if ('0123456789'.indexOf(s)==-1) {
            if (separator && separator!=s) return dt;
            else {
                separator = s;
                arr.push(parseInt(numstr,10));
                numstr = '';
            }
        }
        else {
            numstr += s;
        }
    }
    if (numstr) arr.push(parseInt(numstr,10));
    if (arr.length!=3) return dt;
    
    var d;
    if (separator=='.')
        d = new Date(arr[2],arr[1]-1,arr[0]);
    else
        d = new Date(arr[0],arr[1]-1,arr[2]);
    d = new Date(d.valueOf()+addDay*24*60*60*1000);    
    return '' + ( (d.getDate()>9) ? d.getDate() : '0'+d.getDate() ) +
           '.' +  ( (d.getMonth()>8) ? (d.getMonth()+1) : '0' + (d.getMonth()+1) ) +
           '.' +  ( (d.getFullYear()>9) ? d.getFullYear() : '0' + d.getFullYear() );               
}

function kDateTime(dt)
{   if (!dt || dt=='None') return '&nbsp;' 
    else 
    {   var d = '';        
        var date = dt.split(' ')[0];
        var t = dt.split(' ')[1];
        if (date.indexOf('-')>-1)
        {   var d1 = date.split('-')[0];
            var d2 = date.split('-')[1];
            var d3 = date.split('-')[2];
            if (d1.length>2) d = d3+'.'+d2+'.'+d1;
            else d = d1+'.'+d2+'.'+d3;
        }
        else d = date;
        
        return d+' '+t;
    }      
}

function kFullDate(dt)
{   if (!dt || dt=='None') return '&nbsp;'
    else 
    {   var date = dt.split(' ')[0];
        if (date.indexOf('-')>-1)
        {   var d1 = date.split('-')[0];
            var d2 = date.split('-')[1];
            var d3 = date.split('-')[2];
            if (d1.length>2) return d3+'.'+d2+'.'+d1;
            else return d1+'.'+d2+'.'+d3;
        }
        else return date;
    }      
}

function kToday(addDay)
{   var now = new Date();
    if (addDay) now = new Date(now.valueOf()+addDay*24*60*60*1000);
    return '' + ( (now.getDate()>9) ? now.getDate() : '0'+now.getDate() ) +
           '.' +  ( (now.getMonth()>8) ? (now.getMonth()+1) : '0' + (now.getMonth()+1) ) +
           '.' +  ( (now.getFullYear()>9) ? now.getFullYear() : '0' + now.getFullYear() );           
}
function whToday(addDay) {
  var now = new Date();
    if (addDay) {
        now = new Date(now.valueOf() + addDay * 24 * 60 * 60 * 1000);
    }
  return now.toWHDate();
}

function kNow()
{   var now = new Date();
    return '' + ( (now.getDate()>9) ? now.getDate() : '0'+now.getDate() ) +
           '.' + ( (now.getMonth()>8) ? (now.getMonth()+1) : '0' + (now.getMonth()+1) ) +
           '.' + ( (now.getFullYear()>9) ? now.getFullYear() : '0' + now.getFullYear() ) +
           ' ' + ( (now.getHours()>9) ? now.getHours() : '0' + now.getHours() ) +
           ':' + ( (now.getMinutes()>9) ? now.getMinutes() : '0' + now.getMinutes() ) +
           ':' + ( (now.getSeconds()>9) ? now.getSeconds() : '0' + now.getSeconds() );           
}

function kIntervalToTime(interval) 
{	if (!interval) return '00:00:00';
	var hours,mins,sec;
	interval = interval * 24;
	((kInt(interval)>interval) ? hours = kInt(interval - 1) : hours = kInt(interval) );
	interval = (interval - hours)*60;
	((kInt(interval)>interval) ? mins = kInt(interval - 1) : mins = kInt(interval) );
    sec = kInt((interval - mins)*60);
    ((sec == 60)? sec = 59 : {} );
    return hours+':'+(mins < 10 ? '0'+mins:mins)+':'+(sec < 10 ? '0'+sec:sec); 
}

;(function($) {
    
    $.kGetKeyCode = function(event) { return (event.charCode ? event.charCode : event.keyCode); }    
    $.kIsInt = function(charCode)  {return ( (charCode>=48 && charCode<=57) || (charCode>=96 && charCode<= 105) ); };
    $.kIsFloat = function(charCode) { return (charCode == 46 || charCode == 190 || charCode == 110 || $.kIsInt(charCode)); }
    $.kIsSpecKey = function(charCode) { return (charCode<31 || (charCode>=37 && charCode<=40)); }
    $.kIsMinus = function(charCode) { return (charCode==45); }    
    
    $.kCancelEvent = function(e)
    {   if (e.preventDefault) {   
            //FF, Opera
            e.preventDefault();
            return false;
        }
        e.returnValue = false;
        //IE
    };
    
    $.fn.kInputInt = function(options) {   
        var options = $.extend({textalign:"right",
                                minus:false
                               },options);
        if (options.textalign) $(this).css("text-align",options.textalign);
        $(this).unbind("keydown").bind("keydown",function(e) {   
            var keyCode = $.kGetKeyCode(e);
            if ( options.minus && $.kIsMinus(keyCode) ){
                if ( $(this).val().indexOf('-')==-1 ) $(this).val('-'+$(this).val());
            }
            if ( !$.kIsInt(keyCode) && !$.kIsSpecKey(keyCode) ) $.kCancelEvent(e);
        });
        return this;        
    };
    
    $.fn.kInputFloat = function(options)
    {   var options = $.extend({textalign:"right",minus:false},options);
        if (options.textalign) $(this).css("text-align",options.textalign);
        
        $(this).bind("keypress",function(e)
        {   var keyCode = $.kGetKeyCode(e);
            if (keyCode==44 && $(this).val().indexOf('.')==-1)  {
                //FF-like
                if (typeof e.charCode!='undefined') {
                    var ev = document.createEvent("KeyboardEvent");
                    var code  = '.'.charCodeAt(0);
                    ev.initKeyEvent('keydown',  true, true, window, false, false, false, false, ev.DOM_VK_PERIOD, 0);
                    e.target.dispatchEvent(ev);
                    ev.initKeyEvent('keypress', true, true, window, false, false, false, false, 0, code);
                    e.target.dispatchEvent(ev);
                    ev.initKeyEvent('keyup',    true, true, window, false, false, false, false, ev.DOM_VK_PERIOD, 0);
                    e.target.dispatchEvent(ev);

                    $.kCancelEvent(e);
                    return false;
                }
                //IE
                else if (is_ie) {
                    e.keyCode=46;
                }
                //Opera-like and others
                else if (e.keyCode) {
                    //Левые броузеры
                    if( window.KeyEvent ) {
                        var ev = document.createEvent('KeyEvents');
                        ev.initKeyEvent( 'keydown', true, true, window, false, false, false, false, ev.DOM_VK_PERIOD, 0);
                        e.target.dispatchEvent(ev);        
                        ev.initKeyEvent('keypress', true, true, window, false, false, false, false, 0, code);
                        e.target.dispatchEvent(ev);
                        ev.initKeyEvent('keyup',    true, true, window, false, false, false, false, ev.DOM_VK_PERIOD, 0);
                        e.target.dispatchEvent(ev);
                    } else {
                    //Opera
                        function addchar(result, elem) {
                            var p1 = elem.selectionStart;
                            elem.value = elem.value.substring(0, p1)+result+elem.value.substring(elem.selectionEnd);
                            elem.setSelectionRange(p1+result.length,p1+result.length);
                        }
                  
                        addchar('.', evt.target);

                        //fire events for dispatch entering "."
                        var ev = document.createEvent('UIEvents');
                        ev.initUIEvent( 'keydown', true, true, window, 1 );
                        ev.keyCode = 190;
                        e.target.dispatchEvent(ev);        
                        ev.initUIEvent( 'keypress', true, true, window, 1 );
                        ev.keyCode = 46;
                        e.target.dispatchEvent(ev);        
                        ev.initUIEvent( 'keyup', true, true, window, 1 );
                        ev.keyCode = 190;
                        e.target.dispatchEvent(ev);
                    }
                }
                $.kCancelEvent(e);
                return false;
            }
            if (keyCode==46 && $(this).val().indexOf('.')!=-1) $.kCancelEvent(e);
            
            if ( options.minus && $.kIsMinus(keyCode) ){
                if ( $(this).val().indexOf('-')==-1 ) $(this).val('-'+$(this).val());
            }
            if ( !$.kIsFloat(keyCode) && !$.kIsSpecKey(keyCode) ) $.kCancelEvent(e);
        })

    
        $(this).unbind("keydown").bind("keydown",function(e) {   
            var keyCode = $.kGetKeyCode(e);
            if ( options.minus && $.kIsMinus(keyCode) ){
                if ( $(this).val().indexOf('-')==-1 ) $(this).val('-'+$(this).val());
            }            
            if ( !$.kIsFloat(keyCode) && !$.kIsSpecKey(keyCode) ) $.kCancelEvent(e);
        }); 
        
        return this;
    };
    
    $.fn.printHTML = function(){
        var html = $(this).html();
            html = html.replace(/<button.*?\/button>/ig,'') //Удалили кнопки
            html = html.replace(/<select.*?\/select>/ig,'') //Удалили выпадающие списки
            html = html.replace(/<input.*?</gi,'<'); // Удалил checkbox
            html = html.replace(/<([a-z][a-z0-9]*)[^>]*style=["\'][^>]*?display: ?none;[^>]*?["\'][^>]*?>(.*?)<\/\1>/gi,''); //Удалили не видимые элементы
            html = html.replace(/<img[^>]*alt=["\']([^>]*?)["\'][^>]*?>/gi,'$1'); //заменили картинки на титлы
            html = html.replace(/<img[^>]*?>/gi,''); //заменили картинки без титлов на пустое
            html = html.replace(/ style=["\'].+?["\']/gi,''); //Удалили стили        
        return html;
    };
})(jQuery);
 
 