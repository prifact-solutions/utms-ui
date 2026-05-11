

export class UtilsService {

  constructor() { }

  static jsonCopy(src) 
  {
    return JSON.parse(JSON.stringify(src));
  }


}
