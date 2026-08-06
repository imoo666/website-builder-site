import { useCallback, useEffect, useRef, useState } from 'react'

import './site.css'

const GRID_SIZE = 20
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

function createFood(snake: Position[]): Position {
  const available = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
    x: index % GRID_SIZE,
    y: Math.floor(index / GRID_SIZE),
  })).filter((cell) => !snake.some((part) => part.x === cell.x && part.y === cell.y))
  return available[Math.floor(Math.random() * available.length)] ?? { x: 5, y: 5 }
}

export default function Site() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [direction, setDirection] = useState<Direction>('right')
  const [gameOver, setGameOver] = useState(false)
  const directionRef = useRef(direction)

  const chooseDirection = useCallback((next: Direction) => {
    if (OPPOSITE[directionRef.current] === next) return
    directionRef.current = next
    setDirection(next)
  }, [])

  const restart = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setFood({ x: 5, y: 5 })
    directionRef.current = 'right'
    setDirection('right')
    setGameOver(false)
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
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [chooseDirection, gameOver, restart])

  useEffect(() => {
    if (gameOver) return
    const timer = window.setInterval(() => {
      setSnake((current) => {
        const vector = VECTORS[directionRef.current]
        const head = current[0] ?? INITIAL_SNAKE[0]!
        const nextHead = { x: head.x + vector.x, y: head.y + vector.y }
        const hitWall = nextHead.x < 0 || nextHead.x >= GRID_SIZE
          || nextHead.y < 0 || nextHead.y >= GRID_SIZE
        const hitSelf = current.some((part) => part.x === nextHead.x && part.y === nextHead.y)
        if (hitWall || hitSelf) {
          setGameOver(true)
          return current
        }
        const nextSnake = [nextHead, ...current]
        if (nextHead.x === food.x && nextHead.y === food.y) {
          setFood(createFood(nextSnake))
        } else {
          nextSnake.pop()
        }
        return nextSnake
      })
    }, 200)
    return () => window.clearInterval(timer)
  }, [food, gameOver])

  return (
    <main className="snake-page">
      <header>
        <p className="eyebrow">Pocket arcade</p>
        <h1>贪吃蛇</h1>
        <p className="score" aria-live="polite">得分 {snake.length - 1}</p>
      </header>

      <section className="game" aria-label="贪吃蛇游戏">
        <div className="board" role="img" aria-label={gameOver ? '游戏结束' : '游戏进行中'}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const x = index % GRID_SIZE
            const y = Math.floor(index / GRID_SIZE)
            const snakePart = snake.some((part) => part.x === x && part.y === y)
            const foodCell = food.x === x && food.y === y
            let className = 'cell'
            if (snakePart) className += ' snake'
            if (foodCell) className += ' food'
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
        </div>
      </section>
    </main>
  )
}
