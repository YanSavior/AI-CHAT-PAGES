const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 读取 Excel 文件
const workbook = XLSX.readFile('C:\\Users\\38754\\Desktop\\毕业生就业信息表.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

// 将数据转换为 JavaScript 模块
const jsContent = `// 这个文件是自动生成的，请勿手动修改
export const graduateData = ${JSON.stringify(data, null, 2)};
`;

// 确保目录存在
if (!fs.existsSync('src/data')) {
  fs.mkdirSync('src/data', { recursive: true });
}

// 写入数据文件
fs.writeFileSync(
  path.join('src/data/graduateData.js'),
  jsContent
);

console.log('数据已成功导入到 src/data/graduateData.js'); 