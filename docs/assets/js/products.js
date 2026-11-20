(() => {
  const button = document.querySelector('[data-model-load]');
  if (button) button.addEventListener('click', () => {
    const frame = button.closest('[data-model-frame]');
    const viewer = document.createElement('model-viewer');
    viewer.setAttribute('src', (window.QBASE||'/')+'assets/models/qbot.glb');
    viewer.setAttribute('poster', (window.QBASE||'/')+'assets/img/qbot-v3-hero.png');
    viewer.setAttribute('alt', 'Interactive 3D model of the Q-Bot device and smartphone dock');
    viewer.setAttribute('camera-controls', '');
    frame.querySelector('[data-model-poster]').replaceWith(viewer);
    button.remove();
    const script = document.createElement('script');
    script.type = 'module';
    script.src = (window.QBASE||'/')+'assets/vendor/model-viewer-4.3.1.min.js';
    document.head.appendChild(script);
  }, { once: true });

  // site.js controls playback; attach the deferred sources when the video is needed.
  document.querySelectorAll('[data-video] video').forEach((video) => {
    const load = () => {
      if (video.dataset.loaded) return;
      video.querySelectorAll('source[data-src]').forEach((source) => { source.src = source.dataset.src; });
      video.dataset.loaded = 'true';
      video.load();
    };
    video.closest('[data-video]').querySelector('[data-video-toggle]').addEventListener('click', load, { capture: true });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) { load(); observer.disconnect(); }
      }, { rootMargin: '200px' });
      observer.observe(video);
    }
  });
})();

(() => {
  const steps = document.querySelector('.bot-steps');
  if (!steps || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-reached');
    });
  }, { threshold: 0.5 });
  steps.querySelectorAll('li').forEach(step => observer.observe(step));
})();
