const tabHeight = 44;
const netease = require('./netease');
var page = 1;
var keyword = "";

function recommend() {
  $ui.toast("加载推荐");
  requestData();
}

function creat() {
  $ui.render({
    views: [{
      type: "menu",
      props: {
        id: "tab_menu",
        items: ["网易云音乐", "无版权音乐"]
      },
      layout: function (make) {
        make.left.top.right.equalTo(0)
        make.height.equalTo(tabHeight)
      },
      events: {
        changed: function (sender) {
          if (sender.index == 0) {
            $("search").hidden = false;
            $("netease_list").hidden = false;
            $("cc0_list").hidden = true;
          } else {
            $("search").hidden = true;
            $("netease_list").hidden = true;
            $("cc0_list").hidden = false;
          }
        }
      }
    }, {
      type: "input",
      props: {
        id: "search",
        type: $kbType.search,
        darkKeyboard: true,
        placeholder: "支持歌手、歌曲名称..."
      },
      layout: function (make, view) {
        make.top.equalTo(tabHeight).offset(tabHeight + 5);
        make.left.equalTo(10);
        make.width.equalTo(view.super).offset(-20);
        make.height.equalTo(35);
      },
      events: {
        returned: function (sender) {
          $ui.loading(true);
          keyword = sender.text;
          page = 1;
          $("netease_list").data = [{
            rows: []
          }];
          $("search").blur();
          requestData();
        }
      }
    }, {
      type: "list",
      props: {
        id: "netease_list",
        rowHeight: 64.0,
        template: listTemplate(),
        data: [{
          rows: []
        }],
        actions: [{
          title: "下载",
          color: $color("tiny"),
          handler: function (tableView, indexPath) {
            listEvent(tableView.object(indexPath).id, tableView.object(indexPath).name.text);
          }
        }]
      },
      layout: function (make, view) {
        make.width.equalTo(view.super);
        make.top.equalTo($("search").bottom).offset(5);
        make.height.equalTo(view.super).offset(-tabHeight - 45);
      },
      events: {
        didSelect: function (tableView, indexPath) {
          listPreview(tableView.object(indexPath).id);
        },
        didReachBottom: function (sender) {
          requestData();
        }
      }
    }, {
      type: "list",
      props: {
        id: "cc0_list",
        rowHeight: 64.0,
        hidden: true,
        template: listTemplate(),
        data: []
      },
      layout: function (make, view) {
        make.width.equalTo(view.super);
        make.top.equalTo($("tab_menu").bottom).offset(5);
        make.height.equalTo(view.super).offset(-45);
      },
      events: {
        didSelect: function (tableView, indexPath) {
          listPreview(tableView.object(indexPath).id);
        }
      }
    }]
  })
  requestData('cc0');
}

function listTemplate() {
  return [{
      type: "image",
      props: {
        id: "album"
      },
      layout: function (make, view) {
        make.left.equalTo(10);
        make.top.equalTo(2);
        make.size.equalTo($size(60, 60));
      }
    }, {
      type: "label",
      props: {
        id: "name",
        font: $font(18)
      },
      layout: function (make, view) {
        make.left.equalTo($("album").right).offset(10);
        make.top.right.inset(8);
        make.height.equalTo(24);
      }
    },
    {
      type: "label",
      props: {
        id: "content",
        textColor: $color("#888888"),
        font: $font(15)
      },
      layout: function (make, view) {
        make.left.right.equalTo($("name"));
        make.top.equalTo($("name").bottom);
        make.bottom.equalTo(0);
      }
    }
  ];
}

function listPreview(id) {
  netease.check(id);
}

function listEvent(id) {
  netease.check(id);
}

function requestData(type = 'search') {
  if (type == 'search') {
    netease.search(keyword, page, function (data) {
      $("netease_list").endFetchingMore();
      data = templateFormat(data);
      let listData = $("netease_list").data[0].rows;
      for (let i in data) {
        listData.push(data[i]);
      }
      $("netease_list").data = [{
        rows: listData
      }];
      page++;
      $("netease_list").endRefreshing();
      $device.taptic(0);
    });
  } else {
    netease.cc0(function (data) {
      $("cc0_list").data = [{
        rows: templateFormat(data)
      }];
    })
  }
}

function templateFormat(data) {
  var tmpData = [];
  data.forEach(item => {
    tmpData.push({
      album: {
        src: item.album
      },
      name: {
        text: item.name
      },
      content: {
        text: "🎤" + item.artists + " ⏱" + item.duration / 1000 + "s" + " 🆔" + item.id
      },
      id: item.id,
    })
  });

  return tmpData;
}

module.exports = {
  creat: creat
}