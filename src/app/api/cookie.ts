/*
 * General utils for managing cookies in Typescript
 *
 * From: https://gist.github.com/joduplessis/7b3b4340353760e945f972a69e855d11
 */
import { Injectable } from '@angular/core';

const TWENTY_YEARS = 7300 * 24 * 60 * 60 * 1000;

@Injectable()
export class Cookie {
    set (name: string, val: string)
    {
        let date = new Date ();
        let value = val;
    
        // Set it expire in 20 years
        date.setTime (date.getTime () + TWENTY_YEARS);
        document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
    }
    
    get (name: string)
    {
        let value = "; " + document.cookie;
        let parts = value.split ("; " + name + "=");
        
        if (parts.length == 2)
            return parts.pop ().split (";").shift ();

        return null;
    }
}
