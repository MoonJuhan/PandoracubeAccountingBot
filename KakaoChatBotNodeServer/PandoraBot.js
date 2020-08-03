const express = require('express');
const app = express();
const axios = require('axios');
const logger = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
require('dotenv').config({ path: 'PandoraBot.env' });
const port = 8888;

const apiRouter = express.Router();

app.use(logger('dev', {}));
app.use(bodyParser.json());
app.use('/api', apiRouter);

const fs = require('fs');

const readline = require('readline');
const { google } = require('googleapis');

var _auth;

var obj = {
  table: []
};

fs.readFile("PandoraBotJSON.json", function (err, data) {
  obj = JSON.parse(data);
});

// 최초 및 수정시 이름 체크
apiRouter.post('/nameInput', function (req, res) {
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
  console.log("nameInput " + obj.table[_checkJSON(req.body.userRequest.user.id)].name + " " + req.body.userRequest.utterance + " " + req._startTime);
  res.status(200).send(responseBody);
});

// 이름 확인
apiRouter.post('/nameCheck', function (req, res) {
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
  console.log("nameCheck " + obj.table[_checkJSON(req.body.userRequest.user.id)].name + " " + req.body.userRequest.utterance + " " + req._startTime);
  res.status(200).send(responseBody);
});

// JSON내 이름 체크 함수
function _nameCheck(_userID, userName) {
  var userNum = _checkJSON(_userID);

  console.log("userNum = " + userNum);
  if (userNum == "empty") {
    // JSON에 이름 없음
    console.log("userName = " + userName);
    if (userName == "NULL") {
      return "처음 접속 하였습니다. 이름을 정확히 입력해주세요. 입력에 이상이 있을경우 담당자에게 문의 바랍니다.";
    } else {
      obj.table.push({
        id: _userID,
        name: userName,
        type: "",
        time: "",
        pa_input: {
          purpose: "",
          money: "",
        },
        pa_output: {
          pa_receiveMonth: "0",
          pa_fee: "1"
        },
        jyf_input: {
          jyf_menu: ""
        },
        jyf_output: {
          jyf_num1: "0",
          jyf_num2: "0",
          jyf_num3: "0",
          jyf_total: "0",
          jyf_ranking: "X",
          jyf_allSeasonTotal: "",
          jyf_rank: ""
        }
      });
      writeJSON();
      return "처음 접속 하였습니다." + userName + "님 안녕하세요.";
    }
  } else {
    // JSON에 이름 있음
    if (userName == "D") {
      // 이름 수정
      obj.table[userNum].name == "";
      writeJSON();
      return "이름을 수정합니다. 이름을 정확히 입력해주세요.";
    } else if (userName == "NULL") {
    } else {
      obj.table[userNum].name = userName;
      writeJSON();
    }

    return obj.table[userNum].name + "님 안녕하세요.";
  }
}

// 이름 수정
apiRouter.post('/editName', function (req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: _nameCheck(req.body.userRequest.user.id, "D")
          }
        }
      ]
    }
  };

  console.log("editName " + req.body.userRequest.utterance + " " + req._startTime);
  res.status(200).send(responseBody);
});

// 향상된 회비 입력 스킬
apiRouter.post('/enhancedDepositCheck', function (req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: parameterCheck(req)
          }
        }
      ],
      quickReplies: [
        {
          action: "block",
          label: "전송하기",
          messageText: sendText(req),
          blockId: "5cf4aa1892690d0001191295"
        },
        {
          action: "block",
          label: "수정하기",
          messageText: "수정하기",
          blockId: "5e0d61b38192ac000179131c"
        },
        {
          action: "block",
          label: "처음으로",
          messageText: "처음으로",
          blockId: "5ceb722905aaa7533585ab8b"
        }
      ]
    }
  };
  res.status(200).send(responseBody);
});

