import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ProgramsService } from 'src/app/programs/services/programs.service';

export interface ProgramLike {
  id: number;
  preview_video?: string | null;
  thumbnail?: string | null;
}

interface CachedMediaUrl {
  url: string;
  expiresAt: number;
}

@Component({
  selector: 'app-program-featured-media',
  templateUrl: './program-featured-media.component.html',
  styleUrls: ['./program-featured-media.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgramFeaturedMediaComponent implements OnChanges {

  private static cache: Map<string, CachedMediaUrl> = new Map();
  private static readonly fallbackCacheTtlMs = 5 * 60 * 1000;

  @Input() program: ProgramLike | null = null;
  @Input() media_type: string | null = null;
  url: string = "";
  private hasRetriedAfterError = false;
  constructor(private programService: ProgramsService) {
  }

  ngOnInit(): void {
    this.loadMediaUrl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['program'] && !changes['program'].firstChange) {
      this.hasRetriedAfterError = false;
      this.url = '';
      this.loadMediaUrl();
    }
  }

  get showFallbackThumbnail(): boolean {
    if (this.url || !this.program) {
      return false;
    }

    return (this.media_type === 'VIDEO' && !this.program.preview_video)
      || (this.media_type === 'IMAGE' && !this.program.thumbnail)
      || !this.media_type;
  }

  onMediaLoadError(): void {
    if (this.hasRetriedAfterError || !this.program || !this.media_type) {
      return;
    }

    this.hasRetriedAfterError = true;
    ProgramFeaturedMediaComponent.cache.delete(this.getCacheKey());
    this.loadMediaUrl();
  }

  private loadMediaUrl(): void {
    if (!this.program || !this.media_type) {
      return;
    }

    const key = this.getCacheKey();
    const cached = ProgramFeaturedMediaComponent.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      this.url = cached.url;
      return;
    }

    if (this.media_type === 'VIDEO' && this.program.preview_video) {
      this.programService.getProgramVideoViewUrl(this.program.id).subscribe((res) => {
        this.storeUrlInCache(key, res.file_url);
      });
    }

    if (this.media_type === 'IMAGE' && this.program.thumbnail) {
      this.programService.getProgramThumbnailViewUrl(this.program.id).subscribe((res) => {
        this.storeUrlInCache(key, res.file_url);
      });
    }
  }

  private storeUrlInCache(cacheKey: string, fileUrl: string): void {
    this.url = fileUrl;
    ProgramFeaturedMediaComponent.cache.set(cacheKey, {
      url: fileUrl,
      expiresAt: this.getExpiryFromSignedUrl(fileUrl),
    });
  }

  private getCacheKey(): string {
    return `${this.program?.id}_${this.media_type}`;
  }

  static clearCacheForProgram(programId: number): void {
    ProgramFeaturedMediaComponent.cache.delete(`${programId}_IMAGE`);
    ProgramFeaturedMediaComponent.cache.delete(`${programId}_VIDEO`);
  }

  private getExpiryFromSignedUrl(fileUrl: string): number {
    try {
      const parsedUrl = new URL(fileUrl);
      const expiresInSeconds = Number(parsedUrl.searchParams.get('X-Amz-Expires'));
      const signedAt = parsedUrl.searchParams.get('X-Amz-Date');
      if (!Number.isFinite(expiresInSeconds) || !signedAt) {
        return Date.now() + ProgramFeaturedMediaComponent.fallbackCacheTtlMs;
      }

      const signedAtIso = signedAt.replace(
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
        '$1-$2-$3T$4:$5:$6Z',
      );
      const signedAtMs = Date.parse(signedAtIso);
      if (!Number.isFinite(signedAtMs)) {
        return Date.now() + ProgramFeaturedMediaComponent.fallbackCacheTtlMs;
      }

      // Refresh slightly before expiry to avoid edge-case race conditions.
      const safetyWindowMs = 5000;
      return signedAtMs + expiresInSeconds * 1000 - safetyWindowMs;
    } catch {
      return Date.now() + ProgramFeaturedMediaComponent.fallbackCacheTtlMs;
    }
  }
}
