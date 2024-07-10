class PersistentState {
	_current = $state();
	key = $state('');

	constructor(initialState, key) {
		this._current = initialState;
		this.key = key;
	}

	get current() {
		return this.current;
	}

	set current(v) {
		this._current = v;
	}
}

export function persistentState(initialState) {
	const s = new PersistentState(initialState, key);
	return s.current;
}
