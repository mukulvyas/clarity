import {
  DocumentSummary,
  ClauseDetail,
  ActionPlan,
  CompareResponse,
  ChatResponse,
} from "./api";

export const MOCK_DELAY = 400; // Fast response time

export const MOCK_DOCUMENT_ID = "oakwood-lease-4b";

export const MOCK_RECENT_DOCUMENTS = [
  {
    id: "oakwood-lease-4b",
    filename: "Apartment Lease Agreement — Unit 4B",
    created_at: new Date().toISOString(),
    status: "ready",
    page_count: 14,
    property_name: "Oakwood Heights Residences",
    risk_summary: "2 Items Need Negotiation",
    risk_badge_color: "tertiary", // terracotta
  },
  {
    id: "tech-corp-offer",
    filename: "Senior Software Engineer Employment Offer",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "ready",
    page_count: 8,
    property_name: "TechCorp Global Inc.",
    risk_summary: "1 Non-Compete Caution",
    risk_badge_color: "secondary", // amber
  },
  {
    id: "freelance-design-contract",
    filename: "Freelance Service Agreement & Statement of Work",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: "ready",
    page_count: 6,
    property_name: "Studio Design Works",
    risk_summary: "Looks Standard",
    risk_badge_color: "primary", // sage
  }
];

// ── LEASE DOCUMENT DATA ──────────────────────────────────────────────────────

export const LEASE_DOCUMENT_SUMMARY: DocumentSummary = {
  document_id: "oakwood-lease-4b",
  filename: "Residential Lease Agreement — Flat 4B",
  page_count: 14,
  property_name: "Palm Grove Heights, Indiranagar, Bengaluru",
  upload_info: "Uploaded today at 9:30 AM • 11 Months Lock-in Term",
  bottom_line: [
    {
      title: "Lock-in Breach Penalty",
      tag: "risky",
      summary: "Vacating before 11 months requires a 2 months' rent penalty (₹70,000) plus total forfeiture of your ₹1,05,000 security deposit.",
      clause_id: "clause-18-2-termination",
    },
    {
      title: "Automatic Renewal & Notice",
      tag: "worth_reviewing",
      summary: "Agreement has an 11-month lock-in. Renewal includes a 10% rent escalation unless 2 months prior written notice is served.",
      clause_id: "clause-6-1-renewal",
    },
    {
      title: "Monthly Rent & Deposit",
      tag: "standard",
      summary: "Monthly rent is ₹35,000 due on the 1st. Security deposit is ₹1,05,000 (3 months), refundable within 21 days of vacating.",
      clause_id: "clause-4-1-rent",
    },
    {
      title: "Maintenance & Repairs",
      tag: "standard",
      summary: "Landlord covers structural, plumbing mains, and electrical conduits. Tenant covers minor repairs costing under ₹1,500.",
      clause_id: "clause-9-3-repairs",
    }
  ],
  clauses: [
    {
      clause_id: "clause-18-2-termination",
      section_ref: "Section 18.2",
      category: "Term & Termination",
      title: "Lock-in Period & Early Termination Penalty",
      plain_explanation: "In the event you vacate or terminate prior to completion of the 11-month lock-in period, you forfeit the full security deposit (₹1,05,000) and remain liable for 2 months' rent penalty (₹70,000).",
      original_text: "In the event Tenant vacates, abandons, or terminates prior to completion of the 11-month lock-in period, Tenant shall forfeit the full security deposit (₹1,05,000.00) and remain liable to pay liquidated damages equal to two (2) months' rent (₹70,000.00).",
      page_ref: "Page 9, Line 14",
      risk_tag: "risky",
    },
    {
      clause_id: "clause-6-1-renewal",
      section_ref: "Section 6.1",
      category: "Lease Duration",
      title: "11-Month Term & Notice Period",
      plain_explanation: "This agreement is valid for an initial lock-in period of 11 months. Either party may terminate with 2 months advance notice. Renewal incurs a 10% standard annual escalation.",
      original_text: "This Agreement shall remain in force for an initial lock-in period of eleven (11) months. Either party may terminate by providing not less than two (2) months prior written notice. Rent will escalate by 10% upon renewal.",
      page_ref: "Page 4, Line 22",
      risk_tag: "worth_reviewing",
    },
    {
      clause_id: "clause-4-1-rent",
      section_ref: "Section 4.1",
      category: "Payments",
      title: "Monthly Rent, Due Dates & Grace Period",
      plain_explanation: "Rent of ₹35,000 is due on the 1st of each month via UPI/NEFT. A 5-day grace period applies. Late payments after the 5th incur a ₹1,500 fee.",
      original_text: "Monthly Rent is ₹35,000.00 due on or before the 1st day of each English calendar month. Late Fee: A penalty of ₹1,500.00 shall be charged if rent is not received in full by 5:00 PM on the 5th day of the month.",
      page_ref: "Page 3, Line 42",
      risk_tag: "standard",
    },
    {
      clause_id: "clause-9-3-repairs",
      section_ref: "Section 9.3",
      category: "Maintenance",
      title: "Maintenance Threshold & Repairs",
      plain_explanation: "Landlord maintains building structure, electrical mains, and primary drainage. Tenant is responsible for minor repair calls costing under ₹1,500.00.",
      original_text: "Tenant agrees to maintain premises in clean condition and pay for routine minor repairs costing under ₹1,500.00. Landlord covers major structural, plumbing mains, and electrical line repairs.",
      page_ref: "Page 6, Line 08",
      risk_tag: "standard",
    },
  ],
};

