let yInfo = {
    id: '',
    author: '',
    title: '',
    duration: 0,
    listid: ''
};

const mnuInit = [
    {
        id: 'pdjmnuTitle',
        title: '재생목록 새로고침',
        act: function () {
            //mnuInit[0].title = '잠시만 기다려 주세요.';
            delMenu();
            loadPlaylist();

        }
    },
    {
        id: 'pdjmnuSeparator1',
        type: 'separator'
    }
];

let mnuPlaylist = [];

const mnuAppend = [
    {
        id: 'pdjmnuSeparator2',
        type: 'separator'
    },
    {
        id: 'pdjmnuAppend',
        title: '목록 맨 뒤 추가',
        type: 'checkbox',
        checked: false,
        act: function () {
            mnuAppend[1].checked = !mnuAppend[1].checked;
        }
    }
];

const listeners = {};

const addMenu = (menu, root = null) => {
    for (let item of menu) {
        let {
            id,
            title,
            act,
            type = null,
            checked
        } = item;
        chrome.contextMenus.create({
            id: id,
            title: title,
            type: type,
            checked: checked,
            contexts: ['link']
        });
        if (act) {
            listeners[id] = act;
        } else {
            listeners[id] = function (info) {
                sibal(info);
            }
        }

    }
};

function delMenu(menuid = null) {
    if (menuid)
        chrome.contextMenus.remove(menuid, function () {
            const i = mnuPlaylist.findIndex(function (item) {
                return item.id === menuid
            });
            if (i > -1) mnuPlaylist.splice(i, 1);
        });
    else
        chrome.contextMenus.removeAll(function () {
            addMenu(mnuInit);
            mnuPlaylist = [];
        });
}

function sibal(e) {

    let rawurl;

    yInfo.listid = e.menuItemId.substring(1);

    if (e.linkUrl)
        if (e.linkUrl.match("youtu.be/") == "youtu.be/") {

            rawurl = e.linkUrl.substr(e.linkUrl.indexOf('youtu.be/') + 9, 11);

        } else if (e.linkUrl.match("youtube.com/watch\\?v=") == "youtube.com/watch?v=") {
        rawurl = e.linkUrl.substr(e.linkUrl.indexOf('=') + 1, 11);
    }
    /* else if (e.pageUrl.match("youtube.com/watch\\?v=") == "youtube.com/watch?v=") {
            rawurl = e.pageUrl.substr(e.pageUrl.indexOf('=') + 1, 11);
        }*/
    if (rawurl) {
        getYoutube(rawurl);
    }

}

//플레이리스트 로드
function loadPlaylist() {
    chrome.contextMenus.update("pdjmnuTitle", {
        title: '잠시 기다려주세요.',
        enabled: false
    });

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
        //setStatus("Plug.DJ에 로그인되어있지 않습니다.");
        chrome.contextMenus.create({
            id: "pdjmnuNotAuth",
            title: "로그인을 해주세요.",
            contexts: ['link'],
            enabled: false
        });
        return 0;
    }

    if (json.data.length == 0) {
        //setStatus("재생목록이 없습니다.");
        chrome.contextMenus.create({
            id: "pdjmnuNoList",
            title: "재생목록이 없습니다.",
            contexts: ['link'],
            enabled: false
        });
        return 0;
    }

    //재생목록메뉴 추가하는 부분
    json.data.forEach(function (e) {
        var title = e.active ? "🎧 " : "";
        title = title + e.name + ' (' + e.count + ')';
        mnuPlaylist.push({
            "id": "i" + e.id,
            "title": title
        });
    });

    addMenu(mnuPlaylist);
    addMenu(mnuAppend);
    chrome.contextMenus.update("pdjmnuTitle", {
        title: '재생목록 새로고침',
        enabled: true
    });
}

//노래 추가
function addSong() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function (e) {
        if (e.target.status == 200) {
            var response = e.target.responseText;
            addSongResult(response);
        } else {
            setStatus("오류발생. 다시 시도해주세요.");
            delMenu();
            loadPlaylist();
        }
    });
    xhr.open('POST', 'https://plug.dj/_/playlists/' + yInfo.listid + '/media/insert');
    xhr.setRequestHeader('Content-Type', 'application/json');
    var body = '';
    body += '{\n';
    body += '  "media": [\n';
    body += '    {\n';
    body += '      "id": 0,\n';
    body += '      "format": 1,\n';
    body += '      "cid": "' + yInfo.id + '",\n';
    body += '      "author": "' + yInfo.author + '",\n';
    body += '      "title": "' + yInfo.title + '",\n';
    body += '      "image": "https://i.ytimg.com/vi/' + yInfo.id + '/default.jpg",\n';
    body += '      "duration": ' + yInfo.duration + '\n';
    body += '    }\n';
    body += '  ],\n';
    body += '  "append": ' + mnuAppend[1].checked + '\n';
    body += '}';
    xhr.send(body);
}

function addSongResult(e) {
    var json = JSON.parse(e);
    if (json.status == "notAuthorized") {
        setStatus("Plug.DJ에 로그인되어있지 않습니다.");
        return 0;
    } else if (json.status == "ok") {

    }
    let msg = '';
    msg += "곡 추가 완료!\r\n";
    msg += "\r\n제목 : " + yInfo.title;
    msg += "\r\n가수 : " + yInfo.author;
    msg += "\r\n길이 : " + yInfo.duration;
    msg += "\r\n목록 : " + mnuPlaylist.find(i => i.id == "i" + yInfo.listid).title;
    setStatus(msg);
    delMenu();
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
    var tempTitle = cData.split('"title":"')[1].split('","')[0];
    var hasAuthor = tempTitle.match('-') == '-';

    yInfo.id = cData.split('"videoId":"')[1].split('"')[0];
    yInfo.title = hasAuthor ? (tempTitle.split('-').slice(1).join('-')).trim() : tempTitle;
    yInfo.author = tempTitle.match('-') == '-' ? (tempTitle.split('-')[0]).trim() : "Unknown";
    yInfo.duration = cData.split('"lengthSeconds":"')[1].split('"')[0];

    addSong();
}


function setStatus(e) {
    alert(e);
}

addMenu(mnuInit);
loadPlaylist();

chrome.contextMenus.onClicked.addListener((info) => {
    listeners[info.menuItemId](info);
});
