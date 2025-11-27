import { BoardValue } from "../constant";

export type DifficultyLevel = "easy" | "medium" | "hard" | "insane";

// Fungsi untuk menghitung skor minimax
const minimax = (
    board: BoardValue[],
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number
): number => {
    const winner = calculateWinner(board);

    // Terminal states
    if (winner === "O") return 10 - depth; // AI menang (lebih cepat = lebih baik)
    if (winner === "X") return depth - 10; // Player menang
    if (board.every(Boolean)) return 0; // Tie

    if (isMaximizing) {
        let maxScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                const score = minimax(board, depth + 1, false, alpha, beta);
                board[i] = "";
                maxScore = Math.max(score, maxScore);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "X";
                const score = minimax(board, depth + 1, true, alpha, beta);
                board[i] = "";
                minScore = Math.min(score, minScore);
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        }
        return minScore;
    }
};

// Fungsi untuk mencari best move menggunakan minimax
const findBestMove = (board: BoardValue[]): number => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "O";
            const score = minimax(board, 0, false, -Infinity, Infinity);
            board[i] = "";

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
};

// Fungsi untuk mencari gerakan yang bisa menang atau block
const findWinningOrBlockingMove = (
    board: BoardValue[],
    player: BoardValue
): number | null => {
    const WIN_PATTERNS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const [a, b, c] of WIN_PATTERNS) {
        const line = [board[a], board[b], board[c]];
        const emptyIndex = [a, b, c].find(i => board[i] === "");

        if (emptyIndex !== undefined) {
            const filledCount = line.filter(cell => cell === player).length;
            const emptyCount = line.filter(cell => cell === "").length;

            if (filledCount === 2 && emptyCount === 1) {
                return emptyIndex;
            }
        }
    }

    return null;
};

// Fungsi helper untuk menghitung winner
const calculateWinner = (board: BoardValue[]): BoardValue | null => {
    const WIN_PATTERNS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of WIN_PATTERNS) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};

// Main AI function dengan level kesulitan
export const getAIMove = (
    board: BoardValue[],
    difficulty: DifficultyLevel
): number => {
    const emptyIndices = board
        .map((v, i) => (v === "" ? i : -1))
        .filter(i => i !== -1);

    if (emptyIndices.length === 0) return -1;

    // Random move function
    const getRandomMove = () =>
        emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

    switch (difficulty) {
        case "easy":
            // 80% random, 20% smart
            if (Math.random() < 0.8) {
                return getRandomMove();
            }
            // 20% chance untuk block atau ambil center
            const blockMove = findWinningOrBlockingMove(board, "X");
            if (blockMove !== null && Math.random() < 0.5) return blockMove;
            if (board[4] === "") return 4; // Center
            return getRandomMove();

        case "medium":
            // 40% random, 60% smart
            if (Math.random() < 0.4) {
                return getRandomMove();
            }

            // Coba menang dulu
            const winMove = findWinningOrBlockingMove(board, "O");
            if (winMove !== null) return winMove;

            // Block player
            const blockMoveM = findWinningOrBlockingMove(board, "X");
            if (blockMoveM !== null) return blockMoveM;

            // Ambil center jika kosong
            if (board[4] === "") return 4;

            // Ambil corner
            const corners = [0, 2, 6, 8].filter(i => board[i] === "");
            if (corners.length > 0) {
                return corners[Math.floor(Math.random() * corners.length)];
            }

            return getRandomMove();

        case "hard":
            // 10% random, 90% optimal
            if (Math.random() < 0.1) {
                return getRandomMove();
            }

            // Coba menang dulu
            const winMoveH = findWinningOrBlockingMove(board, "O");
            if (winMoveH !== null) return winMoveH;

            // Block player
            const blockMoveH = findWinningOrBlockingMove(board, "X");
            if (blockMoveH !== null) return blockMoveH;

            // Gunakan minimax untuk move terbaik
            return findBestMove(board);

        case "insane":
            // 100% optimal play menggunakan minimax
            // Coba menang dulu
            const winMoveI = findWinningOrBlockingMove(board, "O");
            if (winMoveI !== null) return winMoveI;

            // Block player
            const blockMoveI = findWinningOrBlockingMove(board, "X");
            if (blockMoveI !== null) return blockMoveI;

            // Gunakan minimax untuk move terbaik
            return findBestMove(board);

        default:
            return getRandomMove();
    }
};

// Stats untuk setiap level
export const difficultyStats = {
    easy: {
        name: "Easy",
        description: "Cocok untuk pemula",
        winRate: "~80%",
        icon: "😊"
    },
    medium: {
        name: "Medium",
        description: "Tantangan sedang",
        winRate: "~50%",
        icon: "🤔"
    },
    hard: {
        name: "Hard",
        description: "AI yang cerdas",
        winRate: "~20%",
        icon: "😤"
    },
    insane: {
        name: "Insane",
        description: "Hampir mustahil menang!",
        winRate: "~0%",
        icon: "🤖"
    }
};