// ========= API-константы и общие обёртки =========
const API = {
  KEY: "bc116b78-5671-4c27-82e8-386b5c51265d",
  URL: "https://edu.std-900.ist.mospolytech.ru/labs/api/",
};
let dishes = [];
let orders = [];

// Универсальный запрос
async function apiRequest(path, options = {}) {
  const url = `${API.URL}${path}${path.includes("?") ? "&" : "?"}api_key=${API.KEY}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    showToast({ message: "Ошибка API: " + error.message, type: "error" });
    throw error;
  }
}

// Загрузить все блюда
async function loadDishes() {
  dishes = await apiRequest("dishes");
  return dishes;
}

// Загрузить все заказы пользователя
async function loadOrders() {
  orders = await apiRequest("orders");
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return orders;
}

// Получить детали заказа
async function getOrder(orderId) {
  return await apiRequest(`orders/${orderId}`);
}

// Изменить заказ
async function updateOrder(orderId, fields) {
  return await apiRequest(`orders/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
}

// Удалить заказ
async function deleteOrder(orderId) {
  return await apiRequest(`orders/${orderId}`, {
    method: "DELETE",
  });
}

// Для поиска блюда по id
function getDishById(id) {
  return dishes.find((d) => d.id === id);
}

// ========= Уведомления =========
function showToast({ message, type = "success", duration = 2500 }) {
  let container = document.querySelector(".toasts");
  if (!container) {
    container = document.createElement("div");
    container.className = "toasts";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast show toast--${type}`;
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ========= Модальные окна =========
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.setAttribute("hidden", "");
  document.body.style.overflow = "";
}
function closeAllModals() {
  document.querySelectorAll(".modal").forEach((m) => m.setAttribute("hidden", ""));
  document.body.style.overflow = "";
}

// ========= Форматирование времени и заказа =========
function formatOrderItems(order) {
  const items = [];
  if (order.soup_id) items.push(getDishById(order.soup_id)?.name);
  if (order.main_course_id) items.push(getDishById(order.main_course_id)?.name);
  if (order.salad_id) items.push(getDishById(order.salad_id)?.name);
  if (order.drink_id) items.push(getDishById(order.drink_id)?.name);
  if (order.dessert_id) items.push(getDishById(order.dessert_id)?.name);
  return items.filter(Boolean).join(", ");
}
function formatTime(str) {
  // HTML time-picker обычно возвращает 21:00, сервер — тоже, возможно 09:00:00
  if (!str) return "";
  return str.length > 5 ? str.slice(0, 5) : str;
}
function formatDate(dt) {
  const d = new Date(dt);
  return d.toLocaleDateString("ru-RU") + " " +
      d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
function formatDelivery(order) {
  if (order.delivery_type === "by_time" && order.delivery_time)
    return formatTime(order.delivery_time);
  return "Как можно скорее (с 07:00 до 23:00)";
}

function getOrderTotal(order) {
  let total = 0;
  if (order.soup_id) {
    const soup = dishes.find(d => d.id === order.soup_id);
    if (soup) total += soup.price;
  }
  if (order.main_course_id) {
    const main = dishes.find(d => d.id === order.main_course_id);
    if (main) total += main.price;
  }
  if (order.salad_id) {
    const salad = dishes.find(d => d.id === order.salad_id);
    if (salad) total += salad.price;
  }
  if (order.drink_id) {
    const drink = dishes.find(d => d.id === order.drink_id);
    if (drink) total += drink.price;
  }
  if (order.dessert_id) {
    const dessert = dishes.find(d => d.id === order.dessert_id);
    if (dessert) total += dessert.price;
  }
  return total;
}


// ========= Рендер списка заказов =========
async function renderOrderList() {
  const tbody = document.querySelector(".orders-table tbody");
  tbody.innerHTML = "";
  orders.forEach((order, i) => {
    console.log(order);
    const tr = document.createElement("tr");
    tr.dataset.orderId = order.id;
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${formatDate(order.created_at)}</td>
      <td>${formatOrderItems(order)}</td>
      <td>${getOrderTotal(order)}₽</td>
      <td>${formatDelivery(order)}</td>
      <td class="orders-table__actions">
        <button class="icon-btn" data-action="view" aria-label="Подробнее">👁</button>
        <button class="icon-btn" data-action="edit" aria-label="Редактировать">✎</button>
        <button class="icon-btn icon-btn--danger" data-action="delete" aria-label="Удалить">🗑</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ========= События таблицы: делегирование =========
document.querySelector(".orders-table tbody").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const tr = btn.closest("tr");
  const orderId = tr?.dataset.orderId;
  if (!orderId) return;
  if (btn.dataset.action === "view") {
    await openViewModal(orderId);
  }
  if (btn.dataset.action === "edit") {
    await openEditModal(orderId);
  }
  if (btn.dataset.action === "delete") {
    await openDeleteModal(orderId);
  }
});

// ========= Просмотр заказа =========
async function openViewModal(orderId) {
  try {
    const order = await getOrder(orderId);
    document.querySelector("#modal-view .kv__row:nth-child(1) .kv__val").textContent = formatDate(order.created_at);
    document.querySelector("#modal-view .kv__row:nth-child(2) .kv__val").textContent = order.full_name;
    document.querySelector("#modal-view .kv__row:nth-child(3) .kv__val").textContent = order.delivery_address;
    document.querySelector("#modal-view .kv__row:nth-child(4) .kv__val").textContent = formatDelivery(order);
    document.querySelector("#modal-view .kv__row:nth-child(5) .kv__val").textContent = order.phone;
    document.querySelector("#modal-view .kv__row:nth-child(6) .kv__val").textContent = order.email;
    document.querySelector("#modal-view .kv__row:nth-child(7) .kv__val").textContent = order.comment || "-";
    // Состав заказа
    const list = document.querySelector("#modal-view .list");
    list.innerHTML = "";
    [
      { id: order.soup_id },
      { id: order.main_course_id },
      { id: order.salad_id },
      { id: order.drink_id },
      { id: order.dessert_id }
    ].forEach((d) => {
      if (d.id) {
        const dish = getDishById(d.id);
        if (dish) list.innerHTML += `<li>${dish.name} (${dish.price}₽)</li>`;
      }
    });
    document.querySelector("#modal-view .total strong").textContent = ` ${getOrderTotal(order)}₽`;
    showModal("modal-view");
  } catch (err) {
    showToast({ message: "Ошибка загрузки данных заказа", type: "error" });
  }
}

// ========= Редактирование заказа =========
let currentEditOrderId = null;
async function openEditModal(orderId) {
  try {
    const order = await getOrder(orderId);
    currentEditOrderId = orderId;
    // Заполнение полей
    document.getElementById("full_name").value = order.full_name;
    document.getElementById("email").value = order.email;
    document.getElementById("phone").value = order.phone;
    document.getElementById("delivery_address").value = order.delivery_address;
    document.getElementById("delivery_type").value = order.delivery_type === "by_time" ? "by_time" : "now";
    document.getElementById("delivery_time").value = order.delivery_time || "";
    document.getElementById("comment").value = order.comment || "";
    showModal("modal-edit");
  } catch (err) {
    showToast({ message: "Ошибка загрузки заказа для редактирования", type: "error" });
  }
}


document.querySelector('#modal-edit .btn-primary').onclick = async function (e) {
  e.preventDefault();

  
const deliveryType = document.getElementById("delivery_type").value;
let deliveryTime = document.getElementById("delivery_time").value;

  const fields = {
    full_name: document.getElementById("full_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    delivery_address: document.getElementById("delivery_address").value.trim(),
    delivery_type: deliveryType,
    comment: document.getElementById("comment").value.trim(),
  };

  if (deliveryType === "by_time") {
  if (!deliveryTime) {
    showToast({ message: "Выберите время доставки!", type: "error" });
    return;
  }
  fields.delivery_time = deliveryTime; // обязательно отправлять!
} else {
   if ('delivery_time' in fields) delete fields.delivery_time;
}
  try {
    await updateOrder(currentEditOrderId, fields);
    closeModal("modal-edit");
    showToast({ message: "Заказ успешно изменён", type: "success" });
    await refreshOrders();
  } catch (err) {
    showToast({ message: "Ошибка при сохранении заказа", type: "error" });
  }
};
document.querySelector('#modal-edit .btn-secondary').onclick = () => closeModal("modal-edit");

// ========= Удаление заказа =========
let currentDeleteOrderId = null;
async function openDeleteModal(orderId) {
  currentDeleteOrderId = orderId;
  showModal("modal-delete");
}
document.querySelector('#modal-delete .btn-danger').onclick = async function () {
  try {
    await deleteOrder(currentDeleteOrderId);
    closeModal("modal-delete");
    showToast({ message: "Заказ удалён", type: "success" });
    await refreshOrders();
  } catch (err) {
    showToast({ message: "Ошибка при удалении заказа", type: "error" });
  }
};
document.querySelector('#modal-delete .btn-secondary').onclick = () => closeModal("modal-delete");

// ========= Крестики (закрытие) =========
document.querySelectorAll(".modal__close").forEach(btn => {
  btn.onclick = closeAllModals;
});
document.querySelectorAll(".modal__footer .btn").forEach(btn => {
  if (btn.dataset.action?.startsWith("close")) btn.onclick = closeAllModals;
});

// ========= Загрузка данных при старте =========
async function refreshOrders() {
  await loadOrders();
  await renderOrderList();
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadDishes();
  await refreshOrders();
});
