// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/jenergy-web-app/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope:', registration.scope);

                // Check if the service worker is already controlling the page
                if (navigator.serviceWorker.controller) {
                    console.log('Service worker is already controlling the page.');
                } else {
                    console.log('No active service worker yet.');
                }
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });

    // Reload the page only when a new service worker takes control
    let isInitialControllerChange = true;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (isInitialControllerChange) {
            console.log('Controller change detected on initial load. Skipping reload.');
            isInitialControllerChange = false;
        } else {
            console.log('New service worker activated. Reloading page after transition.');

            // Delay the reload to allow the fade-out effect
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.reload();
            }, 1000); // Matches transition duration
        }
    });
}

// Function to toggle the navigation menu
function toggleMenu() {
    const navbar = document.querySelector('.nav-container');
    navbar.classList.toggle('open');
    const isExpanded = navbar.classList.contains('open');
    document.getElementById('menu-icon').setAttribute('aria-expanded', isExpanded);
}

// Add listeners for dropdown navigation
function addDropdownListeners() {
    const dropdownButton = document.querySelector('.dropdown-button');
    const dropdownContent = document.querySelector('.custom-dropdown-menu');

    function handleDropdownToggle(event) {
        event.preventDefault();
        const expanded = dropdownButton.getAttribute('aria-expanded') === 'true' || false;
        dropdownButton.setAttribute('aria-expanded', !expanded);
        dropdownContent.classList.toggle('show');
    }

    function checkViewport() {
        const isSmallViewport = window.matchMedia("(max-width: 768px)").matches;

        if (dropdownButton && dropdownContent) {
            if (isSmallViewport) {
                dropdownButton.addEventListener('click', handleDropdownToggle);
            } else {
                dropdownButton.removeEventListener('click', handleDropdownToggle);
                dropdownContent.classList.remove('show');
                dropdownButton.onclick = null;
            }
        }
    }

    window.addEventListener('resize', checkViewport);
    checkViewport();
}

// Function to toggle the visibility of steps on small devices
function toggleSteps() {
    const accordionToggle = document.querySelector('.accordion-toggle');
    const accordionContent = document.querySelector('.accordion-content');

    if (accordionToggle) {
        accordionToggle.addEventListener('click', () => {
            accordionContent.classList.toggle('expanded');
            accordionToggle.setAttribute('aria-expanded', accordionContent.classList.contains('expanded'));
        });
    }
}

