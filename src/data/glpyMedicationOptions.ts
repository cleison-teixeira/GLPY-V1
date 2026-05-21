export const GLPY_MEDICATION_OPTIONS = [
  'Zepbound®',
  'Mounjaro®',
  'Ozempic®',
  'Retatrutida®',
  'Wegovy®',
  'Trulicity®',
  'Saxenda®',
  'Victoza®',
  'Olire®',
  'Rybelsus®',
  'TG (Tirzepatida Genérica)',
  'LipoLass®',
  'Semaglutida Composta',
  'Tirzepatida Composta',
  'Outro',
  'Ainda não decidi',
] as const;

export type GLPYMedication = (typeof GLPY_MEDICATION_OPTIONS)[number];
