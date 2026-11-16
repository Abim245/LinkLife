export function registerHandlers(io, socket) {
  socket.on('emergency:respond', (payload) => {
    // TODO: call the same service the REST respond endpoint uses
  });

  socket.on('location:update', (coords) => {
    // TODO: throttle + update donor.location
  });
}