import React, { useState, useEffect, useRef } from 'react';

const AIAvatar = ({ isThinking = false, isReplying = false }) => {
  const [currentState, setCurrentState] = useState('normal');
  const [showAha, setShowAha] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef(null);
  const loadingTimeoutRef = useRef(null);

  // 预加载图片并监听加载完成 - 更激进的优化
  useEffect(() => {
    const images = ['/Picture1.png', '/Picture2.png', '/Picturee.png'];
    let loadedCount = 0;
    const imageCache = {};
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        setImagesLoaded(true);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      }
    };

    // 设置更短的等待时间，让AI形象更快显示
    loadingTimeoutRef.current = setTimeout(() => {
      setImagesLoaded(true);
    }, 50); // 进一步减少到50ms

    // 立即开始预加载图片，使用更激进的加载策略
    images.forEach(src => {
      const img = new Image();
      img.onload = () => {
        imageCache[src] = img; // 缓存已加载的图片
        checkAllLoaded();
      };
      img.onerror = checkAllLoaded; // 即使加载失败也继续
      // 设置图片加载优先级
      img.loading = 'eager'; // 立即加载
      img.decoding = 'sync'; // 同步解码
      img.src = src;
    });

    // 额外的预加载策略：创建隐藏的img元素
    images.forEach(src => {
      const hiddenImg = document.createElement('img');
      hiddenImg.style.display = 'none';
      hiddenImg.loading = 'eager';
      hiddenImg.decoding = 'sync';
      hiddenImg.src = src;
      document.body.appendChild(hiddenImg);
    });

    // 清理函数
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // 监听状态变化 - 更快速的状态切换
  useEffect(() => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isThinking) {
      setCurrentState('thinking');
      setIsTransitioning(false);
    } else if (isReplying) {
      setCurrentState('aha');
      setShowAha(true);
      setIsTransitioning(false);
      // 1秒后开始快速切换回正常状态
      timeoutRef.current = setTimeout(() => {
        setShowAha(false);
        setIsTransitioning(true);
        // 添加一个更短的过渡时间，让切换更快
        setTimeout(() => {
          setCurrentState('normal');
          setIsTransitioning(false);
        }, 150); // 减少到150ms
      }, 1000); // 减少到1秒
    } else {
      setCurrentState('normal');
      setIsTransitioning(false);
    }

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isThinking, isReplying]);

  // 根据状态选择图片 - 使用缓存的图片
  const getImageSrc = () => {
    if (currentState === 'thinking') {
      return '/Picture1.png';
    } else if (currentState === 'aha') {
      return '/Picture2.png';
    } else {
      return '/Picturee.png';
    }
  };

  // 获取CSS类名，包含自然切换动画
  const getAvatarClassName = () => {
    if (isTransitioning && currentState === 'normal') {
      return 'ai-avatar normal normal-return';
    }
    return `ai-avatar ${currentState}`;
  };

  // 如果图片还没加载完成，显示更快的加载状态
  if (!imagesLoaded) {
    return (
      <div style={{ 
        position: 'absolute',
        left: '10px',
        bottom: '10px',
        zIndex: 1000,
        width: '220px',
        height: '280px',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #22c55e, #16a34a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          animation: 'pulse 0.6s ease-in-out infinite', // 进一步加快脉冲动画
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          AI
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'absolute',
      left: '10px',
      bottom: '10px',
      zIndex: 1000,
      width: '220px',
      height: '280px',
      pointerEvents: 'none'
    }}>
      {/* 使用PhotoShop抠图的图片 - 更快速的切换效果，避免渐进式加载 */}
      <div className={getAvatarClassName()} style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '220px',
        height: '240px'
      }}>
        <div 
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${getImageSrc()})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
            // 只在从恍然大悟切换回正常状态时添加过渡效果，但更快速
            transition: isTransitioning ? 'opacity 0.15s ease-in-out' : 'none',
            opacity: isTransitioning ? 0.9 : 1,
            // 添加这些属性来避免渐进式加载
            imageRendering: 'crisp-edges',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)', // 强制硬件加速
            // 确保图片立即显示，无渐进式加载
            objectFit: 'contain',
            objectPosition: 'center'
          }}
        />
      </div>

      {/* 恍然大悟状态特效 */}
      {showAha && (
        <div className="aha-effects" style={{
          position: 'absolute',
          top: '-5px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          transition: 'opacity 0.15s ease-in-out', // 更快速的淡出
          opacity: isTransitioning ? 0 : 1
        }}>
          <div className="aha-bubble" style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '4px solid #FFD700',
            opacity: 0.9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'ahaGlow 0.2s ease-out' // 更快速的特效
          }}>
            <span style={{
              color: '#FFD700',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>💡</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAvatar; 