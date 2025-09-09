import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [FormsModule, NgIf, MatDatepickerModule,MatInputModule,MatNativeDateModule],
  templateUrl: './flight-form.html',
  styleUrl: './flight-form.css'
})
export class FlightForm implements OnInit {
  airline = '';
  arrivalDate = '';
  arrivalTime = '';
  flightNumber = '';
  numOfGuests = 1;
  comments = '';

  submittedPayload: any = null;
  dropdownOpen = false;

  constructor(
    public auth: Auth,
    private router: Router,
    private http: HttpClient  
  ) {}

  ngOnInit() {
    this.dropdownOpen = false;
  }

  /** Get user initials from displayName or email */
  getUserInitials(): string {
    const user = this.auth.currentUser;
    if (!user) return '?';

    const name = user.displayName || user.email || '';
    const parts = name.trim().split(' ');

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  loading = false; // 

  onSubmit(form: NgForm) {
    if (!this.airline || !this.arrivalDate || !this.arrivalTime || !this.flightNumber) {
      alert('Please fill out all required fields');
      return;
    }
    const normalizedTime = this.to24Hour(this.arrivalTime);
    const payload = {
      airline: this.airline,
      arrivalDate: this.arrivalDate,
      arrivalTime: this.arrivalTime,
      flightNumber: this.flightNumber,
      numOfGuests: this.numOfGuests,
      comments: this.comments
    };

    console.log("Flight Payload:", payload);
    this.submittedPayload = payload; 

    const headers = new HttpHeaders({
      token: "WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh",
      candidate: "Twinkal Koradiya"
    });

    this.loading = true; 

    this.http.post(
      'https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge',
      payload,
      { headers }
    ).subscribe({
      next: (res) => {
        console.log("API Response:", res);
        this.submittedPayload = { ...payload, serverResponse: res };

        alert('Flight info successfully submitted!');

        // Reset form fields
        form.resetForm(); //
        this.numOfGuests = 1; 
      },
      error: (err) => {
        console.error("API Error:", err);
        alert('Submission failed: ' + (err.message || 'Unknown error'));
      },
      complete: () => {
        this.loading = false; 
      }
    });
  }

  to24Hour(time: string): string {
    if (!time) return time;
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }
    const date = new Date(`1970-01-01T${time}`);
    return date.toTimeString().slice(0, 5); // "HH:mm"
  }

  disableTyping(event: KeyboardEvent) {
    event.preventDefault(); 
  }

  async onLogout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  toggleDropdown() {
    console.log("Toggling dropdown");
    this.dropdownOpen = !this.dropdownOpen;
  }
}
