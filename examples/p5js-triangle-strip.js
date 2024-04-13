// From https://p5js.org/examples/form-triangle-strip.html
let x;
let y;

export function setup({ p, width, height }) {
	p.background(204);
	x = width / 2;
	y = height / 2;
}

export function draw({ p, width, height }) {
	let outsideRadius = props.outsideRadius.value;
	let insideRadius = props.insideRadius.value;

	p.background(204);

	let numPoints = p.int(p.map(p.mouseX, 0, width, 6, 60));
	let angle = 0;
	let angleStep = 180.0 / numPoints;

	p.beginShape(p.TRIANGLE_STRIP);
	for (let i = 0; i <= numPoints; i++) {
		let px = x + p.cos(p.radians(angle)) * outsideRadius;
		let py = y + p.sin(p.radians(angle)) * outsideRadius;
		angle += angleStep;
		p.vertex(px, py);
		px = x + p.cos(p.radians(angle)) * insideRadius;
		py = y + p.sin(p.radians(angle)) * insideRadius;
		p.vertex(px, py);
		angle += angleStep;
	}
	p.endShape();
}

export let rendering = 'p5';

export let props = {
	outsideRadius: {
		value: 150,
		params: {
			min: 0,
			max: 200,
		},
	},
	insideRadius: {
		value: 100,
		params: {
			min: 0,
			max: 200,
		},
	},
};