// ── FREELANCE CONTRACT DATA ──────────────────────────────────────────────────

export const FREELANCE_DOCUMENT_SUMMARY: DocumentSummary = {
  document_id: "freelance-design-contract",
  filename: "Freelance Service Agreement & Statement of Work",
  page_count: 6,
  property_name: "Studio Design Works",
  upload_info: "Uploaded 7 days ago • Milestone-Based Project SOW",
  bottom_line: [
    {
      title: "Late Payment Interest (Net 30)",
      tag: "worth_reviewing",
      summary: "Invoices must be paid within 30 days. Late payments accrue 1.5% monthly interest penalty until cleared.",
      clause_id: "clause-3-2-payment",
    },
    {
      title: "Intellectual Property Ownership",
      tag: "standard",
      summary: "Full copyright and ownership of Figma design deliverables transfer to client ONLY upon receipt of 100% full payment.",
      clause_id: "clause-5-1-ip",
    },
    {
      title: "Termination Notice Window",
      tag: "standard",
      summary: "Either party can terminate with 14 days written notice. Client must pay for all work completed up to termination date.",
      clause_id: "clause-8-3-termination",
    },
    {
      title: "Scope & Deliverables",
      tag: "standard",
      summary: "Covers UI/UX wireframes, Figma assets, and component design library outlined in SOW Schedule A.",
      clause_id: "clause-1-1-scope",
    }
  ],
  clauses: [
    {
      clause_id: "clause-3-2-payment",
      section_ref: "Section 3.2",
      category: "Compensation & Fees",
      title: "Payment Terms & Late Fee Interest",
      plain_explanation: "Invoices are due Net 30 days. If the client delays payment past 30 days, a 1.5% per month late interest fee applies until paid in full.",
      original_text: "Client shall pay all outstanding invoices within thirty (30) days of receipt (Net 30). Unpaid balances after 30 days shall accrue interest at a rate of 1.5% per month.",
      page_ref: "Page 2, Line 18",
      risk_tag: "worth_reviewing",
    },
    {
      clause_id: "clause-5-1-ip",
      section_ref: "Section 5.1",
      category: "Intellectual Property",
      title: "Work Product & IP Ownership Transfer",
      plain_explanation: "You retain ownership of all draft files and final designs until the client settles all invoices. Once paid in full, all copyright transfers to the client.",
      original_text: "Upon receipt of full and final payment, Designer assigns to Client all right, title, and interest in and to final design deliverables specified in Statement of Work A.",
      page_ref: "Page 3, Line 05",
      risk_tag: "standard",
    },
    {
      clause_id: "clause-8-3-termination",
      section_ref: "Section 8.3",
      category: "Contract Duration",
      title: "Termination for Convenience & Notice",
      plain_explanation: "Either side can cancel the contract at any time by giving 14 days written notice. You will be compensated for all hours/milestones completed prior to termination.",
      original_text: "Either party may terminate this Agreement at any time without cause upon fourteen (14) days prior written notice. Client shall compensate Designer for all work completed prior to termination.",
      page_ref: "Page 5, Line 22",
      risk_tag: "standard",
    },
    {
      clause_id: "clause-1-1-scope",
      section_ref: "Section 1.1",
      category: "Scope of Work",
      title: "Scope of Work & Milestone Deliverables",
      plain_explanation: "Outlines specific Figma wireframes, UI kits, and design system components to be delivered according to the agreed milestone roadmap.",
      original_text: "Designer agrees to deliver UI/UX design wireframes and final Figma assets according to the agreed project schedule in Statement of Work A.",
      page_ref: "Page 1, Line 12",
      risk_tag: "standard",
    },
  ],
};

