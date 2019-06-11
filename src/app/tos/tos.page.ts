import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tos',
  templateUrl: './tos.page.html',
  styleUrls: ['./tos.page.scss'],
})
export class TosPage implements OnInit {

  constructor(private router: Router,) { }

  ngOnInit() {
    this.router.navigateByUrl('/login'); 
  }

}
 