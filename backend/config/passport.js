const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy-secret';

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn('WARNING: GOOGLE_CLIENT_ID is missing in .env. Google Login will not work.');
}

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;

      // Check if user exists by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        // No account found — pass error signal
        return done(null, false, { message: 'no_account' });
      }

      // User found — log them in
      return done(null, user);

    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
