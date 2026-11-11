import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Badge, Button, Card, Checkbox, Dialog, DropdownMenu, Field, Input, Select, Separator, Slider, Switch, Tabs, Textarea, Theme, Tooltip } from '@evoker/react';
import './documentation.css';
import { compositionPages } from './CompositionPages.js';
import { legacyBlockPages, sourceBlockPages } from './BlockPages.js';
import { BrandLink } from './Brand.js';

type Example = { title: string; node: ReactNode; code: string };
export type Page = { id: string; title: string; description: string; examples: Example[]; props?: [string, string, string][] };

const buttonCode = `import { Button } from '@evoker/react';

<Button onClick={save}>Save changes</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button loading>Saving changes</Button>`;
const fieldCode = `<Field.Root name="email">
  <Field.Label>Email address</Field.Label>
  <Input type="email" name="email" placeholder="you@example.com" required />
  <Field.Description>Only used for account updates.</Field.Description>
  <Field.Error match="valueMissing">Enter your email.</Field.Error>
</Field.Root>`;
const selectCode = `const items = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
];

<Select.Root name="region" defaultValue="north" items={items}>
  <Select.Trigger aria-label="Region">
    <Select.Value /><Select.Icon>⌄</Select.Icon>
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Content><Select.List>
        {items.map(item => <Select.Item key={item.value} value={item.value}>
          <Select.ItemText>{item.label}</Select.ItemText>
        </Select.Item>)}
      </Select.List></Select.Content>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>`;
const dialogCode = `<Dialog.Root>
  <Dialog.Trigger render={<Button />}>Edit profile</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Content>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Your public display name.</Dialog.Description>
      <Field.Root name="displayName">
        <Field.Label>Display name</Field.Label>
        <Input name="displayName" defaultValue="Operator" />
      </Field.Root>
      <Dialog.Footer>
        <Dialog.Close render={<Button variant="outline" />}>Cancel</Dialog.Close>
        <Dialog.Close render={<Button />}>Save profile</Dialog.Close>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>`;
const tabsCode = `<Tabs.Root defaultValue="overview">
  <Tabs.List aria-label="Project views" activateOnFocus>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">Project overview.</Tabs.Content>
  <Tabs.Content value="activity">Recent activity.</Tabs.Content>
</Tabs.Root>`;

function ButtonDemo() {
  const [count, setCount] = useState(0);
  return <div className="doc-stack"><div className="doc-row"><Button onClick={() => setCount(value => value + 1)}>Save changes</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button></div><div className="doc-row"><Button size="sm">Small</Button><Button size="lg">Large</Button><Button disabled>Disabled</Button><Button loading>Saving</Button></div><output aria-live="polite">Saved {count} times</output></div>;
}
function FormDemo() {
  const [submitted, setSubmitted] = useState('');
  return <form className="doc-example-form" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('email'))); }}>
    <Field.Root name="email"><Field.Label>Email address</Field.Label><Input type="email" name="email" placeholder="you@example.com" required /><Field.Description>Only used for account updates.</Field.Description><Field.Error match="valueMissing">Enter your email.</Field.Error></Field.Root>
    <Button type="submit">Create account</Button><output aria-live="polite">{submitted && `Account requested for ${submitted}`}</output>
  </form>;
}
function SelectDemo() {
  const [value, setValue] = useState('north');
  return <div className="doc-stack"><Select.Root name="region" value={value} items={{ north: 'North', south: 'South', locked: 'Unavailable' }} onValueChange={next => setValue(next ?? 'north')}>
    <Select.Trigger aria-label="Region"><Select.Value /><Select.Icon>⌄</Select.Icon></Select.Trigger><Select.Portal><Select.Positioner><Select.Content><Select.List>
      <Select.Item value="north"><Select.ItemText>North</Select.ItemText></Select.Item><Select.Item value="south"><Select.ItemText>South</Select.ItemText></Select.Item><Select.Item value="locked" disabled><Select.ItemText>Unavailable</Select.ItemText></Select.Item>
    </Select.List></Select.Content></Select.Positioner></Select.Portal></Select.Root><output>Selected: {value}</output></div>;
}
function DialogDemo() {
  const [saved, setSaved] = useState('');
  const [name, setName] = useState('Operator');
  const [open, setOpen] = useState(false);
  return <div className="doc-stack"><Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger render={<Button />}>Edit profile</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop /><Dialog.Content>
    <Dialog.Title>Edit profile</Dialog.Title><Dialog.Description>Your public display name.</Dialog.Description>
    <form className="doc-example-form" onSubmit={event => { event.preventDefault(); setSaved(name); setOpen(false); }}>
      <Field.Root name="displayName"><Field.Label>Display name</Field.Label><Input name="displayName" value={name} onValueChange={setName} required /></Field.Root>
      <Dialog.Footer><Dialog.Close render={<Button variant="outline" />}>Cancel</Dialog.Close><Button type="submit">Save profile</Button></Dialog.Footer>
    </form>
  </Dialog.Content></Dialog.Portal></Dialog.Root><output aria-live="polite">{saved && `Saved ${saved}`}</output></div>;
}
function MenuDemo() {
  const [action, setAction] = useState('Choose an action.');
  return <div className="doc-stack"><DropdownMenu.Root><DropdownMenu.Trigger render={<Button variant="outline" />}>Project actions</DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Positioner><DropdownMenu.Content>
    <DropdownMenu.Item onClick={() => setAction('Project duplicated')}>Duplicate</DropdownMenu.Item><DropdownMenu.Item disabled>Archive unavailable</DropdownMenu.Item><DropdownMenu.Item onClick={() => setAction('Project exported')}>Export</DropdownMenu.Item>
  </DropdownMenu.Content></DropdownMenu.Positioner></DropdownMenu.Portal></DropdownMenu.Root><output aria-live="polite">{action}</output></div>;
}

