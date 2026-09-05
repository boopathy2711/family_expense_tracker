export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("Ledger Push Worker is running.");
    }

    if (url.pathname === "/test-secret") {
      return new Response(
        env.VAPID_PRIVATE_KEY
          ? "VAPID_PRIVATE_KEY is available."
          : "VAPID_PRIVATE_KEY is NOT available."
      );
    }

    return new Response("Not Found", { status: 404 });
  }
};