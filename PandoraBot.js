const express = require('express');
const app = express();
const axios = require('axios');
const logger = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
require('dotenv').config({path:'PandoraBot.env'});
const port = process.env.MAINPORT;

const apiRouter = express.Router();

app.use(logger('dev', {}));
app.use(bodyParser.json());
app.use('/api', apiRouter);

const fs = require('fs');

const readline = require('readline');
const {google} = require('googleapis');

var _auth;

var obj = {
   table: []
};

fs.readFile("PandoraBotJSON.json", function(err, data) {
    obj = JSON.parse(data);
});

// 최초 이름 체크
apiRouter.post('/nameInput', function(req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: _nameCheck(req.body.userRequest.user.id, req.body.userRequest.utterance)
          }
        }
      ],
      quickReplies: [
      {
        action: "block",
        label: "처음으로",
        messageText: "처음으로",
        blockId: "5ceb722905aaa7533585ab8b",
        extra: {
        }
      }
    ]
    }
  };
  console.log("nameInput " + obj.table[_checkJSON(req.body.userRequest.user.id)].name + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

// 이름 확인
apiRouter.post('/nameCheck', function(req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: _nameCheck(req.body.userRequest.user.id, "NULL")
          }
        }
      ],
      quickReplies: [
      {
        action: "block",
        label: "처음으로",
        messageText: "처음으로",
        blockId: "5ceb722905aaa7533585ab8b",
        extra: {
        }
      },
      {
        action: "block",
        label: "수정하기",
        messageText: "수정하기",
        blockId: "5cee7f8605aaa7533585b921",
        extra: {
        }
      }
    ]
    }
  };
  console.log("nameCheck " + obj.table[_checkJSON(req.body.userRequest.user.id)].name + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

// JSON내 이름 체크 함수
function _nameCheck(_userID, userName) {
  var userNum = _checkJSON(_userID);

  if(userNum == "empty"){
    // JSON에 이름 없음
    if(userName == "NULL"){
      return "처음 접속 하였습니다. 이름을 정확히 입력해주세요.";
    }else{
      obj.table.push({id:_userID, name:userName});
      var json = JSON.stringify(obj);
      fs.writeFile('PandoraBotJSON.json', json);
      return "처음 접속 하였습니다." + userName + "님 안녕하세요.";
    }
  }else{
    // JSON에 이름 있음
    if(userName == "D"){
      // 이름 수정
      obj.table.splice(userNum, 1);
      var json = JSON.stringify(obj);
      fs.writeFile('PandoraBotJSON.json', json);
      return "처음 접속 하였습니다. 이름을 정확히 입력해주세요.";
    }
    return obj.table[userNum].name + "님 안녕하세요.";
  }
}

// 이름 수정
apiRouter.post('/editName', function(req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: _nameCheck(req.body.userRequest.user.id, "D")
          }
        }
      ]}};

  console.log("editName " + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

// 목적 입력
apiRouter.post('/inputPurpose', function(req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "금액을 입력해 주십시오."
          }
        }
      ],
      quickReplies: [
      {
        action: "block",
        label: "5000원",
        messageText: "5000원",
        extra: {
        }
      }
    ]
    }
  };
  _writePurpose(req.body.userRequest.user.id, req.body.userRequest.utterance);
  console.log("inputPurpose" + obj.table[_checkJSON(req.body.userRequest.user.id)].name + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

// JSON내 목적 쓰기
function _writePurpose(_userID, purpose) {
  var userNum = _checkJSON(_userID);
  if(userNum == "empty"){
    return "오류가 발생했습니다. 처음부터 다시 해주십시오.";
  }
  obj.table[userNum].type = "PA";
  obj.table[userNum].purpose = purpose;

  writeJSON();
  return "금액을 정확히 입력해 주십시오.";
}

// 금액 입력
apiRouter.post('/inputMoney', function(req, res) {
  const responseBody = {
    version: "2.0",
    template: _writeMoney(req.body.userRequest.user.id, req.body.userRequest.utterance, req._startTime)

  };
  console.log("inputMoney " + obj.table[_checkJSON(req.body.userRequest.user.id)].name + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

// JSON내 금액 쓰기
function _writeMoney(_userID, money, time) {
  var userNum = _checkJSON(_userID);
  var returnObj;

  if(userNum == "empty"){
    returnObj = {template: {
      outputs: [
        {
          simpleText: {
            text: "계정이 없습니다. 확인해 주십시오."
          }
        }
      ],
      quickReplies: [
      {
        action: "block",
        label: "처음으로",
        messageText: "처음으로",
        blockId: "5ceb722905aaa7533585ab8b",
        extra: {
        }
      }
    ]
  }};
    return returnObj.outputs;
  }
  obj.table[userNum].type = "PA";
  obj.table[userNum].money = money;
  obj.table[userNum].time = time;
  var returnText = obj.table[userNum].name + " " + obj.table[userNum].purpose + " " + obj.table[userNum].money + "\n전송 하려면 전송코드를 입력하시오.";

  writeJSON();

  returnObj = {template: {
    outputs: [
      {
        simpleText: {
          text: returnText
        }
      }
    ]
  }};
  return returnObj.template;
}

// 본인 JSON 입력값 반환
function _checkJSON(_userID){
  for(var item in obj.table){
    if(obj.table[item].id == _userID){
      return item;
    }
  }
  return "empty";
}

// ------- 진영 식품 --------
// 메뉴 입력
apiRouter.post('/JYF_inputMenu', function(req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: _JYFwriteMenu(req.body.userRequest.user.id, req.body.userRequest.utterance, req._startTime)
          }
        }
      ]
    }
  };

  console.log("JYF_inputMenu" + obj.table[_checkJSON(req.body.userRequest.user.id)].name + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

// JSON내 진영식품 메뉴 쓰기
function _JYFwriteMenu(_userID, menu, time) {
  var returnText;
  var userNum = _checkJSON(_userID);

  if(userNum == "empty"){
    return "오류가 발생했습니다. 처음부터 다시 해주십시오.";
  }

  obj.table[userNum].type = "JYF";
  obj.table[userNum].jyf_menu = menu;
  obj.table[userNum].time = time;

  returnText = obj.table[userNum].name + " " + obj.table[userNum].jyf_menu + "\n전송 하려면 전송코드를 입력하시오.";
  writeJSON();
  return returnText;
}

// 시트에서 데이터 읽어오는중
apiRouter.post('/JYF_readBill', function(req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "데이터를 읽어오고 있습니다.\n최대 3초가 소요됩니다."
          }
        }
      ],
      quickReplies: [
      {
        action: "block",
        label: "장부 출력",
        blockId: "5d79f3ee92690d0001815e45",
        extra: {
        }
      }
    ]
    }

  };

  var userNum = _checkJSON(req.body.userRequest.user.id);
  exportJson(userNum);
  console.log("JYF_readBill" + obj.table[userNum].name + req.body.userRequest.utterance);

  console.log(responseBody);
  res.status(200).send(responseBody);
});

