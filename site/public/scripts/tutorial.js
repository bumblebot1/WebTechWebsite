"use strict"
window.addEventListener("load", function() {
    var logo = document.getElementById("logo");
    logo.addEventListener("click", function() {
        window.location.href = window.location.protocol + "//" + window.location.host + "/" + config.index_page;
    })
});