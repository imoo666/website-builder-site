import { useCallback, useEffect, useRef, useState } from 'react'

import './site.css'

const GRID_SIZE = 20
const INITIAL_SPEED = 200 // ms
const SPEED_DECREMENT = 10 // ms per length unit
const MIN_SPEED = 80 // ms
const INITIAL_LIVES = 3

type Position = { x: number; y: number }
type Direction = 'up' | 'down' | 'left' | 'right'

const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }]
const VECTORS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

function createFood(snake: Position[], walls: Position[]): Position {
  const occupied = [...snake, ...walls]
  const available = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
    x: index % GRID_SIZE,
    y: Math.floor(index / GRID_SIZE),
  })).filter((cell) => !occupied.some((p) => p.x === cell.x && p.y === cell.y))
  return available[Math.floor(Math.random() * available.length)] ?? { x: 5, y: 5 }
}

function createWall(snake: Position[], food: Position, walls: Position[]): Position {
  const occupied = [...snake, food, ...walls]
  const available = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
    x: index % GRID_SIZE,
    y: Math.floor(index / GRID_SIZE),
  })).filter((cell) => !occupied.some((p) => p.x === cell.x && p.y === cell.y))
  return available[Math.floor(Math.random() * available.length)] ?? { x: 0, y: 0 }
}

export default function Site() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [walls, setWalls] = useState<Position[]>([])
  const [direction, setDirection] = useState<Direction>('right')
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [lives, setLives] = useState(INITIAL_LIVES)
  const [level, setLevel] = useState(1)
  const directionRef = useRef(direction)

  const chooseDirection = useCallback((next: Direction) => {
    if (OPPOSITE[directionRef.current] === next) return
    directionRef.current = next
    setDirection(next)
  }, [])

  const restart = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setFood({ x: 5, y: 5 })
    setWalls([])
    directionRef.current = 'right'
    setDirection('right')
    setGameOver(false)
    setPaused(false)
    setLives(INITIAL_LIVES)
    setLevel(1)
  }, [])

  const togglePause = useCallback(() => {
    setPaused((p) => !p)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keys: Partial<Record<string, Direction>> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
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
          // reset snake to initial state after losing a life
          return INITIAL_SNAKE
        }
        const nextSnake = [nextHead, ...current]
        if (nextHead.x === food.x && nextHead.y === food.y) {
          setFood(createFood(nextSnake, walls))
          // level up and add a new wall
          setLevel((l) => l + 1)
          setWalls((w) => [...w, createWall(nextSnake, food, w)])
        } else {
          nextSnake.pop()
        }
        return nextSnake
      })
    }, speed)
    return () => window.clearInterval(timer)
  }, [food, gameOver, paused, snake.length, walls, lives])

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
            let className = 'cell'
            if (snakePart) className += ' snake'
            if (foodCell) className += ' food'
            if (wallCell) className += ' wall'
            return <span className={className} key={index} />
          })}
          {gameOver ? (
            <div className="game-over">
              <strong>本轮结束</strong>
              <button type="button" onClick={restart}>重新开始</button>
            </div>
          ) : null}
        </div>

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
