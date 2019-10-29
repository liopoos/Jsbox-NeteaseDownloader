const conf = JSON.parse($file.read("assets/conf.json").string);
const requestUrl = conf.requestUrl;

function search(keyword, page, callback) {
  let url = encodeURI(requestUrl + "/search?keywords=" + keyword + "&offset=" + ((page - 1) * 20) + "&limit=20&type=1");
  $http.request({
    url: url,
    handler: function (resp) {
      var data = resp.data
      //console.log(data);
      if (data.code == 200) {
        typeof callback == 'function' && callback(format(data.result.songs));
      } else {
        $ui.error("暂无更多歌曲");
        typeof callback == 'function' && callback([]);
      }
    }
  })
}

function cc0(callback) {
  let now = (new Date()).getTime();
  cc0Data = $cache.get("cc0_music");
  if (typeof cc0Data != 'undefined' && cc0Data.timestamp > (now - 21600000)) {
    typeof callback == 'function' && callback(cc0Data.data);
  } else {
    $http.get({
      url: encodeURI(requestUrl + "/playlist/detail?id=2698360191&s=2")
    }).then(function (resp) {
      if (resp.data.code == 200) {
        cc0Data = {
          timestamp: now,
          data: formatCc0(resp.data.playlist.tracks)
        }
        $cache.set("cc0_music", cc0Data);
        typeof callback == 'function' && callback(cc0Data.data);
      } else {
        $ui.error("无法获取无版权音乐")
      }
    });
  }
}

function format(data) {
  let tmpData = [];
  for (let i in data) {
    tmpData.push({
      "id": data[i].id,
      "name": data[i].name,
      "artists": data[i].artists[0].name,
      "album": data[i].album.artist.img1v1Url,
      "duration": data[i].duration,
    })
  }
  return tmpData;
}

function formatCc0(data) {
  let tmpData = [];
  for (let i in data) {
    tmpData.push({
      "id": data[i].id,
      "name": data[i].name,
      "artists": data[i].ar[0].name,
      "album": data[i].al.picUrl,
      "duration": data[i].dt,
    })
  }
  return tmpData;
}

function check(id) {
  $ui.toast("正在检查");
  $http.get({
    url: encodeURI(requestUrl + "/check/music?id=" + id)
  }).then(function (resp) {
    if (resp.data.message == 'ok') {
      $quicklook.open({
        url: "https://music.163.com/song/media/outer/url?id=" + id + ".mp3",
        handler: function () {}
      })
    } else {
      $ui.error("无法加载此歌曲")
    }
  });
}

function download(id) {
  $http.download({
    url: "https://music.163.com/song/media/outer/url?id=" + id + ".mp3",
    showsProgress: true,
    progress: function (bytesWritten, totalBytes) {
      var percentage = bytesWritten * 1.0 / totalBytes
    },
    handler: function (resp) {
      $share.sheet(resp.data);
    }
  })
}

module.exports = {
  search: search,
  check: check,
  cc0: cc0
}