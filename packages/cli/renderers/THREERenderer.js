let renderer = new WebGLRenderer({ antialias: true });

export let init = () => {

};

export let resize = () => {

};

export let render = ({ mode, stages }) => {

}

export let update = ({ stages }) => {
    for (let i = 0; i < stages.length; i++) {
        stages[i].update();
    }
};
