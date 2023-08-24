var _useScan_ = true;

var GScanElement=null;
var codeReplace = {29: '!GS!'};

var ScannerPrefixCode = 0;
function eventKeyDownIsScannerPrefix(evt){
    var keyCode = getKeyCode(evt);
    // Ctrl+B = \x02 = 66 && evt.ctrlKey && !evt.shiftKey
    // ! = 49 && !evt.ctrlKey && evt.shiftKey
    //return (keyCode == 0 || (keyCode == 66 && evt.ctrlKey && !evt.shiftKey)) ;
    return (keyCode == 0 ||
           (keyCode == 49 && !evt.ctrlKey && evt.shiftKey) ||
           (keyCode == 33 && !evt.ctrlKey && evt.shiftKey) ||
           (keyCode == 66 && evt.ctrlKey && !evt.shiftKey)) ;
}


var GScaning = false;
var GOnlyScanElement=null;
var GScanElementForm;

/*function handleScanKeyPress(evt){
      if (GScaning == 'hscan') {
          if (getKeyCode(evt) != ScannerPrefixCode) {
              GOnlyScanElement.value = GOnlyScanElement.value +  String.fromCharCode(getKeyCode(evt));
          }
          CancelAction(evt);
      }
      if (GScaning == 'no') {
          CancelAction(evt);
      }
}*/

function handleScanKeyPress(evt){
  dvLog('handleScanKeyPress');
  if (GScaning == 'hscan') {
      if (getKeyCode(evt) > 31){
          GOnlyScanElement.value = GOnlyScanElement.value +  String.fromCharCode(getKeyCode(evt));
      }
      CancelAction(evt);
  }
  if (GScaning == 'scan'){
    var Node;
    if (GScanElement){
      Node = GScanElement;
    }
    else if (GScanElementIdx){
      Node = GElementsList[GScanElementIdx];
    }
    var kC = getKeyCode(evt);
    dvLog(kC);
    if (codeReplace[kC])
      Node.value = Node.value + codeReplace[kC];
  }
  if (GScaning == 'no') {
      CancelAction(evt);
  }
}


function getScanElement(){
  if (GScanElement)
    return GScanElement;
  else if (GOnlyScanElement)
    return GOnlyScanElement;
  else
    return false;
}

function frmScanSubmit(frm){
  if (frm){
    var isSubmit = frm.getAttribute("disabled") == "disabled" ? false : true;
    if (isSubmit && frm.onsubmit){
      isSubmit = frm.onsubmit();
    }
    if (isSubmit){
       var scanElement = getScanElement();
       if (scanElement && scanElement.value){
         if (scanElement.value.length > 0 && scanElement.value[0] == '!'){
           scanElement.value = scanElement.value.substring(1);
         }
       }
       frm.submit();
       frm.setAttribute("disabled", "disabled");
       return true;
    }
  }
  return false;
}

function scanCallback(result, params) {
  if (GScanElementForm){
    var scanElement = getScanElement();
    if (scanElement){
      scanElement.value = result;
      frmScanSubmit(GScanElementForm);
    }
  }
};

function dvLog(txt){
    if (document.getElementById('dvLog') && txt){
      document.getElementById('dvLog').innerHTML = document.getElementById('dvLog').innerHTML + txt + '<br>';
    }

}