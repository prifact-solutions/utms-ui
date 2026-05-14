import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mark-display',
  templateUrl: './mark-display.component.html',
  styleUrls: ['./mark-display.component.css']
})
export class MarkDisplayComponent implements OnInit {

  constructor() { }

  
  _marks:number 

  @Input() 
  public set marks(mark: number) {
    this._marks = mark;
    this.processDisplayString(this._marks);
  }

  whole:number
  f_numerator:number
  f_denominator:number

  ngOnInit(): void {

  }

  processDisplayString(mark:number)
  {
    this.whole = this.f_numerator = this.f_denominator=0

    if (mark % 0.25 == 0)
    {
      if (mark % 1 == 0)
      {
        this.whole = mark;
      }
      else
      {
        this.whole = Math.floor(mark)
        this.f_numerator = (mark % 1)/.25;

        if (this.f_numerator == 2)
        {
          this.f_numerator = 1
          this.f_denominator = 2
        }
        else
        {
          this.f_denominator = 4
        }
        
      }
    }
    else
    {
      this.whole = mark;
    }
  }
}
