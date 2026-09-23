"""
Script to generate authentic Indian Residential Lease Agreements in PDF format.
Outputs:
- Apartment_Lease_Original.pdf
- Apartment_Lease_Revised.pdf
"""
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "DocTitle",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=18,
    leading=22,
    textColor=colors.HexColor("#1A1C1E"),
    spaceAfter=6,
)

subtitle_style = ParagraphStyle(
    "DocSubtitle",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=10,
    leading=14,
    textColor=colors.HexColor("#43474E"),
    spaceAfter=14,
)

h1_style = ParagraphStyle(
    "SectionHeading",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=12,
    leading=16,
    textColor=colors.HexColor("#005AC1"),
    spaceBefore=10,
    spaceAfter=4,
)

body_style = ParagraphStyle(
    "ClauseBody",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor("#1A1C1E"),
    spaceAfter=6,
)


def generate_original_pdf(filepath: str):
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=40, bottomMargin=40)
    story = []

    story.append(Paragraph("RESIDENTIAL LEASE AGREEMENT (INDIA)", title_style))
    story.append(Paragraph(
        "<b>Property:</b> Flat No. 4B, Palm Grove Heights, 100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038<br/>"
        "<b>Lessor / Landlord:</b> Palm Grove Properties Pvt. Ltd. | <b>Lessee / Tenant:</b> [Tenant Name]<br/>"
        "<b>Term:</b> 11 Months Lock-in | <b>Effective Date:</b> 1st October 2026 | <b>Jurisdiction:</b> Bengaluru, Karnataka",
        subtitle_style
    ))

    story.append(Paragraph("SECTION 4 — RENT, SECURITY DEPOSIT & PAYMENT TERMS", h1_style))
    story.append(Paragraph(
        "<b>4.1 Monthly Rent, Due Dates & Grace Period:</b> Tenant agrees to pay a monthly rent of <b>INR 35,000.00 (Rupees Thirty-Five Thousand only)</b>, payable on or before the 1st day of each English calendar month into Landlord's designated bank account via NEFT/UPI/RTGS. Tenant shall have a five (5) day grace window. <i>Late Fee:</i> A penalty of <b>INR 1,500.00</b> shall be charged if rent is not received in full by 5:00 PM on the 5th day of the calendar month.",
        body_style
    ))
    story.append(Paragraph(
        "<b>4.2 Interest-Free Refundable Security Deposit:</b> Prior to occupancy, Tenant shall deposit an interest-free refundable security deposit of <b>INR 1,05,000.00 (Rupees One Lakh Five Thousand only)</b>, equivalent to three (3) months' rent. This deposit shall be refunded within twenty-one (21) days of peaceful vacating, subject to deductions under Section 9.3.",
        body_style
    ))

    story.append(Paragraph("SECTION 6 — DURATION, LOCK-IN & RENEWAL", h1_style))
    story.append(Paragraph(
        "<b>6.1 11-Month Lock-in Period & Escalation:</b> This Agreement shall remain in force for an initial lock-in period of eleven (11) months. Neither party may terminate during this lock-in except under Clause 18.2. In the event of mutual renewal, the monthly rent shall automatically escalate by 10% (ten percent) for the succeeding eleven-month term.",
        body_style
    ))

    story.append(Paragraph("SECTION 9 — MAINTENANCE & MINOR REPAIRS", h1_style))
    story.append(Paragraph(
        "<b>9.1 Landlord Structural Obligations:</b> Landlord shall maintain the structural integrity of the flat, external walls, roof seepage, main electrical risers, and primary drainage conduits.",
        body_style
    ))
    story.append(Paragraph(
        "<b>9.3 Tenant Maintenance Threshold:</b> Tenant assumes full responsibility for minor day-to-day repairs, internal plumbing washer replacements, and appliance service calls costing <b>under INR 1,500.00</b>. Major breakdown of built-in fixtures resulting from normal wear and tear shall be borne by Landlord.",
        body_style
    ))
    story.append(Paragraph(
        "<b>9.4 Move-Out Painting & Cleaning Deductions:</b> A mandatory one-month deduction or INR 15,000.00 shall be assessed automatically against the security deposit for professional repainting and deep cleaning upon surrender, regardless of premises condition.",
        body_style
    ))

    story.append(Paragraph("SECTION 12 — LANDLORD INSPECTION & PRIVACY", h1_style))
    story.append(Paragraph(
        "<b>12.1 Right of Entry:</b> Landlord or authorized representatives may inspect the premises during reasonable daylight hours with twenty-four (24) hours prior notice, or immediately without notice in emergencies.",
        body_style
    ))

    story.append(Paragraph("SECTION 14 — PET RULES & SOCIETY BYLAWS", h1_style))
    story.append(Paragraph(
        "<b>14.1 Domestic Pets:</b> Keeping domestic pets requires prior written permission from Landlord and compliance with Resident Welfare Association (RWA) bylaws, subject to a recurring monthly maintenance charge of <b>INR 2,000.00</b> and a non-refundable pet sanitation deposit of <b>INR 15,000.00</b>.",
        body_style
    ))

    story.append(Paragraph("SECTION 18 — LOCK-IN BREACH & EARLY TERMINATION", h1_style))
    story.append(Paragraph(
        "<b>18.1 Notice of Termination:</b> After expiry of the 11-month lock-in, either party may terminate this Agreement by serving two (2) calendar months' advance notice in writing.",
        body_style
    ))
    story.append(Paragraph(
        "<b>18.2 Lock-in Breach & Liquidated Damages:</b> In the event Tenant vacates, abandons, or terminates prior to completion of the 11-month lock-in period, Tenant shall forfeit the full security deposit (<b>INR 1,05,000.00</b>) and remain liable to pay liquidated damages equal to two (2) months' rent (<b>INR 70,000.00</b>).",
        body_style
    ))

    story.append(Paragraph("SECTION 22 — GOVERNING LAW & JURISDICTION", h1_style))
    story.append(Paragraph(
        "<b>22.1 Indian Contract Act & Stamp Duty:</b> This Agreement is governed by the Indian Contract Act, 1872 and the Transfer of Property Act, 1882. All disputes shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.",
        body_style
    ))

    doc.build(story)
    print(f"Generated Indian original agreement at {filepath}")


