import React, { useState, useEffect } from 'react';
import './LoginInterface.css';

const LoginInterface = ({ onLogin }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    // 延迟启动动画，让页面加载完成后再开始
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证账号格式：2024215xxx (10位数)
    const accountRegex = /^2024215\d{3}$/;
    if (!accountRegex.test(account)) {
      setShowError(true);
      return;
    }

    // 验证密码：后三位数
    const expectedPassword = account.slice(-3);
    if (password !== expectedPassword) {
      setShowError(true);
      return;
    }

    // 登录成功
    onLogin(true);
  };

  const closeError = () => {
    setShowError(false);
  };

  return (
    <div className="login-container">
      {/* 左上角校徽和学校名称 */}
      <div className="university-header">
        <div className="university-logo">
          <img src={`${process.env.PUBLIC_URL}/Page_Picture/cqupt_sign.jpg`} alt="重庆邮电大学校徽" />
        </div>
        <div className="university-info">
          <h1>重庆邮电大学</h1>
          <p>Chongqing University of Posts and Telecommunications</p>
        </div>
      </div>

      {/* 浮动粒子效果 */}
      <div className="particles">
        {[...Array(25)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      {/* 雾气效果 */}
      <div className="fog-effects">
        <div className="fog fog-1"></div>
        <div className="fog fog-2"></div>
        <div className="fog fog-3"></div>
        <div className="fog fog-4"></div>
      </div>
      
      {/* 左侧图片组 */}
      <div className="image-group left-group">
        <div className="image-container">
          <div 
            className={`image-item left-image ${animationStarted ? 'slide-down' : ''}`}
            style={{
              backgroundImage: `url("${process.env.PUBLIC_URL}/Page_Picture/cqupt1.jpg")`
            }}
          ></div>
          <div className="image-fog-overlay"></div>
        </div>
        <div className="image-container">
          <div 
            className={`image-item center-image ${animationStarted ? 'slide-up' : ''}`}
            style={{
              backgroundImage: `url("${process.env.PUBLIC_URL}/Page_Picture/cqupt2.png")`
            }}
          ></div>
          <div className="image-fog-overlay"></div>
        </div>
        <div className="image-container">
          <div 
            className={`image-item right-image ${animationStarted ? 'slide-down' : ''}`}
            style={{
              backgroundImage: `url("${process.env.PUBLIC_URL}/Page_Picture/cqupt3.png")`
            }}
          ></div>
          <div className="image-fog-overlay"></div>
        </div>
      </div>

      {/* 中央登录表单 */}
      <div className="login-form-container">
        <div className="login-form">
          <div className="login-header">
            <h2>欢迎登录</h2>
            <p>重庆邮电大学智能问答系统</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="account">学号</label>
              <input
                type="text"
                id="account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="请输入10位学号"
                maxLength="10"
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                maxLength="3"
                required
              />
            </div>
            
            <button type="submit" className="login-button">
              登录
            </button>
          </form>
        </div>
      </div>

      {/* 右侧图片组 */}
      <div className="image-group right-group">
        <div className="image-container">
          <div 
            className={`image-item left-image ${animationStarted ? 'slide-down' : ''}`}
            style={{
              backgroundImage: `url("${process.env.PUBLIC_URL}/Page_Picture/cqupt4.png")`
            }}
          ></div>
          <div className="image-fog-overlay"></div>
        </div>
        <div className="image-container">
          <div 
            className={`image-item center-image ${animationStarted ? 'slide-up' : ''}`}
            style={{
              backgroundImage: `url("${process.env.PUBLIC_URL}/Page_Picture/cqupt5.jpg")`
            }}
          ></div>
          <div className="image-fog-overlay"></div>
        </div>
        <div className="image-container">
          <div 
            className={`image-item right-image ${animationStarted ? 'slide-down' : ''}`}
            style={{
              backgroundImage: `url("${process.env.PUBLIC_URL}/Page_Picture/cqupt.jpg")`
            }}
          ></div>
          <div className="image-fog-overlay"></div>
        </div>
      </div>

      {/* 自定义错误弹窗 */}
      {showError && (
        <div className="error-overlay">
          <div className="error-modal">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <h3>登录失败</h3>
              <p>账号或密码错误哦，请重新输入一下呢</p>
              <button onClick={closeError} className="error-close-btn">
                重新输入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginInterface;