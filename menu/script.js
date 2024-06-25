const API_URL = 'https://sokesahil-express.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    window.addEventListener('scroll', handleScroll);
});

async function loadItems() {
    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();
        displayMenu(items);
    } catch (error) {
        console.error('Menü yüklenirken hata oluştu:', error);
    }
}

function displayMenu(items) {
    const menuContainer = document.getElementById('menuContainer');
    const tabsContainer = document.getElementById('tabsContainer');
    const categories = [...new Set(items.map(item => item.category))];

    categories.forEach(category => {
        // Create tab for each category
        const tab = document.createElement('div');
        tab.classList.add('tab');
        tab.textContent = category;
        tab.onclick = () => scrollToCategory(category);
        tabsContainer.appendChild(tab);

        // Create category title
        const categoryTitle = document.createElement('div');
        categoryTitle.classList.add('category-title');
        categoryTitle.id = category;
        categoryTitle.textContent = category;
        menuContainer.appendChild(categoryTitle);

        // Create item tiles for each category
        items.filter(item => item.category === category).forEach(item => {
            const itemTile = document.createElement('div');
            itemTile.classList.add('item-tile');

            const itemDetails = document.createElement('div');
            itemDetails.classList.add('item-details');

            const itemName = document.createElement('div');
            itemName.classList.add('item-name');
            itemName.textContent = item.item;

            const itemCategory = document.createElement('div');
            itemCategory.classList.add('item-category');
            itemCategory.textContent = item.category;

            itemDetails.appendChild(itemName);
            itemDetails.appendChild(itemCategory);

            const itemPrice = document.createElement('div');
            itemPrice.classList.add('item-price');
            itemPrice.textContent = `${item.price} TL`;

            itemTile.appendChild(itemDetails);
            itemTile.appendChild(itemPrice);

            menuContainer.appendChild(itemTile);
        });
    });

    // Set first tab as active
    if (tabsContainer.firstChild) {
        tabsContainer.firstChild.classList.add('active');
    }
}

function scrollToCategory(category) {
    const element = document.getElementById(category);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
    // Set active tab
    setActiveTab(category);
}

function setActiveTab(category) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.textContent === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function handleScroll() {
    const categoryTitles = document.querySelectorAll('.category-title');
    const tabs = document.querySelectorAll('.tab');

    let activeCategory = '';

    categoryTitles.forEach((title, index) => {
        const rect = title.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            activeCategory = title.id;
        }
    });

    if (activeCategory) {
        setActiveTab(activeCategory);
    }
}
