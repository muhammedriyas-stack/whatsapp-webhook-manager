import { useState } from 'react';
import { ELEMENT_CATEGORIES, FlowElementType } from '@/types/flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Type,
  AlignLeft,
  TextCursorInput,
  FileText,
  ChevronDown,
  Circle,
  ArrowRight,
  Search,
  GripVertical,
  Square,
  GitBranch,
  List,
  Image as ImageIcon,
  ExternalLink,
  CheckSquare,
  ToggleRight,
  CheckCircle,
  Calendar,
  Camera,
  MousePointer2,
  FileUp
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Type: <Type className="w-4 h-4" />,
  AlignLeft: <AlignLeft className="w-4 h-4" />,
  TextCursorInput: <TextCursorInput className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  ChevronDown: <ChevronDown className="w-4 h-4" />,
  Circle: <Circle className="w-4 h-4" />,
  ArrowRight: <ArrowRight className="w-4 h-4" />,
  Square: <Square className="w-4 h-4" />,
  GitBranch: <GitBranch className="w-4 h-4" />,
  List: <List className="w-4 h-4" />,
  Image: <ImageIcon className="w-4 h-4" />,
  ExternalLink: <ExternalLink className="w-4 h-4" />,
  CheckSquare: <CheckSquare className="w-4 h-4" />,
  ToggleRight: <ToggleRight className="w-4 h-4" />,
  CheckCircle: <CheckCircle className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  MousePointer2: <MousePointer2 className="w-4 h-4" />,
  FileUp: <FileUp className="w-4 h-4" />,
};


interface ElementPaletteProps {
  onDragStart: (type: FlowElementType) => void;
}

export function ElementPalette({ onDragStart }: ElementPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = ELEMENT_CATEGORIES.map(category => ({
    ...category,
    elements: category.elements.filter(element =>
      element.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.elements.length > 0);

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="panel-header">
        <span>Elements</span>
        <span className="text-xs font-normal normal-case text-muted-foreground">Drag to add</span>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">
                {category.name}
              </h3>
              <div className="space-y-1">
                {category.elements.map((element) => (
                  <div
                    key={element.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('elementType', element.type);
                      onDragStart(element.type);
                    }}
                    className="element-card flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      {iconMap[element.icon]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {element.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {element.description}
                      </p>
                    </div>
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
