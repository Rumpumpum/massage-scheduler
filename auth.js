// auth.js
export function initializeAuth() {
    window.Telegram.WebApp.ready();
    const initData = window.Telegram.WebApp.initDataUnsafe;
    const userId = initData?.user?.id;

    const masseurs = {
        "952232290": "Анна",    // Замените "ВАШ_ID" на ваш Telegram ID (число, например, "123456789")
        "0": "Игорь",
        "1": "Мария"
    };

    const currentMasseur = masseurs[userId] || null;
    if (!currentMasseur) {
        window.Telegram.WebApp.showAlert("У вас нет доступа к управлению записями.");
    }

    return currentMasseur;
}