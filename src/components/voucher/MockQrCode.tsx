interface MockQrCodeProps {
  value: string;
  size?: number;
}

const GRID = 25;

const hashString = (input: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const buildMatrix = (value: string): boolean[][] => {
  const random = mulberry32(hashString(value));
  const matrix: boolean[][] = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => false)
  );

  const drawFinder = (top: number, left: number) => {
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const border = row === 0 || row === 6 || col === 0 || col === 6;
        const core = row >= 2 && row <= 4 && col >= 2 && col <= 4;
        matrix[top + row][left + col] = border || core;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, GRID - 7);
  drawFinder(GRID - 7, 0);

  for (let row = 0; row < GRID; row += 1) {
    for (let col = 0; col < GRID; col += 1) {
      const inFinderArea =
        (row < 8 && col < 8) ||
        (row < 8 && col > GRID - 9) ||
        (row > GRID - 9 && col < 8);

      if (inFinderArea) {
        continue;
      }

      if (row === 6 || col === 6) {
        matrix[row][col] = (row + col) % 2 === 0;
        continue;
      }

      matrix[row][col] = random() > 0.5;
    }
  }

  return matrix;
};

export const MockQrCode = ({ value, size = 180 }: MockQrCodeProps) => {
  const matrix = buildMatrix(value);

  return (
    <svg
      width={size}
      height={size}
      viewBox="-2 -2 29 29"
      role="img"
      aria-label="QR check-in simulasi"
      className="rounded-md bg-white"
    >
      <rect x="-2" y="-2" width="29" height="29" fill="#FFFFFF" />
      {matrix.map((row, rowIndex) =>
        row.map((filled, colIndex) =>
          filled ? (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex}
              y={rowIndex}
              width={1}
              height={1}
              fill="#0F172A"
            />
          ) : null
        )
      )}
    </svg>
  );
};
