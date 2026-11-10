import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getMemberRoles, roles } from '../data/roles.js';

const rules = readFileSync('firestore.rules', 'utf8');

describe('Firestore member role contract', () => {
  it('accepts exactly the role IDs and display labels offered by the app', () => {
    const [, rule] = rules.match(/function memberRoleIds\(selected\) \{([\s\S]*?)\n\s*\}/);
    const accepted = [...rule.matchAll(/selected\.hasAny\(\['([^']+)', '([^']+)'\]\) \? \['([^']+)'\]/g)]
      .map(([, id, label, canonical]) => ({ id, label, canonical }));
    expect(accepted).toEqual(roles.map(({ id, emailLabel }) => ({ id, label: emailLabel, canonical: id })));
    expect(rules).toContain('data.roles.size() >= 1 && data.roles.size() <= ' + roles.length);
    expect(rules).toContain('memberRoleIds(data.roles).size() == data.roles.size()');
    for (const { id, label } of accepted) {
      expect(getMemberRoles([label, id]).map((role) => role.id)).toEqual([id]);
    }
    expect(getMemberRoles(['Admin', 'Other'])).toEqual([]);
  });
});
