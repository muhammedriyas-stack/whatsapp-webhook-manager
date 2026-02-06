export type FlowElementType =
  // Display
  | 'TextHeading'
  | 'TextSubheading'
  | 'TextBody'
  | 'TextCaption'
  | 'Image'
  | 'EmbeddedLink'
  // Inputs
  | 'TextInput'
  | 'TextArea'
  | 'RadioButtonsGroup'
  | 'Dropdown'
  | 'CheckboxGroup'
  | 'DatePicker'
  | 'PhotoPicker'
  | 'DocumentPicker'
  // Logic
  | 'IfElse'
  | 'NavigationList'
  // Actions
  | 'Form'
  | 'Footer'
  | 'CTABtn';

export interface FlowElement {
  id: string;
  type: FlowElementType;
  name: string;
  properties: Record<string, any>;
  visibility?: boolean;
  conditionalVisibility?: string; // Expression for visibility
}

export interface FlowScreen {
  id: string;
  title: string;
  elements: FlowElement[];
  terminal?: boolean;
  data?: Record<string, { type: string; __example__: any }>;
}

export interface WhatsAppFlowScreen {
  id: string;
  title: string;
  terminal?: boolean;
  data?: Record<string, { type: string; __example__: any }>;
  layout: {
    type: 'SingleColumnLayout';
    children: any[];
  };
}

export interface FlowData {
  version: '7.3';
  screens: WhatsAppFlowScreen[];
}

export interface Client {
  id: string;
  name: string;
  phone_number_id: string;
  waba_id: string;
  has_access_token: boolean;
}

export interface ElementCategory {
  name: string;
  elements: {
    type: FlowElementType;
    label: string;
    icon: string;
    description: string;
  }[];
}

export const ELEMENT_CATEGORIES: ElementCategory[] = [
  {
    name: 'Layout & Logic',
    elements: [
      { type: 'Form', label: 'Form', icon: 'Square', description: 'Form container for inputs' },
      { type: 'IfElse', label: 'Conditional (IfElse)', icon: 'GitBranch', description: 'Conditional routing logic' },
      { type: 'NavigationList', label: 'Navigation List', icon: 'List', description: 'List of actionable items' },
    ]
  },
  {
    name: 'Content',
    elements: [
      { type: 'TextHeading', label: 'Heading', icon: 'Type', description: 'Large heading text' },
      { type: 'TextSubheading', label: 'Subheading', icon: 'Type', description: 'Medium subheading text' },
      { type: 'TextBody', label: 'Body', icon: 'AlignLeft', description: 'Body paragraph text' },
      { type: 'TextCaption', label: 'Caption', icon: 'AlignLeft', description: 'Small caption text' },
      { type: 'Image', label: 'Image', icon: 'Image', description: 'Image from URL' },
      { type: 'EmbeddedLink', label: 'Link', icon: 'ExternalLink', description: 'External web link' },
    ]
  },
  {
    name: 'Text Inputs',
    elements: [
      { type: 'TextInput', label: 'Text Input', icon: 'TextCursorInput', description: 'Single line text field' },
      { type: 'TextArea', label: 'Text Area', icon: 'FileText', description: 'Multi-line text field' },
    ]
  },
  {
    name: 'Selection',
    elements: [
      { type: 'RadioButtonsGroup', label: 'Radio Buttons', icon: 'Circle', description: 'Single choice list' },
      { type: 'Dropdown', label: 'Dropdown', icon: 'ChevronDown', description: 'Single choice dropdown' },
      { type: 'CheckboxGroup', label: 'Checkboxes', icon: 'CheckSquare', description: 'Multiple choice list' },
    ]
  },
  {
    name: 'Advanced Inputs',
    elements: [
      { type: 'DatePicker', label: 'Date Picker', icon: 'Calendar', description: 'Date selection' },
      { type: 'PhotoPicker', label: 'Photo Picker', icon: 'Camera', description: 'Image upload picker' },
      { type: 'DocumentPicker', label: 'Document Picker', icon: 'FileUp', description: 'Document upload picker' },
    ]
  },
  {
    name: 'Actions',
    elements: [
      { type: 'Footer', label: 'Footer', icon: 'ArrowRight', description: 'Primary screen footer' },
      { type: 'CTABtn', label: 'CTA Button', icon: 'MousePointer2', description: 'Standalone action button' },
    ]
  }
];

