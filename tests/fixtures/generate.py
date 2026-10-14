"""Regenerate compact PDF integration fixtures with reportlab and pypdf."""
from pathlib import Path
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter
root=Path(__file__).parent
c=canvas.Canvas(str(root/'study.pdf'),pagesize=(612,792))
for n in range(1,9):
    c.bookmarkPage(f'page{n}')
    c.addOutlineEntry(f'Chapter {n}',f'page{n}')
    c.setFont('Helvetica',20)
    c.drawString(50,735,f'Chapter {n}: Contract law')
    c.setFont('Helvetica',12)
    c.drawString(50,700,'An offer requires acceptance. Acceptance creates agreement.')
    c.drawString(50,675,f'Page {n} discusses consideration and legal obligations.')
    if n==1:
        c.drawString(50,640,'Jump to chapter 3')
        c.linkRect('Chapter 3','page3',(50,635,190,655),relative=0)
        c.drawString(50,600,'Student name:')
        c.acroForm.textfield(name='student',tooltip='Student name',x=150,y=590,width=200,height=24)
    c.showPage()
c.save()
r=PdfReader(root/'study.pdf');w=PdfWriter(clone_from=r);w.pages[1].rotate(90);w.write(root/'mixed.pdf')
w=PdfWriter(clone_from=r);w.encrypt('reader-test');w.write(root/'locked.pdf')
w=PdfWriter(clone_from=PdfReader(root/'mixed.pdf'));w.encrypt('reader-test');w.write(root/'locked-other.pdf')
c=canvas.Canvas(str(root/'scanned.pdf'),pagesize=(612,792));c.setFillColorRGB(.88,.9,.88);c.rect(60,80,490,630,fill=1,stroke=0);c.showPage();c.save()
c=canvas.Canvas(str(root/'long.pdf'),pagesize=(612,792))
for n in range(1,121):
    c.drawString(50,730,f'Long document page {n}: reliable navigation and search.');c.showPage()
c.save()
(root/'broken.pdf').write_bytes(b'%PDF-1.7\nThis file is deliberately broken.')
