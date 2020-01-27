import { writable } from "svelte/store";

export let rendererDimensions = writable({ width: 0, height: 0 });

export let currentStages = writable({ stage1: null, stage2: null });