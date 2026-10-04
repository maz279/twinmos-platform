(function ($) {
    "use strict";
    $(window).on('elementor/frontend/init', function () {

        elementorFrontend.hooks.addAction('frontend/element_ready/column', function ($scope) {
            if ($scope.hasClass('animated-slide-column')) {
                new Waypoint({
                    element: $scope, offset: '50%', handler: function () {
                        $scope.addClass('col-loaded');
                    }
                });
            }

            if ($scope.hasClass('animated-bg-parallax')) {
                var $wrap = $scope.find('>[class*="elementor-column-"]');
                var linkImage = $wrap.css('backgroundImage').replace('url(', '').replace(')', '').replace(/\"/gi, "");
                if (linkImage === 'none') {
                    return;
                }
                $wrap.prepend('<img src="' + linkImage + '" class="img-banner-parallax" alt="banner-parallax"/>')

                $wrap.find('>.img-banner-parallax').panr({
                    moveTarget: $wrap,
                    sensitivity: 20,
                    scale: false,
                    scaleOnHover: true,
                    scaleTo: 1.1,
                    scaleDuration: .25,
                    panY: true,
                    panX: true,
                    panDuration: 1.25,
                    resetPanOnMouseLeave: true
                });
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/section', function ($scope) {
            $(window).load(function () {
                if ($scope.hasClass('animated-bg-parallax')) {
                    var linkImage = $scope.css('backgroundImage').replace('url(', '').replace(')', '').replace(/\"/gi, "");
                    if (linkImage === 'none') {
                        return;
                    }
                    $scope.prepend('<img src="' + linkImage + '" class="img-banner-parallax" alt="banner-parallax" />')
                    $scope.find('>.img-banner-parallax').panr({
                        moveTarget: $scope,
                        sensitivity: 20,
                        scale: false,
                        scaleOnHover: true,
                        scaleTo: 1.1,
                        scaleDuration: .25,
                        panY: true,
                        panX: true,
                        panDuration: 1.25,
                        resetPanOnMouseLeave: false
                    });
                }
            })
        })
        elementorFrontend.hooks.addAction('frontend/element_ready/container', function ($scope) {
            function randomIntFromInterval(min, max) { // min and max included
                return Math.floor(Math.random() * (max - min + 1) + min)
            }

            if ($scope.hasClass('razox-effect-moving-image-yes')) {
                $scope.find('.razox-moving-mouse-effect-yes').each(function(index) {
                    var rndPos = randomIntFromInterval(-30, 50);
                    $(this).attr('data-pos', rndPos);
                });
                $scope.on('mousemove', function(e) {
                    var w = $scope.width();
                    var h = $scope.height();
                    var offsetX = 0.5 - e.clientX / w * 5;
                    var offsetY = 0.5 - e.clientY / h * 5;

                    $scope.find('.razox-moving-mouse-effect-yes').each(function(i, el) {
                        var offset = parseInt($(el).attr('data-pos'));
                        var translate = "translate3d(" + Math.round(offsetX * offset) + "px," + Math.round(offsetY * offset) + "px, 0px)";

                        $(el).css({
                            '-webkit-transform': translate,
                            'transform': translate,
                            'moz-transform': translate,
                            'transition': 'all 0.2s linear'
                        });
                    });
                });
            }

            if($('.background-deco-yes .elementor-icon').length > 0) {
                $('.background-deco-yes .elementor-icon').each(function($i) {
                    var $item = $i % 3;
                    if($i % 3 != 0) $(this).addClass('animation-drop-'+$item);
                })
            }

            $(window).scroll(function() {
                var fixed = $(".scrollup");

                var fixed_position = $(".scrollup").offset().top;
                var fixed_height = $(".scrollup").height();

                var addClass = false;
                $('.cleanee-scrollup-change-color-yes').each(function() {

                    var toCross_position = $(this).offset().top;
                    var toCross_height = $(this).height();

                    if (fixed_position + fixed_height < toCross_position) {
                        //fixed.removeClass('white');
                    } else if (fixed_position > toCross_position + toCross_height) {
                        //fixed.removeClass('white');
                    } else {
                        addClass = true;
                        fixed.attr('data-id', $(this).data('id'));
                    }
                });
                if (addClass == true) {
                    fixed.addClass('change-color');

                } else {
                    fixed.removeClass('change-color');
                    fixed.attr('data-id', '');
                }

            });
        })
    })

})(jQuery)


class razoxSwiperBase extends elementorModules.frontend.handlers.SwiperBase {

    getDefaultSettings() {
        return {
            selectors: {
                carousel: '.razox-swiper', slideContent: '.swiper-slide'
            }
        };
    }

    getDefaultElements() {
        const selectors = this.getSettings('selectors');
        const elements = {
            $swiperContainer: this.$element.find(selectors.carousel)
        };
        elements.$slides = elements.$swiperContainer.find(selectors.slideContent);
        return elements;
    }

    getSwiperSettings() {

        const elementSettings = this.getElementSettings(), slidesToShow = +elementSettings.column || 3,
            isSingleSlide = 1 === slidesToShow,
            elementorBreakpoints = elementorFrontend.config.responsive.activeBreakpoints, defaultSlidesToShowMap = {
                mobile: 1, tablet: isSingleSlide ? 1 : 2
            };
        const swiperOptions = {
            slidesPerView: slidesToShow,
            loop: 'yes' === elementSettings.infinite,
            speed: elementSettings.speed,
            handleElementorBreakpoints: true,
            watchSlidesProgress: true,
            watchSlidesVisibility: true,
            centeredSlides: this.elements.$swiperContainer.data('center'),
            loopedSlides: this.elements.$swiperContainer.data('count'),
        };

        if ('true' === this.elements.$swiperContainer.data('center')) {
            swiperOptions.centeredSlides = true;

        }
        swiperOptions.breakpoints = {};
        let lastBreakpointSlidesToShowValue = slidesToShow;
        Object.keys(elementorBreakpoints).reverse().forEach(breakpointName => {
            // Tablet has a specific default `column`.
            const defaultSlidesToShow = defaultSlidesToShowMap[breakpointName] ? defaultSlidesToShowMap[breakpointName] : lastBreakpointSlidesToShowValue;
            swiperOptions.breakpoints[elementorBreakpoints[breakpointName].value] = {
                slidesPerView: +elementSettings['column_' + breakpointName] || defaultSlidesToShow,
                slidesPerGroup: +elementSettings['column_' + breakpointName] || 1
            };
            lastBreakpointSlidesToShowValue = +elementSettings['column_' + breakpointName] || defaultSlidesToShow;
        });

        if ('yes' === elementSettings.autoplay) {
            swiperOptions.autoplay = {
                delay: elementSettings.autoplay_speed,
                disableOnInteraction: 'yes' === elementSettings.pause_on_interaction
            };
        }

        if (isSingleSlide) {
            swiperOptions.effect = elementSettings.effect;

            if ('fade' === elementSettings.effect) {
                swiperOptions.fadeEffect = {
                    crossFade: true
                };
            }
        } else {
            swiperOptions.slidesPerGroup = +elementSettings.slides_to_scroll || 1;
        }

        if (elementSettings.column_spacing) {
            swiperOptions.spaceBetween = elementSettings.column_spacing.size;
        }

        const showArrows = 'arrows' === elementSettings.navigation || 'both' === elementSettings.navigation || 'bars' === elementSettings.navigation,
            showDots = 'dots' === elementSettings.navigation || 'both' === elementSettings.navigation,
            showProgressbars = 'progressbars' === elementSettings.navigation || 'bars' === elementSettings.navigation;

        if (showArrows) {
            if ('yes' === elementSettings.custom_navigation) {
                swiperOptions.navigation = {
                    prevEl: elementSettings.custom_navigation_previous, nextEl: elementSettings.custom_navigation_next,
                };
            } else {
                swiperOptions.navigation = {
                    prevEl: '.elementor-swiper-button-prev-' + this.$element.data('id'),
                    nextEl: '.elementor-swiper-button-next-' + this.$element.data('id')
                };
            }
        }

        if (showDots) {
            swiperOptions.pagination = {
                el: '.swiper-pagination-' + this.$element.data('id'), type: 'bullets', clickable: true
            };
        }

        if (showProgressbars) {
            swiperOptions.pagination = {
                el: '.swiper-pagination-' + this.$element.data('id'), type: 'progressbar', clickable: true
            };
        }

        if ('yes' === elementSettings.lazyload) {
            swiperOptions.lazy = {
                loadPrevNext: true, loadPrevNextAmount: 1
            };
        }

        if ('vertical' === elementSettings.direction) {
            swiperOptions.direction = 'vertical';
            swiperOptions.slidesPerView = 1;
            swiperOptions.breakpoints = {};
            // swiperOptions.loop = false;
            swiperOptions.on = {
                init: function (swiper) {
                    const currentSlide = swiper.slides[swiper.activeIndex];
                    const currentSlideItem = currentSlide.children[0];
                    jQuery(swiper.$el).css({
                        height: currentSlideItem.clientHeight
                    });
                },
                slideChange: function (swiper) {
                    const currentSlide = swiper.slides[swiper.activeIndex];
                    const currentSlideItem = currentSlide.children[0];
                    jQuery(swiper.$el).css({
                        height: currentSlideItem.clientHeight
                    });
                },
            }
        }
        return swiperOptions;
    }

    async onInit() {
        super.onInit(...arguments);

        if (!this.elements.$swiperContainer.length || 2 > this.elements.$slides.length) {
            return;
        }

        const Swiper = elementorFrontend.utils.swiper;
        this.swiper = await new Swiper(this.elements.$swiperContainer, this.getSwiperSettings()); // Expose the swiper instance in the frontend
        this.elements.$swiperContainer.trigger("swiperInit", [this.swiper]);
        this.elements.$swiperContainer.data('swiper', this.swiper);
        const elementSettings = this.getElementSettings();

        if ('yes' === elementSettings.pause_on_hover) {
            this.togglePauseOnHover(true);
        }
    }

    updateSwiperOption(propertyName) {
        const elementSettings = this.getElementSettings(), newSettingValue = elementSettings[propertyName],
            params = this.swiper.params; // Handle special cases where the value to update is not the value that the Swiper library accepts.

        switch (propertyName) {
            case 'column_spacing':
                params.spaceBetween = newSettingValue.size || 30;
                break;

            case 'autoplay_speed':
                params.autoplay.delay = newSettingValue;
                break;

            case 'speed':
                params.speed = newSettingValue;
                break;
        }

        this.swiper.update();

    }

    getChangeableProperties() {
        return {
            pause_on_hover: 'pauseOnHover',
            autoplay_speed: 'delay',
            speed: 'speed',
            column_spacing: 'spaceBetween',
        };
    }

    onElementChange(propertyName) {
        const changeableProperties = this.getChangeableProperties();

        if (changeableProperties[propertyName]) {
            // 'pause_on_hover' is implemented by the handler with event listeners, not the Swiper library.
            if ('pause_on_hover' === propertyName) {
                const newSettingValue = this.getElementSettings('pause_on_hover');
                this.togglePauseOnHover('yes' === newSettingValue);
            } else {
                this.updateSwiperOption(propertyName);
            }
        }
    }


    onEditSettingsChange(propertyName) {
        if ('activeItemIndex' === propertyName) {
            this.swiper.slideToLoop(this.getEditSettings('activeItemIndex') - 1);
        }
    }
}