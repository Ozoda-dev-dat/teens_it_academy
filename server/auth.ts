import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends Omit<SelectUser, 'password'> {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "teens-it-school-secret-2024",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: false, // Set to false for Replit environment
      sameSite: 'lax' // Allow cross-site requests in iframe
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  // Lightweight request logging for API routes to help debug session/cookie behavior
  app.use('/api', (req: any, _res: any, next: any) => {
    try {
      console.log('API request:', {
        method: req.method,
        path: req.path,
        sessionID: req.sessionID || null,
        hasCookie: !!req.headers?.cookie,
        isAuthenticated: typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false,
        userId: req.user?.id ?? null,
      });
    } catch (err) {
      console.debug('API request logging failed', err);
    }
    next();
  });
  app.use(passport.initialize());
  app.use(passport.session());

  // Use email instead of username for authentication
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        console.log('🔍 Login attempt:', { email, passwordLength: password.length });
        const user = await storage.getUserByEmail(email);
        console.log('👤 User found:', user ? 'YES' : 'NO');
        
        if (!user) {
          console.log('❌ User not found');
          return done(null, false);
        }
        
        const passwordMatch = await comparePasswords(password, user.password);
        console.log('🔐 Password match:', passwordMatch);
        
        if (!passwordMatch) {
          console.log('❌ Password mismatch');
          return done(null, false);
        } else {
          console.log('✅ Login successful');
          return done(null, user);
        }
      } catch (error) {
        console.log('💥 Auth error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        // Remove password from user object for security
        const { password, ...publicUser } = user;
        done(null, publicUser as Express.User);
      } else {
        done(null, null);
      }
    } catch (error) {
      done(error);
    }
  });


  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Tizimga kirishda xatolik yuz berdi" });
      }
      if (!user) {
        return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Tizimga kirishda xatolik yuz berdi" });
        }
        // Remove password from response for security
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    try {
      console.log('/api/user called - isAuthenticated:', typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false, 'sessionID:', req.sessionID || null);
    } catch (err) {
      console.debug('Error logging /api/user call', err);
    }
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Password is already excluded from req.user
    res.json(req.user);
  });
}
