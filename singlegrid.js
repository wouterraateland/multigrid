function SingleGridResult({ velocity, pressure, initialError, error }) {
  const node = document.createElement("div");
  node.className = "flex gap-2 max-w-full px-4 sm:px-8 overflow-x-auto snap-x";
  node.appendChild(Result({ data: pressure, label: "Pressure" }));
  node.appendChild(
    Result({
      data: velocity,
      label: "Resulting velocity",
      type: "vec2",
      min: 0,
      max: 1,
    })
  );
  const sum = gridSum(error, Math.abs);
  const initialSum = gridSum(initialError, Math.abs);
  const percentage = ((sum / initialSum) * 100).toFixed(0);

  const label = document.createElement("p");
  label.appendChild(document.createTextNode("Residual error: "));
  label.appendChild(Exponent({ value: sum }));
  label.appendChild(document.createTextNode(` (${percentage}%)`));

  node.appendChild(Result({ data: error, label }));
  return node;
}

function SingleGrid({ velocity, divergence, n }) {
  const node = document.createElement("div");
  node.className = "flex flex-col gap-2";
  const pressure = [divergence.map((row) => row.map((_) => 0))];
  const resultingVelocity = [velocity];
  const residualError = [calcError(pressure[0], divergence, n)];
  let resultNode;

  function setIteration(iteration) {
    while (residualError.length < iteration + 1) {
      pressure.push(calcPressure(divergence, pressure[pressure.length - 1], n));
      resultingVelocity.push(
        applyPressure(pressure[pressure.length - 1], velocity, n)
      );
      residualError.push(
        calcError(pressure[pressure.length - 1], divergence, n)
      );
    }

    if (resultNode) {
      node.removeChild(resultNode);
    }
    resultNode = SingleGridResult({
      pressure: pressure[iteration],
      velocity: resultingVelocity[iteration],
      initialError: residualError[0],
      error: residualError[iteration],
    });
    node.appendChild(resultNode);
  }

  node.appendChild(
    PressureHeader({ title: "Single grid method", onChange: setIteration })
  );
  setIteration(0);
  return node;
}
