import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useId } from "react";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";
import FieldRenderer from "../FieldRenderer";

export default function RepeaterField({ field, value = [], onChange, lang }) {
  const sensors = useSensors(useSensor(PointerSensor));

  function addItem() {
    const empty = {};
    (field.fields ?? []).forEach((f) => { empty[f.key] = null; });
    onChange([...value, { _id: crypto.randomUUID(), ...empty }]);
  }

  function removeItem(idx) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function updateItem(idx, subKey, subVal) {
    onChange(value.map((item, i) => (i === idx ? { ...item, [subKey]: subVal } : item)));
  }

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIdx = value.findIndex((i) => i._id === active.id);
    const newIdx = value.findIndex((i) => i._id === over.id);
    onChange(arrayMove(value, oldIdx, newIdx));
  }

  const canAdd = !field.maxItems || value.length < field.maxItems;

  return (
    <FieldWrapper field={field}>
      <div className="flex items-center justify-between">
        <Label>{field.label}{field.required && " *"}</Label>
        {canAdd && (
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
            <Plus size={13} /> Add
          </Button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={value.map((i) => i._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 mt-1">
            {value.map((item, idx) => (
              <SortableItem
                key={item._id}
                id={item._id}
                idx={idx}
                item={item}
                subFields={field.fields ?? []}
                lang={lang}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">No items added yet.</p>
      )}
    </FieldWrapper>
  );
}

function SortableItem({ id, idx, item, subFields, lang, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-muted/20 p-3 space-y-3"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
        <span className="text-xs text-muted-foreground font-medium">#{idx + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(idx)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {subFields.map((subField) => (
        <FieldRenderer
          key={subField.key}
          field={subField}
          value={item[subField.key]}
          onChange={(val) => onUpdate(idx, subField.key, val)}
          lang={lang}
        />
      ))}
    </div>
  );
}
