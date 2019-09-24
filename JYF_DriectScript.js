var GSS = SpreadsheetApp.getActive();
var sheet_AutoWrite = GSS.getSheetByName("자동입력시트");
var sheet_Analysis = GSS.getSheetByName("분석시트");

function myFunction() {
  var date = dayUpdate();
  sheet_Analysis.getRange("C33").setValue(date);

  var check = true;
  var menu1Num = 0;
  var menu2Num = 0;
  var scanPos = sheet_Analysis.getRange("C34").getValue();

  if(scanPos != "#N/A"){

    while(check){
      var datePos = "B"+scanPos;

      switch(sheet_AutoWrite.getRange("D"+scanPos).getValue()){
        case "참깨라면":
          menu1Num++;
          break;
        case "박카스":
          menu2Num++;
          break;
      }
      scanPos++;
      if(sheet_AutoWrite.getRange(datePos).getValue() == ""){
        check = false;
      }
    }

    var writePos = sheet_Analysis.getRange("C35").getValue();


    writeDateSell(writePos, menu1Num, menu2Num, date);

  }

}

function dayUpdate(){
  var time = new Date();
  var month = time.getMonth()+1;
  var day = time.getDate() - 1;
  var returnText = month + "월 " + day + "일";

  return returnText;
}

function writeDateSell(_writePos, _num1, _num2, _date){
  sheet_Analysis.getRange("H"+_writePos).setValue(_date);

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
  sheet_Analysis.getRange("I"+_writePos).setValue(day);
  sheet_Analysis.getRange("J"+_writePos).setValue(_num1);
  sheet_Analysis.getRange("K"+_writePos).setValue(_num2);
}
