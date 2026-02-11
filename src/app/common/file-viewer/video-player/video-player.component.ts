import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentBase } from '../../componentbase';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent extends ComponentBase {
  @Input()
  public videoUrl: string | null = null;

  @Output() onFileCompleted = new EventEmitter<string>();

  public onVideoEnded($event: any) {
    this.onFileCompleted.emit("COMPLETED");
  }
  public onSeek($event: any) {

  }
  public onLoaded(event: Event, videoEl: HTMLVideoElement) {
    try {
      if (videoEl) {
        // Ensure muted for autoplay policies, set playsInline and attempt to play
        videoEl.muted = true;
        // Some browsers require the playsInline property
        (videoEl as any).playsInline = true;
        const playPromise = videoEl.play();
        if (playPromise) {
          playPromise.catch(() => {
            // ignore play errors (user gesture required), keep muted so subsequent attempts may work
          });
        }
      }
    } catch (e) {
      // swallow exceptions to avoid breaking UI
    }
  }
}
