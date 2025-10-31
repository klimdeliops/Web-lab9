let loginform = document.querySelector(".loginform");
let signupform = document.querySelector(".signupform");
let deliveryform = document.querySelector(".deliveryform");
let nextToDataBtn = document.getElementById("nextToData");
let backToOrderBtn = document.getElementById("backToOrder");
let nextToDeliveryBtn = document.getElementById("nextToDelivery");
let backToDataBtn = document.getElementById("backToData");

const ORDER_KEYS = ["soup", "main-course", "salad", "drink", "dessert"];

const API = {
  KEY: "bc116b78-5671-4c27-82e8-386b5c51265d",
  URL: "https://edu.std-900.ist.mospolytech.ru/labs/api/",
};
let dishes = [];
let orders = [];

async function apiRequest(path, options = {}) {
  const url = `${API.URL}${path}${path.includes("?") ? "&" : "?"}api_key=${
    API.KEY
  }`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return await response.json(); // должен быть return!
  } catch (error) {
    console.error("Ошибка API:", error);
    throw error;
  }
}

// Готовые функции-обёртки для вашего приложения:

// Получить все блюда
async function loadDishes() {
  const resp = await fetch(`${API.URL}dishes?api_key=${API.KEY}`);
  dishes = await resp.json();
  console.dir(dishes);
  return dishes;
}

// Получить все заказы пользователя
async function loadOrders() {
  return await apiRequest("orders");
}

// Получить заказ по ID
async function getOrder(orderId) {
  return await apiRequest(`orders/${orderId}`);
}

// Создать заказ
async function createOrder(orderData) {
  return await apiRequest("orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
}

// Обновить заказ
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

// Получить ID блюда по ключу
function getDishIdByKeyword(keyword) {
  const found = dishes.find((d) => d.keyword === keyword);
  return found ? found.id : undefined;
}

// Сформировать объект заказа по спецификации сервера
function makeOrderDataFromForm(selectedDishes) {
  const deliveryType =
    document.querySelector('input[name="deliveryTime"]:checked').value ===
    "scheduled"
      ? "by_time"
      : "now";
  let deliveryTime = undefined;
  if (deliveryType === "by_time") {
    deliveryTime = document.getElementById("deliveryTime").value;
  }

  return {
    full_name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    subscribe: document.getElementById("marketing").checked ? 1 : 0,
    phone: document.getElementById("phone").value,
    delivery_address: document.getElementById("address").value,
    delivery_type: deliveryType,
    delivery_time: deliveryTime,
    soup_id: selectedDishes.soup
      ? getDishIdByKeyword(selectedDishes.soup)
      : undefined,
    main_course_id: selectedDishes["main-course"]
      ? getDishIdByKeyword(selectedDishes["main-course"])
      : undefined,
    salad_id: selectedDishes.salad
      ? getDishIdByKeyword(selectedDishes.salad)
      : undefined,
    drink_id: selectedDishes.drink
      ? getDishIdByKeyword(selectedDishes.drink)
      : undefined, // drink обязательно!
    dessert_id: selectedDishes.dessert
      ? getDishIdByKeyword(selectedDishes.dessert)
      : undefined,
    comment: document.getElementById("comment").value,
  };
}

let selectedDishes = JSON.parse(localStorage.getItem("selectedDishes")) || {
  soup: "",
  "main-course": "",
  salad: "",
  drink: "",
  dessert: "",
};

function saveSelectedDishes() {
  localStorage.setItem("selectedDishes", JSON.stringify(selectedDishes));
  updateTotalCost();
}

function goToDataPage() {
  loginform.style.left = "-100%";
  signupform.style.left = "0";
  deliveryform.style.left = "100%";
}
function goToOrderPage() {
  loginform.style.left = "0";
  signupform.style.left = "100%";
  deliveryform.style.left = "200%";
}
function goToDeliveryPage() {
  loginform.style.left = "-100%";
  signupform.style.left = "-100%";
  deliveryform.style.left = "0";
}
function goBackToDataPage() {
  loginform.style.left = "-100%";
  signupform.style.left = "0";
  deliveryform.style.left = "100%";
}

nextToDataBtn.addEventListener("click", goToDataPage);
backToOrderBtn.addEventListener("click", goToOrderPage);
nextToDeliveryBtn.addEventListener("click", goToDeliveryPage);
backToDataBtn.addEventListener("click", goBackToDataPage);

// orderData должен содержать ВСЕ обязательные поля по таблице с фото!
// Пример (заполняйте по вашим названиям инпутов):
const orderData = {
  full_name: document.getElementById("name").value,
  email: document.getElementById("email").value,
  subscribe: document.getElementById("marketing").checked ? 1 : 0,
  phone: document.getElementById("phone").value,
  delivery_address: document.getElementById("address").value,
  delivery_type:
    document.querySelector('input[name="deliveryTime"]:checked').value ===
    "scheduled"
      ? "by_time"
      : "now",
  delivery_time: document.getElementById("deliveryTime").value || undefined,
  soup_id: selectedDishes.soup
    ? getDishIdByKeyword(selectedDishes.soup)
    : undefined,
  main_course_id: selectedDishes["main-course"]
    ? getDishIdByKeyword(selectedDishes["main-course"])
    : undefined,
  salad_id: selectedDishes.salad
    ? getDishIdByKeyword(selectedDishes.salad)
    : undefined,
  drink_id: selectedDishes.drink
    ? getDishIdByKeyword(selectedDishes.drink)
    : undefined,
  dessert_id: selectedDishes.dessert
    ? getDishIdByKeyword(selectedDishes.dessert)
    : undefined,
  comment: document.getElementById("comment").value,
  // другие поля при необходимости
};

function getDishIdByKeyword(keyword) {
  const found = dishes.find((d) => d.keyword === keyword);
  return found ? found.id : undefined;
}

function updateTotalCost() {
  const totalCostDiv = document.getElementById("total-cost");
  const total = ORDER_KEYS.reduce((sum, key) => {
    const dish = dishes.find((d) => d.keyword === selectedDishes[key]);
    return sum + (dish ? dish.price : 0);
  }, 0);

  if (total > 0) {
    totalCostDiv.style.display = "block";
    totalCostDiv.textContent = `Итого: ${total}₽`;
  } else {
    totalCostDiv.style.display = "none";
  }
}

function getCategoryName(key) {
  const map = {
    soup: "Суп",
    "main-course": "Главное блюдо",
    salad: "Салат или стартер",
    drink: "Напиток",
    dessert: "Десерт",
  };
  return map[key] || key;
}

function showToast({ message, type = "success", duration = 2500 }) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  toast.innerHTML =
    message + '<button class="toast-close" title="Закрыть">&times;</button>';
  container.appendChild(toast);
  toast.querySelector(".toast-close").onclick = () => toast.remove();
  setTimeout(() => toast.remove(), duration);
}

