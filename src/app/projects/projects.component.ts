import { Component } from '@angular/core';
import { DownloadService } from 'src/assets/download.service';
import Typed from 'typed.js';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {

  projects = [
    {
      title: 'Project 1',
      description: 'Movie Scope (Angular | TMDB API)',
      imageUrl: '././.././../assets/project/P3.webp',
      websiteUrl: 'https://movie-mtizo.vercel.app/', // Replace with the actual URL
    },
    {
      title: 'Project 2',
      description: 'Business website(UX/UI) Html & Css',
      imageUrl: '././.././../assets/project/P4.webp',
      websiteUrl: 'https://business-mtizo.vercel.app/', // Replace with the actual URL
    },
    {
      title: 'Project 3',
      description: 'Budget Management Platform',
      imageUrl: '././.././../assets/project/P5.webp',
      websiteUrl: 'http://oddmaroc.com/pages-login', // Replace with the actual URL
    },
    {
      title: 'e commerce website',
      description: 'E commerce website',
      imageUrl: '././.././../assets/project/P6.webp',
      websiteUrl: 'https://example.com/project3', // Replace with the actual URL
    },

  ];
}
