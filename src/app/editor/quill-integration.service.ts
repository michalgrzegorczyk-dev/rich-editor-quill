import {Injectable, inject} from '@angular/core';
import Quill from 'quill';
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
    this.handleTextChange();
    this.handleEditorChange();
  }

  handleSelectionChange() {
    this.quill.on('selection-change', (range: QuillRange) => {
      console.log('SELECTION CHANGE', range)
      this.toolbarService.destroyActiveToolbar();

      if (!range) {
        return;
      }

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

  private handleTextChange() {
    this.quill.on('text-change', () => {
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
    this.quill.on('editor-change', (eventName: string) => {
      console.log('EDITOR CHANGE', eventName);
      localStorage.setItem('quil_content', JSON.stringify(this.quill.getContents()));
      this.openSnackBar('Content saved successfully');
    });
  }

  private openSnackBar(message: string) {
    // this.snackBar.open(message, 'Close', {
    //   horizontalPosition: 'right',
    //   verticalPosition: 'top',
    // });
  }
}
