import EventBus from "./EventBus";

let eventBus = EventBus();
let { on, off, emit } = eventBus;

export { on };
export { off };
export { emit };
export default eventBus;

export const TRANSITION_CHANGE = '@fragment/TRANSITION_CHANGE';
export const PREVIEW_MOUNT = '@fragment/PREVIEW_MOUNT';
export const PREVIEW_UPDATE = '@fragment/PREVIEW_UPDATE';
export const PREVIEW_AFTER_UPDATE = '@fragment/PREVIEW_AFTER_UPDATE';
export const PREVIEW_BEFORE_UPDATE = '@fragment/PREVIEW_BEFORE_UPDATE';
