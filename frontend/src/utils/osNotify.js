export const requestOsNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};

export const fireOsNotification = (title, options = {}) => {
  if (
    "Notification" in window &&
    Notification.permission === "granted" &&
    document.visibilityState !== "visible" 
  ) {
    const notification = new Notification(title, {
      icon: '/vite.svg',
      ...options,
    });
    
    notification.onclick = function () {
      window.focus();
      this.close();
    };
  }
};