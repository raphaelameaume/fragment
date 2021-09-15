import Input from "./Input";

class Keyboard extends Input {

    /**
     * 
     * @param {KeyboardEvent} event 
     */
    getStepFromEvent(event) {
        if (event.shiftKey) {
            return 10;
        } else if (event.altKey) {
            return 0.1;
        }

        return 1;
    }

}



export default new Keyboard();
