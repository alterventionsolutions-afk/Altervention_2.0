// === STICKY NAVBAR ===
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// === MOBILE HAMBURGER MENU ===
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('active');
    mobileNav.classList.toggle('active');
});

// Close mobile nav on link click
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        mobileNav.classList.remove('active');
    });
});

// Close mobile nav on click outside
document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && !hamburgerBtn.contains(e.target) && mobileNav.classList.contains('active')) {
        hamburgerBtn.classList.remove('active');
        mobileNav.classList.remove('active');
    }
});

// === INTERSECTION OBSERVER FOR FADE-UP ANIMATIONS ===
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!prefersReducedMotion) {
                entry.target.classList.add('visible');
            } else {
                entry.target.style.opacity = '1';
            }
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.fade-up-element').forEach(element => {
    fadeObserver.observe(element);
});

// === HIGH CONTRAST ACTIVE NAVBAR LINK HIGHLIGHTER ===
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

function highlightNav() {
    let scrollPos = window.scrollY || document.documentElement.scrollTop;
    
    sections.forEach(section => {
        if (scrollPos >= section.offsetTop - 150 && scrollPos < section.offsetTop + section.offsetHeight - 150) {
            const currentId = section.getAttribute('id');
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentId}`) {
                    link.classList.add('active');
                }
            });
            
            mobileLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    if (scrollPos < 100) {
        navLinks.forEach(link => link.classList.remove('active'));
        mobileLinks.forEach(link => link.classList.remove('active'));
        const homeLink = document.querySelector('.nav-link[href="#hero"]');
        const mobileHomeLink = document.querySelector('.mobile-nav-link[href="#hero"]');
        if (homeLink) homeLink.classList.add('active');
        if (mobileHomeLink) mobileHomeLink.classList.add('active');
    }
}

window.addEventListener('scroll', highlightNav);

// === UTILITY: Escape HTML ===
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

// === HERO SLIDESHOW LOGIC ===
let slideIndex = 0;
let slideInterval;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const slideshowWrapper = document.getElementById('slideshow-wrapper');

function showSlides() {
    if (!slides.length) return;
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1; }

    slides[slideIndex - 1].classList.add('active');
    dots[slideIndex - 1].classList.add('active');
}

function startSlideInterval() {
    if (slides.length) {
        slideInterval = setInterval(showSlides, 3000);
    }
}

function currentSlide(n) {
    clearInterval(slideInterval);
    slideIndex = n;
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[slideIndex].classList.add('active');
    dots[slideIndex].classList.add('active');
    startSlideInterval();
}

// Initialize Slideshow & Hover Actions
if (slideshowWrapper) {
    startSlideInterval();

    slideshowWrapper.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    slideshowWrapper.addEventListener('mouseleave', () => {
        startSlideInterval();
    });
}

// Export slide navigator to global window context
window.currentSlide = currentSlide;

// === CAREERS FORM SUBMISSION & FILE UPLOADS ===
function handleFormSubmit(event, formId) {
    event.preventDefault();
    const form = document.getElementById(formId);
    const successMsg = document.getElementById(formId === 'idea-form' ? 'idea-success' : 'apply-success');

    let isValid = true;

    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
        const errorSpan = document.getElementById(`${input.id}-error`);
        const isFileInput = input.type === 'file';
        const fileWrapper = isFileInput ? input.closest('.file-upload-wrapper') : null;
        const fileLabel = fileWrapper ? fileWrapper.querySelector('.file-upload-label') : null;

        if (input.value.trim() === "" || (isFileInput && input.files.length === 0)) {
            isValid = false;
            if (errorSpan) errorSpan.style.display = 'block';
            if (isFileInput && fileLabel) {
                fileLabel.style.borderColor = '#DC2626';
                fileLabel.style.background = 'rgba(220, 38, 38, 0.05)';
            } else if (!isFileInput) {
                input.style.borderColor = '#DC2626';
            }
        } else {
            if (errorSpan) errorSpan.style.display = 'none';
            if (isFileInput && fileLabel) {
                fileLabel.style.borderColor = '';
                fileLabel.style.background = '';
            } else if (!isFileInput) {
                input.style.borderColor = '';
            }
        }
    });

    if (isValid) {
        successMsg.style.display = 'block';
        form.reset();
        form.querySelectorAll('.file-upload-wrapper').forEach(wrapper => {
            wrapper.classList.remove('file-selected');
            const textSpan = wrapper.querySelector('.file-upload-text');
            const fileInput = wrapper.querySelector('.file-input-hidden');
            const defaultText = fileInput.id === 'idea-file' ? 'Choose PDF file...' : 'Choose document (PDF, DOC)...';
            textSpan.textContent = defaultText;
            const fileLabel = wrapper.querySelector('.file-upload-label');
            if (fileLabel) {
                fileLabel.style.borderColor = '';
                fileLabel.style.background = '';
            }
        });
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);
    }
}

// Bind custom file upload inputs label updates
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.file-input-hidden').forEach(input => {
        input.addEventListener('change', (e) => {
            const wrapper = input.closest('.file-upload-wrapper');
            const textSpan = wrapper.querySelector('.file-upload-text');
            const fileLabel = wrapper.querySelector('.file-upload-label');
            if (input.files && input.files.length > 0) {
                const filename = input.files[0].name;
                textSpan.textContent = filename;
                wrapper.classList.add('file-selected');
                if (fileLabel) {
                    fileLabel.style.borderColor = '';
                    fileLabel.style.background = '';
                }
            } else {
                const defaultText = input.id === 'idea-file' ? 'Choose PDF file...' : 'Choose document (PDF, DOC)...';
                textSpan.textContent = defaultText;
                wrapper.classList.remove('file-selected');
            }
        });
    });
});

window.handleFormSubmit = handleFormSubmit;

// === FEEDBACK SYSTEM ===
let selectedRating = 0;
const defaultFeedback = [
    {
        name: "Happy Customer",
        service: "Student Guidance",
        message: "Excellent service and clear project support.",
        rating: 5,
        date: "2025-05-10"
    },
    {
        name: "Satisfied User",
        service: "Smart Home Installation",
        message: "Very useful automation solution for home.",
        rating: 5,
        date: "2025-05-12"
    },
    {
        name: "College Student",
        service: "Hardware Setup",
        message: "Good guidance for student projects.",
        rating: 4,
        date: "2025-05-15"
    }
];

function updateStarsDisplay(rating) {
    const stars = document.querySelectorAll('#feedback-stars .star');
    stars.forEach(star => {
        const starVal = parseInt(star.getAttribute('data-value'));
        if (starVal <= rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

function loadFeedbacks() {
    const wall = document.getElementById('feedback-wall');
    if (!wall) return;
    let stored = localStorage.getItem('altervention_feedback');
    let feedbacks = [];

    if (stored) {
        feedbacks = JSON.parse(stored);
    } else {
        feedbacks = [...defaultFeedback];
        localStorage.setItem('altervention_feedback', JSON.stringify(feedbacks));
    }

    wall.innerHTML = '';
    feedbacks.slice(-6).reverse().forEach(fb => {
        const card = document.createElement('div');
        card.className = 'feedback-card';

        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += i <= fb.rating ? '★' : '☆';
        }

        card.innerHTML = `
            <div class="feedback-card-header">
                <span class="feedback-card-name">${escapeHtml(fb.name)}</span>
                <span class="feedback-card-rating">${starsHTML}</span>
            </div>
            <div class="feedback-card-service">${escapeHtml(fb.service)}</div>
            <p class="feedback-card-msg">"${escapeHtml(fb.message)}"</p>
        `;
        wall.appendChild(card);
    });
}

function handleFeedbackSubmit(event) {
    event.preventDefault();
    const nameInput = document.getElementById('feed-name');
    const serviceInput = document.getElementById('feed-service');
    const msgInput = document.getElementById('feed-msg');
    const successMsg = document.getElementById('feed-success');
    const ratingError = document.getElementById('feed-rating-error');

    let isValid = true;

    [nameInput, serviceInput, msgInput].forEach(input => {
        const errorSpan = document.getElementById(`${input.id}-error`);
        if (input.value.trim() === "") {
            isValid = false;
            if (errorSpan) errorSpan.style.display = 'block';
            input.style.borderColor = '#DC2626';
        } else {
            if (errorSpan) errorSpan.style.display = 'none';
            input.style.borderColor = '';
        }
    });

    if (selectedRating === 0) {
        isValid = false;
        if (ratingError) ratingError.style.display = 'block';
    } else {
        if (ratingError) ratingError.style.display = 'none';
    }

    if (isValid) {
        let stored = localStorage.getItem('altervention_feedback');
        let feedbacks = stored ? JSON.parse(stored) : [...defaultFeedback];

        const newFeedback = {
            name: nameInput.value.trim(),
            service: serviceInput.value.trim(),
            message: msgInput.value.trim(),
            rating: selectedRating,
            date: new Date().toISOString().split('T')[0]
        };

        feedbacks.push(newFeedback);
        localStorage.setItem('altervention_feedback', JSON.stringify(feedbacks));

        successMsg.style.display = 'block';
        selectedRating = 0;
        updateStarsDisplay(0);
        document.getElementById('feedback-form').reset();

        loadFeedbacks();

        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('#feedback-stars .star');
    const ratingError = document.getElementById('feed-rating-error');

    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            selectedRating = parseInt(e.target.getAttribute('data-value'));
            if (ratingError) ratingError.style.display = 'none';
            updateStarsDisplay(selectedRating);
        });
    });

    loadFeedbacks();
    highlightNav();
});

window.handleFeedbackSubmit = handleFeedbackSubmit;

// === SMOOTH SCROLL FOR IN-PAGE NAV ANCHORS ===
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const hrefVal = this.getAttribute('href');
            if (hrefVal === '#') return;
            const target = document.querySelector(hrefVal);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 75,
                    behavior: 'smooth'
                });
            }
        });
    });
});
