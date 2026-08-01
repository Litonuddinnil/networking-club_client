import React from "react";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "member" | "admin";
  memberId?: string;
  department?: string;
  xp?: number;
  joinedDate?: string;
}

export interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  login: (email: string, pass: string) => Promise<any>;
  register: (email: string, pass: string, name: string, dept: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  createUser: (email: string, password: string) => Promise<any>;
  signInUser: (email: string, password: string) => Promise<any>;
  googleLogIn: () => Promise<any>;
  logOut: () => Promise<void>;
  userUpdateProfile: (name: string, photo: string) => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}