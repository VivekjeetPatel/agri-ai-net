# Community page

- `CommunityPage.jsx` contains the responsive feed, composer, post/comment actions, crop filters, and farmer connection panel.
- `useCommunityFilters.js` owns the multi-crop filters, “Match my crops” behavior, and `?crops=` URL state.
- `communityService.js` exposes Promise-based mock operations; replace its implementations with API calls when a backend is ready.
- `../../data/communityData.json` is the editable demo dataset (13 farmers and 22 posts).
- Community translation keys live under `community` in `src/i18n/locales/*.json` and use the shared i18next runtime.

For a real backend, replace the data import and delayed mock methods in `communityService.js` with authenticated requests for posts, farmers, likes, comments, and connection state. Keep the service function signatures so the UI can remain unchanged. Move image uploads to the platform's media endpoint and return a persistent image URL. Server-side persistence and authorization are needed before using this demo connection model with real accounts.
