import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../image.service';
import {QuillBounds} from "../../../models/quill-custom.models";

type ImageSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-image-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-toolbar.component.html',
  styleUrls: ['./image-toolbar.component.scss']
})
export class ImageToolbarComponent {
  @Input() position?: QuillBounds;
  @Input() initialSize: ImageSize = 'medium';

  currentSize: ImageSize;

  constructor(private quillImageService: ImageService) {
    this.currentSize = this.initialSize;
  }

  getTopPosition(): number {
    return this.position?.top ?? 0;
  }

  getLeftPosition(): number {
    // Center the toolbar over the image by offsetting by half its width
    return (this.position?.left ?? 0) - 100;
  }

  deleteImage(): void {
    this.quillImageService.deleteImage();
  }

  resizeImage(size: ImageSize): void {
    this.currentSize = size;
  }

  isCurrentSize(size: ImageSize): boolean {
    return this.currentSize === size;
  }
}
