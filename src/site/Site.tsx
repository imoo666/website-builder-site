import { useCallback, useEffect, useRef, useState } from 'react'

import './site.css'

const GRID_SIZE = 20
const INITIAL_SPEED = 200 // ms
const SPEED_DECREMENT = 10 // ms per length unit
const MIN_SPEED = 80 // ms
const INITIAL_LIVES = 3

// 新增道具类型
export type PowerUpType = 'clone' | 'double';
export type PowerUp = { x: number; y: number; type: PowerUpType };

// 新增提示信息状态
const [message, setMessage] = useState<string | null>(null);

// 处理提示信息自动消失
useEffect(() => {
  if (!message) return;
  const timer = setTimeout(() => setMessage(null), 2000);
  return () => clearTimeout(timer);
}, [message]);

// 在吃到道具时触发提示
const handlePowerUp = (hitPowerUp: PowerUp) => {
  if (hitPowerUp.type === 'clone') {
    setMessage('分身已生成');
  } else if (hitPowerUp.type === 'double') {
    setMessage('双倍变长已激活');
  }
};

// 在主循环中调用 handlePowerUp
// ...
// 处理道具
const hitPowerUp = powerUps.find((p) => p.x === nextHead.x && p.y === nextHead.y);
if (hitPowerUp) {
  handlePowerUp(hitPowerUp);
  if (hitPowerUp.type === 'clone') {
    // 生成副蛇，副蛇初始长度为1，跟随主蛇
    setSnake((s) => [...s, { ...nextHead }]);
  } else if (hitPowerUp.type === 'double') {
    setDoubleGrowth(true);
  }
  setPowerUps((p) => p.filter((pu) => pu !== hitPowerUp));
}

// 在返回 JSX 之前渲染提示
return (
  <main className="snake-page">
    {/* ...existing header and game sections... */}
    {message && <div className="powerup-message" aria-live="polite">{message}</div>}
  </main>
);
