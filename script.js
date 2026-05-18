const STORAGE_KEY = "product-counter-orders";
const EXPIRY_TIME = 30 * 60 * 1000;

let count = 0;
let orders = [];

const mainCounter = document.getElementById("mainCounter");
const minusBtn = document.getElementById("minusBtn");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const refreshBtn = document.getElementById("refreshBtn");
const ordersContainer = document.getElementById("ordersContainer");

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

// Render orders
function renderOrders() {
  ordersContainer.innerHTML = "";

  orders.forEach((order, index) => {
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <div class="order-left">
        <h2>Order ${index + 1}</h2>
        <p>Saved locally</p>
      </div>

      <div class="small-circle">
        ${order.count}
      </div>
    `;

    ordersContainer.appendChild(card);
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
    timestamp: Date.now()
  });

  // Keep maximum 5 orders
  if (orders.length > 5) {
    orders.shift();
  }

  saveToStorage();
  renderOrders();

  count = 0;
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
