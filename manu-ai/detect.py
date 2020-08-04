import os
from pymongo import MongoClient
import cv2
from io import BytesIO
import tensorflow as tf
import pathlib
import numpy as np
import requests
from bson.objectid import ObjectId

# Load the TFLite model and allocate tensors
modelPath = str(pathlib.Path(__file__).parent / 'tflite-manu_images_v1' / 'model.tflite')
interpreter = tf.lite.Interpreter(model_path=modelPath)
interpreter.allocate_tensors()

def setInputImage(image):
    interpreter.set_tensor(interpreter.get_input_details()[0]['index'], [image])

def getOutputRects():
    return interpreter.get_tensor(interpreter.get_output_details()[0]['index'])[0]

def getOutputScores():
    return interpreter.get_tensor(interpreter.get_output_details()[2]['index'])[0]

def detectManu(imageUrl):
    # Download image
    resp = requests.get(imageUrl, stream=True).raw
    image = np.asarray(bytearray(resp.read()), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)

    # Resize to tensorflow expected size
    image = cv2.resize(image, (512, 512))

    setInputImage(image)

    interpreter.invoke()

    bestScore = getOutputScores()[0]

    if bestScore < 0.8:
        return

    bestRect = getOutputRects()[0]

    return {
        'score': float(bestScore),
        'x1': float(bestRect[1]),
        'y1': float(bestRect[0]),
        'x2': float(bestRect[3]),
        'y2': float(bestRect[2]),
    }

dbClient = MongoClient(os.environ['MONGO_URL'])

# query = {'_id': ObjectId('5f2408afb93e8300081f797a')}
query = {}

# Run detection on all images
for imageRecord in dbClient.get_database('manu_cam').get_collection('images').find(query):
    print("Running detection on", imageRecord['time'])
    box = detectManu(imageRecord['files']['large']['mediaLink'])
    if box != None:
        print(box)
        dbClient.get_database('manu_cam').get_collection('images').update_one(
            {'_id': imageRecord['_id']},
            { '$set': { 'manuDetection': box } }
        )