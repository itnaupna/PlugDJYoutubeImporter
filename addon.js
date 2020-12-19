let tmpdiv = document.createElement('div');
tmpdiv.id = "customMenu";
tmpdiv.style.position = "fixed";
tmpdiv.style.top = "5px";
tmpdiv.style.left = "5px";
document.getElementById('body').appendChild(tmpdiv);
let customMenu = document.getElementById('customMenu');

customMenu.innerHTML +=
    `<button id="customaddonbtn" style="font-family: Typewriter; font-size: 20px; display: inline-block; width:160px;" class="tabbtn" onclick="toggleAddonmenu()">AddonSetting</button>
        <div class="popup" id="custommenu" style="overflow: hidden; display:none; transform: none; width: 160px;height:auto; top: 50px; left: 5px;">
            <button class="storebtn" id="cauto0" style="height:25px;width:120px;margin:5px;font-size:13px;" onclick="togglecauto(0)">Max</button><br/>
            <button class="storebtn" id="cauto1" style="height:25px;width:120px;margin:5px;font-size:13px;" onclick="togglecauto(1)">DimBoost</button><br/>
            <button class="storebtn" id="cauto2" style="height:25px;width:120px;margin:5px;font-size:13px;" onclick="togglecauto(2)">Galaxy</button><br/>
            <button class="storebtn" id="cauto3" style="height:25px;width:120px;margin:5px;font-size:13px;" onclick="togglecauto(3)">BigCrunch</button><br/>
            <button class="storebtn" id="cauto4" style="height:25px;width:120px;margin:5px;font-size:13px;" onclick="togglecauto(4)">RGalaxy</button><br/>
            <input type="text" onchange="" id="advEPvalue" style="width:90px;text-align:center;"><br/>
            <button class="storebtn" id="cauto5" style="height:25px;width:120px;margin:5px;font-size:13px;" onclick="togglecauto(5)">EP Advanced</button><br/>
            <button class="storebtn" id="forceInit" style="height:25px;width:120px;margin:5px;font-size:13px;" onclick="forcecustomInit()">EP Init</button><br/>
        </div>

`;
let cauto = [0, 0, 0, 0, 0, 0];
//맥스,세컨드,갤럭시,빅크런치,복제은하,EP고급

function togglecauto(id) {
    if (cauto[id] == 0) {
        document.getElementById(`cauto${id}`).className = "timestudybought";
        switch (id) {
            case 0:
                cauto[id] = setInterval(function () {
                    document.getElementById("maxall").onclick();
                }, 1);
                break;
            case 1:
                cauto[id] = setInterval(function () {
                    document.getElementById("softReset").onclick();
                }, 1);
                break;
            case 2:
                cauto[id] = setInterval(function () {
                    document.getElementById("secondSoftReset").onclick();
                }, 1);
                break;
            case 3:
                cauto[id] = setInterval(function () {
                    bigCrunch();
                }, 1);
                break;
            case 4:
                cauto[id] = setInterval(function () {
                    replicantiGalaxy();
                }, 1);
                break;
            case 5:
                document.getElementById("advEPvalue").readOnly = true;
                cauto[id] = setInterval(function () {
                    if (shortenDimensions(gainedEternityPoints()) * 1 >= document.getElementById("advEPvalue").value * 1) {
                        player.respec = true;
                        var tmpi = 0;
                        for (tmpi = 0; tmpi < 20; tmpi++) eternity(true);
                        player.respec = false;
                        importStudyTree("11,22,32,42,51,61,73,83,93,103,111,121,131,141,151,161,171,162,21,31,41,33|0")
                    }
                }, 1000);
                break;
        }
    } else {
        clearInterval(cauto[id]);
        document.getElementById(`cauto${id}`).className = "storebtn";
        cauto[id] = 0;
        if (id == 5)
            document.getElementById("advEPvalue").readOnly = false;
    }
}

function forcecustomInit() {
    player.respec = true;
    var tmpi = 0;
    for (tmpi = 0; tmpi < 20; tmpi++) eternity(true);
    player.respec = false;
    importStudyTree("11,22,32,42,51,61,73,83,93,103,111,121,131,141,151,161,171,162,21,31,41,33|0")
}



function toggleAddonmenu() {
    document.getElementById("custommenu").style.display == "block" ? document.getElementById("custommenu").style.display = "none" : document.getElementById("custommenu").style.display = "block";
}
