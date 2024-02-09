import { readable } from 'svelte/store';
import Tempo from '../lib/tempo/index.js';

export const audioAnalysis = new Tempo({});
audioAnalysis.listen();

window.audioAnalysis = audioAnalysis;

export const tempo = readable(audioAnalysis);
