import json
import urllib.parse
import boto3
import base64
from PIL import Image
import qrcode


print('Loading function')

s3 = boto3.client('s3')


def lambda_handler(event, context):
    #READING PARAMETERS FROM THE REQUEST DICT
    event_id = event['queryStringParameters']['id']
    image_data = event['queryStringParameters']['imageData']
    qr_text = event['queryStringParameters']['qrText']
    qr_position_x,qr_position_y = (event['queryStringParameters']['qrPositionX'],event['queryStringParameters']['qrPositionY'])
    img_w,img_h = (event['queryStringParameters']['imgSizeW'],event['queryStringParameters']['imgSizeH'])
    qr_w,qr_h = (event['queryStringParameters']['qrSizeW'],event['queryStringParameters']['qrSizeH'])

    #GRABBING AND PROCESSING THE INPUT IMAGE TO ADD QR CODE INTO IT

    #resizing input image to given dimensions
    imgdata = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(imgdata))
    image = image.resize((int(img_w),int(img_h)))
    #generating the qr code from given qr text
    qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
    )
    qr.add_data(qr_text)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
    # qr_img = qrcode.make(qr_text)
    qr_img = qr_img.resize((int(qr_w),int(qr_h)))

    #Overlaying qr code on the resized image
    final_img = image.copy()
    final_img.paste(qr_img,(int(qr_position_x),int(qr_position_y)))

    #CONSTRUCTING THE BODY OF THE RESPONSE
    edit_response = {}
    edit_response['id'] = event_id
    edit_response['embedded_link'] = qr_text
    edit_response['edited_image'] = final_img.toString('base64') 

    #CONSTRUCTING THE FULL RESPONSE
    responseObject = {}
    responseObject["statusCode"] = 200
    responseObject['headers'] = {}
    responseObject['headers']['Content-Type'] = "json"
    responseObject['body'] = json.dumps(edit_response)

    #RETURNING THE EDITED IMAGE response
    return responseObject
