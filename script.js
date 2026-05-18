const STORAGE_KEY = "product-counter-orders";
const EXPIRY_TIME = 30 * 60 * 1000;

let count = 0;
let orders = [];
let selectedImage = "";
let currentImageOrderId = null;

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

        ${order.image
          ? `<img src="${order.image}" class="order-image" />`
          : `
            <div>
              <button class="capture-btn" data-id="${order.id}">
                Add Image
              </button>
              <input type="file" class="hidden-input" accept="image/*" capture="environment" data-id="${order.id}" />
            </div>
          `}


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

    const captureButton = card.querySelector(".capture-btn");
    const hiddenInput = card.querySelector(".hidden-input");

    if (captureButton && hiddenInput) {
      captureButton.addEventListener("click", () => {
        currentImageOrderId = Number(captureButton.dataset.id);
        hiddenInput.click();
      });

      hiddenInput.addEventListener("change", (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(event) {
          const orderIndex = orders.findIndex(
            order => order.id === currentImageOrderId
          );

          if (orderIndex !== -1) {
            orders[orderIndex].image = event.target.result;

            saveToStorage();
            renderOrders();
          }
        };

        reader.readAsDataURL(file);
      });
    });
    }
  });
}

// Increase count
// Increase count
mainCounter.style.pointerEvents = "auto";

mainCounter.addEventListener("click", (e) => {
  e.stopPropagation();
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
    id: Date.now(),
    count,
    image: "",
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
