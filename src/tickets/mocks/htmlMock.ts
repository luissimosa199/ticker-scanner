import * as fs from 'fs';
import * as path from 'path';

export const htmlMock = fs.readFileSync(
  path.join(__dirname, '../../utilities/ticket-parser/parsers/htmlMock.html'),
  'utf-8',
);
