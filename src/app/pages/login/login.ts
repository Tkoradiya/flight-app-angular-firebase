import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// ✅ Use AngularFire for Auth injection
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

// ✅ Use Firebase SDK for account lookup & reset
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';


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

  // Modes
  isRegisterMode = false;
  isForgotPasswordMode = false;

  constructor(private router: Router, private auth: Auth) {

    console.log("🔥 Active Firebase Project:", this.auth.app.options);

  }

  /** 🔹 Login */
  async onLogin() {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      console.log('✅ Login success:', userCredential.user);
      this.router.navigate(['/flight-form']);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      this.errorMessage = error.message;
    }
  }

  /** 🔹 Register */
  async onRegister() {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      console.log('✅ Registration success:', userCredential.user);
      alert('✅ Registration successful! Please log in.');
      this.isRegisterMode = false;
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      this.errorMessage = error.message;
    }
  }

  /** 🔹 Forgot Password */
  async onForgotPassword() {
  if (!this.email) {
    this.errorMessage = '⚠️ Please enter your email first.';
    return;
  }

  try {
    await sendPasswordResetEmail(this.auth, this.email);
    alert('📧 If this email is registered, a password reset link has been sent.');
    this.errorMessage = '';
  
  } catch (error: any) {
    console.error('❌ Forgot password error:', error);
    this.errorMessage = error.message;
  }
}

  /** 🔹 Google Login */
  async onGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      console.log('✅ Google login success:', result.user);
      this.router.navigate(['/flight-form']);
    } catch (error: any) {
      console.error('❌ Google login failed:', error);
      this.errorMessage = error.message;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleRegisterMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.isForgotPasswordMode = false;
    this.errorMessage = '';
  }

  toggleForgotPasswordMode() {
    this.isForgotPasswordMode = !this.isForgotPasswordMode;
    this.isRegisterMode = false;
    this.errorMessage = '';
  }
}
