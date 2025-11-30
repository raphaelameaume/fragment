import p5 from 'p5';

const randomFloor = (min, max) => {
	return Math.floor(Math.random() * (max - min) + min);
};

export let props = {
	seed: {
		value: 10,
		disabled: true,
	},
	randomize: {
		value: () => {
			props.seed.value = Math.floor(Math.random() * 1000);
			props.cols.value = randomFloor(
				props.cols.params.min,
				props.cols.params.max,
			);

			props.rows.value = randomFloor(
				props.rows.params.min,
				props.rows.params.max,
			);

			props.colGap.value = randomFloor(
				props.colGap.params.min,
				props.colGap.params.max,
			);

			props.rowGap.value = randomFloor(
				props.rowGap.params.min,
				props.rowGap.params.max,
			);

			props.cellSize.value = randomFloor(
				props.cellSize.params.min,
				props.cellSize.params.max,
			);
		},
		params: {
			label: 'randomize',
		},
		displayName: null,
	},
	cols: {
		value: 10,
		params: {
			min: 10,
			max: 20,
			step: 1,
		},
	},
	colGap: {
		value: 8,
		params: {
			min: 0,
			max: 20,
		},
	},
	rows: {
		value: 10,
		params: {
			min: 10,
			max: 20,
			step: 1,
		},
	},
	rowGap: {
		value: 8,
		params: {
			min: 0,
			max: 20,
		},
	},
	cellSize: {
		value: 24,
		params: {
			min: 5,
			max: 40,
			step: 1,
		},
	},
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {p5} params.p
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @param {number} params.time
 * @param {number} params.deltaTime
 * @param {number} params.frame
 * @param {number} params.playhead
 * @param {number} params.playcount
 */
export function draw({ p, width, height, pixelRatio, playhead, time }) {
	p.background(255, 255, 255);

	p.randomSeed(props.seed.value);

	const w = width;
	const h = height;

	const cols = props.cols.value;
	const rows = props.rows.value;
	const colGap = props.colGap.value;
	const rowGap = props.rowGap.value;
	const cellSize = props.cellSize.value;

	let offsetX = Math.floor((cellSize * cols + colGap * (cols - 1) - w) * 0.5);
	let offsetY = Math.floor((cellSize * rows + rowGap * (rows - 1) - h) * 0.5);

	let colors = ['green', 'black', 'red'];

	for (let i = 0; i < cols; i++) {
		let x = i * cellSize - offsetX + i * colGap;
		for (let j = 0; j < rows; j++) {
			let y = j * cellSize - offsetY + j * rowGap;

			let colorIndex = Math.floor(p.random(0, colors.length));
			let color = colors[colorIndex];

			let size =
				cellSize +
				(Math.sin(playhead * Math.PI * 2 + i * Math.PI + j * Math.PI) -
					1) *
					0.5 *
					cellSize *
					0.5;

			p.noStroke();
			p.fill(color);
			p.rect(
				x + (cellSize - size) * 0.5,
				y + (cellSize - size) * 0.5,
				size,
				size,
			);
		}
	}
}

export let rendering = 'p5';
// export let fps = 0;
export let duration = 2;
export let buildConfig = {
	canvasSize: 'window',
};
