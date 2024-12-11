import {Injectable, inject} from '@angular/core';
import Quill  from 'quill';
import {QuillRange, QuillBounds} from "./models/quill-custom.models";
import {ToolbarManagerService} from "./features/toolbar/toolbar-manager.service";
import {QuillInstanceService} from "./config/quill-instance.service";
import {ImageService} from "./features/image/image.service";
import {ToolbarType, Toolbar} from "./features/toolbar/toolbar.models";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class QuillIntegrationService {
  private quill!: Quill;

  domNode: HTMLElement | null = null;
  private readonly quillInstanceService = inject(QuillInstanceService);
  private readonly toolbarService = inject(ToolbarManagerService);
  private readonly imageService = inject(ImageService);
  private readonly snackBar = inject(MatSnackBar);



  init(rootElement: HTMLElement): void {
    this.initializeQuill(rootElement);
    this.handleSelectionChange();
    this.handleEditorChange();
  }

  handleSelectionChange() {
    this.quill.on('selection-change', (range: any) => {
      console.log('SELECTION CHANGE', range)
      this.toolbarService.destroyActiveToolbar();

      if (!range) {
        return;
      }


      const [block, offset] = this.quill.getLine(range.index);

      // Get the DOM element
      if (!block) {
        return;
      }
      const blockElement = block.domNode;

      // You can now work with the block element
      console.log('Current block:', blockElement);
      console.log('Block class:', blockElement.className);
      console.log('Block content:', blockElement.textContent);

      // If you need to find the index of this block among all blocks
      const allBlocks = this.quill.scroll['domNode'].getElementsByClassName('block');
      const blockIndex = Array.from(allBlocks).indexOf(blockElement);
      console.log('Block index:', blockIndex);



      const leaf: any = this.quill.getLeaf(range.index);

      if (!leaf) {
        return;
      }

      const selectedDomNode = leaf[0].domNode;
      this.domNode = selectedDomNode;

      if (selectedDomNode instanceof HTMLImageElement) {
        this.imageService.deselectCurrentImage();
      }

      if (selectedDomNode instanceof Text) {
        if (range.length === 0) {
          return;
        }
        this.handleTextSelection(range);
      } else if (selectedDomNode instanceof HTMLImageElement) {
        this.imageService.selectImage(selectedDomNode);
        this.showImageToolbar(range);
      }
    });
  }

  private displayToolbar(type: ToolbarType, bounds: QuillBounds) {
    console.log('domNode', this.domNode)
    this.toolbarService.showToolbar(type, bounds, this.domNode);
  }

  private initializeQuill(editorElement: HTMLElement) {
    this.quill = this.quillInstanceService.start(editorElement);
    this.quill.setContents(JSON.parse(localStorage.getItem('quil_content') || '{}'));
  }

  private handleTextSelection(range: QuillRange): void {
    const bounds = this.quill.getBounds(range.index, range.length);
    console.log('bbb', bounds)
    const currentSelection = this.quill.getSelection();

    if (!bounds || !currentSelection) {
      return;
    }


    this.displayToolbar(Toolbar.TXT, bounds);
  }

  private showImageToolbar(range: QuillRange): void {
    const bounds = this.quill.getBounds(range.index, range.length);

    if (!bounds) {
      return;
    }

    this.displayToolbar(Toolbar.IMG, bounds);
  }

  private handleEditorChange() {
    this.quill.on('editor-change', (eventName: any) => {
      localStorage.setItem('quil_content', JSON.stringify(this.quill.getContents()));
      const selection = this.quill.getSelection();
      if (selection) {
        const [line]: any = this.quill.getLine(selection.index);
        console.log('INDEX', selection.index);
        console.log('line', line)
        console.log('line', line.domNode.textContent.trim() === '');


        if (line.domNode.textContent.trim() === '') {
          line.domNode.classList.add('empty-line');
          line.domNode.setAttribute('data-placeholder', 'Type something...');
        } else {
          line.domNode.classList.remove('empty-line');
          line.domNode.removeAttribute('data-placeholder');
        }
      }
    });


  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  addBlock() {
    // add last
    this.quill.insertText(this.quill.getLength() -1, '\nNew line', 'block-div', true);
  }

  loadTestData() {

    const data: any =  {"ops":[{"attributes":{"color":"#000000"},"insert":"HelloHelloHelloHelloHelloHelloHello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"HelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello"},{"attributes":{"block-div":true},"insert":"\n"},{"insert":"Check with scroll"},{"attributes":{"list":"ordered"},"insert":"\n"},{"insert":"Check with images (make ss and paste here)"},{"attributes":{"list":"ordered"},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"HelloHello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"HelloHello"},{"attributes":{"block-div":true},"insert":"\n\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"},{"attributes":{"color":"#000000"},"insert":"Hello"},{"attributes":{"block-div":true},"insert":"\n"}]}

    this.quill.setContents(data);
  }
}
