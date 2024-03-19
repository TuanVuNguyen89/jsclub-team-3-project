// slider2js
var swiper = new Swiper(".mySwiper", {
  slidesPerView: 1,
  grabCursor: true,
  loop: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

document.addEventListener('DOMContentLoaded', function () {
var swiper = new Swiper('.mySwiper', {
    slidesPerView: 1,
    grabCursor: true,
    loop: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});

var navButtons = document.querySelectorAll('.nav-btn');

navButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        if (this.classList.contains('swiper-button-next')) {
            swiper.slideNext(); // Lướt sang trang kế tiếp
        } else if (this.classList.contains('swiper-button-prev')) {
            swiper.slidePrev(); // Lướt sang trang trước đó
        }
    });
});
});