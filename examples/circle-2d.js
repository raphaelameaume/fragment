export let props = {
  radius: {
    value: 100,
    params: {
      min: 50,
      max: 250
    }
  }
};

export let fps = 0;

export let update = ({ context, width, height }) => {
  // draw background
  context.fillStyle = '#000000';
  context.fillRect(0, 0, width, height);

  // draw circle
  const radius = props.radius.value;

  context.fillStyle = '#0000ff';
  context.beginPath();
  context.arc(width * 0.5, height * 0.5, radius, 0, 2 * Math.PI, false);
  context.fill();
};

export let rendering = "2d";
