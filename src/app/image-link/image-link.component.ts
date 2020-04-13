import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-image-link',
  templateUrl: './image-link.component.html'
})
export class ImageLinkComponent
{
  @Input('url')
  url: string;

  validUrl: boolean = true;
    
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes['url'])
      this.validUrl = true; // validate URL again
  }

  invalidUrl(): void
  {
    this.validUrl = false;
  }
}
