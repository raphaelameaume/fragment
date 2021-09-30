import * as props from "@fragment/props";
import App from './app/App.svelte'

const app = new App({
    target: document.getElementById('app'),
    props,
});

export default app
