import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from '@angular/fire/auth';
import { sendPasswordResetEmail } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  successMessage = '';
  isRegisterMode = false;
  isForgotPasswordMode = false;

  constructor(private router: Router, private auth: Auth) {
    console.log('Active Firebase Project:', this.auth.app.options);
  }

  /** 🔹 Map Firebase errors to user-friendly messages */
  private getFriendlyErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/invalid-email': 'Invalid email address format.',
      'auth/user-disabled': 'This account has been disabled. Contact support.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/popup-closed-by-user': 'Google sign-in popup was closed.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };
    return messages[code] || 'An unexpected error occurred. Please try again.';
  }

  /** 🔹 Login */
  async onLogin() {
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      console.log('Login success:', userCredential.user);
      this.successMessage = 'Login successful! Redirecting...';
      setTimeout(() => this.router.navigate(['/flight-form']), 1500);
    } catch (error: any) {
      console.error('Login failed:', error);
      this.errorMessage = this.getFriendlyErrorMessage(error.code);
    }
  }

  /** 🔹 Register */
  async onRegister() {
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      console.log('Registration success:', userCredential.user);
      this.successMessage = 'Registration successful! Please log in.';
      this.isRegisterMode = false;
    } catch (error: any) {
      console.error('Registration failed:', error);
      this.errorMessage = this.getFriendlyErrorMessage(error.code);
    }
  }

  /** 🔹 Forgot Password */
  async onForgotPassword() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email first.';
      return;
    }
    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.successMessage =
        'If this email is registered, a password reset link has been sent.';
      this.errorMessage = '';
      this.isForgotPasswordMode = false;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      this.errorMessage = this.getFriendlyErrorMessage(error.code);
    }
  }

  /** 🔹 Google Login */
  async onGoogleLogin() {
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      console.log('Google login success:', result.user);
      this.successMessage = 'Google login successful! Redirecting...';
      setTimeout(() => this.router.navigate(['/flight-form']), 1500);
    } catch (error: any) {
      console.error('Google login failed:', error);
      this.errorMessage = this.getFriendlyErrorMessage(error.code);
    }
  }

  /** 🔹 UI toggles */
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleRegisterMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.isForgotPasswordMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleForgotPasswordMode() {
    this.isForgotPasswordMode = !this.isForgotPasswordMode;
    this.isRegisterMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
