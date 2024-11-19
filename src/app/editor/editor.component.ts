import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { QuillService } from './editor.service';

@Component({
  selector: 'app-quill-editor',
  standalone: true,
  template: `
    <div class="editor-container">
      <div #editor></div>
    </div>
  `,
  styleUrls: ['./editor.component.scss']
})
export class QuillEditorComponent implements AfterViewInit {
  @ViewChild('editor') private editorElement!: ElementRef;

  constructor(private quillService: QuillService) { 
  }

  ngAfterViewInit() {
    this.quillService.initialize(this.editorElement.nativeElement);
  }
}
