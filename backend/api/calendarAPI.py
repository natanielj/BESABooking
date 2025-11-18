import firebase_admin
from firebase_admin import credentials

# Path to your service account key file
cred = credentials.Certificate("../serviceAccountKey.json")
firebase_admin.initialize_app(cred)


def createEvent(bookingData):
    print(bookingData)