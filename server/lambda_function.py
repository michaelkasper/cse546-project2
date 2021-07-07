import base64
import logging
import re
from io import BytesIO

import qrcode
from PIL import Image
from requests_toolbelt.multipart import decoder

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def decode_payload(event):
    body = event["body"]
    content_type = event["headers"]["content-type"]

    multipart_data = decoder.MultipartDecoder(base64.b64decode(body), content_type)
    payload = {}
    for part in multipart_data.parts:
        key = re.search("name=\"([a-zA-Z0-9_\-\.]*)\"", part.headers[b'Content-Disposition'].decode("utf-8")).group(1)
        payload[key] = part.content

    return payload


def create_qr_code(message, dimensions):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(message)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
    return qr_img.resize(dimensions)


def convert_to_png(image):
    buf = BytesIO()
    image.save(buf, format='PNG')
    return buf.getvalue()


def lambda_handler(event, context):
    try:
        payload = decode_payload(event)

        image_data = payload['image']
        qr_text = payload['qrText']
        qr_position = (int(payload['qrPositionX']), int(payload['qrPositionY']))
        img_dimensions = (int(payload['imgSizeW']), int(payload['imgSizeH']))
        qr_dimensions = (int(payload['qrSizeW']), int(payload['qrSizeH']))

        image = Image.open(BytesIO(image_data))
        image_resize = image.resize(img_dimensions)

        qr_img = create_qr_code(qr_text, qr_dimensions)

        image_resize.paste(qr_img, qr_position)

        final_img = convert_to_png(image_resize)

        return {
            'headers': {"Content-Type": "image/png"},
            'statusCode': 200,
            'body': base64.b64encode(final_img).decode('ascii'),
            'isBase64Encoded': True
        }

    except:
        return {
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "image/jpeg"
            },
            'statusCode': 400
        }

# for local testing
#
# if __name__ == "__main__":
#     f = open('test.json', )
#     data = json.load(f)
#
#     r = lambda_handler(data, [])
#     print(r)
