import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { ElementPalette } from './ElementPalette';
import { FlowCanvas } from './FlowCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { JsonPreview } from './JsonPreview';
import { PreviewModal } from './PreviewModal';
import { MetaIframeDialog } from './MetaIframeDialog';
import { JsonEditor } from './JsonEditor';
import { SaveFlowDialog } from './SaveFlowDialog';
import { FlowScreen, FlowElement, FlowElementType, FlowData, Client } from '@/types/flow';
import { toast } from 'sonner';
import { Workflow } from 'lucide-react';
import { useGetClients } from '@/services/client.service';
import { useCreateFlow, useUpdateFlow, useGetFlowById, useGetFlowPreviewUrl } from '@/services/flow.service';
import { useIsMobile } from '@/hooks/hooks/use-mobile';

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

    let formChildren = inputFields.map(el => formatElement(el));

    // If there is a form, the footer should be inside it
    if ((formElement || inputFields.length > 0) && footer) {
      formChildren.push(formatElement(footer));
    }

    if (formElement || inputFields.length > 0) {
      layoutChildren.push({
        type: 'Form',
        name: (formElement?.properties.name || 'flow_form').replace(/[^A-Za-z_]/g, ''),
        ...(formElement?.conditionalVisibility ? { visible: formElement.conditionalVisibility } : {}),
        children: formChildren
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

    // 6. Add Footer at the end ONLY if not already added to Form
    if (footer && !formElement && inputFields.length === 0) {
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
      uid: generateId(),
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
  // Generate initialScreenUid only once using useState
  const [initialScreenUid] = useState(() => generateId());
  const [screens, setScreens] = useState<FlowScreen[]>([
    { uid: initialScreenUid, id: 'screen_1', title: 'Welcome', elements: [] }
  ]);
  const [selectedScreen, setSelectedScreen] = useState<string>(initialScreenUid);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [jsonCollapsed, setJsonCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMetaPreview, setShowMetaPreview] = useState(false);
  const [metaPreviewUrl, setMetaPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [draggedElementType, setDraggedElementType] = useState<FlowElementType | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'json'>('canvas');

  // Backend Integration Hooks
  const isMobile = useIsMobile();
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
      const { name, data, builder_state, clientId } = existingFlow.data;
      setFlowName(name);

      // 1. Identify raw screens: prioritize builder_state (internal Representation)
      // otherwise fall back to converting the Meta JSON (Legacy flows)
      const rawScreens = builder_state && Array.isArray(builder_state) && builder_state.length > 0
        ? builder_state
        : convertFromApiFormat(data);

      // 2. Ensure all loaded screens have uids (and nested uids for options)
      const screensWithUids = rawScreens.map((s: FlowScreen) => ({
        ...s,
        uid: s.uid || generateId(),
        // Also ensure options have uids
        elements: s.elements.map(el => {
          if (['RadioButtonsGroup', 'Dropdown', 'CheckboxGroup', 'NavigationList'].includes(el.type)) {
            const ds = el.properties['data-source'];
            if (Array.isArray(ds)) {
              return {
                ...el,
                properties: {
                  ...el.properties,
                  'data-source': ds.map((opt: any) => ({
                    ...opt,
                    uid: opt.uid || generateId()
                  }))
                }
              };
            }
          }
          return el;
        })
      }));

      setScreens(screensWithUids);
      if (screensWithUids.length > 0) {
        setSelectedScreen(screensWithUids[0].uid || initialScreenUid);
      }
      setSelectedClient(clientId?._id || clientId);
    }
  }, [existingFlow, initialScreenUid]);

  // Save Dialog State
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveMode, setSaveMode] = useState<'save' | 'create'>('save');

  const flowData: FlowData = convertToApiFormat(screens);

  const handleAddScreen = useCallback(() => {
    const newUid = generateId();
    setScreens(prevScreens => {
      const newScreen: FlowScreen = {
        uid: newUid,
        id: `screen_${generateId()}`,
        title: `Screen ${prevScreens.length + 1}`,
        elements: []
      };
      return [...prevScreens, newScreen];
    });
    setSelectedScreen(newUid);
    toast.success('Screen added');

  }, []);

  const handleRemoveScreen = useCallback((screenUid: string) => {
    setScreens(prevScreens => {
      if (prevScreens.length <= 1) {
        toast.error('Cannot remove the only screen');
        return prevScreens;
      }
      const newScreens = prevScreens.filter(s => s.uid !== screenUid);
      if (selectedScreen === screenUid && newScreens.length > 0) {
        setSelectedScreen(newScreens[0].uid);
      }
      setSelectedElement(null);
      toast.success('Screen removed');
      return newScreens;
    });

  }, [selectedScreen]);

  const handleAddElement = useCallback((screenId: string, type: FlowElementType) => {
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
          return { label: 'Select Option', 'data-source': [{ uid: generateId(), id: 'opt_1', title: 'Option 1' }] };

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
        case 'NavigationList':
          return { label: 'Menu', 'data-source': [{ uid: generateId(), id: 'nav_1', title: 'Item 1', onSelectAction: 'navigate' }] };

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

    setScreens(prevScreens => {
      // Check for Form restriction
      if (type === 'Form') {
        const screen = prevScreens.find(s => s.uid === screenId);
        if (screen?.elements.some(el => el.type === 'Form')) {
          toast.error('Only one Form allowed per screen');
          return prevScreens;
        }
      }

      return prevScreens.map(screen => {
        if (screen.uid === screenId) {
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
      });
    });

    setSelectedElement(newElement.id);
  }, []);

  const handleRemoveElement = useCallback((screenId: string, elementId: string) => {
    setScreens(prevScreens => prevScreens.map(screen => {
      if (screen.uid === screenId) {
        return { ...screen, elements: screen.elements.filter(el => el.id !== elementId) };
      }
      return screen;
    }));

    setSelectedElement(null);
    toast.success('Element removed');
  }, []);

  const handleElementMove = useCallback((screenId: string, elementId: string, direction: 'up' | 'down') => {
    setScreens(prevScreens => prevScreens.map(screen => {
      if (screen.uid === screenId) {
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
  }, []);


  const handleScreenUpdate = useCallback((updatedScreen: FlowScreen) => {
    setScreens(prevScreens => prevScreens.map(s => s.uid === updatedScreen.uid ? updatedScreen : s));
  }, []);


  const handleElementUpdate = useCallback((updatedElement: FlowElement) => {
    setScreens(prevScreens => {
      // Basic unique name validation within the screen
      const screen = prevScreens.find(s => s.elements.some(el => el.id === updatedElement.id));
      if (screen) {
        const duplicate = screen.elements.find(el =>
          el.id !== updatedElement.id &&
          el.properties.name === updatedElement.properties.name &&
          updatedElement.properties.name // Only check if name is set
        );

        if (duplicate) {
          toast.error(`The name "${updatedElement.properties.name}" is already used in this screen.`);
          return prevScreens;
        }
      }

      return prevScreens.map(screen => ({
        ...screen,
        elements: screen.elements.map(el =>
          el.id === updatedElement.id ? updatedElement : el
        )
      }));
    });
  }, []);

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

    // Check if at least one screen is marked as terminal OR has a footer (which implicitly makes it terminal)
    const hasTerminalScreen = screens.some(s => s.terminal === true || s.elements.some(el => el.type === 'Footer'));
    if (!hasTerminalScreen) {
      toast.error('Flow must have at least one terminal screen. Please mark a screen as "Terminal Screen" in properties or add a Footer.');
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
      data: convertToApiFormat(screens), // Store valid Meta Flow JSON
      builder_state: screens, // Store internal builder state (with UIDs)
    };

    if (saveMode === 'save') {
      try {
        if (flowId) {
          await updateFlowMutation.mutateAsync({ _id: flowId, ...flowPayload, isDraft: true });
          toast.success('Flow draft updated locally');
          navigate('/flows', { replace: true });
        } else {
          // If "Save Draft" but no ID, we still create it in DB as active:true but mark as draft in UI
          const result = await createFlowMutation.mutateAsync({ ...flowPayload, isDraft: true });
          const newId = result.data?.data?._id;
          if (newId) {
            navigate('/flows', { replace: true });
          }
          toast.success('Flow draft saved locally');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to save flow draft');
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
          // Update existing flow
          await updateFlowMutation.mutateAsync({
            _id: flowId,
            name: data.flowName,
            data: flowPayload.data, // Use the converted data
            builder_state: screens,
            clientId: data.clientId,
            isDraft: false
          });
          toast.success(`Flow "${data.flowName}" updated successfully!`);
          navigate('/flows');
        } else {
          // Create new flow
          await createFlowMutation.mutateAsync({
            name: data.flowName,
            data: flowPayload.data, // Use the converted data
            builder_state: screens,
            clientId: data.clientId
          });

          // For now, we just save to our DB
          toast.success(`Flow "${data.flowName}" created successfully for ${client.name}!`, {
            description: 'The flow is now available in the database'
          });
          navigate('/flows');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to create flow');
      }
    }
  };

  const currentScreen = screens.find(s => s.uid === selectedScreen) || null;

  const currentElement = currentScreen?.elements.find(e => e.id === selectedElement) || null;

  const { mutateAsync: getFlowPreviewMutation } = useGetFlowPreviewUrl();

  const handlePreviewClick = async () => {
    // If we have a local flow ID, check if it's synced
    if (!flowId) {
      toast.error("Please save the flow first to generate a preview.");
      return;
    }

    // Open dialog and start loading
    setShowMetaPreview(true);
    setIsLoadingPreview(true);
    setMetaPreviewUrl(null);

    try {
      const response = await getFlowPreviewMutation(flowId);

      const payload = response.data as any;

      if (payload?.data?.preview?.preview_url) {
        setMetaPreviewUrl(payload.data.preview.preview_url);
        setShowMetaPreview(true);
        toast.success("Preview loaded successfully");
      } else {
        // Fallback or error
        const message = payload?.message || "Could not generate Meta Preview. Ensure flow is synced.";
        toast.error(message);
        // Optional: Failover to local preview?
        setShowPreview(true);
      }
    } catch (error: any) {
      console.error("Preview Error:", error);
      const msg = error.response?.data?.message || "Failed to get preview URL";
      toast.error(msg);
      setShowMetaPreview(false);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Render mobile blocking overlay
  if (isMobile) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Workflow className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Desktop View Required</h2>
        <p className="text-muted-foreground max-w-md mb-4">
          The Flow Builder is optimized for desktop usage to provide the best experience. Please access this page from a larger screen.
        </p>
        <div className="mt-4 flex gap-2 items-end">
          <div className="w-12 h-8 border-2 border-primary rounded bg-background flex items-center justify-center">
            <div className="w-8 h-4 bg-muted animate-pulse rounded-sm"></div>
          </div>
          <span className="text-2xl">💻</span>
        </div>
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header
        onSave={handleSaveClick}
        onPreview={handlePreviewClick}
        onSubmit={handleSubmitClick}
        isSubmitting={isSubmitting}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isEditMode={!!flowId}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {(flowLoading || clientsLoading) && (
          <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Workflow className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Loading flow data...</p>
            </div>
          </div>
        )}

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
              const stillHasScreen = updatedScreens.some(s => s.uid === selectedScreen);
              if (!stillHasScreen && updatedScreens.length > 0) {
                setSelectedScreen(updatedScreens[0].uid);
                setSelectedElement(null);
              } else if (stillHasScreen) {
                const screen = updatedScreens.find(s => s.uid === selectedScreen);
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

      <MetaIframeDialog
        isOpen={showMetaPreview}
        onClose={() => setShowMetaPreview(false)}
        url={metaPreviewUrl}
        isLoading={isLoadingPreview}
        title="Meta Flow Preview"
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