// Function to create the loading overlay
function createLoadingOverlay() {
    if (document.getElementById('loading-overlay')) {
        console.log('Loading overlay already exists. Skipping creation.');
        return; // Prevent duplicate initialization
    }

    console.log('Creating loading overlay...');
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
        <div id="rising-sun-container">
            <div id="rising-sun"></div>
        </div>
    `;
    document.body.prepend(overlay);

    console.log('Loading overlay created at:', new Date().toISOString());
}

// Function to remove the loading overlay
function removeLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        console.log('Removing loading overlay at:', new Date().toISOString());
        overlay.style.display = 'none'; // Hides the overlay
        overlay.remove(); // Removes it from the DOM (optional)
    }
}

// Lazy loading for images
function enableLazyLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.setAttribute('loading', 'lazy');
    });
}

// Fetch and insert header/footer content
function fetchAndSetInnerHTML(url, element) {
    const allowedUrls = ['header.html', 'footer.html'];
    if (!allowedUrls.includes(url)) {
        console.error('Blocked fetch for disallowed URL:', url);
        return;
    }
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            if (new URL(response.url, location.origin).origin !== location.origin) {
                throw new Error('Response from untrusted origin blocked');
            }
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            doc.querySelectorAll('script').forEach(s => s.remove());
            element.innerHTML = doc.body.innerHTML;
            if (url.includes('header.html')) {
                addDropdownListeners();
            }
        })
        .catch(error => {
            console.error(`Error loading ${url}:`, error);
        });
}

// Load header and footer dynamically
function loadHeaderFooter() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        fetchAndSetInnerHTML('header.html', headerPlaceholder);
    }
    if (footerPlaceholder) {
        fetchAndSetInnerHTML('footer.html', footerPlaceholder);
    }
}

// Form validation
function validateForm() {
    let isValid = true;

    const nameField = document.querySelector('input[name="name"]');
    const emailField = document.querySelector('input[name="email"]');
    const phoneField = document.querySelector('input[name="number"]');
    const serviceField = document.querySelector('select[name="service"]');
    const messageField = document.querySelector('textarea[name="message"]');

    document.querySelectorAll('.error-message').forEach(el => el.remove());

    if (nameField && nameField.value.trim() === "") {
        showError(nameField, "Name is required");
        isValid = false;
    }

    if (emailField && emailField.value.trim() === "") {
        showError(emailField, "Email is required");
        isValid = false;
    } else if (emailField && !validateEmail(emailField.value)) {
        showError(emailField, "Please enter a valid email");
        isValid = false;
    }

    if (phoneField && phoneField.value.trim() !== "" && !validatePhone(phoneField.value)) {
        showError(phoneField, "Please enter a valid phone number");
        isValid = false;
    }

    if (serviceField && serviceField.value === "") {
        showError(serviceField, "Please select a service");
        isValid = false;
    }

    if (messageField && messageField.value.trim() === "") {
        showError(messageField, "Message is required");
        isValid = false;
    }

    return isValid;
}

function showError(field, message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.style.color = 'red';
    error.textContent = message;
    field.parentElement.appendChild(error);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    const re = /^\+?[0-9\s\-]{7,15}$/;
    return re.test(String(phone));
}

// Detect offline/online status
function handleNetworkStatus() {
    window.addEventListener('offline', () => {
        console.log('You are now offline.');
        alert('You appear to be offline. Some features may not be available.');
    });

    window.addEventListener('online', () => {
        console.log('Back online!');
        alert('You are back online. Enjoy full functionality!');
    });
}

// Initialize all event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Guard to ensure the overlay is removed only once
    let overlayRemoved = false;

    enableLazyLoading();
    loadHeaderFooter();
    toggleSteps();
    handleNetworkStatus();

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function (event) {
            if (!validateForm()) {
                event.preventDefault();
            }
        });
    }

    // Remove the loading overlay after animation
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.addEventListener('animationend', (event) => {
            if (!overlayRemoved) {
                removeLoadingOverlay();
                overlayRemoved = true;
            }
        });

        setTimeout(() => {
            if (!overlayRemoved) {
                removeLoadingOverlay();
                overlayRemoved = true;
            }
        }, 5000); // Fallback after 5 seconds
    }

    // Handle rising sun animation to ensure it doesn't restart
    const risingSun = document.getElementById('rising-sun');
    if (risingSun) {
        risingSun.addEventListener('animationend', (event) => {
            if (event.animationName === 'burst') {
                console.log('Rising sun animation completed.');
                risingSun.style.animation = 'none'; // Disable further animations
            }
        });
    }

    // Apply fade-in on initial page load
    document.body.classList.add('fade-in');
    setTimeout(() => {
        document.body.classList.remove('fade-in');
    }, 1000); // Matches CSS duration

    // Handle page transitions
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (
                href &&
                href.startsWith('/') &&
                !href.startsWith('#') && // Ignore anchor links
                !href.startsWith('javascript:') &&
                !link.hasAttribute('download') && // Ignore downloadable links
                !link.hasAttribute('data-no-transition') && // Ignore links that shouldn't transition
                window.location.pathname !== href // Avoid reloading the current page
            ) {
                event.preventDefault();
                console.log('Fade-out triggered for link:', href); // Debugging log
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = href;
                }, 1000); // Matches CSS transition duration
            }
        });
    });
});

