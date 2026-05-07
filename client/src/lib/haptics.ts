/**
 * Per-action haptic patterns. iOS Safari ignores `vibrate`, but Android Chrome
 * and PWAs installed to home screen pick it up. Patterns intentionally distinct
 * so muscle memory differentiates select / confirm / fail.
 */

function safeVibrate(pattern: number | number[]) {
  if (typeof window === "undefined") return;
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* noop */
  }
}

/** Light tap — selection, navigation, step changes. */
export function hapticTap() {
  safeVibrate(6);
}

/** Double-pulse — successful confirmation. */
export function hapticSuccess() {
  safeVibrate([12, 40, 12]);
}

/** Sharp triple — disabled action / validation error. */
export function hapticWarning() {
  safeVibrate([4, 30, 4, 30, 4]);
}
