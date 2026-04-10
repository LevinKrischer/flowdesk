import { Component, HostListener, signal } from '@angular/core';
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
  pageTitle = signal('');

  private readonly pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/add-task': 'Add Task',
    '/board': 'Board',
    '/contacts': 'Contacts',
    '/help': 'Help',
    '/privacy-policy': 'Privacy Policy',
    '/legal-notice': 'Legal Notice',
  };

  constructor(private router: Router, public supabaseService: SupabaseService) {
    this.updatePageTitle(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.menuOpen = false;
        this.updatePageTitle(event.urlAfterRedirects);
      });
  }

  private updatePageTitle(url: string): void {
    const path = url.split('?')[0].split('#').pop() ?? '';
    this.pageTitle.set(this.pageTitles[path] ?? '');
  }

  /**
   * Toggles the profile menu and prevents document click handlers.
   * @param event Mouse click event from the profile button.
   * @returns Nothing.
   */
  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  /**
   * Logs out the current user and redirects to the login page.
   * @returns Promise that resolves after logout navigation is triggered.
   */
  async logout() {
    const userName = this.supabaseService.userName();
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/login'], { queryParams: { loggedOut: userName || true } });
    } catch {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Closes the profile menu when user clicks outside profile/menu elements.
   * @param event Global document click event.
   * @returns Nothing.
   */
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
