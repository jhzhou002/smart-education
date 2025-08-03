// 测试选项格式转换
const testOption = '["A. 选项1","B. 选项2","C. 选项3","D. 选项4"]';

console.log('原始选项字符串:', testOption);

try {
  const parsedOptions = JSON.parse(testOption);
  console.log('解析后的数组:', parsedOptions);
  
  // 转换为前端期望的格式
  const formattedOptions = parsedOptions.map((option: string) => ({
    key: option.charAt(0),
    text: option
  }));
  
  console.log('转换后的格式:', formattedOptions);
  console.log('前端应该能正确显示这种格式');
  
} catch (error) {
  console.error('解析失败:', error);
}

// 测试提交答案时的格式
console.log('\n测试答案格式:');
console.log('用户选择的key: "A"');
console.log('题目正确答案: "A"');
console.log('比较结果:', 'A'.toLowerCase().trim() === 'A'.toLowerCase().trim());