// ── EMPLOYMENT OFFER DATA ────────────────────────────────────────────────────

export const TECH_OFFER_DOCUMENT_SUMMARY: DocumentSummary = {
  document_id: "tech-corp-offer",
  filename: "Senior Software Engineer Employment Offer",
  page_count: 8,
  property_name: "TechCorp Global Inc.",
  upload_info: "Uploaded 3 days ago • Full-Time Employment Agreement",
  bottom_line: [
    {
      title: "12-Month Non-Compete Restriction",
      tag: "risky",
      summary: "Restricts working for competing tech companies within a 50-mile radius for 12 months after leaving TechCorp.",
      clause_id: "clause-2-1-noncompete",
    },
    {
      title: "Equity Vesting Cliff Schedule",
      tag: "worth_reviewing",
      summary: "Stock option equity vests over 4 years with a 1-year cliff (25% vests at Month 12, then monthly thereafter).",
      clause_id: "clause-4-2-equity",
    },
    {
      title: "At-Will Employment & Notice",
      tag: "standard",
      summary: "Employment is at-will. Either party may end employment at any time, with a requested 2-week courteous notice.",
      clause_id: "clause-7-1-atwill",
    },
    {
      title: "Base Salary & Signing Bonus",
      tag: "standard",
      summary: "Base salary is $165,000/yr. $15,000 signing bonus has a 12-month pro-rated clawback if you resign early.",
      clause_id: "clause-1-2-salary",
    }
  ],
  clauses: [
    {
      clause_id: "clause-2-1-noncompete",
      section_ref: "Section 2.1",
      category: "Restrictive Covenants",
      title: "Non-Competition & Geographic Scope",
      plain_explanation: "For 12 months post-employment, you cannot accept work or consult for any direct competitor operating within 50 miles of TechCorp's offices.",
      original_text: "Employee agrees that during employment and for a period of twelve (12) months following termination, Employee shall not directly or indirectly engage in competitive business activities within a 50-mile radius.",
      page_ref: "Page 3, Line 14",
      risk_tag: "risky",
    },
    {
      clause_id: "clause-4-2-equity",
      section_ref: "Section 4.2",
      category: "Equity & Compensation",
      title: "Stock Option Vesting & 1-Year Cliff",
      plain_explanation: "Your 10,000 stock options vest over 4 years. Nothing vests during the first 12 months (1-year cliff). At Month 12, 25% vests at once.",
      original_text: "Stock options shall vest over a four (4) year schedule: twenty-five percent (25%) upon completion of twelve (12) months of continuous service, and 1/48th monthly thereafter.",
      page_ref: "Page 5, Line 08",
      risk_tag: "worth_reviewing",
    },
    {
      clause_id: "clause-7-1-atwill",
      section_ref: "Section 7.1",
      category: "Employment Terms",
      title: "At-Will Employment & Resignation Notice",
      plain_explanation: "Standard at-will employment relationship. You or TechCorp may terminate employment at any time for any lawful reason with 2 weeks notice.",
      original_text: "Employment with the Company is at-will and may be terminated by either party at any time, with or without cause, upon two (2) weeks written notice.",
      page_ref: "Page 7, Line 02",
      risk_tag: "standard",
    },
    {
      clause_id: "clause-1-2-salary",
      section_ref: "Section 1.2",
      category: "Compensation",
      title: "Base Salary & Signing Bonus Clawback",
      plain_explanation: "Salary of $165,000 paid bi-weekly. The $15,000 signing bonus must be repaid pro-rata if you voluntarily leave before completing 12 months.",
      original_text: "Base salary shall be $165,000 per annum. A one-time signing bonus of $15,000 is subject to full pro-rata repayment should Employee voluntarily terminate within twelve (12) months.",
      page_ref: "Page 2, Line 04",
      risk_tag: "standard",
    },
  ],
};

// ── CLAUSE DETAILS LOOKUP ────────────────────────────────────────────────────

