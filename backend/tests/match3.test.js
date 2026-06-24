const assert = require('assert');
const {
  __test: {
    MATCH3_TARGET,
    generateDeterministicMatch3Board,
    hasMatch3Move,
    resolveMatch3,
    swapMatch3,
    validateMatch3Moves
  }
} = require('../controllers/gameController');

function findValidMove(board) {
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 5; c += 1) {
      const from = { r, c };
      const candidates = [{ r: r + 1, c }, { r, c: c + 1 }];
      for (const to of candidates) {
        if (to.r >= 5 || to.c >= 5) continue;
        const settled = resolveMatch3(swapMatch3(board, from, to), 'match3-test', 0);
        if (settled.score > 0) return { from, to };
      }
    }
  }
  return null;
}

function buildSolvablePuzzle() {
  const puzzle = {
    id: 'match3-test',
    type: 'match-3',
    question: {
      grid: generateDeterministicMatch3Board('match3-test', 0)
    }
  };

  const moves = [];
  let current = puzzle.question.grid;
  let refillIndex = 0;
  let score = 0;
  const initial = resolveMatch3(current, puzzle.id, refillIndex);
  current = initial.grid;
  refillIndex = initial.refillIndex;
  score += initial.score;

  for (let turn = 0; turn < 80 && score < MATCH3_TARGET; turn += 1) {
    const move = findValidMove(current);
    if (!move) {
      current = generateDeterministicMatch3Board(puzzle.id, turn);
      continue;
    }
    const settled = resolveMatch3(swapMatch3(current, move.from, move.to), puzzle.id, refillIndex);
    moves.push(move);
    current = settled.grid;
    refillIndex = settled.refillIndex;
    score += settled.score;
    if (!hasMatch3Move(current) && score < MATCH3_TARGET) {
      current = generateDeterministicMatch3Board(puzzle.id, turn);
      const refreshed = resolveMatch3(current, puzzle.id, refillIndex);
      current = refreshed.grid;
      refillIndex = refreshed.refillIndex;
      score += refreshed.score;
    }
  }

  return { puzzle, moves, score };
}

const { puzzle, moves, score } = buildSolvablePuzzle();
assert(score >= MATCH3_TARGET, 'fixture should build a solvable Match-3 move list');
assert(validateMatch3Moves(puzzle, moves).correct, 'valid deterministic moves should pass');
assert(!validateMatch3Moves(puzzle, [{ from: { r: 0, c: 0 }, to: { r: 4, c: 4 } }]).correct, 'non-adjacent move should fail');
assert(!validateMatch3Moves(puzzle, moves.slice(0, 1)).correct, 'partial move list should not claim target reward');

console.log(`Match-3 deterministic replay tests passed with ${moves.length} moves.`);
