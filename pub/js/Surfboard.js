/*
 * Manager object that keeps track of key events to listen to
 * and the callback response.
*/

(function(global, document) {

const KEYUP = "keyup";
const KEYDOWN = "keydown";

// mapping for special keys
const _key_map = {
    'Ctrl': 'ControlLeft',
    'Shift': 'ShiftLeft',
    'RCtrl': 'ControlRight',
    'RShift': 'ShiftRight',
    'Enter': 'Enter',
    'Left': 'ArrowLeft',
    'Right': 'ArrowRight',
    '.': 'Period',
    '/': 'Slash',
    ',': 'Comma',
    'Up': 'ArrowUp',
    'Down': 'ArrowDown',
    'Space': 'Space',
    '=': 'Equal',
    '-': 'Minus',
    '[': 'BracketLeft',
    ']': 'BracketRight',
}

function KeyEventManager() {

    // Object to keep track of keys pressed
    const keyTracker = {}

    document.addEventListener(KEYDOWN, event => {
        keyTracker[event.code] = event.repeat;
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
            this.active = false;
            this._generateCallbackWrapper();
            this.enable = this.addKeyEventListener();
            this.disable = this.removeKeyEventListener();
            this.enable();
        }

        // Create callback function to be triggered
        _generateCallbackWrapper() {
            this._wrapper = (event) => {
                if (!this.active) {return}
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
            return () => {
                document.addEventListener(KEYDOWN, this._wrapper);
                document.addEventListener(KEYUP, this._wrapper);
                this.active = true;
            }
        }

        // Remove event listener
        removeKeyEventListener() {
            return () => {
                document.removeEventListener(KEYDOWN, this._wrapper);
                document.removeEventListener(KEYUP, this._wrapper);
                this.active = false;
            }
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
        let tmp = false;
        for (key of keys) {
            if (key in _key_map)
                key_array.push({key: _key_map[key], hold: tmp})
            else if (key === 'hold')
                tmp = true;
            else if (!isNaN(parseInt(key)))
                key_array.push({key: `Digit${key}`, hold: tmp})
            else
                key_array.push({key: `Key${key}`, hold: tmp})
        }
        if (tmp)
            delete key_array[0].hold;

        return key_array;
    }

    function addEvent(keys, active_callback, inactive_callback) {
        const key_arr = _parse_keys(keys);
        const callback = _make_callback(active_callback, inactive_callback);
        const event = new KeyEvent(key_arr, callback);
        return {enable: event.enable, disable: event.disable}
    }

    return {addEvent: addEvent};
}



/* 
 * Object for dynamically defining keyframe animations.
*/


function Animator() {
    // All exported functions return a handler
    function _make_handler(on, off, toggle) {
        if (toggle)
            return (value) => value ? on() : off();
        return (value) => (value ? on() : null);
    }

    // Wrapper function
    function _wrapper(animation) {
        return (element, options) => {
            let cb = animation(element, options);
            return _make_handler(cb.on, cb.off, options.toggle);
        }
    }


    function expand(element, options) {
        // extract options
        const delay = options.delay ? options.delay : 1;
        let expandX, expandY;
        if (options.expandX)
            expandX = options.expandX;
        else
            expandX = options.expand ? options.expand : 1;
        if (options.expandY)
            expandY = options.expandY;
        else 
            expandY = options.expand ? options.expand : 1;

        element.style.transformOrigin = 'left top';

        function setAnimationOn() {
            element.animate([
                {transform: 'scale(1, 1)'},
                {transform: `scale(${expandX}, ${expandY})`}
            ],
            {
                duration: delay*1000,
                fill: 'forwards'
            })
        }

        function setAnimationOff() {
            element.animate([
                {transform: `scale(${expandX}, ${expandY})`},
                {transform: 'scale(1, 1)'}
            ],
            {
                duration: delay*1000,
                fill: 'forwards'
            })
        }
        return {on: setAnimationOn, off: setAnimationOff};
    }


    function slide(element, options) {
        // extract options
        const delay = options.delay ? options.delay : 1;
        const translateX = options.translateX ? options.translateX : 0;
        const translateY = options.translateY ? options.translateY : 0;

        function setAnimationOn() {
            element.animate([
                {transform: 'translateX(0) translateY(0)'},
                {transform: `translateX(${translateX}) translateY(${translateY}`}
            ], {
                duration: delay*1000,
                fill: 'forwards'
            })
        }

        function setAnimationOff() {
            element.animate([
                {transform: `translateX(${translateX}) translateY(${translateY}`},
                {transform: 'translateX(0) translateY(0)'}
            ], {
                duration: delay*1000,
                fill: 'forwards'
            })
        }

        return {on : setAnimationOn, off: setAnimationOff};
    }

    return {
        expand: _wrapper(expand),
        slide: _wrapper(slide)
    }

}



/*
 * Main object.
*/

function Surfboard() {
    const _manager = KeyEventManager();
    const _animator = Animator();

    function _get_element(element) {
        // if element is already an HTMLCanvasElement, it is simply returned
        if (typeof element === 'string' && element.startsWith('#')) {
            return document.getElementById(element.substring(1));
        } else if (typeof element === 'string' && element.startsWith('.')) {
            return document.getElementsByClassName(element.substring(1));
        }
        return element;
    }

    function _make_toggle(active, unactive) {
        let state = false;
        return () => {
            state = !state;
            if (state)
                active();
            else
                unactive();
        }
    }


    // DOM manipulation functions

    function expand(keys, element, options) {
        /* Expands element by a specified factor.
         *
         * Options:
         *      delay: Time to expand; default 1 second.
         *          Set to false to turn off.
         *      expand: Multipler to width and height; default 1
         *      expandX: Multipler to width; default 1
         *      expandY: Multipler to height; default 1
         *      toggle: If set to true, expanding/shrinking
         *          is only triggered by specified key event
         *          (and not the absence of the event).
         * 
        */

        element = _get_element(element);
        options = options ? options : {}
        const domRect = () => {return element.getBoundingClientRect()};
        let height, width;

        function updateSize() {
            height = domRect().height;
            width = domRect().width;
            element.style.height = `${height}px`;
            element.style.width = `${width}px`;  
        }

        updateSize();

        // for images
        if (!element.complete)
            element.onload = updateSize; // In case element has not been loaded

        // set animation
        if (!("delay" in options)) {
            element.style.transition = 'width 1s, height 1s';
        } else if (options.delay) {
            const time = options.delay;
            element.style.transition = `width ${time}s, height ${time}s`;
        }

        options.expand = options.expand ? options.expand : 1;

        const expandX = "expandX" in options ? options.expandX : options.expand;
        const expandY = "expandY" in options ? options.expandY : options.expand;
        
        function active() {
            element.style.height = `${expandY * height}px`;
            element.style.width = `${expandX * width}px`;
        }

        function unactive() {
            element.style.height = `${height}px`;
            element.style.width = `${width}px`;
        }

        if ('toggle' in options && options.toggle) {
            return _manager.addEvent(keys, _make_toggle(active, unactive));
        } else
            return _manager.addEvent(keys, active, unactive);
    }


    function pop(keys, element, options) {
        /* Removes element from the document. Any event listeners
         * will be disabled while the element is not present.
         *
         * Options:
         *      collapse: Remove the space occupied by the element;
         *          false by default.
         *      delay: Time to remove element; default 0 seconds.
         *      toggle: If set to true, event is only triggered by 
         *          specified key event (and not the absence of the event).   
         *      transition: The transition type; "linear" by default.
        */

       element = _get_element(element);
       options = options ? options : {}
       let delay = 0, timeout, _default, transition;

       if ('delay' in options) {
           delay = options.delay;
       }

       transition = options.transition ? options.transition : 'linear';

       element.style.transition = `opacity ${delay}s ${transition}`;

       function active() {
            element.style.opacity = 0;
            if (options.collapse) {
                _default = element.style.display;
                element.style.display = 'none';
            } else {
                _default = element.style.visibility;
                timeout = setTimeout(() => element.style.visibility = 'hidden', delay*1000);
            }
       }

       function inactive() {
           clearTimeout(timeout);
            element.style.opacity = 1;
            if (options.collapse)
                element.style.display = _default;
            else
                element.style.visibility = _default;
       }

       if ('toggle' in options && options.toggle) {
           return _manager.addEvent(keys, _make_toggle(active, inactive));
       } else
           return _manager.addEvent(keys, active);
    }


    function highlight(keys, element, options) {
        /* Visually highlights the element.
         *
         * If element refers to a html tag or class name, the elements
         * will take turns being highlighted when the event is triggered.
         * 
         * In addition to the two handler functions normally returned,
         * there will also be a "selected" function. If element is a single
         * element, this returns true or false depending on whether it
         * is highlighted. Otherwise, it will return the current highlighted
         * element itself.
         * 
         * Options:
         *      colour: The colour of the highlight. Can take any valid
         *          CSS string; none by default.
         *      reverse: The key to be pressed to highlight the previous
         *          element. Only has an effect if there are multiple
         *          elements; false by default.
         *      width: The width of the highlight. Can take any valid
         *          CSS string; "3px" by default.
         */

        options = options ? options : {};
        element = _get_element(element);

        const width = options.width ? options.width: '3px';
        const colour = options.colour ? options.colour : 'none';
        let active, inactive, handler, reverseHandler, selected;

        if (element.length) {
            element = [...element];
            const _default = [];
            element.map((e) => _default.push(e.style.outline));
            let current = 0;
            active = function() {
                current = (current + 1) % element.length;
                element.map((e, i) => {
                    if (i == current)
                        e.style.outline = `${width} solid ${colour}`;
                    else
                        e.style.outline = _default[i];
                })
            }

            // Highlight the first element
            element[0].style.outline = `${width} solid ${colour}`;

            selected = () => {return element[current]}
            handler = _manager.addEvent(keys, active);

            if (options.reverse) {
                reverse = function() {
                    current = current != 0 ? current - 1 : element.length - 1;
                    element.map((e, i) => {
                        if (i == current)
                            e.style.outline = `${width} solid ${colour}`;
                        else
                            e.style.outline = _default[i];
                    })
                }

                reverseHandler = _manager.addEvent(options.reverse, reverse);

                let e1 = handler.enable, e2 = reverseHandler.enable;
                let d1 = handler.disable, d2 = reverseHandler.disable;
                handler = {enable: () => {e1(); e2()},
                disable: () => {d1(); d2()}}
            }

        } else {
            const _default = element.style.outline;
            let is_selected = false;
            active = function() {
                element.style.outline = `${width} solid ${colour}`;
                is_selected = true;
            }
            inactive = function() {
                element.style.outline = _default;
                is_selected = false;
            }
            selected = () => {return is_selected};

            if (options.toggle) {
                handler = _manager.addEvent(keys, _make_toggle(active, inactive));
            } else {
                handler = _manager.addEvent(keys, active, inactive);
            }
        }

        handler.selected = selected;
        return handler;
    }


    function slide(keys, element, options) {
        /* Translates the element by the specified distance.
         *
         * Options:
         *      delay: The time it takes the transition to occur;
         *          1 by default.
         *      toggle: If true, pressing the keys multiple times
         *          will cause the element to switch between its
         *          original and slided position; false by default.
         *      translateX: The amount, in pixels, to translate in 
         *          the X direction; 0 by default.
         *      translateY: The amount, in pixels, to translate in
         *          the Y direction; 0 by default.
        */

        options = options ? options : {};
        element = _get_element(element);

        const handler = _animator.slide(element, options);
        
        let run = false;
        function active() {
            if (!run || options.toggle)
                handler(true);
            run = true;
        }

        function inactive() {
            handler(false);
        }

        if (options.toggle)
            return _manager.addEvent(keys, _make_toggle(active, inactive));
        else
            return _manager.addEvent(keys, active, inactive);
    }


    function scroll(keys, options) {
        /* Moves the screen to a specified location.
         *
         * Options:
         *      horizontal: The amount of horizontal scroll; default is 0.
         *          If this value is an integer, it represents the number
         *          of pixels. If this value is a float, it represents the
         *          percentage of the viewport.
         *      offsetX: The horizontal offset.
         *      offsetY: The vertical offset.
         *      relative: If true, viewport is scrolled relative to the 
         *          current position. Otherwise, the viewport is scrolled
         *          to the absolute position.
         *      reverse: If target is defined, this value is the key used to
         *          scroll in the reverse direction.
         *      smooth: If true, sets scroll-behavior to smooth.
         *      target: An element or list of elements to scroll to. 
         *      vertical: The amount of vertical scroll; default is 0.
         *          If this value is an integer, it represents the number
         *          of pixels. If this value is a float, it represents the
         *          percentage of the viewport.  
        */

        options = options ? options : {};
        const offsetX = options.offsetX ? options.offsetX : 0;
        const offsetY = options.offsetY ? options.offsetY : 0;
        let active, reverseEvent;

        if (options.target) {
            const elements = _get_element(options.target);
            let count = 0;
            active = () => {
                count = (count + 1) % elements.length;
                let rect = elements[count].getBoundingClientRect();
                window.scrollTo({
                    top: rect.top + window.scrollY + offsetY,
                    left: rect.left + window.scrollX + offsetX,
                    behavior: options.smooth ? 'smooth' : 'auto'
                })
            }

            if (options.reverse) {
                // scroll in reverse
                reverse = () => {
                    count = count != 0 ? count - 1 : elements.length - 1;
                    let rect = elements[count].getBoundingClientRect();
                    window.scrollTo({
                        top: rect.top + window.scrollY + offsetY,
                        left: rect.left + window.scrollX + offsetX,
                        behavior: options.smooth ? 'smooth' : 'auto'
                    })
                }
                reverseEvent = _manager.addEvent(options.reverse, reverse);
            }

        } else {
            let x_scroll, y_scroll;
            options.horizontal = options.horizontal ? options.horizontal : 0;
            options.vertical = options.vertical ? options.vertical : 0;

            if (Number.isInteger(options.horizontal))
                x_scroll = function() {return options.horizontal};
            else
                x_scroll = function() {return options.horizontal * window.innerWidth};
            
            if (Number.isInteger(options.vertical))
                y_scroll = function() {return options.vertical}
            else
                y_scroll = function() {return options.vertical * window.innerHeight};

            active = () => {
                const settings = {
                    top: y_scroll() + offsetY,
                    left: x_scroll() + offsetX,
                    behavior: options.smooth ? 'smooth': 'auto'
                }
                 options.relative ? scrollBy(settings) : scrollTo(settings);
            }
        }

        const keyEvent = _manager.addEvent(keys, active);
        if (reverseEvent === undefined) {
            return keyEvent;
        }

        // if reverse event is defined, modify enable/disable functions
        return {enable: () => {keyEvent.enable(); reverseEvent.enable()},
                disable: () => {keyEvent.disable(); reverseEvent.disable()}}
    }


    function redirect(keys, link, callback) {
        /* Redirects the user to the specified link.
         * 
         * The optional callback argument is called before the 
         * redirection occurs.
        */   
        const active = () => {
            if (callback !== undefined) {
                callback();
            }
            window.location.href = link;
        }

        return _manager.addEvent(keys, active);
    }


    function custom(keys, callback, options, callback2) {
        /* Define a custom event.
         *
         * Options:
         *      toggle: If true and callback2 is defined,
         *          key events will alternate between
         *          callback and callback2.
        */   

       options = options ? options : {};

       if (options.toggle)
           return _manager.addEvent(keys, _make_toggle(callback, callback2));
        else
           return _manager.addEvent(keys, callback, callback2);
    }

    return {
        expand: expand,
        pop: pop,
        highlight: highlight,
        slide: slide,
        scroll: scroll,
        redirect: redirect,
        custom: custom
    }
}

// Add to global scope
global.Surfboard = Surfboard;

}) (window, window.document);