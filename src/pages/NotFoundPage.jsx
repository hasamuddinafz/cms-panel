import PanelHelmet from "../components/layout/PanelHelmet";

export default function NotFoundPage() {
  return (
    <>
      <PanelHelmet title="404 Bulunamadı" />
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-4xl font-bold text-muted-foreground">404</p>
        <p className="text-sm text-muted-foreground">Sayfa bulunamadı.</p>
      </div>
    </>
  );
}
