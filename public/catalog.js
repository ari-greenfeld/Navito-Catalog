const db = firebase.firestore();
const auth = firebase.auth();

async function loadProducts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase(); // Get search input value
    const productContainer = document.getElementById('productContainer');
    productContainer.innerHTML = '<div class="text-center spinner-container" style="min-width:100%;"><div class="spinner-border" role="status"></div></div>';
    const querySnapshot = await db.collection('products')
        .orderBy('brandName', 'asc')
        .orderBy('modelNumber', 'asc')
        .get();

    productContainer.innerHTML = '';//Remove loading icon after finished loading from db
    if (querySnapshot.empty) {
        const noProductsMessage = document.createElement('div');
        noProductsMessage.classList.add('col-12', 'text-center', 'mt-5');
        noProductsMessage.innerHTML = `
            <div class="alert alert-warning" role="alert">
                No products available yet. Please check back later.
            </div>
        `;
        productContainer.appendChild(noProductsMessage);
    } else {
        querySnapshot.forEach(async (doc) => {
            const product = doc.data();
            // Check if search input matches product brandName or modelNumber or portNumber
            if (product.brandName.toLowerCase().includes(searchInput) || product.modelNumber.toLowerCase().includes(searchInput) || product.portNumber.toLowerCase().includes(searchInput)) {
                let editAndDeleteButtons = '';
                let userIsAdmin = await getUserAndAdminRole();
                if (userIsAdmin == true) {
                    editAndDeleteButtons = `
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${doc.id}"><i class="fas fa-trash"></i> Delete</button>
                    `
                }
                const productDiv = document.createElement('div');
                productDiv.classList.add('col-lg-3', 'col-md-4', 'col-sm-6', 'mb-4');
                productDiv.innerHTML = `
                <div class="card">
                    <img src="${product.imageUrl}" class="card-img-top" alt="${product.brandName} ${product.modelNumber}">
                    <div class="card-body">
                        <h5 class="card-title">${product.brandName}</h5>
                        <p class="card-text">Model: ${product.modelNumber}</p>
                        <p class="card-text">Port: ${product.portNumber}</p>
                        ${editAndDeleteButtons}
                    </div >
                </div >
                `;
                productContainer.appendChild(productDiv);
                if (userIsAdmin == true) {
                    // Add event listeners for edit and delete buttons
                    productDiv.querySelector('.edit-btn').addEventListener('click', () => openEditModal(doc.id, product));
                    productDiv.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(doc.id));
                }
            }
        });
    }
}

loadProducts();

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        await db.collection('products').doc(id).delete();
        loadProducts();
    }
}

let currentProduct = {};
function openEditModal(id, product) {
    document.getElementById('editBrandName').value = product.brandName;
    document.getElementById('editModelNumber').value = product.modelNumber;
    document.getElementById('editPortNumber').value = product.portNumber;
    document.getElementById('editProductForm').dataset.id = id;
    currentProduct = product;
    $('#editProductModal').modal('show');
}

document.getElementById('editProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.dataset.id;
    const brandName = document.getElementById('editBrandName').value;
    const modelNumber = document.getElementById('editModelNumber').value;
    const portNumber = document.getElementById('editPortNumber').value;
    const file = document.getElementById('editProductImage').files[0];
    let imageUrl = currentProduct.imageUrl;

    if (file) {
        const storageRef = storage.ref(`products / ${file.name} `);
        await storageRef.put(file);
        imageUrl = await storageRef.getDownloadURL();
    }

    await db.collection('products').doc(id).update({
        brandName,
        modelNumber,
        portNumber,
        imageUrl
    });

    $('#editProductModal').modal('hide');
    loadProducts();
});

async function getUserAndAdminRole() {
    try {
        var result = await auth?.currentUser?.getIdTokenResult();
        return result.claims.admin;
    } catch (error) {
        return false;
    }
}

// Timer variable to store setTimeout ID
let searchTimer;

// Search input event listener
document.getElementById('searchInput').addEventListener('input', function () {
    // Clear previous timer if exists
    clearTimeout(searchTimer);

    // Set a new timer to execute loadEntries after 1000ms (1 second) of user inactivity
    searchTimer = setTimeout(() => {
        loadProducts();
    }, 500);
});