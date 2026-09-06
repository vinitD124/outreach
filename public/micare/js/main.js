/**
 *
 * preloader
 * headerSticky
 * footer
 * changeValue
 * video
 * btnSearch
 * infiniteScroll
 * textRotate
 * counter
 * progresslevel
 * totalNumberVariant
 * deleteFile
 * datePicker
 * autoPopup
 * ajaxContactForm
 * handleSidebarFilter
 * checkPaymentCard
 * handleAccordionBorders
 * togglePassword
 * parallaxImage
 * goTop
 * preloader
 *
 **/

(function ($) {
    ("use strict");

     var headerSticky = function () {
        let lastScrollTop = 0;
        let delta = 5;
        let ticking = false;
        let a = jQuery;
        function updateHeader() {
            let st = a(window).scrollTop();
            let navbarHeight = a(".header-sticky").outerHeight();
            let adminBarHeight = a("#wpadminbar").length
                ? a("#wpadminbar").outerHeight()
                : 0;

            if (st < 0) st = 0;

            if (st > navbarHeight + 100) {
                a(".header-sticky").addClass("header-bg");
                if (st > lastScrollTop + delta) {
                    a(".header-sticky").css({
                        transform: "translateY(-110%)",
                        top: adminBarHeight,
                    });
                } else if (st < lastScrollTop - delta) {
                    a(".header-sticky").css({
                        transform: "translateY(0%)",
                    });
                }
            } else {
                a(".header-sticky").removeClass("header-bg");
                a(".header-sticky").css({
                    transform: "translateY(-110%)",
                    top: adminBarHeight,
                });
            }

            lastScrollTop = st;
            ticking = false;
        }

        a(window).on("scroll", function () {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });

        updateHeader();
    };
    
    var footer = function () {
        function checkScreenSize() {
            if (window.matchMedia("(max-width: 550px)").matches) {
                $(".tf-collapse-content").css("display", "none");
            } else {
                $(".footer-menu-list").siblings().removeClass("open");
                $(".tf-collapse-content").css("display", "unset");
            }
        }
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        var args = { duration: 250 };
        $(".title-mobile").on("click", function () {
            $(this).parent(".footer-col-block").toggleClass("open");
            if (!$(this).parent(".footer-col-block").is(".open")) {
                $(this).next().slideUp(args);
            } else {
                $(this).next().slideDown(args);
            }
        });
    };

    var changeValue = function () {
        if ($(".tf-dropdown-sort").length > 0) {
            $(".select-item").click(function (event) {
                $(this)
                    .closest(".tf-dropdown-sort")
                    .find(".text-sort-value")
                    .text($(this).find(".text-value-item").text());

                $(this)
                    .closest(".dropdown-menu")
                    .find(".select-item.active")
                    .removeClass("active");

                $(this).addClass("active");

                var color = $(this).data("value-color");
                $(this)
                    .closest(".tf-dropdown-sort")
                    .find(".btn-select")
                    .find(".current-color")
                    .css("background", color);
            });
        }
    };

    var video = function () {
        if (
            $("div").hasClass("wg-video") ||
            $("div").hasClass("post-format-video")
        ) {
            $(".popup-youtube, .wg-curve-text-video").magnificPopup({
                type: "iframe",
            });
        }
    };

    var btnSearch = function () {
        $(document).on("click", function (e) {
            if (!$(e.target).closest(".search-btn, .form-search").length) {
                $(".top-search, .search-btn").removeClass("active");
                $("body").removeClass("no-scroll");
            }
        });

        $(".search-btn").on("click", function (e) {
            e.stopPropagation();
            $(".top-search, .search-btn").toggleClass("active");

            if ($(".top-search").hasClass("active")) {
                $("body").addClass("no-scroll");
            } else {
                $("body").removeClass("no-scroll");
            }
        });

        $(".form-search").on("click", function (e) {
            e.stopPropagation();
        });

        $(".button-close").on("click", function () {
            $(".top-search, .search-btn").removeClass("active");
            $("body").removeClass("no-scroll");
        });
    };

    var infiniteScroll = function () {
        if ($("body").hasClass("loadmore")) {
            $(".fl-item").slice(0, 9).show();
            $(".fl-item-1").slice(0, 6).show();
            $(".fl-item-2").slice(0, 9).show();
            $(".fl-item-3").slice(0, 9).show();
            $(".fl-item-4").slice(0, 9).show();
            $(".fl-item-5").slice(0, 12).show();
            if ($(".scroll-loadmore").length > 0) {
                $(window).scroll(function () {
                    if (
                        $(window).scrollTop() >=
                        $(document).height() - $(window).height()
                    ) {
                        setTimeout(() => {
                            $(".fl-item:hidden").slice(0, 4).show();
                            if ($(".fl-item:hidden").length === 0) {
                                $(".view-more-button").hide();
                            }
                        });
                    }
                });
            }
            if ($(".loadmore-item").length > 0) {
                $(".btn-loadmore").on("click", function () {
                    setTimeout(() => {
                        $(".fl-item:hidden").slice(0, 3).show();
                        if ($(".fl-item:hidden").length === 0) {
                            $(".view-more-button").hide();
                        }
                    }, 600);
                });
            }
            if ($(".loadmore-item-1").length > 0) {
                $(".btn-loadmore-1").on("click", function () {
                    setTimeout(() => {
                        $(".fl-item-1:hidden").slice(0, 3).show();
                        if ($(".fl-item-1:hidden").length === 0) {
                            $(".view-more-button-1").hide();
                        }
                    }, 600);
                });
            }
            if ($(".loadmore-item-2").length > 0) {
                $(".btn-loadmore-2").on("click", function () {
                    setTimeout(() => {
                        $(".fl-item-2:hidden").slice(0, 3).show();
                        if ($(".fl-item-2:hidden").length === 0) {
                            $(".view-more-button-2").hide();
                        }
                    }, 600);
                });
            }
            if ($(".loadmore-item-3").length > 0) {
                $(".btn-loadmore-3").on("click", function () {
                    setTimeout(() => {
                        $(".fl-item-3:hidden").slice(0, 3).show();
                        if ($(".fl-item-3:hidden").length === 0) {
                            $(".view-more-button-3").hide();
                        }
                    }, 600);
                });
            }
            if ($(".loadmore-item-4").length > 0) {
                $(".btn-loadmore-4").on("click", function () {
                    setTimeout(() => {
                        $(".fl-item-4:hidden").slice(0, 3).show();
                        if ($(".fl-item-4:hidden").length === 0) {
                            $(".view-more-button-4").hide();
                        }
                    }, 600);
                });
            }
            if ($(".loadmore-item-5").length > 0) {
                $(".btn-loadmore-5").on("click", function () {
                    setTimeout(() => {
                        $(".fl-item-5:hidden").slice(0, 3).show();
                        if ($(".fl-item-5:hidden").length === 0) {
                            $(".view-more-button-5").hide();
                        }
                    }, 600);
                });
            }
        }
    };

    var counter = function () {
        if ($(document.body).hasClass("counter-scroll")) {
            const observer = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const element = $(entry.target);

                            if (!element.hasClass("odometer-activated")) {
                                const to = element.data("to");
                                element.addClass("odometer-activated");

                                element.html(to);
                            }

                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.5 }
            );

            $(".counter .number").each(function () {
                observer.observe(this);
            });
        }
    };

    var progresslevel = function () {
        if ($("div").hasClass("progress-bars")) {
            var bars = document.querySelectorAll(".progress-bars-line > div");
            setInterval(function () {
                bars.forEach(function (bar) {
                    var t1 = parseFloat(bar.dataset.progress);
                    var t2 = parseFloat(bar.dataset.max);
                    var getWidth = (t1 / t2) * 100;
                    bar.style.width = getWidth + "%";
                });
            }, 500);
        }
    };

    var circlesProgressLevel = function () {
        var circles = document.querySelectorAll(".progress-circle-svg");
        var observer = new IntersectionObserver(
            function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
                        var el = entry.target;
                        var progressValue = parseFloat(el.dataset.progress);

                        var textElement = el.querySelector(".progress-text");
                        var progressBar = el.querySelector(".progress-ring-bar");

                        var radius = parseFloat(progressBar.getAttribute("r"));
                        var circumference = 2 * Math.PI * radius;

                        progressBar.style.strokeDasharray = `${circumference} ${circumference}`;
                        progressBar.style.strokeDashoffset = circumference;

                        let currentProgress = 0;
                        let animationFrameId;

                        function animateCircle() {
                            if (currentProgress < progressValue) {
                                currentProgress += 1;
                                const offset = circumference - (currentProgress / 100) * circumference;
                                progressBar.style.strokeDashoffset = offset;
                                textElement.textContent = Math.round(currentProgress);
                                animationFrameId = requestAnimationFrame(animateCircle);
                            } else {
                                const finalOffset = circumference - (progressValue / 100) * circumference;
                                progressBar.style.strokeDashoffset = finalOffset;
                                textElement.textContent = Math.round(progressValue);
                                cancelAnimationFrame(animationFrameId);
                            }
                        }

                        animateCircle();
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.9 }
        );

        circles.forEach(function (circle) {
            observer.observe(circle);
        });
    };

    var totalNumberVariant = function () {
        $(".tf-product-info-wrap,.tf-cart-item").each(function () {
            var productItem = $(this);
            var quantityInput = productItem.find(".quantity-product");
            var quantityEl = productItem.find(".quantity-product-2");
            var priceEl = productItem.find(".cart-price");
            var totalEl = productItem.find(".cart-total");

            var updateTotalPrice = function () {
                var currentQuantity = parseInt(quantityInput.val(),10);
                var price = parseFloat(priceEl.text().replace("$", ""));
                var totalPrice = (currentQuantity * price).toFixed(2);
                totalEl.text("$" + totalPrice);
                console.log(totalPrice);
            };

            productItem.find(".btn-increase").on("click", function () {
                var currentQuantity = parseInt(quantityInput.val(),10);
                quantityInput.val(currentQuantity + 1);
                quantityEl.val(currentQuantity + 1);
                updateTotalPrice();
            });

            productItem.find(".btn-decrease").on("click", function () {
                var currentQuantity = parseInt(quantityInput.val(),10);
                if (currentQuantity > 1) {
                    quantityInput.val(currentQuantity - 1);
                    quantityEl.val(currentQuantity - 1);
                    updateTotalPrice();
                }
            });
        });
    };

    var deleteFile = function (e) {
        $(".remove").on("click", function (e) {
            e.preventDefault();
            var $this = $(this);
            $this.closest(".file-delete").remove();
        });
        $(".clear-file-delete").on("click", function (e) {
            e.preventDefault();
            $(this).closest(".list-file-delete").find(".file-delete").remove();
        });
    };

    var datePicker = function () {
        if ($("#datepicker").length > 0) {
            $("#datepicker").datepicker({
                firstDay: 1,
                dateFormat: "dd/mm/yy",
            });
        }
        if ($("#datepicker2").length > 0) {
            $("#datepicker2").datepicker({
                firstDay: 1,
                dateFormat: "dd/mm/yy",
            });
        }
        if ($("#datepicker3").length > 0) {
            $("#datepicker3").datepicker({
                firstDay: 1,
                dateFormat: "dd/mm/yy",
            });
        }
    };

    var ajaxContactForm = function () {
        $("#contactform,#commentform").each(function () {
            $(this).validate({
                submitHandler: function (form) {
                    var $form = $(form),
                        str = $form.serialize(),
                        loading = $("<div />", { class: "loading" });

                    $.ajax({
                        type: "POST",
                        url: $form.attr("action"),
                        data: str,
                        beforeSend: function () {
                            $form.find(".send-wrap").append(loading);
                        },
                        success: function (msg) {
                            var result, cls;
                            if (msg === "Success") {
                                result = "Message Sent Successfully To Email Administrator";
                                cls = "msg-success";
                            } else {
                                result = "Error sending email.";
                                cls = "msg-error";
                            }

                            $form.prepend(
                                $("<div />", {
                                    class: "flat-alert mb-20 " + cls,
                                    text: result,
                                }).append(
                                    $(
                                        '<a class="close mt-0" href="#"><i class="fa fa-close"></i></a>'
                                    )
                                )
                            );

                            $form.find(":input").not(".submit").val("");
                        },
                        complete: function (xhr, status, error_thrown) {
                            $form.find(".loading").remove();
                        },
                    });
                },
            });
        });
    };

    var handleSidebarFilter = function () {
        $("#filterShop,.sidebar-btn").on("click", function () {
            if ($(window).width() <= 1200) {
                $(".sidebar-filter,.overlay-filter").addClass("show");
            }
        });
        $(".close-filter,.overlay-filter").on("click", function () {
            $(".sidebar-filter,.overlay-filter").removeClass("show");
        });
    };

    var checkPaymentCard = function () {
        $(".payment-box").on(
            "click",
            ".payment-choose-card .payment-header",
            function (event) {
                var paymentItem = $(this).closest(".payment-choose-card");
                $(".payment-box .payment-choose-card")
                    .not(paymentItem)
                    .removeClass("active");
                paymentItem.toggleClass("active");
            }
        );
        $(".payment-box").on("show.bs.collapse", function (e) {
            $(e.target).closest(".payment-choose-card").addClass("active");
        });

        $(".payment-box").on("hide.bs.collapse", function (e) {
            $(e.target).closest(".payment-choose-card").removeClass("active");
        });
    };

    var handleAccordionBorders = function () {
        if (document.querySelector(".according-active")) {
            var accordions = document.querySelectorAll(".according-active .collapse");

            accordions.forEach(function (collapseEl) {
                var parentItem = collapseEl.closest(".according-active");

                var addActiveBorder = function () {
                    parentItem.classList.add("active");
                };

                var removeActiveBorder = function () {
                    parentItem.classList.remove("active");
                    var nextItem = parentItem.nextElementSibling;
                    if (nextItem && nextItem.classList.contains("according-active")) {
                        nextItem.style.borderTopColor = "";
                    }
                };

                if (collapseEl.classList.contains("show")) {
                    addActiveBorder();
                }

                collapseEl.addEventListener("show.bs.collapse", addActiveBorder);
                collapseEl.addEventListener("hide.bs.collapse", removeActiveBorder);
            });
        }
    };

    var togglePassword = function () {
        $(".form-has-password")
            .find(".toggle-password")
            .on("click", function () {
                const $passwordInput = $(this)
                    .closest(".password-item")
                    .find(".input-password");
                const type =
                    $passwordInput.attr("type") === "password"
                        ? "text"
                        : "password";
                $passwordInput.attr("type", type);
                $(this).toggleClass("unshow");
            });
    };

    var parallaxImage = function () {
        if ($(".parallax-img").length > 0) {
            $(".parallax-img").each(function () {
                new SimpleParallax(this, {
                    delay: 0.6,
                    orientation: "up",
                    scale: 1.3,
                    transition: "cubic-bezier(0,0,0,1)",
                    customContainer: "",
                    customWrapper: "",
                });
            });
        }
    };

    var gotop = function () {
        if ($("div").hasClass("progress-wrap")) {
            var progressPath = document.querySelector(".progress-wrap path");
            var pathLength = progressPath.getTotalLength();
            progressPath.style.transition = progressPath.style.WebkitTransition =
                "none";
            progressPath.style.strokeDasharray = pathLength + " " + pathLength;
            progressPath.style.strokeDashoffset = pathLength;
            progressPath.getBoundingClientRect();
            progressPath.style.transition = progressPath.style.WebkitTransition =
                "stroke-dashoffset 10ms linear";
            var updateprogress = function () {
                var scroll = $(window).scrollTop();
                var height = $(document).height() - $(window).height();
                var progress = pathLength - (scroll * pathLength) / height;
                progressPath.style.strokeDashoffset = progress;
            };
            updateprogress();
            $(window).scroll(updateprogress);
            var offset = 0;
            var duration = 0;
            jQuery(window).on("scroll", function () {
                if (jQuery(this).scrollTop() > offset) {
                    jQuery(".progress-wrap").addClass("active-progress");
                } else {
                    jQuery(".progress-wrap").removeClass("active-progress");
                }
            });
            jQuery(".progress-wrap").on("click", function (event) {
                event.preventDefault();
                jQuery("html, body").animate({ scrollTop: 0 }, duration);
                return false;
            });
        }
    };

    var preloader = function () {
        $("#loading").fadeOut("slow", function () {
            $(this).remove();
        });
    };

    // Dom Ready
    $(function () {
        headerSticky();
        footer();
        changeValue();
        video();
        btnSearch();
        infiniteScroll();
        counter();
        progresslevel();
        circlesProgressLevel();
        totalNumberVariant();
        deleteFile();
        datePicker();
        ajaxContactForm();
        handleSidebarFilter();
        checkPaymentCard();
        handleAccordionBorders();
        togglePassword();
        parallaxImage();
        gotop();
        preloader();
    });
})(jQuery);
