/**
 * Mock Data for LawPoint Frontend
 *
 * Set USE_MOCK = true to bypass API calls and render with fake data.
 * Flip to false when the backend is running.
 */
export const USE_MOCK = true;

/* ─── Helper: fake JWT token that AuthContext can decode ─── */
const fakePayload = (role) => {
  const payload = {
    userId: 'usr-mock-001',
    name: role === 'citizen' ? 'Amala Citizen' : role === 'lawyer' ? 'Adv. Ravi Kumar' : 'Admin User',
    email: `${role}@lawpoint.test`,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24h from now
  };
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const sig = 'mock-signature';
  return `${header}.${body}.${sig}`;
};

export const MOCK_TOKENS = {
  citizen: fakePayload('citizen'),
  lawyer: fakePayload('lawyer'),
  admin: fakePayload('admin'),
};

/* ─── Mock Cases ─── */
export const MOCK_CASES = [
  {
    caseId: 'CASE-2026-001',
    title: 'Property Dispute — Unauthorized Construction',
    status: 'active',
    filedAt: '2026-04-15T10:30:00Z',
    complaintText:
      'My neighbour has constructed a boundary wall that extends 3 feet into my property. Despite multiple verbal warnings and a written notice dated March 2026, they have refused to remove the encroachment. The construction blocks access to my side entrance and has damaged the drainage system shared between our properties. I am seeking legal intervention to restore my property boundaries.',
    courtType: 'civil',
    closedAt: null,
    outcome: null,
    lawyerId: 'law-003',
    aiSummary: {
      recommendedCourt: 'civil',
      parsedSummary:
        'The complaint describes a property boundary dispute involving unauthorized construction by a neighbouring party. The matter involves civil property rights and encroachment. Recommended for Civil Court jurisdiction.',
      generatedAt: '2026-04-15T10:31:00Z',
    },
    hearings: [
      {
        hearingId: 'hear-001',
        scheduledDate: '2026-04-28T11:00:00Z',
        notes: 'Initial hearing — both parties to present documents.',
        outcome: 'Both parties presented property documents. Next hearing scheduled for evidence review.',
      },
      {
        hearingId: 'hear-002',
        scheduledDate: '2026-05-12T11:00:00Z',
        notes: 'Evidence review hearing.',
        outcome: null,
      },
    ],
    lawyerRequests: [
      { requestId: 'req-001', lawyerId: 'law-003', status: 'accepted', requestedAt: '2026-04-16T09:00:00Z' },
    ],
  },
  {
    caseId: 'CASE-2026-002',
    title: 'Domestic Violence — Threat and Intimidation',
    status: 'approved',
    filedAt: '2026-04-22T14:15:00Z',
    complaintText:
      'I have been subjected to repeated verbal threats and physical intimidation by my spouse over the past six months. The incidents have escalated recently, including damage to personal belongings and threatening messages. I am filing this complaint to seek protection and legal recourse under the applicable domestic violence laws.',
    courtType: 'family',
    closedAt: null,
    outcome: null,
    lawyerId: null,
    aiSummary: {
      recommendedCourt: 'family',
      parsedSummary:
        'The complaint describes domestic violence involving verbal threats, physical intimidation, and property damage by a spouse. This falls under Family Court jurisdiction with domestic violence protections.',
      generatedAt: '2026-04-22T14:16:00Z',
    },
    hearings: [],
    lawyerRequests: [],
  },
  {
    caseId: 'CASE-2026-003',
    title: 'Theft of Personal Belongings',
    status: 'pending',
    filedAt: '2026-05-01T08:45:00Z',
    complaintText:
      'On the evening of April 28, 2026, my laptop and wallet were stolen from my parked car near MG Road. I noticed the theft at approximately 9 PM when I returned. The car window was broken. I have CCTV footage from a nearby shop that may help identify the suspect.',
    courtType: null,
    closedAt: null,
    outcome: null,
    lawyerId: null,
    aiSummary: null,
    hearings: [],
    lawyerRequests: [],
  },
  {
    caseId: 'CASE-2026-004',
    title: 'Fraud in Online Purchase',
    status: 'closed',
    filedAt: '2026-03-10T16:20:00Z',
    complaintText:
      'I purchased an electronic item worth ₹45,000 from an online marketplace. The product delivered was counterfeit and did not match the description. The seller has refused to process a refund despite multiple complaints to the platform.',
    courtType: 'criminal',
    closedAt: '2026-04-30T12:00:00Z',
    outcome: 'Case resolved — seller ordered to refund full amount plus ₹5,000 compensation. Platform directed to delist the seller.',
    lawyerId: 'law-001',
    aiSummary: {
      recommendedCourt: 'criminal',
      parsedSummary:
        'The complaint involves fraud through sale of counterfeit goods on an online marketplace. This constitutes a criminal offence under relevant consumer protection and fraud statutes.',
      generatedAt: '2026-03-10T16:21:00Z',
    },
    hearings: [
      {
        hearingId: 'hear-003',
        scheduledDate: '2026-03-25T10:00:00Z',
        notes: 'Preliminary hearing — complainant presented purchase records.',
        outcome: 'Seller summoned for next hearing.',
      },
      {
        hearingId: 'hear-004',
        scheduledDate: '2026-04-15T10:00:00Z',
        notes: 'Both parties present. Evidence reviewed.',
        outcome: 'Seller found liable. Refund and compensation ordered.',
      },
    ],
    lawyerRequests: [
      { requestId: 'req-002', lawyerId: 'law-001', status: 'accepted', requestedAt: '2026-03-11T10:00:00Z' },
    ],
  },
];

