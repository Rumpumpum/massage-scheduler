window.Telegram.WebApp.ready();
const initData = window.Telegram.WebApp.initDataUnsafe;
const userId = initData?.user?.id;

const masseurs = {
    "ВАШ_ID": "Анна",    // Ваш Telegram ID
    "987654321": "Игорь",
    "456789123": "Мария"
};
const currentMasseur = masseurs[userId] || null;
if (!currentMasseur) {
    window.Telegram.WebApp.showAlert("У вас нет доступа к управлению записями.");
}

const workHours = Array.from({ length: 10 }, (_, i) => `${i + 9}:00`);
let bookings = {};

// Загрузка данных с сервера
async function loadBookings() {
    const response = await fetch('https://massage-scheduler-server.onrender.com/bookings');
    bookings = await response.json();
}

async function bookSlot(date, masseur, hour) {
    await fetch('https://massage-scheduler-server.onrender.com/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, masseur, hour })
    });
    await loadBookings();
    window.Telegram.WebApp.showAlert(`Записано: ${hour}, ${date}`);
}

async function removeSlot(date, masseur, hour) {
    await fetch('https://massage-scheduler-server.onrender.com/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, masseur, hour })
    });
    await loadBookings();
    window.Telegram.WebApp.showAlert(`Удалено: ${hour}, ${date}`);
}

function getMasseurBookings(date, masseur) {
    return bookings[date]?.[masseur] || [];
}

function generateCalendar() {
    const calendar = document.getElementById("calendar");
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendar.innerHTML = "";
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement("div");
        day.classList.add("day");
        day.textContent = i;
        day.addEventListener("click", () => showSchedule(year, month, i));
        calendar.appendChild(day);
    }
}

async function showSchedule(year, month, day) {
    if (!currentMasseur) return;

    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    document.getElementById("calendar").style.display = "none";
    document.getElementById("schedule").style.display = "block";
    document.getElementById("selected-date").textContent = date;

    const slots = document.getElementById("slots");
    slots.innerHTML = "";

    const masseurSlots = getMasseurBookings(date, currentMasseur);
    workHours.forEach(hour => {
        const slot = document.createElement("div");
        slot.classList.add("slot");
        const isBusy = masseurSlots.includes(hour);
        slot.classList.add(isBusy ? "busy" : "free");
        slot.textContent = `${hour} - ${isBusy ? "Занято" : "Свободно"}`;

        if (!isBusy) {
            slot.addEventListener("click", async () => {
                await bookSlot(date, currentMasseur, hour);
                showSchedule(year, month, day);
            });
        } else {
            slot.addEventListener("click", async () => {
                await removeSlot(date, masseur, hour);
                showSchedule(year, month, day);
            });
        }
        slots.appendChild(slot);
    });
}

document.getElementById("back-to-calendar").addEventListener("click", () => {
    document.getElementById("schedule").style.display = "none";
    document.getElementById("calendar").style.display = "grid";
});

// Инициализация с загрузкой данных
loadBookings().then(() => generateCalendar());