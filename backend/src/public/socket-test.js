let socket;
const logEl = document.getElementById('log');
const statusEl = document.getElementById('status');

function log(label, data) {
  const time = new Date().toLocaleTimeString();
  logEl.textContent += `[${time}] ${label} ${data ? JSON.stringify(data, null, 2) : ''}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

document.getElementById('connect').addEventListener('click', () => {
  const token = document.getElementById('token').value.trim();
  if (socket) socket.disconnect();

  socket = io({ auth: { token } });

  socket.on('connect', () => { statusEl.textContent = 'Connected'; log('connected'); });
  socket.on('disconnect', () => { statusEl.textContent = 'Disconnected'; log('disconnected'); });
  socket.on('connect_error', (e) => log('ERROR', e.message));
  socket.on('emergency:new', (d) => log('ALERT', d));
  socket.on('emergency:update', (d) => log('UPDATE', d));
  socket.on('emergency:closed', (d) => log('CLOSED', d));
});

document.getElementById('disconnect').addEventListener('click', () => {
  if (socket) socket.disconnect();
});