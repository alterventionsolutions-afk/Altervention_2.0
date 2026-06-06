// ALTERVENTION shared interactions
// Professional navbar, full-page slideshow, reveal transitions, forms, and feedback wall.

(function () {
    'use strict';

    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    // === NAVBAR SCROLL STATE ===
    const navbar = qs('#navbar');

    function updateNavbarState() {
        if (!navbar) return;
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    updateNavbarState();
    window.addEventListener('scroll', updateNavbarState, { passive: true });

    // === MOBILE HAMBURGER MENU ===
    const hamburgerBtn = qs('#hamburger-btn');
    const mobileNav = qs('#mobile-nav');
    const mobileNavLinks = qsa('.mobile-nav-link');

    function closeMobileMenu() {
        if (!hamburgerBtn || !mobileNav) return;
        hamburgerBtn.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.classList.remove('nav-open');
    }

    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.classList.toggle('nav-open', mobileNav.classList.contains('active'));
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', (event) => {
            if (!mobileNav.classList.contains('active')) return;
            const clickedInsideMenu = mobileNav.contains(event.target);
            const clickedButton = hamburgerBtn.contains(event.target);
            if (!clickedInsideMenu && !clickedButton) closeMobileMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeMobileMenu();
        });
    }

    // === REVEAL TRANSITIONS FOR EVERY PAGE ===
    function initRevealAnimations() {
        const revealSelectors = [
            '.fade-up-element',
            '.page-hero-title',
            '.page-hero-subtitle',
            '.page-hero-breadcrumb',
            '.section-label',
            '.section-title',
            '.about-text',
            '.stat-box',
            '.process-step',
            '.team-card',
            '.product-card',
            '.service-card',
            '.career-card',
            '.feedback-form-box',
            '.feedback-wall',
            '.contact-row',
            '.map-card'
        ];

        const elements = qsa(revealSelectors.join(','));
        elements.forEach((element, index) => {
            element.classList.add('reveal-element');
            element.style.setProperty('--reveal-delay', `${Math.min(index * 35, 420)}ms`);
        });

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            elements.forEach(element => element.classList.add('visible'));
            return;
        }

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -60px 0px'
        });

        elements.forEach(element => revealObserver.observe(element));
    }

    // === FULL-PAGE HERO SLIDESHOW ===
    let slideIndex = 0;
    let slideInterval = null;

    function getSlides() {
        return qsa('.slide');
    }

    function getDots() {
        return qsa('.dot');
    }

    function showSlide(index) {
        const slides = getSlides();
        const dots = getDots();
        if (!slides.length) return;

        slideIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === slideIndex);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === slideIndex);
            dot.setAttribute('aria-current', i === slideIndex ? 'true' : 'false');
        });
    }

    function nextSlide() {
        showSlide(slideIndex + 1);
        restartSlideInterval();
    }

    function prevSlide() {
        showSlide(slideIndex - 1);
        restartSlideInterval();
    }

    function currentSlide(index) {
        showSlide(index);
        restartSlideInterval();
    }

    function startSlideInterval() {
        const slides = getSlides();
        if (slides.length <= 1) return;
        stopSlideInterval();
        slideInterval = window.setInterval(() => {
            showSlide(slideIndex + 1);
        }, 4500);
    }

    function stopSlideInterval() {
        if (slideInterval) {
            window.clearInterval(slideInterval);
            slideInterval = null;
        }
    }

    function restartSlideInterval() {
        stopSlideInterval();
        startSlideInterval();
    }

    function initSlideshow() {
        const slideshowWrapper = qs('#slideshow-wrapper');
        const slides = getSlides();
        if (!slideshowWrapper || !slides.length) return;

        showSlide(0);
        startSlideInterval();

        slideshowWrapper.addEventListener('mouseenter', stopSlideInterval);
        slideshowWrapper.addEventListener('mouseleave', startSlideInterval);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopSlideInterval();
            else startSlideInterval();
        });
    }

    window.currentSlide = currentSlide;
    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;

    // === UTILITY: ESCAPE HTML ===
    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char]));
    }

    // === CAREERS FORM SUBMISSION & FILE UPLOADS ===
    function updateFileLabel(input) {
        const wrapper = input.closest('.file-upload-wrapper');
        if (!wrapper) return;

        const textSpan = wrapper.querySelector('.file-upload-text');
        const fileLabel = wrapper.querySelector('.file-upload-label');
        const hasFile = input.files && input.files.length > 0;

        wrapper.classList.toggle('file-selected', hasFile);
        if (textSpan) {
            textSpan.textContent = hasFile ? input.files[0].name : (input.id === 'idea-file' ? 'Choose PDF file...' : 'Choose document (PDF, DOC)...');
        }
        if (fileLabel && hasFile) {
            fileLabel.style.borderColor = '';
            fileLabel.style.background = '';
        }
    }

    function validateRequiredFields(form) {
        let isValid = true;
        const requiredInputs = qsa('[required]', form);

        requiredInputs.forEach(input => {
            const errorSpan = qs(`#${input.id}-error`);
            const isFileInput = input.type === 'file';
            const fileWrapper = isFileInput ? input.closest('.file-upload-wrapper') : null;
            const fileLabel = fileWrapper ? qs('.file-upload-label', fileWrapper) : null;
            const valid = isFileInput ? input.files.length > 0 : input.value.trim() !== '';

            if (!valid) {
                isValid = false;
                if (errorSpan) errorSpan.style.display = 'block';
                if (isFileInput && fileLabel) {
                    fileLabel.style.borderColor = '#ef4444';
                    fileLabel.style.background = 'rgba(239, 68, 68, 0.08)';
                } else {
                    input.style.borderColor = '#ef4444';
                }
            } else {
                if (errorSpan) errorSpan.style.display = 'none';
                if (isFileInput && fileLabel) {
                    fileLabel.style.borderColor = '';
                    fileLabel.style.background = '';
                } else {
                    input.style.borderColor = '';
                }
            }
        });

        return isValid;
    }

    function handleFormSubmit(event, formId) {
        event.preventDefault();
        const form = qs(`#${formId}`);
        if (!form) return;

        const successMsg = qs(formId === 'idea-form' ? '#idea-success' : '#apply-success');
        const isValid = validateRequiredFields(form);

        if (!isValid) return;

        if (successMsg) {
            successMsg.style.display = 'block';
            successMsg.classList.add('success-pop');
        }

        form.reset();
        qsa('.file-input-hidden', form).forEach(updateFileLabel);

        setTimeout(() => {
            if (successMsg) {
                successMsg.style.display = 'none';
                successMsg.classList.remove('success-pop');
            }
        }, 5000);
    }

    window.handleFormSubmit = handleFormSubmit;

    function initFileUploads() {
        qsa('.file-input-hidden').forEach(input => {
            input.addEventListener('change', () => updateFileLabel(input));
        });
    }

    // === FEEDBACK WALL ===
    const defaultFeedback = [
        {
            name: 'Student Client',
            service: 'Project Guidance',
            message: 'The team explained the project clearly and helped us understand the complete logic.',
            rating: 5,
            date: '2025-01-10'
        },
        {
            name: 'Home Customer',
            service: 'Smart Home Installation',
            message: 'Professional service and clean setup. The appliance control system works smoothly.',
            rating: 5,
            date: '2025-01-14'
        },
        {
            name: 'EEE Student',
            service: 'Hardware Support',
            message: 'Good support for circuit, coding, testing, report and final explanation.',
            rating: 4,
            date: '2025-01-18'
        }
    ];

    let selectedRating = 0;

    function getStoredFeedbacks() {
        try {
            const stored = localStorage.getItem('altervention_feedback');
            return stored ? JSON.parse(stored) : [...defaultFeedback];
        } catch (error) {
            return [...defaultFeedback];
        }
    }

    function starText(rating) {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

    function renderFeedbackCards(container, feedbacks) {
        if (!container) return;
        if (!feedbacks.length) {
            container.innerHTML = '<p style="color: var(--muted-text); text-align: center; grid-column: 1/-1;">No reviews yet — be the first to share your experience!</p>';
            return;
        }
        container.innerHTML = feedbacks.slice().reverse().map(item => `
            <article class="feedback-card">
                <div class="feedback-card-top">
                    <div>
                        <h3>${escapeHtml(item.name)}</h3>
                        <span>${escapeHtml(item.service)}</span>
                    </div>
                    <strong>${starText(Number(item.rating) || 0)}</strong>
                </div>
                <p>"${escapeHtml(item.message)}"</p>
                <small>${escapeHtml(item.date || '')}</small>
            </article>
        `).join('');
    }

    function loadFeedbacks() {
        const feedbacks = getStoredFeedbacks();

        // Feedback page wall (now removed from feedback.html, kept for safety)
        const feedbackWall = qs('#feedback-wall');
        if (feedbackWall) renderFeedbackCards(feedbackWall, feedbacks);

        // Home page reviews wall
        const homeFeedbackWall = qs('#home-feedback-wall');
        if (homeFeedbackWall) renderFeedbackCards(homeFeedbackWall, feedbacks);
    }

    function updateStarsDisplay(rating) {
        qsa('#feedback-stars .star').forEach(star => {
            const value = Number(star.getAttribute('data-value'));
            star.classList.toggle('selected', value <= rating);
        });
    }

    function handleFeedbackSubmit(event) {
        event.preventDefault();

        const form = qs('#feedback-form');
        if (!form) return;

        const nameInput = qs('#feed-name');
        const serviceInput = qs('#feed-service');
        const msgInput = qs('#feed-msg');
        const successMsg = qs('#feed-success');
        const ratingError = qs('#feed-rating-error');

        const isValidFields = validateRequiredFields(form);
        let isValid = isValidFields;

        if (selectedRating === 0) {
            isValid = false;
            if (ratingError) ratingError.style.display = 'block';
        } else if (ratingError) {
            ratingError.style.display = 'none';
        }

        if (!isValid) return;

        const feedbacks = getStoredFeedbacks();
        feedbacks.push({
            name: nameInput.value.trim(),
            service: serviceInput.value.trim(),
            message: msgInput.value.trim(),
            rating: selectedRating,
            date: new Date().toISOString().split('T')[0]
        });

        localStorage.setItem('altervention_feedback', JSON.stringify(feedbacks));

        if (successMsg) {
            successMsg.style.display = 'block';
            successMsg.classList.add('success-pop');
        }

        selectedRating = 0;
        updateStarsDisplay(0);
        form.reset();
        loadFeedbacks();

        setTimeout(() => {
            if (successMsg) {
                successMsg.style.display = 'none';
                successMsg.classList.remove('success-pop');
            }
        }, 5000);
    }

    window.handleFeedbackSubmit = handleFeedbackSubmit;

    function initFeedback() {
        const stars = qsa('#feedback-stars .star');
        const ratingError = qs('#feed-rating-error');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = Number(star.getAttribute('data-value'));
                if (ratingError) ratingError.style.display = 'none';
                updateStarsDisplay(selectedRating);
            });
        });

        loadFeedbacks();
    }

    // === SMOOTH SCROLL FOR IN-PAGE NAV ANCHORS ===
    function initSmoothScroll() {
        qsa('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (event) {
                const hrefVal = this.getAttribute('href');
                if (!hrefVal || hrefVal === '#') return;

                const target = qs(hrefVal);
                if (!target) return;

                event.preventDefault();
                const offset = navbar ? navbar.offsetHeight : 75;
                window.scrollTo({
                    top: target.offsetTop - offset,
                    behavior: 'smooth'
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('page-ready');
        initRevealAnimations();
        initSlideshow();
        initFileUploads();
        initFeedback();
        initSmoothScroll();
    });
})();
