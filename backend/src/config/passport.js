const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const initializePassport = (passport) => {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'secret'
    };

    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch (error) {
            return done(error, false);
        }
    }));

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback'
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const user = {
                    id: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    provider: 'google'
                };
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }));
    }

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        done(null, { id });
    });
};

module.exports = { initializePassport };