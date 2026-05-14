import {Directive, ElementRef, Output, EventEmitter, HostListener} from '@angular/core';
 
@Directive({
    selector: '[appTrackClicks]',
    host: {
      "(click)": "trackEvent( $event )",            // we can use instead =>  @HostListener('click', ['$event'])
      "(document: click)": "compareEvent( $event )" // we can use instead =>  @HostListener('document:click', ['$event'])
  }
})
export class TrackClicksDirective {
    constructor(private _elementRef : ElementRef) {
    }

    localEvent = null;
 
    @Output()
    public clickOutside = new EventEmitter();

    @Output()
    public clickInside = new EventEmitter();
 
 
    
    public compareEvent(event) {
        const clickedInside =  this.localEvent == event;
        if (!clickedInside) {
            this.clickOutside.emit(event);
        }
        else
        {
          this.clickInside.emit(event);
        }

        this.localEvent = null;
    }


    findClosestParentWithAttribte(sourceElement)
    {
      let s = sourceElement;
      while(s != null)
      {
        if (s.attributes.getNamedItem('appTrackClicks') != null)
        {
          return s;
        }
        s = s.parentElement;
      }
      return null;
    }


    trackEvent(event:MouseEvent){
      let parent_with_attribute = this.findClosestParentWithAttribte(event.target);

      if (parent_with_attribute == this._elementRef.nativeElement)
      {
        this.localEvent = event;
      }
  }
}