var GSS = SpreadsheetApp.getActive();
var sheet_AutoWrite = GSS.getSheetByName("자동입력시트");
var sheet_Analysis = GSS.getSheetByName("분석시트");
var sheet_Hide = GSS.getSheetByName("서버 전송 및 계산 시트");

function myFunction() {
  var date = dayUpdate();
  var menu1Num = 0;
  var menu2Num = 0;
  var menu3Num = 0;
  var pinCell = sheet_AutoWrite.createTextFinder(date).findAll();

  for(var x = 0; x < pinCell.length; x++){
    switch(sheet_AutoWrite.getRange(pinCell[x].getRow(), pinCell[x].getColumn()+2).getValue()){
        case "참깨라면":
          menu1Num++;
          break;
        case "오뚜기밥":
          menu2Num++;
          break;
        case "박카스":
          menu3Num++;
          break;
      }
  }


  var writePosCell = sheet_Hide.createTextFinder("쓰기 위치").findAll();
  var writePos = sheet_Hide.getRange(writePosCell[0].getRow(), writePosCell[0].getColumn() + 1).getValue();
  writeDateSell(writePos, menu1Num, menu2Num, menu3Num, date);
}

function dayUpdate(){
  var time = new Date();
  var month = time.getMonth()+1;
  var day = time.getDate() - 1;

  var returnText = month + "월 " + day + "일";

  return returnText;
}

function writeDateSell(_writePos, _num1, _num2, _num3, _date){
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
  sheet_Analysis.getRange(_writePos, writePosColumn + 2).setValue(_num1);
  sheet_Analysis.getRange(_writePos, writePosColumn + 3).setValue(_num2);
  sheet_Analysis.getRange(_writePos, writePosColumn + 4).setValue(_num3);
}
