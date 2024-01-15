// Function to toggle the sidebar when navbar-minimalize is clicked
$('.navbar-minimalize').on('click', function (event) {
    event.preventDefault();
    $('body').toggleClass('mini-navbar');
    // Additional function call to adjust menu smoothly
    SmoothlyMenu();
});

// Function to smoothly adjust the menu
function SmoothlyMenu() {
    if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
        $('#side-menu').hide();
        setTimeout(function () {
            $('#side-menu').fadeIn(400);
        }, 200);
    } else if ($('body').hasClass('fixed-sidebar')) {
        $('#side-menu').hide();
        setTimeout(function () {
            $('#side-menu').fadeIn(400);
        }, 100);
    } else {
        $('#side-menu').removeAttr('style');
    }
}

// Minimalize menu when screen is less than 768px
$(window).bind("resize", function () {
    // Check window width on resize event
    if (window.innerWidth < 769) {
        // If window width is less than 769px, add 'body-small' class to the body
        $('body').addClass('body-small');
    } else {
        // If window width is 769px or more, remove 'body-small' class from the body
        $('body').removeClass('body-small');
    }
});

// Fixed Sidebar - executed when window finishes loading
$(window).bind("load", function () {
    // Check if the body has 'fixed-sidebar' class
    if ($("body").hasClass('fixed-sidebar')) {
        // If body has 'fixed-sidebar' class, initialize slimScroll for sidebar-collapse element
        $('.sidebar-collapse').slimScroll({
            height: '100%',
            railOpacity: 0.9
        });
    }
});

// Function to check if browser supports HTML5 local storage
function localStorageSupport() {
    // Return true if browser supports local storage, otherwise return false
    return (('localStorage' in window) && window['localStorage'] !== null);
}

// Local Storage functions - executed when document finishes loading
$(document).ready(function () {
    // Check if browser supports local storage
    if (localStorageSupport()) {
        // Retrieve values from local storage
        var collapse = localStorage.getItem("collapse_menu");
        var fixedsidebar = localStorage.getItem("fixedsidebar");
        var fixednavbar = localStorage.getItem("fixednavbar");
        var boxedlayout = localStorage.getItem("boxedlayout");
        var fixedfooter = localStorage.getItem("fixedfooter");

        var body = $('body');

        // Check and apply classes based on values retrieved from local storage
        if (fixedsidebar == 'on') {
            body.addClass('fixed-sidebar');
            $('.sidebar-collapse').slimScroll({
                height: '100%',
                railOpacity: 0.9
            });
        }

        if (collapse == 'on') {
            if (body.hasClass('fixed-sidebar')) {
                if (!body.hasClass('body-small')) {
                    body.addClass('mini-navbar');
                }
            } else {
                if (!body.hasClass('body-small')) {
                    body.addClass('mini-navbar');
                }
            }
        }

        if (fixednavbar == 'on') {
            $(".navbar-static-top").removeClass('navbar-static-top').addClass('navbar-fixed-top');
            body.addClass('fixed-nav');
        }

        if (boxedlayout == 'on') {
            body.addClass('boxed-layout');
        }

        if (fixedfooter == 'on') {
            $(".footer").addClass('fixed');
        }
    }
});