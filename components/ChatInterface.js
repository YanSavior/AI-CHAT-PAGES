import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const messagesEndRef = useRef(null);
  const API_KEY = 'sk-ef665e48e9884d5595fabcaf5b717948';
  const EXCEL_PATH = 'C:\\Users\\38754\\Desktop\\毕业生就业信息表.xlsx';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadExcelData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadExcelData = async () => {
    try {
      const workbook = XLSX.readFile(EXCEL_PATH);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(data);
      
      // 添加系统消息，告知数据已加载
      setMessages([{
        role: 'assistant',
        content: `已成功加载毕业生就业信息表数据，共${data.length}条记录。您可以询问关于数据的任何问题。`
      }]);
    } catch (error) {
      console.error('Error loading Excel file:', error);
      setMessages([{
        role: 'assistant',
        content: '加载Excel文件时发生错误，请确保文件路径正确且文件可访问。'
      }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 定义系统消息，设置回答格式
      const systemMessage = {
        role: 'system',
        content: `你是一个学长学姐匹配助手，负责分析毕业生就业信息并进行匹配推荐。以下是毕业生数据：${JSON.stringify(excelData)}

请严格按照以下格式回复：
1. 为每个匹配的学长学姐创建独立的推荐卡片
2. 每个推荐卡片格式如下：

【匹配学长/学姐】：(姓名)
匹配度：XX%
基本信息：
- 专业：
- 绩点：
- 就业去向：
- 就职公司：
- 岗位：
- 薪资水平：
- 突出表现：(在校期间的特殊表现、获奖等)

对你的建议：
(根据该学长学姐的经历，给出针对性的建议和启发)

---

请至少推荐3-5位匹配度较高的学长学姐，并确保每位推荐都完整包含上述信息。根据用户的提问和特点，计算匹配度并从高到低排序展示。`
      };

      const response = await axios.post('/v1/chat/completions', {
        model: "deepseek-chat",
        messages: [systemMessage, ...messages, userMessage],
        temperature: 0.7,
        max_tokens: 2000
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.choices[0].message.content
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后重试。'
      }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 text-gray-900">
              正在思考...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请描述你的情况（如：我是计算机专业的学生，对算法和开发都感兴趣...）"
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 