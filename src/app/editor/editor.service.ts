import { Injectable } from '@angular/core';
import Quill from 'quill';
import { QuillBlotService } from './services/quill-blot.service';
import { QuillKeyboardService } from './services/quill-keyboard.service';
import { QuillSlashMenuService } from './services/quill-slash-menu.service';
import { QuillImageService } from './services/quill-image.service';
import { QuillConfigService } from './services/quill-config.service';
import { QuillEventsService } from './services/quill-events.service';

@Injectable({
  providedIn: 'root'
})
export class QuillService {
  private quillInstance!: Quill;

  constructor(
    private quillBlotService: QuillBlotService,
    private quillKeyboardService: QuillKeyboardService,
    private quillSlashMenuService: QuillSlashMenuService,
    private quillImageService: QuillImageService,
    private quillConfigService: QuillConfigService,
    private quillEventsService: QuillEventsService
  ) {}

  initialize(editorElement: HTMLElement, textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    this.quillBlotService.registerCustomBlots();
    this.initializeQuill(editorElement, textToolbar);
    
    this.quillSlashMenuService.initialize(this.quillInstance);
    this.quillImageService.initialize(this.quillInstance);
    this.quillEventsService.initialize(this.quillInstance);
    
    this.quillEventsService.setupEventListeners(textToolbar, imageToolbar);

    return this.quillInstance;
  }
  
  private initializeQuill(editorElement: HTMLElement, toolbar: HTMLElement) {
    const options = this.quillConfigService.getEditorConfig(toolbar);
    this.quillInstance = new Quill(editorElement, options);
    this.quillKeyboardService.initialize(this.quillInstance);
    this.quillInstance.setContents(this.quillConfigService.getInitialContent());
    return this.quillInstance;
  }
}
