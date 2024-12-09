import Quill from 'quill';

const Block = Quill.import('blots/block') as any;

export class BlockDivBlot extends Block {
  static blotName = 'block-div';
  static tagName = 'div';
  static className = 'block';

  static create(value: any) {
    const node = super.create(value);
    node.setAttribute('class', 'block');
    return node;
  }

  static formats(node: HTMLElement) {
    return node.classList.contains('block') ? true : undefined;
  }
}

