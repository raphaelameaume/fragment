export let onMountPreview = ({ canvas }) => {
    return {
        context: canvas.getContext("2d"),
    }
};
