import type { Activity } from '../api/types';
import { CachedImage } from '../media/CachedImage';
import { visibleChoices } from '../features/learning/evidence';
/** Exact supplied version. This preview never constructs personal evidence or marks readiness. */
export function QuickActivityPreview({
  activity,
  optionCount = 3,
  returnTo,
}: {
  activity: Activity;
  optionCount?: 2 | 3;
  returnTo?: string;
}) {
  const item = activity.items[0];
  const choices = item.type === 'SELECT_ONE' ? visibleChoices(item, optionCount) : item.cards;
  return (
    <div className="stack">
      <div>
        <h3>{activity.title}</h3>
        <p className="muted">
          Version {activity.version} ·{' '}
          {activity.type === 'SELECT_ONE' ? 'Choose a picture' : 'Put in order'} · English ·{' '}
          {activity.itemCount} items
        </p>
      </div>
      <p>{item.instruction}</p>
      <div className="preview-thumbnails">
        {choices.map((choice) => (
          <figure key={choice.id}>
            <CachedImage url={choice.imageUrl} />
            <figcaption>{choice.label}</figcaption>
          </figure>
        ))}
      </div>
      <p className="muted">Read only. No personal records or rewards saved.</p>
      <a
        className="button primary"
        href={`/teacher/activities/${activity.id}/versions/${activity.version}/preview${returnTo ? '?returnTo=' + encodeURIComponent(returnTo) : ''}`}
      >
        Open full preview
      </a>
    </div>
  );
}
