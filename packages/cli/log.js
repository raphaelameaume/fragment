const kleur = require("kleur");

const log = (() => {

    const success = (message, prefix) => {
        console.log(kleur.green(`✔ ${message}`));
    };

    const warning = (message, prefix) => {
        console.log(kleur.yellow(`ℹ ${message}`));
    };

    const error = (message, prefix) => {
        console.log(kleur.red(`✖ Error: ${message}`));
    };

    return {
        success,
        warning,
        error,
    };
})();

module.exports = log;
