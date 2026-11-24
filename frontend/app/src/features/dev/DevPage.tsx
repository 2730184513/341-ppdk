import { PageFrame } from '../../components/PageFrame';
import { useEffect, useState } from 'react';
import { api, type ActivityCatalog } from '../../api/client';
import { scenarioNames, setScenario, type Scenario } from '../../mocks/scenarios';
import { Button } from '../../components/Button';

export function DevPage() {
  const [activities, setActivities] = useState<ActivityCatalog['items']>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scenario, updateScenario] = useState<Scenario>('normal');
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setActivities((await api.activities()).items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load activities.');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  return (
    <PageFrame>
      <p className="eyebrow">PPDK · Development only</p>
      <h1>Mock development starter</h1>
      <p>
        This local development console inspects the Mock catalog and deterministic fault scenarios.
      </p>
      <section aria-labelledby="mock-settings">
        <h2 id="mock-settings">Mock scenarios</h2>
        <label htmlFor="scenario">Scenario</label>
        <select
          id="scenario"
          value={scenario}
          onChange={(e) => {
            const value = e.target.value as Scenario;
            updateScenario(value);
            setScenario(value);
          }}
        >
          {scenarioNames.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <Button onClick={() => void load()} disabled={loading}>
          Reload activities
        </Button>
      </section>
      <section aria-labelledby="activities">
        <h2 id="activities">Activity catalog</h2>
        <p role="status">{loading ? 'Loading…' : `${activities.length} activity packs`}</p>
        {error && <p role="alert">{error}</p>}
        <ul>
          {activities.map((a) => (
            <li key={a.id}>
              <h3>{a.title}</h3>
              <p>
                {a.itemCount} items · {a.type} · version {a.version}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <p>Use the gallery and docs in the extracted project. No backend connection is configured.</p>
    </PageFrame>
  );
}
