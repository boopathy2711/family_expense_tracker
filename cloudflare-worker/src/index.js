import webpush from "web-push";

const VAPID_PUBLIC_KEY =
  "BDn3ObeZaAaySHgh5OaKkBGSkuRRRAQlshcvxAd5aH3LtyOqADcpSmrp5_EWdgPY5RtOKTF9b_HOgLV-G6KQdzE";

const VAPID_SUBJECT =
  "https://boopathye44.github.io/family_expense_tracker/";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check
    if (request.method === "GET" && url.pathname === "/") {
      return new Response("Ledger Push Worker is running.");
    }

    // Secret check
    if (request.method === "GET" && url.pathname === "/test-secret") {
      return new Response(
        env.VAPID_PRIVATE_KEY
          ? "VAPID_PRIVATE_KEY is available."
          : "VAPID_PRIVATE_KEY is NOT available."
      );
    }

    // Send notification
    if (request.method === "POST" && url.pathname === "/send") {
      try {
        // ---------------------------------------------
        // SECURITY
        // ---------------------------------------------
        const authHeader = request.headers.get("Authorization");
        const expectedToken = `Bearer ${env.LEDGER_PUSH_TOKEN}`;

        if (!authHeader || authHeader !== expectedToken) {
          return Response.json(
            {
              success: false,
              error: "Unauthorized"
            },
            { status: 401 }
          );
        }

        const data = await request.json();

        if (!data.subscription) {
          return Response.json(
            {
              success: false,
              error: "subscription is required"
            },
            { status: 400 }
          );
        }

        // ---------------------------------------------
        // VAPID
        // ---------------------------------------------
        webpush.setVapidDetails(
          VAPID_SUBJECT,
          VAPID_PUBLIC_KEY,
          env.VAPID_PRIVATE_KEY
        );

        // ---------------------------------------------
        // NOTIFICATION
        // ---------------------------------------------
        const payload = JSON.stringify({
          title: data.title || "Ledger",
          body: data.body || "New transaction added",
          url: data.url || "/"
        });

        await webpush.sendNotification(
          data.subscription,
          payload
        );

        return Response.json({
          success: true,
          message: "Push notification sent."
        });

      } catch (error) {
        console.error(
          "Push notification error:",
          error
        );

        return Response.json(
          {
            success: false,
            error: error.message || String(error)
          },
          { status: 500 }
        );
      }
    }

    return new Response("Not Found", {
      status: 404
    });
  }
};