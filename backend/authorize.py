from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def main():
    creds = None

    # If token already exists, load it
    try:
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    except:
        pass

    # If no valid creds, go through login flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "client_secret.json", SCOPES
            )
            creds = flow.run_local_server(port=0)

        # Save the token for the backend to use
        with open("token.json", "w") as token_file:
            token_file.write(creds.to_json())

    print("Done! token.json created.")

if __name__ == "__main__":
    main()
