import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetaIframeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    url: string | null;
    isLoading?: boolean;
    title?: string;
}

export function MetaIframeDialog({ isOpen, onClose, url, isLoading = false, title = "Meta Preview" }: MetaIframeDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-6xl h-[90vh] bg-card border-border p-0 overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="relative w-full h-full">
                    {/* Floating "Open in New Tab" button */}
                    {url && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/95 backdrop-blur-sm shadow-lg"
                            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in New Tab
                        </Button>
                    )}

                    {/* Floating Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 z-10 bg-background/95 backdrop-blur-sm shadow-sm rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={onClose}
                        title={`Close ${title}`}
                    >
                        <X className="w-4 h-4" />
                    </Button>

                    {/* Preview content */}
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading {title}...</p>
                        </div>
                    ) : url ? (
                        <iframe
                            src={url}
                            className="w-full h-full border-0"
                            title={title}
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-2">
                            <p className="text-sm text-muted-foreground">No URL available</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
