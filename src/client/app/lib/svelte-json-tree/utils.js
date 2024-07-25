import { getContext, setContext } from 'svelte';

export function getShouldExpandNode({
	defaultExpandedPaths,
	defaultExpandedLevel,
}) {
	const defaultExpandedPathsParts = defaultExpandedPaths.map((path) =>
		path.split('.'),
	);
	function matchPath(keyPath) {
		outer: for (const parts of defaultExpandedPathsParts) {
			if (keyPath.length > parts.length) continue;
			const length = Math.min(keyPath.length, parts.length);
			for (let i = 0; i < length; i++) {
				if (parts[i] !== '*' && parts[i] !== String(keyPath[i]))
					continue outer;
			}
			return true;
		}
		return false;
	}

	return function ({ keyPath, level }) {
		return level <= defaultExpandedLevel || matchPath(keyPath);
	};
}

export function objType(obj, shouldTreatIterableAsObject) {
	const type = Object.prototype.toString.call(obj).slice(8, -1);
	if (type === 'Object') {
		if (
			!shouldTreatIterableAsObject &&
			typeof obj[Symbol.iterator] === 'function'
		) {
			return 'Iterable';
		}
		return obj.constructor.name;
	}

	return type;
}

export function useState() {
	const root = getContext('root');
	const displayMode = getContext('displayMode');
	const expandable = getContext('expandable');
	const expanded = getContext('expanded');
	const toggleExpand = getContext('toggleExpand');

	return {
		root,
		displayMode,
		expandable,
		expanded,
		toggleExpand,
	};
}
