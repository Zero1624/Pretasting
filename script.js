// Apply initial theme as early as possible to avoid flash
(function() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        document.documentElement.setAttribute('data-theme', storedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const menuContainer = document.getElementById('menu-container');
    const searchInput = document.getElementById('search-input');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const noResults = document.getElementById('no-results');
    const backToTopBtn = document.getElementById('back-to-top');

    let menuData = [];
    let currentCategory = 'all';
    let searchTerm = '';

    // Theme toggle wiring (keeps separate from menu logic)
    (function attachThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const getCurrentTheme = () => document.documentElement.getAttribute('data-theme') || 'light';

        const setTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            try { localStorage.setItem('theme', theme); } catch (e) {}
            const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
            themeToggle.setAttribute('aria-label', label);
        };

        const toggleTheme = () => setTheme(getCurrentTheme() === 'light' ? 'dark' : 'light');

        // Initialize aria label
        setTheme(getCurrentTheme());

        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
        });

        if (window.matchMedia) {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            mq.addEventListener ? mq.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) setTheme(e.matches ? 'dark' : 'light');
            }) : mq.addListener((e) => {
                if (!localStorage.getItem('theme')) setTheme(e.matches ? 'dark' : 'light');
            });
        }
    })();

    function hideLoadingScreen() {
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 1500);
        }
    }

    function initScrollAnimations() {
        const fadeElements = document.querySelectorAll('.fade-in-section');
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }

    function initBackToTop() {
        if (!backToTopBtn) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    async function loadMenuData() {
        try {
            const response = await fetch('menu.json');
            if (!response.ok) {
                throw new Error('Failed to load menu data');
            }
            const data = await response.json();
            menuData = data.categories.flatMap(category => 
                category.items.map(item => ({
                    ...item,
                    category: category.id,
                    categoryName: category.name
                }))
            );
            renderMenuItems();
        } catch (error) {
            console.error('Error loading menu:', error);
            if (menuContainer) {
                menuContainer.innerHTML = '<p class="error" style="text-align: center; padding: 2rem; color: #722F37;">Unable to load menu. Please ensure menu.json is in the same folder as index.html.</p>';
            }
        }
    }

    function formatPrice(price) {
        if (Number.isInteger(price)) {
            return '₱' + price;
        }
        return '₱' + price.toFixed(2);
    }

    function createMenuItemCard(item, index) {
        const card = document.createElement('div');
        card.className = 'menu-item';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="menu-item-image-container">
                <img src="${item.image}" alt="${item.name}" class="menu-item-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/B87333/F5E6D3?text=Image+Not+Available'">
                <span class="menu-item-category-tag">${item.categoryName}</span>
            </div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-name">${item.name}</h3>
                    <span class="menu-item-price">${formatPrice(item.price)}</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
            </div>
        `;
        
        return card;
    }

    function filterItems() {
        return menuData.filter(item => {
            const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }

    function renderMenuItems() {
        if (!menuContainer) return;
        
        const existingItems = menuContainer.querySelectorAll('.menu-item');
        
        existingItems.forEach(item => {
            item.classList.add('fade-out');
        });

        setTimeout(() => {
            menuContainer.innerHTML = '';
            const filteredItems = filterItems();
            
            if (filteredItems.length === 0) {
                if (noResults) noResults.classList.add('show');
            } else {
                if (noResults) noResults.classList.remove('show');
                filteredItems.forEach((item, index) => {
                    const card = createMenuItemCard(item, index);
                    menuContainer.appendChild(card);
                });
            }
        }, existingItems.length > 0 ? 300 : 0);
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            currentCategory = button.dataset.category;
            renderMenuItems();
        });
    });

    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchTerm = e.target.value.trim();
                renderMenuItems();
            }, 200);
        });
    }

    function initKeyboardNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });

        categoryButtons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    // Initialize everything
    hideLoadingScreen();
    initScrollAnimations();
    initBackToTop();
    initKeyboardNavigation();
    loadMenuData();
});
