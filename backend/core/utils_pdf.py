import io
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import qrcode
from datetime import datetime
from .models import VehicleQRCode

def generate_estimate_pdf(estimate, service_order):
    buffer = io.BytesIO()
    
    # We use SimpleDocTemplate for easy tables
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
    elements = []
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Right', alignment=2))
    
    # Header
    header_data = [
        [Paragraph("<b>PREMIUM AUTO SERVICE</b><br/>Service & Repair Center", styles['Normal']),
         Paragraph(f"<b>Estimate #{estimate.id if estimate else 'DRAFT'}</b><br/>Date: {datetime.now().strftime('%d %b %Y')}", styles['Right'])]
    ]
    t = Table(header_data, colWidths=[4*inch, 3*inch])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 20),
    ]))
    elements.append(t)
    
    # Customer and Vehicle Info
    customer = service_order.vehicle.owner
    cust_name = f"{customer.first_name} {customer.last_name}" if customer else "Guest Customer"
    
    info_data = [
        ["CUSTOMER", "VEHICLE"],
        [cust_name, f"{service_order.vehicle.make} {service_order.vehicle.model}"],
        ["Phone: +91 XXXXX XXXXX", f"Reg: {service_order.vehicle.registration_number}"],
        ["Email: customer@example.com", f"VIN: {service_order.vehicle.vin}"]
    ]
    
    t_info = Table(info_data, colWidths=[3.5*inch, 3.5*inch])
    t_info.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), colors.HexColor('#111112')),
        ('TEXTCOLOR', (0,0), (1,0), colors.whitesmoke),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('TEXTCOLOR', (0,1), (-1,-1), colors.black),
    ]))
    elements.append(t_info)
    elements.append(Spacer(1, 0.3*inch))
    
    # Line Items
    items_data = [["DESCRIPTION", "QTY", "RATE", "TOTAL"]]
    total = 0
    if estimate:
        for item in estimate.items.all():
            line_total = item.quantity * item.unit_price
            total += line_total
            items_data.append([
                item.description,
                str(item.quantity),
                f"Rs. {item.unit_price}",
                f"Rs. {line_total}"
            ])
    else:
        # Mock Data
        items_data.append(["Brake Pad Set", "1", "Rs. 18000", "Rs. 18000"])
        items_data.append(["Labor", "2.5", "Rs. 1200", "Rs. 3000"])
        items_data.append(["Paint Correction", "1", "Rs. 5500", "Rs. 5500"])
        total = 26500

    t_items = Table(items_data, colWidths=[3.5*inch, 1*inch, 1.25*inch, 1.25*inch])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('LINEBELOW', (0,0), (-1,0), 1, colors.black),
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
    ]))
    elements.append(t_items)
    
    # Totals
    elements.append(Spacer(1, 0.2*inch))
    tax = float(total) * 0.18
    grand_total = float(total) + tax
    
    totals_data = [
        ["Subtotal", f"Rs. {total}"],
        ["Tax (18%)", f"Rs. {tax}"],
        ["TOTAL", f"Rs. {grand_total}"]
    ]
    t_totals = Table(totals_data, colWidths=[5.5*inch, 1.5*inch])
    t_totals.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('LINEABOVE', (0,-1), (-1,-1), 1, colors.black),
    ]))
    elements.append(t_totals)
    
    # Barcode / QR (using dynamic vehicle history QR)
    qr_code = VehicleQRCode.objects.filter(vehicle=service_order.vehicle, is_active=True).first()
    if qr_code:
        base_url = os.getenv('VEHICLE_HISTORY_BASE_URL', 'https://repairtrace.app')
        qr_data = f"{base_url}/v/{qr_code.token}"
    else:
        qr_data = f"VERIFY:EST-{service_order.order_number}"
        
    qr = qrcode.QRCode(version=1, box_size=3, border=1)
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    # ReportLab can handle PIL Images natively
    from reportlab.platypus import Image
    import tempfile
    
    # Temporary file for QR code
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tf:
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(tf.name)
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph("Scan for Digital Vehicle History:", styles['Normal']))
        elements.append(Image(tf.name, width=1*inch, height=1*inch, hAlign='LEFT'))

    doc.build(elements)
    
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
