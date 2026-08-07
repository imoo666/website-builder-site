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

// 新增提示状态
const POWERUP_MESSAGE_DURATION = 1500; // ms

// ... 其余代码保持不变

export default function Site() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [walls, setWalls] = useState<Position[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [direction, setDirection] = useState<Direction>('right')
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [lives, setLives] = useState(INITIAL_LIVES)
  const [level, setLevel] = useState(1)
  const [doubleGrowth, setDoubleGrowth] = useState(false)
  const directionRef = useRef(direction)

  // 新增提示相关状态
  const [powerUpMessage, setPowerUpMessage] = useState<string | null>(null)
  const messageTimerRef = useRef<number | null>(null)

  const chooseDirection = useCallback((next: Direction) => {
    if (OPPOSITE[directionRef.current] === next) return
    directionRef.current = next
    setDirection(next)
  }, [])

  const restart = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setFood({ x: 5, y: 5 })
    setWalls([])
    setPowerUps([])
    directionRef.current = 'right'
    setDirection('right')
    setGameOver(false)
    setPaused(false)
    setLives(INITIAL_LIVES)
    setLevel(1)
    setDoubleGrowth(false)
    setPowerUpMessage(null)
  }, [])

  const togglePause = useCallback(() => {
    setPaused((p) => !p)
  }, [])

  // 清理提示定时器
  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keys: Partial<Record<string, Direction>> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      }
      const next = keys[event.key]
      if (next) {
        event.preventDefault()
        chooseDirection(next)
      } else if (event.key.toLowerCase() === 'r' && gameOver) {
        restart()
      } else if (event.key.toLowerCase() === 'p') {
        togglePause()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [chooseDirection, gameOver, restart, togglePause])

  useEffect(() => {
    if (gameOver || paused) return
    const speed = Math.max(INITIAL_SPEED - (snake.length - 1) * SPEED_DECREMENT, MIN_SPEED)
    const timer = window.setInterval(() => {
      setSnake((current) => {
        const vector = VECTORS[directionRef.current]
        const head = current[0] ?? INITIAL_SNAKE[0]!
        const nextHead = { x: head.x + vector.x, y: head.y + vector.y }
        const hitWall = nextHead.x < 0 || nextHead.x >= GRID_SIZE
          || nextHead.y < 0 || nextHead.y >= GRID_SIZE
          || walls.some((w) => w.x === nextHead.x && w.y === nextHead.y)
        const hitSelf = current.some((part) => part.x === nextHead.x && part.y === nextHead.y)
        if (hitWall || hitSelf) {
          const newLives = lives - 1
          if (newLives <= 0) {
            setGameOver(true)
            return current
          }
          setLives(newLives)
          return INITIAL_SNAKE
        }
        const nextSnake = [nextHead, ...current]
        let grew = false
        if (nextHead.x === food.x && nextHead.y === food.y) {
          setFood(createFood(nextSnake, walls))
          setLevel((l) => l + 1)
          setWalls((w) => [...w, createWall(nextSnake, food, w)])
          setPowerUps((p) => [...p, createPowerUp(nextSnake, food, walls, p)])
          grew = true
        } else {
          nextSnake.pop()
        }
        const hitPowerUp = powerUps.find((p) => p.x === nextHead.x && p.y === nextHead.y)
        if (hitPowerUp) {
          if (hitPowerUp.type === 'clone') {
            setSnake((s) => [...s, { ...nextHead }])
            // 提示
            setPowerUpMessage('获得分身道具')
          } else if (hitPowerUp.type === 'double') {
            setDoubleGrowth(true)
            setPowerUpMessage('获得双倍变长道具')
          }
          setPowerUps((p) => p.filter((pu) => pu !== hitPowerUp))
        }
        if (doubleGrowth && grew) {
          nextSnake.push({ ...nextHead })
          setDoubleGrowth(false)
        }
        return nextSnake
      })
    }, speed)
    return () => window.clearInterval(timer)
  }, [food, gameOver, paused, snake.length, walls, lives, doubleGrowth, powerUps])

  // 处理提示定时消失
  useEffect(() => {
    if (powerUpMessage) {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current)
      messageTimerRef.current = window.setTimeout(() => {
        setPowerUpMessage(null)
        messageTimerRef.current = null
      }, POWERUP_MESSAGE_DURATION)
    }
  }, [powerUpMessage])

  return (
    <main className="snake-page">
      <header>
        <p className="eyebrow">Pocket arcade</p>
        <h1>Snake</h1>
        <p className="score" aria-live="polite">得分 {snake.length - 1}</p>
        <p className="lives">生命 {lives}</p>
        <p className="level">关卡 {level}</p>
      </header>

      <section className="game" aria-label="贪吃蛇游戏">
        <div className="board" role="img" aria-label={gameOver ? '游戏结束' : '游戏进行中'}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const x = index % GRID_SIZE
            const y = Math.floor(index / GRID_SIZE)
            const snakePart = snake.some((part) => part.x === x && part.y === y)
            const foodCell = food.x === x && food.y === y
            const wallCell = walls.some((w) => w.x === x && w.y === y)
            const powerUpCell = powerUps.find((p) => p.x === x && p.y === y)
            let className = 'cell'
            if (snakePart) className += ' snake'
            if (foodCell) className += ' food'
            if (wallCell) className += ' wall'
            if (powerUpCell) className += ` powerup-${powerUpCell.type}`
            return <span className={className} key={index} />
          })}
          {gameOver ? (
            <div className="game-over">
              <strong>本轮结束</strong>
              <button type="button" onClick={restart}>重新开始</button>
            </div>
          ) : null}
        </div>

        {/* 提示层 */}
        {powerUpMessage && (
          <div className="powerup-message" aria-live="polite">
            {powerUpMessage}
          </div>
        )}

        <div className="controls" aria-label="方向控制">
          <button className="up" type="button" aria-label="向上" onClick={() => chooseDirection('up')}>↑</button>
          <button className="left" type="button" aria-label="向左" onClick={() => chooseDirection('left')}>←</button>
          <button className="down" type="button" aria-label="向下" onClick={() => chooseDirection('down')}>↓</button>
          <button className="right" type="button" aria-label="向右" onClick={() => chooseDirection('right')}>→</button>
          <button className="pause" type="button" aria-label={paused ? '继续' : '暂停'} onClick={togglePause}>{paused ? '▶' : '⏸'}</button>
        </div>
      </section>
    </main>
  )
}
