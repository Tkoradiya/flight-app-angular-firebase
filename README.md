# Flight App – Angular + Firebase

This project is my submission for the **Monster Coding Challenge**.  
It is an Angular web application deployed on **Firebase Hosting**, with authentication and a protected flight form that submits data to the provided backend API.

---

## Live Demo
    [Flight App on Firebase](https://flight-app-angular.web.app/login)

---

## Features
- **Authentication**
  - Email + Password login & registration
  - Google Sign-In
  - Forgot password (email reset link)
  - Denies access to the form unless logged in

- **Flight Information Form**
  - Collects:
    - Airline 
    - Arrival Date  
    - Arrival Time  
    - Flight Number  
    - Number of Guests  
    - Comments (optional)  
  - Required field validation

- **API Integration**
  - Submits form data via POST request to:
    ```
    https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge
    ```
  - Request Headers:
    - `token`:  
      ```
      WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh
      ```
    - `candidate`: `Twinkal Koradiya`
  - Request Payload:
    ```ts
    interface FlightInfoPayload {
      airline: string;
      arrivalDate: string;
      arrivalTime: string;
      flightNumber: string;
      numOfGuests: number;
      comments?: string;
    }
    ```

- **UI Feedback**
  - Success alert when submission completes
  - Error alert if submission fails
  - Local JSON preview for debugging

---

## Tech Stack
- Angular 
- Firebase Hosting  
- Firebase Authentication (Email/Password + Google Sign-In)  
- AngularFire + Firebase SDK  
- Angular HttpClient  

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Tkoradiya/flight-app-angular-firebase.git
cd flight-app-angular-firebase
  
2. Install Dependencies
    npm install

3. Firebase Setup

    Go to Firebase Console

    Create a project

    Enable Authentication (Email/Password + Google)

    Get your Firebase config and update src/environments/environment.ts:

    export const environment = {
        production: false,
        firebase: {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT.firebaseapp.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT.appspot.com",
            messagingSenderId: "YOUR_SENDER_ID",
            appId: "YOUR_APP_ID"
        }
    };


Running Locally: ng serve(http://localhost:4200)

Production Build & Firebase Hosting:
    ng build --configuration production
    npm install -g firebase-tools
    firebase login
    firebase init hosting
    firebase deploy --only hosting


