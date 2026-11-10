const clusters = {
  bi: {
    title: 'Business Intelligence & Data',
    technologies: ['Power BI', 'Pentaho PDI', 'Data Warehousing', 'SQL Server']
  },
  blockchain: {
    title: 'Blockchain & Web3',
    technologies: ['Ethereum', 'Solidity', 'Hardhat', 'Web3.js']
  },
  web: {
    title: 'Développement full-stack',
    technologies: ['Angular', 'Node.js', 'PHP / MySQL', 'Flask']
  },
  ai: {
    title: 'Intelligence artificielle & ML',
    technologies: ['BERT', 'Graph-RAG', 'TensorFlow', 'Machine Learning']
  }
};

export function initSkills() {
  const tabs = [...document.querySelectorAll('.skill-node')];
  const panel = document.getElementById('skill-cluster-detail');
  if (!tabs.length || !panel) return;

  function activate(tab) {
    const cluster = clusters[tab.dataset.skillCluster];
    if (!cluster) return;

    tabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    panel.replaceChildren();
    const title = document.createElement('h3');
    title.textContent = cluster.title;
    const list = document.createElement('ul');
    cluster.technologies.forEach(technology => {
      const item = document.createElement('li');
      item.textContent = technology;
      list.append(item);
    });
    panel.append(title, list);
    panel.classList.remove('is-changing');
    requestAnimationFrame(() => panel.classList.add('is-changing'));

    document.querySelectorAll('.skill-category-card').forEach(card => {
      const related = card.dataset.skillGroup === tab.dataset.skillCluster;
      card.classList.toggle('is-related', related);
      card.classList.toggle('is-muted', !related);
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('focus', () => activate(tab));
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[nextIndex].focus();
    });
  });

  activate(tabs[0]);
}