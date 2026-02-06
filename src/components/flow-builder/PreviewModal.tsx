import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FlowData, FlowElement, FlowScreen } from '@/types/flow';
import {
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ImageIcon,
  Calendar,
  Camera,
  List,
  GitBranch,
  MousePointer2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  screens: FlowScreen[];
}

export function PreviewModal({ isOpen, onClose, screens }: PreviewModalProps) {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const currentScreen = screens[currentScreenIndex];
  const hasMultipleScreens = screens.length > 1;

  const goToNextScreen = () => {
    if (currentScreenIndex < screens.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1);
    }
  };

  const goToPrevScreen = () => {
    if (currentScreenIndex > 0) {
      setCurrentScreenIndex(currentScreenIndex - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Flow Preview
            {hasMultipleScreens && (
              <span className="text-xs text-muted-foreground ml-2">
                Screen {currentScreenIndex + 1} of {screens.length}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <div className="relative w-[280px] h-[560px] bg-background rounded-[2rem] border-2 border-border p-2 shadow-2xl">
            {/* Phone Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-card rounded-full z-10" />

            {/* Phone Screen */}
            <div className="w-full h-full bg-background rounded-[1.5rem] overflow-hidden flex flex-col">
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
                  <p className="text-xs font-medium text-primary-foreground">
                    {currentScreen?.title || 'Flow Preview'}
                  </p>
                  <p className="text-[10px] text-primary-foreground/70">Business Account</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 space-y-3 overflow-auto">
                {currentScreen?.elements.filter(el => el.visibility !== false).map((element) => (
                  <div key={element.id} className="animate-fade-in">
                    {renderPreviewElement(element)}
                  </div>
                ))}

                {(!currentScreen || currentScreen.elements.length === 0) && (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No elements added yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Screen Navigation */}
        {hasMultipleScreens && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevScreen}
              disabled={currentScreenIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex gap-1">
              {screens.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentScreenIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx === currentScreenIndex ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextScreen}
              disabled={currentScreenIndex === screens.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function renderPreviewElement(element: FlowElement) {
  switch (element.type) {
    case 'TextHeading':
      return <p className="text-sm font-bold leading-tight">{element.properties.text || 'Heading'}</p>;
    case 'TextSubheading':
      return <p className="text-xs font-semibold text-foreground/80 leading-snug">{element.properties.text || 'Subheading'}</p>;
    case 'TextBody':
      return <p className="text-xs text-muted-foreground leading-normal">{element.properties.text || 'Body text'}</p>;
    case 'TextCaption':
      return <p className="text-[10px] text-muted-foreground/60 leading-tight">{element.properties.text || 'Caption'}</p>;
    case 'Image':
      return (
        <div className="w-full bg-muted rounded-lg overflow-hidden border border-border">
          {element.properties.url ? (
            <img src={element.properties.url} alt={element.properties.altText} className="w-full h-auto" />
          ) : (
            <div className="h-32 flex flex-col items-center justify-center gap-1 opacity-40">
              <ImageIcon className="w-8 h-8" />
              <span className="text-[10px]">Image URL needed</span>
            </div>
          )}
        </div>
      );
    case 'EmbeddedLink':
      return (
        <div className="flex items-center gap-1.5 text-primary text-[11px] font-medium underline">
          <ExternalLink className="w-3 h-3" />
          <span>{element.properties.text || 'Link Text'}</span>
        </div>
      );
    case 'TextInput':
      return (
        <div className="space-y-1">
          {element.properties.label && <Label className="text-[10px] text-muted-foreground">{element.properties.label}{element.properties.required && '*'}</Label>}
          <div className="bg-muted rounded-md px-3 py-2 border border-border shadow-sm">
            <span className="text-xs text-muted-foreground/50">Type here...</span>
          </div>
        </div>
      );
    case 'TextArea':
      return (
        <div className="space-y-1">
          {element.properties.label && <Label className="text-[10px] text-muted-foreground">{element.properties.label}{element.properties.required && '*'}</Label>}
          <div className="bg-muted rounded-md px-3 py-3 h-20 border border-border shadow-sm">
            <span className="text-xs text-muted-foreground/50">Enter details...</span>
          </div>
        </div>
      );
    case 'Dropdown':
      return (
        <div className="space-y-1">
          {element.properties.label && <Label className="text-[10px] text-muted-foreground">{element.properties.label}{element.properties.required && '*'}</Label>}
          <div className="bg-muted rounded-md px-3 py-2 flex items-center justify-between border border-border shadow-sm">
            <span className="text-xs text-muted-foreground/50">Select option</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
      );
    case 'RadioButtonsGroup':
    case 'CheckboxGroup':
      const options = element.properties['data-source'] || [];
      return (
        <div className="space-y-2">
          {element.properties.label && <Label className="text-[10px] text-muted-foreground">{element.properties.label}{element.properties.required && '*'}</Label>}
          <div className="space-y-3 pl-1">
            {options.map((opt: any) => (
              <div key={opt.id} className="flex items-start gap-2.5 group">
                <div className={cn(
                  "w-4 h-4 border border-muted-foreground mt-0.5",
                  element.type === 'RadioButtonsGroup' ? "rounded-full" : "rounded-sm"
                )} />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground leading-none">{opt.title || 'Option'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'DatePicker':
      return (
        <div className="space-y-1">
          {element.properties.label && <Label className="text-[10px] text-muted-foreground">{element.properties.label}{element.properties.required && '*'}</Label>}
          <div className="bg-muted rounded-md px-3 py-2 flex items-center justify-between border border-border shadow-sm">
            <span className="text-xs text-muted-foreground/50">Select date</span>
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </div>
      );
    case 'PhotoPicker':
      return (
        <div className="space-y-1">
          {element.properties.label && <Label className="text-[10px] text-muted-foreground">{element.properties.label}{element.properties.required && '*'}</Label>}
          <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border p-5 flex flex-col items-center justify-center gap-1.5">
            <Camera className="w-8 h-8 text-muted-foreground/30" />
            <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-tight">Tap to capture</span>
          </div>
        </div>
      );
    case 'IfElse':
      return (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-2 opacity-10">
            <GitBranch className="w-10 h-10 text-blue-600" />
          </div>
          <span className="text-[9px] font-bold text-blue-600 uppercase mb-1 block">Logic: If/Else</span>
          <code className="text-[10px] text-blue-900 bg-blue-100/50 px-1.5 py-0.5 rounded border border-blue-200">{element.properties.condition || 'no_expression'}</code>
          <p className="text-[9px] text-muted-foreground mt-2 italic">* This component is logical only and won't render buttons in the actual flow.</p>
        </div>
      );
    case 'NavigationList':
      return (
        <div className="space-y-1.5">
          {element.properties.label && <Label className="text-[11px] font-bold text-muted-foreground uppercase">{element.properties.label}</Label>}
          <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
            {(element.properties['data-source'] || [{ id: '1', title: 'Navigation Item' }]).map((opt: any) => (
              <div key={opt.id} className="p-3 flex items-center justify-between border-b border-border/50 hover:bg-muted/20 active:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate leading-tight">{opt.title || 'Item Title'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 ml-2" />
              </div>
            ))}
            <div className="p-1.5 flex justify-center bg-muted/20">
              <List className="w-4 h-4 text-muted-foreground/30" />
            </div>
          </div>
        </div>
      );
    case 'CTABtn':
      return (
        <div className="w-full py-2.5 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center gap-2 mt-4 active:bg-primary/20 transition-colors">
          <MousePointer2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wide">{element.properties.label || 'Action Button'}</span>
        </div>
      );
    case 'Footer':
      return (
        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 text-center mt-6 shadow-xl active:bg-primary/90 transition-all">
          <span className="text-xs font-bold uppercase tracking-widest">{element.properties.label || 'Continue'}</span>
        </div>
      );
    case 'Form':
      return null; // Form container is logical
    default:
      return (
        <div className="p-2 rounded bg-muted/20 border border-dashed border-border text-center">
          <span className="text-[10px] text-muted-foreground">Unsupported Preview: {element.type}</span>
        </div>
      );
  }
}