const surf = Surfboard();
surf.redirect("B", "index.html");
surf.custom("C", () => {
    const cdn = document.getElementById("cdn");
    cdn.select();
    document.execCommand("copy");

    const copy = document.getElementById("copy");
    copy.style.opacity = 0.8;
    setTimeout(() => copy.style.opacity = 0, 3000);
})