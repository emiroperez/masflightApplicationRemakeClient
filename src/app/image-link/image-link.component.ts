import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-image-link',
  templateUrl: './image-link.component.html',
  styleUrls: ['./image-link.component.css']
})
export class ImageLinkComponent implements OnInit { 

    // Escuchamos constantemente si nuestro valor de entrada cambia.
    // @Input('url') set url(url:string){     

      url:string = "https://radar.weather.gov/Conus/Loop/alaskaLoop.gif";
    // Preguntamos si existe un valor en la variable.
        if(url){
            this.loadImage(url);            
        }        
    // }

    // Obtenemos una referencia hacia el tag "<img>" para poder manipularlo luego
    @ViewChild('lImage') lImage : ElementRef;
    
    constructor() { }

    ngOnInit() {
      this.loadImage(this.url);
    // Utilizaremos el evento "onload" de el tag "<img>" ,este evento se disparara
    // cuando la imagen se carge en su totalidad.
        // this.lImage.nativeElement.onload=()=>{
        //     this.viewImage=true;                        
        // }
    }
    // Función que utilizaremos para comenzar el proceso de carga de imagenes, 
    // esta misma le proporcionara la dirección imagen la cual tiene que cargar.
    loadImage(urlImage){
        this.lImage.nativeElement.src = urlImage;        
    }

}
