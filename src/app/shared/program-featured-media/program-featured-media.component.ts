import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ProgramsService } from 'src/app/programs/services/programs.service';

export interface ProgramLike {
  id: number;
  preview_video?: string | null;
  thumbnail?: string | null;
}

@Component({
  selector: 'app-program-featured-media',
  templateUrl: './program-featured-media.component.html',
  styleUrls: ['./program-featured-media.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgramFeaturedMediaComponent {

  private static cache: Map<string, string> = new Map();

  @Input() program: ProgramLike | null = null;
  @Input() media_type: string | null = null;
  url: string = "";
  constructor(private programService: ProgramsService) {
  }

  ngOnInit(): void {
    let key = `${this.program?.id}_${this.media_type}`;
    if (ProgramFeaturedMediaComponent.cache.has(key)) {
      this.url = ProgramFeaturedMediaComponent.cache.get(key)!;
      return;
    }
    if (this.program && this.media_type == "VIDEO" && this.program.preview_video) {
      this.programService.getProgramVideoViewUrl(this.program.id).subscribe((res) => {
        this.url = res.file_url;
        ProgramFeaturedMediaComponent.cache.set(key, res.file_url);
      });
    }
    if (this.program && this.media_type == "IMAGE" && this.program.thumbnail) {
      this.programService.getProgramThumbnailViewUrl(this.program.id).subscribe((res) => {
        this.url = res.file_url;
        ProgramFeaturedMediaComponent.cache.set(key, res.file_url);
      });
    }
  }

}
