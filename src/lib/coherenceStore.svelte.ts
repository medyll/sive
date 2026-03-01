export interface CoherenceAlertData {
  entity: string;
  discrepancy_type: string;
  confidence: 'Low' | 'Medium' | 'High';
  note: string;
}

export const STUB_ALERTS: CoherenceAlertData[] = [
  {
    entity: 'Jean Dupont',
    discrepancy_type: 'Outfit contradiction',
    confidence: 'High',
    note: 'Described wearing a summer shirt in Chapter 3, but the scene is set in December.'
  },
  {
    entity: 'Jean Dupont — Revolver',
    discrepancy_type: 'Object status',
    confidence: 'High',
    note: 'Revolver was lost in the Seine (Chapter 7) but appears in Jean\'s holster in Chapter 8.'
  },
  {
    entity: 'Paris → Lyon journey',
    discrepancy_type: 'Physical logic',
    confidence: 'Medium',
    note: 'Journey estimated at 30 min in narrative; real travel time by car is ~4h.'
  },
  {
    entity: 'Marie Chen',
    discrepancy_type: 'Age inconsistency',
    confidence: 'Medium',
    note: 'Marie is introduced as 34 in Chapter 1 but referred to as 30 in Chapter 5.'
  },
  {
    entity: 'Grey Peugeot 308',
    discrepancy_type: 'Location conflict',
    confidence: 'Low',
    note: 'Car is parked at the precinct in Chapter 6 Scene 2 and simultaneously at the riverbank.'
  }
];

function createCoherenceStore() {
  let alerts = $state<CoherenceAlertData[]>([]);

  function setAlerts(data: CoherenceAlertData[]) {
    alerts = data;
  }

  function clearAlerts() {
    alerts = [];
  }

  return {
    get alerts() { return alerts; },
    setAlerts,
    clearAlerts
  };
}

export const coherenceStore = createCoherenceStore();
