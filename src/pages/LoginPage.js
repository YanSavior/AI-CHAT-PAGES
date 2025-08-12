import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);

  const handleLogin = () => {
    // 管理员模式：账号cqupt，密码1950
    const isAdmin = username === 'cqupt' && password === '1950';
    
    // 普通用户模式：检查账号是否为10位数字且以2024215开头
    const isValidAccount = /^2024215\d{3}$/.test(username);
    
    // 检查密码是否为账号的后三位数字
    const isValidPassword = password === username.slice(-3);
    
    if (isAdmin) {
      onLogin(true); // 管理员登录成功
    } else if (isValidAccount && isValidPassword) {
      onLogin(false); // 普通用户登录成功
    } else {
      setShowError(true);
      // 3秒后自动隐藏错误提示
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      {showError && (
        <div className="error-popup" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px 30px',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 1000,
          border: '2px solid #ff6b6b'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#ff6b6b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              !
            </div>
            <span style={{
              color: '#333',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              账号或密码错误，请重试哦。
            </span>
          </div>
        </div>
      )}

      <div className="login-form">
        <h1 className="login-title">重邮AI问答系统</h1>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="username" style={{
            display: 'block',
            marginBottom: '8px',
            color: '#555',
            fontWeight: '500'
          }}>
            账号
          </label>
          <input
            type="text"
            id="username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入账号"
          />
        </div>
        <div style={{ marginBottom: '30px' }}>
          <label htmlFor="password" style={{
            display: 'block',
            marginBottom: '8px',
            color: '#555',
            fontWeight: '500'
          }}>
            密码
          </label>
          <input
            type="password"
            id="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入密码"
          />
        </div>
        <button
          className="login-button"
          onClick={handleLogin}
        >
          登录
        </button>
      </div>
    </div>
  );
};

export default LoginPage; 