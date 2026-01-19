ini adalah potongan environment pada aplikasi flutter
abstract class Env {
// Backend API URL - NanoBanana Comic
static const baseUrl = "https://nanobanana-backend-1089713441636.asia-southeast2.run.app/api/v1/";
// static const baseUrl = "http://127.0.0.1:8000/api/v1/";

static const webUrl = "https://nanobananacomic-482111.web.app/#";

// Google OAuth Client ID for Android (from google-services.json client_type: 1)
static const googleAndroidClientId = String.fromEnvironment(
"GOOGLE_ANDROID_CLIENT_ID",
defaultValue: "1089713441636-fv0khnam30oh590o0n9vppl5slsqb3vd.apps.googleusercontent.com",
);

// Google OAuth Client ID for Web (client_type: 3)
static const googleWebClientId = String.fromEnvironment(
"GOOGLE_WEB_CLIENT_ID",
defaultValue: "1089713441636-4btiht0lnc7kl8hvv6nv8i57q8fdkq9k.apps.googleusercontent.com",
);

// Server Client ID - used for backend token verification (Web Client ID)
static const googleServerClientId = String.fromEnvironment(
"GOOGLE_SERVER_CLIENT_ID",
defaultValue: "1089713441636-4btiht0lnc7kl8hvv6nv8i57q8fdkq9k.apps.googleusercontent.com",
);

// Legacy alias - use platform-specific IDs above instead
static const googleClientId = googleAndroidClientId;

static const firebaseWebApiKey = String.fromEnvironment(
"FIREBASE_WEB_API_KEY",
defaultValue:
"AIzaSyA7wbE5q9St-AuqgtsRjvNCIlxJiAHgsX8", // Ambil dari 'Browser key' di Firebase Console
);
static const firebaseAndroidApiKey = String.fromEnvironment(
"FIREBASE_ANDROID_API_KEY",
defaultValue:
"AIzaSyA7UM5oIVWrVhiC7qcWzXEPhO-maG9zRgc", // Ambil dari 'Android key' di Firebase Console
);
static const firebaseIosApiKey = String.fromEnvironment("FIREBASE_IOS_API_KEY");

// Use mock endpoints when database is down
static const bool useMockData = false; // Set to false when database is fixed

static String get comicsEndpoint =>
useMockData ? '$baseUrl/v1/comics-mock' : '$baseUrl/v1/comics';
static String get stylesEndpoint =>
useMockData ? '$baseUrl/v1/styles-mock' : '$baseUrl/v1/styles';
static String get genresEndpoint =>
useMockData ? '$baseUrl/v1/genres-mock' : '$baseUrl/v1/genres';

// Resend Email API
static const resendApiKey = String.fromEnvironment("RESEND_API_KEY");lanjut
static const resendSenderEmail = String.fromEnvironment(
"RESEND_SENDER_EMAIL",
defaultValue: "onboarding@resend.dev",
);
// Default recipient for testing/development if needed
static const resendRecipientEmail = String.fromEnvironment("RESEND_RECIPIENT_EMAIL");

// Admin email for withdrawal notifications
static const emailAdmin = String.fromEnvironment(
"EMAIL_ADMIN",
defaultValue: "yapri177@gmail.com",
);
}
