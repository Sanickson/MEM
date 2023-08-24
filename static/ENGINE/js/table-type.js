/**
 * Created by serov.a on 02.06.2017.
 */

utilFunc = (function(){
  //Утилиты
  function uNullTo(expr, to) {
    return (!expr || expr == "None") ? to : expr;
  }

  function uFloat(expr, precision) {
    if (precision) {
      const n = parseFloat(uNullTo(expr, 0)).toFixed(precision);
      if (/^-0((\.|\,)(0+))?$/.test(n)) {
        return n.substring(1);
      }
      else {
        return n;
      }
    }
    else {
      return parseFloat(uNullTo(expr, 0));
    }
  }

  function uInt(expr) {
    return parseInt(uNullTo(expr, 0), 10);
  }

  function uNumber(expr, precision) {
    const prec = precision || 3;
    var eFloat = parseFloat(uNullTo(expr, 0));
    if (eFloat) {
      var eFloatPrec = parseFloat(eFloat.toFixed(prec));
      i = 0;
      while (i <= prec) {
        var res = eFloat.toFixed(i++);
        if (Math.abs(parseFloat(res) - eFloatPrec) < 0.00001) {
          return res;
        }
      }
    }
    return "0";
  }

  function uDate(dt) {
    if (!dt || dt == "None") {
      return "&nbsp;";
    }
    else {
      var d = dt.split(" ")[0];
      var dSpl = d.split("-")
      if (dSpl.length > 1) {
        var d1 = dSpl[0];
        var d2 = dSpl[1];
        var d3 = dSpl[2];
        if (d1.length > 2) {
          return [d3, d2, d1].join(".");
        }
        else {
          return [d1, d2, d3].join(".");
        }
      }
      else {
        return d;
      }
    }
  }

  function uDateTime(dt) {
    if (!dt || dt == "None") {
      return "&nbsp;";
    }
    else {
      return uDate(dt.split(" ")[0]) + " " + dt.split(" ")[1];
    }
  }

  function uTime(dt) {
    if (!dt || dt == "None") {
      return "&nbsp;";
    }
    else {
      return dt.split(' ')[1];
    }
  }

  function waresAmountStr(Q, VUQ, VUCODE, MUQ, MUCODE) {
    var str = "";
    if (uFloat(Q) > 0.00001 || uFloat(Q) < -0.00001) {
      if (uFloat(VUQ) > 0.00001 || uFloat(VUQ) < -0.00001) {
        str += uNumber(VUQ) + " " + VUCODE;
      }
      if (uFloat(MUQ) > 0.00001 || uFloat(MUQ) < -0.00001) {
        str += " " + uNumber(MUQ) + " " + MUCODE;
      }
    }
    else {
      str = "&nbsp;";
    }
    return str;
  }

  function waresAmountView(q, viewufactor, viewucode, mainufactor, mainucode) {
    var amount = q;
    var isminus = false;
    var viewuamount = 0;
    if (amount < 0) {
      amount = -amount;
      isminus = true;
    }
    amount = amount * mainufactor;
    if (viewufactor) {
      viewuamount = amount / viewufactor;
    }
    else {
      viewuamount = 0
      viewufactor = 0
    }
    var intviewuamount = Math.round(viewuamount);
    viewuamount = (intviewuamount > viewuamount && Math.abs(intviewuamount - viewuamount) > 0.0000001 ) ? (intviewuamount - 1) : intviewuamount;
    var mainuamount = amount - viewuamount * viewufactor;
    mainuamount = mainuamount / mainufactor;
    if (isminus) {
      viewuamount = -viewuamount;
      mainuamount = -mainuamount;
    }
    return waresAmountStr(amount, viewuamount, viewucode, mainuamount, mainucode);
  }

  function waresAmountTitle(mucode, vufactor, vucode) {
    return vucode + " = " + uNumber(vufactor) + " " + mucode;
  }

  function filenamePath(pathfile) {
    var lastIndex = pathfile.lastIndexOf("/");
    return pathfile.substring(lastIndex+1);
  }

  return {
    int: uInt,
    float: uFloat,
    number: uNumber,
    date: uDate,
    dateTime: uDateTime,
    time: uTime,
    nullTo: uNullTo,
    waresAmountTitle: waresAmountTitle,
    waresAmountView: waresAmountView,
    waresAmountStr: waresAmountStr,
    filenamePath: filenamePath
  };
})();

