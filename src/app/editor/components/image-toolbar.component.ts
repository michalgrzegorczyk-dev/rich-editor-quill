import { Component, Input } from '@angular/core';
import { QuillImageService } from '../services/quill-image.service';

@Component({
  selector: 'app-image-toolbar',
  standalone: true,
  template: `
    <div class="floating-toolbar image-toolbar"
         [style.top.px]="getTopPosition()"
         [style.left.px]="getLeftPosition()">
      <button (click)="resizeImage('small')">Small</button>
      <button (click)="resizeImage('medium')">Medium</button>
      <button (click)="resizeImage('large')">Large</button>
      <button (click)="deleteImage()">Delete</button>
    </div>
  `,
  styles: [`
    .floating-toolbar {
      position: absolute;
      display: block;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border: 1px solid #ccc;
      border-radius: 4px;
      z-index: 1000;
      padding: 5px;
      width: 200px;
    }

    .image-toolbar {
      text-align: center;
      padding: 8px;
    }

    .image-toolbar button {
      margin: 0 5px;
      padding: 5px 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    }

    .image-toolbar button:hover {
      background: #f0f0f0;
    }
  `]
})
export class ImageToolbarComponent {
  @Input() position?: { top: number; left: number };

  constructor(private quillImageService: QuillImageService) {}

  getTopPosition(): number {
    return this.position?.top ?? 0;
  }

  getLeftPosition(): number {
    return (this.position?.left ?? 0) - 100;
  }

  deleteImage(): void {
    this.quillImageService.deleteImage();
  }

  resizeImage(size: 'small' | 'medium' | 'large'): void {
    this.quillImageService.resizeImage(size);
  }
}
