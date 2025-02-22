Telegram.WebApp.ready();
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
let selectedDate = null;

// Установка текущей даты по умолчанию
const today = new Date().toISOString().split("T")[0];
document.getElementById("selectedDate").value = today;

function loadDay() {
  selectedDate = document.getElementById("selectedDate").value;
  if (!selectedDate) {
    Telegram.WebApp.showAlert("Выберите дату!");
    return;
  }
  document.getElementById("dayContent").style.display = "block";
  document.getElementById("time").setAttribute("min", "00:00");
  document.getElementById("time").setAttribute("max", "23:59");
  updateAppointmentsList();
}

function addNewAppointment() {
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
  appointments.push(appointment);
  localStorage.setItem("appointments", JSON.stringify(appointments));
  updateAppointmentsList();
  clearForm();
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
      <button onclick="markCompleted(${app.id})">${app.completed ? "✅" : "Выполнено"}</button>
      <button onclick="markPaid(${app.id})">${app.paid ? "💰" : "Оплачено"}</button>
    </div>`
  ).join("");
}

function markCompleted(id) {
  const app = appointments.find(a => a.id === id);
  app.completed = !app.completed;
  localStorage.setItem("appointments", JSON.stringify(appointments));
  updateAppointmentsList();
}

function markPaid(id) {
  const app = appointments.find(a => a.id === id);
  app.paid = !app.paid;
  localStorage.setItem("appointments", JSON.stringify(appointments));
  updateAppointmentsList();
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

// Инициализация
loadDay();
