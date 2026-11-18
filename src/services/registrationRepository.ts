export type Registration = {
  id: number;
  date: string;
  first: string;
  last: string;
  team: string;
  email: string;
  phone: string;
  tournament: string;
};

const STORAGE_KEY = "uniplay-registrations-v1";

export const registrationRepository = {
  list(fallback: Registration[]): Registration[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return fallback;

      const registrations = JSON.parse(stored) as Registration[];
      if (!Array.isArray(registrations)) return fallback;

      return registrations.map((registration) => ({
        ...registration,
        team: typeof registration.team === "string" ? registration.team : "",
      }));
    } catch {
      return fallback;
    }
  },

  save(registrations: Registration[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  },
};
