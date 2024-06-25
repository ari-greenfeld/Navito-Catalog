const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const functions = firebase.functions();

const googleLoginBtn = document.getElementById('googleLoginBtn');
const productForm = document.getElementById('productForm');
const authSection = document.getElementById('authSection');
const adminSection = document.getElementById('adminSection');
const grantAdminSection = document.getElementById('grant-admin-section');
const logoutBtn = document.getElementById('logoutBtn');
const adminForm = document.getElementById('adminForm');

// Authentication state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    user.getIdTokenResult().then((idTokenResult) => {
      if (idTokenResult.claims.admin) {
        authSection.style.display = 'none';
        adminSection.style.display = 'block';
        grantAdminSection.style.display = 'block';
      } else {
        showAlert('You do not have permission to access this page.', 'alert-danger');
        auth.signOut();
      }
    });
  } else {
    authSection.style.display = 'block';
    adminSection.style.display = 'none';
    grantAdminSection.style.display = 'none';
  }
});

// Google login button
googleLoginBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      showAlert('Login successful', 'alert-success');
    })
    .catch((error) => {
      showAlert('Login failed: ' + error.message, 'alert-danger');
    });
});

// Logout button
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    showAlert('Logout successful', 'alert-success');
  }).catch((error) => {
    showAlert('Logout failed: ' + error.message, 'alert-danger');
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

  showAlert('Product added successfully!', 'alert-success');
});

// Admin form submission
adminForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const adminEmail = document.getElementById('adminEmail').value;
  const addAdminRole = functions.httpsCallable('addAdminRole');
  addAdminRole({ email: adminEmail }).then(result => {
    showAlert(result.data.message, 'alert-success');
  }).catch(error => {
    showAlert('Failed to grant admin role: ' + error.message, 'alert-danger');
  });
});

// Show success alert message
function showAlert(message, alertClass) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
  alertDiv.setAttribute('role', 'alert');
  alertDiv.style.position = 'fixed';
  alertDiv.style.bottom = '20px';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translateX(-50%)';
  alertDiv.style.zIndex = '1050'; // Ensure alert is on top of other elements
  alertDiv.innerHTML = `${message}`;
  document.body.appendChild(alertDiv);

  // Automatically remove alert after 3 seconds
  setTimeout(() => {
      alertDiv.remove();
  }, 3000);
}