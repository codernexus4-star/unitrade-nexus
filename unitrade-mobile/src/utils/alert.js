import { CustomAlert } from '../components/CustomAlert';

/**
 * Show a custom alert with UniTrade branding
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Array of button objects
 * @param {Object} options - Additional options (type, cancelable)
 */
export const showAlert = (title, message, buttons = [], options = {}) => {
  CustomAlert.alert(title, message, buttons, options);
};

/**
 * Show a success alert
 */
export const showSuccess = (title, message, onPress) => {
  CustomAlert.show({
    type: 'success',
    title,
    message,
    buttons: [{ text: 'OK', onPress }],
  });
};

/**
 * Show an error alert
 */
export const showError = (title, message, onPress) => {
  CustomAlert.show({
    type: 'error',
    title,
    message,
    buttons: [{ text: 'OK', onPress }],
  });
};

/**
 * Show a warning alert
 */
export const showWarning = (title, message, onPress) => {
  CustomAlert.show({
    type: 'warning',
    title,
    message,
    buttons: [{ text: 'OK', onPress }],
  });
};

/**
 * Show an info alert
 */
export const showInfo = (title, message, onPress) => {
  CustomAlert.show({
    type: 'info',
    title,
    message,
    buttons: [{ text: 'OK', onPress }],
  });
};

/**
 * Show a confirmation alert
 */
export const showConfirm = (title, message, onConfirm, onCancel) => {
  CustomAlert.show({
    type: 'confirm',
    title,
    message,
    buttons: [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Confirm', onPress: onConfirm },
    ],
    cancelable: false,
  });
};

/**
 * Show a destructive confirmation alert (e.g., delete, logout)
 */
export const showDestructiveConfirm = (title, message, confirmText, onConfirm, onCancel) => {
  CustomAlert.show({
    type: 'warning',
    title,
    message,
    buttons: [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: confirmText || 'Delete', style: 'destructive', onPress: onConfirm },
    ],
    cancelable: false,
  });
};
