/*
    Example 3: News Website
    Showcases the expand (nav-bar) and highlight functions
*/

const surf = Surfboard();

surf.redirect('H', 'more-examples.html');

// Nav bar
const h1 = surf.expand("N", "#example2-nav", {expandX: 2, toggle: true});
const h2 = surf.custom("N", () => document.body.style.marginLeft = "250px", {toggle: true}, () => document.body.style.marginLeft = "0");

// Scrolling through articles
const h3 = surf.scroll('Down', {target: '.example2-article', offsetY: -140, smooth: true, reverse: "Up"});
const article = surf.highlight('Down', ".example2-article", {colour: "none", reverse: "Up"});

const handlers = [h1, h2, h3, article];

// View article
const viewer = document.getElementById("article-viewer");
const articleTitle = document.getElementById("article-title");
const articleImage = document.getElementById("article-image");

const viewArticle = () => {
    viewer.style.opacity = 0.9;
    const elements = article.selected().childNodes;
    articleTitle.innerText = elements[1].innerText;
    articleImage.src = elements[3].src;

    // disable handlers
    handlers.map(h => h.disable());
}
const leaveView = () => {
    viewer.style.opacity = 0;

    // re-enable handlers
    handlers.map(h => h.enable());
}
surf.custom("V", viewArticle, {toggle: true}, leaveView);