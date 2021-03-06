# -*- coding: utf-8 -*-
# FIXME: This module could need some attention and polishing.

import os
from io import BytesIO
from datetime import datetime

from django.conf import settings
from PyPDF2 import PdfFileWriter, PdfFileReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, Paragraph, SimpleDocTemplate

from .util import grouper


if __name__ == '__main__':
    from .pdfstimuli import gettext as _
else:
    from django.utils.translation import ugettext as _

A8 = (74 * mm, 52 * mm)
paper_size = A8
pad = 3 * mm

DATE_FORMAT = '%Y-%m-%d'
DATETIME_FORMAT = '%Y-%m-%d %H:%M'

font = ('Helvetica', 12)
group_font = ('Helvetica-Bold', 14)
footer_font = ('Helvetica', 8)

try:
    pdfmetrics.registerFont(TTFont('CourierNew-Bold', os.path.join(settings.PROJECT_ROOT, 'courbd.ttf')))
    code_font = ('CourierNew-Bold', 23)
except:
    code_font = ('Courier-Bold', 23)

class RefillCard(object):
    def __init__(self, balance_code):
        self.balance_code = balance_code

    def save(self, file_object):
        c = canvas.Canvas(file_object, pagesize=A8)
        w, h = paper_size
        code = self.balance_code
        series = code.refill_series

        font_height = 9.8 # FIXME: how fetch programmatically?
        topmost_off = h-(pad+font_height)

        c.setFont(*font)
        c.drawString(pad, topmost_off, 'Baljan (baljan.org)')
        c.drawRightString(w-pad, topmost_off, '%d %s' % (code.value, code.currency))

        add_to_group = series.add_to_group
        if add_to_group:
            c.setFont(*group_font)
            c.drawCentredString(w/2, h * 0.7, add_to_group.name.lstrip("_"))

        c.setFont(*code_font)
        c.drawCentredString(w/2, h * 0.46, code.code)

        c.setFont(*footer_font)
        c.drawString(pad, pad,
                _('expires no sooner than %s') \
                    % series.least_valid_until.strftime(DATE_FORMAT))
        c.drawRightString(w-pad, pad, '%d.%d' % (series.pk, code.pk))
        c.showPage()
        c.save()
        return c


def refill_series(file_object, list_of_series):
    out_pdf = PdfFileWriter()
    for series in list_of_series:
        balance_codes = series.balancecode_set.all().order_by('pk')
        for balance_code in balance_codes:
            card = RefillCard(balance_code)
            buf = BytesIO()
            card.save(buf)
            buf.seek(0)
            pdfbuf = PdfFileReader(buf)
            out_pdf.addPage(pdfbuf.getPage(0))
    out_pdf.write(file_object)
    return out_pdf


def shift_combinations(file_object, scheduler,
        empty_cells=False, cell_title=None):
    """`scheduler` as in the `workdist` module."""
    if cell_title is None:
        cell_title = _("work shifts")

    # FIXME: DRY in this function.
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Left", alignment=TA_LEFT))
    styles.add(ParagraphStyle(name="Center", alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="Right", alignment=TA_RIGHT))
    doc = SimpleDocTemplate(file_object)
    elems = []

    now = datetime.now()

    elems.append(
        Paragraph(_("Job Opening %s") % scheduler.sem.name,
            styles['Heading1']))

    data = []
    data.append(
        ['#', cell_title, '#', cell_title],
    )
    pairs = scheduler.pairs_from_db()
    taken_indexes = []
    for i, (p1, p2) in enumerate(grouper(2, pairs, None)):
        if p1.is_taken():
            taken_indexes.append((0, i))

        sh1 = [] if empty_cells else [str(sh.name_short()) for sh
                in p1.shifts]
        if p2 is None:
            data.append([p1.label, ', '.join(sh1), '', ''])
        else:
            sh2 = [] if empty_cells else [str(sh.name_short()) for sh
                    in p2.shifts]
            if p2.is_taken():
                taken_indexes.append((2, i))
            data.append([p1.label, ', '.join(sh1), p2.label, ', '.join(sh2)])

    bg_color = colors.black
    table_style = [
        ('GRID', (0, 0), (-1, -1), 0.15*mm, colors.black),
        ('FONT', (0, 0), (-1, -1), font[0]),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (0, -1), bg_color),
        ('BACKGROUND', (2, 0), (2, -1), bg_color),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.white),
        ('TEXTCOLOR', (2, 0), (2, -1), colors.white),

        ('FONT', (0, 0), (-1, 0), "%s-Bold" % font[0]),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ]
    for col, row in taken_indexes:
        incl_header = row + 1
        table_style += [('TEXTCOLOR', (col, incl_header), (col, incl_header), bg_color)]
        table_style += [('TEXTCOLOR', (col+1, incl_header), (col+1, incl_header), colors.grey)]

    table = Table(data, style=table_style)
    elems.append(table)

    elems.append(
        Paragraph(_("document generated %s") % now.strftime(DATETIME_FORMAT),
            styles['Center']))

    doc.build(elems)
    return doc



def shift_combination_form(file_object, scheduler):
    """`scheduler` as in the `workdist` module."""
    pad = 30 # ugly way of getting enough room for text
    return shift_combinations(file_object, scheduler,
            empty_cells=True,
            cell_title=" "*pad + _("liu ids") + " "*pad,
    )
