var obj = {
  table: [],
  jyf_info: {
    menu1: {
      name: "",
      stock: "",
      total: ""
    },
    menu2: {
      name: "",
      stock: "",
      total: ""
    },
    menu3: {
      name: "",
      stock: "",
      total: ""
    }
  }
};

// ------- 진영 식품 --------
// 메뉴 입력
apiRouter.post('/JYF_inputMenu', function (req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: jyf_writeMenu(req.body.userRequest.user.id, req.body.userRequest.utterance)
          }
        }
      ],
      quickReplies: [
        {
          action: "block",
          label: "전송하기",
          blockId: "5d6f63ab92690d0001812746"
        }
      ]
    }
  };

  console.log("JYF_inputMenu" + obj.table[_checkJSON(req.body.userRequest.user.id)].name + " " + req.body.userRequest.utterance + " " + req._startTime);
  res.status(200).send(responseBody);
});

// JSON내 진영식품 메뉴 쓰기
function jyf_writeMenu(_userID, menu) {
  var returnText;
  var userNum = _checkJSON(_userID);

  if (userNum == "empty") {
    return "오류가 발생했습니다. 처음부터 다시 해주십시오.";
  }

  obj.table[userNum].type = "JYF";
  obj.table[userNum].jyf_input.jyf_menu = menu;

  returnText = obj.table[userNum].name + " " + obj.table[userNum].jyf_input.jyf_menu + "\n서버에 전송 하려면 하단의 버튼을 누르세요.";

  writeJSON();
  return returnText;
}

// 메뉴 전송
apiRouter.post('/JYF_sendData', function (req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "전송 되었습니다."
          }
        }
      ],
      quickReplies: [
        {
          action: "block",
          label: "처음으로",
          blockId: "5ceb722905aaa7533585ab8b"
        }
      ]
    }
  };
  callAppsScript(_auth, obj.table[_checkJSON(req.body.userRequest.user.id)]);
  updateJsonDB();
  console.log("JYF_sendData" + obj.table[_checkJSON(req.body.userRequest.user.id)].name + " " + req.body.userRequest.utterance + " " + req._startTime);
  res.status(200).send(responseBody);
});

// 시트에서 데이터 읽어오는중
apiRouter.post('/JYF_readBill', function (req, res) {
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
  jyf_exportJson(userNum);
  updateJsonDB();
  console.log("JYF_readBill" + obj.table[_checkJSON(req.body.userRequest.user.id)].name + " " + req.body.userRequest.utterance + " " + req._startTime);

  console.log(responseBody);
  res.status(200).send(responseBody);
});

// 본인 장부 확인
apiRouter.post('/JYF_checkBill', function (req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: jyf_loadBill(req.body.userRequest.user.id)
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

  console.log("JYF_checkBill" + obj.table[_checkJSON(req.body.userRequest.user.id)].name + " " + req.body.userRequest.utterance + " " + req._startTime);

  console.log(responseBody);
  res.status(200).send(responseBody);
});

// JSON에서 장부 읽기
function jyf_loadBill(_userID) {
  var returnText;
  var userNum = _checkJSON(_userID);

  if (userNum == "empty") {
    return "오류가 발생했습니다. 처음부터 다시 해주십시오.";
  }
  returnText = "-- " + obj.table[userNum].name + "님의 장부 --\n등수 : " + obj.table[userNum].jyf_output.jyf_ranking + "\n참깨라면 " + obj.table[userNum].jyf_output.jyf_num1 + "개\n오뚜기밥 " + obj.table[userNum].jyf_output.jyf_num2 + "개\n박카스 " + obj.table[userNum].jyf_output.jyf_num3 + "개\n총액 " + obj.table[userNum].jyf_output.jyf_total + "";
  return returnText;
}

