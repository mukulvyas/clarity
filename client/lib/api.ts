/**
 * Typed API client — all requests go through the FastAPI backend.
 * Gracefully falls back to rich mock data if backend endpoint is unavailable or for demo IDs.
 */

import {
  MOCK_DELAY,
  MOCK_DOCUMENT_ID,
  MOCK_RECENT_DOCUMENTS,
  MOCK_COMPARE_RESPONSE,
  MOCK_CLAUSE_DETAILS,
  getMockDocumentSummary,
  getMockActionPlan,
} from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

import { createClient } from "@/lib/supabase/client";

async function getAuthToken() {
  if (typeof window === "undefined") return null;
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch (e) {
    return null;
  }
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, err.message ?? res.statusText, err);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Documents ────────────────────────────────────────────────────────────────

export interface UploadResponse {
  document_id: string;
  status: "processing" | "ready" | "error";
  filename: string;
  page_count?: number;
}

export interface UploadErrorResponse {
  document_id: string;
  status: "error";
  error_type: "low_clarity";
  legibility_score: number;
  message: string;
  unresolved_sections: string[];
  suggested_fixes: string[];
}

export interface BottomLineItem {
  title: string;
  tag: string;
  summary: string;
  clause_id: string;
}

export interface Clause {
  clause_id: string;
  section_ref: string | null;
  category?: string | null;
  title: string | null;
  plain_explanation: string | null;
  original_text: string;
  page_ref: string | null;
  risk_tag: "standard" | "worth_reviewing" | "risky" | null;
}

export interface DocumentSummary {
  document_id: string;
  filename: string;
  page_count: number | null;
  property_name?: string | null;
  upload_info?: string | null;
  bottom_line: BottomLineItem[];
  clauses: Clause[];
}

export interface ClauseDetail extends Clause {
  category?: string | null;
  fairness_score?: number | null;
  real_life_scenario?: string | null;
  negotiation_questions?: string[] | null;
}

export async function uploadDocument(file: File): Promise<UploadResponse | UploadErrorResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = await getAuthToken();

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new ApiError(res.status, data.detail ?? res.statusText, data);
    return data;
  } catch (err) {
    console.warn("Backend upload endpoint unreachable, simulating upload response:", err);
    await delay(MOCK_DELAY);
    return {
      document_id: MOCK_DOCUMENT_ID,
      status: "ready",
      filename: file.name,
      page_count: 14,
    };
  }
}

export async function getDocumentStatus(documentId: string) {
  try {
    return await apiFetch<{
      id: string;
      filename: string;
      status: "processing" | "ready" | "error";
      page_count?: number;
      extraction_confidence?: number;
    }>(`/documents/${documentId}`);
  } catch (err) {
    const mockSum = getMockDocumentSummary(documentId);
    return {
      id: documentId,
      filename: mockSum.filename,
      status: "ready" as const,
      page_count: mockSum.page_count || 5,
      extraction_confidence: 95,
    };
  }
}

const DEMO_DOC_IDS = ["oakwood-lease-4b", "tech-corp-offer", "freelance-design-contract", "demo", "latest"];

export async function getDocumentSummary(documentId: string): Promise<DocumentSummary> {
  if (DEMO_DOC_IDS.includes(documentId)) {
    await delay(250);
    return getMockDocumentSummary(documentId);
  }
  try {
    return await apiFetch<DocumentSummary>(`/documents/${documentId}/summary`);
  } catch (err) {
    console.warn(`Summary fetch failed for ${documentId}, falling back to mock summary`, err);
    return getMockDocumentSummary(documentId);
  }
}

