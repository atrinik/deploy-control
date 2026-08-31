interface Env {}

const healthResponse = () =>
  new Response(JSON.stringify({ service: "atrinik-deploy-control", status: "ok" }), {
    headers: { "content-type": "application/json" },
  });

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/healthz") {
      return healthResponse();
    }

    return new Response("Not found", { status: 404 });
  },
};
