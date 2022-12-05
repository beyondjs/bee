module.exports = class BeeError {

    #message;

    get message() {
        return this.#message;
    }

    constructor(message) {
        this.#message = message;
    }
}