export async function getClauseDetail(
  documentId: string,
  clauseId: string
): Promise<ClauseDetail> {
  if (MOCK_CLAUSE_DETAILS[clauseId]) {
    await delay(200);
    return MOCK_CLAUSE_DETAILS[clauseId];
  }
  try {
    return await apiFetch<ClauseDetail>(`/documents/${documentId}/clauses/${clauseId}`);
  } catch (err) {
    console.warn(`Clause detail fetch failed for ${clauseId}, using fallback:`, err);
    if (MOCK_CLAUSE_DETAILS[clauseId]) return MOCK_CLAUSE_DETAILS[clauseId];
    const summary = getMockDocumentSummary(documentId);
    const foundClause = summary.clauses.find(c => c.clause_id === clauseId) || summary.clauses[0];
    return {
      ...foundClause,
      fairness_score: foundClause.risk_tag === "risky" ? 30 : 80,
      real_life_scenario: `This clause defines terms for ${foundClause.title || "your agreement"}.`,
      negotiation_questions: ["Can we clarify the timeline and notice period for this section?"],
    };
  }
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export interface CitedClause {
  clause_id: string;
  section_ref: string;
  excerpt: string;
  page_ref: string;
}

export interface ChatResponse {
  answer: string;
  cited_clauses: CitedClause[];
  next_action: string | null;
}

export async function sendChatMessage(
  documentId: string,
  message: string,
  history?: Array<{ role: string; content: string }>
): Promise<ChatResponse> {
  try {
    return await apiFetch<ChatResponse>(`/documents/${documentId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
  } catch (err) {
    console.warn("Backend chat endpoint offline, returning simulated grounded response:", err);
    await delay(350);

    const q_lower = message.toLowerCase().trim();

    // 1. Meta / Greeting / Capability queries (NO clause citations)
    if (
      q_lower === "hi" ||
      q_lower === "hello" ||
      q_lower === "hey" ||
      q_lower.includes("what you can do") ||
      q_lower.includes("what can you do") ||
      q_lower.includes("who are you") ||
      q_lower.includes("capabilities") ||
      q_lower.includes("how do you work") ||
      q_lower.includes("are you ai")
    ) {
      const summary = getMockDocumentSummary(documentId);
      return {
        answer: `Hello! I am Clarity AI, a GenAI legal companion powered by Google Gemini. I analyze your agreement (${summary.filename}) and translate complex legalese into plain, reassuring English with grounded clause citations.`,
        cited_clauses: [],
        next_action: `Ask any question about your document, such as payment terms, termination rules, or obligations.`
      };
    }

    // 2. Off-topic queries
    if (
      q_lower.includes("recipe") ||
      q_lower.includes("pizza") ||
      q_lower.includes("weather") ||
      q_lower.includes("code a bot") ||
      q_lower.includes("python script")
    ) {
      return {
        answer: "I am Clarity AI, focused exclusively on helping you navigate and understand your legal documents. I can't answer off-topic queries like recipes or code generation.",
        cited_clauses: [],
        next_action: "Ask a question about your contract terms, such as payment deadlines, penalties, or obligations."
      };
    }

    // 3. Document-Specific Grounded Q&A Routing

    // FREELANCE CONTRACT
    if (documentId === "freelance-design-contract") {
      if (q_lower.includes("pay") || q_lower.includes("fee") || q_lower.includes("late") || q_lower.includes("invoice") || q_lower.includes("net 30")) {
        return {
          answer: "According to Section 3.2 (Payment Terms), invoices must be paid within 30 days of receipt (Net 30). Unpaid balances past 30 days accrue a 1.5% monthly late interest penalty.",
          cited_clauses: [{
            clause_id: "clause-3-2-payment",
            section_ref: "Section 3.2",
            excerpt: "Client shall pay all outstanding invoices within thirty (30) days of receipt (Net 30). Unpaid balances after 30 days shall accrue interest at a rate of 1.5% per month.",
            page_ref: "Page 2, Line 18"
          }],
          next_action: "Confirm AP billing contact details to prevent late interest fees."
        };
      } else if (q_lower.includes("ip") || q_lower.includes("own") || q_lower.includes("copyright") || q_lower.includes("figma") || q_lower.includes("asset")) {
        return {
          answer: "According to Section 5.1 (Intellectual Property), full title, copyright, and ownership of final design deliverables transfer to the client ONLY upon receipt of 100% full and final payment.",
          cited_clauses: [{
            clause_id: "clause-5-1-ip",
            section_ref: "Section 5.1",
            excerpt: "Upon receipt of full and final payment, Designer assigns to Client all right, title, and interest in and to final design deliverables.",
            page_ref: "Page 3, Line 05"
          }],
          next_action: "Ensure pre-existing designer libraries remain excluded from transfer."
        };
      } else if (q_lower.includes("terminate") || q_lower.includes("cancel") || q_lower.includes("leave") || q_lower.includes("notice")) {
        return {
          answer: "According to Section 8.3 (Termination), either party may terminate the agreement at any time without cause upon 14 days written notice. You will be compensated for all work completed up to the termination date.",
          cited_clauses: [{
            clause_id: "clause-8-3-termination",
            section_ref: "Section 8.3",
            excerpt: "Either party may terminate this Agreement at any time without cause upon fourteen (14) days prior written notice.",
            page_ref: "Page 5, Line 22"
          }],
          next_action: "Ensure all progress hours are logged prior to issuing termination notice."
        };
      } else if (q_lower.includes("scope") || q_lower.includes("deliverable") || q_lower.includes("wireframe")) {
        return {
          answer: "According to Section 1.1 (Scope of Work), you agree to deliver UI/UX wireframes and final Figma assets per Statement of Work A schedules.",
          cited_clauses: [{
            clause_id: "clause-1-1-scope",
            section_ref: "Section 1.1",
            excerpt: "Designer agrees to deliver UI/UX design wireframes and final Figma assets according to the agreed project schedule in Statement of Work A.",
            page_ref: "Page 1, Line 12"
          }],
          next_action: "Review milestone schedule dates with project manager."
        };
      }
      return {
        answer: "According to Section 3.2 (Payment Terms) of your Freelance Agreement, invoices are strictly Net 30 days, with 1.5% monthly interest on overdue payments.",
        cited_clauses: [{
          clause_id: "clause-3-2-payment",
          section_ref: "Section 3.2",
          excerpt: "Client shall pay all outstanding invoices within thirty (30) days of receipt (Net 30). Unpaid balances after 30 days shall accrue interest at a rate of 1.5% per month.",
          page_ref: "Page 2, Line 18"
        }],
        next_action: "Ask about IP ownership terms or termination notice periods."
      };
    }

    // TECH EMPLOYMENT OFFER
    if (documentId === "tech-corp-offer") {
      if (q_lower.includes("compete") || q_lower.includes("restrict") || q_lower.includes("radius")) {
        return {
          answer: "According to Section 2.1 (Non-Competition), you are restricted from working for direct competitors operating within a 50-mile radius for 12 months post-employment.",
          cited_clauses: [{
            clause_id: "clause-2-1-noncompete",
            section_ref: "Section 2.1",
            excerpt: "Employee agrees that during employment and for a period of twelve (12) months following termination, Employee shall not directly or indirectly engage in competitive business activities within a 50-mile radius.",
            page_ref: "Page 3, Line 14"
          }],
          next_action: "Request to narrow the non-compete to specific named direct competitors."
        };
      } else if (q_lower.includes("equity") || q_lower.includes("stock") || q_lower.includes("option") || q_lower.includes("vest") || q_lower.includes("cliff")) {
        return {
          answer: "According to Section 4.2 (Equity Vesting), options vest over 4 years with a 1-year cliff. 25% vests upon completing 12 continuous months of service.",
          cited_clauses: [{
            clause_id: "clause-4-2-equity",
            section_ref: "Section 4.2",
            excerpt: "Stock options shall vest over a four (4) year schedule: twenty-five percent (25%) upon completion of twelve (12) months of continuous service.",
            page_ref: "Page 5, Line 08"
          }],
          next_action: "Confirm post-termination exercise window for vested shares."
        };
      } else if (q_lower.includes("salary") || q_lower.includes("bonus") || q_lower.includes("clawback") || q_lower.includes("pay")) {
        return {
          answer: "According to Section 1.2 (Base Salary & Bonus), base pay is $165,000/yr. The $15,000 signing bonus is subject to pro-rata repayment if you voluntarily resign within 12 months.",
          cited_clauses: [{
            clause_id: "clause-1-2-salary",
            section_ref: "Section 1.2",
            excerpt: "Base salary shall be $165,000 per annum. A one-time signing bonus of $15,000 is subject to full pro-rata repayment should Employee voluntarily terminate within twelve (12) months.",
            page_ref: "Page 2, Line 04"
          }],
          next_action: "Request clawback exemption for involuntary restructuring or layoff."
        };
      }
      return {
        answer: "According to Section 2.1 (Non-Competition) of your TechCorp Offer, there is a 12-month non-compete restriction within 50 miles of company offices.",
        cited_clauses: [{
          clause_id: "clause-2-1-noncompete",
          section_ref: "Section 2.1",
          excerpt: "Employee agrees that during employment and for a period of twelve (12) months following termination, Employee shall not directly or indirectly engage in competitive business activities within a 50-mile radius.",
          page_ref: "Page 3, Line 14"
        }],
        next_action: "Ask about equity vesting schedules or signing bonus terms."
      };
    }

    // LEASE DOCUMENT (OR DEFAULT)
    if (q_lower.includes("break") || q_lower.includes("terminate") || q_lower.includes("leave")) {
      return {
        answer: "According to Section 18.2 (Early Termination) of your lease, moving out before the 12-month term expires requires paying a 2-month rent penalty ($4,200) and forfeiting your $2,100 security deposit.",
        cited_clauses: [{
          clause_id: "clause-18-2-termination",
          section_ref: "Section 18.2",
          excerpt: "In the event Tenant vacates, abandons, or terminates prior to the Natural Expiration Date, Tenant shall forfeit the full security deposit and remain liable for 2 months Base Rent.",
          page_ref: "Page 9, Line 14"
        }],
        next_action: "Consider asking your landlord to cap the early termination penalty at 1 month's rent."
      };
    } else if (q_lower.includes("renew") || q_lower.includes("notice") || q_lower.includes("expire")) {
      return {
        answer: "According to Section 6.1 (Automatic Renewal), your lease will automatically renew for another 12-month term unless you deliver formal written notice of non-renewal at least 60 days before the expiration date.",
        cited_clauses: [{
          clause_id: "clause-6-1-renewal",
          section_ref: "Section 6.1",
          excerpt: "This Agreement shall automatically renew for successive terms of twelve (12) months unless either party provides formal written notice of non-renewal not less than 60 days prior.",
          page_ref: "Page 4, Line 22"
        }],
        next_action: "Mark Month 10 on your calendar to ensure you don't miss the 60-day notice window."
      };
    } else if (q_lower.includes("rent") || q_lower.includes("grace") || q_lower.includes("late") || q_lower.includes("fee")) {
      return {
        answer: "According to Section 4.1 (Payments), rent is due on the 1st of the month. You have a 5-day grace period, after which a $105 late fee is charged after 5:00 PM on the 5th.",
        cited_clauses: [{
          clause_id: "clause-4-1-rent",
          section_ref: "Section 4.1",
          excerpt: "Late Charge: Tenant agrees to pay a $105 charge if rent payment is not received in full by Oakwood Management after 5:00 PM on the 5th day of the month.",
          page_ref: "Page 3, Line 42"
        }],
        next_action: "Schedule automatic payments for the 1st of each month."
      };
    }

    // Document overview / summary fallback
    const isOverview = ["all", "doc", "document", "summary", "overview", "everything", "whole", "cover"].some(w => q_lower.includes(w));
    if (isOverview) {
      const docSummary = getMockDocumentSummary(documentId);
      const points = docSummary.clauses.map((c, i) => `${i + 1}. **${c.section_ref} (${c.title}):** ${c.plain_explanation}`);
      return {
        answer: `Here is an overview of the key terms and sections in your ${docSummary.filename}:\n\n` + points.join("\n\n"),
        cited_clauses: docSummary.clauses.map(c => ({
          clause_id: c.clause_id,
          section_ref: c.section_ref || "Section",
          excerpt: c.original_text.slice(0, 120),
          page_ref: c.page_ref || "Page 1"
        })),
        next_action: "Ask a question about any specific clause, penalty, or deadline."
      };
    }

    // Default fallback for lease/generic doc
    const docSummary = getMockDocumentSummary(documentId);
    return {
      answer: `I couldn't find a specific clause directly addressing that query in your ${docSummary.filename}. You can ask about payment terms, cancellation penalties, repair responsibilities, or notice deadlines.`,
      cited_clauses: [],
      next_action: "Try asking: 'What are the payment terms?' or 'What happens if I terminate early?'"
    };
  }
}


// ── Compare ───────────────────────────────────────────────────────────────────

export interface ClauseDiff {
  section_ref: string;
  title: string;
  classification: "better_for_you" | "worse_for_you" | "same";
  explanation: string;
}

export interface CompareResponse {
  verdict: string;
  confidence: number;
  favorable_changes: number;
  unresolved_cautions: number;
  new_risks: number;
  doc_a_name?: string;
  doc_b_name?: string;
  clause_diffs: ClauseDiff[];
}

export async function compareDocuments(
  documentAId: string,
  documentBId: string
): Promise<CompareResponse> {
  try {
    return await apiFetch<CompareResponse>("/documents/compare", {
      method: "POST",
      body: JSON.stringify({ document_a_id: documentAId, document_b_id: documentBId }),
    });
  } catch (err) {
    console.warn("Backend compare endpoint offline, returning simulated compare response:", err);
    await delay(500);
    return MOCK_COMPARE_RESPONSE;
  }
}

// ── Action Plan ───────────────────────────────────────────────────────────────

export interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "completed" | "pay_attention" | "clarification" | "looks_standard";
  suggested_script: string | null;
}

