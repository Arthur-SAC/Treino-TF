import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type ProgressPhoto } from "../../lib/db";
import { PhotoUpload } from "../../components/PhotoUpload";
import { BlobImage } from "../../components/BlobImage";
import { formatDateBR } from "../../lib/format";

export function Photos() {
  const photos = useLiveQuery(async () => {
    const list = await db.photos.where("category").equals("self").sortBy("date");
    return list.reverse();
  }, []);

  async function handleUpload(p: Omit<ProgressPhoto, "id">) {
    await db.photos.add(p as ProgressPhoto);
  }

  async function handleDelete(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar essa foto?")) return;
    await db.photos.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/corpo" className="text-muted text-sm">&larr; Corpo</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Fotos</h1>
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Nova foto</h2>
        <PhotoUpload onUpload={handleUpload} />
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Galeria</h2>
      {!photos?.length && (
        <p className="text-muted text-sm py-4 text-center">Sem fotos ainda.</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {photos?.map((p) => (
          <div key={p.id} className="card !p-2">
            <BlobImage blob={p.blob} alt={p.tag} className="w-full rounded-md mb-2 aspect-[3/4] object-cover" />
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-nude-warm">{formatDateBR(new Date(p.date))}</span>
              <span className="text-muted">{p.tag}</span>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-muted text-xs hover:text-red-300 mt-1"
              type="button"
            >
              apagar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
