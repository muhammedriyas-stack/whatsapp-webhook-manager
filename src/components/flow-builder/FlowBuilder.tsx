import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { ElementPalette } from './ElementPalette';
import { FlowCanvas } from './FlowCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { JsonPreview } from './JsonPreview';
import { PreviewModal } from './PreviewModal';
import { JsonEditor } from './JsonEditor';
import { SaveFlowDialog } from './SaveFlowDialog';
import { FlowScreen, FlowElement, FlowElementType, FlowData, Client } from '@/types/flow';
import { toast } from 'sonner';
import { useGetClients } from '@/services/client.service';
import { useCreateFlow, useUpdateFlow, useGetFlowById } from '@/services/flow.service';

// Helper to generate IDs for local state
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to convert internal FlowScreen to API FlowData format
const convertToApiFormat = (screens: FlowScreen[]): FlowData => ({
  version: '7.3',
  screens: screens.map(screen => {
    const visibleElements = screen.elements.filter(el => el.visibility !== false);

    // Filter elements into categories for layout assembly
    const layoutChildren: any[] = [];

    // Helper to format an element for JSON
    const formatElement = (el: FlowElement) => {
      const { ...props } = el.properties;
      const mappedVisible = el.conditionalVisibility ? el.conditionalVisibility : undefined;

      // Base object with foundational properties
      let result: any = {
        type: el.type,
      };

      if (mappedVisible) result.visible = mappedVisible;

      // Sanitize name if it exists (must match /^[A-Za-z_]+$/)
      if (props.name) result.name = props.name.replace(/[^A-Za-z_]/g, '');
      if (props.label) result.label = props.label;
      if (props.required !== undefined) result.required = props.required;

      // Map specific component fields - Override any properties that need special transformation
      switch (el.type) {
        case 'TextInput':
          result['input-type'] = props['input-type'] || 'text';
          break;
        case 'RadioButtonsGroup':
        case 'CheckboxGroup':
        case 'Dropdown':
          if (props['data-source']) {
            // Handle both static arrays and dynamic bindings (e.g., ${data.options})
            if (Array.isArray(props['data-source'])) {
              result['data-source'] = props['data-source'].map((item: any) => ({
                id: item.id,
                title: item.title
              }));
            } else {
              // Dynamic binding - pass through unchanged for runtime resolution
              result['data-source'] = props['data-source'];
            }
          }
          break;
        case 'NavigationList':
          if (props['data-source']) {
            // Handle both static arrays and dynamic bindings (e.g., ${data.nav_items})
            if (Array.isArray(props['data-source'])) {
              result['data-source'] = props['data-source'].map((opt: any) => ({
                id: opt.id,
                title: opt.title,
                'on-select-action': {
                  name: opt.onSelectAction || 'navigate',
                  next: {
                    type: 'screen',
                    name: opt.target || ''
                  }
                }
              }));
            } else {
              // Dynamic binding - pass through unchanged for runtime resolution
              result['data-source'] = props['data-source'];
            }
          }
          break;
        case 'CTABtn':
          result.type = 'Button';
          result['on-click-action'] = {
            name: props['action-type'] || 'navigate',
            next: {
              type: props['action-type'] === 'externalLink' ? 'url' : 'screen',
              name: props.target || ''
            }
          };
          break;
        case 'Footer': {
          const action = props['on-click-action'] || props.on_click_action || { name: 'complete', payload: {} };
          const rawPayload = action.payload || {};
          const filteredPayload: Record<string, any> = {};

          Object.keys(rawPayload).forEach(key => {
            const val = rawPayload[key];
            if (typeof val === 'string' && val.startsWith('${form.')) {
              const fieldName = val.replace('${form.', '').replace('}', '');
              const fieldElement = screen.elements.find(e => e.properties.name === fieldName);
              if (fieldElement && fieldElement.visibility !== false) {
                filteredPayload[key] = val;
              }
            } else {
              filteredPayload[key] = val;
            }
          });

          result['on-click-action'] = {
            name: action.name || 'complete',
            payload: filteredPayload
          };
          break;
        }
        case 'Image':
          result.url = props.url;
          result.alt_text = props.alt_text || props.altText;
          break;
      }

      // Preserve all other properties to allow JSON-first additions
      Object.keys(props).forEach(key => {
        if (result[key] === undefined && !['conditionalVisibility', 'visibility'].includes(key)) {
          // Meta Flow v7.x schema restrictions for TextInput/DatePicker
          if (['TextInput', 'DatePicker'].includes(el.type)) {
            if (key === 'error-message') return; // Unsupported
          }

          // Meta Flow v7.x schema does not support init-value for TextArea, TextInput or DatePicker
          if (['TextArea', 'TextInput', 'DatePicker'].includes(el.type) && key === 'init-value') return;

          // Specific TextInput pattern restriction
          if (el.type === 'TextInput' && key === 'pattern') {
            const type = props['input-type'] || 'text';
            if (!['text', 'password', 'passcode', 'number'].includes(type)) return;
          }

          result[key] = props[key];
        }
      });

      return result;
    };

    // 1. Identify special structural components
    const footer = visibleElements.find(el => el.type === 'Footer');
    const formElement = visibleElements.find(el => el.type === 'Form');

    // 2. Add Display components that come before the Form
    const beforeFormElements = visibleElements.filter(el =>
      ['TextHeading', 'TextSubheading', 'TextBody', 'TextCaption', 'Image', 'EmbeddedLink'].includes(el.type) &&
      visibleElements.indexOf(el) < (formElement ? visibleElements.indexOf(formElement) : visibleElements.length)
    );

    beforeFormElements.forEach(el => layoutChildren.push(formatElement(el)));

    // 3. Assemble the Form if it exists or if there are input fields
    const inputFields = visibleElements.filter(el =>
      ['TextInput', 'TextArea', 'RadioButtonsGroup', 'Dropdown', 'CheckboxGroup', 'DatePicker', 'PhotoPicker', 'DocumentPicker'].includes(el.type)
    );

    if (formElement || inputFields.length > 0) {
      layoutChildren.push({
        type: 'Form',
        name: (formElement?.properties.name || 'flow_form').replace(/[^A-Za-z_]/g, ''),
        ...(formElement?.conditionalVisibility ? { visible: formElement.conditionalVisibility } : {}),
        children: inputFields.map(el => formatElement(el))
      });
    }

    // 4. Add Logic components
    const logicComponents = visibleElements.filter(el =>
      ['NavigationList', 'CTABtn', 'IfElse'].includes(el.type)
    );

    logicComponents.forEach(el => layoutChildren.push(formatElement(el)));

    // 5. Add Display components that come after the Form
    const afterFormElements = visibleElements.filter(el =>
      ['TextHeading', 'TextSubheading', 'TextBody', 'TextCaption', 'Image', 'EmbeddedLink'].includes(el.type) &&
      formElement && visibleElements.indexOf(el) > visibleElements.indexOf(formElement)
    );

    afterFormElements.forEach(el => layoutChildren.push(formatElement(el)));

    // 6. Add Footer at the end
    if (footer) {
      layoutChildren.push(formatElement(footer));
    }

    return {
      id: screen.id.replace(/[^A-Za-z_]/g, ''),
      title: screen.title,
      terminal: screen.terminal ?? !!footer,
      ...(screen.data && Object.keys(screen.data).length > 0 ? { data: screen.data } : {}),
      layout: {
        type: 'SingleColumnLayout',
        children: layoutChildren
      } as any
    };
  })
});