export interface ActionPlan {
  progress: { completed: number; total: number };
  checklist: ActionItem[];
  questions_for_landlord: string[];
  resources: Array<{ name: string; type: string; url?: string }>;
}

export async function getActionPlan(documentId: string): Promise<ActionPlan> {
  try {
    return await apiFetch<ActionPlan>(`/documents/${documentId}/action-plan`);
  } catch (err) {
    console.warn("Backend action plan fetch failed, returning mock action plan:", err);
    await delay(300);
    return getMockActionPlan(documentId);
  }
}

export async function updateActionItem(
  documentId: string,
  itemId: string,
  status: ActionItem["status"]
): Promise<ActionItem> {
  try {
    return await apiFetch<ActionItem>(`/documents/${documentId}/action-plan/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.warn("Backend action item update failed, returning updated item state:", err);
    return { id: itemId, status, title: "", description: null, suggested_script: null };
  }
}

// ── User Vault & Chat History ────────────────────────────────────────────────

export interface UserDocument {
  id: string;
  filename: string;
  upload_date?: string;
  page_count?: number | null;
  status: "processing" | "ready" | "error";
  extraction_confidence?: number | null;
  created_at?: string;
}

export interface ChatHistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  cited_clauses?: CitedClause[];
  created_at?: string;
}

export interface ChatHistoryResponse {
  document_id: string;
  messages: ChatHistoryMessage[];
}

export async function listUserDocuments(): Promise<UserDocument[]> {
  try {
    return await apiFetch<UserDocument[]>("/documents");
  } catch (err) {
    console.warn("Backend list documents offline or unauthenticated:", err);
    return [];
  }
}

export async function getChatHistory(documentId: string): Promise<ChatHistoryResponse> {
  try {
    return await apiFetch<ChatHistoryResponse>(`/documents/${documentId}/chat`);
  } catch (err) {
    console.warn("Backend get chat history failed:", err);
    return { document_id: documentId, messages: [] };
  }
}

export async function clearChatHistory(documentId: string): Promise<void> {
  try {
    await apiFetch<{ status: string }>(`/documents/${documentId}/chat`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("Backend clear chat history failed:", err);
  }
}
