# Quisat Attendant

The canteen attendant app for **Quisat Pocket Pay**. Attendants make card sales, activate student cards, help reset card PINs, top up cards by mobile money, and request sale reversals (approved by the school admin on the web dashboard).

## Run

```bash
npm install
npx expo start
```

The app talks to `https://app.quisat.com/api/v1` by default. To use another backend:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000/api/v1 npx expo start
```

## First login

1. A school admin adds the attendant (name + phone) under **Pocket Pay → Canteens → canteen → Add attendant**.
2. The attendant receives a 4-digit one-time PIN by SMS (via MarzSMS).
3. In the app: **Set up your account** → phone → one-time PIN → choose a 4-digit PIN.

Five wrong PINs lock the account for 30 minutes; **Forgot PIN** sends a new one-time PIN.

## Backend endpoints

All under `/api/v1/attendant/` in the Quisat Laravel app (`routes/api.php`, `App\Http\Controllers\Api\PocketPay`).

## Build

```bash
npx eas build --platform android --profile preview   # APK for canteen phones
```
