import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: 'img[appImageFallback]'
})
export class ImageFallbackDirective {

  @Input() fallbackImage: string | undefined;

  constructor(private ref: ElementRef) {
  }

  @HostListener('error')
  loadFallbackImageOnError(): void {
    const element: HTMLImageElement = (this.ref.nativeElement as HTMLImageElement);
    if (typeof this.fallbackImage === 'string') {
      element.src = this.fallbackImage;
    }
  }

}
