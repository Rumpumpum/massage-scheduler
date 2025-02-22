Telegram.WebApp.ready();
let appointments = [];
let selectedDate = null;

const SERVER_URL = 'https://massage-scheduler-server.onrender.com'; // Замените на ваш URL сервера Render
const userId = Telegram.WebApp.initDataUnsafe.user?.id; // Получаем Telegram ID пользователя

const today = new Date().toISOString().split("T")[0];
document.getElementById("selectedDate").value = today;

loadDay();

function loadDay() {
  selectedDate = document.getElementById("selectedDate").value;
  if (!selectedDate) {
    Telegram.WebApp.showAlert("Выберите дату!");
    return;
  }
  document.getElementById("dayContent").style.display = "block";
  document.getElementById("time").setAttribute("min", "00:00");
  document.getElementById("time").setAttribute("max", "23:59");
  fetchAppointments();
}

async function fetchAppointments() {
  const response = await fetch(`${SERVER_URL}/appointments`, {
    headers: { 'X-Telegram-User-ID': userId }
  });
  appointments = await response.json();
  updateAppointmentsList();
}

async function addNewAppointment() {
  const clientName = document.getElementById("clientName").value;
  const serviceDescription = document.getElementById("serviceDescription").value;
  const cost = parseInt(document.getElementById("cost").value);
  const timeInput = document.getElementById("time").value;

  if (!clientName || !serviceDescription || !cost || !timeInput) {
    Telegram.WebApp.showAlert("Заполните все поля!");
    return;
  }

  const time = `${selectedDate} ${timeInput}`;
  const appointment = {
    id: Date.now(),
    clientName,
    serviceDescription,
    cost,
    time,
    completed: false,
    paid: false
  };

  const response = await fetch(`${SERVER_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-User-ID': userId
    },
    body: JSON.stringify(appointment)
  });

  if (response.ok) {
    fetchAppointments();
    clearForm();
  }
}

function clearForm() {
  document.getElementById("clientName").value = "";
  document.getElementById("serviceDescription").value = "";
  document.getElementById("cost").value = "";
  document.getElementById("time").value = "";
}

function updateAppointmentsList() {
  if (!selectedDate) return;
  const list = document.getElementById("appointments");
  const dayAppointments = appointments.filter(app => app.time.startsWith(selectedDate));
  list.innerHTML = dayAppointments.map(app => 
    `<div>
      ${app.clientName} - ${app.serviceDescription} - ${app.cost} руб - ${app.time.split(" ")[1]}
      <button onclick="toggleCompleted(${app.id})">${app.completed ? "✅" : "Выполнено"}</button>
      <button onclick="togglePaid(${app.id})">${app.paid ? "💰" : "Оплачено"}</button>
      <button onclick="editAppointment(${app.id})">Редактировать</button>
      <button onclick="deleteAppointment(${app.id})">Удалить</button>
    </div>`
  ).join("");
}

async function toggleCompleted(id) {
  const app = appointments.find(a => a.id === id);
  app.completed = !app.completed;
  await fetch(`${SERVER_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-User-ID': userId
    },
    body: JSON.stringify(app)
  });
  fetchAppointments();
}

async function togglePaid(id) {
  const app = appointments.find(a => a.id === id);
  app.paid = !app.paid;
  await fetch(`${SERVER_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-User-ID': userId
    },
    body: JSON.stringify(app)
  });
  fetchAppointments();
}

function editAppointment(id) {
  const app = appointments.find(a => a.id === id);
  document.getElementById("clientName").value = app.clientName;
  document.getElementById("serviceDescription").value = app.serviceDescription;
  document.getElementById("cost").value = app.cost;
  document.getElementById("time").value = app.time.split(" ")[1];
  deleteAppointment(id);
  Telegram.WebApp.showAlert("Измените данные и нажмите 'Добавить'");
}

async function deleteAppointment(id) {
  await fetch(`${SERVER_URL}/appointments/${id}`, {
    method: 'DELETE',
    headers: { 'X-Telegram-User-ID': userId }
  });
  fetchAppointments();
}

function showDailyEarnings() {
  if (!selectedDate) {
    Telegram.WebApp.showAlert("Выберите дату!");
    return;
  }
  const dayAppointments = appointments.filter(app => 
    app.time.startsWith(selectedDate) && app.completed && app.paid
  );
  const earnings = dayAppointments.reduce((sum, app) => sum + app.cost, 0);
  Telegram.WebApp.showAlert(`Заработок за ${selectedDate}: ${earnings} руб.`);
}

function showPeriodEarnings() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!startDate || !endDate) {
    Telegram.WebApp.showAlert("Укажите обе даты!");
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    Telegram.WebApp.showAlert("Дата начала не может быть позже даты конца!");
    return;
  }

  const periodAppointments = appointments.filter(app => {
    const appDate = app.time.split(" ")[0];
    return appDate >= startDate && appDate <= endDate && app.completed && app.paid;
  });
  const earnings = periodAppointments.reduce((sum, app) => sum + app.cost, 0);
  Telegram.WebApp.showAlert(`Доход с ${startDate} по ${endDate}: ${earnings} руб.`);
}
