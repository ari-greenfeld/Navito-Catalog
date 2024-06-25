const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const googleLoginBtn = document.getElementById('googleLoginBtn');
const productForm = document.getElementById('productForm');
const authSection = document.getElementById('authSection');
const adminSection = document.getElementById('adminSection');
const logoutBtn = document.getElementById('logoutBtn');

// Authentication state observer
auth.onAuthStateChanged((user) => {
  if (user) {

    authSection.style.display = 'none';
    adminSection.style.display = 'block';
    // user.getIdTokenResult().then((idTokenResult) => {
    //     if (!!idTokenResult.claims.admin) {
    //         authSection.style.display = 'none';
    //         adminSection.style.display = 'block';
    //     } else {
    //         alert('You do not have permission to access this page.');
    //         auth.signOut();
    //     }
    // });
  } else {
    authSection.style.display = 'block';
    adminSection.style.display = 'none';
  }
});

// Google login button
googleLoginBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      alert('Login successful');
    })
    .catch((error) => {
      alert('Login failed: ' + error.message);
    });
});

// Logout button
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    alert('Logout successful');
  }).catch((error) => {
    alert('Logout failed: ' + error.message);
  });
});

// Product form submission
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = document.getElementById('productImage').files[0];
  const brandName = document.getElementById('brandName').value;
  const modelNumber = document.getElementById('modelNumber').value;
  const portNumber = document.getElementById('portNumber').value;

  const storageRef = storage.ref(`products/${file.name}`);
  await storageRef.put(file);
  const imageUrl = await storageRef.getDownloadURL();

  await db.collection('products').add({
    brandName,
    modelNumber,
    portNumber,
    imageUrl
  });

  alert('Product added successfully!');
});
