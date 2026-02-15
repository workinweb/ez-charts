# PostHog Setup

## Overview

- Install
- Authorized domains
- Configure
- Invite teammates
- Install
- Verify Installation
- Waiting for events
- Search (All, Most popular)

**Integrations:** Web, Mobile, Server | Next.js, HTML snippet, JavaScript web, React, React Native, Android, Angular, Astro, Bubble, Flutter, Framer, iOS, Nuxt.js 3.7+, Remix, Svelte, TanStack Start, Vite, Vue.js, Webflow, Google Tag Manager, Docusaurus, Shopify, Wordpress

## Integrate PostHog with Next.js

[Read the docs](https://posthog.com/docs/libraries/next-js)

### 1. Install the package (required)

Install the PostHog JavaScript library using your package manager:

```bash
npm install posthog-js
```

### 2. Add environment variables (required)

Add your PostHog API key and host to your `.env.local` file and to your hosting provider (e.g. Vercel, Netlify). These values need to start with `NEXT_PUBLIC_` to be accessible on the client-side.

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_cYohc25xnTxBLyvXuAzuGrzGuyTqDpyahm52BPSBYUo
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 3. Initialize PostHog (required)

Choose the integration method based on your Next.js version and router type.

**Next.js 15.3+** | **App router** | **Pages router**

If you're using Next.js 15.3+, you can use `instrumentation-client.ts` for a lightweight, fast integration:

```ts
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2026-01-30',
})
```

**Defaults option:** The `defaults` option automatically configures PostHog with recommended settings for new projects. See [SDK defaults](https://posthog.com/docs) for details.

### 4. Accessing PostHog on the client (recommended)

**Next.js 15.3+** | **App/Pages router**

Once initialized in `instrumentation-client.ts`, import `posthog` from `posthog-js` anywhere and call the methods you need:

```tsx
'use client'

import posthog from 'posthog-js'

export default function CheckoutPage() {
  function handlePurchase() {
    posthog.capture('purchase_completed', { amount: 99 })
  }

  return <button onClick={handlePurchase}>Complete purchase</button>
}
```

### 5. Server-side setup (optional)

To capture events from API routes or server actions, install `posthog-node`:

```bash
npm install posthog-node
```

Then, initialize PostHog in your API route or server action. For the **App router**, you can use PostHog in API routes or server actions. Create a new PostHog client instance for each request, or reuse a singleton instance across requests:

**API route example:**

```ts
import { PostHog } from 'posthog-node'

export async function POST(request: Request) {
  const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  })

  posthog.capture({
    distinctId: 'distinct_id_of_the_user',
    event: 'event_name',
  })

  await posthog.shutdown()
}
```

**Server action example:**

```ts
'use server'

import { PostHog } from 'posthog-node'

export async function myServerAction() {
  const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  })

  posthog.capture({
    distinctId: 'distinct_id_of_the_user',
    event: 'server_action_completed',
  })

  await posthog.shutdown()
}
```

> **Important:** Always call `await posthog.shutdown()` when you're done with the client to ensure all events are flushed before the request completes. For better performance, consider creating a singleton PostHog instance that you reuse across requests.

### 6. Send events (recommended)

Click around and view a couple pages to generate some events. PostHog automatically captures pageviews, clicks, and other interactions for you.

If you'd like, you can also manually capture custom events:

```ts
posthog.capture('my_custom_event', { property: 'value' })
```

## Verify Installation

After setup, check PostHog for incoming events. Events may take a moment to appear (see "Waiting for events" in the PostHog dashboard).
