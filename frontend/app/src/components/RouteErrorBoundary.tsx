import { Component, type ReactNode } from 'react';
import { PageFrame } from './PageFrame';
import { Button } from './Button';

export class RouteErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    const chunkFailure =
      /dynamically imported module|module script|ChunkLoadError|preload CSS/i.test(
        this.state.error.message,
      );
    return (
      <PageFrame className="teacher-main">
        <section className="centered-task" role="alert">
          <h1>This view could not open</h1>
          <p>
            {chunkFailure
              ? 'A required app file could not load. Check your connection, then reload this view.'
              : 'This view encountered a problem. Reload to try again.'}
          </p>
          <p>Your saved practices and pending uploads are kept on this device.</p>
          <Button onClick={() => location.reload()}>Reload this view</Button>
        </section>
      </PageFrame>
    );
  }
}
