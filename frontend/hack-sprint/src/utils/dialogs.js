// Promise-based replacements for window.confirm / window.prompt. The dialogs
// themselves are drawn by <DialogHost /> (mounted once in App), so actions get
// an on-page dialog that matches the site instead of a browser pop-up.
let host = null;

export const registerDialogHost = (fn) => {
  host = fn;
  return () => { if (host === fn) host = null; };
};

const open = (config) =>
  new Promise((resolve) => {
    if (!host) { resolve(config.kind === "choose" ? null : config.kind === "text" ? null : false); return; }
    host({ ...config, resolve });
  });

// → true / false
export const confirmAction = ({ title = "Are you sure?", message = "", confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false } = {}) =>
  open({ kind: "confirm", title, message, confirmLabel, cancelLabel, danger });

// → the chosen option's value, or null if dismissed
export const chooseOption = ({ title, message = "", options }) => open({ kind: "choose", title, message, options });

// → the entered string, or null if cancelled
export const askText = ({ title, message = "", label = "", initial = "", placeholder = "", confirmLabel = "Save" }) =>
  open({ kind: "text", title, message, label, initial, placeholder, confirmLabel });
