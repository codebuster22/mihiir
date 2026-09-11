import Clarity from '@microsoft/clarity';

export type AnalyticsPreference = 'granted' | 'denied';

export const consentStorageKey = 'mihiir.analytics.v1';
const denialSessionKey = 'mihiir.analytics.denied.v1';
// The official SDK uses this ID to avoid duplicate script insertion.
const clarityScriptId = 'clarity-script';

const eventNames = [
  'case_study_open',
  'article_end_reached',
  'work_cta_click',
  'booking_open_header',
  'booking_open_home',
  'booking_open_case_study',
  'booking_open_footer',
  'booking_open_practice',
  'chain_labs_open',
] as const;

type AnalyticsEvent = (typeof eventNames)[number];

export function analyticsEnabled() {
  if (typeof window === 'undefined') return false;
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? '';
  return (
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' &&
    /^[a-z0-9]+$/i.test(projectId) &&
    ['mihiir.com', 'www.mihiir.com'].includes(window.location.hostname)
  );
}

export function readAnalyticsPreference(): AnalyticsPreference | null {
  if (typeof window === 'undefined') return null;
  try {
    if (window.sessionStorage.getItem(denialSessionKey) === 'denied')
      return 'denied';
  } catch {
    // Persistent consent can still be read if session storage is unavailable.
  }
  try {
    const preference = JSON.parse(
      window.localStorage.getItem(consentStorageKey) ?? 'null',
    );
    if (
      preference?.version === 1 &&
      ['granted', 'denied'].includes(preference.choice)
    ) {
      return preference.choice as AnalyticsPreference;
    }
  } catch {
    // An unreadable or outdated choice never authorizes analytics.
  }
  return null;
}

export function saveAnalyticsPreference(choice: AnalyticsPreference): boolean {
  try {
    window.localStorage.setItem(
      consentStorageKey,
      JSON.stringify({ version: 1, choice }),
    );
    try {
      window.sessionStorage.removeItem(denialSessionKey);
    } catch {
      /* Optional fallback only. */
    }
    window.dispatchEvent(new Event('mihiir-analytics-preference'));
    return true;
  } catch {
    if (choice === 'denied') {
      try {
        window.sessionStorage.setItem(denialSessionKey, 'denied');
        window.dispatchEvent(new Event('mihiir-analytics-preference'));
        return true;
      } catch {
        /* The caller keeps analytics off when preferences cannot be stored. */
      }
    }
    return false;
  }
}

export function subscribeAnalyticsPreference(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === consentStorageKey || event.key === null) onChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener('mihiir-analytics-preference', onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('mihiir-analytics-preference', onChange);
  };
}

export function clarityHasStarted() {
  return (
    typeof document !== 'undefined' &&
    document.getElementById(clarityScriptId) !== null
  );
}

export function startClarity() {
  if (!analyticsEnabled() || readAnalyticsPreference() !== 'granted') return;
  if (clarityHasStarted()) return;

  Clarity.init(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID!);
  if (!clarityHasStarted()) return;
  // Queue explicit consent in the same task, before the async tracker executes.
  Clarity.consentV2({
    ad_Storage: 'denied',
    analytics_Storage: 'granted',
  });
}

export function denyClarityStorage() {
  if (!clarityHasStarted()) return;
  Clarity.consentV2({
    ad_Storage: 'denied',
    analytics_Storage: 'denied',
  });
}

export function trackAnalyticsEvent(name: string) {
  if (!eventNames.includes(name as AnalyticsEvent)) return;
  if (
    !analyticsEnabled() ||
    readAnalyticsPreference() !== 'granted' ||
    !clarityHasStarted()
  )
    return;
  Clarity.event(name);
}
