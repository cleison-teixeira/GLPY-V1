const DEMO_EMAILS = [
  'sillvanna.teixeira@gmail.com',
  'cleisonimarketing@gmail.com',
];

export function isDemoModeUser(userEmail?: string | null): boolean {
  if (!userEmail) return false;
  return DEMO_EMAILS.includes(userEmail.trim().toLowerCase());
}