export const MOCK_CLAUSE_DETAILS: Record<string, ClauseDetail> = {
  "clause-18-2-termination": {
    ...LEASE_DOCUMENT_SUMMARY.clauses[0],
    category: "Term & Termination",
    fairness_score: 25,
    real_life_scenario: "If a job relocation or family emergency forces you to vacate 6 months into your lease, you would owe a ₹70,000 cash penalty (2 months rent) plus lose your ₹1,05,000 security deposit—costing you ₹1,75,000 total just to exit.",
    negotiation_questions: [
      "Can we cap the early termination penalty at 1 month's rent (₹35,000) instead of 2 months?",
      "Can we include an employment transfer clause that waives the penalty with 60 days advance notice?",
      "Can we ensure the security deposit is refunded per standard handover inspection rather than automatically forfeited?"
    ],
  },
  "clause-6-1-renewal": {
    ...LEASE_DOCUMENT_SUMMARY.clauses[1],
    category: "Lease Duration",
    fairness_score: 55,
    real_life_scenario: "If you forget to send written notice 2 months before lease expiry, you may be held responsible for an automatic 10% rent escalation (₹38,500/month) for another 11-month term.",
    negotiation_questions: [
      "Can the notice period be adjusted to 30 days instead of 60 days?",
      "Can the agreement allow month-to-month extension at mutual agreement without mandatory 10% escalation?"
    ],
  },
  "clause-4-1-rent": {
    ...LEASE_DOCUMENT_SUMMARY.clauses[2],
    category: "Payments",
    fairness_score: 88,
    real_life_scenario: "If salary is credited on the 3rd or a banking holiday delays UPI transfer until the 4th, you will not incur any late fee because the grace window extends until 5:00 PM on the 5th.",
    negotiation_questions: [],
  },
  "clause-9-3-repairs": {
    ...LEASE_DOCUMENT_SUMMARY.clauses[3],
    category: "Maintenance",
    fairness_score: 82,
    real_life_scenario: "If a light bulb burns out or a kitchen sink drain needs a minor ₹300 plumber visit, you pay for it. If the building water motor breaks down, Palm Grove Management pays 100%.",
    negotiation_questions: [
      "Can the landlord confirm that major plumbing and electrical faults over ₹1,500 do not require tenant upfront payment?"
    ],
  },
  "clause-3-2-payment": {
    ...FREELANCE_DOCUMENT_SUMMARY.clauses[0],
    category: "Compensation & Fees",
    fairness_score: 65,
    real_life_scenario: "If the client pays on Day 45 instead of Day 30 for a ₹1,50,000 invoice, you can legally claim a 1.5% monthly late interest charge on the outstanding balance.",
    negotiation_questions: [
      "Can we shorten the payment terms from Net 30 to Net 15 for initial project milestones?",
      "Can we request a 30% advance deposit before work commences on Statement of Work Annexure A?"
    ],
  },
  "clause-5-1-ip": {
    ...FREELANCE_DOCUMENT_SUMMARY.clauses[1],
    category: "Intellectual Property",
    fairness_score: 85,
    real_life_scenario: "If a client cancels mid-project without paying final invoices, they do NOT own the Figma design files or assets—ownership remains legally with you.",
    negotiation_questions: [
      "Can we clarify that pre-existing designer tools, UI templates, and component libraries remain designer property?"
    ],
  },
  "clause-8-3-termination": {
    ...FREELANCE_DOCUMENT_SUMMARY.clauses[2],
    category: "Contract Duration",
    fairness_score: 80,
    real_life_scenario: "If the client decides to pause the project 2 weeks in, they must provide 14 days written notice and pay for all wireframes completed up to that 14th day.",
    negotiation_questions: [],
  },
  "clause-1-1-scope": {
    ...FREELANCE_DOCUMENT_SUMMARY.clauses[3],
    category: "Scope of Work",
    fairness_score: 90,
    real_life_scenario: "If the client asks for 5 extra revision rounds beyond SOW A, you can reference Section 1.1 to request an out-of-scope change order fee.",
    negotiation_questions: [],
  },
  "clause-2-1-noncompete": {
    ...TECH_OFFER_DOCUMENT_SUMMARY.clauses[0],
    category: "Restrictive Covenants",
    fairness_score: 35,
    real_life_scenario: "If you leave TechCorp after 2 years, a broad 12-month 50-mile non-compete could prevent you from taking remote engineering roles at local tech firms.",
    negotiation_questions: [
      "Can we narrow the non-compete definition to specific named direct competitors rather than a broad 50-mile radius?",
      "Can we reduce the non-compete duration from 12 months to 6 months?"
    ],
  },
  "clause-4-2-equity": {
    ...TECH_OFFER_DOCUMENT_SUMMARY.clauses[1],
    category: "Equity & Compensation",
    fairness_score: 70,
    real_life_scenario: "If you leave the company at Month 11 (before the 1-year cliff), you receive 0 vested options. At Month 12, 2,500 options vest all at once.",
    negotiation_questions: [
      "Can we include double-trigger acceleration for equity vesting in the event of an acquisition?"
    ],
  },
  "clause-7-1-atwill": {
    ...TECH_OFFER_DOCUMENT_SUMMARY.clauses[2],
    category: "Employment Terms",
    fairness_score: 85,
    real_life_scenario: "Gives you complete flexibility to resign whenever a better career opportunity arises with standard 2 weeks notice.",
    negotiation_questions: [],
  },
  "clause-1-2-salary": {
    ...TECH_OFFER_DOCUMENT_SUMMARY.clauses[3],
    category: "Compensation",
    fairness_score: 82,
    real_life_scenario: "If you relocate after 6 months, you would owe back $7,500 (half of the $15,000 signing bonus).",
    negotiation_questions: [
      "Can the signing bonus clawback be waived if departure is due to company restructuring or lay-off?"
    ],
  }
};

