// auth.js
export function initializeAuth() {
    window.Telegram.WebApp.ready();
    const initData = window.Telegram.WebApp.initDataUnsafe;
    const userId = initData?.user?.id;

    const masseurs = {
        "952232290": "Анна",  // Замените на реальные Telegram ID
        //"987654321": "Игорь",
        //"456789123": "Мария"
    };

    const currentMasseur = masseurs[userId] || null;
    if (!currentMasseur) {
        window.Telegram.WebApp.showAlert("У вас нет доступа к управлению записями.");
    }

    return currentMasseur;
}