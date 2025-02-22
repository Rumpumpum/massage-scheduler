window.Telegram.WebApp.ready();
const initData = window.Telegram.WebApp.initDataUnsafe;
const userId = initData?.user?.id;
console.log("User ID:", userId);

const masseurs = {
    "952232290": "Анна",    // Ваш Telegram ID
    "7778239709": "Игорь",
    "6698523521": "Мария"
};
const currentMasseur = masseurs[userId] || null;
console.log("Current Masseur:", currentMasseur);
if (!currentMasseur) {
    window.Telegram.WebApp.showAlert("У вас нет доступа к управлению записями.");
}

const workHours = Array.from({ length: 10 }, (_, i) => `${i + 9}:00`);
let bookings = {};

async function loadBookings() {
    try {
        const response = await fetch('https://your-app-name.onrender.com/bookings'); // Ваш URL
        bookings = await response.json();
        console.log("Bookings loaded:", bookings);
    } catch (error) {
        console.error("Failed to load bookings:", error);
        window.Telegram.WebApp.showAlert("Ошибка загрузки данных с сервера");
    }
}

async function bookSlot(date, masseur, hour) {
    try {
        await fetch('https://your-app-name.onrender.com/book', { // Ваш URL
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, masseur, hour })
        });
        await loadBookings();
        window.Telegram.WebApp.showAlert(`Записано: ${hour}, ${date}`);
    } catch (error) {
        console.error("Failed to book slot:", error);
    }
}

async function removeSlot(date, masseur, hour) {
    try {
        await fetch('https://your-app-name.onrender.com/remove', { // Ваш URL
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, masseur, hour })
        });
        await loadBookings();
        window.Telegram.WebApp.showAlert(`Удалено: ${hour}, ${date}`);
    } catch (error) {
        console.error("Failed to remove slot:", error);
    }
}

// Новая функция: получить все занятые часы для даты
function getAllBookedHours(date) {
    const dayBookings = bookings[date] || {};
    const allHours = [];
    for (const masseur in dayBookings) {
        allHours.push(...dayBookings[masseur]);
    }
    return allHours;
}

// Проверяем, забронировал ли текущий массажист конкретный час
function isBookedByCurrentMasseur(date, hour) {
    return bookings[date]?.[currentMasseur]?.includes(hour) || false;
}

function generateCalendar() {
    console.log("Generating calendar");
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

    const allBookedHours = getAllBookedHours(date); // Все занятые часы всеми массажистами
    workHours.forEach(hour => {
        const slot = document.createElement("div");
        slot.classList.add("slot");
        const isBusy = allBookedHours.includes(hour); // Занят ли час кем-то
        const isMine = isBookedByCurrentMasseur(date, hour); // Занят ли мной
        slot.classList.add(isBusy ? "busy" : "free");
        slot.textContent = `${hour} - ${isBusy ? "Занято" : "Свободно"} ${isMine ? "(моё)" : ""}`;

        if (!isBusy) {
            slot.addEventListener("click", async () => {
                await bookSlot(date, currentMasseur, hour);
                showSchedule(year, month, day);
            });
        } else if (isMine) { // Разрешить удаление только своих записей
            slot.addEventListener("click", async () => {
                await removeSlot(date, currentMasseur, hour);
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

loadBookings().then(() => generateCalendar());
