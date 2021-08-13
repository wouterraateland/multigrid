function run() {
  const n = 16;
  const row = document.createElement("div");
  row.className = "flex gap-2";

  const velocity = Array(n)
    .fill()
    .map((_, y) =>
      Array(n)
        .fill()
        .map((_, x) =>
          velocityBndCond(
            {
              x: Math.pow(x - n / 2, 2) + Math.pow(y - n / 2, 2) < 6 ? 1 : 0,
              y: 0,
            },
            x,
            y,
            n
          )
        )
    );
  row.appendChild(
    Result({
      data: velocity,
      type: "vec2",
      label: "Initial velocity",
      min: 0,
      max: 1,
    })
  );

  const divergence = calcDivergence(velocity, n);
  row.appendChild(
    Result({
      data: divergence,
      label: "Divergence",
      min: -0.5,
      max: 0.5,
    })
  );

  const node = document.getElementById("root");
  node.appendChild(row);
  node.appendChild(SingleGrid({ velocity, divergence, n }));
  node.appendChild(MultiGrid({ velocity, divergence, n }));
}

document.addEventListener("DOMContentLoaded", run, false);
