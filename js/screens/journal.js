import { el, showScreen, clearElement } from '../utils/dom.js';
import { getState } from '../state.js';
import { ANIMALS, getAnimalById, getConservationInfo } from '../data/animals.js';

export function render() {
  const screen = showScreen('journal');
  clearElement(screen);

  const state = getState();

  const container = el('div', { className: 'journal-container' }, [
    el('div', { className: 'flex items-center justify-between mb-2' }, [
      el('button', {
        className: 'btn btn-secondary',
        onClick: () => import('./mainMenu.js').then(m => m.render())
      }, ['\u2190 Back']),
      el('h2', {}, ['\u{1F4D6} Animal Journal'])
    ]),

    el('p', { className: 'mb-2', style: 'color: var(--color-text-light);' }, [
      'Treat animals to unlock their journal entries and learn about them!'
    ]),

    el('div', { className: 'journal-list' },
      ANIMALS.map(animal => {
        const entry = state.journal[animal.id];
        const unlocked = entry?.unlocked;
        const conservation = getConservationInfo(animal.conservationStatus);
        const stars = entry?.factsRevealed || 0;

        const card = el('div', {
          className: `card journal-entry ${unlocked ? '' : 'locked'}`,
          onClick: unlocked ? () => renderDetail(animal.id) : null
        }, [
          el('span', { className: 'entry-emoji' }, [animal.emoji]),
          el('div', { className: 'entry-info' }, [
            el('div', { className: 'entry-name' }, [unlocked ? animal.name : '???']),
            unlocked
              ? el('div', { className: 'entry-species' }, [animal.species])
              : el('div', { className: 'entry-locked-text' }, ['Treat this animal to unlock!']),
            unlocked ? el('div', { className: 'entry-status mt-1' }, [
              el('span', {
                className: 'badge',
                style: `background: ${conservation.color}; color: ${animal.conservationStatus === 'VU' ? 'var(--color-text)' : 'white'}; font-size: 0.65rem;`
              }, [conservation.label]),
              el('span', { style: 'margin-left: 8px; color: var(--color-accent);' }, [
                '\u2B50'.repeat(stars) + '\u2606'.repeat(3 - stars)
              ])
            ]) : null
          ].filter(Boolean))
        ]);

        return card;
      })
    )
  ]);

  screen.appendChild(container);
}

export function renderDetail(animalId) {
  const screen = showScreen('journal');
  clearElement(screen);

  const state = getState();
  const animal = getAnimalById(animalId);
  if (!animal) return;

  const entry = state.journal[animalId] || { unlocked: false, factsRevealed: 0 };
  const conservation = getConservationInfo(animal.conservationStatus);
  const stars = entry.factsRevealed || 0;

  const tabs = [
    { id: 'habitat', label: 'Habitat', minStars: 1 },
    { id: 'diet', label: 'Diet', minStars: 1 },
    { id: 'conservation', label: 'Conservation', minStars: 2 },
    { id: 'funfacts', label: 'Fun Facts', minStars: 3 }
  ];

  let activeTab = 'habitat';

  const container = el('div', { className: 'journal-detail' });

  function renderContent() {
    clearElement(container);

    container.appendChild(el('div', { className: 'flex items-center justify-between mb-2' }, [
      el('button', {
        className: 'btn btn-secondary',
        onClick: () => render()
      }, ['\u2190 Journal']),
    ]));

    // Header card
    container.appendChild(el('div', { className: 'journal-detail-header' }, [
      el('span', { className: 'emoji-large' }, [animal.emoji]),
      el('h2', {}, [animal.name]),
      el('p', { style: 'font-style: italic; color: var(--color-text-light); margin-top: 4px;' }, [animal.species]),
      el('div', { className: 'mt-1' }, [
        el('span', {
          className: 'badge',
          style: `background: ${conservation.color}; color: ${animal.conservationStatus === 'VU' ? 'var(--color-text)' : 'white'};`
        }, [conservation.label]),
      ]),
      el('div', { className: 'stars-display mt-1' }, [
        '\u2B50'.repeat(stars) + '\u2606'.repeat(3 - stars)
      ]),
      entry.healCount ? el('p', { style: 'font-size: 0.8rem; color: var(--color-text-light); margin-top: 8px;' }, [
        `Treated ${entry.healCount} time${entry.healCount !== 1 ? 's' : ''}`
      ]) : null
    ].filter(Boolean)));

    // Tabs
    const tabBar = el('div', { className: 'journal-tabs mt-2' });
    tabs.forEach(tab => {
      const locked = stars < tab.minStars;
      const btn = el('button', {
        className: `journal-tab ${activeTab === tab.id ? 'active' : ''} ${locked ? 'locked' : ''}`,
        onClick: locked ? null : () => { activeTab = tab.id; renderContent(); }
      }, [locked ? `\u{1F512} ${tab.label}` : tab.label]);
      tabBar.appendChild(btn);
    });
    container.appendChild(tabBar);

    // Content
    const contentSection = el('div', { className: 'journal-content-section' });
    const currentTab = tabs.find(t => t.id === activeTab);

    if (stars < currentTab.minStars) {
      contentSection.appendChild(el('div', { className: 'locked-content' }, [
        el('span', { className: 'lock-icon' }, ['\u{1F512}']),
        el('p', {}, [`Earn ${currentTab.minStars} star${currentTab.minStars !== 1 ? 's' : ''} to unlock this section!`]),
        el('p', { style: 'margin-top: 8px; font-size: 0.85rem;' }, ['Play the mini-game with better accuracy and speed.'])
      ]));
    } else {
      switch (activeTab) {
        case 'habitat':
          contentSection.appendChild(el('h3', {}, ['\u{1F30D} Habitat']));
          contentSection.appendChild(el('p', {}, [animal.journal.habitat]));
          break;

        case 'diet':
          contentSection.appendChild(el('h3', {}, ['\u{1F37D}\uFE0F Diet']));
          contentSection.appendChild(el('p', {}, [animal.journal.diet]));
          break;

        case 'conservation':
          contentSection.appendChild(el('h3', {}, ['\u{1F6E1}\uFE0F Conservation']));
          contentSection.appendChild(el('p', {}, [animal.journal.conservationInfo]));
          contentSection.appendChild(el('h3', { className: 'mt-2' }, ['\u26A0\uFE0F Threats']));
          contentSection.appendChild(el('ul', { className: 'threat-list' },
            animal.journal.threats.map(t => el('li', {}, [t]))
          ));
          break;

        case 'funfacts':
          contentSection.appendChild(el('h3', { className: 'mb-2' }, ['\u{1F4A1} Fun Facts']));
          animal.journal.funFacts.forEach(fact => {
            contentSection.appendChild(el('div', { className: 'fun-fact' }, [
              el('strong', {}, ['Did you know? ']),
              fact
            ]));
          });
          break;
      }
    }

    container.appendChild(contentSection);

    // Play button
    container.appendChild(el('div', { className: 'text-center mt-2 mb-2' }, [
      el('button', {
        className: 'btn btn-primary',
        onClick: () => {
          import('../state.js').then(({ setState }) => {
            setState({ selectedAnimal: animal.id });
            import('./diagnosis.js').then(m => m.render());
          });
        }
      }, [`\u{1FA7A} Treat ${animal.name.split(' ')[0]}`])
    ]));
  }

  renderContent();
  screen.appendChild(container);
}
