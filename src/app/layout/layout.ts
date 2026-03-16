import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Navi } from './navi/navi';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Header, Navi, RouterOutlet,],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})

export class Layout { }
