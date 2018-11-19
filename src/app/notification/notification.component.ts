import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html'
})
export class NotificationComponent implements OnInit {

  @Input('show')
  notificationShow: boolean;

  @Input('message')
  notificationMessage: string;

  @Input('type')
  notificationType: string;

  constructor() { }

  ngOnInit() {
    if(this.notificationShow == null){
      this.notificationShow = false;
    }
  }

 

}