tblCfgFunc = (function(){
  // Функции по умолчанию
  function tdChk(tr, fld) {
    return tr[fld] ? "<td class='chk'>" +
    "<input type='checkbox'" + (tr.CHECKED ? " checked" : "") + (tr.DISABLED ? " disabled" : "") + "></td>" : "<td></td>";
  }
  function tdDateTime(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td" + (tr[fldClass] ? " class='" + tr[fldClass] + "'" : "") + ">" + utilFunc.dateTime(tr[fld]) + "</td>";
  }
  function tdDate(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td" + (tr[fldClass] ? " class='" + tr[fldClass] + "'" : "") + ">" + utilFunc.date(tr[fld]) + "</td>";
  }
  function tdTime(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td" + (tr[fldClass] ? " class='" + tr[fldClass] + "'" : "") + ">" + utilFunc.time(tr[fld]) + "</td>";
  }
  function tdCode(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td" + (tr[fldClass] ? " class='" + tr[fldClass] + "'" : "") + ">" + tr[fld] + "</td>";
  }
  function tdCodeNumber(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td class='number" + (tr[fldClass] ? tr[fldClass] : "") + "'>" + tr[fld] + "</td>";
  }
  function tdText(tr, fld) {
    const fldTitle = fld + "TITLE";
    const fldClass = fld + "CLASS";
    return "<td class='text " + (tr[fldClass] ? tr[fldClass] : "") + "'" + (tr[fldTitle] ? " title='" + tr[fldTitle] + "'" : "") + ">" + tr[fld] + "</td>";
  }
  function tdName(tr, fld) {
    var fldClass = fld + "CLASS";
    return "<td class='text " + (tr[fldClass] ? tr[fldClass] : "") + "'>" + tr[fld] + "</td>";
  }
  function tdInt(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td class='number " + (tr[fldClass] ? tr[fldClass] : "") + "'>" + utilFunc.int(tr[fld]) + "</td>";
  }
  function tdNumber(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td class='number " + (tr[fldClass] ? tr[fldClass] : "") + "'>" + utilFunc.number(tr[fld]) + "</td>";
  }
  function tdCodeName(tr, fld) {
    const fldName = fld.replace("CODE", "NAME");
    const fldCode = fld.replace("NAME", "CODE");
    const fldClass = fld + "CLASS";
    return "<td" + (tr[fldClass] ? " class='" + tr[fldClass] + "'" : "") + (tr[fldName] ? " title='" + tr[fldName] + "'" : "") + ">" + tr[fldCode] + "</td>";
  }
  function tdAmount(tr, fld) {
    const fldClass = fld + "CLASS";
    const kN = utilFunc.number(tr[fld]);
    var title = "";
    if (tr.MUC) {
      title = " title='" + utilFunc.waresAmountView(kN, tr.VUF, tr.VUC, tr.MUF, tr.MUC);
    }
    const fldTitle = fld + "TITLE";
    if (tr[fldTitle]) {
      if (title){
        title += "\n";
      }
      title += tr[fldTitle];
    }
    title += "'";
    return "<td class='number" + (tr[fldClass] ? " " + tr[fldClass] : "") + "'" + title + ">" + kN + "</td>";
  }
  function tdAmountStr(tr, fld) {
    const fldClass = fld + "CLASS";
    const kN =utilFunc.number(tr[fld]);
    var title = "";
    if (tr.MUC) {
      title = " title='" + utilFunc.waresAmountTitle(tr.MUC, tr.VUF, tr.VUC);
    }
    const fldTitle = fld + "TITLE";
    if (tr[fldTitle]) {
      if (title)
        title += "\n";
      title += tr[fldTitle];
    }
    title += "'";
    return "<td " + (tr[fldClass] ? " class='" + tr[fldClass] + "'" : "") + title + ">" + utilFunc.waresAmountView(kN, tr.VUF, tr.VUC, tr.MUF, tr.MUC) + "</td>";
  }
  function tdQStr(tr, fld) {
    const fldClass = fld + "CLASS";
    const kN = utilFunc.number(tr[fld]);
    var title = "";
    if (tr.MUC) {
      title = " title='" + utilFunc.waresAmountTitle(tr.MUC, tr.VUF, tr.VUC) + "'";
    }
    return "<td " + (tr[fldClass] ? " class='" + tr[fldClass] + "'" : "") + title + ">" + utilFunc.waresAmountStr(kN, tr.VUA, tr.VUC, tr.MUA, tr.MUC) + "</td>";
  }
  function tdPlusMinus(tr, fld) {
    const fldClass = fld + "CLASS";
    const fldTitle = fld + "TITLE";
    return "<td data-val='" + tr[fld] + "'" + (tr[fldClass] ? " class='" + tr[fldClass] + "'" : "") + (tr[fldTitle] ? " title='" + tr[fldTitle] + "'" : "") + ">" +
      $.iconPlusMinus(tr[fld] != "0", tr[fldTitle]) + "</td>";
  }
  function tdDocBarcode(tr, fld) {
    return "<td>O" + uInt(tr[fld]) + "</td>";
  }
  function tdFloat1(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td class='number" + (tr[fldClass] ? " " + tr[fldClass] : "") + "'>" + utilFunc.float(tr[fld], 1) + "</td>";
  }
  function tdFloat2(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td class='number" + (tr[fldClass] ? " " + tr[fldClass] : "") + "'>" + utilFunc.float(tr[fld], 2) + "</td>";
  }
  function tdFloat0(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td class='number" + (tr[fldClass] ? " " + tr[fldClass] : "") + "'>" + utilFunc.float(tr[fld], 0) + "</td>";
  }
  function tdWaresUnit(tr, fld) {
    var fldClass = fld + "CLASS";
    return "<td " + (tr[fldClass] ? " class='" + tr[fldClass] + "'" : "") + ">" + (tr.VUC ? tr.VUC + "=" + utilFunc.number(tr.VUF) : "") + tr.MUC + "</td>";
  }
  function tdDocStatus(tr, fld) {
    return $.tdDocStatus(tr[fld], tr[fld + "TITLE"]);
  }
  function tdTaskStatus(tr, fld) {
    var title = "";
    if (tr[fld + "TITLE"]) {
      title = tr[fld + "TITLE"];
    }
    if (tr.TSTNAME || tr.TID || tr.TFIO) {
      title = (tr.TSTNAME ? "Статус: " + tr.TSTNAME + "\n" : "") +
        (tr.TID ? "Задание №" + tr.TID + "\n" : "") +
        (tr.TFIO ? "Пользователь: " + tr.TFIO : "");
    }
    return $.tdTaskStatus(tr[fld], title);
  }
  function tdNullTo(tr, fld) {
    var fldClass = fld + "CLASS";
    return "<td class='number " + (tr[fldClass] ? tr[fldClass] : "") + "'" + ">" + utilFunc.nullTo(tr[fld], "&nbsp;") + "</td>";
  }
  function tdAmt(tr, fld) {
    var kN;
    if (fld == "S_A" || fld == "O_A" || fld == "Q_ORDER" || fld == "Q_SELECT") {
      kN = utilFunc.float(tr[fld], 3);
    }
    else {
      kN = tr[fld] ? utilFunc.float(tr[fld], 3) : "";
    }
    var title = utilFunc.waresAmountView(kN, tr.VUF, tr.VUC, tr.MUF, tr.MUC) + " " + utilFunc.waresAmountTitle(tr.MUC, tr.VUF, tr.VUC);
    return "<td title='" + title + "' class='number'>" + kN + "</td>";
  }
  function tdFileName(tr, fld) {
    const fldClass = fld + "CLASS";
    return "<td class='filename " + (tr[fldClass] ? tr[fldClass] : "") + "'" + ">" + utilFunc.filenamePath(tr[fld]) + "</td>";
  }
   function tdQueueStatus(tr, fld){
      return $.tdTaskServerStatus(tr[fld], tr[fld + "TITLE"]);
   }
   function tdHiddenText(tr, fld){
        const fldClass = fld + "CLASS";
        return "<td class='filename " + (tr[fldClass] ? tr[fldClass] : "") + "'" + ">" + "..." + "</td>";
  }
  return {
    tdAmount: tdAmount,
    tdAmountStr: tdAmountStr,
    tdCode: tdCode,
    tdCodeNumber: tdCodeNumber,
    tdText: tdText,
    tdNumber: tdNumber,
    tdInt: tdInt,
    tdChk: tdChk,
    tdDateTime: tdDateTime,
    tdDate: tdDate,
    tdTime: tdTime,
    tdCodeName: tdCodeName,
    tdName: tdName,
    tdPlusMinus: tdPlusMinus,
    tdDocBarcode: tdDocBarcode,
    tdPrice: tdFloat2,
    tdSumma: tdFloat2,
    tdAmount1: tdFloat1,
    tdAmount2: tdFloat2,
    tdFloat0: tdFloat0,
    tdWaresAmount: tdAmount,
    tdWaresUnit: tdWaresUnit,
    tdDocStatus: tdDocStatus,
    tdTaskStatus: tdTaskStatus,
    tdNullTo: tdNullTo,
    tdAmt: tdAmt,
    tdQStr: tdQStr,
    tdFileName: tdFileName,
    tdQueueStatus: tdQueueStatus,
    tdHiddenText: tdHiddenText
  };
})();