function renderCurrentOrderList() {
  const orderList = document.getElementById("current-order-list");
  const emptyText = document.getElementById("empty-order-text");
  orderList.innerHTML = "";

  let hasItems = false;
  ORDER_KEYS.forEach((key) => {
    if (selectedDishes[key]) {
      const dish = dishes.find((d) => d.keyword === selectedDishes[key]);
      if (dish) {
        hasItems = true;
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${dish.image}" alt="${dish.name}" />
          <div class="text_div">
            <p>${dish.price}₽</p>
            <p>${dish.name}</p>
            <br>
            <p>${dish.count}</p>
          </div>
          <button type="button" class="del-btn" data-cat="${key}">Удалить</button>
        `;
        card.querySelector(".del-btn").addEventListener("click", () => {
          selectedDishes[key] = "";
          saveSelectedDishes();
          renderCurrentOrderList();
          renderSelectedDishesInForm();
          showToast({
            message: `<div style="font-size:1.1em"> Блюдо <b> ${
              dish.name
            }</b> из категории "<b>${getCategoryName(
              key
            )}</b>" успешно удалено!</div>`,
            type: "error",
          });
        });
        orderList.appendChild(card);
      }
    }
  });
  emptyText.style.display = hasItems ? "none" : "block";
  orderList.style.display = hasItems ? "flex" : "none";
}

// Ключ для данных формы
const FORM_DATA_KEY = "orderFormData";