function parameterCheck(req) {
  var returnObj = checkParams(req);

  if (returnObj.purpose != "" && returnObj.money != "") {
    var returnText = "입력된 값\n목적 : " + returnObj.purpose + "\n" + "금액 : " + returnObj.money + "원";

    return returnText;
  } else {
    return "오류가 발생하였습니다. 처음으로 돌아가십시오.";
  }
}

function sendText(req) {
  var returnObj = checkParams(req);

  if (returnObj.purpose != "" && returnObj.money != "") {
    var returnText = "목적 : " + returnObj.purpose + "\n" + "금액 : " + returnObj.money + "원\n전송하겠습니다.";

    return returnText;
  } else {
    return "오류가 발생하였습니다. 처음으로 돌아가십시오.";
  }
}

function checkParams(req) {
  var returnObj = {
    "purpose": "",
    "money": ""
  }

  try {
    returnObj.purpose = req.body.action.params["목적"];
    returnObj.money = req.body.action.params["금액"].split(",")[0].split(":")[1].slice(1);
  } catch (e) {
    returnObj.purpose = "";
    returnObj.money = "";
  }

  return returnObj;
}


// JSON내 목적 쓰기
function _writePurpose(_userID, purpose) {
  var userNum = _checkJSON(_userID);
  if (userNum == "empty") {
    return "오류가 발생했습니다. 처음부터 다시 해주십시오.";
  }
  obj.table[userNum].type = "PA";
  obj.table[userNum].pa_input.purpose = purpose;

  writeJSON();
  return "금액을 정확히 입력해 주십시오.";
}

// 본인 JSON 입력값 반환
function _checkJSON(_userID) {
  for (var item in obj.table) {
    if (obj.table[item].id == _userID) {
      console.log(obj.table[item].name);
      return item;
    }
  }
  return "empty";
}

// 시트에서 데이터 읽어오는중
apiRouter.post('/readFee', function (req, res) {
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
          label: "회비 확인 출력",
          blockId: "5d882afdffa7480001515981",
          extra: {
          }
        }
      ]
    }
  };

  var userNum = _checkJSON(req.body.userRequest.user.id);
  pa_exportJson(userNum);
  updateJsonDB();
  console.log("readFee" + obj.table[userNum].name + " " + req.body.userRequest.utterance + " " + req._startTime);
  res.status(200).send(responseBody);
});

// 회비 제출 확인
apiRouter.post('/checkFee', function (req, res) {
  const responseBody = {
    version: "2.0", template: {
      outputs: [
        {
          simpleText: {
            text: pa_loadFee(req.body.userRequest.user.id)
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
  console.log("checkFee " + obj.table[_checkJSON(req.body.userRequest.user.id)].name + " " + req.body.userRequest.utterance + " " + req._startTime);
  res.status(200).send(responseBody);
});

// JSON에서 회비 확인 읽기
function pa_exportJson(_userNum) {
  var sheetDataLink_PA = "https://spreadsheets.google.com/feeds/cells/1llk5IZ41U5Ul3kOQva8jkZwZlreHBmtzTwhgTwpeXGo/4/public/basic?alt=json-in-script&min-col=11&max-col=13&min-row=4";

  axios.get(sheetDataLink_PA).then(function (response) {
    var sheetJson = response.data.slice(28, response.data.length - 2);
    entry = JSON.parse(sheetJson).feed.entry;

    for (var i in entry) {
      if (entry[i].content.$t == obj.table[_userNum].name) {
        var num = i;
        num++;
        obj.table[_userNum].pa_output.pa_receiveMonth = entry[num].content.$t;
        num++;
        obj.table[_userNum].pa_output.pa_fee = entry[num].content.$t;
        writeJSON();
        return 0;
      }
    }
  })
    .catch(function (error) {
      console.log(error);
    });
}

// JSON에서 회비 확인 데이터 읽기
function pa_loadFee(_userID) {
  var returnText;
  var userNum = _checkJSON(_userID);

  if (userNum == "empty") {
    return "오류가 발생했습니다. 처음부터 다시 해주십시오.";
  }

  var price = 5000;
  if (obj.table[userNum].pa_output.pa_fee == 2) {
    price = 3000;
  }
  returnText = obj.table[userNum].name + "님의 회비 확인\n" + obj.table[userNum].pa_output.pa_receiveMonth + "월 까지 제출 했습니다.\n회비는 한달에 " + price + "원 입니다.";
  return returnText;
}

// JSON 저장
function writeJSON() {
  var json = JSON.stringify(obj);
  fs.writeFile('PandoraBotJSON.json', json, function (err, result) {
    if (err) console.log('error', err);
  });
}

// 전송후 Google Apps Script 호출
apiRouter.post('/sendData', function (req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "전송되었습니다." // 오픈 빌더에서 텍스트 출력
          }
        }
      ]
    }
  };


  callAppsScript(_auth, manufactureSendObj(req));


  res.status(200).send(responseBody);
});