// Helper to convert API FlowData format back to internal FlowScreen[]
const convertFromApiFormat = (data: FlowData): FlowScreen[] => {
  if (!data?.screens || !Array.isArray(data.screens)) return [];

  return data.screens.map(apiScreen => {
    const elements: FlowElement[] = [];

    const processElement = (apiEl: any) => {
      const { type, name, label, required, visible, ...otherProps } = apiEl;

      const element: FlowElement = {
        id: apiEl.id || generateId(), // Preserve ID if possible for stability
        type: type === 'Button' ? 'CTABtn' : type,
        name: name || '',
        properties: {
          name,
          label,
          required,
          ...otherProps
        },
        visibility: visible !== undefined ? (typeof visible === 'boolean' ? visible : true) : true,
        conditionalVisibility: typeof visible === 'string' ? visible : undefined,
      };

      // Special handling for mapping types
      if (type === 'TextInput' && apiEl['input-type']) {
        element.properties['input-type'] = apiEl['input-type'];
      }

      // Map Button actions back to internal format
      if (type === 'Button' && apiEl['on-click-action']) {
        const action = apiEl['on-click-action'];
        element.properties['action-type'] = action.name;
        if (action.next) {
          element.properties['target'] = action.next.name;
        }
      }

      // Map NavigationList actions back
      if (type === 'NavigationList' && apiEl['data-source']) {
        // Handle both static arrays and dynamic bindings when parsing JSON
        if (Array.isArray(apiEl['data-source'])) {
          element.properties['data-source'] = apiEl['data-source'].map((opt: any) => ({
            id: opt.id,
            title: opt.title,
            onSelectAction: opt['on-select-action']?.name,
            target: opt['on-select-action']?.next?.name
          }));
        } else {
          // Dynamic binding - preserve as string in internal state
          element.properties['data-source'] = apiEl['data-source'];
        }
      }

      elements.push(element);
    };

    // Extract children from layout
    if (apiScreen.layout?.children) {
      apiScreen.layout.children.forEach((child: any) => {
        if (child.type === 'Form') {
          // If it's a Form, add the Form container itself as a marker element
          const formMarker: FlowElement = {
            id: generateId(),
            type: 'Form',
            name: child.name || 'flow_form',
            properties: { name: child.name || 'flow_form' },
            visibility: true
          };
          elements.push(formMarker);

          // Then add its children
          if (child.children) {
            child.children.forEach((input: any) => processElement(input));
          }
        } else {
          processElement(child);
        }
      });
    }

    return {
      id: apiScreen.id,
      title: apiScreen.title,
      terminal: apiScreen.terminal,
      data: apiScreen.data,
      elements
    };
  });
};

