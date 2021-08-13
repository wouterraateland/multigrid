function P({ text, className }) {
  const node = document.createElement("p");
  node.textContent = text;
  node.className = className;
  return node;
}

function Exponent({ value, precision = 0, className }) {
  const [base, exponent] = value
    .toExponential(precision)
    .replace("+", "")
    .split("e");

  const baseNode = document.createTextNode(base);
  baseNode.textContent = base;

  const timesNode = document.createElement("small");
  timesNode.className = "opacity-50";
  timesNode.innerHTML = "&times;";

  const tenNode = document.createTextNode("10");

  const supNode = document.createElement("sup");
  supNode.textContent = exponent;

  const node = document.createElement("span");
  node.className = className;
  node.appendChild(baseNode);
  node.appendChild(timesNode);
  node.appendChild(tenNode);
  node.appendChild(supNode);

  return node;
}

function Button({ label, onClick }) {
  const node = document.createElement("button");
  node.className = "px-3 py-1 border rounded-md bg-d-100 font-bold";
  node.textContent = label;
  node.addEventListener("click", onClick);
  return node;
}

function ResultGrid({ data, min, max, type }) {
  const canvas = document.createElement("canvas");
  canvas.className = "block";
  canvas.width = data[0].length;
  canvas.height = data.length;
  canvas.style.width = `${data[0].length}rem`;
  canvas.style.height = `${data.length}rem`;
  canvas.style.imageRendering = "pixelated";
  const ctx = canvas.getContext("2d");

  const node = document.createElement("div");
  node.className = "relative rounded-md overflow-hidden";
  node.appendChild(canvas);

  data.forEach((row, y) =>
    row.forEach((value, x) => {
      const magnitude =
        type === "number"
          ? value
          : Math.sqrt(value.x * value.x + value.y * value.y);
      const magnitudeNormalized = (magnitude - min) / (max - min);

      ctx.fillStyle = hslInterpolate(minColor, maxColor, magnitudeNormalized);
      ctx.fillRect(x, y, 1, 1);

      if (type === "vec2" && magnitudeNormalized >= 1 / 12) {
        const arrow = document.createElement("div");
        arrow.className = "arrow";
        arrow.style.top = `${y + 0.5}rem`;
        arrow.style.left = `${x + 0.5}rem`;
        // arrow.style.width = `${2 + 12 * magnitudeNormalized}px`;
        // arrow.style.height = `${1 + magnitudeNormalized}px`;
        arrow.style.transform = `scale(${magnitudeNormalized}) rotate(${Math.atan2(
          value.y,
          value.x
        )}rad)`;
        node.appendChild(arrow);
      }
    })
  );
  return node;
}

function LegendGradient({ n }) {
  const node = document.createElement("div");
  node.className = "flex flex-grow rounded-md overflow-hidden";
  for (let i = 0; i < n; i++) {
    const div = document.createElement("div");
    div.className = "flex-grow h-4";
    div.style.backgroundColor = hslInterpolate(minColor, maxColor, i / (n - 1));
    node.appendChild(div);
  }
  return node;
}

function ResultLegend({ min, max }) {
  const node = document.createElement("div");
  node.className = "flex items-end w-full";
  node.appendChild(Exponent({ value: min, className: "mr-2" }));
  node.appendChild(LegendGradient({ n: 8 }));
  node.appendChild(Exponent({ value: max, className: "ml-2" }));
  return node;
}

function ResultData({ data, type = "number", ...props }) {
  const values = data.flatMap((row) => row);
  let evMin = 0;
  let evMax = 0;
  switch (type) {
    case "number": {
      evMin = Math.min(...values);
      evMax = Math.max(...values);
      break;
    }
    case "vec2": {
      let magnitude = values.map(({ x, y }) => Math.sqrt(x * x + y * y));
      evMin = Math.min(...magnitude);
      evMax = Math.max(...magnitude);
      break;
    }
  }

  const min = props.min ?? (evMin === evMax ? 0 : evMin);
  const max = props.max ?? (evMin === evMax ? 1 : evMax);

  const node = document.createElement("div");
  node.className = "flex flex-col items-center gap-2";
  node.appendChild(ResultGrid({ data, min, max, type }));
  node.appendChild(ResultLegend({ min, max }));
  return node;
}

function Result({ label, ...props }) {
  const node = document.createElement("div");
  node.className =
    "flex flex-col gap-2 p-2 bg-d-100 snap-center rounded-md border";
  node.appendChild(typeof label === "string" ? P({ text: label }) : label);
  node.appendChild(ResultData({ ...props }));
  return node;
}

function PressureHeader({ title, onChange }) {
  let descriptionNode;
  let iteration;

  function setIteration(v) {
    iteration = Math.max(0, v);
    descriptionNode.textContent = `${iteration} iterations`;
    onChange(iteration);
  }

  const node = document.createElement("div");
  node.className = "flex flex-col sm:flex-row gap-8 items-center px-4 sm:px-8";
  node.appendChild(P({ text: title, className: "text-xl" }));

  const controls = document.createElement("div");
  controls.className = "flex gap-2 items-center";
  controls.appendChild(
    Button({
      label: "-",
      onClick: () => setIteration(iteration - 1),
    })
  );
  descriptionNode = controls.appendChild(P({}));
  controls.appendChild(
    Button({
      label: "+",
      onClick: () => setIteration(iteration + 1),
    })
  );
  node.appendChild(controls);

  setIteration(0);

  return node;
}
