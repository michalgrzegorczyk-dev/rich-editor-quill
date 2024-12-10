import {Injectable} from "@angular/core";
import Quill from "quill";

@Injectable({
  providedIn: 'root'
})
export class QuillInstanceService {
  quill!: Quill;

  start(rootElement: HTMLElement): Quill {
    if (this.quill) {
      throw new Error('Quill instance already initialized');
    }

    this.quill = new Quill(rootElement, {
      theme: 'snow',
      modules: {
        toolbar: false,
        keyboard: {
          bindings: {
            'header enter': {
              key: 'Enter',
              collapsed: true,
              format: ['header'],
              prefix: /^.+$/,
              handler: (range: any) => {
                const format = this.quill.getFormat(range.index);
                this.quill.insertText(range.index, '\n', format);
                this.quill.formatLine(range.index + 1, 1, 'block-div', true);
                return false;
              }
            }
          }
        }
      },

      formats: [
        'block-div', 'image', 'header', 'bold', 'italic', 'underline',
        'code-block', 'code', 'color', 'background', 'align',
        'list', 'indent',
      ],
    });

    return this.quill;
  }
}
