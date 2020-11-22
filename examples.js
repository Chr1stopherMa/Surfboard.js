/* Example usage of the Surfboard.js library */

const surf = Surfboard();


// Popping elements
surf.pop([{key: 'KeyQ'}], "#pop-1");
surf.pop([{key: 'KeyE'}], "#pop-2", {delay: 1});
surf.pop([{key: 'KeyT'}], "#pop-3", {collapse: true});
surf.pop([{key: 'KeyY'}], "#pop-4", {toggle: true});
surf.pop([{key: 'KeyU'}], '#pop-5', {toggle: true, delay: 0.5})


// Sliding elements
surf.slide([{key: "KeyZ"}], "#slide-1")


// Expanding elements
surf.expand([{key: 'KeyA'}], '#img-1', {expand: 2});
surf.expand([{key: 'KeyD'}], '#img-2', {expandX: 2, delay: 0});
surf.expand([{key: 'KeyF'}], '#img-3', {expandX: 1.5, expandY: 3});
surf.expand([{key: 'KeyG'}], '#img-4', {expand: 2, toggle: true});
surf.expand([{key: 'KeyH'}], '#img-5', {expand: 0.5, delay: 0.5});


// Scrolling
surf.scroll([{key: 'KeyW'}], {vertical: -0.08, relative: true, smooth: true});
surf.scroll([{key: 'KeyS'}], {vertical: 0.08, relative: true, smooth: true});
surf.scroll([{key: 'KeyJ'}], {vertical: 0});



// Custom events
surf.custom([{key: 'KeyR'}], () => window.location.reload());