// 测试登录逻辑
function testLogin(username, password) {
  // 检查账号是否为10位数字且以2024215开头
  const isValidAccount = /^2024215\d{3}$/.test(username);
  
  // 检查密码是否为账号的后三位数字
  const isValidPassword = password === username.slice(-3);
  
  if (isValidAccount && isValidPassword) {
    console.log(`✅ 登录成功: ${username}`);
    return true;
  } else {
    console.log(`❌ 登录失败: ${username} - 账号或密码错误，请重试哦。`);
    return false;
  }
}

console.log("🧪 测试登录逻辑");
console.log("=" * 50);

// 测试有效账号
console.log("\n📋 测试有效账号:");
testLogin("2024215001", "001");
testLogin("2024215123", "123");
testLogin("2024215999", "999");

// 测试无效账号
console.log("\n📋 测试无效账号:");
testLogin("2024215001", "002"); // 密码错误
testLogin("202421500", "000"); // 账号长度不够
testLogin("20242150001", "001"); // 账号长度过长
testLogin("2024214001", "001"); // 账号前缀错误
testLogin("abc1234567", "567"); // 非数字账号
testLogin("1234567890", "890"); // 不以2024215开头

console.log("\n✅ 测试完成"); 