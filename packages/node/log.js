import kleur from "kleur";

const log = (() => {
    let prefix = '[fragment]';

    const success = (message) => {
        console.log(prefix, kleur.green(`✔ ${message}`));
    };

    const warning = (message) => {
        console.log(prefix, kleur.yellow(`ℹ ${message}`));
    };

    const error = (message) => {
        console.log(prefix, kleur.red(`✖ Error: ${message}`));
    };

    return {
        success,
        warning,
        error,
    };
})();

export default log;
