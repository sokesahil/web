const API_URL = 'https://sokesahil-express.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    loadCategories();
    
    document.getElementById('searchInput').addEventListener('input', filterItems);
    document.getElementById('itemForm').addEventListener('submit', saveItem);
    document.getElementById('itemCategory').addEventListener('change', toggleNewCategoryInput);
});

async function loadItems() {
    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();
        displayItems(items);
    } catch (error) {
        console.error('Ürünler yüklenirken hata oluştu:', error);
    }
}

function displayItems(items) {
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.innerHTML = `
            <div>
                <strong>${item.item}</strong> (${item.category}) - ${item.price} TL
            </div>
            <div>
                <button class="update" onclick="editItem('${item._id}', '${item.item}', '${item.category}', ${item.price})">Güncelle</button>
                <button class="delete" onclick="confirmDeleteItem('${item._id}')">Sil</button>
            </div>
        `;
        itemsList.appendChild(itemElement);
    });
}

function filterItems() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const itemName = item.querySelector('strong').textContent.toLowerCase();
        if (itemName.includes(searchValue)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();
        const categories = [...new Set(items.map(item => item.category))];

        const categorySelect = document.getElementById('itemCategory');
        categorySelect.innerHTML = '<option value="" disabled selected>Bir kategori seçin</option>'; // Clear existing options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        const newCategoryOption = document.createElement('option');
        newCategoryOption.value = 'new';
        newCategoryOption.textContent = 'Yeni kategori oluştur';
        categorySelect.appendChild(newCategoryOption);
    } catch (error) {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
    }
}

function toggleNewCategoryInput() {
    const categorySelect = document.getElementById('itemCategory');
    const newCategoryInput = document.getElementById('newCategory');

    if (categorySelect.value === 'new') {
        newCategoryInput.style.display = 'block';
        newCategoryInput.setAttribute('required', 'required');
    } else {
        newCategoryInput.style.display = 'none';
        newCategoryInput.removeAttribute('required');
    }
}

async function saveItem(event) {
    event.preventDefault();

    const itemId = document.getElementById('itemId').value;
    const itemName = document.getElementById('itemName').value;
    const itemCategory = document.getElementById('itemCategory').value === 'new' ? document.getElementById('newCategory').value : document.getElementById('itemCategory').value;
    const itemPrice = document.getElementById('itemPrice').value;

    const item = {
        item: itemName,
        category: itemCategory,
        price: itemPrice
    };

    try {
        let response;
        if (itemId) {
            response = await fetch(`${API_URL}/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });
        } else {
            response = await fetch(`${API_URL}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });
        }

        if (!response.ok) {
            throw new Error('Ürün kaydedilemedi');
        }

        loadItems();
        loadCategories();
        document.getElementById('itemForm').reset();
        document.getElementById('itemId').value = '';
        toggleNewCategoryInput(); // Reset new category input visibility
    } catch (error) {
        console.error('Ürün kaydedilirken hata oluştu:', error);
    }
}

function editItem(id, name, category, price) {
    document.getElementById('itemId').value = id;
    document.getElementById('itemName').value = name;
    document.getElementById('itemCategory').value = category;
    document.getElementById('itemPrice').value = price;

    if (category === 'new') {
        toggleNewCategoryInput();
    } else {
        document.getElementById('newCategory').style.display = 'none';
        document.getElementById('newCategory').removeAttribute('required');
    }
}

async function confirmDeleteItem(id) {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
        try {
            const response = await fetch(`${API_URL}/items/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ürün silinemedi');
            }

            loadItems();
        } catch (error) {
            console.error('Ürün silinirken hata oluştu:', error);
        }
    }
}
