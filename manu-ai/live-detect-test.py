from time import sleep,time
import cv2
import numpy as np
import os
import pathlib
import picamera
import requests
import tensorflow as tf
from io import BytesIO
from picamera.array import PiRGBArray

# uploadUrl = "http://192.168.1.49:3000/api/upload-live"
uploadUrl = "https://manu-cam.vercel.app/api/upload-live"

# Load the TFLite model and allocate tensors
modelPath = str(pathlib.Path(__file__).parent / 'tflite-manu_images_v1' / 'model.tflite')
interpreter = tf.lite.Interpreter(model_path=modelPath)
interpreter.allocate_tensors()

camera = picamera.PiCamera()

# camera.rotation = 0
camera.resolution = (1024,768)

def setInputImage(image):
    interpreter.set_tensor(interpreter.get_input_details()[0]['index'], [image])

def getOutputRects():
    return interpreter.get_tensor(interpreter.get_output_details()[0]['index'])[0]

def getOutputScores():
    return interpreter.get_tensor(interpreter.get_output_details()[2]['index'])[0]

def detectManu():
    image = PiRGBArray(camera)
    camera.capture(image, 'bgr')
    image = image.array
    # image = cv2.imread('./test.jpg', cv2.IMREAD_COLOR)

    # Resize to tensorflow expected size
    image = cv2.resize(image, (512, 512))

    setInputImage(image)

    interpreter.invoke()

    bestScore = getOutputScores()[0]
    
    bestRect = getOutputRects()[0]

    box = {
        'score': float(bestScore),
        'x1': float(bestRect[1]),
        'y1': float(bestRect[0]),
        'x2': float(bestRect[3]),
        'y2': float(bestRect[2]),
    }

    (_, imageStream) = cv2.imencode('.jpg', image)

    return (imageStream, box)

while True:
    startTime = time()    

    # Detect manu
    (imageStream, box) = detectManu()
    
    try:
        res = requests.post(uploadUrl,
                            headers={'Authorization': 'Bearer ' + os.environ['MANUCAM_AUTH']},
                            files={'image': imageStream},
                            data=box)
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