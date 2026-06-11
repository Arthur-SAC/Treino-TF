import { useState } from "react";
import { VideoEmbed } from "./VideoEmbed";

interface Props {
  url?: string;
  onSave: (url: string) => void;
}

export function VideoSection({ url, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(url ?? "");

  return (
    <div className="card mb-3">
      <div className="flex justify-between items-baseline mb-2">
        <h2 className="text-nude-warm font-medium">Vídeo</h2>
        <button
          type="button"
          onClick={() => {
            setValue(url ?? "");
            setEditing((v) => !v);
          }}
          className="text-muted text-xs underline"
        >
          {url ? "editar" : "adicionar"}
        </button>
      </div>

      {url && !editing && <VideoEmbed url={url} />}
      {!url && !editing && (
        <p className="text-muted text-sm">Cole um link (YouTube etc.) pra ver o vídeo aqui.</p>
      )}

      {editing && (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onSave(value.trim());
                setEditing(false);
              }}
              className="flex-1 bg-wine text-nude-warm rounded-md py-1.5 text-sm"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 bg-bg-deep border border-bg-border text-muted rounded-md text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
