import { getDb, putDb } from './database';
import { header } from './header';

export default class Editor {
  constructor() {
    const localData = localStorage.getItem('content');

    if (typeof CodeMirror === 'undefined') {
      throw new Error('CodeMirror is not loaded');
    }

    this.editor = CodeMirror(document.querySelector('#main'), {
      value: '',
      mode: 'javascript',
      theme: 'monokai',
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true,
      indentUnit: 2,
      tabSize: 2,
    });

    this.loadContent(localData);
    this.editor.on('change', this.handleEditorChange.bind(this));
    this.editor.on('blur', this.handleEditorBlur.bind(this));
  }

  async loadContent(localData) {
    try {
      const content = await getDb();
      console.info('Loaded data from IndexedDB, injecting into editor');
      this.editor.setValue(content || localData || header);
    } catch (error) {
      console.error('Error loading content:', error);
      this.editor.setValue(localData || header);
    }
  }

  handleEditorChange() {
    localStorage.setItem('content', this.editor.getValue());
  }

  async handleEditorBlur() {
    console.log('The editor has lost focus');
    try {
      await putDb(localStorage.getItem('content'));
      console.log('Content saved to the database');
    } catch (error) {
      console.error('Error saving content:', error);
    }
  }
}
