__author__ = 'Epsirom'

from django.http import HttpResponse, Http404
import qrcode
from PIL import Image


def get_qr_code(request, qrmsg, qrtype):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=0
    )
    qr.add_data(qrmsg)
    qr.make(fit=True)
    img = qr.make_image()
    response = HttpResponse(content_type='image/png')
    if qrtype == 'wide':
        (x, y) = img.size
        newImg = Image.new('RGBA', (x * 7, x), (255, 255, 255))
        newImg.paste(img, (x * 3, 0))
        newImg.save(response, 'png')
    else:
        img.save(response, 'png')
    return response

