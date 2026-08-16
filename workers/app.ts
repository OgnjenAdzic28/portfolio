import { createRequestHandler } from "react-router";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.hostname === "www.ognjenadzic.com") {
      url.hostname = "ognjenadzic.com";
      return Response.redirect(url, 308);
    }

    return requestHandler(request);
  },
} satisfies ExportedHandler<Env>;
