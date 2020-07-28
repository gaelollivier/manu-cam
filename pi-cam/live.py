import requests
import os
import base64
from io import BytesIO
import picamera
from time import sleep,time

camera = picamera.PiCamera()

# uploadUrl = "http://192.168.1.49:3000/api/upload-live"
uploadUrl = "https://manu-cam.vercel.app/api/upload-live"

while True:
    startTime = time()

    imageStream = BytesIO()
    camera.rotation = 270
    camera.resolution = (640,480)
    camera.capture(imageStream, format='jpeg', quality=10)
    imageStream.seek(0)
    try:
        res = requests.post(uploadUrl,
                            headers={'Authorization': 'Bearer ' + os.environ['MANUCAM_AUTH']},
                            files={'image': imageStream})
        try:
            endTime = time()
            print(res.json(), ' [', round(endTime - startTime, 2), 's ]')
        except:
            print("Invalid response")
            print(res.text)
    except Exception as err:
        print("Failed to upload image")
        print(err)    
    
    # sleep(2)
