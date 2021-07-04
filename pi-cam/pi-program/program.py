import requests
import os
from io import BytesIO
import picamera
from time import sleep,time
import sys

camera = picamera.PiCamera()

# uploadUrl = "http://192.168.1.49:3000/api/upload-live"
# uploadUrl = "https://manu-cam.vercel.app/api/upload-live"

# uploadUrl = "http://192.168.1.49:3000/api/upload"
uploadUrl = "https://manu-cam.vercel.app/api/upload"

while True:
    startTime = time()

    imageStream = BytesIO()
    # camera.rotation = 0
    camera.resolution = (2028,1520)

    # You can change these as needed. Six seconds (6000000)
    # is the max for shutter speed and 800 is the max for ISO.
    # camera.shutter_speed = 1000000
    # camera.iso = 800

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
    
    os.system('/opt/vc/bin/vcgencmd measure_temp')

    # Flush stdout to make sure logs are written after each run
    sys.stdout.flush()
    
    # Delay to avoid taking too many pictures
    sleep(60)