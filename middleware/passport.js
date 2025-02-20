const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require('../models/userModel');  // Adjust the path to your User model

passport.use(new GoogleStrategy(
  {
    clientID: "90027017610-tken3km8bsrvrca79g91splhti0emakt.apps.googleusercontent.com",
    clientSecret: "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",

    callbackURL: "http://localhost:4000/auth/google/callback",
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // Create a new user if they don't exist
        user = new User({
          fullName: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          mobile: "", // No mobile provided by Google
          password: "" // No password needed for Google sign-in
        });
        await user.save(); // Save the user in the database
      }

      // Proceed with the authentication flow
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialize the user id to store it in the session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize the user to get the full user object
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);  // Handle any error while retrieving user from DB
  }
});

module.exports = passport;
