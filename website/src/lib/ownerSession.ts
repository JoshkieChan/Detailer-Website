const OWNER_SESSION_STORAGE_KEY = 'signalsource_owner_mode';
const OWNER_SESSION_FLAG_KEY = 'signalsource_owner_session';

export const getStoredOwnerPasscode = () =>
  sessionStorage.getItem(OWNER_SESSION_STORAGE_KEY) || '';

export const clearStoredOwnerPasscode = () => {
  sessionStorage.removeItem(OWNER_SESSION_STORAGE_KEY);
  sessionStorage.removeItem(OWNER_SESSION_FLAG_KEY);
};

export const storeOwnerPasscode = (value: string) => {
  sessionStorage.setItem(OWNER_SESSION_STORAGE_KEY, value);
  sessionStorage.setItem(OWNER_SESSION_FLAG_KEY, 'true');
};
