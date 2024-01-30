import { Component } from '@angular/core';
import { DownloadService } from 'src/assets/download.service';
import Typed from 'typed.js';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {

  // projects = [
  //   {
  //     title: 'Project 1',
  //     description: 'Description for Project 1.',
  //     imageUrl: '././.././../assets/project/p1.png'
  //   },
  //   {
  //     title: 'Project 2',
  //     description: 'Description for Project 2.',
  //     imageUrl: '././.././../assets/project/P2.png'
  //   },
  //   {
  //     title: 'Project 3',
  //     description: 'Description for Project 2.',
  //     imageUrl: '././.././../assets/project/P2.png'
  //   },
  //   // Add more projects as needed
  // ];
  projects = [
    {
      title: 'Project 1',
      description: 'Movie Scope (Angular | TMDB API)',
      imageUrl: '././.././../assets/project/P3.png',
      websiteUrl: 'https://movie-mtizo.vercel.app/', // Replace with the actual URL
      hovered: false
    },
    {
      title: 'Project 2',
      description: 'Business website(UX/UI) Html & Css',
      imageUrl: '././.././../assets/project/P4.png',
      websiteUrl: 'https://business-mtizo.vercel.app/', // Replace with the actual URL
      hovered: false
    },
    // {
    //   title: 'Project 3',
    //   description: 'Description for Project 2.',
    //   imageUrl: '././.././../assets/project/P1.png',
    //   websiteUrl: 'https://example.com/project3', // Replace with the actual URL
    //   hovered: false
    // },
    // Add more projects as needed
  ];

  navigateToProjectWebsite(websiteUrl: string) {
    window.location.href = websiteUrl;
  }


  // Toggle the 'hovered' property on hover
  toggleHover(index: number) {
    this.projects[index].hovered = !this.projects[index].hovered;
  }
}
