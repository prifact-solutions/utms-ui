import { Component, Input } from '@angular/core';
import { ProgramsService } from 'src/app/programs/services/programs.service';

export interface ProgramLike {
  id: number;
  preview_video?: string | null;
  thumbnail?: string | null;
}

@Component({
  selector: 'app-program-featured-media',
  templateUrl: './program-featured-media.component.html',
  styleUrls: ['./program-featured-media.component.scss']
})
export class ProgramFeaturedMediaComponent {

  @Input() program: ProgramLike | null = null;
  @Input() media_type: string | null = null;
  url: string = "";
  constructor(private programService: ProgramsService) {
  }

  ngOnInit(): void {
    if (this.program && this.media_type == "VIDEO" && this.program.preview_video) {

      this.programService.getProgramVideoViewUrl(this.program.id).subscribe((res) => {
        this.url = res.file_url;
      });
    }
    if (this.program && this.media_type == "IMAGE" && this.program.thumbnail) {
      this.programService.getProgramThumbnailViewUrl(this.program.id).subscribe((res) => {
        this.url = res.file_url;
      });
    }
  }

}