// ── ACTION PLANS ─────────────────────────────────────────────────────────────

export const LEASE_ACTION_PLAN: ActionPlan = {
  progress: { completed: 2, total: 5 },
  checklist: [
    {
      id: "action-1",
      title: "Request Amendment to Early Termination Penalty (Section 18.2)",
      description: "Clause 18.2 imposes a 2-month penalty ($4,200) + deposit forfeiture. Ask landlord to cap penalty at 1 month with 60 days notice.",
      status: "pay_attention",
      suggested_script: "Dear Oakwood Management,\n\nI am reviewing the lease agreement for Unit 4B and am excited to move forward. Regarding Section 18.2 (Early Termination), I noticed it requires a two-month rent penalty plus total deposit forfeiture.\n\nCould we amend this section to cap the early termination fee at one month's rent provided 60 days written notice is given, with the security deposit handled per standard move-out inspection? This reflects standard regional rental guidelines.\n\nThank you,\nElena",
    },
    {
      id: "action-2",
      title: "Confirm Notice Period for Renewal (Section 6.1)",
      description: "Set a calendar reminder for Month 10 of your lease so you don't miss the 60-day non-renewal window.",
      status: "clarification",
      suggested_script: "Hi Oakwood Team,\n\nRegarding Section 6.1 (Automatic Renewal), could we clarify if notice of non-renewal can be submitted via email to management, or if certified physical mail is strictly required?\n\nBest regards,\nElena",
    },
    {
      id: "action-3",
      title: "Verify Maintenance Request Process (Section 9.3)",
      description: "Ensure minor repairs under $75 are logged via tenant portal for reimbursement tracking.",
      status: "looks_standard",
      suggested_script: null,
    },
    {
      id: "action-4",
      title: "Conduct Initial Move-In Inspection & Photo Log",
      description: "Take high-resolution photos of all rooms, appliances, and floor surfaces before moving furniture in.",
      status: "completed",
      suggested_script: null,
    },
    {
      id: "action-5",
      title: "Set Up Rent Auto-Pay for 1st of the Month",
      description: "Schedule recurring bank transfers for the 1st of each month to guarantee arrival before 5th grace period.",
      status: "completed",
      suggested_script: null,
    }
  ],
  questions_for_landlord: [
    "Is the $2,100 security deposit held in an interest-bearing escrow account?",
    "Does the 60-day notice requirement for Section 6.1 accept electronic notification via tenant portal?",
    "Are there any designated visitor parking permits included with Unit 4B?"
  ],
  resources: [
    { name: "California Tenants Legal Rights Handbook", type: "reading_material", url: "#" },
    { name: "Local Housing & Rent Advisory Board", type: "free_consultation", url: "#" },
    { name: "Sample Lease Amendment Template", type: "downloadable_template", url: "#" }
  ]
};