class Tbl{
  constructor(code, higherElement, userFunc,foot, addclm ){
    this._code = code;
    this._higherElement = higherElement;
    this._source = [];
    this._extdata = null;
    this._ids = {};
    this._cfg = {};
    this._tFootData = {};
    this._tblId = null;
    this._events = null;
    this._funcAfterReDraw = null;
    this._newHead = [];
    $.extend(this._newHead, addclm);
    this.genId();
    $.extend(tblCfgFunc, userFunc);
    this.cfgLoad();
    $.extend(this._cfg, foot);
  };



  genId(){
    let tblId = "tbl_" + this._code + "_" + this.getRandomInt(1, 999999);
    while (document.getElementById(tblId)){
      tblId = "tbl_" + this._code + "_" + this.getRandomInt(1, 999999);
    }
    this._tblId = tblId;
  }

  get tblId(){
    return this._tblId;
  }

  set events(func){
   this._events = func;
  }

  set funcAfterReDraw(func){
   this._funcAfterReDraw = func;
  }

  cfgLoad(){
    this.ajax({
      url: "coreQIfaceTblUserColumns",
      data: {tblCode: this._code},
      success: this.setCfg,
      async: false
    });
  };

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  };

  setCfg(r){
    const json = JSON.parse(r);
    // var num = json.data.length;
    for (var i = 0; i < this._newHead.length; i++) {
      var R = this._newHead[i];
      json.data.push(R);
    }

    this._cfg.clmSortKey = [];
    if (json.ext_data.thExt)
      this._cfg.theadExt = "<tr>" + json.ext_data.thExt + "</tr>";
    this._cfg._fldId = json.ext_data.keyFld;
    for (var i = 0; i < json.data.length; i++) {
      var R = json.data[i];
      this._cfg.clmSortKey.push(R.CLMCODE);
      this._cfg["th" + R.CLMCODE] = R.CLMTH;
      if (R.FLDNAME)
        this._cfg["fld" + R.CLMCODE] = R.FLDNAME;
      if (R.DEFFUNC)
         this._cfg["td" + R.CLMCODE] = tblCfgFunc[R.DEFFUNC];
    }
    if (document.getElementById(this._tblId)){
      this.draw();
    }
  }

  dataPush(elem){
    this._source.push(elem);
    var visible = ((!elem.VISIBLE && elem.VISIBLE != 0) || elem.VISIBLE == 1) ? 1 : 0;
    this._ids[""+elem[this._cfg._fldId]] = {num: this._source.length - 1, visible: visible};
  };

  trId(valFldId){
    return this._tblId + "_tr_" + valFldId;
  }

  trDel(trId){
    const valId = trId.replace(this._tblId + "_tr_", "");
    const i = this._ids[valId];
    this._source[i.num].VISIBLE = 0;
    this.draw();
  }

  data(json){
    var arr = json.data;
    if (json.ext_data){
      this._extdata = json.ext_data;
    }
    const flFirst = this._source.length === 0;
    //this._tFootData = [];
    for (var i=0; i<arr.length; i++){
      var objArr = arr[i];
      const O = this._ids[""+objArr[this._cfg._fldId]];
      if (O && O.num >= 0){
        var oldVis = O.visible; var newVis = objArr.VISIBLE;
        var oldVisible = ((!oldVis && oldVis != 0) || oldVis == 1) ? true : false;
        var needVisible = ((!newVis && newVis != 0) || newVis == 1) ? true : false;
        this._source[O.num] = objArr;
        if (!flFirst) {
          if (needVisible) {
            if (oldVisible){//если элемент видимый и отрисован на странице
              let tr = document.getElementById(this.trId(objArr[this._cfg._fldId]));
              tr.innerHTML = this.tbodyTrHTML(objArr);
            }
            else if(!oldVisible){
              document.getElementById(this._tblId + "_tbody").innerHTML += this.tbodyTrHTML(objArr);
              O.visible = 1;
            }
            if (this._cfg.footCalc) {
              this.optGetVal(this._cfg.footCalc, [objArr, this._tFootData, this._extdata]);
            }
          }
          else if(oldVisible){
            document.getElementById(this.trId(objArr[this._cfg._fldId])).remove();
            O.visible = 0;
          }
        }
      }
      else{
        this.dataPush(objArr);
        if (!flFirst && (this._ids[""+objArr[this._cfg._fldId]].visible == 1)){
          document.getElementById(this._tblId + "_tbody").innerHTML += this.tbodyTrHTML(objArr);
          if (this._cfg.footCalc) {
            this.optGetVal(this._cfg.footCalc, [objArr, this._tFootData, this._extdata]);
          }
        }
      }
    }
    if (flFirst){
      this.draw();
    }
    else{
      if (this._events) {
        this._events.call(document.getElementById(this._tblId))
      }
      if (this._cfg.footSet) {
        var foothtml = this.optGetVal(this._cfg.footSet, [this._tFootData, this._cfg.clmSortKey, this._extdata]);
        document.getElementById(this._tblId).querySelector("tfoot").innerHTML = foothtml;
      }
      if (this._funcAfterReDraw){
        this._funcAfterReDraw.call(arr);
      }

    }
  };

  set extdata(obj) {
    this._extdata = obj;
  };

  get extdata() {
    return this._extdata;
  };

  get fldId() {
    return this._cfg._fldId;
  }

  empty(){
    this._source = [];
    this._extdata = null;
    this._ids = {};
    if (Object.keys(this._cfg).length > 0)
      this.draw();
  }

  ajax(O) {
    const _this = this;
    const P = {
      async: (Object.keys(O).indexOf('async') > -1 ? O.async : true),
      url: O.url,
      success: O.success || false,
      error: O.error || false,
      data: O.data || false,
      method: O.method || "GET"
    };
    var a;
    if (window.XMLHttpRequest) {
      a = new XMLHttpRequest();
    }
    else if (window.ActiveXObject) {
      try {
        a = new ActiveXObject("Msxml2.XMLHTTP.6.0");
      }
      catch (e) {
        try {
          a = new ActiveXObject("Msxml2.XMLHTTP.3.0");
        }
        catch (ee) {
          alert("AJAX not supported");
        }
      }
    }
    if (a == null) {
      return false;
    }
    a.onreadystatechange = function () {
      if (this.readyState == 4) {
        if (this.status == 200) {
          (P.success && P.success.call(_this, this.responseText));
        }
        else {
          (P.error && P.error.call(_this, this.status + " - " + this.statusText));
        }
      }
    };
    if (P.method === "GET"){
      var params = "";
      if (P.data){
        for (const item in P.data){
          params += "&" + item + "=" + P.data[item];
        }
        params = "?" + params.slice(1);
      }
      a.open(P.method, P.url+params, P.async);
      a.send(null);
    }
    else{
      a.open(P.method, P.url, P.async);
      (P.data ? a.send(P.data) : a.send(null));
    }
  };

  optGetVal(opt, param) {
    if (opt) {
      if (typeof opt == "function") {
        if (param) {
          if (typeof param == "object") {
            return opt.apply(null, param);
          }
          else {
            return opt.call(null, param);
          }
        }
        else
          return opt();
      }
      else {
        return opt;
      }
    }
    else {
      return "";
    }
  };

  trHTML(tr) {
    var html = "";
    if (this._cfg)
      for (var j = 0; j < this._cfg.clmSortKey.length; j++) {
        var item = this._cfg.clmSortKey[j];
        if (this._cfg["td" + item]) {
          var fld = this._cfg["fld" + item] ? this._cfg["fld" + item] : item.toUpperCase();
          html += this.optGetVal(this._cfg["td" + item], [tr, fld]);
        }
      }
    return html;
  };

  tbodyTrHTML(tr) {
    return "<tr" + (tr['TRCLASS'] ? " class='" + tr['TRCLASS'] + "'" : "") +
      " id='" + this.trId(tr[this._cfg._fldId]) + "'>" + this.trHTML(tr) + "</tr>";
  };

  theadHTML() {
    var html = "<thead>" +
      (this._cfg.theadExt ? this.optGetVal(this._cfg.theadExt) : "") + "<tr>";
    for (var j = 0; j < this._cfg.clmSortKey.length; j++) {
      var item = this._cfg.clmSortKey[j];
      html += (this._cfg["th" + item] ? this.optGetVal(this._cfg["th" + item]) : "").replace(/^<th/g, "<th data-clm='" + item + "'");
    }
    html += "</tr></thead>";
    return html;
  };

  draw() {
    if (!this._tblId) {
      this.genId();
    }
    var html = "<table id='" + this._tblId + "'>" + this.theadHTML() + "<tbody id='" + this._tblId + "_tbody'>";
    for (var i = 0; i < this._source.length; i++) {
      var tr = this._source[i];
      if ((!tr.VISIBLE && tr.VISIBLE != 0) || tr.VISIBLE == 1){
        html += this.tbodyTrHTML(tr);
        if (this._cfg.footCalc && this._tblId)
          this.optGetVal(this._cfg.footCalc, [tr, this._tFootData, this._extdata]);
      }
    }
    html += "</tbody>" + (this._cfg.footSet ? this.optGetVal(this._cfg.footSet, [this._tFootData, this._cfg.clmSortKey, this._extdata]) : "") + "</table>";
    this._higherElement.innerHTML = html;
    if (this._events) {
      this._events.call(document.getElementById(this._tblId));
    }
  };

  trDataById(trId){
    const valId = trId.replace(this._tblId + "_tr_", "");
    const i = this._ids[valId];
    return this._source[i.num];
  };

  trKeyId(trId){
    return trId.replace(this._tblId + "_tr_", "");
  };
}

