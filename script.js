// script.js
import { initializeAuth } from './auth.js';
import { getMasseurBookings, bookSlot, removeSlot, workHours } from './bookings.js';

const currentMasseur = initializeAuth();

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

function showSchedule(year, month, day) {
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
            slot.addEventListener("click", () => {
                bookSlot(date, currentMasseur, hour);
                showSchedule(year, month, day);
            });
        } else {
            slot.addEventListener("click", () => {
                removeSlot(date, currentMasseur, hour);
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

// Инициализация
generateCalendar();