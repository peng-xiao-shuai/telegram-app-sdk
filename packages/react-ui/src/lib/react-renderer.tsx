import React from 'react';
import ReactDOM from 'react-dom/client';

class ReactRenderer {
  private container: HTMLElement;
  private root: ReactDOM.Root;
  private activeComponent: React.ReactNode | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'react-root-container';
    document.body.appendChild(this.container);
    this.root = ReactDOM.createRoot(this.container);
  }

  render<P extends object>(
    Component: React.ComponentType<P & { onClose?: () => void }>,
    props: Omit<P, 'onClose'> = {} as P
  ) {
    const wrappedComponent = (
      <React.Fragment>
        <Component {...(props as P)} onClose={() => this.unmount()} />
      </React.Fragment>
    );
    this.activeComponent = wrappedComponent;
    this.root.render(this.activeComponent);
  }

  unmount() {
    this.activeComponent = null;
    this.root.render(null);
  }
}

export const reactRenderer = new ReactRenderer();
