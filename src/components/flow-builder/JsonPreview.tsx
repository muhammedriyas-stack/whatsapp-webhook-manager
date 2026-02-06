import { useState } from 'react';
import { FlowData } from '@/types/flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Code2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonPreviewProps {
  flowData: FlowData;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onEdit: () => void;
}

export function JsonPreview({ flowData, isCollapsed, onToggleCollapse, onEdit }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(flowData, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "bg-sidebar border-l border-sidebar-border flex flex-col transition-all duration-300",
        isCollapsed ? "w-12" : "w-80"
      )}
    >
      <div className="panel-header flex items-center justify-between">
        {!isCollapsed && (
          <>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>Flow JSON</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 hover:bg-sidebar-accent"
                onClick={onEdit}
                title="Open JSON Editor"
              >
                <Code2 className="w-3 h-3 text-primary" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={handleCopy}
                title="Copy JSON"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-success" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("w-6 h-6", isCollapsed && "mx-auto")}
          onClick={onToggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <ScrollArea className="flex-1">
          <pre className="p-4 json-preview text-foreground">
            <SyntaxHighlight json={jsonString} />
          </pre>
        </ScrollArea>
      )}

      {isCollapsed && (
        <div className="flex-1 flex items-center justify-center">
          <Code2 className="w-4 h-4 text-muted-foreground rotate-90" />
        </div>
      )}
    </div>
  );
}

function SyntaxHighlight({ json }: { json: string }) {
  const highlighted = json
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>');

  return <code dangerouslySetInnerHTML={{ __html: highlighted }} />;
}
