export let props = {
  radius: {
    value: 100,
    params: {
      min: 50,
      max: 250
    },
  },
  size: {
    value: 100,
    params: {
      min: 50,
      max: 250
    },
  },
  shape: {
    value: "circle",
    params: {
      options: ["circle", "square"]
    }
  },
  fill: {
    value: "#0000ff",
  }
};

export let fps = 0;

export let update = ({ context, width, height }) => {
  // draw background
  context.fillStyle = '#000000';
  context.fillRect(0, 0, width, height);

  // draw circle
  const radius = props.radius.value;
  const shape = props.shape.value;
  const size = props.size.value;

  context.fillStyle = props.fill.value;

  if (shape === "circle") {
    context.beginPath();
    context.arc(width * 0.5, height * 0.5, radius, 0, 2 * Math.PI, false);
    context.fill();
  } else if (shape === "square") {
    context.fillRect(width * 0.5 - size * 0.5, height * 0.5 - size * 0.5, size, size);
  }
};

export let rendering = "2d";
