/*
 * Manager object that keeps track of key events to listen to
 * and the callback response.
*/

// Global object to keep track of keys pressed
const keyTracker = {}

document.addEventListener("keydown", event => {
    keyTracker[event.code] = event.repeat;
})

document.addEventListener("keyup", event => {
    if (event.code in keyTracker) {
        delete keyTracker[event.code];
    }
})


/*
 * Object representing a key event listener.
 *
 * Fields
 *      keys: An array of keys to listen for and
 *            whether they need to be pressed or held.
 *      callback: The callback function to be triggered.
 *      active: A boolean indicating whether the event
 *            is currently being listened for.
*/
class KeyEvent {
    constructor(keys, callback) {
        this.keys = keys;
        this.callback = callback;
        this.active = null;
        this._wrapper = this._generateCallbackWrapper();
        this.addKeyEventListener();
    }

    // Create callback function to be triggered
    _generateCallbackWrapper() {
        return () => {
            let trigger = true;
            for (let key of this.keys) {
                if (!(key.key in keyTracker && key.hold === keyTracker[key.key])) {
                    trigger = false;
                }
            }
            if (trigger) {
                this.callback();
            }
        }
    }

    // Add event listener
    addKeyEventListener() {
        document.addEventListener("keydown", this._wrapper);
        this.active = true;
    }

    // Remove event listener
    removeKeyEventListener() {
        document.removeEventListener("keydown", this._wrapper);
        this.active = false;
    }
}


// Testing
const k = new KeyEvent([{key: 'KeyA', hold: true}, {key: 'KeyB', hold: false}], () => console.log('Event 1 triggered!'));
const k2 = new KeyEvent([{key: 'KeyA', hold: false}, {key: 'KeyC', hold: false}], () => console.log('Event 2 triggered!'));
