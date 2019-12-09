import Stage from "../Stage.js";

class Spheres extends Stage {

    constructor(props) {
        super(props);

        this.onChangeCount = this.onChangeCount.bind(this);

        props.count.onChange = this.onChangeCount;
    }

    onChangeCount({ value }) {
        console.log('onChangeCount', value);
    }

    render({ renderer }) {

    }
}

export default {
    name: 'Spheres',
    scene: Spheres,
    props: {
        count: {
            min: 0,
            max: 10,
            value: 1,
        }
    }
};