(function ($) {
    'use strict';
    $(document).ready(function () {

        var $search_site = $('.site-search-popup');
        var $body = $('body');

        $body.on('click', '.button-search-popup', function (e) {
            e.preventDefault();
            $search_site.toggleClass('active');
            $search_site.toggleClass('fadein');
        });

        $('.site-search-popup-close, .site-search-popup-overlay').on('click', function (e) {
            e.preventDefault();
            $search_site.removeClass('active');
            $search_site.removeClass('fadein');
        });
    });
})(jQuery);
