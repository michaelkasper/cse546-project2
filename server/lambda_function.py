import base64
import logging
import re
import sys
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


def create_qr_code(message, dimensions, qr_boarder):
    # qr v1 is a 21x21 dot square

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=round(((dimensions[0] - (qr_boarder * 2)) / 21), 0),
        border=qr_boarder,
    )
    qr.add_data(message)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
    return qr_img.resize(dimensions)


def convert_to_png(image):
    buf = BytesIO()
    image.save(buf, format='PNG')
    return buf.getvalue()


def validate_request(qr_text, qr_position, img_dimensions, qr_dimensions, qr_boarder):
    if not qr_text:
        raise ValueError('missing url')

    if qr_position[0] < 0 or qr_position[1] < 0:
        raise ValueError('bad qr position')

    if (
            img_dimensions[0] < 1 or
            img_dimensions[1] < 1 or
            qr_position[0] + qr_dimensions[0] > img_dimensions[0] or
            qr_position[1] + qr_dimensions[1] > img_dimensions[1]
    ):
        raise ValueError('image too small')

    if qr_boarder < 0:
        raise ValueError('invalid qr boarder')

    return True


def lambda_handler(event, context):
    try:
        payload = decode_payload(event)

        image_data = payload['image']
        qr_text = payload['qrText']
        qr_position = (int(float(payload['qrPositionX'])), int(float(payload['qrPositionY'])))
        qr_boarder = int(float(payload['qrBoarder']))
        img_dimensions = (int(float(payload['imgSizeW'])), int(float(payload['imgSizeH'])))
        qr_dimensions = (int(float(payload['qrSizeW'])), int(float(payload['qrSizeH'])))

        # error check
        validate_request(qr_text, qr_position, img_dimensions, qr_dimensions, qr_boarder)

        qr_text = re.sub("^(?!https?:\/\/)", "http://", qr_text.decode('utf-8'), 1)

        image = Image.open(BytesIO(image_data))

        image_resize = image.resize(img_dimensions)

        qr_img = create_qr_code(qr_text, qr_dimensions, qr_boarder)

        image_resize.paste(qr_img, qr_position)

        final_img = convert_to_png(image_resize)

        return {
            'headers': {"Content-Type": "image/png"},
            'statusCode': 200,
            'body': base64.b64encode(final_img).decode('ascii'),
            'isBase64Encoded': True
        }

    except TypeError as e:
        logger.info(e)
        return {
            'statusCode': 400,
            'body': str(e.args)
        }
    except ValueError as e:
        logger.info(e)
        return {
            'statusCode': 400,
            'body': str(e.args)
        }
    except (IOError, SyntaxError) as e:
        logger.info(e)
        return {
            'statusCode': 400,
            'body': 'bad image'
        }
    except:
        logger.info(sys.exc_info()[0])
        return {
            'statusCode': 500,
            'body': str(sys.exc_info()[0])
        }

# for local testing
#
# if __name__ == "__main__":
#     f = open('test.json', )
#     data = json.load(f)
#
#     r = lambda_handler(data, [])
#     print(r)
