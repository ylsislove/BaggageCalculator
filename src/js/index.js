
import "layui-src/dist/css/layui.css";
import "../css/index.css";

import "./calculate.js";

import "layui-src";
layui.config({
  dir: '../node_modules/layui-src/dist/'
})


// 页面加载完毕后执行此函数
window.onload = function () {
    selectInland();
}

layui.use(['form'], function () {
    let form = layui.form,
        $ = layui.$;

    // 变换国内航线和国际航线时执行此函数
    form.on('select(test)', function (data) {
        data.value === '国内航线' ? selectInland() : selectOutland();
        form.render();
    });

    form.verify({
        positive: function (value, item) { //value：表单的值、item：表单的DOM对象
            if (parseFloat(value) < 0) {
                return '请输入一个不小于0的整数或浮点数';
            }
        }
    });

    // 动态添加行李信息
    document.getElementById('addBtn').addEventListener('click', function (ev) {
        let count = document.getElementById('baggageSum').value;
        let newRow = '<tr>' + $('#baggageRow').html() + '</tr>';
        newRow = newRow.replace(/00/g, ++count);
        newRow = newRow.replace(/value="0"/g, 'value=""');
        $("#baggageTable tr:last").after(newRow);
        $("#baggageSum").val(count);
        // 更新表单渲染
        form.render();
    });

    // 获取表单数据，进行计算
    form.on('submit(calculate)', function (data) {
        let count = document.getElementById('baggageSum').value;
        if (parseInt(count) === 0) {
            layer.msg("请填写至少一件行李的信息");
        }
        else {
            try {
                result = calculateBaggagePrice(JSON.stringify(data.field));
                console.log(result);
                layer.alert('收费价格为：' + result.price + '元\n' + result.message);
            }
            catch {
                layer.alert('诶呀程序出错了，请联系开发人员(~_~)');
            }
        }
        return false;
    });
});

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