export const FREELANCE_ACTION_PLAN: ActionPlan = {
  progress: { completed: 1, total: 4 },
  checklist: [
    {
      id: "action-fl-1",
      title: "Confirm IP Rights Transfer Clause (Section 5.1)",
      description: "Verify that work product and copyright transfer to client ONLY after 100% full invoice payment.",
      status: "pay_attention",
      suggested_script: "Hi Studio Design Team,\n\nRegarding Section 5.1 (Intellectual Property), I wanted to confirm that full ownership of all Figma design deliverables transfers to the client upon receipt of final invoice payment, while pre-existing UI kits and design tools remain designer property.\n\nBest regards,\nElena",
    },
    {
      id: "action-fl-2",
      title: "Review Payment Schedule & Late Interest Terms (Section 3.2)",
      description: "Net 30 terms with 1.5% late interest fee. Ensure client finance team approves invoice submission workflow.",
      status: "clarification",
      suggested_script: "Hi Finance Team,\n\nI am setting up payment milestones for SOW A under Section 3.2. Please confirm the correct AP billing email address for timely Net 30 processing.\n\nThanks,\nElena",
    },
    {
      id: "action-fl-3",
      title: "Verify Statement of Work Deliverable Scope (Section 1.1)",
      description: "Check that wireframe counts, Figma design system tokens, and revision rounds are explicitly detailed.",
      status: "looks_standard",
      suggested_script: null,
    },
    {
      id: "action-fl-4",
      title: "Setup Project Milestone Calendar & Asset Handover",
      description: "Map SOW milestone dates to project management tool and set up client shared Figma workspace.",
      status: "completed",
      suggested_script: null,
    }
  ],
  questions_for_landlord: [
    "Are out-of-scope revision requests billed at a fixed hourly rate of $95/hr?",
    "Does Section 8.3 require 14 days written notice via email or certified mail?",
    "Who is the designated client stakeholder authorized to sign off on SOW milestones?"
  ],
  resources: [
    { name: "Freelancers Union Standard Contract Guide", type: "reading_material", url: "#" },
    { name: "IP & Copyright Assignment Checklist", type: "free_consultation", url: "#" },
    { name: "Client Invoice & Late Fee Reminder Template", type: "downloadable_template", url: "#" }
  ]
};

export const TECH_OFFER_ACTION_PLAN: ActionPlan = {
  progress: { completed: 1, total: 4 },
  checklist: [
    {
      id: "action-to-1",
      title: "Negotiate Non-Compete Radius & Scope (Section 2.1)",
      description: "Section 2.1 imposes a broad 12-month, 50-mile non-compete. Request narrowing scope to specific direct competitors.",
      status: "pay_attention",
      suggested_script: "Hi TechCorp Recruiting Team,\n\nI am thrilled about the Senior Engineer offer! In reviewing Section 2.1 (Non-Competition), I noticed the 50-mile radius clause is quite broad.\n\nCould we amend Section 2.1 to specify a list of direct competitor companies rather than a geographic radius? This will allow flexibility while protecting TechCorp's core business.\n\nBest regards,\nElena",
    },
    {
      id: "action-to-2",
      title: "Confirm Equity Vesting Cliff Details (Section 4.2)",
      description: "Stock option equity has a 1-year cliff (25% at month 12). Confirm exercise window after departure.",
      status: "clarification",
      suggested_script: "Hi HR Team,\n\nRegarding Section 4.2 (Stock Option Equity), could you clarify the post-termination exercise window for vested options (e.g. 90 days vs extended)?\n\nThanks,\nElena",
    },
    {
      id: "action-to-3",
      title: "Review Signing Bonus Repayment Terms (Section 1.2)",
      description: "$15,000 signing bonus has a 12-month clawback. Ensure clawback is waived if departure is due to layoff.",
      status: "looks_standard",
      suggested_script: null,
    },
    {
      id: "action-to-4",
      title: "Sign & Return Formal Offer Letter",
      description: "Sign offer letter electronically and submit background check verification details.",
      status: "completed",
      suggested_script: null,
    }
  ],
  questions_for_landlord: [
    "Is there a 401(k) company match starting on day 1?",
    "Does TechCorp offer double-trigger equity vesting acceleration upon acquisition?",
    "What is the annual education / conference stipend allowance?"
  ],
  resources: [
    { name: "Tech Employee Non-Compete Rights Guide", type: "reading_material", url: "#" },
    { name: "Software Engineer Compensation Benchmark", type: "free_consultation", url: "#" },
    { name: "Offer Letter Counter-Offer Email Template", type: "downloadable_template", url: "#" }
  ]
};

// ── DYNAMIC DUCUMENT RESOLVER HELPERS ────────────────────────────────────────

