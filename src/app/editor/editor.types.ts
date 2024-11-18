import Quill from 'quill';

export interface QuillRange {
  index: number;
  length: number;
}

export interface ToolbarBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface QuillBlock {
  domNode: HTMLElement;
  length(): number;
}

export interface QuillLeaf {
  domNode: HTMLElement;
}

export type QuillSelection = [QuillBlock, number]; 