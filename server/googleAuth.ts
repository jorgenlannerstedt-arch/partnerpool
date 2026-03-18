import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import { authStorage } from "./replit_integrations/auth/storage";

export function setupGoogleAuth(app: Express) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        proxy: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = `google_${profile.id}`;
          const email = profile.emails?.[0]?.value;
          const firstName = profile.name?.givenName;
          const lastName = profile.name?.familyName;
          const profileImageUrl = profile.photos?.[0]?.value;

          await authStorage.upsertUser({
            id: googleId,
            email,
            firstName,
            lastName,
            profileImageUrl,
          });

          const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

          const user = {
            claims: {
              sub: googleId,
              email,
              first_name: firstName,
              last_name: lastName,
              profile_image_url: profileImageUrl,
            },
            expires_at: expiresAt,
          };

          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );

  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["openid", "email", "profile"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",
    }),
    (_req, res) => {
      res.redirect("/");
    }
  );
}
