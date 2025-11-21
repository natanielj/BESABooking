from fastapi import FastAPI, Request

from fastapi.middleware.cors import CORSMiddleware

# from api import calendarAPI
from datetime import datetime, timedelta

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore # For Firestore
from mangum import Mangum


# Path to FIREBASE service account key file
cred = credentials.Certificate("../serviceAccountKey.json")
firebase_admin.initialize_app(cred)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://besa-booking-git-backendv4-be-student-ambassadors-projects.vercel.app/", # preview environment deploy
    "https://besa-booking.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

SCOPES = ['https://www.googleapis.com/auth/calendar.events']

creds = Credentials.from_authorized_user_file("token.json", SCOPES)
calendar_service = build("calendar", "v3", credentials=creds)
db = firestore.client()

handler = Mangum(app)


def getEvents():
    tours_ref = db.collection('Tours')
    docs = tours_ref.stream()



def createEvent(data):
    start_dt = datetime.strptime(
        f"{data['date']} {data['time']}",
        "%Y-%m-%d %I:%M %p"
    )
    end_dt = start_dt + timedelta(hours=1)
    # print("Using service account:", creds.service_account_email)


    event = {
        "summary": data.get("tourType", "Event"),
        "description": f"Tour ID: {data['tourId']}\n"
                        f"Name: {data['firstName']} {data['lastName']}\n"
                        f"Organization: {data['organization']}\n"
                        f"Role: {data['role']}\n"
                        f"Interests: {', '.join(data.get('interests', []))}\n"
                        f"Notes: {data.get('notes', '')}",
        "start": {
            "dateTime": start_dt.isoformat(),
            "timeZone": "America/Los_Angeles",
        },
        "end": {
            "dateTime": end_dt.isoformat(),
            "timeZone": "America/Los_Angeles",
        },
        "attendees": [
            {"email": data["email"]}
        ],
    }

    created_event = calendar_service.events().insert(
        calendarId="primary",
        body=event,
        sendUpdates="all"
    ).execute()

    return created_event



# need to create functions that Create, Get, and Delete Events

# sample
@app.get('/')
def root():
    return {"Hello": "World"}


# Create/Insert Event given a specific time, date, location, attendees, description, reminders?, 

# sample query: 
# http://127.0.0.1:8000/book-tour/?attendeeEmail="njayasee@ucsc.edu"&dateTime="2025-07-06XYZ"&tourId="tourtype"

@app.post('/book-tour/')
# async def create_event(attendeeEmail: str, dateTime: str, tourId: str):
async def create_event(request: Request):

    data = await request.json()
    createEvent(data)
    return {"message": "Tour created successfully!", "data": data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)