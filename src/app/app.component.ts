
import { Component } from '@angular/core';
import { QuillEditorComponent } from './editor/editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QuillEditorComponent],
  template: `
    <div class="container p-4">
      <h1>Ngx Rich Document Editor</h1>
      <app-quill-editor />
    </div>
  `
})
export class AppComponent {
}
