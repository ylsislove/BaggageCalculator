
// 设置对应航线区域的机舱类型是否可选
function setSeatType(area, value) {
    let child = document.getElementById(area).childNodes;
    for (let i = 0, len = child.length; i < len; i++) {
        if (child[i].nodeType === 1) {
            child[i].disabled = !value;
        }
    }
}

// 当选择了国内航线时界面的变化
function selectInland() {
    // 设置航线区域不可见
    document.getElementById("flightArea").style.display = "none";
    // 航线区域默认选项设置为默认值0，不然会被 必填 设置验证为不通过
    document.getElementById("flightAreaOptionDefault").value = "0";
    // vip类型可见
    document.getElementById("vipType").style.display = "";
    // 国内机舱类型可选
    setSeatType('inland', true);
    // 国际、地区机舱类型不可选
    setSeatType('outland', false);
}

// 当选择了国际、地区航线
function selectOutland() {
    // 设置航线区域可见
    document.getElementById("flightArea").style.display = "";
    // 航线区域默认选项设置为默认值空，交给用户去选择，同时启动 必填 验证机制
    document.getElementById("flightAreaOptionDefault").value = "";
    // vip类型不可见
    document.getElementById("vipType").style.display = "none";
    // 国内机舱类型不可选
    setSeatType('inland', false);
    // 国际、地区机舱类型可选
    setSeatType('outland', true);
}