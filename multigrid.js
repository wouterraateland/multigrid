function MultiGridResult({
  iteration,
  velocity,
  pressure,
  initialError,
  error,
}) {
  const node = document.createElement("div");
  node.className = "flex max-w-full overflow-x-auto snap-x gap-2 px-4 sm:px-8";
  node.appendChild(Result({ data: pressure, label: "Pressure" }));
  node.appendChild(
    Result({
      data: velocity,
      label: iteration === 0 ? "Initial velocity" : "Resulting velocity",
      type: "vec2",
      min: 0,
      max: 1,
    })
  );
  const sum = gridSum(error, Math.abs);
  const initialSum = gridSum(initialError, Math.abs);
  const percentage = ((sum / initialSum) * 100).toFixed(0);

  const label = document.createElement("p");
  label.appendChild(
    document.createTextNode(
      iteration === 0 ? "Initial error: " : "Residual error: "
    )
  );
  label.appendChild(Exponent({ value: sum }));
  label.appendChild(document.createTextNode(` (${percentage}%)`));

  node.appendChild(Result({ data: error, label }));
  return node;
}

function MultiGrid({ velocity, divergence, n }) {
  const node = document.createElement("div");
  node.className = "flex flex-col gap-2";
  const lods = 3;
  const multigridDivergence = [divergence];
  for (let level = 1; level < lods; level++) {
    multigridDivergence.push(
      restrict(multigridDivergence[level - 1], n >> (level - 1))
    );
  }

  const pressure = [divergence.map((row) => row.map((_) => 0))];
  const resultingVelocity = [velocity];
  const residualError = [
    calcError(pressure[pressure.length - 1], divergence, n),
  ];
  let prevNode;

  function setIteration(iteration) {
    while (pressure.length < iteration + 1) {
      const its = pressure.length;
      const smallN = n >> (lods - 1);
      let p = Array(smallN)
        .fill()
        .map((_) => Array(smallN).fill(0));
      for (let i = 0; i < its; i++) {
        p = calcPressure(
          multigridDivergence[lods - 1],
          p,
          smallN,
          1 << (lods - 1)
        );
      }

      for (let level = lods - 2; level >= 0; level--) {
        const levelN = n >> level;
        p = prolongate(p, levelN / 2);
        for (let i = 0; i < its; i++) {
          p = calcPressure(multigridDivergence[level], p, levelN, 1 << level);
        }
      }

      pressure.push(p);
      resultingVelocity.push(
        applyPressure(pressure[pressure.length - 1], velocity, n)
      );
      residualError.push(
        calcError(pressure[pressure.length - 1], divergence, n)
      );
    }

    const newNode = MultiGridResult({
      iteration,
      pressure: pressure[iteration],
      velocity: resultingVelocity[iteration],
      initialError: residualError[0],
      error: residualError[iteration],
    });

    if (prevNode) {
      node.removeChild(prevNode);
    }
    prevNode = node.appendChild(newNode);
  }

  node.appendChild(
    PressureHeader({ title: "Multigrid method", onChange: setIteration })
  );
  setIteration(0);
  return node;
}
