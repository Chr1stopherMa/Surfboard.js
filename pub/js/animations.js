/* 
 * Module for dynamically defining keyframe animations.
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