const pages: Page[] = [
  { id: 'button', title: 'Button', description: 'Actions with native button semantics, size and visual variants. Your text and icons.', examples: [{ title: 'Variants and states', node: <ButtonDemo />, code: buttonCode }], props: [['variant', 'primary | secondary | outline | ghost', 'primary'], ['size', 'sm | md | lg | icon', 'md'], ['loading', 'boolean; disables activation and sets aria-busy', 'false'], ['endIcon', 'ReactNode; optional decorative content', '—'], ['ref / native props', 'HTMLButtonElement / ButtonHTMLAttributes', 'Forwarded']] },
  { id: 'input', title: 'Input', description: 'Native text entry with field integration, controlled or uncontrolled values, and forwarded refs.', examples: [{ title: 'Email field', node: <FormDemo />, code: fieldCode }, { title: 'Native input types and disabled state', node: <div className="doc-stack"><Input aria-label="Search projects" type="search" placeholder="Search projects…" /><Input aria-label="Disabled input" disabled defaultValue="Unavailable" /></div>, code: '<Input type="search" name="query" placeholder="Search projects…" />\n<Input disabled defaultValue="Unavailable" />' }], props: [['value / defaultValue', 'Native input value', 'Uncontrolled'], ['onValueChange', '(value, eventDetails) => void', '—'], ['type / name / required / disabled', 'Native input attributes', 'Native defaults'], ['render / ref', 'Custom element / HTMLElement ref', 'input']] },
  { id: 'textarea', title: 'Textarea', description: 'Multiline native text entry. Compose with Field.Control to connect labels, help and validation.', examples: [{ title: 'Project notes', node: <Field.Root name="notes"><Field.Label>Notes</Field.Label><Field.Control name="notes" render={<Textarea rows={4} placeholder="What are you working on?" />} /><Field.Description>Write a short project description.</Field.Description></Field.Root>, code: '<Field.Root name="notes">\n  <Field.Label>Notes</Field.Label>\n  <Field.Control name="notes" render={<Textarea rows={4} />} />\n  <Field.Description>Write a short description.</Field.Description>\n</Field.Root>' }], props: [['native props / ref', 'TextareaHTMLAttributes / HTMLTextAreaElement', 'Forwarded']] },
  { id: 'field', title: 'Field', description: 'Compose a label, control, help and validation message. The association is handled for you.', examples: [{ title: 'Required email', node: <FormDemo />, code: fieldCode }], props: [['Root', 'name, disabled, invalid, validationMode, validate', 'Field context'], ['Label / Description', 'Linked accessible label and help', '—'], ['Control', 'Native control or render={<CustomControl />}', 'input'], ['Error', 'match validity reason or server error', 'Automatic association']] },
  { id: 'checkbox', title: 'Checkbox', description: 'Checkbox behavior with native form participation, mixed state and keyboard support.', examples: [{ title: 'Checked, mixed and disabled', node: <div className="doc-stack"><Field.Root name="notifications"><Field.Label className="doc-row"><Checkbox name="notifications" defaultChecked /> Email notifications</Field.Label></Field.Root><label className="doc-row"><Checkbox aria-label="Some selected" indeterminate /> Some items selected</label><label className="doc-row"><Checkbox disabled /> Unavailable option</label></div>, code: '<Field.Root name="notifications">\n  <Field.Label><Checkbox name="notifications" defaultChecked /> Notifications</Field.Label>\n</Field.Root>\n<Checkbox indeterminate aria-label="Some selected" />' }], props: [['checked / defaultChecked', 'boolean', 'false'], ['onCheckedChange', '(checked, eventDetails) => void', '—'], ['indeterminate / disabled / name', 'Mixed, unavailable and native form states', '—']] },
  { id: 'switch', title: 'Switch', description: 'An on/off setting with controlled state and native form values.', examples: [{ title: 'Motion setting', node: <Field.Root name="feedback"><Field.Label className="doc-row"><Switch name="feedback" defaultChecked /> Action feedback</Field.Label><Field.Description>Enable feedback when actions finish.</Field.Description></Field.Root>, code: '<Field.Root name="feedback">\n  <Field.Label><Switch name="feedback" defaultChecked /> Action feedback</Field.Label>\n  <Field.Description>Enable feedback when actions finish.</Field.Description>\n</Field.Root>' }], props: [['checked / defaultChecked', 'boolean', 'false'], ['onCheckedChange', '(checked, eventDetails) => void', '—'], ['name / disabled / readOnly', 'Native form and interaction options', '—']] },
  { id: 'select', title: 'Select', description: 'A styled selection popup with keyboard navigation, disabled items and form submission.', examples: [{ title: 'Controlled selection', node: <SelectDemo />, code: selectCode }], props: [['Root', 'value/defaultValue, onValueChange, items, name, disabled, required', 'Single selection'], ['Trigger / Value / Icon', 'Compose the visible control; items maps values to labels', '—'], ['Portal / Positioner / Content / List', 'Popup placement, clipping and theme inheritance', '—'], ['Item / ItemText', 'value, disabled and option label', '—']] },
  { id: 'slider', title: 'Slider', description: 'Pointer and keyboard value adjustment, with linked labels, range thumbs and form values.', examples: [{ title: 'Volume', node: <Slider.Root defaultValue={65} name="volume" className="doc-stack"><div className="doc-row"><Slider.Label>Volume</Slider.Label><Slider.Value /></div><Slider.Control><Slider.Track><Slider.Indicator /><Slider.Thumb /></Slider.Track></Slider.Control></Slider.Root>, code: '<Slider.Root defaultValue={65} name="volume">\n  <Slider.Label>Volume</Slider.Label><Slider.Value />\n  <Slider.Control><Slider.Track>\n    <Slider.Indicator /><Slider.Thumb />\n  </Slider.Track></Slider.Control>\n</Slider.Root>' }], props: [['Root', 'value/defaultValue, min, max, step, name, onValueChange', '0–100, step 1'], ['Label / Value', 'Associated text and formatted value', '—'], ['Control / Track / Indicator / Thumb', 'Compose track, fill and one or more thumbs', '—']] },
  { id: 'dialog', title: 'Dialog', description: 'Compose your own modal content. Focus, Escape, dismissal, scroll locking and trigger restoration are handled by Base UI.', examples: [{ title: 'Edit profile', node: <DialogDemo />, code: dialogCode }], props: [['Root', 'open/defaultOpen, onOpenChange, modal', 'Uncontrolled modal'], ['Trigger / Close', 'render={<Button />} composes behavior onto your button', 'Native button'], ['Portal / Backdrop / Content', 'Modal layers; initialFocus/finalFocus supported on Content', 'Themed portal'], ['Title / Description / Footer', 'Accessible naming and caller-owned layout', '—']] },
  { id: 'tabs', title: 'Tabs', description: 'Custom tab labels and panel contents, controlled or uncontrolled selection, disabled tabs and keyboard navigation.', examples: [{ title: 'Project views', node: <Tabs.Root defaultValue="overview"><Tabs.List aria-label="Project views" activateOnFocus><Tabs.Trigger value="overview">Overview</Tabs.Trigger><Tabs.Trigger value="activity">Activity</Tabs.Trigger><Tabs.Trigger value="locked" disabled>Unavailable</Tabs.Trigger></Tabs.List><Tabs.Content value="overview">Your workspace, organized around your next move.</Tabs.Content><Tabs.Content value="activity">Two projects updated today.</Tabs.Content></Tabs.Root>, code: tabsCode }], props: [['Root', 'value/defaultValue, onValueChange, orientation', 'Horizontal'], ['List', 'activateOnFocus, loopFocus', 'Manual activation, wrapping'], ['Trigger', 'value, disabled, render, ref', 'button'], ['Content', 'value, keepMounted', 'Linked panel']] },
  { id: 'card', title: 'Card', description: 'A content surface with independently composed heading, description, body and actions.', examples: [{ title: 'Project card', node: <Card.Root className="doc-card-example"><Card.Header><Badge>Workspace</Badge><Card.Title>Signal studio</Card.Title><Card.Description>Your ideas, in motion.</Card.Description></Card.Header><Card.Content><p>Build the interface your project needs.</p></Card.Content><Card.Footer><Button>Open project</Button><Button variant="outline">Details</Button></Card.Footer></Card.Root>, code: '<Card.Root>\n  <Card.Header>\n    <Card.Title>Signal studio</Card.Title>\n    <Card.Description>Your ideas, in motion.</Card.Description>\n  </Card.Header>\n  <Card.Content>Your own content.</Card.Content>\n  <Card.Footer><Button>Open project</Button></Card.Footer>\n</Card.Root>' }], props: [['Root / Header / Content / Footer', 'Native div attributes and refs', 'Caller-owned content'], ['Title / Description', 'Native heading/paragraph props and refs', 'h3 / p']] },
  { id: 'badge', title: 'Badge & separator', description: 'Compact status labels and structural dividers, with your own content.', examples: [{ title: 'Status', node: <div><div className="doc-row"><Badge>In progress</Badge><Badge variant="outline">Archived</Badge></div><Separator /><p>Separate sections without adding a container.</p></div>, code: '<Badge>In progress</Badge>\n<Badge variant="outline">Archived</Badge>\n<Separator />' }], props: [['Badge.variant', 'solid | outline', 'solid'], ['Badge / Separator', 'Native span/hr props and refs', '—']] },
  { id: 'tooltip', title: 'Tooltip', description: 'Contextual help on focus or hover. Compose it with your own focusable control.', examples: [{ title: 'Action help', node: <Tooltip.Provider delay={100}><Tooltip.Root><Tooltip.Trigger render={<Button variant="outline" />}>Keyboard help</Tooltip.Trigger><Tooltip.Portal><Tooltip.Positioner><Tooltip.Content>Use Tab to move between controls.</Tooltip.Content></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>, code: '<Tooltip.Provider delay={100}>\n  <Tooltip.Root>\n    <Tooltip.Trigger render={<Button />}>Keyboard help</Tooltip.Trigger>\n    <Tooltip.Portal><Tooltip.Positioner>\n      <Tooltip.Content>Use Tab to move between controls.</Tooltip.Content>\n    </Tooltip.Positioner></Tooltip.Portal>\n  </Tooltip.Root>\n</Tooltip.Provider>' }], props: [['Provider', 'delay, closeDelay', 'Shared timing'], ['Root / Trigger', 'open/defaultOpen and custom render', 'Focus or hover'], ['Positioner / Content', 'side, align, offsets and custom content', 'Themed portal']] },
  { id: 'dropdown-menu', title: 'Dropdown menu', description: 'Action menus with focus management, keyboard navigation and disabled items.', examples: [{ title: 'Project actions', node: <MenuDemo />, code: '<DropdownMenu.Root>\n  <DropdownMenu.Trigger render={<Button />}>Actions</DropdownMenu.Trigger>\n  <DropdownMenu.Portal><DropdownMenu.Positioner>\n    <DropdownMenu.Content>\n      <DropdownMenu.Item onClick={duplicate}>Duplicate</DropdownMenu.Item>\n      <DropdownMenu.Item disabled>Unavailable</DropdownMenu.Item>\n    </DropdownMenu.Content>\n  </DropdownMenu.Positioner></DropdownMenu.Portal>\n</DropdownMenu.Root>' }], props: [['Root / Trigger', 'open/defaultOpen, onOpenChange, custom render', 'Uncontrolled'], ['Item', 'onClick, disabled, render and ref', 'menuitem'], ['Portal / Positioner / Content', 'Positioning, focus and theme inheritance', '—']] },
];

