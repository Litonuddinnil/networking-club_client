import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from "react";

import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import app from "../firebase/firebase.config";
import { AuthContextType, UserProfile } from "../types/auth";
import { useAxiosPublic } from "../hooks/useAxiosPublic";

let auth: ReturnType<typeof getAuth>;
try {
  auth = getAuth(app);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("[AuthProvider] Firebase init failed:", err);
  auth = new Proxy({} as any, {
    get() {
      throw new Error(
        "Firebase Auth is not available — check VITE_FIREBASE_* env vars.",
      );
    },
  });
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const provider = new GoogleAuthProvider();
  const axiosPublic = useAxiosPublic();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const createUser = (email: string, password: string) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInUser = (email: string, password: string) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const googleLogIn = () => {
    setLoading(true);
    return signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    setLoading(true);
    await signOut(auth);
  };

  const userUpdateProfile = async (name: string, photo: string) => {
    if (!auth.currentUser) return;

    await updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });

    setUser((prev: any) => (prev ? { ...prev, displayName: name, photoURL: photo } : null));
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const fetchMemberByEmail = async (email: string): Promise<UserProfile | null> => {
    try {
      const { data } = await axiosPublic.get("/api/members");
      const found = Array.isArray(data)
        ? data.find((m: any) => m.email?.toLowerCase() === email.toLowerCase())
        : null;
      return found || null;
    } catch (err) {
      console.error("Failed to fetch member from database:", err);
      return null;
    }
  };

  const getRoleFromClaims = async (currentUser: NonNullable<typeof auth.currentUser>) => {
    const token = await currentUser.getIdTokenResult();
    return token.claims.admin === true ? "admin" : "member";
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInUser(email, pass);
      const dbMember = await fetchMemberByEmail(email);

      if (!dbMember) {
        throw new Error("No member record found in database for this account.");
      }

      const role = await getRoleFromClaims(userCredential.user);
      const enriched = {
        ...userCredential.user,
        uid: userCredential.user.uid,
        email: userCredential.user.email || "",
        displayName: dbMember.displayName || userCredential.user.displayName || "",
        role,
        memberId: dbMember.memberId,
        department: dbMember.department,
        xp: dbMember.xp,
        joinedDate: dbMember.joinedDate,
      };

      setUser(enriched);
      return enriched;
    } catch (err: any) {
      setError(err.message || "Login failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, dept: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUser(email, pass);

      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      const newMember: UserProfile = {
        uid: userCredential.user.uid,
        email,
        displayName: name,
        role: "member",
        department: dept,
        memberId: `JNC-${Date.now().toString().slice(-6)}`,
        xp: 0,
        joinedDate: new Date().toISOString(),
      };

      await axiosPublic.post("/api/members", newMember);

      const enriched = { ...userCredential.user, ...newMember };
      setUser(enriched);
      return enriched;
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logOut();
    setUser(null);
  };

  const updateProfileCompat = (updates: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      if (updates.displayName && auth.currentUser) {
        updateProfile(auth.currentUser, {
          displayName: updates.displayName,
        }).catch((err) => console.error(err));
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        const dbMember = await fetchMemberByEmail(currentUser.email);

        const role = await getRoleFromClaims(currentUser);
        const enrichedUser = {
          ...currentUser,
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: dbMember?.displayName || currentUser.displayName || "",
          role,
          memberId: dbMember?.memberId,
          department: dbMember?.department,
          xp: dbMember?.xp,
          joinedDate: dbMember?.joinedDate,
        };

        setUser(enrichedUser);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [axiosPublic]);

  const authInfo: AuthContextType = {
    user,
    loading,
    error,
    setLoading,
    createUser,
    signInUser,
    googleLogIn,
    logOut,
    userUpdateProfile,
    resetPassword,
    login,
    register,
    logout,
    updateProfile: updateProfileCompat,
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
