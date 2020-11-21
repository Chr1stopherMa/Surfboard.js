/*
 * Main module.
*/


function Surfboard() {
    const _manager = KeyEventManager();

    function _get_element(element) {
        if (typeof element === 'string' && element.startsWith('#')) {
            return document.getElementById(element.substring(1));
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
        /* Expands element
         *
         * Options:
         *      animation: Time to expand; default 1 second.
         *          Set to false to turn off.
         *      expandX: Multipler to width; default 2
         *      expandY: Multipler to height; default 2
         *      toggle: If set to true, expanding/shrinking
         *          is only triggered by specified key event
         *          (and not the absence of the event).
         *
        */
        element = _get_element(element);
        const domRect = element.getBoundingClientRect();
        const height = domRect.height;
        const width = domRect.width;

        // set animation
        if (!("animation" in options)) {
            element.style.transition = 'width 1s, height 1s';
        } else if (options.animation) {
            const time = options.animation;
            element.style.transition = `width ${time}s, height ${time}s`;
        }

        const expandX = "expandX" in options ? options.expandX : 2;
        const expandY = "expandY" in options ? options.expandY : 2;


        function active() {
            element.style.height = `${expandY * height}px`;
            element.style.width = `${expandX * width}px`;
        }

        function unactive() {
            element.style.height = `${height}px`;
            element.style.width = `${width}px`;      
        }

        if ('toggle' in options && options.toggle) {
            keys.map((key) => key.hold = false);
            _manager.addEvent(keys, _make_toggle(active, unactive));
        }
        else
            _manager.addEvent(keys, active, unactive);
    }


    function pop(keys, element, options) {
        /* Removes element
         *
         * Options:
         *      collapse: Remove the space occupied by the element;
         *          false by default.
         *      delay: Time to remove element; default 0 seconds.
         *      toggle: If set to true, event is only triggered by 
         *          specified key event (and not the absence of the event).
         *          
        */

       element = _get_element(element);

       let delay = 0, timeout, _default;

       if ('delay' in options) {
           delay = options.delay;
       }

       element.style.transition = `opacity ${delay}s ease-in-out`;

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
           keys.map((key) => key.hold = false);
           _manager.addEvent(keys, _make_toggle(active, inactive));
       } else
           _manager.addEvent(keys, active);
    }



    return {
        expand: expand,
        pop: pop
    }
}