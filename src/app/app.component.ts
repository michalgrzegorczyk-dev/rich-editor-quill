
import { Component } from '@angular/core';
import {QuillEditorComponent} from "./r";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QuillEditorComponent],
  template: `
    <div class="container p-4">
      <h1>Quill Editor Demo</h1>
      <app-quill-editor></app-quill-editor>
    </div>
  `
})
export class AppComponent {
}
