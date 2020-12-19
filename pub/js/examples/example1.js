/*
    Example 1: Powerpoint
    Showcases the scroll function for making powerpoints.
*/

const surf = Surfboard();

surf.scroll('Right', {target: '.example1-slide',
                      offsetX: -(window.innerWidth * 0.05),
                      reverse: 'Left'});
