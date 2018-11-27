import { IGeoJson } from "./IGeoJson ";
import { IGeometry } from "./IGeometry ";

export class GeoJson implements IGeoJson {
    type = 'Feature';
    geometry: IGeometry;
  
    constructor(coordinates, public properties?) {
      this.geometry = {
        type: 'Point',
        coordinates: coordinates
      }
    }
  }