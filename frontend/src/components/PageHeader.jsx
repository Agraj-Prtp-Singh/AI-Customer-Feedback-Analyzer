export default function PageHeader({ title, description, icon: Icon }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      {Icon && (
        <div className="rounded-xl bg-black p-3 text-white">
          <Icon size={24} />
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-gray-500">{description}</p>
      </div>
    </div>
  );
}
