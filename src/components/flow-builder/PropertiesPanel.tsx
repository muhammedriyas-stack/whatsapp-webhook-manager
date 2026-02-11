import { toast } from 'sonner';
import { FlowElement, FlowScreen, ELEMENT_CATEGORIES } from '@/types/flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2, FileText, Layout, Plus, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertiesPanelProps {
  selectedScreen: FlowScreen | null;
  selectedElement: FlowElement | null;
  onScreenUpdate: (screen: FlowScreen) => void;
  onElementUpdate: (element: FlowElement) => void;
}

const getElementLabel = (type: string): string => {
  for (const category of ELEMENT_CATEGORIES) {
    const element = category.elements.find(e => e.type === type);
    if (element) return element.label;
  }
  return type;
};

export function PropertiesPanel({
  selectedScreen,
  selectedElement,
  onScreenUpdate,
  onElementUpdate
}: PropertiesPanelProps) {
  if (selectedElement) {
    return (
      <div className="w-72 bg-sidebar border-l border-sidebar-border flex flex-col h-full">
        <div className="panel-header gap-2">
          <Settings2 className="w-4 h-4" />
          <span>Element Properties</span>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Type</span>
              </div>
              <p className="text-sm text-foreground font-medium pl-6">
                {getElementLabel(selectedElement.type)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layout className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Properties</span>
              </div>

              <div className="flex items-center justify-between pl-6 mb-4">
                <div className="space-y-0.5">
                  <Label className="text-xs text-muted-foreground">Visibility</Label>
                  <p className="text-[10px] text-muted-foreground/70">Show in final Flow JSON</p>
                </div>
                <Switch
                  checked={selectedElement.visibility !== false}
                  onCheckedChange={(checked) => onElementUpdate({ ...selectedElement, visibility: checked })}
                />
              </div>

              {(() => {
                const propsString = JSON.stringify(selectedElement.properties || {});
                const pattern = /\$\{data\.([a-zA-Z0-9_]+)\}/g;
                const matches = [...propsString.matchAll(pattern)];
                const missingVars = matches
                  .map(m => m[1])
                  .filter(v => !selectedScreen?.data || !selectedScreen.data[v]);

                if (missingVars.length > 0) {
                  return (
                    <div className="mx-6 p-2 bg-destructive/10 border border-destructive/20 rounded text-[10px] text-destructive flex gap-2">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <div className="space-y-1">
                        <p className="font-bold">Missing Data Declaration</p>
                        <p>The following variables must be defined in Screen Data:</p>
                        <ul className="list-disc pl-3">
                          {[...new Set(missingVars)].map(v => <li key={v} className="font-mono">{v}</li>)}
                        </ul>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {(() => {
                try {
                  return renderElementProperties(selectedElement, onElementUpdate, selectedScreen);
                } catch (e: any) {
                  return (
                    <div className="mx-6 p-3 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive space-y-2">
                      <p className="font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Rendering Error</p>
                      <p className="text-[10px] opacity-80">{e.message}</p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (selectedScreen) {
    return (
      <div className="w-72 bg-sidebar border-l border-sidebar-border flex flex-col h-full">
        <div className="panel-header gap-2">
          <Settings2 className="w-4 h-4" />
          <span>Screen Properties</span>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Screen Title</Label>
              <Input
                value={selectedScreen.title}
                onChange={(e) => onScreenUpdate({ ...selectedScreen, title: e.target.value })}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Enter screen title"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Screen ID</Label>
              <Input
                value={selectedScreen.id}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^A-Za-z_]/g, '');
                  onScreenUpdate({ ...selectedScreen, id: sanitized });
                }}
                className="bg-sidebar-accent border-sidebar-border font-mono text-xs"
                placeholder="WELCOME_SCREEN"
              />
              <p className="text-[9px] text-muted-foreground italic">Only alphabets and underscores allowed</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs text-muted-foreground">Terminal Screen</Label>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">Ends the flow</p>
              </div>
              <Switch
                checked={selectedScreen.terminal || false}
                onCheckedChange={(checked) => onScreenUpdate({ ...selectedScreen, terminal: checked })}
              />
            </div>

            <div className="pt-4 border-t border-sidebar-border space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Screen Data (Input variables)</span>
              </div>

              <div className="space-y-3">
                {Object.entries(selectedScreen.data || {}).map(([key, config]) => (
                  <div key={key} className="space-y-2 p-2 border border-sidebar-border rounded-md bg-sidebar-accent/30 relative group">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 absolute -right-2 -top-2 bg-background border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newData = { ...selectedScreen.data };
                        delete newData[key];
                        onScreenUpdate({ ...selectedScreen, data: newData });
                      }}
                    >
                      <X className="w-2 h-2" />
                    </Button>
                    <div className="flex gap-2">
                      <Input
                        value={key}
                        onChange={(e) => {
                          const newKey = e.target.value.replace(/[^A-Za-z0-9_]/g, '');
                          const newData = { ...selectedScreen.data };
                          const val = newData[key];
                          delete newData[key];
                          newData[newKey] = val;
                          onScreenUpdate({ ...selectedScreen, data: newData });
                        }}
                        className="h-6 text-[10px] font-mono flex-1"
                        placeholder="Key"
                      />
                      <Select
                        value={config.type}
                        onValueChange={(val) => {
                          const newData = { ...selectedScreen.data };
                          newData[key] = { ...config, type: val };
                          onScreenUpdate({ ...selectedScreen, data: newData });
                        }}
                      >
                        <SelectTrigger className="h-6 text-[10px] w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      value={config.__example__}
                      onChange={(e) => {
                        const newData = { ...selectedScreen.data };
                        newData[key] = { ...config, __example__: e.target.value };
                        onScreenUpdate({ ...selectedScreen, data: newData });
                      }}
                      className="h-6 text-[10px]"
                      placeholder="Example value"
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-[10px] border-dashed"
                  onClick={() => {
                    const newData = { ...(selectedScreen.data || {}) };
                    const newKey = `var_${Object.keys(newData).length + 1} `;
                    newData[newKey] = { type: 'string', __example__: '' };
                    onScreenUpdate({ ...selectedScreen, data: newData });
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Variable
                </Button>
              </div>

              <div className="pt-2">
                <p className="text-[10px] text-muted-foreground italic">
                  Dynamic fields like `${`{data.var}`} ` must be declared here.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-sidebar-border">
              <p className="text-xs text-muted-foreground">
                Elements: {selectedScreen.elements.length}
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="w-72 bg-sidebar border-l border-sidebar-border flex flex-col h-full">
      <div className="panel-header gap-2">
        <Settings2 className="w-4 h-4" />
        <span>Properties</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <div className="text-muted-foreground">
          <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Select a screen or element to view its properties</p>
        </div>
      </div>
    </div>
  );
}

function renderElementProperties(
  element: FlowElement,
  onUpdate: (element: FlowElement) => void,
  screen: FlowScreen | null
) {
  const updateProperty = (key: string, value: any) => {
    onUpdate({
      ...element,
      properties: { ...(element.properties || {}), [key]: value }
    });
  };

  const availableFormFields = screen?.elements?.filter(e =>
    ['TextInput', 'TextArea', 'RadioButtonsGroup', 'Dropdown', 'CheckboxGroup', 'DatePicker', 'PhotoPicker'].includes(e.type)
  ).map(e => ({
    name: (e.properties?.name || '') as string,
    visible: e.visibility !== false,
    id: e.id
  })).filter(f => f.name) || [];

  const formFields = availableFormFields.map(f => f.name);

  const screenOptions = screen ? [{ id: screen.id, title: screen.title }] : []; // Simplification, ideally all screens

  const renderConditionalVisibility = () => (
    <div className="space-y-4 pt-4 mt-4 border-t border-sidebar-border pl-6">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Conditional Visibility</Label>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Rule (Expression)</Label>
        <Input
          value={element.conditionalVisibility || ''}
          onChange={(e) => onUpdate({ ...element, conditionalVisibility: e.target.value })}
          className="bg-sidebar-accent border-sidebar-border font-mono text-[11px]"
          placeholder="e.g. data.show_field == true"
        />
        <p className="text-[10px] text-muted-foreground italic">Leave empty for always visible</p>
      </div>
    </div>
  );

  const renderBasicDisplay = () => (
    <div className="space-y-2 pl-6">
      <Label className="text-xs text-muted-foreground">Text Content</Label>
      <Textarea
        value={element.properties.text || ''}
        onChange={(e) => updateProperty('text', e.target.value)}
        className="bg-sidebar-accent border-sidebar-border min-h-[80px]"
        placeholder="Enter text content..."
      />
    </div>
  );

  const renderProperties = () => {
    switch (element.type) {
      case 'Form':
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Form Name (Internal)</Label>
              <Input
                value={element.properties.name || ''}
                onChange={(e) => updateProperty('name', e.target.value.replace(/[^A-Za-z_]/g, ''))}
                className="bg-sidebar-accent border-sidebar-border font-mono text-xs"
                placeholder="my_form"
              />
            </div>
          </div>
        );

      case 'TextHeading':
      case 'TextSubheading':
      case 'TextBody':
      case 'TextCaption':
        return renderBasicDisplay();

      case 'Image':
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Image URL</Label>
              <Input
                value={element.properties.url || ''}
                onChange={(e) => updateProperty('url', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="https://example.com/image.png"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Alt Text</Label>
              <Input
                value={element.properties.altText || ''}
                onChange={(e) => updateProperty('altText', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Image description"
              />
            </div>
          </div>
        );

      case 'EmbeddedLink':
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Link Text</Label>
              <Input
                value={element.properties.text || ''}
                onChange={(e) => updateProperty('text', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Click here"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">URL</Label>
              <Input
                value={element.properties.url || ''}
                onChange={(e) => updateProperty('url', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="https://example.com"
              />
            </div>
          </div>
        );

      case 'TextInput':
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Name (Variable ID)</Label>
              <Input
                value={element.properties.name || ''}
                onChange={(e) => updateProperty('name', e.target.value.replace(/[^A-Za-z_]/g, ''))}
                className="bg-sidebar-accent border-sidebar-border font-mono text-xs"
                placeholder="e.g. phone_number"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={element.properties.label || ''}
                onChange={(e) => updateProperty('label', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Display label"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label Variant</Label>
              <Select
                value={element.properties['label-variant'] || 'body'}
                onValueChange={(value) => updateProperty('label-variant', value)}
              >
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Input Type</Label>
              <Select
                value={element.properties['input-type'] || 'text'}
                onValueChange={(value) => updateProperty('input-type', value)}
              >
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="passcode">Passcode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Helper Text</Label>
              <Input
                value={element.properties['helper-text'] || ''}
                onChange={(e) => updateProperty('helper-text', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Help text (Mandatory if pattern used)"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Min Chars</Label>
                <Input
                  type="number"
                  value={element.properties['min-chars'] || ''}
                  onChange={(e) => updateProperty('min-chars', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-sidebar-accent border-sidebar-border h-8"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Max Chars</Label>
                <Input
                  type="number"
                  value={element.properties['max-chars'] || ''}
                  onChange={(e) => updateProperty('max-chars', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-sidebar-accent border-sidebar-border h-8"
                />
              </div>
            </div>
            {['text', 'password', 'passcode', 'number'].includes(element.properties['input-type'] || 'text') && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Pattern (Regex)</Label>
                <Input
                  value={element.properties.pattern || ''}
                  onChange={(e) => updateProperty('pattern', e.target.value)}
                  className="bg-sidebar-accent border-sidebar-border font-mono text-[11px]"
                  placeholder="e.g. ^[0-9]{10}$"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Required</Label>
              <Switch
                checked={element.properties.required || false}
                onCheckedChange={(checked) => updateProperty('required', checked)}
              />
            </div>
          </div>
        );

      case 'TextArea':
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Name (Variable ID)</Label>
              <Input
                value={element.properties.name || ''}
                onChange={(e) => updateProperty('name', e.target.value.replace(/[^A-Za-z_]/g, ''))}
                className="bg-sidebar-accent border-sidebar-border font-mono text-xs"
                placeholder="e.g. feedback"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={element.properties.label || ''}
                onChange={(e) => updateProperty('label', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Display label"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Helper Text</Label>
              <Input
                value={element.properties['helper-text'] || ''}
                onChange={(e) => updateProperty('helper-text', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Min Chars</Label>
                <Input
                  type="number"
                  value={element.properties['min-chars'] || ''}
                  onChange={(e) => updateProperty('min-chars', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-sidebar-accent border-sidebar-border h-8"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Max Chars</Label>
                <Input
                  type="number"
                  value={element.properties['max-chars'] || ''}
                  onChange={(e) => updateProperty('max-chars', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-sidebar-accent border-sidebar-border h-8"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Required</Label>
              <Switch
                checked={element.properties.required || false}
                onCheckedChange={(checked) => updateProperty('required', checked)}
              />
            </div>
          </div>
        );

      case 'RadioButtonsGroup':
      case 'Dropdown':
      case 'CheckboxGroup':
        const dataSource = element.properties['data-source'];
        const isDynamicBinding = typeof dataSource === 'string';
        const options = isDynamicBinding ? [] : (dataSource || []);

        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Name (Variable ID)</Label>
              <Input
                value={element.properties.name || ''}
                onChange={(e) => updateProperty('name', e.target.value.replace(/[^A-Za-z_]/g, ''))}
                className="bg-sidebar-accent border-sidebar-border font-mono text-xs"
                placeholder="e.g. selection"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={element.properties.label || ''}
                onChange={(e) => updateProperty('label', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Display label"
              />
            </div>

            {isDynamicBinding ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Data Source (Dynamic)</Label>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-primary">Runtime Binding</p>
                      <p className="text-[10px] text-muted-foreground">
                        Options will be resolved at runtime from screen data
                      </p>
                      <code className="block text-[11px] font-mono text-primary/80 mt-1">
                        {dataSource}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Data Source Options</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      const newOptions = [...options, {
                        uid: `opt_${Date.now()} `,
                        id: `opt_${options.length + 1} `,
                        title: ''
                      }];
                      updateProperty('data-source', newOptions);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3 max-h-64 overflow-auto pr-1">
                  {options.map((opt: any, idx: number) => (
                    <div key={opt.uid || opt.id || idx} className="space-y-2 p-2 border border-sidebar-border rounded-md bg-sidebar-accent/30 relative group overflow-visible">

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 absolute -right-2 -top-2 bg-background border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newOptions = options.filter((_: any, i: number) => i !== idx);
                          updateProperty('data-source', newOptions);
                        }}
                      >
                        <X className="w-3 h-3 z-50" />
                      </Button>
                      <Input
                        value={opt.id}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/[^A-Za-z_]/g, '');
                          const newOptions = [...options];
                          newOptions[idx] = { ...opt, id: sanitized };
                          updateProperty('data-source', newOptions);
                        }}
                        className="h-7 text-[10px] font-mono"
                        placeholder="Option ID (unique)"
                      />
                      <Input
                        value={opt.title}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[idx] = { ...opt, title: e.target.value };
                          updateProperty('data-source', newOptions);
                        }}
                        className="h-7 text-xs font-medium"
                        placeholder="Option Title"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Required</Label>
              <Switch
                checked={element.properties.required || false}
                onCheckedChange={(checked) => updateProperty('required', checked)}
              />
            </div>
          </div>
        );

      case 'DatePicker':
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Name (Variable ID)</Label>
              <Input
                value={element.properties.name || ''}
                onChange={(e) => updateProperty('name', e.target.value.replace(/[^A-Za-z_]/g, ''))}
                className="bg-sidebar-accent border-sidebar-border font-mono text-xs"
                placeholder="e.g. appointment_date"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={element.properties.label || ''}
                onChange={(e) => updateProperty('label', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Select Date"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Helper Text</Label>
              <Input
                value={element.properties['helper-text'] || ''}
                onChange={(e) => updateProperty('helper-text', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Choose a slot"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Min Date (YYYY-MM-DD)</Label>
                <Input
                  value={element.properties['min-date'] || ''}
                  onChange={(e) => updateProperty('min-date', e.target.value)}
                  className="bg-sidebar-accent border-sidebar-border h-8 text-[10px]"
                  placeholder="e.g. 2024-10-21 or ${data.min_date}"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Max Date (YYYY-MM-DD)</Label>
                <Input
                  value={element.properties['max-date'] || ''}
                  onChange={(e) => updateProperty('max-date', e.target.value)}
                  className="bg-sidebar-accent border-sidebar-border h-8 text-[10px]"
                  placeholder="e.g. 2024-12-31 or ${data.max_date}"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Unavailable Dates</Label>
              <Textarea
                value={Array.isArray(element.properties['unavailable-dates']) ? element.properties['unavailable-dates'].join(', ') : ''}
                onChange={(e) => updateProperty('unavailable-dates', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                className="bg-sidebar-accent border-sidebar-border text-[10px] font-mono"
                placeholder="TS1, TS2, ..."
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Enable data_exchange</Label>
              <Switch
                checked={!!element.properties['on-select-action']}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateProperty('on-select-action', { name: 'data_exchange', payload: {} });
                  } else {
                    updateProperty('on-select-action', undefined);
                  }
                }}
              />
            </div>
          </div>
        );

      case 'PhotoPicker':
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Name (Variable ID)</Label>
              <Input
                value={element.properties.name || ''}
                onChange={(e) => updateProperty('name', e.target.value.replace(/[^A-Za-z_]/g, ''))}
                className="bg-sidebar-accent border-sidebar-border font-mono text-xs"
                placeholder="e.g. user_photo"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label (Header)</Label>
              <Input
                value={element.properties.label || ''}
                onChange={(e) => updateProperty('label', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Upload your photo"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Description (Body)</Label>
              <Textarea
                value={element.properties.description || ''}
                onChange={(e) => updateProperty('description', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border text-xs"
                placeholder="Additional instructions..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Photo Source</Label>
              <Select
                value={element.properties['photo-source'] || 'camera_gallery'}
                onValueChange={(value) => updateProperty('photo-source', value)}
              >
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camera_gallery">Camera & Gallery</SelectItem>
                  <SelectItem value="camera">Camera Only</SelectItem>
                  <SelectItem value="gallery">Gallery Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Max File Size (KB)</Label>
              <Input
                type="number"
                value={element.properties['max-file-size-kb'] ?? 25600}
                onChange={(e) => updateProperty('max-file-size-kb', parseInt(e.target.value))}
                className="bg-sidebar-accent border-sidebar-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Min Photos</Label>
                <Input
                  type="number"
                  value={element.properties['min-uploaded-photos'] ?? 0}
                  onChange={(e) => updateProperty('min-uploaded-photos', parseInt(e.target.value))}
                  className="bg-sidebar-accent border-sidebar-border h-8"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Max Photos</Label>
                <Input
                  type="number"
                  value={element.properties['max-uploaded-photos'] ?? 30}
                  onChange={(e) => updateProperty('max-uploaded-photos', parseInt(e.target.value))}
                  className="bg-sidebar-accent border-sidebar-border h-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Error Message</Label>
              <Input
                value={element.properties['error-message'] || ''}
                onChange={(e) => updateProperty('error-message', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Upload error message"
              />
            </div>
          </div>
        );

      case 'IfElse':
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Condition (Expression)</Label>
              <Input
                value={element.properties.condition || ''}
                onChange={(e) => updateProperty('condition', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border font-mono text-xs"
                placeholder="data.age > 18"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">True Destination (Screen ID)</Label>
              <Input
                value={element.properties.trueDestination || ''}
                onChange={(e) => updateProperty('trueDestination', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">False Destination (Screen ID)</Label>
              <Input
                value={element.properties.falseDestination || ''}
                onChange={(e) => updateProperty('falseDestination', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
              />
            </div>
          </div>
        );

      case 'NavigationList':
        const navDataSource = element.properties['data-source'];
        const isNavDynamicBinding = typeof navDataSource === 'string';
        const navOptions = isNavDynamicBinding ? [] : (navDataSource || []);

        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                value={element.properties.name || ''}
                onChange={(e) => updateProperty('name', e.target.value.replace(/[^A-Za-z_]/g, ''))}
                className="bg-sidebar-accent border-sidebar-border font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={element.properties.label || ''}
                onChange={(e) => updateProperty('label', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
              />
            </div>

            {isNavDynamicBinding ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Data Source (Dynamic)</Label>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-primary">Runtime Binding</p>
                      <p className="text-[10px] text-muted-foreground">
                        Navigation items will be resolved at runtime from screen data
                      </p>
                      <code className="block text-[11px] font-mono text-primary/80 mt-1">
                        {navDataSource}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Nav Options</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => updateProperty('data-source', [...navOptions, {
                      uid: `nav_${Date.now()} `,
                      id: `nav_${navOptions.length + 1} `,
                      title: '',
                      onSelectAction: 'navigate'
                    }])}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3 max-h-64 overflow-auto pr-1">
                  {navOptions.map((opt: any, idx: number) => (
                    <div key={opt.uid || opt.id || idx} className="space-y-2 p-2 border border-sidebar-border rounded-md bg-sidebar-accent/30 relative group">

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 absolute -right-2 -top-2 bg-background border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newOptions = navOptions.filter((_: any, i: number) => i !== idx);
                          updateProperty('data-source', newOptions);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <Input
                        value={opt.title}
                        onChange={(e) => {
                          const newOptions = [...navOptions];
                          newOptions[idx] = { ...opt, title: e.target.value };
                          updateProperty('data-source', newOptions);
                        }}
                        className="h-7 text-xs font-medium"
                        placeholder="Title"
                      />
                      <Input
                        value={opt.target}
                        onChange={(e) => {
                          const newOptions = [...navOptions];
                          newOptions[idx] = { ...opt, target: e.target.value };
                          updateProperty('data-source', newOptions);
                        }}
                        className="h-7 text-[10px] font-mono"
                        placeholder="Target screen ID"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'DocumentPicker':
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Name (Variable ID)</Label>
              <Input
                value={element.properties.name || ''}
                onChange={(e) => updateProperty('name', e.target.value.replace(/[^A-Za-z_]/g, ''))}
                className="bg-sidebar-accent border-sidebar-border font-mono text-xs"
                placeholder="e.g. medical_docs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label (Header)</Label>
              <Input
                value={element.properties.label || ''}
                onChange={(e) => updateProperty('label', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Upload your documents"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Description (Body)</Label>
              <Textarea
                value={element.properties.description || ''}
                onChange={(e) => updateProperty('description', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border text-xs"
                placeholder="Additional instructions..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Max File Size (KB)</Label>
              <Input
                type="number"
                value={element.properties['max-file-size-kb'] ?? 25600}
                onChange={(e) => updateProperty('max-file-size-kb', parseInt(e.target.value))}
                className="bg-sidebar-accent border-sidebar-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Min Docs</Label>
                <Input
                  type="number"
                  value={element.properties['min-uploaded-documents'] ?? 0}
                  onChange={(e) => updateProperty('min-uploaded-documents', parseInt(e.target.value))}
                  className="bg-sidebar-accent border-sidebar-border h-8"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Max Docs</Label>
                <Input
                  type="number"
                  value={element.properties['max-uploaded-documents'] ?? 30}
                  onChange={(e) => updateProperty('max-uploaded-documents', parseInt(e.target.value))}
                  className="bg-sidebar-accent border-sidebar-border h-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Allowed Mime Types</Label>
              <Textarea
                value={Array.isArray(element.properties['allowed-mime-types']) ? element.properties['allowed-mime-types'].join(', ') : ''}
                onChange={(e) => updateProperty('allowed-mime-types', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                className="bg-sidebar-accent border-sidebar-border text-[10px] font-mono"
                placeholder="application/pdf, image/jpeg, ..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Error Message</Label>
              <Input
                value={element.properties['error-message'] || ''}
                onChange={(e) => updateProperty('error-message', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
                placeholder="Upload error message"
              />
            </div>
          </div>
        );

      case 'Footer': {
        const payload = element.properties['on-click-action']?.payload || {};
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Label</Label>
                {!element.properties.label && (
                  <span className="text-[9px] text-destructive font-bold uppercase flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> Required
                  </span>
                )}
              </div>
              <Input
                value={element.properties.label || ''}
                onChange={(e) => updateProperty('label', e.target.value)}
                className={cn(
                  "bg-sidebar-accent border-sidebar-border",
                  !element.properties.label && "border-destructive/50 ring-1 ring-destructive/20"
                )}
                placeholder="Submit"
              />
            </div>
            <div className="space-y-4 pt-4 border-t border-sidebar-border">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Action: Complete</Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Payload Mapping</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                      const newPayload = { ...payload };
                      availableFormFields.forEach(field => {
                        if (field.visible && field.name) {
                          newPayload[field.name] = `\${form.${field.name}}`;
                        }
                      });
                      updateProperty('on-click-action', {
                        name: 'complete',
                        payload: newPayload
                      });
                      toast.success('All available variables added to payload');
                    }}
                  >
                    Select All
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {availableFormFields.map(field => {
                    const isSelected = Object.values(payload).some(v => v === `\${form.${field.name}}`);
                    const payloadKey = Object.keys(payload).find(k => payload[k] === `\${form.${field.name}}`) || field.name;

                    return (
                      <div key={field.id} className={cn(
                        "space-y-2 p-2 rounded-lg border transition-colors",
                        field.visible ? "bg-sidebar-accent/50 border-sidebar-border" : "bg-destructive/5 border-destructive/20"
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isSelected}
                              disabled={!field.visible}
                              onCheckedChange={(checked) => {
                                const newPayload = { ...payload };
                                if (checked) {
                                  newPayload[field.name] = `\${form.${field.name}}`;
                                } else {
                                  const keyToRemove = Object.keys(newPayload).find(k => newPayload[k] === `\${form.${field.name}}`);
                                  if (keyToRemove) delete newPayload[keyToRemove];
                                }
                                updateProperty('on-click-action', {
                                  name: 'complete',
                                  payload: newPayload
                                });
                              }}
                            />
                            <span className={cn(
                              "text-xs font-mono font-medium",
                              !field.visible && "text-muted-foreground line-through"
                            )}>
                              {field.name}
                            </span>
                          </div>
                          {!field.visible ? (
                            <div className="flex items-center gap-1 text-destructive">
                              <AlertCircle className="w-3 h-3" />
                              <span className="text-[10px] font-medium">{isSelected ? 'Payload Conflict' : 'Invisible'}</span>
                            </div>
                          ) : null}
                        </div>

                        {isSelected && field.visible && (
                          <div className="space-y-1.5 pl-9">
                            <div className="flex items-center justify-between">
                              <Label className="text-[9px] text-muted-foreground uppercase">Output Key Name</Label>
                              {!payloadKey && (
                                <span className="text-[8px] text-destructive font-bold uppercase">Key Required</span>
                              )}
                            </div>
                            <Input
                              value={payloadKey}
                              onChange={(e) => {
                                const newKey = e.target.value.replace(/[^A-Za-z_]/g, '');
                                const newPayload = { ...payload };
                                const oldKey = Object.keys(newPayload).find(k => newPayload[k] === `\${form.${field.name}}`);
                                if (oldKey) delete newPayload[oldKey];
                                newPayload[newKey] = `\${form.${field.name}}`;
                                updateProperty('on-click-action', {
                                  name: 'complete',
                                  payload: newPayload
                                });
                              }}
                              className={cn(
                                "h-7 text-[11px] bg-background border-sidebar-border",
                                !payloadKey && "border-destructive/50 ring-1 ring-destructive/20"
                              )}
                              placeholder="Key in response"
                            />
                            <p className="text-[9px] text-primary/70 font-mono">Value: {"${form." + field.name + "}"}</p>
                          </div >
                        )}
                      </div >
                    );
                  })}

                  {/* Validate existing payload for deleted or invalid fields */}
                  {
                    Object.keys(payload).map(key => {
                      const value = payload[key];
                      const isFormField = value.startsWith('${form.') && value.endsWith('}');
                      if (!isFormField) return null;

                      const fieldName = value.replace('${form.', '').replace('}', '');
                      const exists = availableFormFields.find(f => f.name === fieldName);

                      if (!exists) {
                        return (
                          <div key={key} className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 space-y-2">
                            <div className="flex items-center justify-between text-destructive">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs font-bold">Invalid Reference</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-5 h-5 hovre:bg-destructive/20 text-destructive"
                                onClick={() => {
                                  const newPayload = { ...payload };
                                  delete newPayload[key];
                                  updateProperty('on-click-action', {
                                    name: 'complete',
                                    payload: newPayload
                                  });
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-[10px] text-destructive/80">
                              Key <strong>{key}</strong> maps to non-existent field <strong>{fieldName}</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })
                  }

                  {
                    availableFormFields.length === 0 && (
                      <p className="text-[10px] text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                        Add visible input fields to the screen to configure the payload.
                      </p>
                    )
                  }
                </div >
              </div >

              <div className="space-y-2.5 pt-2 border-t border-sidebar-border">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Custom Static Constants</Label>
                <div className="space-y-2">
                  {Object.keys(payload).filter(k => !payload[k].startsWith('${form.')).map(key => (
                    <div key={key} className="flex items-center gap-2">
                      <Input
                        value={key}
                        onChange={(e) => {
                          const newKey = e.target.value.replace(/[^A-Za-z_]/g, '');
                          const newPayload = { ...payload };
                          const val = newPayload[key];
                          delete newPayload[key];
                          newPayload[newKey] = val;
                          updateProperty('on-click-action', { name: 'complete', payload: newPayload });
                        }}
                        className={cn(
                          "h-7 text-[10px] flex-1",
                          !key && "border-destructive/50 ring-1 ring-destructive/20"
                        )}
                        placeholder="Key"
                      />
                      <Input
                        value={payload[key]}
                        onChange={(e) => {
                          const newPayload = { ...payload, [key]: e.target.value };
                          updateProperty('on-click-action', { name: 'complete', payload: newPayload });
                        }}
                        className="h-7 text-[10px] flex-1"
                        placeholder="Value"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          const newPayload = { ...payload };
                          delete newPayload[key];
                          updateProperty('on-click-action', { name: 'complete', payload: newPayload });
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs border-dashed"
                    onClick={() => {
                      const newPayload = { ...payload, [`static_field_${Date.now()}`]: "value" };
                      updateProperty('on-click-action', {
                        name: 'complete',
                        payload: newPayload
                      });
                    }}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Add Static Constant
                  </Button>
                </div>
              </div>
            </div >
          </div >
        );
      }

      case 'CTABtn':
        return (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={element.properties.label || ''}
                onChange={(e) => updateProperty('label', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Action Type</Label>
              <Select
                value={element.properties['action-type'] || 'navigate'}
                onValueChange={(value) => updateProperty('action-type', value)}
              >
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="navigate">Navigate to Screen</SelectItem>
                  <SelectItem value="externalLink">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Target (Screen ID or URL)</Label>
              <Input
                value={element.properties.target || ''}
                onChange={(e) => updateProperty('target', e.target.value)}
                className="bg-sidebar-accent border-sidebar-border"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="pl-6 text-xs text-muted-foreground">
            No configurable properties for {element.type}
          </div>
        );
    }
  };

  const content = renderProperties();

  return (
    <div className="space-y-6">
      {content || (
        <div className="pl-6 text-xs text-muted-foreground italic">
          No editor available for "{element.type}"
        </div>
      )}
      {renderConditionalVisibility()}

      {/* Debug view for developers in case of issues */}
      <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity pl-6">
        <details>
          <summary className="text-[10px] cursor-pointer text-muted-foreground">Raw JSON Debug</summary>
          <pre className="text-[9px] mt-2 overflow-auto max-h-40 bg-card p-2 rounded">
            {JSON.stringify(element.properties, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
