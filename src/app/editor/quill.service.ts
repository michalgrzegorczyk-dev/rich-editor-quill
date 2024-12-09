import {Injectable} from '@angular/core';
import Quill from 'quill';
import {QuillSlashMenuService} from './services/quill-slash-menu.service';
import {QuillRange} from "./models/quill-range.model";
import {QuillToolbarService} from "./services/quill-toolbar.service";
import {QuillInstance} from "./quill-instance";
import {QuillImageService} from "./services/quill-image.service";

@Injectable({
  providedIn: 'root'
})
export class QuillService {
  private quill!: Quill;

  constructor(
    private quillSlashMenuService: QuillSlashMenuService,
    private quillToolbarService: QuillToolbarService,
    private qIn: QuillInstance,
    private imgService: QuillImageService,
  ) {
  }

  init(editorElement: HTMLElement): void {

    this.initializeQuill(editorElement);

    this.quill.on('text-change', () => {
      const text = this.quill.getText().trim();

      if (text === "/") {
        console.log("open");
      } else {
        this.quillSlashMenuService.destroyMenu();
        console.log("closed");
      }
    });

    this.quill.on('selection-change', (range: QuillRange) => {
      this.quillToolbarService.removeCurrentToolbar();

      if (!range) {
        return;
      }

      console.log('SELECTION-CHANGE', range);
      const leaf: any = this.quill.getLeaf(range.index);

      console.log('leaf', leaf);
      if (leaf[0].domNode instanceof HTMLImageElement) {
        this.imgService.selectImage(leaf[0].domNode);
        this.showImageToolbar(range);
      } else {
        this.imgService.deselectImage();
      }

      if (this.isImageLeaf(leaf) && range.length === 0) {
        console.log('1');
        const bounds = (leaf.domNode as HTMLImageElement).getBoundingClientRect();
        console.log('bounds', bounds);
        // this.showImageToolbar(bounds, this.quill.container.getBoundingClientRect());
      } else if (range.length > 0) {
        console.log('2')
        const selectedText = this.quill.getText(range.index, range.length);

        if (selectedText === '\n') {
          return;
        }

        this.handleTextSelection(range);
      }
    });
  }

  private initializeQuill(editorElement: HTMLElement) {
    this.quill = this.qIn.start(editorElement);

    this.quill.keyboard.addBinding({
      key: 'Escape',
      handler: () => {
        this.quillToolbarService.removeCurrentToolbar();
        console.log('es');
        return true;
      }
    })

    this.quill.keyboard.addBinding({
      key: '/',
      handler: () => {
        console.log('xD')
        requestAnimationFrame(() => {
          const selection = this.quill.getSelection();
          if (!selection) return true;

          const [line] = this.quill.getLine(selection.index);
          if (!line?.domNode) return true;

          const text = line.domNode.textContent || '';

          if (text === '/') {
            const bounds = this.quill.getBounds(selection.index, 1);
            if (bounds) {
              console.log('x');
              this.quillSlashMenuService.showMenu(bounds, selection.index);
            }
            return false;
          }
          return true;
        });

        return true;
      }
    });


    // this.quill = new Quill(editorElement, {
    //   theme: 'snow',
    //   modules: {
    //     toolbar: false, // i have custom toolbar components
    //     keyboard: {
    //       bindings: {
    //         enter: {
    //           key: 13,
    //           handler: this.handleEnterKey.bind(this)
    //         },
    //         slash: {
    //           key: 191,
    //           handler: () => {
    //             requestAnimationFrame(() => {
    //               const selection = this.quill.getSelection();
    //               if (!selection) return true;
    //
    //               const [line] = this.quill.getLine(selection.index);
    //               if (!line || !line.domNode) return true;
    //
    //               const text = line.domNode.textContent || '';
    //
    //               if (text === '/') {
    //                 const bounds: any = this.quill.getBounds(selection.index, 1);
    //                 if (bounds) {
    //
    //                   this.quillSlashMenuService.showMenu(bounds, selection.index);
    //                 }
    //                 return false;
    //               }
    //               return true;
    //             });
    //
    //             return true;
    //           }
    //         }
    //       }
    //     }
    //   },
    //   formats: ['block-div', 'image', 'header', 'bold', 'italic', 'underline', 'code-block', 'code']
    // });
    this.quillToolbarService.quill = this.quill;
    this.quill.setContents(this.getInitialContent());
  }

