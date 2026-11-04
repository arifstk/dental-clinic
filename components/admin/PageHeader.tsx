// components/admin/PageHeader.tsx

export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="heading-1">{title}</h1>
        {description && <p className="muted mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
