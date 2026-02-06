import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Info } from 'lucide-react';
import { FlowData, FlowScreen } from '@/types/flow';

interface JsonEditorProps {
    flowData: FlowData;
    onApply: (updatedData: FlowData) => void;
}

export function JsonEditor({ flowData, onApply }: JsonEditorProps) {
    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        setJsonText(JSON.stringify(flowData, null, 2));
    }, [flowData]);

    const handleApply = () => {
        try {
            const parsed = JSON.parse(jsonText);

            // Validate Top-Level Meta Flow Structure
            if (!parsed.version) {
                throw new Error('Missing "version" field (e.g. "7.3")');
            }
            if (!parsed.screens || !Array.isArray(parsed.screens)) {
                throw new Error('screens must be an array');
            }

            // Deep Validation and Reference Enforcement
            parsed.screens.forEach((s: any, idx: number) => {
                if (!s.id || !s.title || !s.layout) {
                    throw new Error(`Screen index ${idx} is missing required fields (id, title, layout)`);
                }

                if (!s.layout.children || !Array.isArray(s.layout.children)) {
                    throw new Error(`Screen "${s.title}" layout children must be an array`);
                }

                // Reference Scanner for ${data.*}
                const scanForDataReferences = (obj: any) => {
                    const str = JSON.stringify(obj);
                    const pattern = /\$\{data\.([a-zA-Z0-9_]+)\}/g;
                    const matches = [...str.matchAll(pattern)];
                    const missingVars = matches
                        .map(m => m[1])
                        .filter(v => !s.data || !s.data[v]);

                    if (missingVars.length > 0) {
                        throw new Error(`Screen "${s.title}": Missing data declarations for: ${[...new Set(missingVars)].join(', ')}`);
                    }
                };

                // Scan all elements in layout
                s.layout.children.forEach((child: any) => {
                    if (child.type === 'Form' && child.children) {
                        child.children.forEach((input: any) => scanForDataReferences(input));
                        // Also scan Form properites if any (e.g. visible)
                        scanForDataReferences({ visible: child.visible, name: child.name });
                    } else {
                        scanForDataReferences(child);
                    }
                });
            });

            onApply(parsed);
            setError(null);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background h-full overflow-hidden border-r border-sidebar-border">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-sidebar/50">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wider">Edit Raw Screen State JSON</span>
                </div>
                <div className="flex items-center gap-2">
                    {error && (
                        <div className="flex items-center gap-1.5 text-destructive text-[10px] bg-destructive/10 px-2 py-1 rounded border border-destructive/20">
                            <AlertCircle className="w-3 h-3" />
                            {error}
                        </div>
                    )}
                    <Button
                        size="sm"
                        className="h-8 text-[11px]"
                        variant={isSuccess ? "outline" : "default"}
                        onClick={handleApply}
                    >
                        {isSuccess ? <Check className="w-4 h-4 mr-1" /> : null}
                        Apply Changes
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="w-full h-full min-h-[600px] p-6 font-mono text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary/20"
                    spellCheck={false}
                />
            </ScrollArea>
        </div>
    );
}
