(() => {
  const filters = document.querySelector('[data-filters]');
  if (!filters) return;
  const level = document.querySelector('#level');
  const organisation = document.querySelector('#organisation');
  const courses = [...document.querySelectorAll('.course')];
  const count = document.querySelector('[data-count]');
  const filter = () => {
    let shown = 0;
    courses.forEach(course => {
      course.hidden = Boolean((level.value && course.dataset.level !== level.value) || (organisation.value && course.dataset.organisation !== organisation.value));
      if (!course.hidden) shown++;
    });
    count.textContent = `${shown} courses shown`;
  };
  filters.hidden = false;
  filters.addEventListener('change', filter);
  filter();
})();
