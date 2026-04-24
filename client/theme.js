function applyTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    const navbar = document.querySelector(".app-navbar");
    if (navbar) {
        navbar.setAttribute("data-bs-theme", selectedTheme);
    }

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.textContent = selectedTheme === "dark" ? "Light" : "Dark";
    }
}

function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) {
        applyTheme(saved);
        return;
    }

    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(current === "light" ? "dark" : "light");
}

initTheme();
