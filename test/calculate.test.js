const calculateBaggagePrice = require('../js/calculate');
const fs = require('fs');
const path = require('path');
const testCases1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'case1.json')));
const testCases2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'case2.json')));

for (let i = 0; i < testCases1.length; i++) {
  test('国内航线 测试用例'+(i+1), () => {
    expect(calculateBaggagePrice(testCases1[i]).price).toBe(testCases1[i].price);
  });
}

for (let i = 0; i < testCases2.length; i++) {
  test('国际、地区航线 测试用例'+(i+1), () => {
    expect(calculateBaggagePrice(testCases2[i]).price).toBe(testCases2[i].price);
  });
}
