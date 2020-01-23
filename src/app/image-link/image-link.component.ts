import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-link',
  templateUrl: './image-link.component.html'
})
export class ImageLinkComponent { 

    @Input('url')
    url: string;
    
    constructor() { }
}
