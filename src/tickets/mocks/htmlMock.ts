import * as fs from 'fs';
import * as path from 'path';

export function getHtmlMockFilePath(): string {
  const baseDir =
    process.env.NODE_ENV === 'production'
      ? path.join(__dirname, '../../..')
      : path.join(__dirname, '../../../src');
  return path.join(baseDir, 'utilities/ticket-parser/parsers/htmlMock.html');
}

export const htmlMock = fs.readFileSync(getHtmlMockFilePath(), 'utf-8');
