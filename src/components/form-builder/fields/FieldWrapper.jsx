export default function FieldWrapper({ field, children }) {
  return (
    <div className="space-y-1.5">
      {children}
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}