export function FlowBuilder() {
  const { id: flowId } = useParams();
  const navigate = useNavigate();

  const [flowName, setFlowName] = useState('Untitled Flow');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [screens, setScreens] = useState<FlowScreen[]>([
    { id: 'screen_1', title: 'Welcome', elements: [] }
  ]);
  const [selectedScreen, setSelectedScreen] = useState<string>('screen_1');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [jsonCollapsed, setJsonCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedElementType, setDraggedElementType] = useState<FlowElementType | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'json'>('canvas');

  // Backend Integration Hooks
  const { data: clientsData, isLoading: clientsLoading } = useGetClients({ isActive: true });
  const { data: existingFlow, isLoading: flowLoading } = useGetFlowById(flowId || '', !!flowId);
  const createFlowMutation = useCreateFlow();
  const updateFlowMutation = useUpdateFlow();

  const isSubmitting = createFlowMutation.isPending || updateFlowMutation.isPending;

  // Map IClient to FlowBuilder's Client type
  const clients: Client[] = (clientsData?.data || []).map((c: any) => ({
    id: c._id, // Use _id for MongoDB
    name: c.displayName,
    phone_number_id: c.phoneNumberId,
    waba_id: c.whatsappBusinessId,
    has_access_token: !!c.accessToken
  }));

  // Load existing flow data
  useEffect(() => {
    if (existingFlow?.data) {
      const { name, data, clientId } = existingFlow.data;
      setFlowName(name);
      setScreens(data.screens || []);
      setSelectedClient(typeof clientId === 'object' ? clientId._id : clientId);

      if (data.screens?.length > 0) {
        setSelectedScreen(data.screens[0].id);
      }
    }
  }, [existingFlow]);

  // Save Dialog State
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveMode, setSaveMode] = useState<'save' | 'create'>('save');

  const flowData: FlowData = convertToApiFormat(screens);

  const handleAddScreen = useCallback(() => {
    const newScreen: FlowScreen = {
      id: `screen_${generateId()}`,
      title: `Screen ${screens.length + 1}`,
      elements: []
    };
    setScreens([...screens, newScreen]);
    setSelectedScreen(newScreen.id);
    toast.success('Screen added');
  }, [screens]);

  const handleRemoveScreen = useCallback((screenId: string) => {
    if (screens.length <= 1) {
      toast.error('Cannot remove the only screen');
      return;
    }
    setScreens(screens.filter(s => s.id !== screenId));
    if (selectedScreen === screenId) {
      setSelectedScreen(screens[0].id);
    }
    setSelectedElement(null);
    toast.success('Screen removed');
  }, [screens, selectedScreen]);

  const handleAddElement = useCallback((screenId: string, type: FlowElementType) => {
    // Check for unique form
    if (type === 'Form') {
      const screen = screens.find(s => s.id === screenId);
      if (screen?.elements.some(el => el.type === 'Form')) {
        toast.error('Only one Form allowed per screen');
        return;
      }
    }

    const getDefaultProperties = (type: FlowElementType) => {
      switch (type) {
        case 'TextInput':
          return { 'input-type': 'text', label: 'New Input', required: true };
        case 'TextArea':
          return { label: 'Message', required: true };
        case 'Footer':
          return { label: 'Continue', 'on-click-action': { name: 'complete', payload: {} } };
        case 'RadioButtonsGroup':
        case 'Dropdown':
        case 'CheckboxGroup':
          return { label: 'Select Option', 'data-source': [{ id: 'opt_1', title: 'Option 1' }] };
        case 'DatePicker':
          return { label: 'Select Date' };
        case 'PhotoPicker':
          return {
            label: 'Upload Photo',
            description: 'Please capture or select an image',
            'photo-source': 'camera_gallery',
            'max-file-size-kb': 25600,
            'min-uploaded-photos': 0,
            'max-uploaded-photos': 30
          };
        case 'DocumentPicker':
          return {
            label: 'Upload Document',
            description: 'Please upload the required files',
            'max-file-size-kb': 25600,
            'min-uploaded-documents': 0,
            'max-uploaded-documents': 30,
            'allowed-mime-types': ['application/pdf', 'image/jpeg', 'image/png']
          };
        case 'IfElse':
          return { condition: 'data.field == true', trueDestination: '', falseDestination: '' };
        case 'NavigationList':
          return { label: 'Menu', 'data-source': [{ id: 'nav_1', title: 'Item 1', onSelectAction: 'navigate' }] };
        case 'Image':
          return { url: '', altText: 'Image' };
        case 'TextHeading':
        case 'TextSubheading':
        case 'TextBody':
        case 'TextCaption':
          return { text: `New ${type.replace('Text', '')}` };
        case 'EmbeddedLink':
          return { text: 'Click here', url: 'https://' };
        case 'CTABtn':
          return { label: 'Click Me', 'action-type': 'navigate', target: '' };
        default:
          return { label: 'New Element' };
      }
    };

    const newElement: FlowElement = {
      id: `element_${generateId()}`,
      type,
      name: `${type.toLowerCase()}_${generateId()}`,
      properties: getDefaultProperties(type),
      visibility: true
    };

    setScreens(screens.map(screen => {
      if (screen.id === screenId) {
        // Enforce Meta Flow restriction: max 1 PhotoPicker OR DocumentPicker per screen
        if (['PhotoPicker', 'DocumentPicker'].includes(type)) {
          const hasPicker = screen.elements.some(el => ['PhotoPicker', 'DocumentPicker'].includes(el.type));
          if (hasPicker) {
            toast.error(`You can only have one ${type === 'PhotoPicker' ? 'Photo' : 'Document'} Picker per screen.`);
            return screen;
          }
        }
        return { ...screen, elements: [...screen.elements, newElement] };
      }
      return screen;
    }));
    setSelectedElement(newElement.id);
  }, [screens]);

  const handleRemoveElement = useCallback((screenId: string, elementId: string) => {
    setScreens(screens.map(screen => {
      if (screen.id === screenId) {
        return { ...screen, elements: screen.elements.filter(el => el.id !== elementId) };
      }
      return screen;
    }));
    setSelectedElement(null);
    toast.success('Element removed');
  }, [screens]);

  const handleElementMove = useCallback((screenId: string, elementId: string, direction: 'up' | 'down') => {
    setScreens(screens.map(screen => {
      if (screen.id === screenId) {
        const index = screen.elements.findIndex(el => el.id === elementId);
        if (index === -1) return screen;

        const newElements = [...screen.elements];
        if (direction === 'up' && index > 0) {
          [newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]];
        } else if (direction === 'down' && index < newElements.length - 1) {
          [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        }

        return { ...screen, elements: newElements };
      }
      return screen;
    }));
  }, [screens]);


  const handleScreenUpdate = useCallback((updatedScreen: FlowScreen) => {
    setScreens(screens.map(s => s.id === updatedScreen.id ? updatedScreen : s));
  }, [screens]);

  const handleElementUpdate = useCallback((updatedElement: FlowElement) => {
    // Basic unique name validation within the screen
    const screen = screens.find(s => s.elements.some(el => el.id === updatedElement.id));
    if (screen) {
      const duplicate = screen.elements.find(el =>
        el.id !== updatedElement.id &&
        el.properties.name === updatedElement.properties.name &&
        updatedElement.properties.name // Only check if name is set
      );

      if (duplicate) {
        toast.error(`The name "${updatedElement.properties.name}" is already used in this screen.`);
        return;
      }
    }

    setScreens(screens.map(screen => ({
      ...screen,
      elements: screen.elements.map(el =>
        el.id === updatedElement.id ? updatedElement : el
      )
    })));
  }, [screens]);

  const validateFlowContent = () => {
    if (screens.length === 0) {
      toast.error('Flow cannot be empty');
      return false;
    }

    const emptyScreens = screens.filter(s => s.elements.length === 0);
    if (emptyScreens.length > 0) {
      toast.error(`Screen "${emptyScreens[0].title}" is empty. Please add elements.`);
      return false;
    }

    return true;
  };

  // Open Save Dialog
  const handleSaveClick = () => {
    if (!validateFlowContent()) return;
    setSaveMode('save');
    setSaveDialogOpen(true);
  };

  const handleSubmitClick = () => {
    if (!validateFlowContent()) return;

    // Validate Dynamic Bindings before allowing submission details
    const errors: string[] = [];
    screens.forEach(screen => {
      screen.elements.forEach(el => {
        const propsString = JSON.stringify(el.properties);
        const pattern = /\$\{data\.([a-zA-Z0-9_]+)\}/g;
        const matches = [...propsString.matchAll(pattern)];
        const missingVars = matches
          .map(m => m[1])
          .filter(v => !screen.data || !screen.data[v]);

        if (missingVars.length > 0) {
          const uniqueMissing = [...new Set(missingVars)];
          errors.push(`Screen "${screen.title}": Element "${el.properties.label || el.type}" is missing data declarations for: ${uniqueMissing.join(', ')}`);
        }
      });
    });

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }

    setSaveMode('create');
    setSaveDialogOpen(true);
  };

  const handleDialogSave = async (data: { flowName: string; clientId: string }) => {
    setFlowName(data.flowName);
    setSelectedClient(data.clientId);
    setSaveDialogOpen(false); // Close dialog

    const flowPayload = {
      name: data.flowName,
      clientId: data.clientId,
      data: {
        screens,
      }
    };

    if (saveMode === 'save') {
      try {
        if (flowId) {
          await updateFlowMutation.mutateAsync({ _id: flowId, ...flowPayload });
          toast.success('Flow draft updated');
        } else {
          // If "Save Draft" but no ID, we still create it in DB as active:true but mark as draft in UI
          const result = await createFlowMutation.mutateAsync(flowPayload);
          const newId = result.data?.data?._id;
          if (newId) {
            navigate(`/flow-builder/${newId}`, { replace: true });
          }
          toast.success('Flow saved to database');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to save flow');
      }
    } else {
      // Create Flow Logic (Finalize/Publish)
      const client = clients.find(c => c.id === data.clientId);
      if (!client?.has_access_token) {
        toast.error('Client does not have flow access permission');
        return;
      }

      try {
        if (flowId) {
          await updateFlowMutation.mutateAsync({ _id: flowId, ...flowPayload });
        } else {
          const result = await createFlowMutation.mutateAsync(flowPayload);
          const newId = result.data?.data?._id;
          if (newId) {
            navigate(`/flow-builder/${newId}`, { replace: true });
          }
        }

        // Here we would trigger the actual Meta API creation if needed
        // For now, we just save to our DB
        toast.success(`Flow "${data.flowName}" created successfully for ${client.name}!`, {
          description: 'The flow is now available in the database'
        });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to create flow');
      }
    }
  };

  const currentScreen = screens.find(s => s.id === selectedScreen) || null;
  const currentElement = currentScreen?.elements.find(e => e.id === selectedElement) || null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header
        onSave={handleSaveClick}
        onPreview={() => setShowPreview(true)}
        onSubmit={handleSubmitClick}
        isSubmitting={isSubmitting}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'canvas' && <ElementPalette onDragStart={setDraggedElementType} />}

        {viewMode === 'canvas' ? (
          <FlowCanvas
            screens={screens}
            selectedScreen={selectedScreen}
            selectedElement={selectedElement}
            onScreenSelect={setSelectedScreen}
            onElementSelect={setSelectedElement}
            onAddScreen={handleAddScreen}
            onRemoveScreen={handleRemoveScreen}
            onAddElement={handleAddElement}
            onRemoveElement={handleRemoveElement}
            onElementMove={handleElementMove}
          />
        ) : (
          <JsonEditor
            flowData={flowData}
            onApply={(updatedData) => {
              const updatedScreens = convertFromApiFormat(updatedData);
              setScreens(updatedScreens);

              // Try to preserve selection if IDs match, otherwise reset
              const stillHasScreen = updatedScreens.some(s => s.id === selectedScreen);
              if (!stillHasScreen && updatedScreens.length > 0) {
                setSelectedScreen(updatedScreens[0].id);
                setSelectedElement(null);
              } else if (stillHasScreen) {
                const screen = updatedScreens.find(s => s.id === selectedScreen);
                const stillHasElement = screen?.elements.some(el => el.id === selectedElement);
                if (!stillHasElement) {
                  setSelectedElement(null);
                }
              }

              setViewMode('canvas');
              toast.success('JSON changes applied');
            }}
          />
        )}

        <PropertiesPanel
          selectedScreen={currentScreen}
          selectedElement={currentElement}
          onScreenUpdate={handleScreenUpdate}
          onElementUpdate={handleElementUpdate}
        />

        <JsonPreview
          flowData={flowData}
          isCollapsed={jsonCollapsed}
          onToggleCollapse={() => setJsonCollapsed(!jsonCollapsed)}
          onEdit={() => setViewMode('json')}
        />
      </div>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        screens={screens}
      />

      <SaveFlowDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        clients={clients}
        defaultValues={{ flowName, clientId: selectedClient }}
        onSave={handleDialogSave}
        isLoading={isSubmitting}
        mode={saveMode}
      />
    </div>
  );
}
