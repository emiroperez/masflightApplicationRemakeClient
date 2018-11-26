import { GeoJson } from "./GeoJson ";

export class FeatureCollection {
    type = 'FeatureCollection'
    constructor(public features: Array<GeoJson>) {}
  }