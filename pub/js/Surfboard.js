/*
 * Main module.
*/


function Surfboard() {
    const _manager = KeyEventManager();
    const _animator = Animator();

    function _get_element(element) {
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
         *          CSS string.
         *      width: The width of the highlight. Can take any valid
         *          CSS string.
         */

        options = options ? options : {};
        element = _get_element(element);

        const width = options.width ? options.width: '3px';
        const colour = options.colour ? options.colour : '#FFFF00';
        let active, inactive, handler, selected;

        if (element.length) { // TODO: Is this a safe check?
            element = [...element];
            const _default = [];
            element.map((e) => _default.push(e.style.outline));
            let current = 0;
            active = function() {
                current = current + 1 != element.length ? current + 1 : 0;
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
        /* Slides the element.
         *
         * Options:
         * TODO: list options
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
         *      smooth: If true, sets scroll-behavior of <html> tag to smooth.
         *      target: An element or list of elements to scroll to. 
         *      vertical: The amount of vertical scroll; default is 0.
         *          If this value is an integer, it represents the number
         *          of pixels. If this value is a float, it represents the
         *          percentage of the viewport.  
        */

        options = options ? options : {};
        const offsetX = options.offsetX ? options.offsetX : 0;
        const offsetY = options.offsetY ? options.offsetY : 0;
        let active;

        if (options.target) {
            const elements = _get_element(options.target);
            let count = 0;
            active = () => {
                let rect = elements[count].getBoundingClientRect();
                window.scrollTo({
                    top: rect.top + window.scrollY + offsetY,
                    left: rect.left + window.scrollX + offsetX,
                    behavior: options.smooth ? 'smooth' : 'auto'
                })
                count = count + 1 < elements.length ? count + 1 : 0;
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
        if (options.hold)
            keys = `hold+${keys}` // TODO: clean up

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
        custom: custom
    }
}