  private handleEnterKey(range: QuillRange): boolean {
    const currentSelection = this.quill.getSelection();
    if (!currentSelection) return true;

    const [block, offset] = this.quill.getLine(currentSelection.index);
    if (!block) return true;

    const blockLength = block.length();
    const blockIndex = this.quill.getIndex(block);

    if (offset === blockLength) {
      this.quill.insertText(blockIndex + blockLength, '\n');
      this.quill.formatLine(blockIndex + blockLength + 1, 1, 'block-div', true);
      const [newBlock] = this.quill.getLine(blockIndex + blockLength + 1);
      if (newBlock && newBlock.domNode) {
        newBlock.domNode.setAttribute('data-placeholder', 'Type "/" to run commands');
      }
      this.quill.setSelection(blockIndex + blockLength + 1, 0);
    } else {
      const textContent = block.domNode.textContent || '';
      const remainingText = textContent.slice(offset);

      this.quill.deleteText(currentSelection.index, remainingText.length);
      this.quill.insertText(blockIndex + offset, '\n');
      this.quill.insertText(blockIndex + offset + 1, remainingText);
      this.quill.formatLine(blockIndex + offset + 1, remainingText.length + 1, 'block-div', true);
      const [newBlock] = this.quill.getLine(blockIndex + offset + 1);
      if (newBlock && newBlock.domNode) {
        newBlock.domNode.setAttribute('data-placeholder', 'Type "/" to run commands');
      }
      this.quill.setSelection(blockIndex + offset + 1, 0);
    }

    return false;
  }

  private handleTextSelection(range: QuillRange): void {
    const bounds = this.quill.getBounds(range.index, range.length);

    const currentSelection = this.quill.getSelection();
    if (!currentSelection) return;

    const [block, offset]:any = this.quill.getLine(currentSelection.index);
    console.log(block.domNode);


    if (!bounds) {
      return;
    }

    this.quillToolbarService.showToolbar('txt', {
      top: bounds.top -13,
      left: bounds.left
    });
  }

  private showImageToolbar(range: QuillRange): void {
    const bounds = this.quill.getBounds(range.index, range.length);

    if (!bounds) {
      return;
    }

    this.quillToolbarService.showToolbar('img', {
      top: bounds.top -13,
      left: bounds.left
    });
  }

  private isImageLeaf(leaf: any): boolean {
    return leaf?.domNode instanceof HTMLImageElement;
  }

