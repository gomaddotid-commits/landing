// ============================================================
// 1. SPA ROUTER
// ============================================================

const routes = {
    '/': '/pages/home.html',
    '/platform': '/pages/platform.html',
    '/agency': '/pages/agency.html',
    '/customer': '/pages/customer.html',
    '/contact': '/pages/contact.html',
    '/docs': '/documentations/index.html',
    '/docs/customer': '/documentations/customer.html',
    '/docs/agency': '/documentations/agency.html',
    '/docs/driver': '/documentations/driver.html',
    '/docs/warung': '/documentations/warung.html',
    '/docs/flow': '/documentations/flow.html',
};

let currentRoute = '/';

async function loadContent(path) {
    const contentDiv = document.getElementById('content');
    if (!contentDiv) return;

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Not found');
        const html = await response.text();
        contentDiv.innerHTML = html;

        // Re-init Mermaid if needed
        if (path.includes('flow.html') || path.includes('documentations')) {
            setTimeout(() => initMermaid(), 100);
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        contentDiv.innerHTML = `
            <div class="text-center py-20">
                <h1 class="text-4xl font-bold text-primary">404</h1>
                <p class="text-gray-600 mt-4">Halaman tidak ditemukan.</p>
                <a href="#/" class="btn-primary inline-block mt-6">Kembali ke Beranda</a>
            </div>
        `;
    }
}

function navigate(hash) {
    const path = hash.replace('#', '') || '/';
    currentRoute = path;
    const filePath = routes[path] || '/404.html';
    loadContent(filePath);

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === hash) {
            link.classList.add('active');
        }
    });

    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.add('hidden');
}

window.addEventListener('hashchange', () => {
    navigate(window.location.hash);
});

function initRouter() {
    // If no hash, set to home
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#/';
    } else {
        navigate(window.location.hash);
    }
}

// ============================================================
// 2. THEME (Dark / Light) dengan event listener dinamis
// ============================================================

function initTheme() {
    // Baca tema tersimpan
    const savedTheme = localStorage.getItem('gomad-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    // Pasang event listener ke tombol tema (bisa dipanggil ulang setelah header dimuat)
    setupThemeToggle();
}

function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        // Hapus listener lama agar tidak double
        const newBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);

        newBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('gomad-theme', next);
            updateThemeUI(next);

            // Re-render mermaid jika ada
            if (document.querySelector('.mermaid')) {
                setTimeout(initMermaid, 200);
            }
        });
    }
}

function updateThemeUI(theme) {
    const iconLight = document.getElementById('theme-icon-light');
    const iconDark = document.getElementById('theme-icon-dark');
    if (!iconLight || !iconDark) return;

    if (theme === 'light') {
        iconLight.classList.add('hidden');
        iconDark.classList.remove('hidden');
    } else {
        iconLight.classList.remove('hidden');
        iconDark.classList.add('hidden');
    }
}

// ============================================================
// 3. MERMAID.JS
// ============================================================

function initMermaid() {
    if (typeof mermaid === 'undefined') return;

    const mermaidElements = document.querySelectorAll('.mermaid');
    if (mermaidElements.length === 0) return;

    const theme = document.documentElement.getAttribute('data-theme');
    const themeConfig = theme === 'dark' ? 'dark' : 'default';

    mermaid.initialize({
        startOnLoad: false,
        theme: themeConfig,
        themeVariables: theme === 'dark' ? {
            primaryColor: '#C1121F',
            primaryTextColor: '#F5F5F5',
            primaryBorderColor: '#C1121F',
            lineColor: '#F5F5F5',
            secondaryColor: '#2a2a2a',
            tertiaryColor: '#1a1a1a',
            clusterBkg: '#1a1a1a',
            edgeLabelBackground: '#1a1a1a',
            nodeBorder: '#444',
            nodeTextColor: '#F5F5F5',
            labelColor: '#F5F5F5',
        } : {
            primaryColor: '#C1121F',
            primaryTextColor: '#111111',
            primaryBorderColor: '#C1121F',
            lineColor: '#111111',
            secondaryColor: '#F5F5F5',
            tertiaryColor: '#FFFFFF',
            clusterBkg: '#FFFFFF',
            edgeLabelBackground: '#FFFFFF',
            nodeBorder: '#E5E5E5',
            nodeTextColor: '#111111',
            labelColor: '#111111',
        },
    });

    mermaidElements.forEach((element) => {
        const oldSvg = element.querySelector('svg');
        if (oldSvg) oldSvg.remove();

        let diagramText = element.textContent.trim();
        if (!diagramText) {
            const pre = element.querySelector('pre');
            if (pre) diagramText = pre.textContent.trim();
        }

        if (diagramText) {
            try {
                const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
                mermaid.render(id, diagramText).then(({ svg }) => {
                    element.innerHTML = svg;
                });
            } catch (e) {
                console.warn('Mermaid render error:', e);
            }
        }
    });
}

// Re-run mermaid on theme change
const observer = new MutationObserver(() => {
    if (document.querySelector('.mermaid')) {
        setTimeout(initMermaid, 200);
    }
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// ============================================================
// 4. MOBILE MENU TOGGLE (event listener dinamis)
// ============================================================

function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (toggleBtn && mobileMenu) {
        // Hapus listener lama agar tidak double
        const newBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);

        newBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking a link inside
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

// ============================================================
// 5. LOAD HEADER & FOOTER (dengan callback untuk event listener)
// ============================================================

async function loadComponent(id, path, callback) {
    try {
        const response = await fetch(path);
        const html = await response.text();
        document.getElementById(id).innerHTML = html;
        if (callback) callback();
    } catch (e) {
        console.warn('Failed to load component:', path);
    }
}

// ============================================================
// 6. INISIALISASI UTAMA
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Load header & footer
    await loadComponent('header-container', '/components/header.html', () => {
        // Setelah header dimuat, pasang event listener
        setupThemeToggle();
        setupMobileMenu();
        // Pastikan logo sesuai tema saat ini
        updateThemeUI(document.documentElement.getAttribute('data-theme'));
    });
    await loadComponent('footer-container', '/components/footer.html');

    // Init router & theme
    initRouter();
    initTheme();

    // Re-attach listeners jika header berubah (misal navigasi SPA tidak memuat ulang header)
    // Tapi karena header statis, cukup sekali.
});

// ============================================================
// 7. EXPOSE KE GLOBAL (agar bisa dipanggil ulang jika perlu)
// ============================================================

window.initMermaid = initMermaid;
window.setupThemeToggle = setupThemeToggle;
window.setupMobileMenu = setupMobileMenu;
window.updateThemeUI = updateThemeUI;