import App from './app/App.svelte'

const app = new App({
    target: document.getElementById('app'),
    props: {
        rendering: "three-webgl",
    }
});

export default app