// Сохраняет текущие значения полей
function saveFormData() {
  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    comment: document.getElementById("comment").value,
    marketing: document.getElementById("marketing").checked,
    deliveryTime:
      document.querySelector('input[name="deliveryTime"]:checked')?.value ||
      "asap",
    deliveryTimeValue: document.getElementById("deliveryTime").value,
  };
  localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
}

// Восстанавливает значения полей из localStorage
function loadFormData() {
  const savedData = localStorage.getItem(FORM_DATA_KEY);
  if (!savedData) return;
  const formData = JSON.parse(savedData);
  if (formData.name) document.getElementById("name").value = formData.name;
  if (formData.email) document.getElementById("email").value = formData.email;
  if (formData.phone) document.getElementById("phone").value = formData.phone;
  if (formData.address)
    document.getElementById("address").value = formData.address;
  if (formData.comment)
    document.getElementById("comment").value = formData.comment;
  if (typeof formData.marketing === "boolean")
    document.getElementById("marketing").checked = formData.marketing;
  if (formData.deliveryTime) {
    const radio = document.querySelector(
      `input[name="deliveryTime"][value="${formData.deliveryTime}"]`
    );
    if (radio) radio.checked = true;
  }
  if (formData.deliveryTime === "scheduled" && formData.deliveryTimeValue) {
    document.getElementById("scheduledTime").style.display = "block";
    document.getElementById("deliveryTime").value = formData.deliveryTimeValue;
  } else {
    document.getElementById("scheduledTime").style.display = "none";
  }
}

function validateForm() {
  const requiredFields = [
    document.getElementById("name"),
    document.getElementById("email"),
    document.getElementById("phone"),
    document.getElementById("address"),
  ];
  let isValid = true;
  for (let field of requiredFields) {
    if (!field.value.trim()) {
      field.style.borderColor = "red";
      isValid = false;
    } else {
      field.style.borderColor = "#ddd";
    }
  }
  if (!isValid) {
    const firstInvalidField = requiredFields.find(
      (field) => !field.value.trim()
    );
    if (firstInvalidField) firstInvalidField.focus();
  }
  return isValid;
}

document.querySelector(".clear-btn").addEventListener("click", function () {
  // Очистка выбранных блюд
  ORDER_KEYS.forEach((key) => (selectedDishes[key] = ""));
  saveSelectedDishes();

  // Обновление списка и формы
  renderCurrentOrderList();
  renderSelectedDishesInForm();

  // Очистка формы
  document.getElementById("orderForm").reset();

  goToOrderPage();
  resetButtonsInAllCategories();
  localStorage.removeItem(FORM_DATA_KEY);
  localStorage.removeItem("selectedDishes");
});

function validateCombo() {
  const combo = {
    soup: selectedDishes.soup,
    "main-course": selectedDishes["main-course"],
    salad: selectedDishes.salad,
    drink: selectedDishes.drink,
  };
  if (!combo.soup && !combo["main-course"] && !combo.salad && !combo.drink)
    return {
      valid: false,
      msg: "Ничего не выбрано. Выберите блюда для заказа",
    };
  const combos = [
    (c) => c.soup && c["main-course"] && c.salad && c.drink,
    (c) => c.soup && c["main-course"] && c.drink && !c.salad,
    (c) => c.soup && c.salad && c.drink && !c["main-course"],
    (c) => c["main-course"] && c.salad && c.drink && !c.soup,
    (c) => c["main-course"] && c.drink && !c.soup && !c.salad,
  ];
  const match = combos.some((fn) => fn(combo));
  if (!match) {
    if (!combo.drink) return { valid: false, msg: "Выберите напиток" };
    if (combo.soup && !combo["main-course"] && !combo.salad)
      return { valid: false, msg: "Выберите главное блюдо/салат/стартер" };
    if ((combo.salad || combo["main-course"]) && !combo.drink)
      return { valid: false, msg: "Выберите напиток" };
    if (combo.salad && !combo["main-course"] && !combo.soup)
      return { valid: false, msg: "Выберите суп или главное блюдо" };
    if (combo.drink && !combo["main-course"] && !combo.soup && !combo.salad)
      return { valid: false, msg: "Выберите главное блюдо" };
    return {
      valid: false,
      msg: "Соберите корректный ланч: выберите категории как на картинке",
    };
  }
  return { valid: true };
}

