"use client";

import { toast } from "sonner";

import { useEffect, useRef, useState } from "react";
import { BoardValue, GameMode, WIN_PATTERNS } from "../constant";


const calculateWinner = (board: BoardValue[]) => {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

const GameBoard = () => {
  const [mode, setMode] = useState<GameMode>("computer");
  const BOARD_FIXED_WIDTH = 360; 
  const lastWinner = useRef<BoardValue | null>(null);
  const [board, setBoard] = useState<BoardValue[]>(Array(9).fill(""));
  const [xTurn, setXTurn] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });


  const handleClick = (i: number) => {
    if (board[i] || calculateWinner(board)) return;
    const nextBoard = [...board];
    nextBoard[i] = xTurn ? "X" : "O";
    setBoard(nextBoard);
    setXTurn(!xTurn);
  }

  const resetBoard = (clearScores = false) => {
    setBoard(Array(9).fill(""));
    setXTurn(true);
    if (clearScores) setScores({ X: 0, O: 0 });
    lastWinner.current = null;
  }


  // ...existing code...
  const winner = calculateWinner(board);

  // Show Sonner notification when game ends
  useEffect(() => {
    if (winner || board.every(Boolean)) {
      toast(
        winner ? `Game Over! Winner: ${winner}` : "Game Over! It's a tie!",
        {
          action: {
            label: "Rematch",
            onClick: () => resetBoard(false),
          },
          duration: 999999,
        }
      );
    }
  }, [winner, board]);

  // when a winner appears, increment score exactly once
  useEffect(() => {
    if (winner && lastWinner.current !== winner) {
      setScores((score) => ({ ...score, [winner]: score[winner] + 1 }));
      lastWinner.current = winner;
    }
  }, [winner]);

  function handleEndGame() {
    // end the round and keep the score; next round resets board
    resetBoard(false);
  }

  // CPU move when mode is computer and it's O's turn (xNext === false)
  useEffect(() => {
    if (mode !== "computer") return;
    // CPU plays O only when it's O's turn and there is no winner
    if (!xTurn && !calculateWinner(board)) {
      const free = board
        .map((v, i) => (v === "" ? i : -1))
        .filter((i) => i !== -1) as number[];
      if (free.length === 0) return;
      const pick = free[Math.floor(Math.random() * free.length)];
      // small delay to make it feel natural
      const t = setTimeout(() => handleClick(pick), 500);
      return () => clearTimeout(t);
    }
  }, [board, xTurn, mode]);

  return (
    <div
      className="mx-auto rounded-3xl p-6 sm:p-8 ring-1 ring-black/5 dark:ring-white/6 shadow-lg flex flex-col items-center justify-center"
      style={{ width: BOARD_FIXED_WIDTH + 48, backgroundColor: "var(--color-dark-blue)" }}
    >
      {/* top scoreboard: centered and exactly the same width as the board */}
      <div className="flex justify-center mb-2 w-full">
        <div className="flex items-center justify-between gap-3 w-full p-3 md:p-6" style={{ width: BOARD_FIXED_WIDTH }}>
          {/* X player */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: `rgba(var(--color-brick-red-rgb) / 0.08)` }}>
            <div className="leading-tight text-center">
              <div className="text-xs text-slate-400">Player</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">{scores.X}</div>
            </div>
          </div>

          <div className="flex-1 text-center">
            <div className="text-lg font-bold uppercase" style={{ color: `var(--color-earth)` }}>Scoreboard</div>
          </div>

          {/* Computer */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl justify-end" style={{ background: `rgba(var(--color-sky-blue-rgb) / 0.08)` }}>
            <div className="leading-tight text-center">
              <div className="text-xs text-slate-400">Player</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">{scores.O}</div>
            </div>
          </div>
        </div>
      </div>

      {/* board: fixed-size / square cells so layout is stable */}
      <div className="flex justify-center my-4 w-full">
        {/* fixed board width - use matching padding so gap between cells = outer padding */}
        <div className="mx-auto grid grid-cols-3 gap-3 md:gap-6 p-3 md:p-6" style={{ width: BOARD_FIXED_WIDTH }}>
        {board.map((cell, i) => (
          <button
            key={i}
            aria-label={`cell-${i}`}
            onClick={() => handleClick(i)}
            className={`aspect-square rounded-xl text-3xl sm:text-4xl font-extrabold flex items-center justify-center transition-transform active:scale-95 select-none border border-black/5 dark:border-white/5 shadow-sm`}
            style={{
              background: `var(--color-earth)`,
              color: cell === "X" ? "var(--color-brick-red)" : cell === "O" ? "var(--color-sky-blue)" : "var(--foreground)",
            }}
          >
            {cell || ""}
          </button>
        ))}
      </div>
      </div>

      <div className="px-6 flex items-center justify-between gap-4 mt-2 w-full">
        {/* Status badge (fixed size-ish) */}
        <div
          className="min-w-full max-w-[360px] px-3 py-2 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(var(--color-earth-rgb) / 0.06)' }}
        >
          <div className="text-sm text-slate-600 dark:text-slate-300 text-center">
            {winner ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400" style={{ color: `var(--color-earth)` }}>WINNER</span>
                <strong
                  className="px-2 py-1 rounded-md text-sm"
                  style={{
                    backgroundColor: winner === 'X' ? `rgba(var(--color-brick-red-rgb) / 0.12)` : `rgba(var(--color-sky-blue-rgb) / 0.12)`,
                    color: winner === 'X' ? 'var(--color-brick-red)' : 'var(--color-sky-blue)'
                  }}
                >
                  {winner}
                </strong>
              </div>
            ) : board.every(Boolean) ? (
              <div className="text-sm font-bold text-slate-400">It's a tie!</div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-sm font-bold text-slate-400">NEXT MOVE</div>
                <div
                  className="px-2 py-1 rounded-md text-xs font-bold"
                  style={{
                    backgroundColor: (xTurn) ? `rgba(var(--color-brick-red-rgb) / 0.08)` : `rgba(var(--color-sky-blue-rgb) / 0.08)`,
                    color: (xTurn) ? 'var(--color-brick-red)' : 'var(--color-sky-blue)'
                  }}
                >
                  {(xTurn) ? 'X' : 'O'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* mode selector - centered and constrained to board width */}
      <div className="flex justify-center mt-2 w-full">
        <div className="flex items-center gap-2 w-full p-3 md:p-6" style={{ width: BOARD_FIXED_WIDTH }}>
          <button
            className={`flex-1 px-5 py-2 rounded-2xl flex items-center justify-center text-xs ${mode === "friend" ? "text-slate-600 font-bold" : "text-slate-400"}`}
            onClick={() => setMode("friend")}
            style={{ backgroundColor: mode === "friend" ? 'rgba(var(--color-earth-rgb))' : 'rgba(var(--color-earth-rgb) / 0.08)' }}
            type="button"
          >
            Play With Friend
          </button>

          <button
            className={`flex-1 px-5 py-2 rounded-2xl flex items-center justify-center text-xs ${mode === "computer" ? "text-slate-600 font-bold" : "text-slate-400"}`}
            onClick={() => setMode("computer")}
            style={{ backgroundColor: mode === "computer" ? 'rgba(var(--color-earth-rgb))' : 'rgba(var(--color-earth-rgb) / 0.08)' }}
            type="button"
          >
            Play VS AI
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
