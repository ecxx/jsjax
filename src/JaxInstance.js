module.exports = class JaxInstance {

    constructor(eik=true, import_engine_fname="main") {
        this.global = {};
        this.process_has_error = false;
        this.exit_on_kill = eik;
        this.import_engine_fname = import_engine_fname;
    }

    /**
     * Register an error with the Instance.
     * @param {Number} line 
     * @param {String} message 
     */
    error(line, message) {
        
        console.error(`[Line ${line}] in ${this.import_engine_fname} : Error : ${message}`)
        this.process_has_error = true;

    }

    /**
     * Kills program if error is detected.
     * @param {Number} code 
     */
    kill_if_error(code) {

        if (this.process_has_error && this.exit_on_kill) {
            console.error(`Jax exited with code ${code}`);
            throw code;
        }

    }

}