export function getMockDocumentSummary(documentId: string): DocumentSummary {
  if (documentId === "freelance-design-contract") {
    return FREELANCE_DOCUMENT_SUMMARY;
  }
  if (documentId === "tech-corp-offer") {
    return TECH_OFFER_DOCUMENT_SUMMARY;
  }
  if (documentId === "oakwood-lease-4b" || documentId === "demo" || documentId === MOCK_DOCUMENT_ID) {
    return LEASE_DOCUMENT_SUMMARY;
  }
  // Generic dynamic document summary for uploaded files
  const cleanId = documentId.replace(/-/g, " ");
  const capitalized = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
  return {
    document_id: documentId,
    filename: `${capitalized} Agreement`,
    page_count: 5,
    property_name: "Verified Issuer",
    upload_info: "Uploaded today • Analyzed by Clarity AI",
    bottom_line: [
      {
        title: "Key Terms & Penalties",
        tag: "worth_reviewing",
        summary: "Important obligations and termination parameters detected in your document.",
        clause_id: `clause-${documentId}-1`,
      },
      {
        title: "Payment & Financial Obligations",
        tag: "standard",
        summary: "Financial terms, due dates, and fee structures cross-checked against standard guidelines.",
        clause_id: `clause-${documentId}-2`,
      }
    ],
    clauses: [
      {
        clause_id: `clause-${documentId}-1`,
        section_ref: "Section 1.1",
        category: "General Terms",
        title: "Core Rights & Obligations",
        plain_explanation: "Outlines the primary responsibilities, terms, and expectations between both signing parties.",
        original_text: "Both parties agree to execute all terms and conditions specified herein with full legal force.",
        page_ref: "Page 1, Line 05",
        risk_tag: "worth_reviewing",
      },
      {
        clause_id: `clause-${documentId}-2`,
        section_ref: "Section 2.3",
        category: "Compensation",
        title: "Payment Terms & Timelines",
        plain_explanation: "Defines invoice payment grace periods, due dates, and standard late payment provisions.",
        original_text: "Payments shall be processed per agreed milestone intervals within standard billing cycles.",
        page_ref: "Page 2, Line 14",
        risk_tag: "standard",
      }
    ]
  };
}

export function getMockActionPlan(documentId: string): ActionPlan {
  if (documentId === "freelance-design-contract") {
    return FREELANCE_ACTION_PLAN;
  }
  if (documentId === "tech-corp-offer") {
    return TECH_OFFER_ACTION_PLAN;
  }
  return LEASE_ACTION_PLAN;
}

export function getMockDocumentMetadata(documentId: string) {
  if (documentId === "freelance-design-contract") {
    return [
      { label: "Total project fee:", value: "₹1,50,000.00 Fixed" },
      { label: "Payment terms:", value: "Net 30 (1% TDS + 18% GST)" },
      { label: "IP transfer:", value: "Upon 100% Full Payment" },
      { label: "Jurisdiction:", value: "Indian Contract Act, 1872" },
    ];
  }
  if (documentId === "tech-corp-offer") {
    return [
      { label: "Annual CTC:", value: "₹24,00,000.00 / year (24 LPA)" },
      { label: "Joining bonus:", value: "₹2,00,000.00 (12-mo clawback)" },
      { label: "Notice period:", value: "60 Days (PF & Gratuity Eligible)" },
      { label: "Jurisdiction:", value: "Indian Labour Laws (Bengaluru)" },
    ];
  }
  return [
    { label: "Term length:", value: "11 Months (Lock-in Period)" },
    { label: "Monthly rent:", value: "₹35,000.00" },
    { label: "Security deposit:", value: "₹1,05,000.00 (3 Months)" },
    { label: "Jurisdiction:", value: "Bengaluru, Karnataka (India)" },
  ];
}

export function getMockSuggestedQuestions(documentId: string): string[] {
  if (documentId === "freelance-design-contract") {
    return [
      "What are the payment terms & late fees?",
      "Who owns the final Figma design deliverables?",
      "How many days notice is required for termination?",
      "What happens if client requests extra design revisions?",
    ];
  }
  if (documentId === "tech-corp-offer") {
    return [
      "What are the non-compete restriction terms?",
      "How does the stock option equity vesting schedule work?",
      "What happens to the signing bonus if I leave before 1 year?",
      "What is the notice requirement for resignation?",
    ];
  }
  return [
    "What happens if I break the lease early?",
    "Who is responsible for plumbing & HVAC repairs?",
    "Can the landlord enter the apartment without prior notice?",
    "How many days notice is required before moving out?",
  ];
}

