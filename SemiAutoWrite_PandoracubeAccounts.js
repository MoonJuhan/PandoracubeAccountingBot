var SheetID_PA = "1-FR0Blq2eOTb1YMq0yMGsQBPefwWQe59HYubq1Qa6Hw";
var SheetID_JYF = "1llk5IZ41U5Ul3kOQva8jkZwZlreHBmtzTwhgTwpeXGo";
var sheet_PA = SpreadsheetApp.openById(SheetID_PA).getSheetByName('자동입력시트');
var sheet_JYF = SpreadsheetApp.openById(SheetID_JYF).getSheetByName('자동입력시트');

var returnObj = {"text": "hello"};

function myFunction(jsonObj) {

  // 시간 추출
  var _time = splitTime();

  // 판도라큐브 회계와 진영 식품 분리
  if(jsonObj.type == "PA"){
    var _money = wonDelete(jsonObj.money);
    writeData(_time, jsonObj.name,jsonObj.purpose,_money);
    returnObj.text = jsonObj.name;

  }else if(jsonObj.type == "JYF"){
    writeData_JYF(_time, jsonObj.name,jsonObj.jyf_menu);
  }



  return returnObj;
}

// 판도라큐브 회계 시트에 작성
function writeData(time, name, purpose, money){
      var settingPositionRow = sheet_PA.getLastRow();
      sheet_PA.getRange(settingPositionRow + 1, 2).setValue(time);
      sheet_PA.getRange(settingPositionRow + 1, 3).setValue(money);
      sheet_PA.getRange(settingPositionRow + 1, 4).setValue(purpose);
      sheet_PA.getRange(settingPositionRow + 1, 5).setValue(name);
      sheet_PA.getRange(settingPositionRow + 1, 6).setValue("회비");
      sheet_PA.getRange(settingPositionRow + 1, 7).setValue("통장");
}

// 입력될 시간 추출
function splitTime(){
  var time = new Date();

  var returnText;
  var month = time.getMonth() + 1;
  returnText = time.getFullYear() + ". " + month + ". " + time.getDate();

  return returnText;
}

// 입력된 금액에서 '원' 삭제
function wonDelete(money){
  money = money.split('원');

  return money;
}

// ---- JYF ----
// 진영식품 시트에 작성
function writeData_JYF(time, name, menu){
  var settingPositionRow = sheet_JYF.getLastRow();
  var check = true;

  while(check){
    if(sheet_JYF.getRange(settingPositionRow, 2).getDisplayValue() == ""){
    settingPositionRow--;
    }else{
    check = false;
    }
  }
  sheet_JYF.getRange(settingPositionRow + 1, 2).setValue(time);
  sheet_JYF.getRange(settingPositionRow + 1, 3).setValue(name);
  sheet_JYF.getRange(settingPositionRow + 1, 4).setValue(menu);

  updateDB(name, menu);
}

//
function updateDB(_name, _menu){
  var check = true;
  var nameNum = 5;
  while(check){
    var name = sheet_JYF.getRange(nameNum,6).getDisplayValue();
    if(name == _name){
      check = false;
    }else if(name == ""){
      sheet_JYF.getRange(nameNum,6).setValue(_name);
      check = false;
    }else{
     nameNum++;
    }
  }

  var menuNum = 0;
  switch(_menu){
    case "참깨라면":
      menuNum = 7;
      break;
    case "오뚜기밥":
      menuNum = 8;
      break;
    case "박카스":
      menuNum = 9;
      break;
  }


  var eatNum = parseInt(sheet_JYF.getRange(nameNum,menuNum).getDisplayValue()) + 1;
  sheet_JYF.getRange(nameNum,menuNum).setValue(eatNum);

}
