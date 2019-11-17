var GSS = SpreadsheetApp.getActive();
var sheet_AutoWrite = GSS.getSheetByName("자동입력시트");
var sheet_Analysis = GSS.getSheetByName("분석시트");
var sheet_Hide = GSS.getSheetByName("서버 전송 및 계산 시트");

function myFunction() {
  var date = dayUpdate();

  var menu = menuConfirm();

  var pinCell = sheet_AutoWrite.createTextFinder(date).findAll();

  for(var x = 0; x < pinCell.length; x++){
    for(var i in menu){
      if(menu[i].name == sheet_AutoWrite.getRange(pinCell[x].getRow(), pinCell[x].getColumn()+2).getValue()){
        menu[i].num++;
      }
    }
  }

  var writePosCell = sheet_Hide.createTextFinder("쓰기 위치").findAll();
  var writePos = sheet_Hide.getRange(writePosCell[0].getRow(), writePosCell[0].getColumn() + 1).getValue();
  writeDateSell(writePos, menu, date);
}

function dayUpdate(){
  var time = new Date();
  var month = time.getMonth()+1;
  var day = time.getDate() - 1;

  var returnText = month + "월 " + day + "일";

  return returnText;
}

function writeDateSell(_writePos, _menu, _date){
  var writePosColumn = sheet_Analysis.createTextFinder("판매 분석").findAll()[0].getColumn();
  sheet_Analysis.getRange(_writePos, writePosColumn).setValue(_date);

  var time = new Date();
  var day;
  switch(time.getDay()){
    case 0:
      day = "토요일"
      break;
    case 1:
      day = "일요일"
      break;
    case 2:
      day = "월요일"
      break;
    case 3:
      day = "화요일"
      break;
    case 4:
      day = "수요일"
      break;
    case 5:
      day = "목요일"
      break;
    case 6:
      day = "금요일"
      break;
  }
  sheet_Analysis.getRange(_writePos, writePosColumn + 1).setValue(day);
  for(var i in _menu){
    sheet_Analysis.getRange(_writePos, writePosColumn + 2 + parseInt(i)).setValue(_menu[i].num);
  }
}

function menuConfirm(){
  var menu = [];

  var menuRead = sheet_Hide.createTextFinder("메뉴 종류").findAll();
  var x = 1;

  while(sheet_Hide.getRange(menuRead[0].getRow() + x, menuRead[0].getColumn() + 1).isBlank() == false){
    var obj = {};
    obj.name = sheet_Hide.getRange(menuRead[0].getRow() + x, menuRead[0].getColumn() + 1).getValue();
    obj.num = 0;
    menu.push(obj);
    x++;
  }
  return menu;
}
