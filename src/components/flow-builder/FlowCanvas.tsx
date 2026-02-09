import { useState, useRef, useCallback } from 'react';
import { FlowScreen, FlowElement, FlowElementType, ELEMENT_CATEGORIES } from '@/types/flow';
import {
  Plus,
  X,
  Smartphone,
  GripVertical,
  Trash2,
  ChevronDown,
  Copy,
  ArrowUp,
  ArrowDown,
  ImageIcon,
  ExternalLink,
  Calendar,
  Camera,
  List,
  GitBranch,
  CheckCircle,
  MousePointer2,
  CheckSquare,
  FileUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FlowCanvasProps {
  screens: FlowScreen[];
  selectedScreen: string | null;
  selectedElement: string | null;
  onScreenSelect: (screenId: string) => void;
  onElementSelect: (elementId: string | null) => void;
  onAddScreen: () => void;
  onRemoveScreen: (screenId: string) => void;
  onAddElement: (screenId: string, type: FlowElementType) => void;
  onRemoveElement: (screenId: string, elementId: string) => void;
  onElementMove: (screenId: string, elementId: string, direction: 'up' | 'down') => void;
}

const getElementLabel = (type: FlowElementType): string => {
  for (const category of ELEMENT_CATEGORIES) {
    const element = category.elements.find(e => e.type === type);
    if (element) return element.label;
  }
  return type;
};

export function FlowCanvas({
  screens,
  selectedScreen,
  selectedElement,
  onScreenSelect,
  onElementSelect,
  onAddScreen,
  onRemoveScreen,
  onAddElement,
  onRemoveElement,
  onElementMove
}: FlowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOverScreen, setDragOverScreen] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent, screenId: string) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('elementType') as FlowElementType;
    if (!elementType) return;

    onAddElement(screenId, elementType);
    setDragOverScreen(null);
  }, [onAddElement]);

  const handleDragOver = useCallback((e: React.DragEvent, screenId: string) => {
    e.preventDefault();
    setDragOverScreen(screenId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverScreen(null);
  }, []);

  return (
    <div
      ref={canvasRef}
      className="flex-1 bg-canvas canvas-grid overflow-auto p-8"
      onClick={() => onElementSelect(null)}
    >
      <div className="flex gap-6 min-w-max">
        {screens.map((screen, index) => (
          <div
            key={screen.uid}
            className={cn(
              "animate-fade-in",
              selectedScreen === screen.uid && "ring-2 ring-primary ring-offset-2 ring-offset-canvas rounded-2xl"
            )}

            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Screen Header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Screen {index + 1}
                </span>
                <span className="text-xs text-muted-foreground/50">•</span>
                <input
                  type="text"
                  value={screen.title}
                  className="text-xs bg-transparent border-none text-muted-foreground focus:outline-none focus:text-foreground w-24"
                  placeholder="Screen title"
                  readOnly
                />
              </div>
              {screens.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveScreen(screen.uid)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Phone Frame */}
            <div
              className={cn(
                "relative w-[320px] h-[640px] bg-card rounded-[2.5rem] border-2 border-border p-3 shadow-2xl cursor-pointer transition-all duration-200",
                dragOverScreen === screen.uid && "border-primary bg-primary/5"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onScreenSelect(screen.uid);
              }}
              onDrop={(e) => handleDrop(e, screen.uid)}
              onDragOver={(e) => handleDragOver(e, screen.uid)}
              onDragLeave={handleDragLeave}
            >
              {/* Phone Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-background rounded-full" />

              {/* Phone Screen */}
              <div className="absolute top-12 left-3 right-3 bottom-3 bg-background rounded-[1.5rem] overflow-hidden">
                {/* Status Bar */}
                <div className="h-6 bg-muted/30 flex items-center justify-between px-4 text-[10px] text-muted-foreground">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* WhatsApp Header */}
                <div className="h-12 bg-primary flex items-center px-4 gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-foreground/20" />
                  <div>
                    <p className="text-xs font-medium text-primary-foreground">{screen.title || 'Flow Screen'}</p>
                    <p className="text-[10px] text-primary-foreground/70">Business Account</p>
                  </div>
                </div>

                {/* Content Area */}
                <div
                  className="flex-1 p-4 space-y-3 overflow-auto"
                  style={{ height: 'calc(100% - 6rem)' }}
                >
                  {screen.elements.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Smartphone className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-xs text-center">
                        Drag elements here<br />to build your flow
                      </p>
                    </div>
                  ) : (
                    screen.elements.map((element, idx) => (
                      <FlowElementNode
                        key={element.id}
                        element={element}
                        isSelected={selectedElement === element.id}
                        isFirst={idx === 0}
                        isLast={idx === screen.elements.length - 1}
                        onSelect={(e) => {
                          e.stopPropagation();
                          onElementSelect(element.id);
                        }}
                        onRemove={() => onRemoveElement(screen.uid, element.id)}
                        onMove={(direction) => onElementMove(screen.uid, element.id, direction)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Screen Button */}
        <button
          onClick={onAddScreen}
          className="w-[320px] h-[640px] rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-colors bg-card/30"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium">Add Screen</span>
        </button>
      </div>
    </div>
  );
}

interface FlowElementNodeProps {
  element: FlowElement;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

function FlowElementNode({ element, isSelected, isFirst, isLast, onSelect, onRemove, onMove }: FlowElementNodeProps) {
  const renderElement = () => {
    if (element.visibility === false) {
      return (
        <div className="flex items-center gap-2 opacity-50 italic text-[10px]">
          <X className="w-3 h-3" />
          <span>{element.type} (Hidden)</span>
        </div>
      );
    }

    switch (element.type) {
      case 'Form':
        return (
          <div className="border border-dashed border-primary/30 rounded-lg p-2 bg-primary/5 text-center">
            <span className="text-[10px] uppercase font-bold text-primary/50 mb-1 block">Form Container</span>
            <p className="text-[10px] text-muted-foreground italic">Input fields placed here</p>
          </div>
        );
      case 'TextHeading':
        return <p className="text-lg font-bold text-foreground leading-tight">{element.properties.text || 'Heading'}</p>;
      case 'TextSubheading':
        return <p className="text-base font-semibold text-foreground/80 leading-snug">{element.properties.text || 'Subheading'}</p>;
      case 'TextBody':
        return <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">{element.properties.text || 'Body text goes here'}</p>;
      case 'TextCaption':
        return <p className="text-xs text-muted-foreground/80 leading-normal">{element.properties.text || 'Caption text'}</p>;
      case 'Image':
        return (
          <div className="w-full h-40 bg-muted rounded-lg flex flex-col items-center justify-center border border-border overflow-hidden">
            {element.properties.url ? (
              <img src={element.properties.url} alt={element.properties.altText} className="w-full h-full object-cover" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <span className="text-xs text-muted-foreground">Image Preview</span>
              </>
            )}
          </div>
        );
      case 'EmbeddedLink':
        return (
          <div className="flex items-center gap-2 text-primary hover:underline cursor-pointer">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{element.properties.text || 'Link Text'}</span>
          </div>
        );
      case 'TextInput':
        const isHeader = element.properties['label-variant'] === 'large';
        return (
          <div className="bg-background rounded-lg px-3 py-2.5 border border-input shadow-sm relative focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
            <div className="flex justify-between items-start mb-0.5">
              <span className={cn(
                "text-foreground font-medium block",
                isHeader ? "text-base" : "text-sm"
              )}>
                {element.properties.label || 'Text input'}
                {element.properties.required && <span className="text-destructive ml-0.5">*</span>}
              </span>
            </div>
            {element.properties['helper-text'] && (
              <p className="text-xs text-muted-foreground mt-1">{element.properties['helper-text']}</p>
            )}
            {element.properties.pattern && (
              <div className="mt-1 flex items-center gap-1 opacity-50">
                <span className="text-[8px] bg-primary/20 text-primary px-1 rounded font-mono">Regex</span>
              </div>
            )}
          </div>
        );
      case 'TextArea':
        return (
          <div className="bg-background rounded-lg px-3 py-2.5 min-h-[5rem] border border-input shadow-sm relative focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
            <div className="flex justify-between items-start mb-0.5">
              <span className="text-sm text-foreground font-medium">
                {element.properties.label || 'Multi-line input'}
                {element.properties.required && <span className="text-destructive ml-0.5">*</span>}
              </span>
            </div>
            {element.properties['helper-text'] && (
              <p className="text-xs text-muted-foreground mt-1">{element.properties['helper-text']}</p>
            )}
            <div className="mt-2 h-12 bg-muted/20 rounded border border-dashed border-border/50 animate-pulse" />
          </div>
        );
      case 'Dropdown':
        return (
          <div className="bg-background rounded-lg px-3 py-2.5 flex items-center justify-between border border-input shadow-sm">
            <span className="text-sm text-foreground font-medium">{element.properties.label || 'Select option'}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        );
      case 'RadioButtonsGroup':
      case 'CheckboxGroup':
        const options = element.properties['data-source'] || [];
        return (
          <div className="space-y-2.5">
            <span className="text-sm text-foreground font-medium block">{element.properties.label || 'Select one'}</span>
            <div className="space-y-2">
              {(options.length > 0 ? options : [{ title: 'Option 1' }, { title: 'Option 2' }]).slice(0, 3).map((opt: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 p-2 rounded-md border border-transparent hover:border-border/50 transition-colors">
                  <div className={cn("w-4 h-4 border-2 border-muted-foreground/60 flex items-center justify-center", element.type === 'RadioButtonsGroup' ? "rounded-full" : "rounded-[4px]")} />
                  <span className="text-sm text-foreground/90">{opt.title || `Option ${idx + 1}`}</span>
                </div>
              ))}
              {options.length > 3 && <span className="text-xs text-muted-foreground italic pl-1">+{options.length - 3} more...</span>}
            </div>
          </div>
        );
      case 'DatePicker':
        return (
          <div className="bg-background rounded-lg px-3 py-2.5 border border-input shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground font-medium">{element.properties.label || 'Select date'}</span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            {element.properties['helper-text'] && (
              <p className="text-xs text-muted-foreground mt-1">{element.properties['helper-text']}</p>
            )}
          </div>
        );
      case 'PhotoPicker':
        return (
          <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border p-5 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-sm text-foreground font-medium block">{element.properties.label || 'Take photo'}</span>
              {element.properties.description && (
                <span className="text-xs text-muted-foreground block mt-1">{element.properties.description}</span>
              )}
            </div>
          </div>
        );
      case 'DocumentPicker':
        return (
          <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border p-5 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm">
              <FileUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-sm text-foreground font-medium block">{element.properties.label || 'Upload Document'}</span>
              {element.properties.description && (
                <span className="text-xs text-muted-foreground block mt-1">{element.properties.description}</span>
              )}
            </div>
          </div>
        );
      case 'IfElse':
        return (
          <div className="bg-blue-50/10 border border-blue-200/20 rounded-lg p-3 relative overflow-hidden group hover:border-blue-400/50 transition-colors">
            <div className="absolute right-0 top-0 p-1 opacity-20">
              <GitBranch className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-[10px] font-bold text-blue-500/90 uppercase mb-1 tracking-wider">Logic: If/Else</p>
            <p className="text-xs font-mono text-foreground truncate max-w-[90%] bg-background/50 p-1 rounded inline-block">
              {element.properties.condition || 'no condition'}
            </p>
          </div>
        );
      case 'NavigationList':
        return (
          <div className="rounded-lg border border-border overflow-hidden bg-background shadow-sm">
            <div className="p-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <span className="text-sm font-medium truncate">{element.properties.label || 'Navigation Option'}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90" />
            </div>
            <div className="p-2 flex justify-center bg-gray-50/50 dark:bg-gray-900/10">
              <List className="w-4 h-4 text-muted-foreground/30" />
            </div>
          </div>
        );
      case 'CTABtn':
        return (
          <div className="w-full py-2.5 bg-background border border-primary text-primary rounded-full flex items-center justify-center gap-2 shadow-sm font-medium hover:bg-primary/5 transition-colors">
            <MousePointer2 className="w-4 h-4" />
            <span className="text-sm">{element.properties.label || 'CTA Button'}</span>
          </div>
        );
      case 'Footer':
        return (
          <div className="bg-primary text-primary-foreground rounded-full px-5 py-3 text-center shadow-md hover:bg-primary/90 transition-colors cursor-pointer">
            <span className="text-sm font-bold uppercase tracking-wide">{element.properties.label || 'Continue'}</span>
          </div>
        );
      default:
        return <span className="text-xs text-muted-foreground">{getElementLabel(element.type)}</span>;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative p-2 rounded-lg transition-all cursor-pointer group mb-1",
        isSelected ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted/50"
      )}
    >
      <div className="absolute -top-1.5 -right-1.5 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isFirst && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove('up');
            }}
            className="w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:text-primary"
          >
            <Plus className="w-2.5 h-2.5 rotate-180" />
          </button>
        )}
        {!isLast && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove('down');
            }}
            className="w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:text-primary"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      </div>
      {renderElement()}
    </div>
  );
}
