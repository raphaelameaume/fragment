import { createPersistentStore } from "./utils";

export const multisampling = createPersistentStore("multisampling", true, []);
export const threshold = createPersistentStore("threshold", false, 0);
export const transition = createPersistentStore("transition", false, false);
