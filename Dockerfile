FROM denoland/deno:latest

# The port that your application listens to.
EXPOSE 8080

WORKDIR /app

# Prefer not to run as root.
USER deno

ADD deps.ts .
RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD src/ src/
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache src/server.ts

CMD ["run", "--allow-net", "src/server.ts"]