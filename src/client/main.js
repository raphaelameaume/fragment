import App from './app/App.svelte';
import "./app/global.css";

const app = new App({
    target: document.getElementById('app'),
    props: {},
});

export default app
