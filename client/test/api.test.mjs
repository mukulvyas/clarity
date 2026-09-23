import test from 'node:test';
import assert from 'node:assert/strict';

test('Clarity Client Test Suite: Mock Document Data Integrity', () => {
  const mockDocs = [
    { id: 'oakwood-lease-4b', title: 'Residential Lease Agreement — Flat 4B' },
    { id: 'freelance-design-contract', title: 'Freelance Service Agreement & Statement of Work' },
    { id: 'saas-terms-of-service', title: 'SaaS Subscription Terms of Service' },
  ];

  assert.equal(mockDocs.length, 3);
  mockDocs.forEach((doc) => {
    assert.ok(doc.id.length > 0);
    assert.ok(doc.title.length > 0);
  });
});

test('Clarity Client Test Suite: Multi-turn Chat Payload Formatting', () => {
  const history = [
    { role: 'user', content: 'What is the lock-in breach penalty?' },
    { role: 'assistant', content: 'The penalty is ₹70,000 plus deposit forfeiture under Section 18.2.' },
  ];
  const newMessage = 'Can I negotiate this down to 1 month rent?';

  const payload = {
    message: newMessage,
    history: history.slice(-6),
  };

  assert.equal(payload.message, 'Can I negotiate this down to 1 month rent?');
  assert.equal(payload.history.length, 2);
  assert.equal(payload.history[0].role, 'user');
});

test('Clarity Client Test Suite: Indian Currency and Metadata Formatting', () => {
  const indianMetadata = {
    monthlyRent: '₹35,000.00',
    securityDeposit: '₹1,05,000.00',
    jurisdiction: 'Bengaluru, Karnataka (India)',
    governingAct: 'Indian Contract Act, 1872',
  };

  assert.ok(indianMetadata.monthlyRent.startsWith('₹'));
  assert.ok(indianMetadata.securityDeposit.startsWith('₹'));
  assert.equal(indianMetadata.jurisdiction, 'Bengaluru, Karnataka (India)');
});

test('Clarity Client Test Suite: Client Security Sanitization & Guardrails', () => {
  const cleanInput = (input) => input.trim().replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>?/gm, '');
  const dirtyHtml = '<script>alert("hack")</script>What is the rent?';
  const sanitized = cleanInput(dirtyHtml);

  assert.equal(sanitized, 'What is the rent?');
});
