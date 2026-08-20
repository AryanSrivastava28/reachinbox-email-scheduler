import type { StoredCampaign } from "../types/api";

const KEY = "reachinbox.knownCampaigns";

function read(): StoredCampaign[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCampaign[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: StoredCampaign[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export const campaignStore = {
  list(): StoredCampaign[] {
    return read().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  upsert(campaign: StoredCampaign): void {
    const items = read().filter((c) => c.id !== campaign.id);
    items.unshift(campaign);
    write(items);
  },

  remove(id: string): void {
    write(read().filter((c) => c.id !== id));
  },
};
