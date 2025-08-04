import {AfterViewInit, Component, ComponentRef, Directive, ElementRef, Input, OnInit} from '@angular/core';
import {FileUploadComponent} from '../components/file-upload/file-upload.component';
import {devLogger} from '../utils';

@Directive({
  selector: '[appFileUploadTrigger]'
})
export class FileUploadTriggerDirective implements OnInit, AfterViewInit {

  @Input() fileUploadComponentRef!: FileUploadComponent;
  private el: HTMLElement;

  constructor(ref: ElementRef) {
    this.el = ref.nativeElement;
  }

  ngOnInit(): void {
    this.el.addEventListener('click', e => {
      devLogger('log', {fileComREf: this.fileUploadComponentRef});
      this.fileUploadComponentRef?.inputElement?.nativeElement.click();
    });
    // throw new Error('Method not implemented.');
  }

  ngAfterViewInit(): void {
  }
}
