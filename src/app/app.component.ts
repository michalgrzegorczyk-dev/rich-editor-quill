
import { Component } from '@angular/core';
import { QuillEditorComponent } from './editor/editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QuillEditorComponent],
  template: `
    <div>
      <h1>Ngx Rich Document Editor</h1>
      <app-quill-editor />
    </div>
  `,
  styles: [
    `
      h1 {
        display: flex;
        justify-content: center;
      }
    `
  ]
})
export class AppComponent {
}
