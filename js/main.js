const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");
const themeLabel = document.querySelector(".theme-label");
const siteHeader = document.querySelector(".site-header");
const videoPreview = document.querySelector(".video-placeholder");
const forms = document.querySelectorAll("form");

const applyTheme = (theme) => {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);

    if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }

    if (themeLabel) {
        themeLabel.textContent = isDark ? "Dark" : "Light";
    }
};

const savedTheme = localStorage.getItem("learnsphere-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

applyTheme(savedTheme || preferredTheme);

const closeMobileMenu = () => {
    if (!menuToggle || !navLinks) {
        return;
    }

    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
};

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.addEventListener("click", (event) => {
        if (event.target.tagName === "A") {
            closeMobileMenu();
        }
    });

    document.addEventListener("click", (event) => {
        const clickedInsideNav = navLinks.contains(event.target);
        const clickedToggle = menuToggle.contains(event.target);

        if (!clickedInsideNav && !clickedToggle) {
            closeMobileMenu();
        }
    });
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
        localStorage.setItem("learnsphere-theme", nextTheme);
        applyTheme(nextTheme);
    });
}

const updateHeaderState = () => {
    if (siteHeader) {
        siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
    }
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const showToast = (message) => {
    let toast = document.querySelector(".toast-message");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast-message";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.append(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");

    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 3200);
};

const createPreviewModal = () => {
    const modal = document.createElement("div");
    modal.className = "preview-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "preview-modal-title");
    modal.innerHTML = `
        <div class="preview-dialog">
            <button class="modal-close" type="button" aria-label="Close preview">x</button>
            <div class="preview-frame">
                <div class="play-button" aria-hidden="true"></div>
            </div>
            <div class="preview-copy">
                <p class="eyebrow">Lesson Preview</p>
                <h2 id="preview-modal-title">Structured online learning</h2>
                <p>This preview introduces guided lessons, practice tasks, mentor feedback, and progress tracking inside LearnSphere.</p>
                <a class="primary-button" href="courses.html">Browse Courses</a>
            </div>
        </div>
    `;

    document.body.append(modal);
    return modal;
};

const openPreviewModal = () => {
    const modal = document.querySelector(".preview-modal") || createPreviewModal();
    const closeButton = modal.querySelector(".modal-close");

    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    closeButton.focus();
};

const closePreviewModal = () => {
    const modal = document.querySelector(".preview-modal");

    if (!modal) {
        return;
    }

    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");

    if (videoPreview) {
        videoPreview.focus();
    }
};

if (videoPreview) {
    videoPreview.addEventListener("click", openPreviewModal);
    videoPreview.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPreviewModal();
        }
    });
}

document.addEventListener("click", (event) => {
    const modal = document.querySelector(".preview-modal.is-open");

    if (!modal) {
        return;
    }

    if (event.target === modal || event.target.closest(".modal-close")) {
        closePreviewModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMobileMenu();
        closePreviewModal();
    }
});

const setFieldMessage = (field, message) => {
    const group = field.closest(".field-group");

    if (!group) {
        return;
    }

    let messageElement = group.querySelector(".field-message");

    if (!messageElement) {
        messageElement = document.createElement("small");
        messageElement.className = "field-message";
        group.append(messageElement);
    }

    messageElement.textContent = message;
    group.classList.toggle("has-error", Boolean(message));
};

forms.forEach((form) => {
    form.setAttribute("novalidate", "");

    form.addEventListener("input", (event) => {
        const field = event.target;

        if (field.matches("input, select")) {
            setFieldMessage(field, "");
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const fields = [...form.querySelectorAll("input[required], select[required]")];
        let firstInvalidField = null;

        fields.forEach((field) => {
            let message = "";

            if (!field.value.trim()) {
                message = "This field is required.";
            } else if (field.type === "email" && !field.validity.valid) {
                message = "Enter a valid email address.";
            } else if (field.type === "password" && field.value.length < 6) {
                message = "Use at least 6 characters.";
            }

            setFieldMessage(field, message);

            if (message && !firstInvalidField) {
                firstInvalidField = field;
            }
        });

        if (firstInvalidField) {
            firstInvalidField.focus();
            return;
        }

        form.reset();
        showToast(form.closest(".register-card") ? "Account created. Welcome to LearnSphere." : "Login successful. Your dashboard is ready.");
    });
});
