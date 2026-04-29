window.DuneWiki = window.DuneWiki || {};

window.DuneWiki.SCHEMA = {
  character: {
    label: 'Personnage',
    icon: '👤',
    fields: [
      { key: 'surname',   label: 'Nom de famille', type: 'text' },
      { key: 'gender',    label: 'Genre',           type: 'text' },
      { key: 'born',      label: 'Naissance',       type: 'text', placeholder: 'ex: 10175 AG' },
      { key: 'died',      label: 'Décès',           type: 'text', placeholder: 'ex: 10219 AG' },
      { key: 'house',     label: 'Maison',          type: 'text' },
      { key: 'homeworld', label: 'Monde natal',     type: 'text' },
      { key: 'allegiance',label: 'Allégeance',      type: 'text' },
      { key: 'titles',    label: 'Titres',          type: 'array', placeholder: 'ex: Duc, Muad\'Dib' },
    ]
  },
  planet: {
    label: 'Planète',
    icon: '🌍',
    fields: [
      { key: 'system',     label: 'Système',        type: 'text' },
      { key: 'climate',    label: 'Climat',         type: 'text' },
      { key: 'terrain',    label: 'Terrain',        type: 'text' },
      { key: 'population', label: 'Population',     type: 'text' },
      { key: 'government', label: 'Gouvernement',   type: 'text' },
      { key: 'capital',    label: 'Capitale',       type: 'text' },
      { key: 'exports',    label: 'Exportations',   type: 'text' },
    ]
  },
  city: {
    label: 'Ville',
    icon: '🏙️',
    fields: [
      { key: 'planet',     label: 'Planète',        type: 'text' },
      { key: 'region',     label: 'Région',         type: 'text' },
      { key: 'population', label: 'Population',     type: 'text' },
      { key: 'founded',    label: 'Fondée',         type: 'text' },
      { key: 'function',   label: 'Fonction',       type: 'text', placeholder: 'ex: port spatial, forteresse' },
    ]
  },
  house: {
    label: 'Maison',
    icon: '🏛️',
    fields: [
      { key: 'homeworld',  label: 'Monde natal',    type: 'text' },
      { key: 'motto',      label: 'Devise',         type: 'text' },
      { key: 'seat',       label: 'Siège',          type: 'text' },
      { key: 'founded',    label: 'Fondée',         type: 'text' },
      { key: 'status',     label: 'Statut',         type: 'text', placeholder: 'ex: régnante, mineure, éteinte' },
    ]
  },
  faction: {
    label: 'Faction',
    icon: '⚔️',
    fields: [
      { key: 'factionType',  label: 'Type',          type: 'text', placeholder: 'ex: guilde, fraternité, religion' },
      { key: 'leader',       label: 'Dirigeant',     type: 'text' },
      { key: 'headquarters', label: 'Quartier général', type: 'text' },
      { key: 'founded',      label: 'Fondée',        type: 'text' },
      { key: 'ideology',     label: 'Idéologie',     type: 'text' },
    ]
  },
  item: {
    label: 'Objet / Arme',
    icon: '🗡️',
    fields: [
      { key: 'itemType',       label: 'Type',          type: 'text', placeholder: 'ex: arme, artefact, technologie' },
      { key: 'material',       label: 'Matériau',      type: 'text' },
      { key: 'creator',        label: 'Créateur',      type: 'text' },
      { key: 'firstAppearance',label: 'Première apparition', type: 'text' },
    ]
  },
  concept: {
    label: 'Concept',
    icon: '📖',
    fields: [
      { key: 'domain',         label: 'Domaine',       type: 'text', placeholder: 'ex: religion, science, politique, langue' },
      { key: 'origin',         label: 'Origine',       type: 'text' },
      { key: 'relatedFaction', label: 'Faction liée',  type: 'text' },
    ]
  },
  event: {
    label: 'Événement',
    icon: '📅',
    fields: [
      { key: 'date',       label: 'Date',              type: 'text', placeholder: 'ex: 10191 AG' },
      { key: 'dateSortKey',label: 'Clé de tri',        type: 'number', placeholder: 'entier (BG = négatif)' },
      { key: 'location',   label: 'Lieu',              type: 'text' },
      { key: 'outcome',    label: 'Résultat',          type: 'text' },
      { key: 'participants',label: 'Participants',     type: 'array' },
    ]
  }
};
