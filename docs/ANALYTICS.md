# Clarity integration

The consent-gated integration uses the official `@microsoft/clarity` package, pinned to 1.0.2, through `components/analytics/consent.tsx` and `lib/analytics.ts`. The integration remains off until the mihiir.com Clarity project's public ID and production toggle are configured. Live dashboard delivery has not been verified yet.

## Configuration

Use NEXT_PUBLIC_CLARITY_PROJECT_ID and NEXT_PUBLIC_ANALYTICS_ENABLED=true on the production Vercel environment. Leave tracking off on localhost and previews. Never hard-code a fabricated project ID. The project ID is public and requires no secret token.

## Consent behavior

Importing the package does not start tracking. Do not call `Clarity.init` before explicit acceptance. Unknown and declined preferences mean no Clarity requests. Persist a versioned local preference. On acceptance, initialize and queue consent synchronously in the same task, before the asynchronously loaded tracker can execute:

```js
Clarity.init(projectId);
Clarity.consentV2({
  ad_Storage: 'denied',
  analytics_Storage: 'granted',
});
```

The SDK inserts `https://www.clarity.ms/tag/PROJECT_ID?ref=npm` asynchronously once with the ID `clarity-script`. The site checks this ID before initialization and before events, including when the SDK silently fails to insert its script. Keep advertising storage denied. In the Clarity project, configure cookies to require an explicit consent signal.

On withdrawal, persist denied, signal both Consent V2 values denied, and reload without loading the script again. Denied Consent V2 alone can continue cookieless collection; removing an already-executed script element does not stop its runtime. Keep Analytics preferences available from the footer.

## Funnel events

Use fixed names without personal data or arbitrary query strings:

- `case_study_open`
- `article_end_reached` (means the end marker was reached, not proof of reading)
- `work_cta_click`
- `booking_open_header`, `booking_open_home`, `booking_open_case_study`, `booking_open_footer`, `booking_open_practice`
- `chain_labs_open`

Events use `Clarity.event(eventName)`, with no properties argument. The SDK forwards them to `window.clarity('event', eventName)`. Session tags use `Clarity.setTag(key, value)`; they accumulate at session scope and are not per-event properties. Do not replay interactions that occurred before consent.

Configure ordered funnels in the dashboard after events appear: homepage → case study → booking; writing → work → booking. External booking clicks measure intent, not a completed booking. Conversion improvement is a hypothesis to evaluate after launch.

The [entry-page funnel plan](./FUNNEL-PLAN.md) also includes direct search entry into a practice page or a case, where booking may happen without Home. Track reading continuity separately from commercial progression. Cold emails NEVER include links or URLs, so there is no email-click event or campaign-link attribution to implement. An independent name search followed by an email reply may have unknown attribution. Reconcile actual bookings and conversations through confirmed booking records or a manual lead log; do not equate a click with either outcome. No distribution baseline or numerical conversion target is established.

## Verification

Eight automated analytics tests exercise the installed SDK in an isolated browser environment: server rendering, host/config gates, consent, storage failure, single insertion, failed insertion, fixed event names and withdrawal. The privacy page and footer preferences are implemented. After creating the production Clarity project, verify real network requests and dashboard events for fresh, declined, accepted, navigated, withdrawn/reloaded and returning states. A booking click is recorded as intent, never as a completed call.

## Primary sources

- https://www.npmjs.com/package/@microsoft/clarity
- https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup
- https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2
- https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api
- https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-mode
- https://learn.microsoft.com/en-us/clarity/setup-and-installation/funnels
- https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure
