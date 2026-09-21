"""
Test seed script to generate a PDF with a planted contradiction.
Use this to test the Stage 4 consistency agent.
Run this script, then upload the generated PDF to the /documents/upload endpoint.
"""
import fitz  # PyMuPDF

def generate_contradictory_lease(output_path: str = "contradiction_lease.pdf"):
    doc = fitz.open()
    page = doc.new_page()
    
    # Write a simple lease with a clear contradiction
    text = """
    APARTMENT LEASE AGREEMENT
    
    Section 1. Security Deposit
    Tenant agrees to pay a security deposit of $1,000. Landlord shall hold this deposit 
    and return it within 30 days of lease termination. Under no circumstances shall the 
    security deposit be used to cover normal wear and tear or routine cleaning fees.
    
    Section 2. Maintenance
    Tenant is responsible for keeping the apartment clean.
    
    Section 3. Early Termination
    If Tenant terminates this lease early, Tenant must pay a penalty equal to one month's rent.
    
    Section 4. Move-out Requirements
    Upon move-out, a mandatory routine cleaning fee of $300 will be automatically 
    deducted from the Tenant's security deposit, regardless of the apartment's condition.
    """
    
    page.insert_text((50, 50), text, fontsize=12)
    doc.save(output_path)
    print(f"Generated test lease at {output_path}")

if __name__ == "__main__":
    generate_contradictory_lease()
