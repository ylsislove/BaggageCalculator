function calculateBaggagePrice(data) {

    // console.log(typeof data);
    if ((typeof data) === 'string') {
        data = JSON.parse(data)
        // console.log(typeof data);
    }

    // 航线类型
    let flightType = data.flightType;
    // console.log(flightType);

    // 航线区域
    let flightArea = data.flightArea;
    // console.log(flightArea);

    // 机舱类型
    let seatType = data.seatType;
    // console.log(seatType);

    // 乘客类型
    let peopleType = data.peopleType;
    // console.log(peopleType);

    // vip类型
    let vipType = data.vipType;
    // console.log(vipType);

    // 机票价格
    let ticketPrice = parseFloat(data.ticketPrice);
    // console.log(ticketPrice);

    // 是否残疾
    let isDisability = data.isDisability ? true : false;
    // console.log(isDisability);

    function createBaggage(index) {
        return {
            'type': data['baggageType' + index],
            'length': parseFloat(data['length' + index]),
            'width': parseFloat(data['width' + index]),
            'height': parseFloat(data['height' + index]),
            'weight': parseFloat(data['weight' + index])
        };
    }

    // 可免费托运的特殊行李
    let freeSpecialBaggage1 = ['手动轮椅', '电动轮椅', '...'],
        freeSpecialBaggage2 = ['婴儿车或摇篮', '...'],
        freeSpecialBaggage3 = ['导盲犬', '骨灰', '...'];
    // 运动器械器具
    let sportsSpecialBaggage1 = ['自行车', '...'],
        sportsSpecialBaggage2 = ['皮划艇', '...'],
        sportsSpecialBaggage3 = ['撑杆', '...'];
    // 其他类型
    let othersSpecialBaggage1 = ['睡袋', '...'],
        othersSpecialBaggage2 = ['小型电器或仪器', '...'],
        othersSpecialBaggage3 = ['可作为行李运输的枪支', '...'],
        othersSpecialBaggage4 = ['可作为行李运输的弹药', '...'],
        othersSpecialBaggage5 = ['小动物', '...'];

    // 行李详情
    let baggageCount = parseInt(data.baggageSum);
    let baggageDetail = {
        'normal': [],
        'special': []
    };
    for (let i = 1, cnt = 0; i < 50; i++) {
        let type = data['baggageType' + i];
        // 普通行李，或是按照普通行李类型收费的特殊行李
        if (type === '普通行李' || sportsSpecialBaggage1.includes(type) || othersSpecialBaggage1.includes(type)) {
            baggageDetail.normal.push(createBaggage(i));
            cnt++;
        }
        // 非残疾和非婴儿旅客托运 轮椅或婴儿床，按普通行李收费
        else if ((!isDisability && peopleType !== '婴儿') && (freeSpecialBaggage1.includes(type) || freeSpecialBaggage2.includes(type))) {
            baggageDetail.normal.push(createBaggage(i));
            cnt++;
        }
        // 其余类型的特殊行李
        else if (type) {
            baggageDetail.special.push(createBaggage(i));
            cnt++;
        }
        if (cnt >= baggageCount) {
            break;
        }
    }
    // console.log(baggageDetail);

    // 计算结果
    let result = {
        'message': '',
        'price': 0
    };

    /**
     * ------------------------- 国内航线 ---------------------------
     */
    if (flightType === '国内航线') {

        // 计算免费托运额度
        let weightLimit = 0;
        // 计算随身行李限额
        let carryOnLimit = 0;

        // 成人或儿童
        if (peopleType === '成人' || peopleType === '儿童') {
            switch (seatType) {
                case '头等舱':
                    weightLimit = 40;
                    carryOnLimit = 2;
                    break;
                case '公务舱':
                    weightLimit = 30;
                    carryOnLimit = 2;
                    break;
                case '经济舱':
                    weightLimit = 20;
                    carryOnLimit = 1;
                    break;
            }
        }
        // 婴儿
        else if (peopleType === '婴儿') {
            weightLimit = 10;
            switch (seatType) {
                case '头等舱':
                case '公务舱':
                    carryOnLimit = 2;
                    break;
                case '经济舱':
                    carryOnLimit = 1;
                    break;
            }
        }
        // vip类型
        switch (vipType) {
            case '凤凰知音白金卡':
                weightLimit += 30;
                break;
            case '凤凰知音金卡、银卡':
            case '星空联盟金卡':
                weightLimit += 20;
                break;
        }

        // 计算收费价格
        let baggageWeight = 0;
        for (let i = 0, len = baggageDetail.normal.length; i < len; i++) {
            let baggage = baggageDetail.normal[i];

            // 检查普通行李尺寸是否超标
            if (baggage.length > 100 || baggage.width > 60 || baggage.height > 40) {
                result.message += '行李[' + (i + 1) + ']存在尺寸超标的情况，请合理划分\n';
            }

            // 判断是否可以作为随身行李
            if (baggage.length <= 55 && baggage.width <= 40 && baggage.height <= 20 && carryOnLimit > 0 && baggage.type === '普通行李') {
                if ((seatType === '头等舱' || seatType === '公务舱') && baggage.weight <= 8) {
                    carryOnLimit--;
                    result.message += '行李[' + (i + 1) + ']可以作为随身行李携带，不参与计算\n';
                    continue;
                }
                else if (seatType === '经济舱' && baggage.weight <= 5) {
                    carryOnLimit--;
                    result.message += '行李[' + (i + 1) + ']可以作为随身行李携带，不参与计算\n';
                    continue;
                }
            }

            // 累加重量
            baggageWeight += baggage.weight;
        }
        result.price = baggageWeight > weightLimit ? (baggageWeight - weightLimit) * ticketPrice * 0.015 : 0;


        // 计算特殊行李费用
        for (let i = 0, len = baggageDetail.special.length; i < len; i++) {
            let baggage = baggageDetail.special[i];
            // ---------------- 可免费托运的行李 -----------------
            if ((isDisability && freeSpecialBaggage1.includes(baggage.type)) ||
                (peopleType === '婴儿' && freeSpecialBaggage2.includes(baggage.type)) ||
                (freeSpecialBaggage3.includes(baggage.type))) {
                continue;
            }
            // 非残疾或婴儿旅客托运 轮椅或婴儿床
            else if ((!isDisability || peopleType !== '婴儿') && (freeSpecialBaggage1.includes(baggage.type) || freeSpecialBaggage2.includes(baggage.type))) {
                // 已经按照普通行李进行计算了
            }
            // ---------------- 运动器械器具，计入免费额度 -----------------
            else if (sportsSpecialBaggage1.includes(baggage.type)) {
                // 计入免费额度的特殊行李已经被当作普通行李计算过了
            }
            // ---------------- 运动器械器具，不计入免费额度 -----------------
            else if (sportsSpecialBaggage2.includes(baggage.type) || sportsSpecialBaggage3.includes(baggage.type)) {
                // 根据实际重量收费
                result.price += baggage.weight * ticketPrice * 0.015;
            }
            // ---------------- 其他类型的特殊行李，计入免费额度 -----------------
            else if (othersSpecialBaggage1.includes(baggage.type)) {
                // 计入免费额度的特殊行李已经被当作普通行李计算过了
            }
            // ---------------- 其他类型的特殊行李，不计入免费额度 -----------------
            else if (othersSpecialBaggage2.includes(baggage.type) ||
                othersSpecialBaggage3.includes(baggage.type) ||
                othersSpecialBaggage4.includes(baggage.type) ||
                othersSpecialBaggage5.includes(baggage.type)) {
                // 根据实际重量收费
                result.price += baggage.weight * ticketPrice * 0.015;
            }
        } // !特殊行李for循环结束

    } // !国内航线计算结束

    /**
     * ------------------------- 国际、地区航线 ---------------------------
     */
    else {

        // 五个区域 超重且超尺寸 收费情况
        let weightAndSize = [0, 1400, 1100, 520, 2050, 830];
        // 五个区域 不超重但超尺寸 收费情况
        let noWeightButSize = [0, 980, 690, 520, 1040, 520];
        // 五个区域 超重量(28, 32]但不超尺寸 收费情况
        let weight28To32ButNoSize = [0, 980, 690, 520, 1040, 520];
        // 五个区域 超重量(23, 28]但不超尺寸 收费情况
        let weight23To28ButNoSize = [0, 380, 280, 520, 690, 210];
        // 五个区域 行李件数超出 收费情况
        let exceedBaggage = [
            // 超出的第一件行李 收费情况
            [0, 1400, 1100, 1170, 1380, 830],
            // 超出的第二件行李 收费情况
            [0, 2000, 1100, 1170, 1380, 1100],
            // 超出的第三件行李 收费情况
            [0, 3000, 1590, 1590, 1590, 1590]
        ];

        // 计算随身行李限额
        let carryOnLimit = 0;
        if (seatType === '头等、公务舱') {
            carryOnLimit = 2;
        }
        else {
            carryOnLimit = 1;
        }

        // 遍历行李，检查 重量和尺寸 是否需要收费
        for (let i = 0, len = baggageDetail.normal.length; i < len; i++) {

            let baggage = baggageDetail.normal[i];
            let baggageSize = baggage.length + baggage.width + baggage.height;

            // 检查普通行李尺寸或重量是否合理
            if (baggageSize < 60 || baggageSize > 203 || baggage.weight < 2 || baggage.weight > 32) {
                if (baggage.type === '普通行李') {
                    result.message += '行李[' + (i + 1) + ']存在尺寸或重量不合理的情况，请合理划分\n';
                }
            }

            // 判断是否可以作为随身行李
            if (baggage.length <= 55 && baggage.width <= 40 && baggage.height <= 20 && carryOnLimit > 0 && baggage.type === '普通行李') {
                if (seatType === '头等、公务舱' && baggage.weight <= 8) {
                    carryOnLimit--;
                    result.message += '行李[' + (i + 1) + ']可以作为随身行李携带，不参与计算\n';
                    continue;
                }
                else if (baggage.weight <= 5) {
                    carryOnLimit--;
                    result.message += '行李[' + (i + 1) + ']可以作为随身行李携带，不参与计算\n';
                    continue;
                }
            }

            // 检查 重量和尺寸 是否需要收费
            if (baggageSize > 158 && baggage.type === '普通行李') {
                // 超尺寸
                if (baggage.weight > 23 && seatType !== '头等、公务舱') {       // 超重
                    result.price += weightAndSize[parseInt(flightArea)];
                }
                else {  // 没有超重
                    result.price += noWeightButSize[parseInt(flightArea)];
                }
            }
            else {
                // 没有超尺寸
                if (baggage.weight > 28 && seatType !== '头等、公务舱') {       // 超重 (28, 32]
                    result.price += weight28To32ButNoSize[parseInt(flightArea)];
                }
                else if (baggage.weight > 23 && seatType !== '头等、公务舱') {  // 超重 (23, 28]
                    result.price += weight23To28ButNoSize[parseInt(flightArea)];
                }
            }

        } // !行李遍历for循环结束

        // 检查 件数 是否需要收费
        let baggageNumLimit = 0;
        if (seatType === '头等、公务舱') {
            if (peopleType === '成人' || peopleType === '儿童') {
                baggageNumLimit = 2;
            }
        }
        else if (seatType === '悦享经济舱、超级经济舱') {
            baggageNumLimit = 2;
        }
        else if (seatType === '经济舱（区域A）') {
            baggageNumLimit = 1;
        }
        else if (seatType === '经济舱（区域B）') {
            baggageNumLimit = 2;
        }
        else {
            baggageNumLimit = 0;
        }

        let len = baggageDetail.normal.length - baggageNumLimit;
        for (let i = 0; i < len; i++) {
            if (i < exceedBaggage.length) {
                // 首先确定这是超出的第几件，然后确定区域
                result.price += exceedBaggage[i][parseInt(flightArea)];
            }
            else {
                // 超出三件以上，按照最高的标准收费
                result.price += exceedBaggage[exceedBaggage.length - 1][parseInt(flightArea)];
            }
        }


        // 计算特殊行李费用
        for (let i = 0, len = baggageDetail.special.length; i < len; i++) {
            let baggage = baggageDetail.special[i];
            // ---------------- 可免费托运的行李 -----------------
            if ((isDisability && freeSpecialBaggage1.includes(baggage.type)) ||
                (peopleType === '婴儿' && freeSpecialBaggage2.includes(baggage.type)) ||
                (freeSpecialBaggage3.includes(baggage.type))) {
                continue;
            }
            // 非残疾或婴儿旅客托运 轮椅或婴儿床
            else if ((!isDisability || peopleType !== '婴儿') && (freeSpecialBaggage1.includes(baggage.type) || freeSpecialBaggage2.includes(baggage.type))) {
                // 已经按照普通行李进行计算了
            }
            // ---------------- 运动器械器具，计入免费额度 -----------------
            else if (sportsSpecialBaggage1.includes(baggage.type)) {
                // 计入免费额度的特殊行李已经被当作普通行李计算过了
            }
            // ---------------- 运动器械器具，不计入免费额度 -----------------
            else if (sportsSpecialBaggage2.includes(baggage.type)) {
                switch (true) {
                    case baggage.weight < 2:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                        break;
                    case baggage.weight > 45:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                    case baggage.weight > 32:
                        result.price += 5200;
                        break;
                    case baggage.weight > 23:
                        result.price += 3900;
                        break;
                    case baggage.weight >= 2:
                        result.price += 2600;
                        break;
                }
            }
            else if (sportsSpecialBaggage3.includes(baggage.type)) {
                switch (true) {
                    case baggage.weight < 2:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                        break;
                    case baggage.weight > 45:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                    case baggage.weight > 32:
                        result.price += 3900;
                        break;
                    case baggage.weight > 23:
                        result.price += 2600;
                        break;
                    case baggage.weight >= 2:
                        result.price += 1300;
                        break;
                }
            }
            // ---------------- 其他类型的特殊行李，计入免费额度 -----------------
            else if (othersSpecialBaggage1.includes(baggage.type)) {
                // 计入免费额度的特殊行李已经被当作普通行李计算过了
            }
            // ---------------- 其他类型的特殊行李，不计入免费额度 -----------------
            else if (othersSpecialBaggage2.includes(baggage.type)) {
                switch (true) {
                    case baggage.weight < 2:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                        break;
                    case baggage.weight > 32:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                    case baggage.weight > 23:
                        result.price += 3900;
                        break;
                    case baggage.weight >= 2:
                        result.price += 490;
                        break;
                }
            }
            else if (othersSpecialBaggage3.includes(baggage.type)) {
                switch (true) {
                    case baggage.weight < 2:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                        break;
                    case baggage.weight > 32:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                    case baggage.weight > 23:
                        result.price += 2600;
                        break;
                    case baggage.weight >= 2:
                        result.price += 1300;
                        break;
                }
            }
            else if (othersSpecialBaggage4.includes(baggage.type)) {
                switch (true) {
                    case baggage.weight < 2:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                        break;
                    case baggage.weight > 5:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                    case baggage.weight >= 2:
                        result.price += 1300;
                        break;
                }
            }
            else if (othersSpecialBaggage5.includes(baggage.type)) {
                switch (true) {
                    case baggage.weight < 2:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                        break;
                    case baggage.weight > 32:
                        result.message += '行李[' + (i + 1) + ']存在重量不合理的情况，请合理划分\n';
                    case baggage.weight > 23:
                        result.price += 7800;
                        break;
                    case baggage.weight > 8:
                        result.price += 5200;
                        break;
                    case baggage.weight >= 2:
                        result.price += 3900;
                        break;
                }
            }
        } // !特殊行李for循环结束

    } // !国际、地区计算结束

    // 返回计算结果
    return result;
}

// 注意，执行单元测试的时候，下面的注释需要放开。不执行单元测试时，将下面的语句注释
module.exports = calculateBaggagePrice;