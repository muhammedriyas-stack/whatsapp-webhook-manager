import { useNavigate } from 'react-router-dom';
import { MessageSquare, Save, Play, Upload, Zap, ExternalLink, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetProfile } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS, ROLES } from '@/constants/common';

interface HeaderProps {
  onSave: () => void;
  onPreview: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  viewMode: 'canvas' | 'json';
  onViewModeChange: (mode: 'canvas' | 'json') => void;
}

export function Header({
  onSave,
  onPreview,
  onSubmit,
  isSubmitting,
  viewMode,
  onViewModeChange
}: HeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: user } = useGetProfile();

  const hasDashboardAccess = user?.role === ROLES.ADMIN || (user?.permissions && user.permissions.length > 0);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        {hasDashboardAccess && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Flow Builder</h1>
            <p className="text-xs text-muted-foreground">WhatsApp Business</p>
          </div>
        </div>

        <div className="h-8 w-px bg-border mx-2" />

        <div className="flex items-center bg-secondary rounded-lg p-0.5">
          <Button
            variant={viewMode === 'canvas' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-[10px] px-3"
            onClick={() => onViewModeChange('canvas')}
          >
            Canvas
          </Button>
          <Button
            variant={viewMode === 'json' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-[10px] px-3"
            onClick={() => onViewModeChange('json')}
          >
            JSON Edit
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] px-3 gap-1.5"
          onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/flows/playground/#playground', '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink className="w-3 h-3" />
          Meta Playground
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>

        <Button variant="ghost" size="sm" onClick={onPreview}>
          <Play className="w-4 h-4 mr-2" />
          Preview
        </Button>

        <Button
          size="sm"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              Creating...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Create Flow
            </>
          )}
        </Button>

        <div className="h-8 w-px bg-border mx-2" />

        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="hover:bg-accent"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </Button>

        {user && (
          <div className="flex flex-col items-end ml-2 px-2 border-l border-border">
            <span className="text-xs font-medium text-foreground">{user.name}</span>
            <span className="text-[10px] text-muted-foreground leading-none capitalize">{user.role}</span>
          </div>
        )}
      </div>
    </header>
  );
}