function showBigCenterNotify(message) {
  if (document.getElementById("big-notify")) return;
  const notify = document.createElement("div");
  notify.id = "big-notify";
  Object.assign(notify.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(20,27,29,0.22)",
    zIndex: "99999",
  });
  notify.innerHTML = `<div style="
    background: #fff; padding: 38px 38px 26px 38px; border-radius: 24px;
    box-shadow: 0 8px 40px rgba(44,44,72,.14); text-align: center; min-width: 320px; max-width: 93vw;">
      <div style="font-size:1.45em;margin-bottom:18px;">${message}</div>
      <button id="big-ok-btn" style="
        padding: 12px 38px; font-size: 1.1rem; background: #ff7c01; color: #fff; border:none; border-radius:18px;
        transition:.21s">Окей</button>
    </div>`;
  const btn = notify.querySelector("#big-ok-btn");
  btn.onmouseover = () => {
    btn.style.background = "#333";
    btn.style.color = "#ffd6ae";
  };
  btn.onmouseout = () => {
    btn.style.background = "#ff7c01";
    btn.style.color = "#fff";
  };
  btn.onclick = () => {
    notify.remove();
  };
  document.body.appendChild(notify);
}

function renderSelectedDishesInForm() {
  ORDER_KEYS.forEach((key) => {
    const displayBlock = document.getElementById(key);
    if (!displayBlock) return;
    const nameSpan = displayBlock.querySelector(".dish-name");
    if (!nameSpan) return;
    const dish = dishes.find((d) => d.keyword === selectedDishes[key]);
    if (dish) {
      nameSpan.textContent = dish.name;
      nameSpan.style.color = "#ff7c01"; // Выделить выбранное
    } else {
      nameSpan.textContent = key === "main-course" ? "Не выбрано" : "Не выбран";
      nameSpan.style.color = "#777";
    }
  });
}

function goToOrderPage() {
    window.location.href = "my_order.html";
  } 

