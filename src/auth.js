export const DEFAULT_USER = {
  username: 'arjun',
  password: 'Fieldwise@2026',
};

const USERS_KEY = 'fieldwise_users';
const SESSION_KEY = 'fieldwise_session';
const REMEMBERED_USERNAME_KEY = 'fieldwise_remembered_username';

function readUsers() {
  try {
    const users = JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]');
    return Array.isArray(users) ? users : [];
  } catch { return []; }
}

function saveSession(user) {
  const session = { username: user.username, fullName: user.fullName || user.username };
  try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
  catch { return { ok: false, error: 'storage' }; }
  return { ok: true, user: session };
}

export function login(username, password) {
  const cleanedUsername = String(username || '').trim();
  if (!cleanedUsername) return { ok: false, error: 'username-required' };
  if (!password) return { ok: false, error: 'password-required' };

  const normalizedUsername = cleanedUsername.toLocaleLowerCase();
  let user = null;
  if (normalizedUsername === DEFAULT_USER.username.toLocaleLowerCase() && password === DEFAULT_USER.password) {
    user = { username: DEFAULT_USER.username, fullName: 'Arjun Singh' };
  } else {
    user = readUsers().find(account => account.username?.trim().toLocaleLowerCase() === normalizedUsername && account.password === password) || null;
  }
  if (!user) return { ok: false, error: 'invalid-credentials' };
  return saveSession(user);
}

export function signup(data) {
  const fullName = String(data.fullName || '').trim();
  const username = String(data.username || '').trim();
  const password = String(data.password || '');
  const confirmPassword = String(data.confirmPassword || '');
  if (!fullName || !username || !password || !confirmPassword) return { ok: false, error: 'required' };
  if (password.length < 8) return { ok: false, error: 'password-short' };
  if (password !== confirmPassword) return { ok: false, error: 'password-mismatch' };
  const taken = username.toLocaleLowerCase() === DEFAULT_USER.username.toLocaleLowerCase() || readUsers().some(account => account.username?.trim().toLocaleLowerCase() === username.toLocaleLowerCase());
  if (taken) return { ok: false, error: 'username-taken' };
  const user = { username, fullName, password };
  try { window.localStorage.setItem(USERS_KEY, JSON.stringify([...readUsers(), user])); }
  catch { return { ok: false, error: 'storage' }; }
  return saveSession(user);
}

export function getSessionUser() {
  try {
    const session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
    return session?.username ? { username: session.username, fullName: session.fullName || session.username } : null;
  } catch { return null; }
}

export function isAuthenticated() { return Boolean(getSessionUser()); }

export function logout() {
  try { window.localStorage.removeItem(SESSION_KEY); } catch { /* Session state is still cleared in memory. */ }
}

export function getRememberedUsername() {
  try { return window.localStorage.getItem(REMEMBERED_USERNAME_KEY) || ''; }
  catch { return ''; }
}

export function setRememberedUsername(username, remember) {
  try {
    if (remember) window.localStorage.setItem(REMEMBERED_USERNAME_KEY, String(username || '').trim());
    else window.localStorage.removeItem(REMEMBERED_USERNAME_KEY);
  } catch { /* Remember-me is optional. */ }
}
