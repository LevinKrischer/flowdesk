import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { InitialsPipe } from './../../services/initials.pipe';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterModule, InitialsPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  menuOpen = false;

  constructor(private router: Router, public supabaseService: SupabaseService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.menuOpen = false;
      });


  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  async logout() {
    const userName = this.supabaseService.userName();
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/login'], { queryParams: { loggedOut: userName || true } });
    } catch {
      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideProfile = target.closest('.userProfile');
    const clickedInsideMenu = target.closest('.userMenu');

    if (!clickedInsideProfile && !clickedInsideMenu) {
      this.menuOpen = false;
    }
  }
}
