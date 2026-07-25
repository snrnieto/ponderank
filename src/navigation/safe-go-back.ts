import { router, type Href } from 'expo-router';

/** Prefer history back; if there is none (common on web refresh), replace to fallback. */
export function safeGoBack(fallback: Href) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
