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


    // DOM manipulation functions
    function expand(keys, element, options) {
        /* Expands element
         *
         * Options:
         *      expandX: Multipler to width; default 2
         *      expandY: Multipler to height; default 2
         *      animation: Time to expand; default 1 second.
         *                 Set to false to turn off.
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

        _manager.addEvent(keys, active, unactive);
    }



    return {
        expand: expand
    }
}