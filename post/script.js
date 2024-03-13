
const header = document.getElementById('header');

window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;

    if (scrollPosition > 50) {
        header.classList.add('fixed-header');
    } else {
        header.classList.remove('fixed-header');
    }
});