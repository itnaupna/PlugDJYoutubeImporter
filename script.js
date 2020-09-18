/*

TODO : 컨텍스트 메뉴 추가

*/


//이벤트리스너 추가
function init() {

    loadPlaylist();

    document.getElementById("btnSearch").addEventListener("click", function () {
        getYoutube(document.getElementById("txtYoutube").value);
    });
    document.getElementById("btnRefresh").addEventListener("click", function () {
        setStatus("플레이리스트 다시 불러오는 중");
        document.getElementById("userList").innerHTML = "";
        loadPlaylist();
    });
    document.getElementById("txtYoutube").addEventListener("paste", handlePaste);
    document.getElementById("tempid").innerText = info;
}

function handlePaste(e) {
    var cData, pData;
    e.stopPropagation();
    e.preventDefault();

    cData = e.clipboardData || window.clipboardData;
    pData = cData.getData('Text');

    if (pData.match("youtu.be/") == "youtu.be/") {
        pData = pData.substring(pData.length - 11, pData.length);
    } else if (pData.match("youtube.com/watch\\?") == "youtube.com/watch?") {
        pData = pData.split("v=")[1].split("&")[0];
        //pData = pData.substr(pData.indexOf('=') + 1, 11);
    }
    pData = pData.substring(0, 11);
    document.getElementById("txtYoutube").value = pData;

    //alert(pData);
}


//플레이리스트 로드
function loadPlaylist() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function (e) {
        var response = e.target.responseText;
        addPlaylist(response);
    });
    xhr.open('GET', 'https://plug.dj/_/playlists');
    xhr.send();
}

//플레이리스트 추가
function addPlaylist(e) {

    var json = JSON.parse(e);

    if (json.status == "notAuthorized") {
        setStatus("Plug.DJ에 로그인되어있지 않습니다.");
        return 0;
    }

    if (json.data.length == 0) {
        setStatus("재생목록이 없습니다.");
        return 0;
    }


    var htmldata = "";
    var cnt = 0;

    json.data.forEach(function (e) {
        var activetext = e.active ? " activated" : "";
        htmldata += '<div id="i' + e.id + '" class="row' + activetext + '">' + e.name + ' <span class="count">(' + e.count + ')</span></div>';

    });

    document.getElementById("userList").innerHTML = htmldata;
    Array.from(document.getElementsByClassName("row")).forEach(function (e) {
        e.addEventListener("click", function () {
            addSong(e.id.substring(1), document.getElementById("isAppend").checked);
            setStatus(e.id.substring(1) + ' 추가');
        });
    });

    setStatus("플레이리스트 불러오기 성공");
}

//노래 추가
function addSong(listID, isAppend) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function (e) {
        var response = e.target.responseText;
        addSongResult(response);
    });
    var cid = document.getElementById("txtYoutubeID").value;
    var author = document.getElementById("txtSinger").value;
    var title = document.getElementById("txtTitle").value;
    var duration = document.getElementById("txtDuration").value;
    xhr.open('POST', 'https://plug.dj/_/playlists/' + listID + '/media/insert');
    xhr.setRequestHeader('Content-Type', 'application/json');
    var body = '';
    body += '{\n';
    body += '  "media": [\n';
    body += '    {\n';
    body += '      "id": 0,\n';
    body += '      "format": 1,\n';
    body += '      "cid": "' + cid + '",\n';
    body += '      "author": "' + author + '",\n';
    body += '      "title": "' + title + '",\n';
    body += '      "image": "https://i.ytimg.com/vi/' + cid + '/default.jpg",\n';
    body += '      "duration": ' + duration + '\n';
    body += '    }\n';
    body += '  ],\n';
    body += '  "append": ' + isAppend + '\n';
    body += '}';
    xhr.send(body);
}

function addSongResult(e) {
    var json = JSON.parse(e);
    if (json.status == "notAuthorized") {
        setStatus("Plug.DJ에 로그인되어있지 않습니다.");
        return 0;
    }
    setStatus("곡 추가 완료!");
    loadPlaylist();

}

var yDomain = 'https://www.youtube.com/watch?v='

//유튭정보따옴
function getYoutube(rawurl) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function (e) {
        var response = e.target.responseText;
        parseYoutube(response);

    });
    xhr.open('GET', yDomain + rawurl);
    xhr.send();
}

//유튭정보파싱
function parseYoutube(e) {
    if (e.match("videoDetails") != "videoDetails") {
        setStatus("올바르지 않은 유튜브 주소입니다.");
        return 0;
    }
    var cData = e.split('"videoDetails":{')[1].split(',"channelId"')[0];
    var yID = cData.split('"videoId":"')[1].split('"')[0];
    var tempTitle = cData.split('"title":"')[1].split('","')[0];
    var hasAuthor = tempTitle.match('-') == '-';

    var yTitle = hasAuthor ? (tempTitle.split('-').slice(1).join('-')).trim() : tempTitle;

    var ySinger = tempTitle.match('-') == '-' ? (tempTitle.split('-')[0]).trim() : "Unknown";

    var yLength = cData.split('"lengthSeconds":"')[1].split('"')[0];
    var sec = yLength;
    var hour = sec >= 3600 ? String("0" + parseInt(parseInt(sec / 60) / 60).toString()).slice(-2) + ':' : '';
    var min = String("0" + (parseInt(sec / 60) % 60).toString()).slice(-2);
    sec = String("0" + (sec % 60).toString()).slice(-2);
    document.getElementById("txtDuration").value = yLength;
    document.getElementById("youtubeResult").style.display = "initial";
    document.getElementById("txtSinger").value = ySinger;
    document.getElementById("txtTitle").value = yTitle;
    document.getElementById("txtYoutubeID").value = yID;
    document.getElementById("youtubeThumbnail").innerText = hour + min + ':' + sec;
    document.getElementById("youtubeThumbnail").style.backgroundImage = "url('https://i.ytimg.com/vi/" + yID + "/default.jpg')";
}









function setStatus(e) {
    document.getElementById("statusBar").innerText = "상태 : " + e;

}

window.onload = init();
