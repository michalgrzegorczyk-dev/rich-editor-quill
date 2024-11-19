import { Injectable } from '@angular/core';
import { QuillKeyboardService } from './quill-keyboard.service';
import { QuillSlashMenuService } from './quill-slash-menu.service';

@Injectable({
  providedIn: 'root'
})
export class QuillConfigService {
  constructor(
    private quillKeyboardService: QuillKeyboardService,
    private quillSlashMenuService: QuillSlashMenuService
  ) {}

  getEditorConfig() {
    return {
      theme: 'snow',
      modules: {
        toolbar: false,
        keyboard: {
          bindings: this.quillKeyboardService.getKeyboardBindings(
            this.quillSlashMenuService.showMenu.bind(this.quillSlashMenuService)
          )
        }
      },
      formats: ['block-div', 'image', 'header', 'bold', 'italic', 'underline', 'code-block']
    };
  }

  getInitialContent(): any {
    return [
      { 
        insert: 'Welcome to the editor! Try typing "/" to see available commands\n',
        attributes: { 'block-div': true }
      },
      {
        insert: {
          image: 'https://picsum.photos/400/300'
        },
        attributes: { 'block-div': true }
      },
      {
        insert: '\n',
        attributes: { 'block-div': true }
      }
    ];
  }
} 