export class HtmlStructureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HtmlStructureError';
  }
}
