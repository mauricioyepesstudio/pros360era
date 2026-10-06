import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProfessionalDraft } from '../lib/professional-drafts/validation.ts';
const draft = { displayName: ' Ana ', category: 'BUSINESS_MARKETING', city: 'Miami', headline: 'Marcas locales', bio: 'Diseño', instagram: 'https://instagram.com/ana', facebook: '', website: '' };
test('private draft normalizes input and discards identity and approval fields', () => {
 const result = parseProfessionalDraft({ ...draft, user_id: 'other', is_approved: true, role: 'ADMIN' });
 assert.equal(result?.displayName, 'Ana');
 assert.equal('user_id' in result!, false);
 assert.equal('is_approved' in result!, false);
 assert.equal('role' in result!, false);
});
test('draft rejects regulated categories, malformed input and unsafe links', () => {
 for (const value of [null, [], {}, { ...draft, category: 'IMMIGRATION' }, { ...draft, website: 'javascript:alert(1)' }, { ...draft, bio: 'x'.repeat(1201) }, { ...draft, displayName: 42 }]) assert.equal(parseProfessionalDraft(value), null);
});
test('other category remains a private expression of interest', () => {
 assert.equal(parseProfessionalDraft({ ...draft, category: 'OTHER' })?.category, 'OTHER');
});