function Code({ value }: { value: string }) {
  const [result, setResult] = useState('Copy');
  return <div className="doc-code"><Button variant="ghost" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(value); setResult('Copied'); } catch { setResult('Select code to copy'); } }}>{result}</Button><pre><code>{value}</code></pre></div>;
}
function Preview({ example }: { example: Example }) {
  return <section className="doc-example"><h2>{example.title}</h2><Tabs.Root defaultValue="preview"><Tabs.List aria-label={`${example.title} example`}><Tabs.Trigger value="preview">Preview</Tabs.Trigger><Tabs.Trigger value="code">Code</Tabs.Trigger></Tabs.List><Tabs.Content value="preview"><div className="doc-preview">{example.node}</div></Tabs.Content><Tabs.Content value="code"><Code value={example.code} /></Tabs.Content></Tabs.Root></section>;
}

const install = `# From the Evoker repository
npm ci
npm run package

# In your React application (replace the path)
npm install /path/to/evoker/artifacts/npm/evoker-core-0.1.0.tgz \\
  /path/to/evoker/artifacts/npm/evoker-react-0.1.0.tgz`;
const quickstart = `import { Button, Theme } from '@evoker/react';
import '@evoker/react/styles.css';

export function App() {
  return <Theme appearance="dark">
    <Button onClick={() => console.log('Saved')}>Save changes</Button>
  </Theme>;
}`;

