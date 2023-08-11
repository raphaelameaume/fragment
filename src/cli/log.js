import kleur from 'kleur';

const log = (() => {
	let _prefix = createPrefix('fragment');

	const success = (message, prefix = _prefix) => {
		console.log(prefix, kleur.green(`✔ ${message}`));
	};

	const warning = (message, prefix = _prefix) => {
		console.log(prefix, kleur.yellow(`ℹ ${message}`));
	};

	const error = (message, prefix = _prefix) => {
		console.log(prefix, kleur.red(`✖ ${message}`));
	};

	const text = (message, prefix = _prefix) => {
		console.log(prefix, message);
	};

	function createPrefix(prefix) {
		return kleur.grey(`[${prefix}]`);
	}

	return {
		prefix: _prefix,
		createPrefix,
		success,
		warning,
		error,
		text,
	};
})();

export default log;
