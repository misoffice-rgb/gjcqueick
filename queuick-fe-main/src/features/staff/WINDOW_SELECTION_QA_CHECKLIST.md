# Window Selection Manual QA Checklist

Date: 2026-03-15

## Setup

1. Use two browser sessions (normal window + incognito) with two staff accounts assigned to the same service.
2. Open the staff onboarding page in both sessions.
3. Confirm the connection badge shows Live after a few seconds.

## Realtime Claim/Occupancy

1. Staff A clicks Choose on Window 1.
2. Verify Staff A is navigated to queue management.
3. Verify Staff B sees Window 1 become In use (with claimed_by when provided) without manual refresh.
4. Staff B clicks Choose on Window 1.
5. Verify Staff B gets the toast message Window currently in use and remains on onboarding.

## Realtime Release

1. Staff A clicks Leave Window in queue management.
2. Verify Staff A is returned to onboarding.
3. Verify Staff B sees Window 1 change to Available immediately.

## Logout Release

1. Staff A claims a window and goes to queue management.
2. Staff A clicks Logout.
3. Verify release API is called before logout redirect.
4. Verify other active staff clients see that window become Available.

## Forced Reselect On Inactive Window

1. Staff A claims a window and stays on queue management.
2. Trigger window state change to inactive from backend/admin.
3. Verify Staff A is redirected to onboarding.
4. Verify message appears: Your window is no longer active. Please select a window again.

## Websocket Reconnect

1. On onboarding, disconnect network.
2. Verify badge changes to Reconnecting or Offline.
3. Restore network.
4. Verify websocket reconnects and badge returns to Live.
5. Verify window list syncs to latest backend state.

## Release Failure Retry Prompt

1. Claim a window and go to queue management.
2. Disable network.
3. Click Leave Window.
4. Verify failure toast appears and retry confirmation prompt is shown.
5. Re-enable network and click retry.
6. Verify release succeeds and user is redirected to onboarding.
