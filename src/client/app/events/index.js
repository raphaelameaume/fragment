import EventBus from "./EventBus";

let eventBus = EventBus();
let { on, off, emit } = eventBus;

export { on };
export { off };
export { emit };
export default eventBus;

export const TRANSITION_CHANGE = '@fragment/TRANSITION_CHANGE';