export function getMockClauseJumpers(documentId: string) {
  if (documentId === "freelance-design-contract") {
    return [
      { ref: "Sec. 3 — Payment & Late Fees", query: "What are the payment terms and late fee penalties in Section 3.2?", color: "bg-secondary-container" },
      { ref: "Sec. 5 — IP & Deliverable Ownership", query: "Who owns the intellectual property and Figma files under Section 5.1?", color: "bg-primary" },
      { ref: "Sec. 8 — Termination Notice", query: "What is the notice requirement for project termination under Section 8.3?", color: "bg-tertiary-container" },
      { ref: "Sec. 1 — Scope of Work", query: "What is included in the milestone scope of work in Section 1.1?", color: "bg-outline" },
    ];
  }
  if (documentId === "tech-corp-offer") {
    return [
      { ref: "Sec. 2 — Non-Compete Scope", query: "What are the non-compete restrictions and radius in Section 2.1?", color: "bg-tertiary-container" },
      { ref: "Sec. 4 — Equity & Vesting", query: "How does the stock option 1-year cliff vesting work in Section 4.2?", color: "bg-secondary-container" },
      { ref: "Sec. 7 — At-Will & Notice", query: "What are the resignation notice terms in Section 7.1?", color: "bg-primary" },
      { ref: "Sec. 1 — Salary & Signing Bonus", query: "What are the signing bonus clawback terms in Section 1.2?", color: "bg-outline" },
    ];
  }
  return [
    { ref: "Sec. 4 — Rent & Late Fees", query: "What does Section 4 say about rent due dates and late fees?", color: "bg-secondary-container" },
    { ref: "Sec. 9 — Maintenance & HVAC", query: "Who covers plumbing and HVAC repairs under Section 9?", color: "bg-primary" },
    { ref: "Sec. 18 — Early Termination", query: "What are the early termination penalties in Section 18?", color: "bg-tertiary-container" },
    { ref: "Sec. 6 — Renewal Notice", query: "What is the notice requirement to prevent automatic renewal?", color: "bg-outline" },
  ];
}

export const MOCK_DOCUMENT_SUMMARY = LEASE_DOCUMENT_SUMMARY;

export const MOCK_ACTION_PLAN = LEASE_ACTION_PLAN;

export const MOCK_COMPARE_RESPONSE: CompareResponse = {
  verdict: "Version 2 is significantly better for you",
  confidence: 98,
  favorable_changes: 3,
  unresolved_cautions: 1,
  new_risks: 0,
  doc_a_name: "Initial Lease Agreement (Doc A)",
  doc_b_name: "Revised Lease with Addendum (Doc B)",
  clause_diffs: [
    {
      section_ref: "Section 18.2",
      title: "Lock-in Breach & Termination Penalty",
      classification: "better_for_you",
      explanation: "Landlord accepted your counter-offer! Early exit penalty was reduced from 2 months' rent (₹70,000) to 1 month's rent (₹35,000), and deposit forfeiture condition was eliminated.",
    },
    {
      section_ref: "Section 14.1",
      title: "Pet Deposit Terms",
      classification: "better_for_you",
      explanation: "The monthly pet fee was waived, and the non-refundable sanitation fee was converted to a refundable deposit of ₹10,000 returned upon move-out if no pet damage occurs.",
    },
    {
      section_ref: "Section 6.1",
      title: "Notice Period for Non-Renewal",
      classification: "better_for_you",
      explanation: "Notice required to terminate after the 11-month lock-in was reduced from 60 days to 30 days written notice.",
    },
    {
      section_ref: "Section 4.1",
      title: "Rent Payment Grace Period & Late Fee",
      classification: "same",
      explanation: "The 5-day grace period and ₹1,500 late fee remain unchanged. Terms are balanced and standard.",
    }
  ],
};

export const MOCK_CHAT_RESPONSE: ChatResponse = {
  answer: "According to Section 9.3 of your Palm Grove Heights Lease Agreement, you are only responsible for routine minor repair calls costing under ₹1,500.00. For major appliance, plumbing mains, or electrical failures exceeding ₹1,500, Palm Grove Management is fully responsible for covering all repair costs.",
  cited_clauses: [
    {
      clause_id: "clause-9-3-repairs",
      section_ref: "Section 9.3",
      excerpt: "Tenant agrees to maintain premises in clean condition and pay for routine minor repairs costing under ₹1,500.00. Landlord covers major structural, plumbing mains, and electrical line repairs.",
      page_ref: "Page 6, Line 08",
    }
  ],
  next_action: "If your repair estimate exceeds ₹1,500.00, submit a formal maintenance request to Palm Grove Management and cite Section 9.3.",
};

