const express = require('express');
const app = express();
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
var testpara = {
  name : "문주한"
}

var obj = {
   table: []
};

fs.readFile("PandoraBotJSON.json", function(err, data) {
    obj = JSON.parse(data);
});

// 최초 이름 체크
apiRouter.post('/nameInput', function(req, res) {
  var returnText = _nameCheck(req.body.userRequest.user.id, req.body.userRequest.utterance);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: returnText
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
  console.log("nameInput" + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

// 이름 확인
apiRouter.post('/nameCheck', function(req, res) {
  var returnText = _nameCheck(req.body.userRequest.user.id, "NULL");
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: returnText
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
  _displayAccount(req.body.userRequest.user.id);
  console.log("nameCheck" + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

// JSON내 이름 체크 함수
function _nameCheck(userID, userName) {
  var check = false;
  var name;
  var num;
  for(var item in obj.table){
      if(obj.table[item].id == userID){
        console.log("SAME");
        name = obj.table[item].name;
        check = true;
        num = item;
      }
  }

  if(userName == "D"){
    console.log("NUM" + num);
    obj.table.splice(num, 1);
    var json = JSON.stringify(obj);
    fs.writeFile('PandoraBotJSON.json', json);
    check = false;

    return "처음 접속 하였습니다. 이름을 정확히 입력해주세요.";
  }

  if(check){
    return name + "님 안녕하세요.";
  }else{
    if(userName == "NULL"){
      return "처음 접속 하였습니다. 이름을 정확히 입력해주세요.";
    }else{
      obj.table.push({id:userID, name:userName});
      var json = JSON.stringify(obj);
      fs.writeFile('PandoraBotJSON.json', json);
      return "처음 접속 하였습니다." + userName + "님 안녕하세요.";
    }
  }
}

// 이름 수정
apiRouter.post('/editName', function(req, res) {
  var returnText = _nameCheck(req.body.userRequest.user.id, "D");

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: returnText
          }
        }
      ]
    }
  };

  console.log("editName" + req.body.userRequest.utterance);
  console.log("P"+app.purpose);
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
      ]
    }
  };
  _writePurpose(req.body.userRequest.user.id, req.body.userRequest.utterance);
  // req.body.userRequest.utterance;
  console.log("inputPurpose" + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

// JSON내 목적 쓰기
function _writePurpose(userID, purpose) {
  var check = false;
  for(var item in obj.table){
      if(obj.table[item].id == userID){
        check = true;

        obj.table[item].type = "PA";
        obj.table[item].purpose = purpose;
        var json = JSON.stringify(obj);
        fs.writeFile('PandoraBotJSON.json', json);

      }
  }

  if(check){
    return "금액을 정확히 입력해 주십시오.";
  }else{
    return "오류가 발생했습니다. 처음부터 다시 해주십시오.";
  }
}

// 본인 JSON 내용 콘솔 출력
function _displayAccount(userID){
  for(var item in obj.table){
    if(obj.table[item].id == userID){
      console.log(obj.table[item]);
      }
    }
  }

// 금액 입력
apiRouter.post('/inputMoney', function(req, res) {
  const responseBody = {
    version: "2.0",
    template: _writeMoney(req.body.userRequest.user.id, req.body.userRequest.utterance, req._startTime)

  };
  console.log("inputMoney " + req.body.userRequest.utterance);
  res.status(200).send(responseBody);
});

// JSON내 금액 쓰기
function _writeMoney(userID, money, time) {
  var check = false;
  for(var item in obj.table){
      if(obj.table[item].id == userID){
        check = true;

        obj.table[item].type = "PA";
        obj.table[item].money = money;
        obj.table[item].time = time;

        var returnText = obj.table[item].name + " " + obj.table[item].purpose + " " + obj.table[item].money + "\n전송 하려면 전송코드를 입력하시오.";
        var json = JSON.stringify(obj);
        fs.writeFile('PandoraBotJSON.json', json);
      }
  }

  var returnObj;
  if(check){
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
  }else{
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
}

// 본인 JSON 입력값 반환
function _inputCheck(userID){

  for(var item in obj.table){
    if(obj.table[item].id == userID){
      return obj.table[item];
    }
  }
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

  console.log("JYF_inputMenu" + req.body.userRequest.utterance);

  console.log(responseBody);
  res.status(200).send(responseBody);
});

// JSON내 진영식품 메뉴 쓰기
function _JYFwriteMenu(userID, menu, time) {
  var check = false;
  var returnText;
  for(var item in obj.table){
      if(obj.table[item].id == userID){
        check = true;

        obj.table[item].type = "JYF";
        obj.table[item].jyf_menu = menu;
        obj.table[item].time = time;
        
        returnText = obj.table[item].name + " " + obj.table[item].jyf_menu + "\n전송 하려면 전송코드를 입력하시오.";
        var json = JSON.stringify(obj);
        fs.writeFile('PandoraBotJSON.json', json);
      }
  }
console.log(check);
console.log(returnText);

  if(check){
    return returnText;
  }else{
    return "오류가 발생했습니다. 처음부터 다시 해주십시오.";
  }
}
// ^------ 진영 식품 -------^

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
  var sendObj = _inputCheck(req.body.userRequest.user.id);

  callAppsScript(_auth, sendObj);
  console.log("sendData " + req.body.userRequest.utterance);
  console.log(responseBody);
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
