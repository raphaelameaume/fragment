import Stage from "../Stage";

class Cubes extends Stage {

    constructor(props) {

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