/* Example usage of the Surfboard.js library */

const surf = Surfboard();

surf.redirect('B', 'index.html');

// Popping elements
surf.pop('Q', "#pop-1");
surf.pop('E', "#pop-2", {delay: 1});
surf.pop('T', "#pop-3", {collapse: true});
surf.pop('Y', "#pop-4", {toggle: true});
surf.pop('U', '#pop-5', {toggle: true, delay: 0.5})


// Sliding elements
surf.slide("Z", "#slide-1", {translateX: '-200%'})
surf.slide("X", "#slide-2", {translateX: '-200%', delay: 0.5, toggle: true})
surf.slide("C", "#slide-3", {translateY: '-220%'})
surf.slide("V", "#slide-4", {translateX: '300%', translateY: '300%'})

// Highlight elements
surf.highlight('I', "#highlight-1", {toggle: true, colour: "yellow"});
surf.highlight('O', "#highlight-2", {colour: "#EEEEEE"});
surf.highlight('P', ".highlight", {colour: "yellow"});

// Expanding elements
surf.expand('A', '#img-1', {expand: 2});
surf.expand('D', '#img-2', {expandX: 2, delay: 0});
surf.expand('F', '#img-3', {expandX: 1.5, expandY: 3});
surf.expand('G', '#img-4', {expand: 2, toggle: true});
surf.expand('H', '#img-5', {expand: 0.5, delay: 0.5});


// Scrolling
surf.scroll('hold+W', {vertical: -0.08, relative: true, smooth: true, hold: true});
surf.scroll('hold+S', {vertical: 0.08, relative: true, smooth: true, hold: true});
surf.scroll('J', {vertical: 0});
surf.scroll('M', {target: '.heading', offsetY: -30, smooth: true});



// Custom events
surf.custom('R', () => window.location.reload());


// More Examples
// Nav bar
surf.slide('N', '#nav-bar', {toggle: true, translateX: '100%', delay: 0.25})


// Notifications
let notifcation = document.getElementById("notif")
function notify() {
    notifcation.removeAttribute("style");
    notifcation.style.visibility = 'initial';
}
surf.pop('X', '#notif')
surf.custom('.', notify)


// Quiz
const handler = surf.highlight('Right', '.choice', {colour: "yellow"});
function cb() {
    if (handler.selected().innerHTML.startsWith('c'))
        document.getElementById('answer').innerHTML = 'Correct! (<a href="https://en.wikipedia.org/wiki/Surfboard">See wikipedia</a>)'
    else
        document.getElementById('answer').innerHTML = 'Try again!'
}

surf.custom('Enter', cb);


// Advanced Usage
// combination of keys
surf.highlight('Ctrl+Q', '#combination-1', {toggle: true})
surf.highlight('Ctrl+E', '#combination-2', {toggle: true})