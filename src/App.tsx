import { useState, useEffect, useRef } from 'react'
import './App.css'

const GRID_SIZE = 20
const CELL_SIZE = 20
type Position = { x: number; y: number }
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight)
  const [gameOver, setGameOver] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const moveSnake = () => {
    setSnake((prev) => {
      const newHead = {
        x: prev[0].x + direction.x,
        y: prev[0].y + direction.y,
      }
      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true)
        return prev
      }
      // Check self collision
      if (prev.some((p) => p.x === newHead.x && p.y === newHead.y)) {
        setGameOver(true)
        return prev
      }
      const newSnake = [newHead, ...prev]
      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setFood(generateFood(newSnake))
      } else {
        newSnake.pop()
      }
      return newSnake
    })
  }

  const generateFood = (snakeBody: Position[]) => {
    let newFood: Position
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
      if (!snakeBody.some((p) => p.x === newFood.x && p.y === newFood.y)) break
    }
    return newFood
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const newDir = DIRECTIONS[e.key as keyof typeof DIRECTIONS]
      if (newDir) {
        // Prevent reverse
        const neck = snake[1]
        if (
          !neck ||
          snake[0].x + newDir.x !== neck.x ||
          snake[0].y + newDir.y !== neck.y
        ) {
          setDirection(newDir)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [snake])

  useEffect(() => {
    if (gameOver) return
    intervalRef.current = window.setInterval(moveSnake, 200)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [direction, gameOver])

  return (
    <div id="root">
      <section id="center">
        <h1>Snake Game</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gap: '1px',
            background: '#000',
            width: `${GRID_SIZE * CELL_SIZE}px`,
            height: `${GRID_SIZE * CELL_SIZE}px`,
            margin: '0 auto',
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE
            const y = Math.floor(idx / GRID_SIZE)
            const isSnake = snake.some((p) => p.x === x && p.y === y)
            const isFood = food.x === x && food.y === y
            return (
              <div
                key={idx}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: isSnake
                    ? '#aa3bff'
                    : isFood
                    ? '#ff0000'
                    : '#fff',
                }}
              />
            )
          })}
        </div>
        {gameOver && <p>Game Over! Press R to restart.</p>}
      </section>
    </div>
  )
}

export default App
