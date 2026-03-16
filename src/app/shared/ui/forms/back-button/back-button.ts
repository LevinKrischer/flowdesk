import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  imports: [],
  templateUrl: './back-button.html',
  styleUrl: './back-button.scss',
})

export class BackButton {
  private location = inject(Location);
  private router = inject(Router);

  /** Navigates to the previous page, or falls back to the summary page if there is no history. */
  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    void this.router.navigateByUrl('/summary');
  }
}
