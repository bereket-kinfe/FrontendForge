# Integration and security rules for client projects

FrontendForge's builder records the business tools chosen during a client brief. Approved customer-facing public URLs can be surfaced as links on the generated site for booking, ordering, payment, delivery information and contact portals. The builder field is not for API endpoints. A URL link is not an API connection and does not transmit cart totals, verify payments, create server-side orders or synchronize inventory. The builder does not claim to connect third-party services automatically.

## Required implementation sequence

1. Get written approval from the client for the provider and the data it will receive.
2. Confirm the provider account is owned by / transferable to the client.
3. Obtain provider documentation and sandbox credentials.
4. Implement the adapter on the server side where secrets are required.
5. Validate webhooks and verify payment/order status from the provider, not from browser state.
6. Test success, failure, retries, duplicates, cancellation, refunds and unavailable inventory where relevant.
7. Add production secrets to the deployment platform's secret manager.

## Never do this

- Do not put private API keys in frontend JavaScript or `NEXT_PUBLIC_` variables.
- Do not commit `.env.local`, payment secrets, customer details or exported order data.
- Do not treat a WhatsApp draft, localStorage cart or success message as a confirmed order or payment.
- Do not claim a provider is connected until a real test transaction / booking / submission has been verified.

## Provider decision checklist

| Area | Questions before implementation |
|---|---|
| Booking | Does it need time-slot availability, deposits, reminders, cancellations or staff calendars? |
| Ordering | Where are orders stored? How are statuses, modifiers, taxes and out-of-stock items handled? |
| Payment | Which merchant account owns settlement? Are payment callbacks signed and verified server-side? |
| Delivery | Who sets zones, fees, ETAs, courier assignment and delivery status? |
| Inventory | Which system is the source of truth? How are stock updates synchronized? |
| Contact | Where do submissions go? What consent, anti-spam and retention rules apply? |

`/.env.client.example` is a non-secret placeholder only. Rename/copy it to `.env.local` when the real server-side integration is implemented, and keep that local file out of version control.
