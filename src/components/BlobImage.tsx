import { useEffect, useState } from "react";
import { blobToObjectUrl, revokeObjectUrl } from "../lib/image-compress";

interface Props {
  blob: Blob;
  alt: string;
  className?: string;
}

export function BlobImage({ blob, alt, className }: Props) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const u = blobToObjectUrl(blob);
    setUrl(u);
    return () => revokeObjectUrl(u);
  }, [blob]);
  if (!url) return null;
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
