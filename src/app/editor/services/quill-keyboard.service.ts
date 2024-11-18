import { Injectable } from '@angular/core';
import { QuillRange } from '../models/quill-range.model';
import Quill from 'quill';

@Injectable({
  providedIn: 'root'
})
export class QuillKeyboardService {
  private quillInstance!: Quill;

  initialize(quill: Quill) {
    this.quillInstance = quill;
  }

  getKeyboardBindings(slashHandler: (bounds: any, index: number) => void) {
    return {
      enter: {
        key: 13,
        handler: this.handleEnterKey.bind(this)
      },
      slash: {
        key: 191,
        handler: () => {
          requestAnimationFrame(() => {
            const selection = this.quillInstance.getSelection();
            if (!selection) return true;

            const [line] = this.quillInstance.getLine(selection.index);
            if (!line || !line.domNode) return true;

            const text = line.domNode.textContent || '';

            if (text === '/') {
              const bounds = this.quillInstance.getBounds(selection.index, 1);
              slashHandler(bounds, selection.index);
              return false;
            }
            return true;
          });
          
          return true;
        }
      }
    };
  }

  private handleEnterKey(range: QuillRange): boolean {
    const currentSelection = this.quillInstance.getSelection();
    if (!currentSelection) return true;

    const [block, offset] = this.quillInstance.getLine(currentSelection.index);
    if (!block) return true;

    const blockLength = block.length();
    const blockIndex = this.quillInstance.getIndex(block);

    if (offset === blockLength) {
      this.quillInstance.insertText(blockIndex + blockLength, '\n');
      this.quillInstance.formatLine(blockIndex + blockLength + 1, 1, 'block-div', true);
      const [newBlock] = this.quillInstance.getLine(blockIndex + blockLength + 1);
      if (newBlock && newBlock.domNode) {
        newBlock.domNode.setAttribute('data-placeholder', 'Type "/" to run commands');
      }
      this.quillInstance.setSelection(blockIndex + blockLength + 1, 0);
    } else {
      const textContent = block.domNode.textContent || '';
      const remainingText = textContent.slice(offset);
      
      this.quillInstance.deleteText(currentSelection.index, remainingText.length);
      this.quillInstance.insertText(blockIndex + offset, '\n');
      this.quillInstance.insertText(blockIndex + offset + 1, remainingText);
      this.quillInstance.formatLine(blockIndex + offset + 1, remainingText.length + 1, 'block-div', true);
      const [newBlock] = this.quillInstance.getLine(blockIndex + offset + 1);
      if (newBlock && newBlock.domNode) {
        newBlock.domNode.setAttribute('data-placeholder', 'Type "/" to run commands');
      }
      this.quillInstance.setSelection(blockIndex + offset + 1, 0);
    }

    return false;
  }
} 