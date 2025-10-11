// Simple auth helpers for client-side usage
// For more complex server-side auth, use the NextAuth hooks directly in components

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function validateOrganizationData(data: { organizationName: string; adminEmail: string; adminPassword: string; adminName: string }) {
  const errors: string[] = [];

  if (!data.organizationName.trim()) {
    errors.push("Organization name is required");
  }

  if (!data.adminName.trim()) {
    errors.push("Admin name is required");
  }

  if (!isValidEmail(data.adminEmail)) {
    errors.push("Valid email is required");
  }

  if (!isValidPassword(data.adminPassword)) {
    errors.push("Password must be at least 6 characters");
  }

  return errors;
}
