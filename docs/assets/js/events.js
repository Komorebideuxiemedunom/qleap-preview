(() => {
  const ordinal = (n) => n + (['th','st','nd','rd'][((n % 100) - 20) % 10] || ['th','st','nd','rd'][n % 100] || 'th');
  const box = document.querySelector('[data-events]');
  if (!box) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  fetch((window.QBASE||'/')+'assets/data/events.json').then(response => {
    if (!response.ok) throw new Error('Events unavailable');
    return response.json();
  }).then(events => {
    const event = events.filter(item => new Date(item.date + 'T00:00:00') >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
    if (!event) return;
    const date = new Date(event.date + 'T00:00:00');
    const row = document.createElement('div');
    row.className = 'event-feature';
    const time = document.createElement('time');
    time.dateTime = event.date;
    time.textContent = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    const details = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = event.title;
    const copy = document.createElement('p');
    copy.textContent = (event.edition ? ordinal(event.edition) + ' edition. ' : '') + 'The event brings the testing community together for conferences, workshops and networking.';
    const link = document.createElement('a');
    link.className = 'btn'; link.href = event.url; link.textContent = 'Visit the event website';
    details.append(title, copy, link); row.append(time, details); box.replaceChildren(row);
  }).catch(() => {});
})();
