Telegram.WebApp.ready();
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

const today = new Date().toISOString().split("T")[0];
document.getElementById("time").setAttribute("min", today + "T00:00");
document.getElementById("time").setAttribute("max", today + "T23:59");

function addNewAppointment() {
  const clientName = document.getElementById("clientName").value;
  const clientPhone = document.getElementById("clientPhone").value;
  const serviceDescription = document.getElementById("serviceDescription").value;
  const cost = parseInt(document.getElementById("cost").value);
  const timeInput = document.getElementById("time").value;

  if (!clientName || !clientPhone || !serviceDescription || !cost || !timeInput) {
    Telegram.WebApp.showAlert("Заполните все поля!");
    return;
  }

  const time = `${today} ${timeInput}`;
  const appointment = {
    id: Date.now(),
    clientName,
    clientPhone,
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
  document.getElementById("clientPhone").value = "";
  document.getElementById("serviceDescription").value = "";
  document.getElementById("cost").value = "";
  document.getElementById("time").value = "";
}

function updateAppointmentsList() {
  const list = document.getElementById("appointments");
  list.innerHTML = appointments.map(app => 
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
  const today = new Date().toISOString().split("T")[0];
  const earnings = appointments
    .filter(app => app.time.startsWith(today) && app.completed && app.paid)
    .reduce((sum, app) => sum + app.cost, 0);
  Telegram.WebApp.showAlert(`Заработок за день: ${earnings} руб.`);
}

updateAppointmentsList();
