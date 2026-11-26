import { Artwork } from './Artwork';
import { artworkAssets, type ArtworkId } from './artwork-assets';

export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const mapped: Record<string, ArtworkId> = { arrange: 'sunrise' };
  const assetId = mapped[name] ?? (name in artworkAssets ? (name as ArtworkId) : undefined);
  if (!assetId) return <span data-artwork-error={name}>Picture unavailable</span>;
  return <Artwork assetId={assetId} size={size} />;
}
