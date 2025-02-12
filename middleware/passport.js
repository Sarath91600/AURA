const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// Configure Passport with Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "1083584210338-33btbpm63moankang4cf28jdgbena352.apps.googleusercontent.com",
      clientSecret:"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",
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Here you can save user data to the database if needed
        console.log("Google profile:", profile);
        return done(null, profile); // Pass the profile to serializeUser
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
