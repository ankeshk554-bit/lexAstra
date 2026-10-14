// Storage may be unavailable in private browsing or full. Reading must not
// prevent study tools from opening; writes report whether they were retained.
export const storage = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  removeItem(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
  key(index) {
    try {
      return window.localStorage.key(index);
    } catch {
      return null;
    }
  },
  get length() {
    try {
      return window.localStorage.length;
    } catch {
      return 0;
    }
  },
};
