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
  const tileCount = 7; // must match TILE_ICONS.length
  const size = 5;
  let grid, swaps = [];

  do {
    grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () =>
        Math.floor(Math.random() * tileCount)  // generate tile indices
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
    question: { grid }, // grid of tile indices 0–6
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

/* ─────────────────────────────────────────────────────────────── */
/*  Basic utilities                                              */
/* ─────────────────────────────────────────────────────────────── */
function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
// Heap’s algorithm for permutations
function permute(input) {
  const result = [];
  const a = input.slice();
  const c = Array(a.length).fill(0);
  result.push(a.slice());
  let i = 0;
  while (i < a.length) {
    if (c[i] < i) {
      const k = i % 2 === 0 ? 0 : c[i];
      [a[i], a[k]] = [a[k], a[i]];
      result.push(a.slice());
      c[i]++;
      i = 0;
    } else {
      c[i] = 0;
      i++;
    }
  }
  return result;
}

/* ─────────────────────────────────────────────────────────────── */
/*  Solver to count solutions ≤ limit                            */
/* ─────────────────────────────────────────────────────────────── */
function satisfiesAll(clues, mAB, mAC, mBC) {
  return clues.every(cl => cl.check(mAB, mAC, mBC));
}
function countSolutions(clues, A, B, C, limit = 2) {
  let found = 0;
  const permsB = permute(B);
  for (const pB of permsB) {
    const mapAB = Object.fromEntries(A.map((a, i) => [a, pB[i]]));
    const invAB = Object.fromEntries(Object.entries(mapAB).map(([k,v])=>[v,k]));

    for (const pC of permsB) {
      const mapAC = Object.fromEntries(A.map((a, i) => [a, pC[i]]));
      const mapBC = Object.fromEntries(A.map(a => [mapAB[a], mapAC[a]]));

      if (satisfiesAll(clues, mapAB, mapAC, mapBC)) {
        if (++found >= limit) return found;
      }
    }
  }
  return found;
}

/* ─────────────────────────────────────────────────────────────── */
/*  Build a big, varied pool of clue objects                     */
/* ─────────────────────────────────────────────────────────────── */
function buildTemplates(A, B, C, mAB, mAC, mBC) {
  const invAB = Object.fromEntries(Object.entries(mAB).map(([k,v])=>[v,k]));
  const pool = [];

  // 1) Positive A➝B
  for (const a of A) {
    const b = mAB[a];
    pool.push({
      text: `${a} plays ${b}.`,
      check: AB => AB[a] === b
    });
  }
  // 2) Negative A➝B
  for (const a of A) {
    for (const b of B) {
      if (b !== mAB[a]) {
        pool.push({
          text: `${a} does not play ${b}.`,
          check: AB => AB[a] !== b
        });
      }
    }
  }
  // 3) Positive B➝C
  for (const b of B) {
    const c = mBC[b];
    pool.push({
      text: `The ${b} player lives in ${c}.`,
      check: (_AB,_AC,BC) => BC[b] === c
    });
  }
  // 4) Cross A (AB→AC)
  for (const a of A) {
    const b = mAB[a], c = mAC[a];
    pool.push({
      text: `The person who plays ${b} lives in ${c}.`,
      check: (AB, AC) => AC[invAB[AB[a]]] === AC[a] && AC[a] === c
    });
  }
  // 5) Either-Or examples
  for (const a of A) {
    const b1 = mAB[a];
    const b2 = sample(B.filter(x => x !== b1));
    pool.push({
      text: `${a} plays either ${b1} or ${b2}.`,
      check: AB => AB[a] === b1 || AB[a] === b2
    });
  }
  // 6) Comparative red herrings
  const ages = shuffle(A).reduce((o,a,i)=>{ o[a]=20+i; return o; }, {});
  for (const a of A) {
    const other = sample(A.filter(x=>x!==a));
    if (ages[a] > ages[other]) {
      pool.push({
        text: `${a} is older than ${other}.`,
        check: () => true
      });
    }
  }
  // 7) Negated city–instrument
  for (const c of C) {
    const badB = sample(B.filter(b => mBC[b] !== c));
    pool.push({
      text: `The person in ${c} does not play ${badB}.`,
      check: (_AB,_AC,BC) => BC[badB] !== c
    });
  }

  return pool;
}

/* ─────────────────────────────────────────────────────────────── */
/*  Main generator with optional extra clues                      */
/* ─────────────────────────────────────────────────────────────── */
function generateLogicGrid({ addRedundant = true } = {}) {
  const A = ['Alice','Bob','Carol','David','Eve','Frank'];
  const B = ['Piano','Guitar','Drums','Violin','Flute','Saxophone'];
  const C = ['Paris','Tokyo','Rome','Berlin','Madrid','Oslo'];

  // 1) random bijections
  const mAB = randomMapping(A, B);
  const mAC = randomMapping(A, C);
  const mBC = Object.fromEntries(A.map(a => [mAB[a], mAC[a]]));

  // 2) build & shuffle pool
  const pool = shuffle(buildTemplates(A, B, C, mAB, mAC, mBC));
  const clues = [];

  // 3) pick until unique
  for (const cl of pool) {
    clues.push(cl);
    if (countSolutions(clues, A, B, C) === 1) break;
  }

  // 4) optional extras for misdirection
  if (addRedundant) {
    const extra = shuffle(pool.filter(c => !clues.includes(c))).slice(0, 3);
    clues.push(...extra);
  }

  return {
    id       : `logic-${uuidv4()}`,
    type     : 'logic-grid',
    question : {
      categories : { people: A, instruments: B, cities: C },
      clues      : clues.map(c => c.text)
    },
    solution : { AB: mAB, AC: mAC }
  };
}

/* ─────────────────────────────────────────────────────────────── */
/*  helper: randomMapping reused from earlier                      */
/* ─────────────────────────────────────────────────────────────── */
function randomMapping(A, B) {
  const out = {};
  shuffle(B).forEach((b, i) => { out[A[i]] = b; });
  return out;
}


/* -------------------------------------------------------------------- */
/*  MAIN 8‑QUEENS PUZZLE GENERATOR                                      */
/* -------------------------------------------------------------------- */

function flood(mask, r0, c0, wantedSize) {
  const N = mask.length;
  const q = [[r0, c0]];
  mask[r0][c0] = true;

  let i = 0;
  while (i < q.length && q.length < wantedSize) {
    const [r, c] = q[i++];

    const nb = [
      [r - 1, c], [r + 1, c],
      [r, c - 1], [r, c + 1]
    ].filter(([rr, cc]) =>
      rr >= 0 && rr < N && cc >= 0 && cc < N && !mask[rr][cc]
    );

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

  return q;
}

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
            if (Math.abs(r2 - row) === 1 && Math.abs(givenC2 - c) === 1) return true;
          }
          if (Math.abs(r2 - row) === 1 && Math.abs(c2 - c) === 1) return true;
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
          if (c2 !== null && Math.abs(r2 - row) === 1 && Math.abs(c2 - c) === 1) {
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