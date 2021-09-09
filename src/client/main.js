import App from './app/App.svelte'

const app = new App({
    target: document.getElementById('app'),
    props: {
        renderer: "three",
    }
});

export default app
