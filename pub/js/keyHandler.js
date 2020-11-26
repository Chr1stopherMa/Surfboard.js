/*
 * Manager object that keeps track of key events to listen to
 * and the callback response.
*/

const KEYUP = "keyup";
const KEYDOWN = "keydown";

const _key_map = {
    'Ctrl': 'ControlLeft',
    'Enter': 'Enter',
    'Left': 'ArrowLeft',
    'Right': 'ArrowRight',
    '.': 'Period',
    '/': 'Slash'
}

function KeyEventManager() {

    // Object to keep track of keys pressed
    const keyTracker = {}

    document.addEventListener(KEYDOWN, event => {
        keyTracker[event.code] = event.repeat;
        console.log(keyTracker)
    })
    
    document.addEventListener(KEYUP, event => {
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
            return (event) => {
                let trigger = true;
                for (let key of this.keys) {
                    if (!(key.key in keyTracker && (!('hold' in key) || key.hold === keyTracker[key.key]))) {
                        trigger = false;
                    }
                }
                if (event.type === KEYUP && !trigger) {
                    this.callback(trigger);
                } else if (event.type === KEYDOWN && trigger) {
                    this.callback(trigger);
                }
            }
        }

        // Add event listener
        addKeyEventListener() {
            document.addEventListener(KEYDOWN, this._wrapper);
            document.addEventListener(KEYUP, this._wrapper);
            this.active = true;
        }

        // Remove event listener
        removeKeyEventListener() {
            document.removeEventListener(KEYDOWN, this._wrapper);
            document.removeEventListener(KEYUP, this._wrapper);
            this.active = false;
        }
    }

    function _make_callback(cb1, cb2) {
        if (cb2 === undefined)
            cb2 = () => {}
        return (state) =>
            state ? cb1() : cb2();
    }

    // Converts key string into array of keycodes
    function _parse_keys(keys) {
        keys = keys.split('+');
        const key_array = [];
        let tmp = false; // TOOD: better way of handling this situation
        for (key of keys) {
            if (key in _key_map)
                key_array.push({key: _key_map[key], hold: false})
            else if (key === 'hold')
                tmp = true;
            else
                key_array.push({key: `Key${key}`, hold: false}) // TODO
        }
        if (tmp)
            delete key_array[0].hold; // TODO

        return key_array;
    }

    function addEvent(keys, active_callback, inactive_callback) {
        const key_arr = _parse_keys(keys);
        const callback = _make_callback(active_callback, inactive_callback);
        const event = new KeyEvent(key_arr, callback);
        return {enable: event.addKeyEventListener, disable: event.removeKeyEventListener}
    }

    return {addEvent: addEvent};
}
