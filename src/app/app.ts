import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  protected readonly title = signal('join');

  /** Checks the current session and redirects to summary or login accordingly. */
  async ngOnInit() {
    const { data } = await this.supabaseService.getSession();

    if (data.session) {
      await this.supabaseService.restoreUserName();
      this.router.navigate(['/summary']);
    } else {
      this.router.navigate(['/login']);
    }
  }

}