document.addEventListener("DOMContentLoaded", async () => {
  await loadDishes(); //
  renderCurrentOrderList();
  renderSelectedDishesInForm();

  updateTotalCost();
  loadFormData(); // <-- восстановить данные формы
  setupFormAutosave(); // <-- настройка автосохранения полей

  document.querySelectorAll('input[name="deliveryTime"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      document.getElementById("scheduledTime").style.display =
        this.value === "scheduled" ? "block" : "none";
    });
  });

  function setupFormAutosave() {
    const inputs = [
      "name",
      "email",
      "phone",
      "address",
      "comment",
      "marketing",
      "deliveryTime",
      "deliveryTimeValue",
    ];
    inputs.forEach((id) => {
      const el =
        document.getElementById(id) ||
        document.querySelector(`input[name="${id}"]`);
      if (!el) return;

      if (el.type === "radio" || el.type === "checkbox") {
        document
          .querySelectorAll(`input[name="${el.name}"]`)
          .forEach((radio) => {
            radio.addEventListener("change", saveFormData);
          });
      } else {
        el.addEventListener("input", saveFormData);
      }
    });
  }

  

  document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const comboResult = validateCombo();
    if (!comboResult.valid) {
      showBigCenterNotify(comboResult.msg);
      return;
    }

    // Формирование объекта заказа:
    const orderData = {
      full_name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      subscribe: document.getElementById("marketing").checked ? 1 : 0,
      phone: document.getElementById("phone").value,
      delivery_address: document.getElementById("address").value,
      delivery_type:
        document.querySelector('input[name="deliveryTime"]:checked').value ===
        "scheduled"
          ? "by_time"
          : "now",
      // delivery_time только если by_time
      delivery_time:
        document.querySelector('input[name="deliveryTime"]:checked').value ===
        "scheduled"
          ? document.getElementById("deliveryTime").value
          : undefined,
      soup_id: selectedDishes.soup
        ? getDishIdByKeyword(selectedDishes.soup)
        : undefined,
      main_course_id: selectedDishes["main-course"]
        ? getDishIdByKeyword(selectedDishes["main-course"])
        : undefined,
      salad_id: selectedDishes.salad
        ? getDishIdByKeyword(selectedDishes.salad)
        : undefined,
      drink_id: selectedDishes.drink
        ? getDishIdByKeyword(selectedDishes.drink)
        : undefined,
      dessert_id: selectedDishes.dessert
        ? getDishIdByKeyword(selectedDishes.dessert)
        : undefined,
      comment: document.getElementById("comment").value,
    };

    try {
      const res = await createOrder(orderData);
      if (res && res.id) {
        alert("Заказ успешно создан!");
        // Очистка формы и данных
        localStorage.removeItem(FORM_DATA_KEY);
        localStorage.removeItem("selectedDishes");
        // Дополнительно: перейти на страницу заказов и обновить список заказа
        goToOrdersPage(); // Если у вас есть так называемая функция переключения во вкладку заказов
      } else {
        alert(
          "Ошибка при создании заказа: " + (res.error || "Неизвестная ошибка")
        );
      }
    } catch (err) {
      alert("Ошибка при оформлении заказа");
    }

    const formData = {
      soup: selectedDishes.soup
        ? dishes.find((d) => d.keyword === selectedDishes.soup)?.name
        : "Нет",
      "main-course": selectedDishes["main-course"]
        ? dishes.find((d) => d.keyword === selectedDishes["main-course"])?.name
        : "Нет",
      salad: selectedDishes.salad
        ? dishes.find((d) => d.keyword === selectedDishes.salad)?.name
        : "Нет",
      drink: selectedDishes.drink
        ? dishes.find((d) => d.keyword === selectedDishes.drink)?.name
        : "Нет",
      dessert: selectedDishes.dessert
        ? dishes.find((d) => d.keyword === selectedDishes.dessert)?.name
        : "Нет",
      comment: document.getElementById("comment").value,
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
      deliveryTimeValue:
        document.querySelector('input[name="deliveryTime"]:checked').value ===
        "scheduled"
          ? document.getElementById("deliveryTime").value
          : "Как можно скорее",
      marketing: document.getElementById("marketing").checked ? "Да" : "Нет",
      price: orderTotalSummary(),
    };

    const webAppUrl =
      "https://script.google.com/macros/s/AKfycbyPD52pqw76fUxMnKUZ6ucXZIK1wiMowSwXFGO1ARb_lTwrDdRAPGC3rPcL6t2bmmoKeA/exec";
    const hiddenForm = document.createElement("form");
    hiddenForm.method = "POST";
    hiddenForm.action = webAppUrl;
    hiddenForm.target = "_blank";
    hiddenForm.style.display = "none";
    for (const key in formData) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = formData[key];
      hiddenForm.appendChild(input);
    }
    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
    document.body.removeChild(hiddenForm);

    alert("✅ Заказ успешно оформлен! Данные отправлены в Google Таблицу.");
    localStorage.removeItem(FORM_DATA_KEY);
    localStorage.removeItem("selectedDishes");
    setTimeout(() => window.location.reload(), 1500);
  });
});

function orderTotalSummary() {
  return ORDER_KEYS.reduce((sum, key) => {
    const dish = dishes.find((d) => d.keyword === selectedDishes[key]);
    return sum + (dish ? dish.price : 0);
  }, 0);
}

function formatPhone(input) {
  let cursorPos = input.selectionStart;
  let value = input.value.replace(/\D/g, "");
  if (value.startsWith("7")) {
    value = "8" + value.substring(1);
  } else if (!value.startsWith("8") && value.length > 0) {
    value = "8" + value;
  }
  if (value.length > 11) value = value.substring(0, 11);
  let formattedValue = "";
  for (let i = 0; i < value.length; i++) {
    if (i === 1) formattedValue += "-";
    if (i === 4) formattedValue += "-";
    if (i === 7) formattedValue += "-";
    if (i === 9) formattedValue += "-";
    formattedValue += value[i];
  }
  input.value = formattedValue;
  let addedChars = 0;
  if (cursorPos > 1) addedChars++;
  if (cursorPos > 4) addedChars++;
  if (cursorPos > 7) addedChars++;
  if (cursorPos > 9) addedChars++;
  input.setSelectionRange(cursorPos + addedChars, cursorPos + addedChars);
}

function resetButtonsInAllCategories() {
  document.querySelectorAll(".list").forEach((container) => {
    container.querySelectorAll("button.add-btn").forEach((btn) => {
      btn.textContent = "Добавить";
      btn.classList.remove("added");
      btn.disabled = false;
    });
  });
}