export function Documentation() {
  const blockPages = [...legacyBlockPages, ...sourceBlockPages, ...compositionPages];
  const content = useRef<HTMLElement>(null);
  const readPage = () => location.hash === '#/docs' || location.hash === '#/docs/' ? 'introduction' : location.hash.replace(/^#\/(?:docs\/)?/, '').split('?')[0] || 'introduction';
  const [pageId, setPageId] = useState(readPage);
  const [search, setSearch] = useState('');
  const [appearance, setAppearance] = useState<'dark' | 'light'>('dark');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [reduced, setReduced] = useState<boolean | 'system'>('system');
  useEffect(() => { const change = () => { setPageId(readPage()); window.scrollTo(0, 0); }; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  const page = [...pages, ...blockPages].find(item => item.id === pageId);
  useEffect(() => { document.title = `${page?.title ?? 'Documentation'} — Evoker UI`; content.current?.focus({ preventScroll: true }); }, [pageId, page?.title]);
  return <Theme appearance={appearance} density={density} reducedMotion={reduced} className="doc-app">
    <a className="skip" href="#doc-content" onClick={event => { event.preventDefault(); content.current?.focus(); }}>Skip to documentation</a>
    <header className="doc-header"><BrandLink /><nav aria-label="Documentation"><a href="#/docs/button">Components</a><a href="#">Playground</a><a href="#/docs/theming">Theme</a></nav><Button variant="ghost" size="sm" aria-label="Toggle appearance" onClick={() => setAppearance(value => value === 'dark' ? 'light' : 'dark')}>{appearance === 'dark' ? 'Light' : 'Dark'}</Button></header>
    <div className="doc-layout"><aside className="doc-sidebar"><Input aria-label="Find a component" placeholder="Find a component…" type="search" value={search} onValueChange={setSearch} />
      <nav aria-label="Component pages"><p>Getting started</p>{[['introduction', 'Introduction'], ['installation', 'Installation'], ['theming', 'Theming']].map(([id, title]) => <a key={id} href={`#/docs/${id}`} aria-current={pageId === id ? 'page' : undefined}>{title}</a>)}<p>Primitives</p>
        {pages.filter(item => item.title.toLowerCase().includes(search.toLowerCase())).map(item => <a key={item.id} href={`#/docs/${item.id}`} aria-current={pageId === item.id ? 'page' : undefined}>{item.title}</a>)}
        <p>Blocks & motion</p>
        {blockPages.filter(item => item.title.toLowerCase().includes(search.toLowerCase())).map(item => <a key={item.id} href={`#/docs/${item.id}`} aria-current={pageId === item.id ? 'page' : undefined}>{item.title}</a>)}
        {[...pages, ...blockPages].every(item => !item.title.toLowerCase().includes(search.toLowerCase())) && <small>No matching component.</small>}
      </nav>
    </aside><main ref={content} tabIndex={-1} id="doc-content" className="doc-content" data-doc-page={pageId}>
      {page ? <><p className="doc-eyebrow">Evoker / Components</p><h1>{page.title}</h1><p className="doc-lead">{page.description}</p><Code value={`import { ${page.id === 'dropdown-menu' ? 'DropdownMenu' : page.id === 'badge' ? 'Badge, Separator' : page.title} } from '@evoker/react';`} />
        {page.examples.map(example => <Preview key={`${page.id}-${example.title}`} example={example} />)}
        {blockPages.includes(page) && <p className="doc-note">These are original browser adaptations informed by audited static references. Extracted artwork, fonts and native tables remain private. Exact game runtime fidelity is unverified. Import global CSS once from @evoker/react/styles.css.</p>}
        {page.props && <section className="doc-api"><h2>API</h2><div className="doc-table-scroll"><table><thead><tr><th>Prop or part</th><th>Contract</th><th>Default</th></tr></thead><tbody>{page.props.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div><p className="doc-note">Native attributes are forwarded. Ref support follows each component’s contract. Base UI behavior parts also accept state-aware className/style and render composition props.</p></section>}</>
        : pageId === 'installation' ? <><p className="doc-eyebrow">Getting started</p><h1>Installation</h1><p className="doc-lead">Build the package archives, then install them into your own React application.</p><p>Evoker is currently distributed as local npm archives. React and React DOM 18 or 19 are peer dependencies. The install resolves Base UI and the remaining runtime dependencies normally.</p><Code value={install} /><h2>Import the theme once</h2><Code value={quickstart} /><p>For Next.js, put interactive components behind a client boundary and import the stylesheet in your root layout. The package entry points declare their client boundary.</p><h2>Individual imports</h2><Code value={`import { Button } from '@evoker/react/button';\nimport { Dialog } from '@evoker/react/dialog';\nimport { Tabs } from '@evoker/react/tabs';\nimport { InspectorList } from '@evoker/react/blocks';`} /></>
        : pageId === 'theming' ? <><p className="doc-eyebrow">Getting started</p><h1>Theming</h1><p className="doc-lead">The source palette becomes reusable color roles, spacing, density and motion tokens.</p><div className="doc-row"><Button variant="outline" onClick={() => setDensity(value => value === 'compact' ? 'comfortable' : 'compact')}>Density: {density}</Button><label>Motion <select className="doc-select" aria-label="Documentation motion" value={String(reduced)} onChange={event => setReduced(event.target.value === 'system' ? 'system' : event.target.value === 'true')}><option value="system">System preference</option><option value="true">Reduced</option><option value="false">Full</option></select></label></div><Preview example={{ title: 'Theme preview', node: <FormDemo />, code: '<Theme appearance="light" density="compact" reducedMotion="system">\n  <YourApplication />\n</Theme>' }} /><h2>Override tokens</h2><Code value={`.my-theme {\n  --evoker-blue: #1269cc;\n  --evoker-cyan: #51eefc;\n  --evoker-font: Arial, sans-serif;\n}\n\n<Theme className="my-theme">…</Theme>`} /><p>Portalled menus, selects and dialogs retain the enclosing theme. Extracted sprite layering, separate key/action text, sharp planes and independent motion inform the styling. Game artwork and fonts stay in private research.</p></>
        : <><Badge>React / 0.1</Badge><h1>Build your own<br />next move.</h1><p className="doc-lead">Composable UI primitives with P3R-inspired visual language. Your markup, your application state, your content.</p><div className="doc-row"><a href="#/docs/installation" className="doc-primary-link">Get started ↗</a><a href="#/docs/button">Browse components</a></div><Preview example={{ title: 'Start with a component', node: <Card.Root className="doc-card-example"><Card.Header><Badge>Ready to build</Badge><Card.Title>A system, in pieces.</Card.Title><Card.Description>Compose controls and content into your own interface.</Card.Description></Card.Header><Card.Content><Field.Root><Field.Label>Project name</Field.Label><Input placeholder="Your next project" /></Field.Root></Card.Content><Card.Footer><Button>Create project</Button><Button variant="outline">Explore</Button></Card.Footer></Card.Root>, code: quickstart }} /><h2>A familiar developer experience</h2><p>Install the packages, import the stylesheet, and compose parts. Choose controlled or uncontrolled state, change native attributes, forward refs, customize styling or compose behavior onto your own Button with the render prop.</p><h2>Primitives and blocks</h2><p>Inputs, fields, selects, dialogs and tabs are the building pieces. Collection inspectors, dialogue frames and cut-ins are optional blocks built for the visual language.</p><div className="doc-row"><a href="#/docs/input">Form controls ↗</a><a href="#/docs/dialog">Overlay primitives ↗</a><a href="#/docs/quest-brief">Source-inspired blocks ↗</a></div></>}
    </main></div><footer className="doc-footer">Evoker UI · React primitives, source-inspired motion and composable blocks.</footer>
  </Theme>;
}
