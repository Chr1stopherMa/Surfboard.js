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
        /* Expands element by a specified factor.
         *
         * Options:
         *      delay: Time to expand; default 1 second.
         *          Set to false to turn off.
         *      expandX: Multipler to width; default 2
         *      expandY: Multipler to height; default 2
         *      toggle: If set to true, expanding/shrinking
         *          is only triggered by specified key event
         *          (and not the absence of the event).
         * 
         * TODO: image does not scale properly when height/width
         *       is defined using percentage.
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

        if (element.complete)
            updateSize();
        else
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
            keys.map((key) => key.hold = false);
            setTimeout(() => _manager.addEvent(keys, _make_toggle(active, unactive)), 400);
        } else
            setTimeout(() =>_manager.addEvent(keys, active, unactive), 400);
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
        */

       element = _get_element(element);
       options = options ? options : {}
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


    function slide(keys, element, options) {
        /* Slides the element.
         *
         * Options:
         *      horizontal: The amount of horizontal scroll; default is 0.
         *          If this value is an integer, it represents the number
         *          of pixels. If this value is a float, it represents the
         *          percentage of the viewport.
         *      relative: If true, viewport is scrolled relative to the 
         *          current position. Otherwise, the viewport is scrolled
         *          to the absolute position.
         *      smooth: If true, sets scroll-behavior of <html> tag to smooth.
         *      vertical: The amount of vertical scroll; default is 0.
         *          If this value is an integer, it represents the number
         *          of pixels. If this value is a float, it represents the
         *          percentage of the viewport.  
        */

        options = options ? options : {};
        element = _get_element(element);
        const domRect = () => {return element.getBoundingClientRect()};

        element.style.width = `${domRect().width}px`;

        if (options.duration)
            element.style.transition += `width ${options.duration}s`;
        else
            element.style.transition += `width 1s`;

        const original = element.style.width;
        element.style.overflow = 'hidden';
        element.style.position = 'absolute';
        element.style.animation = '2s slide-right 2s forwards';
        
        function active() {
            element.style.width = '0px';
        }

        function inactive() {
            element.style.width = original;
        }

        _manager.addEvent(keys, active, inactive);
    }


    function scroll(keys, options) {
        /* Moves the screen to a specified location.
         *
         * Options:
         *      horizontal: The amount of horizontal scroll; default is 0.
         *          If this value is an integer, it represents the number
         *          of pixels. If this value is a float, it represents the
         *          percentage of the viewport.
         *      relative: If true, viewport is scrolled relative to the 
         *          current position. Otherwise, the viewport is scrolled
         *          to the absolute position.
         *      smooth: If true, sets scroll-behavior of <html> tag to smooth.
         *      vertical: The amount of vertical scroll; default is 0.
         *          If this value is an integer, it represents the number
         *          of pixels. If this value is a float, it represents the
         *          percentage of the viewport.  
        */

        options = options ? options : {};

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

        function active() {
            if (options.smooth)
                document.documentElement.style.scrollBehavior = 'smooth';
            if (options.relative)
                scrollBy(x_scroll(), y_scroll());
            else
                scrollTo(x_scroll(), y_scroll());
            if (options.smooth)
                document.documentElement.style.scrollBehavior = 'initial';
        }

        _manager.addEvent(keys, active);
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
           _manager.addEvent(keys, _make_toggle(callback, callback2));
        else
           _manager.addEvent(keys, callback, callback2);
    }



    return {
        expand: expand,
        pop: pop,
        slide: slide,
        scroll: scroll,
        custom: custom
    }
}