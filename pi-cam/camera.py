import requests
import os
from io import BytesIO
import picamera
from time import sleep

camera = picamera.PiCamera()

# uploadUrl = "http://192.168.1.49:3000/api/upload-live"
# uploadUrl = "https://manu-cam.vercel.app/api/upload-live"

# uploadUrl = "http://192.168.1.49:3000/api/upload"
uploadUrl = "https://manu-cam.vercel.app/api/upload"

while True:
    imageStream = BytesIO()
    # camera.rotation = 0
    camera.resolution = (2028,1520)
    camera.capture(imageStream, format='jpeg', quality=10)
    imageStream.seek(0)
    try:
        res = requests.post(uploadUrl,
                            headers={'Authorization': 'Bearer ' + os.environ['MANUCAM_AUTH']},
                            files={'image': imageStream})
        try:
            print(res.json())
        except:
            print("Invalid response")
            print(res.text)
    except Exception as err:
        print("Failed to upload image")
        print(err)
    
    # Delay to avoid taking too many pictures
    sleep(5)