// 시트JSON에서 데이터 추출해서 JSON에 쓰기
function jyf_exportJson(_userNum) {
  var sheetDataLink_JYF = "INPUT_YOUR_SPREADSHEET_LINK";

  axios.get(sheetDataLink_JYF).then(function (response) {
    var sheetJson = response.data.slice(28, response.data.length - 2);
    entry = JSON.parse(sheetJson).feed.entry;

    for (var i in entry) {
      if (entry[i].content.$t == obj.table[_userNum].name) {
        var num = i;
        num++;
        console.log(obj.table[_userNum].jyf_output.jyf_allSeasonTotal);
        console.log(entry[num].content.$t);
        obj.table[_userNum].jyf_output.jyf_allSeasonTotal = entry[num].content.$t;
        num++;
        obj.table[_userNum].jyf_output.jyf_num1 = entry[num].content.$t;
        num++;
        obj.table[_userNum].jyf_output.jyf_num2 = entry[num].content.$t;
        num++;
        obj.table[_userNum].jyf_output.jyf_num3 = entry[num].content.$t;
        num++;
        obj.table[_userNum].jyf_output.jyf_total = entry[num].content.$t;
        num++;
        obj.table[_userNum].jyf_output.jyf_ranking = entry[num].content.$t;
        num++;
        obj.table[_userNum].jyf_output.jyf_rank = entry[num].content.$t;
        writeJSON();
        return 0;
      }
    }
  })
    .catch(function (error) {
      console.log(error);
    });
}

// 재고 확인
apiRouter.post('/JYF_checkStock', function (req, res) {
  var returnText = "-- 진영 식품 재고 --\n" + obj.jyf_info.menu1.name + " : " + obj.jyf_info.menu1.stock + "\n" + obj.jyf_info.menu2.name + " : " + obj.jyf_info.menu2.stock + "\n" + obj.jyf_info.menu3.name + " : " + obj.jyf_info.menu3.stock;

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
          blockId: "5ceb722905aaa7533585ab8b"
        }
      ]
    }
  };

  console.log("JYF_checkStock" + obj.table[_checkJSON(req.body.userRequest.user.id)].name + " " + req._startTime);

  console.log(responseBody);
  res.status(200).send(responseBody);
});

// ^------ 진영 식품 -------^

// Node.js JSON DB 업데이트
function updateJsonDB() {
  var sheetDataLink_JYF = "INPUT_YOUR_SPREADSHEET_LINK";

  axios.get(sheetDataLink_JYF).then(function (response) {
    var sheetJson = response.data.slice(28, response.data.length - 2);
    entry = JSON.parse(sheetJson).feed.entry;
    for (var i in entry) {

      if (entry[i].content.$t.length >= 2 && entry[i].content.$t.length <= 4) {
        for (var x = 0; x < obj.table.length; x++) {
          if (entry[i].content.$t == obj.table[x].name) {
            var num = i;
            num++;

            obj.table[x].jyf_output.jyf_allSeasonTotal = entry[num].content.$t;
            num++;
            obj.table[x].jyf_output.jyf_num1 = entry[num].content.$t;
            num++;
            obj.table[x].jyf_output.jyf_num2 = entry[num].content.$t;
            num++;
            obj.table[x].jyf_output.jyf_num3 = entry[num].content.$t;
            num++;
            obj.table[x].jyf_output.jyf_total = entry[num].content.$t;
            num++;
            obj.table[x].jyf_output.jyf_ranking = entry[num].content.$t;
            num++;
            obj.table[x].jyf_output.jyf_rank = entry[num].content.$t;
          }
        }
      }


      if (entry[i].content.$t == "재고 내역") {
        var num = parseInt(i);
        num += 4;
        obj.jyf_info.menu1.name = entry[num].content.$t;
        obj.jyf_info.menu1.stock = entry[++num].content.$t;
        obj.jyf_info.menu1.total = entry[++num].content.$t;
        obj.jyf_info.menu2.name = entry[++num].content.$t;
        obj.jyf_info.menu2.stock = entry[++num].content.$t;
        obj.jyf_info.menu2.total = entry[++num].content.$t;
        obj.jyf_info.menu3.name = entry[++num].content.$t;
        obj.jyf_info.menu3.stock = entry[++num].content.$t;
        obj.jyf_info.menu3.total = entry[++num].content.$t;
      }
    }
    writeJSON();
  })
    .catch(function (error) {
      console.log(error);
    });
}
