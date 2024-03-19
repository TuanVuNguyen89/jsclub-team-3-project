const carousel = document.querySelector(".carousel"),
firstImg = carousel.querySelectorAll("img")[0],
arrowIcons = document.querySelectorAll(".wrapper i");

let isDragStart = false, isDragging = false, prevPageX, prevScrollLeft, positionDiff;

const showHideIcons = () => {
    // showing and hiding prev/next icon according to carousel scroll left value
    let scrollWidth = carousel.scrollWidth - carousel.clientWidth; // getting max scrollable width
    arrowIcons[0].style.display = carousel.scrollLeft == 0 ? "none" : "block";
    arrowIcons[1].style.display = carousel.scrollLeft == scrollWidth ? "none" : "block";
}

arrowIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        let firstImgWidth = firstImg.clientWidth + 14; // getting first img width & adding 14 margin value
        // if clicked icon is left, reduce width value from the carousel scroll left else add to it
        carousel.scrollLeft += icon.id == "left" ? -firstImgWidth : firstImgWidth;
        setTimeout(() => showHideIcons(), 60); // calling showHideIcons after 60ms
    });
});

const autoSlide = () => {
    // if there is no image left to scroll then return from here
    if(carousel.scrollLeft - (carousel.scrollWidth - carousel.clientWidth) > -1 || carousel.scrollLeft <= 0) return;

    positionDiff = Math.abs(positionDiff); // making positionDiff value to positive
    let firstImgWidth = firstImg.clientWidth + 14;
    // getting difference value that needs to add or reduce from carousel left to take middle img center
    let valDifference = firstImgWidth - positionDiff;

    if(carousel.scrollLeft > prevScrollLeft) { // if user is scrolling to the right
        return carousel.scrollLeft += positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
    }
    // if user is scrolling to the left
    carousel.scrollLeft -= positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
}

const dragStart = (e) => {
    // updatating global variables value on mouse down event
    isDragStart = true;
    prevPageX = e.pageX || e.touches[0].pageX;
    prevScrollLeft = carousel.scrollLeft;
}

const dragging = (e) => {
    // scrolling images/carousel to left according to mouse pointer
    if(!isDragStart) return;
    e.preventDefault();
    isDragging = true;
    carousel.classList.add("dragging");
    positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
    carousel.scrollLeft = prevScrollLeft - positionDiff;
    showHideIcons();
}

const dragStop = () => {
    isDragStart = false;
    carousel.classList.remove("dragging");

    if(!isDragging) return;
    isDragging = false;
    autoSlide();
}

carousel.addEventListener("mousedown", dragStart);
carousel.addEventListener("touchstart", dragStart);

document.addEventListener("mousemove", dragging);
carousel.addEventListener("touchmove", dragging);

document.addEventListener("mouseup", dragStop);
carousel.addEventListener("touchend", dragStop);

document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('scroll', function() {
        var scroll = window.pageYOffset || document.documentElement.scrollTop;
        var nav = document.querySelector('nav');
        if (scroll > 50) {
            nav.classList.add('white-background');
        } else {
            nav.classList.remove('white-background');
        }
    });
});

document.querySelector('.menu-icon').addEventListener('click', function() {
    document.querySelector('ul').classList.toggle('active');
});

window.addEventListener('resize', function() {
    if (window.innerWidth <= 600) {
        document.querySelector('#user-icon').innerHTML = '<a href="https://www.facebook.com/1257913698299f">Profile</a>';
    } else {
        document.querySelector('#user-icon').innerHTML = '<a href="https://www.facebook.com/1257913698299f"><img class="user__avatar" src="./css/imageh/HOME.png" alt="" /></a>';
    }
});

// Thực hiện kiểm tra ngay khi trang được tải
window.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 600) {
        document.querySelector('#user-icon').innerHTML = '<a href="https://www.facebook.com/1257913698299f">Profile</a>';
    }
});

// document.addEventListener("DOMContentLoaded", function() {
//     const userIcon = document.getElementById('user-icon');
//     const userMenu = document.createElement('div');
//     userMenu.classList.add('user-menu');
//     userMenu.innerHTML = `
//         <ul>
//             <li><a href="#">Profile</a></li>
//             <li><a href="#">Log Out</a></li>
//         </ul>
//     `;
//     userIcon.appendChild(userMenu);

//     userIcon.addEventListener('mouseenter', function() {
//         userMenu.style.display = 'block';
//     });

//     userIcon.addEventListener('mouseleave', function() {
//         userMenu.style.display = 'none';
//     });
// });


// slider2js
// var swiper = new Swiper(".mySwiper", {
//     slidesPerView: 1,
//     grabCursor: true,
//     loop: true,
//     pagination: {
//       el: ".swiper-pagination",
//       clickable: true,
//     },
//     navigation: {
//       nextEl: ".swiper-button-next",
//       prevEl: ".swiper-button-prev",
//     },
// });