import { Injectable } from '@angular/core';
import Quill from 'quill';

@Injectable({
  providedIn: 'root'
})
export class QuillBlotService {
  registerCustomBlots() {
    const Block = Quill.import('blots/block') as any;

    class BlockDiv extends Block {
      static create(value: any) {
        const node = super.create(value);
        node.setAttribute('class', 'block');
        node.setAttribute('data-placeholder', 'Type "/" to run commands');
        return node;
      }

      static formats(node: HTMLElement) {
        return node.classList.contains('block') ? true : undefined;
      }

      static blotName = 'block-div';
      static tagName = 'div';
      static className = 'block';
    }

    Quill.register(BlockDiv, true);
  }
} 