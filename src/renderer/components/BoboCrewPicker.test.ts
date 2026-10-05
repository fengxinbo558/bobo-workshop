import { describe, expect, it } from 'vitest';

import type { BoboCrewMember } from '../../shared/contracts';
import {
  assignBoboCrewRole,
  toggleBoboCrewMember,
} from './BoboCrewPicker';

const baseCrew: readonly BoboCrewMember[] = [
  { packId: 'classic', role: 'planner' },
  { packId: 'twilight', role: 'artist' },
  { packId: 'hellokitty', role: 'engineer' },
];

describe('BoboCrewPicker helpers', () => {
  it('adds a unique pack in the first unfilled role', () => {
    expect(toggleBoboCrewMember(baseCrew, 'mosslight')).toEqual([
      ...baseCrew,
      { packId: 'mosslight', role: 'tester' },
    ]);
  });

  it('enforces the two-to-four member limits', () => {
    const minimum = baseCrew.slice(0, 2);
    expect(toggleBoboCrewMember(minimum, 'classic')).toEqual(minimum);

    const maximum = toggleBoboCrewMember(baseCrew, 'mosslight');
    expect(toggleBoboCrewMember(maximum, 'starforge')).toEqual(maximum);
  });

  it('removes a selected member when the crew remains valid', () => {
    expect(toggleBoboCrewMember(baseCrew, 'twilight')).toEqual([
      { packId: 'classic', role: 'planner' },
      { packId: 'hellokitty', role: 'engineer' },
    ]);
  });

  it('swaps occupied roles instead of producing duplicate assignments', () => {
    expect(assignBoboCrewRole(baseCrew, 'hellokitty', 'planner')).toEqual([
      { packId: 'classic', role: 'engineer' },
      { packId: 'twilight', role: 'artist' },
      { packId: 'hellokitty', role: 'planner' },
    ]);
  });
});
