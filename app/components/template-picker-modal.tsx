import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

interface GalleryTemplate {
  id: string;
  url: string;
  thumbnail: string;
  prompt: string;
}

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: GalleryTemplate) => void;
  selectedTemplateId: string | null;
  templates: GalleryTemplate[];
}

function TemplateCard({
  template,
  isSelected,
  onClick,
}: {
  template: GalleryTemplate;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full break-inside-avoid overflow-hidden rounded-lg border-2 transition-all duration-300",
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-500/20"
          : "border-transparent hover:border-slate-300",
      )}
    >
      <img
        src={template.thumbnail}
        alt={template.id}
        className="h-auto w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg">
            <Check size={16} className="text-indigo-500" />
          </div>
        </div>
      )}
    </button>
  );
}

export function TemplatePickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedTemplateId,
  templates,
}: TemplatePickerModalProps) {
  const { t } = useTranslation();
  const handleSelect = (template: GalleryTemplate) => {
    onSelect(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-4xl! flex-col overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{t("workspace.chooseStyle")}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateId === template.id}
                onClick={() => handleSelect(template)}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
