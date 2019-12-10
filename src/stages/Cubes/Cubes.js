import Stage from "../Stage";

class Cubes extends Stage {

    constructor(options) {
        super(options);
    }

}

export default {
    name: 'Cubes',
    scene: Cubes,
    props: {
        count: {
            min: 0,
            max: 10,
            value: 1,
        }
    }
};