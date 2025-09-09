import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true);  // ✅ logged in → allow
      } else {
        router.navigate(['/login']);
        resolve(false); // ❌ not logged in → redirect
      }
    });
  });
};

// Guard to block login page if already logged in
export const loginGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.navigate(['/flight-form']); // redirect to dashboard
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
