let dishes = [];

let selectedDishes = JSON.parse(localStorage.getItem("selectedDishes")) || {
  soup: "",
  "main-course": "",
  salad: "",
  drink: "",
  dessert: "",
};

function saveSelectedDishes() {
  localStorage.setItem("selectedDishes", JSON.stringify(selectedDishes));
}

const API_KEY = 'bc116b78-5671-4c27-82e8-386b5c51265d';
const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/';

async function loadDishes() {
  try {
    const response = await fetch(
      `${API_URL}dishes?api_key=${API_KEY}`
    );
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    dishes = await response.json();
  } catch (error) {
    console.error("Ошибка загрузки блюд:", error);
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

function displayDishesForCategory(category, kind, container) {
  container.innerHTML = "";
  let filtered = dishes.filter((d) => d.category === category);
  if (kind) filtered = filtered.filter((d) => d.kind === kind);
  filtered.sort((a, b) => a.name.localeCompare(b.name));
  filtered.forEach((dish) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-dish", dish.keyword);
    card.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}" />
      <div class="text_div">
        <p>${dish.price}₽</p>
        <p>${dish.name}</p>
        <br><br>
        <p>${dish.count}</p>
      </div>
      <button type="button" class="add-btn">${
        selectedDishes[category] === dish.keyword ? "Добавлено" : "Добавить"
      }</button>
    `;

    const btn = card.querySelector("button.add-btn");

    if (selectedDishes[category] === dish.keyword) {
      btn.classList.add("added");
    }

    btn.addEventListener("click", () => {
      if (btn.classList.contains("added")) {
        btn.textContent = "Добавить";
        btn.classList.remove("added");
        selectedDishes[category] = "";
        saveSelectedDishes();
        updateOrderText();
      } else {
        container.querySelectorAll("button.add-btn").forEach((b) => {
          b.textContent = "Добавить";
          b.classList.remove("added");
        });
        btn.textContent = "Добавлено";
        btn.classList.add("added");
        selectedDishes[category] = dish.keyword;
        saveSelectedDishes();
        updateOrderText();
        showToast({
          message: `<div style="font-size:1.1em"> Блюдо <b> ${
            dish.name
          }</b> из категории "<b>${getCategoryName(
            category
          )}</b>" успешно добавлено!</div>`,
          type: "success",
        });
      }
    });
    container.appendChild(card);
  });
}

function setupFilters() {
  document.querySelectorAll(".filters").forEach((filterBlock) => {
    const category = filterBlock.getAttribute("data-category");
    const buttons = filterBlock.querySelectorAll(".filter-btn");
    const section = filterBlock.closest("section");
    const list = section.querySelector(".list");

    buttons.forEach((btn) => {
      btn.addEventListener("click", function () {
        if (this.classList.contains("active")) {
          this.classList.remove("active");
          displayDishesForCategory(category, null, list);
          return;
        }
        buttons.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        displayDishesForCategory(category, this.dataset.kind, list);
      });
    });
  });
}

function renderAllCategories() {
  document.querySelectorAll(".filters").forEach((filterBlock) => {
    const category = filterBlock.getAttribute("data-category");
    const section = filterBlock.closest("section");
    const list = section.querySelector(".list");
    displayDishesForCategory(category, null, list);
  });
}

function updateOrderCost() {
  let total = 0;
  Object.values(selectedDishes).forEach((keyword) => {
    if (keyword) {
      const dish = dishes.find((d) => d.keyword === keyword);
      if (dish) total += dish.price;
    }
  });
  return total;
}

function updateOrderText() {
  const total = updateOrderCost();
  const orderTotalText = document.getElementById("order-total-text");
  const goToOrderBtn = document.getElementById("go-to-order");
  if (!orderTotalText) return;

  const isMobile = window.matchMedia("(max-width: 480px)").matches;
  if (isMobile) {
    orderTotalText.textContent = `Стоимость: ${total}₽`;
    goToOrderBtn.innerHTML = `Оформить &rarr;`;
  } else {
    orderTotalText.textContent = `Стоимость заказа: ${total}₽`;
    goToOrderBtn.innerHTML = `Перейти к оформлению &rarr;`;
  }
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

document.addEventListener("DOMContentLoaded", async () => {
  await loadDishes();
  setupFilters();
  renderAllCategories();
  updateOrderText();
  window.addEventListener("resize", updateOrderText);
});

document.querySelectorAll(".combo-item").forEach((btn) => {
  btn.addEventListener("click", function () {
    const id = this.getAttribute("data-jump");
    const sec = document.querySelector(
      `section .filters[data-category="${id}"]`
    );
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  });
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

// Обработчик клика по кнопке "Перейти к оформлению"
document.getElementById("go-to-order").addEventListener("click", function (e) {
  e.preventDefault();
  const comboResult = validateCombo();
  if (!comboResult.valid) {
    showBigCenterNotify(comboResult.msg);
    return;
  }
  window.location.href = "order.html";
});