function manufactureSendObj(req) {
  var utterance = req.body.userRequest.utterance;
  var returnObj = {
    pa_input: {
      purpose: "",
      money: ""
    },
    type: "PA",
    name: ""
  };

  utterance = utterance.split("\n");

  returnObj.pa_input.purpose = utterance[0].split(" : ")[1];
  returnObj.pa_input.money = utterance[1].split(" : ")[1];
  returnObj.name = obj.table[_checkJSON(req.body.userRequest.user.id)].name;
  console.log(returnObj);

  return returnObj;
}


app.listen(port, function () {
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
  const { client_secret, client_id, redirect_uris } = credentials.installed;
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
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client, {});
      _auth = oAuth2Client;
    });
  });
}

// Google Apps Script 불러오기
function callAppsScript(auth, parameter) { // eslint-disable-line no-unused-vars
  const scriptId = "INPUT_YOUR_SCRIPT_ID";
  const script = google.script('v1');

  script.scripts.run({
    auth: auth,
    resource: {
      function: 'myFunction',
      devMode: "true",
      parameters: parameter
    },
    scriptId: scriptId,
  }, function (err, resp) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    if (resp.error) {
      const error = resp.error.details[0];
      console.log('Script error message: ' + error.errorMessage);
      console.log('Script error stacktrace:');

      if (error.scriptStackTraceElements) {
        for (let i = 0; i < error.scriptStackTraceElements.length; i++) {
          const trace = error.scriptStackTraceElements[i];
          console.log('\t%s: %s', trace.function, trace.lineNumber);
        }
      }
    } else {
      const folderSet = resp.data.response.result;
      if (Object.keys(folderSet).length == 0) {
        console.log('No folders returned!');
      } else {
        console.log('Folders under your root folder:');
        Object.keys(folderSet).forEach(function (id) {
          console.log('\t%s (%s)', folderSet[id], id);
        });
      }

    }
  });

  // DB 업데이트
  updateJsonDB();
}

// Node.js JSON DB 업데이트
function updateJsonDB() {
  var sheetDataLink_PA = "INPUT_YOUR_SPREADSHEET_LINK";

  axios.get(sheetDataLink_PA).then(function (response) {
    var sheetJson = response.data.slice(28, response.data.length - 2);
    entry = JSON.parse(sheetJson).feed.entry;

    for (var i in entry) {
      if (entry[i].content.$t.length >= 2 && entry[i].content.$t.length <= 4) {
        for (var x = 0; x < obj.table.length; x++) {
          if (entry[i].content.$t == obj.table[x].name) {
            var num = i;
            num++;
            obj.table[x].pa_output.pa_receiveMonth = entry[num].content.$t;
            num++;
            obj.table[x].pa_output.pa_fee = entry[num].content.$t;
          }
        }
      }
    }
    writeJSON();
  })
    .catch(function (error) {
      console.log(error);
    });
}
