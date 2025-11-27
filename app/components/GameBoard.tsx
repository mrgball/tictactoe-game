"use client";

import { useEffect, useRef, useState } from "react";
import { BoardValue, GameMode, WIN_PATTERNS } from "../constant";
import * as bot from "../utils/logic-bot";

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
  const [difficulty, setDifficulty] = useState<bot.DifficultyLevel>("medium");
  const BOARD_FIXED_WIDTH = 360;
  const lastWinner = useRef<BoardValue | null>(null);
  const [board, setBoard] = useState<BoardValue[]>(Array(9).fill(""));
  const [xTurn, setXTurn] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = (i: number) => {
    if (board[i] || calculateWinner(board)) return;
    const nextBoard = [...board];
    nextBoard[i] = xTurn ? "X" : "O";
    setBoard(nextBoard);
    setXTurn(!xTurn);
  }

  // Auto reset jika draw (tidak ada pemenang dan board penuh)
  useEffect(() => {
    if (!calculateWinner(board) && board.every(Boolean)) {
      // Board penuh tapi tidak ada pemenang = draw
      // Reset board otomatis setelah 1 detik
      const timer = setTimeout(() => {
        setBoard(Array(9).fill(""));
        setXTurn(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [board]);

  const resetBoard = (clearScores = false) => {
    setBoard(Array(9).fill(""));
    setXTurn(true);
    if (clearScores) setScores({ X: 0, O: 0 });
    lastWinner.current = null;
  }

  const handlePlayNow = () => {
    setXTurn(true);
    resetBoard(true);
    setIsPlaying(true);
  }

  const winner = calculateWinner(board);

  useEffect(() => {
    if (winner && lastWinner.current !== winner) {
      setScores((score) => ({ ...score, [winner]: score[winner] + 1 }));
      lastWinner.current = winner;
    }
  }, [winner]);

  const handleEndGame = () => {
    resetBoard(false);
    setIsPlaying(false);
  }

  const handleRematch = () => {
    resetBoard();
    setIsPlaying(true);
  }

  // CPU move dengan level kesulitan
  useEffect(() => {
    if (mode !== "computer") return;
    if (!xTurn && !calculateWinner(board)) {
      const aiMove = bot.getAIMove(board, difficulty);
      if (aiMove !== -1) {
        const t = setTimeout(() => handleClick(aiMove), 500);
        return () => clearTimeout(t);
      }
    }
  }, [board, xTurn, mode, difficulty]);

  return (
    <div
      className="mx-auto rounded-3xl p-6 sm:p-8 ring-1 ring-black/5 dark:ring-white/6 shadow-lg flex flex-col items-center justify-center"
      style={{ width: BOARD_FIXED_WIDTH + 48, backgroundColor: "var(--color-dark-blue)" }}
    >
      {/* Scoreboard */}
      {isPlaying && (
        <div className="flex justify-center w-full">
          <div className="flex items-center justify-between gap-3 w-full p-3 md:p-6 flex-nowrap" style={{ width: BOARD_FIXED_WIDTH }}>

            <div
              className="flex items-center justify-center gap-3 px-5 py-3 rounded-2xl w-[250px] h-20"
              style={{ background: `rgba(var(--color-brick-red-rgb) / 0.08)` }}
            >
              <div className="leading-tight text-center whitespace-nowrap">
                <div className="text-xs text-slate-400">
                  {mode === "computer" ? "You" : "Player X"}
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
                  {scores.X}
                </div>
              </div>
            </div>

            <div className="flex-1 text-center whitespace-nowrap">
              <div className="text-lg font-bold uppercase" style={{ color: `var(--color-earth)` }}>
                Scoreboard
              </div>
            </div>

            <div
              className="flex items-center gap-3 px-5 py-3 w-[250px] h-20 rounded-2xl justify-center"
              style={{ background: `rgba(var(--color-sky-blue-rgb) / 0.08)` }}
            >
              <div className="leading-tight text-center whitespace-nowrap">
                <div className="text-xs text-slate-400">
                  {mode === "computer" ? `CPU ${bot.difficultyStats[difficulty].icon}` : "Player O"}
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
                  {scores.O}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Game Board */}
      {isPlaying && (
        <div className="flex justify-center w-full">
          <div className="mx-auto grid grid-cols-3 md:gap-6 p-3 md:p-6" style={{ width: BOARD_FIXED_WIDTH }}>
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
      )}

      {/* Status */}
      {isPlaying && (
        <div className="px-6 flex items-center justify-between gap-4 w-full">
          <div
            className="min-w-full max-w-[360px] px-3 py-2 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(var(--color-earth-rgb) / 0.06)' }}
          >
            <div className="text-sm text-slate-600 dark:text-slate-300 text-center">
              {winner ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-base font-bold tracking-wide"
                    style={{ color: `var(--color-earth)` }}>
                    <span>🏆</span>
                    <span>Winner!</span>
                    <span>🎉</span>
                  </div>

                  <strong
                    className="px-3 py-1 rounded-lg text-sm font-bold shadow-sm whitespace-nowrap"
                    style={{
                      backgroundColor:
                        winner === "X"
                          ? `rgba(var(--color-brick-red-rgb) / 0.15)`
                          : `rgba(var(--color-sky-blue-rgb) / 0.15)`,
                      color: winner === "X" ? "var(--color-brick-red)" : "var(--color-sky-blue)",
                      border: `1px solid ${winner === "X"
                        ? `rgba(var(--color-brick-red-rgb) / 0.3)`
                        : `rgba(var(--color-sky-blue-rgb) / 0.3)`
                        }`
                    }}
                  >
                    {winner}
                  </strong>
                </div>
              ) : board.every(Boolean) ? (
                <div className="flex items-center gap-2">
                  <span className="text-base">⏳</span>
                  <div className="text-sm font-bold text-slate-400">Draw! Restarting...</div>
                </div>
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
      )}

      {/* Buttons */}
      {isPlaying && (
        <div className="flex justify-center w-full">
          <div className="flex items-center gap-3 w-full p-3 md:p-6" style={{ width: BOARD_FIXED_WIDTH }}>

            <button
              className="flex-1 whitespace-nowrap px-5 py-3 rounded-2xl flex items-center justify-center text-xs font-semibold transition-all"
              onClick={handleRematch}
              style={{
                border: "1px solid rgba(var(--color-brick-red-rgb))",
                color: "rgba(var(--color-brick-red-rgb))"
              }}
              type="button"
            >
              REMATCH
            </button>

            <button
              className="flex-1 whitespace-nowrap px-5 py-3 rounded-2xl flex items-center justify-center text-xs font-semibold transition-all text-white"
              onClick={handleEndGame}
              style={{
                backgroundColor: "rgba(var(--color-brick-red-rgb))"
              }}
              type="button"
            >
              END GAME
            </button>
          </div>
        </div>
      )}

      {/* Menu Awal */}
      {!isPlaying && (
        <div className="flex justify-center w-full">
          <div
            className="flex flex-col items-center gap-3 w-full p-3 md:p-6"
            style={{ width: BOARD_FIXED_WIDTH }}
          >
            <div className="text-center text-lg font-bold tracking-wide text-slate-600 dark:text-slate-300">
              TIC-TAC-TOE
            </div>

            {/* Mode Selector */}
            <div className="flex items-center gap-2 w-full">
              <button
                className={`flex-1 h-14 whitespace-nowrap px-5 py-3 rounded-2xl flex items-center justify-center text-xs font-semibold transition-all ${mode === "computer" ? "text-slate-900" : "text-slate-400"
                  }`}
                onClick={() => {
                  setMode("computer");
                  setXTurn(true);
                  resetBoard(true);
                }}
                style={{
                  backgroundColor:
                    mode === "computer"
                      ? "rgba(var(--color-earth-rgb))"
                      : "rgba(var(--color-earth-rgb) / 0.08)"
                }}
              >
                Play With Computer
              </button>

              <button
                className={`flex-1 h-14 whitespace-nowrap px-5 py-3 rounded-2xl flex items-center justify-center text-xs font-semibold transition-all ${mode === "friend" ? "text-slate-900" : "text-slate-400"
                  }`}
                onClick={() => {
                  setMode("friend");
                  setXTurn(true);
                  resetBoard(true);
                }}
                style={{
                  backgroundColor:
                    mode === "friend"
                      ? "rgba(var(--color-earth-rgb))"
                      : "rgba(var(--color-earth-rgb) / 0.08)"
                }}
              >
                Play With Friend
              </button>
            </div>

            {/* Difficulty Selector (hanya muncul jika mode computer) */}
            {mode === "computer" && (
              <div className="w-full mt-2">
                <div className="text-xs text-slate-400 mb-2 text-center">Select Difficulty</div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {(Object.keys(bot.difficultyStats) as bot.DifficultyLevel[]).map((level) => (
                    <button
                      key={level}
                      className={`h-16 px-3 py-2 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all ${difficulty === level ? "text-slate-900" : "text-slate-400"
                        }`}
                      onClick={() => setDifficulty(level)}
                      style={{
                        backgroundColor:
                          difficulty === level
                            ? "rgba(var(--color-earth-rgb))"
                            : "rgba(var(--color-earth-rgb) / 0.08)"
                      }}
                    >
                      <span className="text-lg mb-1">{bot.difficultyStats[level].icon}</span>
                      <span className="uppercase">{bot.difficultyStats[level].name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PLAY NOW button */}
            <button
              className="w-full h-14 mt-4 whitespace-nowrap px-5 py-3 rounded-2xl flex items-center justify-center text-xs font-semibold transition-all hover:bg-earth hover:opcacity-90 text-white hover:text-slate-900"
              onClick={handlePlayNow}
              style={{
                border: "2px solid rgba(var(--color-earth-rgb))",
              }}
            >
              PLAY NOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameBoard;