// --- 省略原始导入与常量定义 ---
+// 新增道具类型
+type PowerUpType = 'clone' | 'double';
+type PowerUp = { x: number; y: number; type: PowerUpType };
+
+// 新增状态
+const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
+const [doubleGrowth, setDoubleGrowth] = useState(false);
+const [cloneSnakes, setCloneSnakes] = useState<Position[][]>([]); // 追随主蛇的副蛇
+
+// 生成道具
+function createPowerUp(snake: Position[], food: Position, walls: Position[]): PowerUp | null {
+  const occupied = [...snake, ...walls, food, ...powerUps];
+  const available = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
+    x: index % GRID_SIZE,
+    y: Math.floor(index / GRID_SIZE),
+  })).filter((cell) => !occupied.some((p) => p.x === cell.x && p.y === cell.y));
+  if (!available.length) return null;
+  const chosen = available[Math.floor(Math.random() * available.length)];
+  const types: PowerUpType[] = ['clone', 'double'];
+  return { ...chosen, type: types[Math.floor(Math.random() * types.length)] };
+}
+
+// 在主蛇移动逻辑中处理道具
+useEffect(() => {
+  if (gameOver || paused) return;
+  const speed = Math.max(INITIAL_SPEED - (snake.length - 1) * SPEED_DECREMENT, MIN_SPEED);
+  const timer = window.setInterval(() => {
+    setSnake((current) => {
+      const vector = VECTORS[directionRef.current];
+      const head = current[0] ?? INITIAL_SNAKE[0]!;
+      const nextHead = { x: head.x + vector.x, y: head.y + vector.y };
+      const hitWall = nextHead.x < 0 || nextHead.x >= GRID_SIZE
+        || nextHead.y < 0 || nextHead.y >= GRID_SIZE
+        || walls.some((w) => w.x === nextHead.x && w.y === nextHead.y);
+      const hitSelf = current.some((part) => part.x === nextHead.x && part.y === nextHead.y);
+      if (hitWall || hitSelf) {
+        const newLives = lives - 1;
+        if (newLives <= 0) {
+          setGameOver(true);
+          return current;
+        }
+        setLives(newLives);
+        return INITIAL_SNAKE;
+      }
+      const nextSnake = [nextHead, ...current];
+      // 处理食物
+      if (nextHead.x === food.x && nextHead.y === food.y) {
+        setFood(createFood(nextSnake, walls));
+        setLevel((l) => l + 1);
+        setWalls((w) => [...w, createWall(nextSnake, food, w)]);
+        // 处理道具
+        const pu = powerUps.find((p) => p.x === nextHead.x && p.y === nextHead.y);
+        if (pu) {
+          if (pu.type === 'double') {
+            setDoubleGrowth(true);
+          } else if (pu.type === 'clone') {
+            setCloneSnakes((cs) => [...cs, [...nextSnake]]);
+          }
+          setPowerUps((ps) => ps.filter((p) => p !== pu));
+        }
+        // 增长逻辑
+        const growBy = doubleGrowth ? 2 : 1;
+        setDoubleGrowth(false);
+        for (let i = 0; i < growBy - 1; i++) nextSnake.pop();
+      } else {
+        nextSnake.pop();
+      }
+      return nextSnake;
+    });
+    // 处理副蛇移动
+    setCloneSnakes((cs) => cs.map((s) => {
+      const vector = VECTORS[directionRef.current];
+      const head = s[0] ?? INITIAL_SNAKE[0]!;
+      const nextHead = { x: head.x + vector.x, y: head.y + vector.y };
+      const newS = [nextHead, ...s];
+      newS.pop();
+      return newS;
+    }));
+  }, speed);
+  return () => window.clearInterval(timer);
+}, [food, gameOver, paused, snake.length, walls, lives, doubleGrowth, powerUps]);
+
+// 每次关卡升级后随机生成道具
+useEffect(() => {
+  if (level > 1) {
+    const pu = createPowerUp(snake, food, walls);
+    if (pu) setPowerUps((ps) => [...ps, pu]);
+  }
+}, [level]);
+
+// --- 省略原始返回 JSX ---
+// 在 board 渲染中加入道具单元格
+{Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
+  const x = index % GRID_SIZE;
+  const y = Math.floor(index / GRID_SIZE);
+  const snakePart = snake.some((part) => part.x === x && part.y === y);
+  const foodCell = food.x === x && food.y === y;
+  const wallCell = walls.some((w) => w.x === x && w.y === y);
+  const puCell = powerUps.find((p) => p.x === x && p.y === y);
+  let className = 'cell';
+  if (snakePart) className += ' snake';
+  if (foodCell) className += ' food';
+  if (wallCell) className += ' wall';
+  if (puCell) className += ' powerup ' + puCell.type;
+  return <span className={className} key={index} />;
+})}
+// 也渲染副蛇
+{cloneSnakes.map((cs, idx) => cs.map((p, i) => {
+  const key = `clone-${idx}-${i}`;
+  return <span className="cell snake clone" key={key} style={{ gridRowStart: p.y + 1, gridColumnStart: p.x + 1 }} />;
+}))}
+// --- 省略后续 JSX ---