def generate_revised_pdf(filepath: str):
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=40, bottomMargin=40)
    story = []

    story.append(Paragraph("RESIDENTIAL LEASE AGREEMENT — REVISED DRAFT (INDIA)", title_style))
    story.append(Paragraph(
        "<b>Property:</b> Flat No. 4B, Palm Grove Heights, 100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038<br/>"
        "<b>Counter-Offer Addendum:</b> Negotiated Terms via Clarity AI | <b>Effective Date:</b> 1st October 2026",
        subtitle_style
    ))

    story.append(Paragraph("SECTION 4 — RENT, SECURITY DEPOSIT & PAYMENT TERMS [ACCEPTED]", h1_style))
    story.append(Paragraph(
        "<b>4.1 Monthly Rent & Grace Window:</b> Monthly Rent of <b>INR 35,000.00</b> due on the 1st of each calendar month. 5-day grace period with INR 1,500 late fee retained as standard.",
        body_style
    ))
    story.append(Paragraph(
        "<b>4.2 Security Deposit Refund:</b> Security deposit of <b>INR 1,05,000.00</b> refundable in full within fifteen (15) banking days of handover with itemized inspection report.",
        body_style
    ))

    story.append(Paragraph("SECTION 9 — MAINTENANCE & REPAIRS [AMENDED]", h1_style))
    story.append(Paragraph(
        "<b>9.3 Tenant Maintenance Threshold:</b> Minor repairs under <b>INR 1,500.00</b> handled by Tenant. Major appliances and plumbing mains covered 100% by Landlord.",
        body_style
    ))
    story.append(Paragraph(
        "<b>9.4 Painting Deductions [REVISED]:</b> Actual repainting cost deduction capped at fair market value (maximum INR 7,500.00) only if walls show damage beyond ordinary wear and tear.",
        body_style
    ))

    story.append(Paragraph("SECTION 14 — PET POLICY [AMENDED]", h1_style))
    story.append(Paragraph(
        "<b>14.1 Pet Allowance:</b> Monthly pet charge waived. Non-refundable fee converted to a <b>refundable pet deposit of INR 10,000.00</b> returned upon move-out if no pet damage exists.",
        body_style
    ))

    story.append(Paragraph("SECTION 18 — EARLY TERMINATION PENALTY [REVISED & BALANCED]", h1_style))
    story.append(Paragraph(
        "<b>18.2 Early Termination Compromise:</b> In the event of early termination with 60 days' written notice, Tenant forfeits NO security deposit. Early exit fee is capped at <b>one (1) month rent (INR 35,000.00)</b> instead of two months, and deposit is refunded in full.",
        body_style
    ))

    story.append(Paragraph("SECTION 22 — GOVERNING LAW & ARBITRATION", h1_style))
    story.append(Paragraph(
        "<b>22.1 Dispute Resolution:</b> Governed by the laws of India. Any disputes to be resolved amicably through fast-track arbitration under the Arbitration and Conciliation Act, 1996 in Bengaluru.",
        body_style
    ))

    doc.build(story)
    print(f"Generated Indian revised agreement at {filepath}")


if __name__ == "__main__":
    generate_original_pdf("Apartment_Lease_Original.pdf")
    generate_revised_pdf("Apartment_Lease_Revised.pdf")
