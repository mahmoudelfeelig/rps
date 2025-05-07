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

function generateMatch3() {
  const colors = ['red','green','blue','yellow','purple'];
  const size = 5;
  let grid, swaps = [];

  do {
    grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () =>
        colors[Math.floor(Math.random() * colors.length)]
      )
    );
    swaps = [];
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

  return {
    id:       `match3-${uuidv4()}`,
    type:     'match-3',
    question: { grid },
    solution: { count: 20 }
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


function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate a bijection between A and B
function randomMapping(A, B) {
  const shuffled = shuffle(B);
  const map = {};
  A.forEach((a, i) => { map[a] = shuffled[i]; });
  return map;
}
// Convert a full mapping to clues
function generateClues(mappingAB, mappingAC, mappingBC, A, B, C) {
  const clues = [];

  // Direct positive clues
  clues.push(`${sample(A)} is matched with ${mappingAB[sample(A)]}.`);
  clues.push(`${sample(B)} corresponds to ${mappingBC[sample(B)]}.`);

  // Negative clues
  clues.push(`${sample(A)} is not matched with ${sample(B)}.`);
  clues.push(`${sample(A)} does not go with ${sample(C)}.`);

  // Cross-reference clues
  const a = sample(A);
  clues.push(`The one matched with ${mappingAB[a]} is also paired with ${mappingAC[a]}.`);

  const b = sample(B);
  const aFromB = Object.keys(mappingAB).find(k => mappingAB[k] === b);
  clues.push(`${b} goes with ${mappingAC[aFromB]}.`);

  const c = sample(C);
  const aFromC = Object.keys(mappingAC).find(k => mappingAC[k] === c);
  clues.push(`${c} is paired with ${mappingAB[aFromC]}.`);

  return clues;
}

// Main generator
function generateLogicGrid() {
  const A = ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank'];
  const B = ['Piano', 'Guitar', 'Drums', 'Violin', 'Flute', 'Saxophone'];
  const C = ['Paris', 'Tokyo', 'Rome', 'Berlin', 'Madrid', 'Oslo'];

  // Create 3 consistent mappings
  const mappingAB = randomMapping(A, B);
  const mappingAC = randomMapping(A, C);

  const mappingBC = {};
  A.forEach(a => {
    mappingBC[mappingAB[a]] = mappingAC[a];
  });

  const clues = generateClues(mappingAB, mappingAC, mappingBC, A, B, C);

  return {
    id: `logic-${uuidv4()}`,
    type: 'logic-grid',
    question: {
      categories: {
        people: A,
        instruments: B,
        cities: C
      },
      clues
    },
    solution: {
      people: A.reduce((acc, a) => {
        acc[a] = {
          instrument: mappingAB[a],
          city: mappingAC[a]
        };
        return acc;
      }, {})
    }
  };
}

module.exports = { generateLogicGrid }; 

/** helper: compute “r,c” key */
const key = (r, c) => `${r},${c}`;

/** flood‑fill a region up to `wantedSize` cells, starting at (r0,c0) */
function flood(mask, r0, c0, wantedSize) {
  const N   = mask.length;
  const q   = [[r0, c0]];
  mask[r0][c0] = true;

  let i = 0;
  while (i < q.length && q.length < wantedSize) {
    const [r, c] = q[i++];

    const nb = [
      [r - 1, c], [r + 1, c],
      [r, c - 1], [r, c + 1],
    ].filter(([rr, cc]) =>
      rr >= 0 && rr < N && cc >= 0 && cc < N && !mask[rr][cc]
    );

    // shuffle neighbours for organic shapes
    for (let j = nb.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [nb[j], nb[k]] = [nb[k], nb[j]];
    }

    for (const [rr, cc] of nb) {
      if (q.length >= wantedSize) break;
      mask[rr][cc] = true;
      q.push([rr, cc]);
    }
  }
  return q;                            // list of cells composing the region
}

/* -------------------------------------------------------------------- */
/*  MAIN 8‑QUEENS PUZZLE GENERATOR                                      */
/* -------------------------------------------------------------------- */

function generateNQueens() {
  const N = 8;                                          // board size
  const CELLS_PER_REGION = 8;                           // 64 / 8

  /* 1) produce one full, classic 8‑queen solution -------------------- */
  const colOfRow  = Array(N).fill(-1);
  const colTaken  = Array(N).fill(false);
  const diagA     = Array(2 * N).fill(false);           // r‑c + (N‑1)
  const diagB     = Array(2 * N).fill(false);           // r+c

  const order = [...Array(N).keys()];

  const placeRow = (row = 0) => {
    if (row === N) return true;

    // shuffle columns for variety
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    for (const c of order) {
      if (colTaken[c]) continue;
      if (diagA[row - c + N - 1] || diagB[row + c]) continue;

      colOfRow[row] = c;
      colTaken[c] = diagA[row - c + N - 1] = diagB[row + c] = true;

      if (placeRow(row + 1)) return true;

      colTaken[c] = diagA[row - c + N - 1] = diagB[row + c] = false;
      colOfRow[row] = -1;
    }
    return false;
  };
  placeRow();

  /* 2) carve eight random, contiguous colour regions ----------------- */
  while (true) {
    const mask    = Array.from({ length: N }, () => Array(N).fill(false));
    const regions = Array.from({ length: N }, () => Array(N).fill(-1));

    // seed each region at its solution queen’s square
    const seeds = colOfRow.map((c, r) => [r, c]);

    // shuffle seeds so shapes differ each generation
    for (let i = seeds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [seeds[i], seeds[j]] = [seeds[j], seeds[i]];
    }

    seeds.forEach(([r, c], idx) => {
      const cells = flood(mask, r, c, CELLS_PER_REGION);
      cells.forEach(([rr, cc]) => (regions[rr][cc] = idx));
    });

    // If flood‑fill didn’t cover the whole board, restart
    if (mask.flat().some(v => !v)) continue;

    /* 3) pre‑place 2 – 4 queens as clues ----------------------------- */
    const initial = Array(N).fill(-1);
    const clues   = 2 + Math.floor(Math.random() * 3);    // 2‑4

    while (initial.filter(v => v >= 0).length < clues) {
      const r = Math.floor(Math.random() * N);
      if (initial[r] < 0) initial[r] = colOfRow[r];
    }

    /* 4) uniqueness check (must be exactly one solution) ------------- */
    let solutions = 0;

    const dfs = (row = 0, usedCols = new Set(), usedRegs = new Set()) => {
      if (row === N) {
        solutions += 1;
        return solutions < 2;             // stop after 2 found
      }

      // given queen on this row?
      if (initial[row] >= 0) {
        const c   = initial[row];
        const reg = regions[row][c];
        if (usedCols.has(c) || usedRegs.has(reg)) return true;
        for (let r2 = 0; r2 < row; r2++) {
          const c2 = colOfRow[r2];        // full solution queen (diag safe)
          if (initial[r2] >= 0) {
            const givenC2 = initial[r2];
            if (Math.abs(r2 - row) === Math.abs(givenC2 - c)) return true;
          }
          if (Math.abs(r2 - row) === Math.abs(c2 - c)) return true;
        }
        usedCols.add(c); usedRegs.add(reg);
        if (!dfs(row + 1, usedCols, usedRegs)) return false;
        usedCols.delete(c); usedRegs.delete(reg);
        return true;
      }

      for (let c = 0; c < N; c++) {
        if (usedCols.has(c)) continue;
        const reg = regions[row][c];
        if (usedRegs.has(reg)) continue;
        let diagOK = true;
        for (let r2 = 0; r2 < row; r2++) {
          const c2 = initial[r2] >= 0 ? initial[r2] : null;
          if (c2 !== null && Math.abs(r2 - row) === Math.abs(c2 - c)) {
            diagOK = false; break;
          }
        }
        if (!diagOK) continue;

        usedCols.add(c); usedRegs.add(reg);
        if (!dfs(row + 1, usedCols, usedRegs)) return false;
        usedCols.delete(c); usedRegs.delete(reg);
      }
      return true;
    };

    dfs();

    if (solutions === 1) {
      /* 5) emit puzzle definition ----------------------------------- */
      return {
        id:       `n-queens-${uuidv4()}`,
        type:     'n-queens',
        question: { size: N, initial, regions },
        solution: { positions: colOfRow }
      };
    }
    // else: not unique ‑> loop again
  }
}

module.exports = {
  generateMatch3,
  generateSliding,
  generateMemory,
  generateLogicGrid,
  generateNQueens
};