// 본인 장부 확인
apiRouter.post('/JYF_checkBill', function(req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: _JYFloadBill(req.body.userRequest.user.id)
          }
        }
      ],
      quickReplies: [
      {
        action: "block",
        label: "처음으로",
        blockId: "5ceb722905aaa7533585ab8b",
        extra: {
        }
      }
    ]
    }
  };

  console.log("JYF_checkBill" + obj.table[_checkJSON(req.body.userRequest.user.id)].name + req.body.userRequest.utterance);

  console.log(responseBody);
  res.status(200).send(responseBody);
});

// JSON에서 장부 읽기
function _JYFloadBill(_userID) {
  var returnText;
  var userNum = _checkJSON(_userID);
  exportJson(userNum);

  if(userNum == "empty"){
    return "오류가 발생했습니다. 처음부터 다시 해주십시오.";
  }

  returnText = "-- " + obj.table[userNum].name + "님의 장부 --\n참깨라면 " + obj.table[userNum].jyf_num1 + "개\n박카스 " + obj.table[userNum].jyf_num2 + "개\n총액 " + obj.table[userNum].jyf_total + "";
  return returnText;
}

// 시트JSON에서 데이터 추출해서 JSON에 쓰기
function exportJson(_userNum) {
  var sheetDataLink_JYF = "https://spreadsheets.google.com/feeds/cells/1llk5IZ41U5Ul3kOQva8jkZwZlreHBmtzTwhgTwpeXGo/2/public/basic?alt=json-in-script&min-col=6&max-col=9&min-row=5";

  axios.get(sheetDataLink_JYF).then(function(response) {
    var sheetJson = response.data.slice(28,response.data.length-2);
    entry = JSON.parse(sheetJson).feed.entry;

    for(var i in entry){
      if(entry[i].content.$t == obj.table[_userNum].name){
        var num = i;
        num++;
        obj.table[_userNum].jyf_num1 = entry[num].content.$t;
        num++;
        obj.table[_userNum].jyf_num2 = entry[num].content.$t;
        num++;
        obj.table[_userNum].jyf_total = entry[num].content.$t;
        console.dir(obj.table[_userNum]);
        writeJSON();
        return 0;
      }
    }
  })
  .catch(function(error) {
    console.log(error);
  });
}

