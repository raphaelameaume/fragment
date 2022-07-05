export function loadScript(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.onerror = (err) => {
			reject(err);
		};
		script.onload = () => {
			resolve();
		}

		script.src = src;
		document.body.appendChild(script);
	});
}