  getInitialContent(): any {
    return [
      {
        insert: 'Building Modern Web Applications\n',
        attributes: { 'block-div': true, header: 1 }
      },
      {
        insert: 'A Comprehensive Guide\n',
        attributes: { 'block-div': true, header: 2 }
      },
      {
        insert: 'Welcome to our comprehensive guide on building modern web applications. In this article, we\'ll explore various aspects of web development, from frontend frameworks to backend architecture.\n',
        attributes: { 'block-div': true }
      },
      {
        insert: {
          image: 'https://picsum.photos/800/400'
        },
        attributes: { 'block-div': true }
      },
      {
        insert: '\nFrontend Development\n',
        attributes: { 'block-div': true, header: 2 }
      },
      {
        insert: 'Modern frontend development has evolved significantly over the years. Let\'s explore some key concepts and best practices.\n',
        attributes: { 'block-div': true }
      },
      {
        insert: 'Key Concepts\n',
        attributes: { 'block-div': true, header: 3 }
      },
      {
        insert: '• Component-Based Architecture\n• State Management\n• Responsive Design\n• Performance Optimization\n',
        attributes: { 'block-div': true }
      },
      {
        insert: {
          image: 'https://picsum.photos/600/300'
        },
        attributes: { 'block-div': true }
      },
      {
        insert: '\nBackend Integration\n',
        attributes: { 'block-div': true, header: 2 }
      },
      {
        insert: 'A robust backend is crucial for any modern web application. Here\'s what you need to know about backend integration.\n',
        attributes: { 'block-div': true }
      },
      {
        insert: 'Authentication & Security\n',
        attributes: { 'block-div': true, bold: true }
      },
      {
        insert: 'Security is paramount in modern web applications. Implement proper authentication and authorization mechanisms.\n',
        attributes: { 'block-div': true }
      },
      {
        insert: {
          image: 'https://picsum.photos/700/350'
        },
        attributes: { 'block-div': true }
      },
      {
        insert: '\nCode Example\n',
        attributes: { 'block-div': true, header: 2 }
      },
      {
        insert: 'function authenticate(user) {\n  // Authentication logic\n  return token;\n}\n',
        attributes: { 'block-div': true, 'code-block': true }
      },
      {
        insert: 'Testing Strategies\n',
        attributes: { 'block-div': true, header: 2 }
      },
      {
        insert: 'Implementing a comprehensive testing strategy is crucial for maintaining code quality.\n',
        attributes: { 'block-div': true }
      },
      {
        insert: 'Important Testing Types:\n',
        attributes: { 'block-div': true, bold: true }
      },
      {
        insert: '1. Unit Testing\n2. Integration Testing\n3. End-to-End Testing\n4. Performance Testing\n',
        attributes: { 'block-div': true }
      },
      {
        insert: {
          image: 'https://picsum.photos/500/300'
        },
        attributes: { 'block-div': true }
      },
      {
        insert: '\nDeployment Considerations\n',
        attributes: { 'block-div': true, header: 2 }
      },
      {
        insert: 'Deploying a web application requires careful planning and consideration of various factors.\n',
        attributes: { 'block-div': true }
      },
      {
        insert: 'Deployment Checklist\n',
        attributes: { 'block-div': true, header: 2 }
      },
      {
        insert: '✓ Environment Configuration\n✓ Database Migrations\n✓ SSL Certificates\n✓ Monitoring Setup\n',
        attributes: { 'block-div': true }
      },
      {
        insert: 'Performance Optimization\n',
        attributes: { 'block-div': true, header: 2 }
      },
      {
        insert: 'Optimizing performance is crucial for providing a good user experience.\n',
        attributes: { 'block-div': true }
      },
      {
        insert: {
          image: 'https://picsum.photos/600/350'
        },
        attributes: { 'block-div': true }
      },
      {
        insert: '\nKey Metrics to Monitor:\n',
        attributes: { 'block-div': true, bold: true }
      },
      {
        insert: '• Page Load Time\n• Time to Interactive\n• First Contentful Paint\n• Cumulative Layout Shift\n',
        attributes: { 'block-div': true }
      },
      {
        insert: 'Conclusion\n',
        attributes: { 'block-div': true, header: 2 }
      },
      {
        insert: 'Building modern web applications requires a comprehensive understanding of various technologies and best practices. Keep learning and stay updated with the latest developments in the field.\n',
        attributes: { 'block-div': true }
      },
      {
        insert: {
          image: 'https://picsum.photos/700/400'
        },
        attributes: { 'block-div': true }
      },
      {
        insert: '\nAdditional Resources\n',
        attributes: { 'block-div': true, header: 2 }
      },
      {
        insert: '• Documentation\n• Community Forums\n• Video Tutorials\n• Best Practices Guide\n',
        attributes: { 'block-div': true }
      },
    ];
  }
}
