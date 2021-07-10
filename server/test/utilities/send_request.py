import sys

import requests
from PIL import Image
from dotenv import dotenv_values

config = {
    **dotenv_values("../.env"),
    **dotenv_values("../.env.local"),
}


def send_request(image, image_dir, results_dir):
    print("sent \t => \t" + image)

    height, width = Image.open(image_dir + image).size

    payload = {
        "image": open(image_dir + image, 'rb'),
        "qrText": (None, 'https://www.google.com'),
        "qrPositionX": (None, str(100)),
        "qrPositionY": (None, str(100)),
        "imgSizeW": (None, str(600)),
        "imgSizeH": (None, str((600 * width) / height)),
        "qrSizeW": (None, str(63 + 4 + 4)),
        "qrSizeH": (None, str(63 + 4 + 4)),
        "qrBoarder": (None, str(4)),
    }

    try:
        response = requests.post(config['REACT_APP_API'], files=payload)
        # Print error message if failed
        if response.status_code != 200:
            print('sendErr: ' + image)
        else:
            with open('img.png', 'wb') as out_file:
                result_name = "(100, 100) " + image.replace(".jpeg", ".png").replace(".jpg", ".png")
                file = open(results_dir + result_name, "wb")
                file.write(response.content)
                file.close()
            del response
            print("complete => \t" + image)
    except requests.exceptions.Timeout as e:
        print(e)
        raise SystemExit(e)
    except requests.exceptions.TooManyRedirects as e:
        print(e)
        raise SystemExit(e)
    except requests.exceptions.RequestException as e:
        print(e)
        raise SystemExit(e)
    except:
        print(sys.exc_info()[0])
        raise SystemExit(sys.exc_info()[0])
