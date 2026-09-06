(function ($) {
    "use strict";

    var animateText = function () {
        if ($(".text-anime").length) {
            let staggerAmount = 0.03,
                translateXValue = 20,
                easeType = "power2.out",
                animatedTextElements = document.querySelectorAll(".text-anime");

            animatedTextElements.forEach((element) => {
                if (window.innerWidth <= 767) {
                    return;
                }

                let delay = element.dataset.delay
                    ? parseFloat(element.dataset.delay)
                    : 0.1;

                let animationSplitText = new SplitText(element, {
                    type: "chars, words",
                });

                gsap.from(animationSplitText.chars, {
                    duration: 1,
                    delay: delay,
                    x: translateXValue,
                    autoAlpha: 0,
                    stagger: staggerAmount,
                    ease: easeType,
                    scrollTrigger: { trigger: element, start: "top 95%" },
                });
            });
        }
    };

    var animateImgItem = function () {
        const isSmallScreen = window.matchMedia("(max-width: 991px)").matches;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay =
                            parseFloat(entry.target.getAttribute("data-delay")) || 0;
                        setTimeout(() => {
                            $(entry.target).addClass("active-animate");
                        }, delay * 1000);
                    }
                });
            },
            {
                threshold: isSmallScreen ? 0.1 : 0.1,
            }
        );

        const elements = $(
            ".tf-animate-1, .tf-animate-2, .tf-animate-3, .tf-animate-4"
        );
        elements.each(function () {
            observer.observe(this);
        });

        const checkVisible = () => {
            elements.each(function () {
                const sectionOffsetTop = $(this).offset().top;
                const sectionHeight = $(this).outerHeight();
                const scrollPosition = $(window).scrollTop();
                const windowHeight = $(window).height();

                if (
                    scrollPosition + windowHeight * 0.9 > sectionOffsetTop &&
                    scrollPosition < sectionOffsetTop + sectionHeight
                ) {
                    const delay = parseFloat($(this).attr("data-delay")) || 0;
                    setTimeout(() => {
                        $(this).addClass("active-animate");
                    }, delay * 1000);
                }
            });
        };

        $(document).ready(checkVisible);
        $(window).on("scroll", checkVisible);
    };

    var animateImgScroll = function () {
        if (!window.matchMedia("(min-width: 992px)").matches) return;

        document.querySelectorAll(".scroll-tranform").forEach(function (el) {
            gsap.to(el, {
                y: -100,
                scrollTrigger: {
                    trigger: el.closest(".scroll-tranform-section") || el,
                    start: "top center",
                    end: "bottom top",
                    scrub: 2,
                },
            });
        });

        document.querySelectorAll(".scroll-tranform-up").forEach(function (el) {
            gsap.to(el, {
                y: 100,
                scrollTrigger: {
                    trigger: el.closest(".scroll-tranform-section") || el,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 2,
                },
            });
        });
    };

    var animateFlipText = function () {
        if (window.innerWidth <= 550) {
            let flipTextElements = document.querySelectorAll(".text-flip");
            flipTextElements.forEach((element) => {
                if (element.animation) {
                    element.animation.kill();
                }
                gsap.set(element, { clearProps: "all", rotationX: 0 });
            });
            return;
        }

        let flipTextElements = document.querySelectorAll(".text-flip");

        flipTextElements.forEach((element) => {
            if (element.animation) {
                element.animation.kill();
            }

            gsap.set(element, { rotationX: 0, transformOrigin: "center center" });

            let isFlipped = false;

            function flipLoop() {
                element.animation = gsap.to(element, {
                    duration: 0.6,
                    rotationX: isFlipped ? 0 : 180,
                    ease: "power2.inOut",
                    onComplete: () => {
                        isFlipped = !isFlipped;
                        gsap.delayedCall(1.5, flipLoop);
                    },
                });
            }

            flipLoop();
        });
    };

    var animateSectionBg = function () {
        if (!window.matchMedia("(min-width: 992px)").matches) return;

        document.querySelectorAll(".paralax-bg").forEach(function (bg, i) {

            var imageUrl = bg.dataset.imgParalax;
            if (imageUrl) {
                bg.style.backgroundImage = `url("${imageUrl}")`;
            }

            if (i === 0) {
                bg.style.backgroundPosition = "20% 0px";

                gsap.to(bg, {
                    backgroundPosition: `20% ${-innerHeight / 5}px`,
                    ease: "none",
                    scrollTrigger: {
                        trigger: bg,
                        start: "top top",
                        scrub: true,
                    },
                });
            } else {
                bg.style.backgroundPosition = `20% ${innerHeight / 5}px`;

                gsap.to(bg, {
                    backgroundPosition: `20% ${-innerHeight / 5}px`,
                    ease: "none",
                    scrollTrigger: {
                        trigger: bg,
                        scrub: true,
                    },
                });
            }
        });
    };

    $(window).on("load", function () {
        animateText();
        animateImgItem();
        animateImgScroll();
        animateFlipText();
        animateSectionBg();
    });
})(jQuery);
