const { v4: uuidv4 } = require('uuid');

/** Helper: deep-copy a grid */
function cloneGrid(grid) {
  return grid.map(row => row.slice());
}

/** Check if any 3-in-a-row exists in grid */
function hasMatch(grid) {
  const H = grid.length, W = grid[0].length;
  // horizontal
  for (let r = 0; r < H; r++) {
    for (let c = 0; c <= W - 3; c++) {
      const a = grid[r][c], b = grid[r][c+1], c2 = grid[r][c+2];
      if (a === b && b === c2) return true;
    }
  }
  // vertical
  for (let c = 0; c < W; c++) {
    for (let r = 0; r <= H - 3; r++) {
      const a = grid[r][c], b = grid[r+1][c], c2 = grid[r+2][c];
      if (a === b && b === c2) return true;
    }
  }
  return false;
}

/** Generate a random Match-3 puzzle on a 5×5 grid */
function generateMatch3() {
  const colors = ['red','green','blue','yellow','purple'];
  const size = 5;
  let grid, swaps = [];

  // keep generating until we find at least one swap that yields a match
  do {
    // random fill
    grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () =>
        colors[Math.floor(Math.random()*colors.length)]
      )
    );
    swaps = [];
    // try all adjacent pairs
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (c+1 < size) {
          const g2 = cloneGrid(grid);
          [g2[r][c], g2[r][c+1]] = [g2[r][c+1], g2[r][c]];
          if (hasMatch(g2)) swaps.push({ from:[r,c], to:[r,c+1] });
        }
        if (r+1 < size) {
          const g2 = cloneGrid(grid);
          [g2[r][c], g2[r+1][c]] = [g2[r+1][c], g2[r][c]];
          if (hasMatch(g2)) swaps.push({ from:[r,c], to:[r+1,c] });
        }
      }
    }
  } while (swaps.length === 0);

  // pick one valid swap
  const solution = swaps[Math.floor(Math.random()*swaps.length)];

  return {
    id:       `match3-${uuidv4()}`,
    type:     'match-3',
    question: { grid },
    solution: { swap: solution }
  };
}

/** Generate a sliding-tile (3×3) puzzle by scrambling solved board */
function generateSliding() {
  const N = 3;
  let board = [
    [1,2,3],
    [4,5,6],
    [7,8,0]
  ];
  let blank = { r:2, c:2 };
  const moves = [];
  const dirs = [
    { dr:-1, dc:0, name:'up' },
    { dr:1, dc:0, name:'down' },
    { dr:0, dc:-1, name:'left' },
    { dr:0, dc:1, name:'right' }
  ];

  for (let i=0; i<15; i++) {
    const opts = dirs.filter(d => {
      const nr = blank.r+d.dr, nc = blank.c+d.dc;
      return nr>=0&&nr<N&&nc>=0&&nc<N;
    });
    const mv = opts[Math.floor(Math.random()*opts.length)];
    const nr = blank.r+mv.dr, nc = blank.c+mv.dc;
    [board[blank.r][blank.c], board[nr][nc]] =
      [board[nr][nc], board[blank.r][blank.c]];
    blank = { r:nr, c:nc };
    moves.push(mv.name);
  }
  // solution: inverse moves
  const inv = { up:'down', down:'up', left:'right', right:'left' };
  const solution = moves.slice().reverse().map(m=>inv[m]);

  return {
    id:       `sliding-${uuidv4()}`,
    type:     'sliding',
    question: { board },
    solution
  };
}

/** Generate memory-flip (4×4) puzzle with paired values */
function generateMemory() {
  const N = 4, pairs = N*N/2;
  let values = [];
  for (let v=1; v<=pairs; v++) {
    values.push(v, v);
  }
  // Fisher-Yates shuffle
  for (let i = values.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  const board = [];
  for (let r=0; r<N; r++) {
    board.push(values.slice(r*N, r*N+N));
  }
  return {
    id:       `memory-${uuidv4()}`,
    type:     'memory',
    question: { size:N },
    solution: { board }
  };
}

/** Generate a small logic-grid (3 persons ↔ 3 pets) with valid clues */
function generateLogicGrid() {
  const persons = ['Alice','Bob','Carol'];
  const pets    = ['Cat','Dog','Bird'];
  // random assignment
  const perm = [...pets].sort(() => Math.random()-0.5);
  const assignment = {
    [persons[0]]: perm[0],
    [persons[1]]: perm[1],
    [persons[2]]: perm[2]
  };
  // generate clues
  const clues = [];
  // one direct positive
  clues.push(`${persons[0]} owns the ${assignment[persons[0]]}.`);
  // two negative
  clues.push(`${persons[1]} does not own the ${perm[0]}.`);
  clues.push(`${persons[2]} does not own the ${perm[1]}.`);

  return {
    id:       `logic-${uuidv4()}`,
    type:     'logic-grid',
    question: { categories:{ persons, pets }, clues },
    solution: assignment
  };
}

/** Generate an 8-Queens solution with randomness */
function generateNQueens() {
  const N = 8;
  const cols = Array(N).fill(-1);
  const order = [...Array(N).keys()];
  function backtrack(row) {
    if (row === N) return true;
    // shuffle columns to get different solutions
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (let c of order) {
      if (cols.includes(c)) continue;
      let ok = true;
      for (let r = 0; r < row; r++) {
        if (Math.abs(r - row) === Math.abs(cols[r] - c)) {
          ok = false; break;
        }
      }
      if (!ok) continue;
      cols[row] = c;
      if (backtrack(row + 1)) return true;
      cols[row] = -1;
    }
    return false;
  }
  backtrack(0);
  return {
    id:       `n-queens-${uuidv4()}`,
    type:     'n-queens',
    question: { size:N },
    solution: { positions: cols }
  };
}

module.exports = {
  generateMatch3,
  generateSliding,
  generateMemory,
  generateLogicGrid,
  generateNQueens
};