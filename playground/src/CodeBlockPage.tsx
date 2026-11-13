import { CodeBlock } from '@k2x/evoker';
import type { Page } from './Documentation.js';

const source = `import { Button, Theme } from '@k2x/evoker';
import '@k2x/evoker/styles.css';

export function NextMove() {
  return <Theme appearance="dark">
    <Button onClick={() => console.log('Signal received')}>Your next move</Button>
  </Theme>;
}`;

export const codeBlockPage: Page = {
  id: 'code-block', title: 'CodeBlock',
  description: 'A source surface with Evoker’s angular signal mark, file header, numbered lines and cyan line highlights. Copy the original text, wrap long lines or scroll with your keyboard. No parser or syntax-highlighting dependency is bundled.',
  examples: [
    { title: 'Read the signal', node: <CodeBlock code={source} filename="components/next-move.tsx" language="tsx" highlightedLines={[5, 6, 7]} />,
      code: `import { CodeBlock } from '@k2x/evoker';

<CodeBlock
  code={source}
  filename="components/next-move.tsx"
  language="tsx"
  highlightedLines={[5, 6, 7]}
/>;` },
    { title: 'Terminal output', node: <CodeBlock filename="Build output" language="terminal" code={'$ npm run build\n\nAll workspaces built.\nReady for your next move.'} lineNumbers={false} defaultWrap />,
      code: `<CodeBlock code={output} filename="Build output"
  language="terminal" lineNumbers={false} defaultWrap />;` },
    { title: 'Bring your own syntax tokens', node: <CodeBlock filename="signal.json" language="json" code={'{ "ready": true }'}
      renderLine={() => <>{'{ '}<strong style={{ color: 'var(--evoker-accent)' }}>"ready"</strong>{': true }'}</>} />,
      code: `// Supply React text/span nodes from your preferred highlighter.
// Each result represents one source line, without its newline.
<CodeBlock code={source} language="tsx"
  renderLine={(line, number) => highlightedLines[number - 1] ?? line} />;` },
  ],
  props: [
    ['code', 'Original string; copying preserves whitespace, blank lines and trailing newlines exactly', 'Required'],
    ['filename / language', 'File heading / display-only language label; no parsing or execution', 'Source code / text'],
    ['lineNumbers / startLine', 'Show the gutter / positive safe integer for the first displayed line', 'true / 1'],
    ['highlightedLines', 'Readonly displayed line numbers; color and a solid leading border emphasize the line', '[]'],
    ['defaultWrap', 'Initial reader preference; native button toggles wrap with aria-pressed', 'false'],
    ['copy', 'Show the copy action; clipboard denial selects source for native manual copying', 'true'],
    ['renderLine', '(line, displayedLineNumber) => ReactNode; optional application-owned highlighting; never used for copying', 'Plain text'],
    ['native props / ref', 'Figure attributes and HTMLElement ref; code remains a named, LTR keyboard-scrollable pre', 'Native browser behavior'],
  ],
};
