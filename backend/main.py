from fastapi import FastAPI

app = FastAPI()

# need to create functions that Create, Get, and Delete Events

# sample
@app.get('/')
def root():
    return {"Hello": "World"}


# Create/Insert Event given a specific time, date, location, attendees, description, reminders?, 


# event creation reference

# event = {
#   'summary': 'Google I/O 2015',
#   'location': '800 Howard St., San Francisco, CA 94103',
#   'description': 'A chance to hear more about Google\'s developer products.',
#   'start': {
#     'dateTime': '2015-05-28T09:00:00-07:00',
#     'timeZone': 'America/Los_Angeles',
#   },
#   'end': {
#     'dateTime': '2015-05-28T17:00:00-07:00',
#     'timeZone': 'America/Los_Angeles',
#   },
#   'recurrence': [
#     'RRULE:FREQ=DAILY;COUNT=2'
#   ],
#   'attendees': [
#     {'email': 'lpage@example.com'},
#     {'email': 'sbrin@example.com'},
#   ],
#   'reminders': {
#     'useDefault': False,
#     'overrides': [
#       {'method': 'email', 'minutes': 24 * 60},
#       {'method': 'popup', 'minutes': 10},
#     ],
#   },
# }

@app.get('/book-tour/')
async def create_event(attendeeEmail: str, dateTime: str, tourId: str):
    event = {
        'summary': tourId,
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
            'dateTime': dateTime,
            'timeZone': 'America/Los_Angeles',
        },
        'end': {
            'dateTime': dateTime,
            'timeZone': 'America/Los_Angeles',
        },
        # 'recurrence': [
        #     'RRULE:FREQ=DAILY;COUNT=2'
        # ],
        'attendees': [
            {'email': attendeeEmail},
        ],
        'reminders': {
            'useDefault': True,
            # 'overrides': [
            # {'method': 'email', 'minutes': 24 * 60},
            # {'method': 'popup', 'minutes': 10},
            # ],
        },
    }

    
    return {"create tour": event}