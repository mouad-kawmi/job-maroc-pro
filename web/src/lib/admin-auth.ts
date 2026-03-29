import crypto from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_COOKIE_NAME = 'jb_admin_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;
const LOGIN_WINDOW_MS = 1000 * 60 * 15;
const LOGIN_LOCKOUT_MS = 1000 * 60 * 15;
const MAX_LOGIN_ATTEMPTS = 5;
const FAILED_LOGIN_DELAY_MS = 800;
const loginAttempts = new Map<
  string,
  {
    count: number;
    windowStartedAt: number;
    blockedUntil: number;
  }
>();

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || '';
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

function getSigningSecret(password: string): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() || password;
}

function createSignature(payload: string, signingSecret: string): string {
  return crypto
    .createHmac('sha256', signingSecret)
    .update(payload)
    .digest('hex');
}

function buildSessionToken(password: string): string {
  const signingSecret = getSigningSecret(password);
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_DURATION_MS }),
  ).toString('base64url');

  return `${payload}.${createSignature(payload, signingSecret)}`;
}

function isSessionValid(token: string, password: string): boolean {
  const signingSecret = getSigningSecret(password);
  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = createSignature(payload, signingSecret);

  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as {
      exp?: number;
    };

    return typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

async function getClientKey(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor = headerStore
    .get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim() || '';
  const realIp = headerStore.get('x-real-ip')?.trim() || '';
  const userAgent = headerStore.get('user-agent')?.trim() || '';

  return crypto
    .createHash('sha256')
    .update(`${forwardedFor}|${realIp}|${userAgent}`)
    .digest('hex');
}

function getAttemptState(clientKey: string) {
  const now = Date.now();
  const state = loginAttempts.get(clientKey);

  if (!state) {
    return {
      count: 0,
      windowStartedAt: now,
      blockedUntil: 0,
    };
  }

  if (state.blockedUntil > 0 && state.blockedUntil <= now) {
    loginAttempts.delete(clientKey);
    return {
      count: 0,
      windowStartedAt: now,
      blockedUntil: 0,
    };
  }

  if (now - state.windowStartedAt > LOGIN_WINDOW_MS && state.blockedUntil === 0) {
    loginAttempts.delete(clientKey);
    return {
      count: 0,
      windowStartedAt: now,
      blockedUntil: 0,
    };
  }

  return state;
}

function isLoginBlocked(clientKey: string): boolean {
  return getAttemptState(clientKey).blockedUntil > Date.now();
}

function registerFailedAttempt(clientKey: string): void {
  const now = Date.now();
  const state = getAttemptState(clientKey);
  const nextCount = state.count + 1;
  const isBlocked = nextCount >= MAX_LOGIN_ATTEMPTS;

  loginAttempts.set(clientKey, {
    count: isBlocked ? 0 : nextCount,
    windowStartedAt:
      now - state.windowStartedAt > LOGIN_WINDOW_MS ? now : state.windowStartedAt,
    blockedUntil: isBlocked ? now + LOGIN_LOCKOUT_MS : 0,
  });
}

function clearFailedAttempts(clientKey: string): void {
  loginAttempts.delete(clientKey);
}

async function delayFailedLogin(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, FAILED_LOGIN_DELAY_MS);
  });
}

export function isAdminPasswordConfigured(): boolean {
  return getAdminPassword().length > 0;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const password = getAdminPassword();

  if (!password) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return token ? isSessionValid(token, password) : false;
}

export async function loginAdmin(
  passwordInput: string,
): Promise<'ok' | 'missing' | 'invalid' | 'locked'> {
  const password = getAdminPassword();

  if (!password) {
    return 'missing';
  }

  const clientKey = await getClientKey();

  if (isLoginBlocked(clientKey)) {
    await delayFailedLogin();
    return 'locked';
  }

  if (!safeEqual(passwordInput, password)) {
    registerFailedAttempt(clientKey);
    await delayFailedLogin();
    return 'invalid';
  }

  clearFailedAttempts(clientKey);

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, buildSessionToken(password), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    priority: 'high',
  });

  return 'ok';
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
    priority: 'high',
  });
}

export async function requireAdminAuth(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }
}
