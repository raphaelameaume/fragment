import { createPersistentStore } from "./utils";

export const multisampling = createPersistentStore("fragment.multisampling", true, []);
export const threshold = createPersistentStore("fragment.threshold", false, 0);
