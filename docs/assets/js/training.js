(() => {
  const box = document.querySelector('[data-sessions]');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  fetch((window.QBASE||'/')+'assets/data/sessions.json').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => {
    const upcoming = data.filter(s => new Date(s.start + 'T00:00:00') >= today).sort((a,b) => a.start.localeCompare(b.start));
    if (!upcoming.length) { box.innerHTML = '<p>Next dates on request: <a href="mailto:training@q-leap.eu">training@q-leap.eu</a></p>'; return; }
    const date = s => new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'long',year:'numeric'}).format(new Date(s+'T00:00:00'));
    box.innerHTML = '<ul class="session-list">' + upcoming.map((s,i) => {
      const dates = date(s.start) + ' to ' + date(s.end);
      const subject = encodeURIComponent(s.title + ' | ' + dates);
      const body = encodeURIComponent('Number of participants: \nCompany: \nCompany invoice (yes/no): \nName: ');
      return `<li><time datetime="${esc(s.start)}" class="session-date">${date(s.start)}</time><div><h3>${esc(s.title)}</h3><p>${dates} · €${Number(s.price_eur_ex_vat).toLocaleString('en-GB')} excl. VAT${s.language ? ' · '+esc(s.language) : ''}${s.format ? ' · '+esc(s.format) : ''}</p><div class="session-actions"><a class="btn" href="mailto:training@q-leap.eu?subject=${subject}&amp;body=${body}">Book this session</a><button class="btn btn--ghost" type="button" data-ics="${i}">Add to calendar (.ics)</button></div></div></li>`;
    }).join('') + '</ul>';
    box.addEventListener('click', e => { const b=e.target.closest('[data-ics]'); if(!b)return; const s=upcoming[Number(b.dataset.ics)]; const end=new Date(s.end+'T00:00:00Z'); end.setUTCDate(end.getUTCDate()+1); const dt=x=>x.replaceAll('-',''); const text=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Q-Leap//Training//EN','BEGIN:VEVENT','UID:'+s.slug+'-'+s.start+'@q-leap.eu','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'') ,'DTSTART;VALUE=DATE:'+dt(s.start),'DTEND;VALUE=DATE:'+dt(end.toISOString().slice(0,10)),'SUMMARY:'+s.title.replace(/[,;\\]/g,'\\$&'),'END:VEVENT','END:VCALENDAR',''].join('\r\n'); const url=URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'})); const a=document.createElement('a'); a.href=url;a.download=s.slug+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); });
  }).catch(()=>{});
  const filters=document.querySelector('[data-filters]'); if(!filters)return; filters.hidden=false; const level=document.querySelector('#level'), org=document.querySelector('#organisation'), courses=[...document.querySelectorAll('.course')], count=document.querySelector('[data-count]'); function filter(){let n=0;courses.forEach(c=>{c.hidden=!!((level.value&&c.dataset.level!==level.value)||(org.value&&c.dataset.organisation!==org.value));if(!c.hidden)n++;}); count.textContent=n+' courses shown';} filters.addEventListener('change',filter);filter();
})();
