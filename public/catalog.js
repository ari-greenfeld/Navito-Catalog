const db = firebase.firestore();

async function loadProducts() {
    const productContainer = document.getElementById('productContainer');
    const querySnapshot = await db.collection('products').get();

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
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productDiv = document.createElement('div');
            productDiv.classList.add('col-md-4', 'mb-4');
            productDiv.innerHTML = `
                <div class="card">
                    <img src="${product.imageUrl}" class="card-img-top" alt="${product.brandName} ${product.modelNumber}">
                    <div class="card-body">
                        <h5 class="card-title">${product.brandName}</h5>
                        <p class="card-text">Model: ${product.modelNumber}</p>
                        <p class="card-text">Port: ${product.portNumber}</p>
                    </div>
                </div>
            `;
            productContainer.appendChild(productDiv);
        });
    }
}

loadProducts();
