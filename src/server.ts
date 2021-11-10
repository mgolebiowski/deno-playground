import { connect } from "https://deno.land/x/redis/mod.ts";

// Start listening on port 8080 of localhost.
const server = Deno.listen({ port: 8080, hostname: '0.0.0.0' });

const redis = await connect({
  hostname: "redis",
  port: 6379,
});

console.log(`HTTP webserver running.  Access it at:  http://localhost:8080/`);

// Connections to the server will be yielded up as an async iterable.
for await (const conn of server) {
  // In order to not be blocking, we need to handle each connection individually
  // without awaiting the function
      serveHttp(conn);
}

async function serveHttp(conn: Deno.Conn) {
  // This "upgrades" a network connection into an HTTP connection.
  const httpConn = Deno.serveHttp(conn);
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const requestEvent of httpConn) {
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const userAgent = requestEvent.request.headers.get('user-agent');
    console.log(new Date(), ' new request from ', requestEvent.request.url)
    await redis.set(crypto.randomUUID(), userAgent || '');
    const body = `Your user-agent is:\n\n${userAgent ?? "Unknown"}`;
    // The requestEvent's `.respondWith()` method is how we send the response
    // back to the client.
    requestEvent.respondWith(
      new Response(body, {
        status: 200,
      }),
    );
  }
}
