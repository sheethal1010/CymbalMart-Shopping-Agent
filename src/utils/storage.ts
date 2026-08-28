import { PartyPlan } from '../types';
import { SAMPLE_PRESETS } from '../data/presets';

const STORAGE_KEY = 'party_planner_plans_v1';
const ACTIVE_PLAN_KEY = 'party_planner_active_id_v1';

export function getSavedPlans(): PartyPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load plans from localStorage', e);
  }
  // Initialize with sample presets if empty
  savePlans(SAMPLE_PRESETS);
  return SAMPLE_PRESETS;
}

export function savePlans(plans: PartyPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save plans to localStorage', e);
  }
}

export function getActivePlanId(): string {
  try {
    const active = localStorage.getItem(ACTIVE_PLAN_KEY);
    if (active) return active;
  } catch (e) {
    console.error('Failed to get active plan ID', e);
  }
  return SAMPLE_PRESETS[0].id;
}

export function setActivePlanId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PLAN_KEY, id);
  } catch (e) {
    console.error('Failed to set active plan ID', e);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