/* ─── Mock Lawyers ─── */
export const MOCK_LAWYERS = [
  { lawyerId: 'law-001', name: 'Adv. Ravi Kumar', barId: 'BAR-KL-1001', specialisation: 'Criminal Law & Fraud', courtType: 'criminal', isAvailable: true },
  { lawyerId: 'law-002', name: 'Adv. Sneha Menon', barId: 'BAR-KL-1002', specialisation: 'Criminal Defence', courtType: 'criminal', isAvailable: true },
  { lawyerId: 'law-003', name: 'Adv. Arjun Nair', barId: 'BAR-KL-1003', specialisation: 'Property & Civil Disputes', courtType: 'civil', isAvailable: false },
  { lawyerId: 'law-004', name: 'Adv. Priya Sharma', barId: 'BAR-KL-1004', specialisation: 'Contract & Civil Law', courtType: 'civil', isAvailable: true },
  { lawyerId: 'law-005', name: 'Adv. Deepa Mohan', barId: 'BAR-KL-1005', specialisation: 'Civil Litigation', courtType: 'civil', isAvailable: true },
  { lawyerId: 'law-006', name: 'Adv. Sanjay Pillai', barId: 'BAR-KL-1006', specialisation: 'Family Law & Mediation', courtType: 'family', isAvailable: true },
  { lawyerId: 'law-007', name: 'Adv. Kavitha Raj', barId: 'BAR-KL-1007', specialisation: 'Domestic Violence & Family', courtType: 'family', isAvailable: true },
  { lawyerId: 'law-008', name: 'Adv. Manoj Das', barId: 'BAR-KL-1008', specialisation: 'Family Court Practice', courtType: 'family', isAvailable: false },
  { lawyerId: 'law-009', name: 'Adv. Anil George', barId: 'BAR-KL-1009', specialisation: 'Criminal Prosecution', courtType: 'criminal', isAvailable: true },
];

/* ─── Mock Lawyer Requests (for Lawyer Dashboard) ─── */
export const MOCK_REQUESTS = [
  { requestId: 'req-010', caseId: 'CASE-2026-005', citizenName: 'Rahul Menon', courtType: 'criminal', requestedAt: '2026-05-02T09:00:00Z', status: 'pending' },
  { requestId: 'req-011', caseId: 'CASE-2026-006', citizenName: 'Divya Nair', courtType: 'criminal', requestedAt: '2026-05-01T15:30:00Z', status: 'pending' },
  { requestId: 'req-012', caseId: 'CASE-2026-007', citizenName: 'Suresh Kumar', courtType: 'criminal', requestedAt: '2026-04-28T11:00:00Z', status: 'accepted' },
];
