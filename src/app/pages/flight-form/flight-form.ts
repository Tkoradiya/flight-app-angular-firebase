import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signOut, User } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgIf } from '@angular/common';

// Angular Material
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Third-party timepicker
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

// Environment config
import { environment } from '../../../environments/environment';

export interface FlightInfoPayload {
  airline: string;
  arrivalDate: string; // ISO date string
  arrivalTime: string; // HH:mm
  flightNumber: string;
  numOfGuests: number;
  comments?: string;
}

@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    NgxMatTimepickerModule,
  ],
  templateUrl: './flight-form.html',
  styleUrls: ['./flight-form.css'],
})
export class FlightForm {
  /**reactive form */
  form!: FormGroup<{
    airline: FormControl<string>;
    arrivalDate: FormControl<Date | null>;
    arrivalTime: FormControl<string>;
    flightNumber: FormControl<string>;
    numOfGuests: FormControl<number>;
    comments: FormControl<string | null>;
  }>;

  loading = false;
  apiError: string | null = null;
  dropdownOpen = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private auth: Auth
  ) {
    this.form = this.fb.group({
      airline: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      arrivalDate: this.fb.control<Date | null>(null, {
        validators: [Validators.required, FlightForm.dateValidator],
      }),
      arrivalTime: this.fb.control('', {
        validators: [Validators.required, FlightForm.timeValidator],
        nonNullable: true,
      }),
      flightNumber: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      numOfGuests: this.fb.control(1, {
        validators: [Validators.required, Validators.min(1)],
        nonNullable: true,
      }),
      comments: this.fb.control('', { nonNullable: false }),
    });
  }

  //  User profile helpers

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  get userInitials(): string {
    const name = this.auth.currentUser?.displayName || this.auth.currentUser?.email || '';
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  }

  get userDisplayName(): string {
    return this.auth.currentUser?.displayName || '';
  }

  get userEmail(): string {
    return this.auth.currentUser?.email || '';
  }

  //Submit

  submit() {
    this.apiError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { airline, arrivalDate, arrivalTime, flightNumber, numOfGuests, comments } =
      this.form.getRawValue();

    const normalizedDate = FlightForm.normalizeDate(arrivalDate);
    const normalizedTime = FlightForm.normalizeTime(arrivalTime);

    if (!normalizedDate || !normalizedTime) {
      this.apiError = 'Invalid arrival date or time.';
      return;
    }

    const payload: FlightInfoPayload = {
      airline,
      arrivalDate: normalizedDate,
      arrivalTime: normalizedTime,
      flightNumber,
      numOfGuests,
      ...(comments ? { comments } : {}),
    };

    const headers = new HttpHeaders({
      token: environment.apiToken,
      candidate: environment.candidateName,
    });

    this.loading = true;

    this.http.post(environment.apiUrl, payload, { headers }).subscribe({
      next: () => {
        //Reset form and clear validation state
        this.form.reset({ numOfGuests: 1 });
        Object.keys(this.form.controls).forEach((key) => {
          this.form.get(key)?.setErrors(null);
          this.form.get(key)?.markAsPristine();
          this.form.get(key)?.markAsUntouched();
        });

        // Show inline success
        this.apiError = null;
        (document.querySelector('.success-text') as HTMLElement).innerText =
          'Flight info submitted successfully!';
      },
      error: (err) => {
        this.apiError = err.message || 'Unknown error while submitting.';
      },
      complete: () => (this.loading = false),
    });
  }

  // Timepicker handler

  onTimeSelected(time: string) {
    const formatted = FlightForm.normalizeTime(time);
    if (formatted) {
      this.form.patchValue({ arrivalTime: formatted });
      this.form.get('arrivalTime')?.updateValueAndValidity();
    }
  }

  // Helpers & Validators

  static normalizeDate(date: Date | string | null): string | null {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  static normalizeTime(time: string): string | null {
    if (!time) return null;

    //Case 1: already strict 24h (HH:mm)
    if (/^\d{2}:\d{2}$/.test(time)) return time;

    //Case 2: 12h AM/PM
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    //Fallback
    const parsed = new Date(`1970-01-01T${time}`);
    return isNaN(parsed.getTime()) ? null : parsed.toTimeString().slice(0, 5);
  }

  static dateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return FlightForm.normalizeDate(control.value) ? null : { invalidDate: true };
  }

  static timeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return FlightForm.normalizeTime(control.value) ? null : { invalidTime: true };
  }

  // Guest controls

  decreaseGuests() {
    const current = this.form.get('numOfGuests')?.value || 1;
    if (current > 1) this.form.patchValue({ numOfGuests: current - 1 });
  }

  increaseGuests() {
    const current = this.form.get('numOfGuests')?.value || 1;
    this.form.patchValue({ numOfGuests: current + 1 });
  }

  // Auth handling

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