// ^------ 진영 식품 -------^

// JSON 저장
function writeJSON(){
  var json = JSON.stringify(obj);
  fs.writeFile('PandoraBotJSON.json', json);

}

// 데이터 전송
apiRouter.post('/sendData', function(req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "전송되었습니다."
          }
        }
      ]
    }
  };
  var sendObj = obj.table[_checkJSON(req.body.userRequest.user.id)];


  callAppsScript(_auth, sendObj);
  console.log("sendData " + obj.table[_checkJSON(req.body.userRequest.user.id)].name + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

app.listen(port, function() {
  console.log('Skill server listening on port ' + port);
});

const SCOPES = [
  'https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/spreadsheets'
  ];

const TOKEN_PATH = 'token.json';

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Apps Script API.
  authorize(JSON.parse(content), callAppsScript);
});

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, {});
    _auth = oAuth2Client;
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);

      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err)return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client, {});
      _auth = oAuth2Client;
    });
  });
}

function callAppsScript(auth, parameter) { // eslint-disable-line no-unused-vars
  const scriptId = "1VUGXgd5MxQqbBgM-ygeB9jYT2HwDJSxlheeOmfapO7jSKi2jICKcD_8x";
  const script = google.script('v1');
  // Make the API request. The request object is included here as 'resource'.
  script.scripts.run({
    auth: auth,
    resource: {
      function: 'myFunction',
      devMode: "true",
      parameters: parameter
    },
    scriptId: scriptId,
  }, function(err, resp) {
    if (err) {
      // The API encountered a problem before the script started executing.
      console.log('The API returned an error: ' + err);
      return;
    }
    if (resp.error) {
      // The API executed, but the script returned an error.

      // Extract the first (and only) set of error details. The values of this
      // object are the script's 'errorMessage' and 'errorType', and an array
      // of stack trace elements.
      const error = resp.error.details[0];
      console.log('Script error message: ' + error.errorMessage);
      console.log('Script error stacktrace:');

      if (error.scriptStackTraceElements) {
        // There may not be a stacktrace if the script didn't start executing.
        for (let i = 0; i < error.scriptStackTraceElements.length; i++) {
          const trace = error.scriptStackTraceElements[i];
          console.log('\t%s: %s', trace.function, trace.lineNumber);
        }
      }
    } else {
      // The structure of the result will depend upon what the Apps Script
      // function returns. Here, the function returns an Apps Script Object
      // with String keys and values, and so the result is treated as a
      // Node.js object (folderSet).

      const folderSet = resp.data.response.result;
      if (Object.keys(folderSet).length == 0) {
        console.log('No folders returned!');
      } else {
        console.log('Folders under your root folder:');
        Object.keys(folderSet).forEach(function(id) {
          console.log('\t%s (%s)', folderSet[id], id);
        });
      }

    }
  });
}
