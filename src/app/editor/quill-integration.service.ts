import {Injectable, inject} from '@angular/core';
import Quill from 'quill';
import {QuillRange} from "./models/quill-range.model";
import {ToolbarManagerService} from "./services/toolbar-manager.service";
import {QuillInstanceService} from "./config/quill-instance.service";
import {ImageService} from "./features/image/image.service";
import {getInitialContent} from "./config/test-data";

@Injectable({
  providedIn: 'root'
})
export class QuillIntegrationService {
  private quill!: Quill;

  private readonly quillInstanceService = inject(QuillInstanceService);
  private readonly toolbarService = inject(ToolbarManagerService);
  private readonly imageService = inject(ImageService);

  init(rootElement: HTMLElement): void {
    this.initializeQuill(rootElement);
    this.handleSelectionChange();
    this.handleTextChange();
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

      if (selectedDomNode instanceof Text) {
        if (range.length === 0) {
          return;
        }
        this.handleTextSelection(range);
      } else if (selectedDomNode instanceof HTMLImageElement) {
        this.imageService.selectImage(selectedDomNode);
        this.showImageToolbar(range);
      } else {
        this.imageService.deselectImage();
      }
    });
  }

  handleTextChange() {
    this.quill.on('text-change', () => {
    });
  }

  displayToolbar(type: string, bounds: { top: number; left: number }) {
    this.toolbarService.showToolbar(type, {
      ...bounds,
      top: bounds.top - 15,
    });
  }

  private initializeQuill(editorElement: HTMLElement) {
    this.quill = this.quillInstanceService.start(editorElement);
    this.quill.setContents(getInitialContent());
  }

  private handleTextSelection(range: QuillRange): void {
    const bounds = this.quill.getBounds(range.index, range.length);
    const currentSelection = this.quill.getSelection();

    if (!bounds || !currentSelection) {
      return;
    }

    this.displayToolbar('txt', bounds);
  }

  private showImageToolbar(range: QuillRange): void {
    const bounds = this.quill.getBounds(range.index, range.length);

    if (!bounds) {
      return;
    }

    this.displayToolbar('img', bounds);
  }
}
