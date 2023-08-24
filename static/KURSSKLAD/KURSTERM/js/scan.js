var _useScan_ = true;

var GScanElement=null;

//var ScannerPrefixCode = /msie 6.0/i.test(navigator.userAgent) ? 17 : 0;
//var ScannerPrefixCode = 0;
//var ScannerPrefixCode = [0, 17, '0', '17'];
function eventKeyDownIsScannerPrefix(evt){
    var keyCode = getKeyCode(evt);
    // Ctrl+Shift+6 = Ctrl+^ = \x1e
    //return (keyCode == 0 || (keyCode == 54 && evt.ctrlKey && evt.shiftKey)) ;
    // Ctrl+B = \x02
    return (keyCode == 0 || (keyCode == 66 && evt.ctrlKey && !evt.shiftKey)) ;
}

var GScaning = false;
var GOnlyScanElement=null;
var GScanElementForm;
var codeReplace = {29: '!GS!'};

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
  if (GScaning == 'hscan') {
      //if (getKeyCode(evt) != ScannerPrefixCode) {
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
    if (codeReplace[kC])
      Node.value = Node.value + codeReplace[kC];
    /*if (kC == 29)
      Node.value = Node.value + '<GS>';*/
  }
  if (GScaning == 'no') {
      CancelAction(evt);
  }
}
