// bookings.js
let bookings = {};

const workHours = Array.from({ length: 10 }, (_, i) => `${i + 9}:00`); // 9:00 - 18:00

export function getMasseurBookings(date, masseur) {
    return bookings[date]?.[masseur] || [];
}

export function bookSlot(date, masseur, hour) {
    if (!bookings[date]) bookings[date] = {};
    if (!bookings[date][masseur]) bookings[date][masseur] = [];
    bookings[date][masseur].push(hour);
    window.Telegram.WebApp.showAlert(`Записано: ${hour}, ${date}`);
}

export function removeSlot(date, masseur, hour) {
    if (bookings[date]?.[masseur]) {
        bookings[date][masseur] = bookings[date][masseur].filter(h => h !== hour);
        if (bookings[date][masseur].length === 0) delete bookings[date][masseur];
        if (Object.keys(bookings[date]).length === 0) delete bookings[date];
        window.Telegram.WebApp.showAlert(`Удалено: ${hour}, ${date}`);
    }
}