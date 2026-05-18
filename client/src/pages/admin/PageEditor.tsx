import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Camera,
  CheckCircle2,
  ExternalLink,
  GripVertical,
  Loader2,
  Save,
  Upload,
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw,
  Smartphone,
  Monitor,
} from "lucide-react";
import {
  MODULE_LABELS,
  type PageContent,
  type PageModule,
  type PageModuleType,
} from "@shared/pageContent";
import { buildPagePreviewHtml } from "@shared/pagePreviewHtml";
import { nanoid } from "nanoid";

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

function reorderModules(modules: PageModule[], from: number, to: number): PageModule[] {
  const next = [...modules];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

function createDefaultModule(type: PageModuleType): PageModule {
  const id = `${type}-${nanoid(8)}`;
  const baseData: Record<PageModuleType, Record<string, string>> = {
    hero_image: { imageUrl: "" },
    hero_cta: { badge: "", heading: "", subtitle: "", buttonLabel: "Learn More" },
    benefits_header: { eyebrow: "", title: "", subtitle: "" },
    benefit_card: { title: "New Benefit", description: "" },
    lifestyle_header: { eyebrow: "", title: "", subtitle: "" },
    lifestyle_photo: { imageUrl: "", label: "", alt: "" },
    faq_header: { eyebrow: "", title: "" },
    faq_item: { question: "New Question", answer: "" },
  };
  return { id, type, data: baseData[type] };
}

function ModuleFields({
  module,
  onChange,
  onReplaceImage,
  isUploading,
}: {
  module: PageModule;
  onChange: (data: Record<string, string>) => void;
  onReplaceImage: () => void;
  isUploading: boolean;
}) {
  const set = (key: string, value: string) => onChange({ ...module.data, [key]: value });

  if (module.type === "hero_image" || module.type === "lifestyle_photo") {
    return (
      <div className="space-y-3">
        {module.data.imageUrl && (
          <img
            src={module.data.imageUrl}
            alt={module.data.alt ?? "Preview"}
            className="w-full rounded-xl object-cover"
            style={{ maxHeight: "140px" }}
          />
        )}
        <Button
          type="button"
          onClick={onReplaceImage}
          disabled={isUploading}
          className="w-full h-12 rounded-xl font-bold"
          style={{ background: "#f0f9ff", border: "2px dashed #7dd3fc", color: "#0284c7" }}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Camera className="w-5 h-5 mr-2" />
          )}
          {isUploading ? "Uploading photo…" : "Replace Image"}
        </Button>
        {module.type === "lifestyle_photo" && (
          <>
            <div>
              <Label className="text-sm font-semibold text-gray-700">Photo label</Label>
              <Input
                value={module.data.label ?? ""}
                onChange={(e) => set("label", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">Description (for accessibility)</Label>
              <Input
                value={module.data.alt ?? ""}
                onChange={(e) => set("alt", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          </>
        )}
      </div>
    );
  }

  const textFields: { key: string; label: string; multiline?: boolean }[] = (() => {
    switch (module.type) {
      case "hero_cta":
        return [
          { key: "badge", label: "Small label above headline" },
          { key: "heading", label: "Main headline (press Enter for a new line)", multiline: true },
          { key: "subtitle", label: "Text under headline", multiline: true },
          { key: "buttonLabel", label: "Button text" },
        ];
      case "benefits_header":
      case "lifestyle_header":
        return [
          { key: "eyebrow", label: "Small label above title" },
          { key: "title", label: "Section title" },
          { key: "subtitle", label: "Description", multiline: true },
        ];
      case "benefit_card":
        return [
          { key: "title", label: "Card title" },
          { key: "description", label: "Card text", multiline: true },
        ];
      case "faq_header":
        return [
          { key: "eyebrow", label: "Small label above title" },
          { key: "title", label: "Section title" },
        ];
      case "faq_item":
        return [
          { key: "question", label: "Question" },
          { key: "answer", label: "Answer", multiline: true },
        ];
      default:
        return [];
    }
  })();

  return (
    <div className="space-y-3">
      {textFields.map(({ key, label, multiline }) => (
        <div key={key}>
          <Label className="text-sm font-semibold text-gray-700">{label}</Label>
          {multiline ? (
            <Textarea
              value={module.data[key] ?? ""}
              onChange={(e) => set(key, e.target.value)}
              className="mt-1 rounded-xl resize-none"
              rows={key === "heading" ? 3 : 4}
              style={{ fontSize: "15px" }}
            />
          ) : (
            <Input
              value={module.data[key] ?? ""}
              onChange={(e) => set(key, e.target.value)}
              className="mt-1 h-11 rounded-xl"
              style={{ fontSize: "15px" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function PageEditor() {
  const [content, setContent] = useState<PageContent | null>(null);
  const [deployStatus, setDeployStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [uploadingModuleId, setUploadingModuleId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageModuleId = useRef<string | null>(null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const originalContentRef = useRef<PageContent | null>(null);

  const { data, isLoading, refetch } = trpc.admin.pageEditorLoad.useQuery();
  const saveDraft = trpc.admin.pageEditorSaveDraft.useMutation();
  const deploy = trpc.admin.pageEditorDeploy.useMutation();
  const uploadImage = trpc.admin.pageEditorUploadImage.useMutation();

  useEffect(() => {
    if (data?.draft) {
      setContent(data.draft);
      originalContentRef.current = JSON.parse(JSON.stringify(data.draft));
      setHasUnsavedChanges(false);
    }
  }, [data?.draft]);

  const previewHtml = useMemo(() => {
    if (!content) return "";
    return buildPagePreviewHtml(content, SITE_URL || window.location.origin);
  }, [content]);

  useEffect(() => {
    const frame = previewFrameRef.current;
    if (!frame || !previewHtml) return;
    frame.srcdoc = previewHtml;
  }, [previewHtml]);

  const updateModule = useCallback((id: string, data: Record<string, string>) => {
    setContent((prev) => {
      if (!prev) return prev;
      setHasUnsavedChanges(true);
      return {
        ...prev,
        modules: prev.modules.map((m) => (m.id === id ? { ...m, data } : m)),
      };
    });
  }, []);

  const deleteModule = useCallback((id: string) => {
    setContent((prev) => {
      if (!prev) return prev;
      setHasUnsavedChanges(true);
      return {
        ...prev,
        modules: prev.modules.filter((m) => m.id !== id),
      };
    });
    toast.success("Module removed");
  }, []);

  const addModule = useCallback((type: PageModuleType) => {
    setContent((prev) => {
      if (!prev) return prev;
      setHasUnsavedChanges(true);
      const newModule = createDefaultModule(type);
      return {
        ...prev,
        modules: [...prev.modules, newModule],
      };
    });
    toast.success(`${MODULE_LABELS[type]} added`);
  }, []);

  const resetChanges = useCallback(() => {
    if (originalContentRef.current) {
      setContent(JSON.parse(JSON.stringify(originalContentRef.current)));
      setHasUnsavedChanges(false);
      toast.info("Changes discarded");
    }
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !content) return;
    setHasUnsavedChanges(true);
    setContent({
      ...content,
      modules: reorderModules(content.modules, result.source.index, result.destination.index),
    });
  };

  const handleSaveDraft = async () => {
    if (!content) return;
    setDeployStatus(null);
    try {
      const result = await saveDraft.mutateAsync(content);
      setHasUnsavedChanges(false);
      originalContentRef.current = JSON.parse(JSON.stringify(content));
      toast.success("Draft saved! Your live site has not changed yet.");
      if (result.commitUrl) {
        setDeployStatus({
          type: "success",
          message: "Draft saved to GitHub. You can keep editing or tap Deploy when ready.",
        });
      }
      refetch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save your draft. Please try again.";
      setDeployStatus({ type: "error", message });
      toast.error(message);
    }
  };

  const handleDeploy = async () => {
    if (!content) return;
    setDeployStatus(null);
    try {
      const result = await deploy.mutateAsync(content);
      setHasUnsavedChanges(false);
      originalContentRef.current = JSON.parse(JSON.stringify(content));
      toast.success("Published! Your site will update in a minute or two.");
      setDeployStatus({
        type: "success",
        message: result.commitUrl
          ? "Success! We sent your changes to GitHub. Vercel is updating your website now."
          : "Success! Your changes were saved. Vercel will update your website shortly.",
      });
      refetch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not publish. Please try again.";
      setDeployStatus({ type: "error", message });
      toast.error(message);
    }
  };

  const openImagePicker = (moduleId: string) => {
    pendingImageModuleId.current = moduleId;
    fileInputRef.current?.click();
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const moduleId = pendingImageModuleId.current;
    e.target.value = "";
    if (!file || !moduleId) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Please choose a photo under 10 MB.");
      return;
    }
    setUploadingModuleId(moduleId);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] ?? "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { url } = await uploadImage.mutateAsync({
        fileName: file.name,
        mimeType: file.type,
        fileBase64: base64,
      });
      updateModule(moduleId, {
        ...(content?.modules.find((m) => m.id === moduleId)?.data ?? {}),
        imageUrl: url,
      });
      toast.success("Photo updated in your preview!");
    } catch {
      toast.error("Could not upload that photo. Please try again.");
    } finally {
      setUploadingModuleId(null);
      pendingImageModuleId.current = null;
    }
  };

  const isBusy = saveDraft.isPending || deploy.isPending;

  if (isLoading || !content) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#0284c7" }} />
      </div>
    );
  }

  const addableModuleTypes: PageModuleType[] = ["benefit_card", "lifestyle_photo", "faq_item"];

  return (
    <div className="max-w-[1600px] mx-auto px-3 py-4 pb-28">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />

      <div className="mb-4 px-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "#0f172a",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Page Editor
            </h1>
            <p className="text-gray-500 mt-1" style={{ fontSize: "15px" }}>
              Edit your homepage text and photos. Drag cards to reorder. Save a draft first, then
              Deploy when you are happy.
            </p>
          </div>
          {hasUnsavedChanges && (
            <div className="px-3 py-2 rounded-lg" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
              <p className="text-sm font-semibold text-yellow-800">Unsaved changes</p>
            </div>
          )}
        </div>
      </div>

      {deployStatus && (
        <div
          className="mb-4 mx-1 flex items-start gap-3 rounded-2xl p-4"
          style={{
            background: deployStatus.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${deployStatus.type === "success" ? "#86efac" : "#fca5a5"}`,
          }}
        >
          {deployStatus.type === "success" ? (
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: "#16a34a" }} />
          ) : (
            <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#dc2626" }} />
          )}
          <p className="font-medium" style={{ fontSize: "15px", color: "#374151" }}>
            {deployStatus.message}
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 min-h-[70vh]">
        {/* Preview */}
        <div
          className="lg:w-1/2 flex flex-col rounded-2xl overflow-hidden"
          style={{ border: "1px solid #e5e7eb", background: "white" }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
            style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}
          >
            <p className="font-bold text-gray-800" style={{ fontSize: "15px" }}>
              Live Preview
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode("desktop")}
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: previewMode === "desktop" ? "#dbeafe" : "#f1f5f9",
                  color: previewMode === "desktop" ? "#0284c7" : "#6b7280",
                }}
                title="Desktop preview"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: previewMode === "mobile" ? "#dbeafe" : "#f1f5f9",
                  color: previewMode === "mobile" ? "#0284c7" : "#6b7280",
                }}
                title="Mobile preview"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              {SITE_URL && (
                <a
                  href={SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-semibold ml-2"
                  style={{ color: "#0284c7" }}
                >
                  Open live site
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          <div
            className="flex-1 flex items-center justify-center"
            style={{
              minHeight: "480px",
              background: "#f9fafb",
              overflow: "auto",
            }}
          >
            <iframe
              ref={previewFrameRef}
              title="Page preview"
              className="bg-white"
              style={{
                minHeight: "480px",
                border: "none",
                width: previewMode === "mobile" ? "375px" : "100%",
                maxWidth: "100%",
              }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Editor */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Button
              onClick={handleSaveDraft}
              disabled={isBusy || !hasUnsavedChanges}
              className="flex-1 h-14 rounded-xl font-bold"
              style={{ background: "#0284c7", color: "white", border: "none", fontSize: "16px" }}
            >
              {saveDraft.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={isBusy}
              className="flex-1 h-14 rounded-xl font-bold"
              style={{ background: "#16a34a", color: "white", border: "none", fontSize: "16px" }}
              title="Publishes your changes to GitHub and updates your live website"
            >
              {deploy.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Upload className="w-5 h-5 mr-2" />
              )}
              Publish to Website
            </Button>
            {hasUnsavedChanges && (
              <Button
                onClick={resetChanges}
                disabled={isBusy}
                className="h-14 rounded-xl font-bold"
                style={{ background: "#f1f5f9", color: "#6b7280", border: "1px solid #e5e7eb", fontSize: "16px" }}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            )}
          </div>

            <div className="mb-3 px-1 space-y-2">
              <p className="text-gray-500" style={{ fontSize: "14px" }}>
                <strong>Workflow:</strong> Edit → Save Draft → Publish to Website
              </p>
              <p className="text-gray-500" style={{ fontSize: "14px" }}>
                Drag the ⋮⋮ handle to reorder sections. Tap any field to change the words.
              </p>
            </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="page-modules">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 overflow-y-auto pr-1"
                  style={{ maxHeight: "calc(70vh - 80px)" }}
                >
                  {content.modules.map((module, index) => (
                    <Draggable key={module.id} draggableId={module.id} index={index}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className="rounded-2xl p-4"
                          style={{
                            background: snapshot.isDragging ? "#f0f9ff" : "white",
                            border: snapshot.isDragging
                              ? "2px solid #0284c7"
                              : "1px solid #e5e7eb",
                            boxShadow: snapshot.isDragging
                              ? "0 8px 24px rgba(2,132,199,0.15)"
                              : "0 1px 4px rgba(0,0,0,0.06)",
                            ...dragProvided.draggableProps.style,
                          }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <button
                              type="button"
                              {...dragProvided.dragHandleProps}
                              className="p-2 rounded-lg touch-none"
                              style={{ background: "#f1f5f9" }}
                              aria-label="Drag to reorder"
                            >
                              <GripVertical className="w-5 h-5 text-gray-500" />
                            </button>
                            <p className="font-bold text-gray-900 flex-1" style={{ fontSize: "16px" }}>
                              {MODULE_LABELS[module.type as PageModuleType]}
                            </p>
                            <button
                              onClick={() => deleteModule(module.id)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                              style={{ color: "#ef4444" }}
                              title="Delete module"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <ModuleFields
                            module={module}
                            onChange={(data) => updateModule(module.id, data)}
                            onReplaceImage={() => openImagePicker(module.id)}
                            isUploading={uploadingModuleId === module.id}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Module Buttons */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "#e5e7eb" }}>
            <p className="text-sm font-semibold text-gray-700 mb-3">Add a new section:</p>
            <div className="grid grid-cols-3 gap-2">
              {addableModuleTypes.map((type) => (
                <Button
                  key={type}
                  onClick={() => addModule(type)}
                  disabled={isBusy}
                  className="h-12 rounded-xl font-semibold text-sm"
                  style={{
                    background: "#f0f9ff",
                    color: "#0284c7",
                    border: "1px solid #7dd3fc",
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {MODULE_LABELS[type]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
