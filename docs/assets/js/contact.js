/* Contact : prépare un e-mail dans l'application de l'utilisateur, selon l'intention. Rien n'est envoyé ni stocké. */
(() => {
  const form = document.querySelector('[data-contact]');
  if (!form) return;
  const map = {
    project: { to: 'contact@q-leap.eu', subject: 'Testing project', label: 'What should we test, and by when?' },
    training: { to: 'training@q-leap.eu', subject: 'Training request', label: 'Which course, for how many people, which dates?' },
    product: { to: 'contact@q-leap.eu', subject: 'Q-Bot / Q-Guard demo', label: 'Which product, and what does your test chain look like?' },
    job: { to: 'contact@q-leap.eu', subject: 'Application', label: 'Which role, and a link to your CV or LinkedIn' }
  };
  const label = form.querySelector('[data-msg-label]');
  const to = form.querySelector('[data-to]');
  const params = new URLSearchParams(location.search);
  if (map[params.get('intent')]) form.querySelector(`input[value="${params.get('intent')}"]`).checked = true;
  if (params.get('subject')) form.dataset.subject = params.get('subject');
  const sync = () => {
    const m = map[form.intent.value];
    label.textContent = m.label;
    to.textContent = m.to;
  };
  form.addEventListener('change', sync);
  sync();
  /* champ rempli = trait de validation */
  form.querySelectorAll('input:not([type=radio]),textarea').forEach((el) => {
    const f = el.closest('.field');
    const upd = () => f.classList.toggle('is-valid', el.value.trim().length > 1);
    el.addEventListener('input', upd); upd();
  });
  document.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied'; } catch { b.textContent = b.dataset.copy; }
    setTimeout(() => (b.textContent = 'Copy'), 2000);
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const m = map[form.intent.value];
    const subject = (form.dataset.subject || m.subject) + (form.elements.namedItem('org').value ? ' | ' + form.elements.namedItem('org').value : '');
    const body = `${form.elements.namedItem('msg').value}\n\n${form.elements.namedItem('name').value}${form.elements.namedItem('org').value ? '\n' + form.elements.namedItem('org').value : ''}`;
    location.href = `mailto:${m.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
