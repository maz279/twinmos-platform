(function ($) {
    "use strict";
    $(window).on('elementor/frontend/init', () => {

        const reInitSwiper = function ($swiperEl) {
            const el = $swiperEl[0];
            if (!el) return;

            const oldSwiper = el.swiper;
            if (!oldSwiper) return;

            $swiperEl.off('mouseenter mouseleave');

            if (!oldSwiper.autoplay) {
                oldSwiper.autoplay = {
                    running: false,
                    start: function () {},
                    stop: function () {},
                    pause: function () {}
                };
            }

            const originalParams = oldSwiper.originalParams || oldSwiper.params || {};

            oldSwiper.destroy(true, true);

            const newParams = {
                ...originalParams,
                observer: true,
                observeParents: true,
            };

            const newSwiper = new Swiper(el, newParams);

            $swiperEl.on({
                mouseenter() {
                    if (newSwiper?.autoplay?.stop) newSwiper.autoplay.stop();
                },
                mouseleave() {
                    if (newSwiper?.autoplay?.start) newSwiper.autoplay.start();
                }
            });
        };

        const refreshActiveTabSwipers = function ($scope) {
            $scope.find(".razox-swiper").each(function () {
                reInitSwiper($(this));
            });
        };

        elementorFrontend.hooks.addAction(
            'frontend/element_ready/nested-tabs.default', ($scope) => {
                $scope.find(".e-n-tab-title").on("click", function () {
                    requestAnimationFrame(() => {
                        refreshActiveTabSwipers($scope);
                    });
                });
            }
        );
    });
})(jQuery);