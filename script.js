const STORAGE_KEY = "product-counter-orders";
const EXPIRY_TIME = 30 * 60 * 1000;

let count = 0;
let orders = [];
let selectedImage = "";

const mainCounter = document.getElementById("mainCounter");
const minusBtn = document.getElementById("minusBtn");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const refreshBtn = document.getElementById("refreshBtn");
const ordersContainer = document.getElementById("ordersContainer");
const imageInput = document.getElementById("imageInput");
const captureBtn = document.getElementById("captureBtn");

// Load saved orders
function loadOrders() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    const parsed = JSON.parse(saved);
    const now = Date.now();

    orders = parsed.filter(order => now - order.timestamp < EXPIRY_TIME);

    saveToStorage();
    renderOrders();
  }
}

// Save to localStorage
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// Update counter UI
function updateCounter() {
  mainCounter.textContent = count;
}

// Capture image
captureBtn.addEventListener("click", () => {
  imageInput.click();
});

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    selectedImage = event.target.result;
  };

  reader.readAsDataURL(file);
});

// Show fullscreen image
function showImage(imageSrc) {
  const modal = document.createElement("div");
  modal.className = "image-modal";

  modal.innerHTML = `
    <img src="${imageSrc}" />
  `;

  modal.addEventListener("click", () => {
    modal.remove();
  });

  document.body.appendChild(modal);
}

// Render orders
function renderOrders() {
  ordersContainer.innerHTML = "";

  orders.forEach((order, index) => {
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <div style="display:flex; align-items:center;">

        ${order.image ? `<img src="${order.image}" class="order-image" />` : ""}

        <div class="order-left">
          <h2>Order ${index + 1}</h2>
          <p>Saved locally</p>
        </div>
      </div>

      <div class="small-circle">
        ${order.count}
      </div>
    `;

    ordersContainer.appendChild(card);

    const image = card.querySelector(".order-image");

    if (image) {
      image.addEventListener("click", () => {
        showImage(order.image);
      });
    }
  });
}

// Increase count
mainCounter.addEventListener("click", () => {
  count++;
  updateCounter();

  navigator.vibrate?.(30);
});

// Decrease count
minusBtn.addEventListener("click", () => {
  if (count > 0) {
    count--;
    updateCounter();
  }
});

// Save order
saveBtn.addEventListener("click", () => {
  if (count <= 0) return;

  orders.push({
    count,
    image: selectedImage,
    timestamp: Date.now()
  });

  // Keep maximum 5 orders
  if (orders.length > 5) {
    orders.shift();
  }

  saveToStorage();
  renderOrders();

  count = 0;
  selectedImage = "";
  imageInput.value = "";
  updateCounter();

  navigator.vibrate?.([100, 50, 100]);
});

// Reset count only
resetBtn.addEventListener("click", () => {
  count = 0;
  updateCounter();
});

// Refresh everything
refreshBtn.addEventListener("click", () => {
  const confirmDelete = confirm("Delete all saved orders?");

  if (confirmDelete) {
    localStorage.removeItem(STORAGE_KEY);
    orders = [];
    count = 0;

    updateCounter();
    renderOrders();
  }
});

// Auto cleanup every minute
setInterval(() => {
  const now = Date.now();

  orders = orders.filter(order => now - order.timestamp < EXPIRY_TIME);

  saveToStorage();
  renderOrders();
}, 60000);

loadOrders();
updateCounter();
