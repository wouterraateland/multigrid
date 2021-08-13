const minColor = [250, 80, 25];
const maxColor = [60, 100, 50];

if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  document.body.classList.add("dark");
}

function hslInterpolate(from, to, x) {
  const y = 1 - x;
  const dh = ((540 + to[0] - from[0]) % 360) - 180;
  return `hsl(${from[0] + x * dh}deg, ${y * from[1] + x * to[1]}%, ${
    y * from[2] + x * to[2]
  }%)`;
}

function gridSum(grid, f = (x) => x) {
  return grid.flatMap((row) => row).reduce((acc, x) => acc + f(x), 0);
}

function velocityBndCond(v, x, y, n) {
  // No slip boundaries
  if (x < 0 || y < 0 || x >= n || y >= n) {
    return { x: 0, y: 0 };
  }

  return v;
}

function calcDivergence(velocity, n) {
  const alpha = 0.5;
  return velocity.map((row, y) =>
    row.map((_, x) => {
      const xl = Math.max(0, x - 1);
      const xr = Math.min(x + 1, n - 1);
      const yt = Math.max(0, y - 1);
      const yb = Math.min(y + 1, n - 1);
      const v = velocity[y][x];
      const vl = velocityBndCond(velocity[y][xl], x - 1, y, n);
      const vr = velocityBndCond(velocity[y][xr], x + 1, y, n);
      const vt = velocityBndCond(velocity[yt][x], x, y - 1, n);
      const vb = velocityBndCond(velocity[yb][x], x, y + 1, n);
      return alpha * (vr.x - v.x + (v.x - vl.x) + (vb.y - v.y) + (v.y - vt.y));
    })
  );
}

function calcPressure(divergence, pressure, n, scale = 1) {
  const alpha = scale * scale;
  return pressure.map((row, y) =>
    row.map((_, x) => {
      const xl = Math.max(0, x - 1);
      const xr = Math.min(x + 1, n - 1);
      const yt = Math.max(0, y - 1);
      const yb = Math.min(y + 1, n - 1);
      const pl = pressure[y][xl];
      const pr = pressure[y][xr];
      const pt = pressure[yt][x];
      const pb = pressure[yb][x];

      return (pl + pr + pt + pb - alpha * divergence[y][x]) * 0.25;
    })
  );
}

function applyPressure(pressure, velocity, n) {
  const alpha = 0.5;
  return velocity.map((row, y) =>
    row.map((v, x) => {
      const xl = Math.max(0, x - 1);
      const xr = Math.min(x + 1, n - 1);
      const yt = Math.max(0, y - 1);
      const yb = Math.min(y + 1, n - 1);
      const pl = pressure[y][xl];
      const pr = pressure[y][xr];
      const pt = pressure[yt][x];
      const pb = pressure[yb][x];

      return { x: v.x - alpha * (pr - pl), y: v.y - alpha * (pb - pt) };
    })
  );
}

function calcError(pressure, divergence, n) {
  return divergence.map((row, y) =>
    row.map((div, x) => {
      const xl = Math.max(0, x - 1);
      const xr = Math.min(x + 1, n - 1);
      const yt = Math.max(0, y - 1);
      const yb = Math.min(y + 1, n - 1);
      const pc = pressure[y][x];
      const pl = pressure[y][xl];
      const pr = pressure[y][xr];
      const pt = pressure[yt][x];
      const pb = pressure[yb][x];

      return div - (pl + pr + pt + pb - 4 * pc);
    })
  );
}

function restrict(divergence, n) {
  return Array(n / 2)
    .fill()
    .map((_, y) =>
      Array(n / 2)
        .fill()
        .map(
          (_, x) =>
            0.25 *
            (divergence[2 * y][2 * x] +
              divergence[2 * y][2 * x + 1] +
              divergence[2 * y + 1][2 * x] +
              divergence[2 * y + 1][2 * x + 1])
        )
    );
}

function prolongate(pressure, n) {
  return Array(2 * n)
    .fill()
    .map((_, y) =>
      Array(2 * n)
        .fill()
        .map((_, x) => {
          const x0 = Math.floor(x / 2);
          const y0 = Math.floor(y / 2);
          const x1 = Math.max(0, Math.min(x0 + 2 * (x % 2) - 1, n - 1));
          const y1 = Math.max(0, Math.min(y0 + 2 * (y % 2) - 1, n - 1));
          const p00 = pressure[y0][x0];
          const p10 = pressure[y0][x1];
          const p01 = pressure[y1][x0];
          const p11 = pressure[y1][x1];
          return (9 * p00 + 3 * (p01 + p10) + p11) / 16;
        })
    );
}
