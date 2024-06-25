const API_URL = 'https://sokesahil-express.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    loadCategories();
    loadPassKey();
    
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
    const passKey = document.getElementById('passKey').value;
    const rememberDevice = document.getElementById('rememberDevice').checked;

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
                    'Content-Type': 'application/json',
                    'x-pass-key': passKey
                },
                body: JSON.stringify(item)
            });
        } else {
            response = await fetch(`${API_URL}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-pass-key': passKey
                },
                body: JSON.stringify(item)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ürün kaydedilemedi');
        }

        if (rememberDevice) {
            setCookie('passKey', passKey, 30); // Remember for 30 days
            setCookie('rememberDevice', 'true', 30);
        } else {
            setCookie('passKey', '', -1); // Clear the cookie
            setCookie('rememberDevice', '', -1);
        }

        displayMessage('Ürün başarıyla kaydedildi', 'success');
        loadItems();
        loadCategories();
        // Do not reset the form here to preserve the pass key
        document.getElementById('itemId').value = '';
        toggleNewCategoryInput(); // Reset new category input visibility
    } catch (error) {
        displayMessage(error.message, 'error');
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
    const passKey = document.getElementById('passKey').value;
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
        try {
            const response = await fetch(`${API_URL}/items/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-pass-key': passKey
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ürün silinemedi');
            }

            displayMessage('Ürün başarıyla silindi', 'success');
            loadItems();
        } catch (error) {
            displayMessage(error.message, 'error');
        }
    }
}

function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function loadPassKey() {
    const passKey = getCookie('passKey');
    const rememberDevice = getCookie('rememberDevice') === 'true';
    if (passKey) {
        document.getElementById('passKey').value = passKey;
    }
    document.getElementById('rememberDevice').checked = rememberDevice;
}

function displayMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
