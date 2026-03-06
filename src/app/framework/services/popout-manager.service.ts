/**
 * Pop-out Manager Service
 *
 * Manages pop-out window lifecycle using Angular CDK Portals.
 * Opens `about:blank` windows and renders Angular components into them
 * via DomPortalOutlet — no full app bootstrap, no router, no auth guards.
 *
 * The parent window's Angular context drives change detection,
 * so ngModel, *ngIf, pipes, and DI all work in the pop-out.
 */

import { Injectable, NgZone, OnDestroy, ApplicationRef, ComponentFactoryResolver, Injector, Type, EventEmitter } from '@angular/core';
import { DomPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import {
  buildWindowFeatures,
  PopOutMessage,
  PopOutMessageType,
  PopOutWindowFeatures,
  PopOutWindowRef
} from '../models/popout.interface';
import { PopOutContextService } from './popout-context.service';

@Injectable()
export class PopOutManagerService implements OnDestroy {
  private gridId = '';
  private poppedOutPanels = new Set<string>();
  private popoutWindows = new Map<string, PopOutWindowRef>();
  private messagesSubject = new Subject<{ panelId: string; message: PopOutMessage }>();
  private closedSubject = new Subject<string>();
  private blockedSubject = new Subject<string>();
  private beforeUnloadHandler = () => this.closeAllPopOuts();
  private initialized = false;

  readonly messages$ = this.messagesSubject.asObservable();
  readonly closed$ = this.closedSubject.asObservable();
  readonly blocked$ = this.blockedSubject.asObservable();

  constructor(
    private popOutContext: PopOutContextService,
    private ngZone: NgZone,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  initialize(gridId: string): void {
    if (this.initialized) {
      return;
    }

    this.gridId = gridId;
    this.initialized = true;

    this.popOutContext.initializeAsParent();
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    this.popOutContext.getMessages$().subscribe(message => {
      this.messagesSubject.next({ panelId: '', message });
    });
  }

  isPoppedOut(panelId: string): boolean {
    return this.poppedOutPanels.has(panelId);
  }

  getPoppedOutPanels(): string[] {
    return Array.from(this.poppedOutPanels);
  }

  /**
   * Open a pop-out window and render an Angular component into it.
   *
   * @param panelId - Unique panel identifier
   * @param componentType - Angular component class to render
   * @param data - Data to set on the component instance (key → property)
   * @param features - Optional window size/position
   * @returns true if pop-out opened successfully
   */
  openPopOut(
    panelId: string,
    componentType: Type<any>,
    data: Record<string, any>,
    features?: Partial<PopOutWindowFeatures>
  ): boolean {
    if (this.poppedOutPanels.has(panelId)) {
      return false;
    }

    const windowFeatures = buildWindowFeatures({
      width: 1200,
      height: 800,
      left: 100,
      top: 100,
      resizable: true,
      scrollbars: true,
      ...features
    });

    const popoutWindow = window.open('about:blank', `panel-${panelId}`, windowFeatures);

    if (!popoutWindow) {
      this.blockedSubject.next(panelId);
      return false;
    }

    // Write minimal HTML skeleton (no styles yet — component styles don't exist until attachment)
    this.writePopoutDocument(popoutWindow);

    // Create CDK portal outlet targeting the popout's body
    const outlet = new DomPortalOutlet(
      popoutWindow.document.body,
      this.componentFactoryResolver,
      this.appRef,
      this.injector
    );

    // Attach component via portal — this triggers Angular to generate component styles
    const portal = new ComponentPortal(componentType);
    const componentRef = outlet.attach(portal);

    // NOW copy styles (including the component styles Angular just created)
    this.copyStylesToPopout(popoutWindow);

    // Patch popout window so DOM events trigger Angular change detection.
    // NgZone only patches the parent window's APIs — the popout's are unpatched.
    this.patchPopoutZone(popoutWindow);

    // Set data on component instance
    if (data) {
      Object.keys(data).forEach(key => {
        (componentRef.instance as any)[key] = data[key];
      });
    }

    // Wire up @Output() EventEmitters as messages
    this.wireComponentOutputs(componentRef.instance, panelId);

    this.poppedOutPanels.add(panelId);

    // Set up BroadcastChannel for this panel (kept for external consumers)
    const channel = this.popOutContext.createChannelForPanel(panelId);

    channel.onmessage = event => {
      this.ngZone.run(() => {
        this.messagesSubject.next({ panelId, message: event.data });
      });
    };

    // Poll for window close
    const checkInterval = window.setInterval(() => {
      if (popoutWindow.closed) {
        this.ngZone.run(() => {
          this.handlePopOutClosed(panelId);
        });
      }
    }, 500);

    this.popoutWindows.set(panelId, {
      window: popoutWindow,
      channel,
      checkInterval,
      panelId,
      panelType: componentType.name,
      outlet,
      componentRef
    });

    return true;
  }

  /**
   * Subscribe to any @Output() EventEmitters on the component instance
   * and relay them as PopOutMessages through messagesSubject.
   */
  private wireComponentOutputs(instance: any, panelId: string): void {
    // Scan instance for EventEmitter properties and relay them as messages.
    // The manager is component-agnostic — it discovers outputs generically.
    for (const key of Object.keys(instance)) {
      if (instance[key] instanceof EventEmitter) {
        instance[key].subscribe((payload: any) => {
          this.messagesSubject.next({
            panelId,
            message: {
              type: PopOutMessageType.URL_PARAMS_CHANGED,
              payload: { outputName: key, params: payload },
              timestamp: Date.now()
            }
          });
        });
      }
    }
  }

  /**
   * Update a property on a popout component instance.
   */
  updatePopoutData(panelId: string, key: string, value: any): void {
    const ref = this.popoutWindows.get(panelId);
    if (ref?.componentRef) {
      const instance = ref.componentRef.instance as any;
      const previousValue = instance[key];
      instance[key] = value;

      // Direct property assignment bypasses Angular's @Input() binding,
      // so ngOnChanges won't fire automatically. Invoke it manually.
      if (instance.ngOnChanges && previousValue !== value) {
        instance.ngOnChanges({
          [key]: {
            previousValue,
            currentValue: value,
            firstChange: false,
            isFirstChange: () => false
          }
        });
      }

      ref.componentRef.changeDetectorRef.detectChanges();
    }
  }

  /**
   * Patch the popout window's event system so callbacks run inside Angular's NgZone.
   * Without this, user interactions (input, click) in about:blank don't trigger change detection.
   */
  private patchPopoutZone(popoutWindow: Window): void {
    const zone = this.ngZone;
    const originalAddEventListener = popoutWindow.document.addEventListener.bind(popoutWindow.document);

    popoutWindow.document.addEventListener = function(
      type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions
    ) {
      const wrapped = (event: Event) => {
        zone.run(() => {
          if (typeof listener === 'function') {
            listener(event);
          } else {
            listener.handleEvent(event);
          }
        });
      };
      return originalAddEventListener(type, wrapped, options);
    } as typeof popoutWindow.document.addEventListener;
  }

  /**
   * Write a minimal HTML skeleton into the popout window.
   * Styles are copied separately AFTER portal attachment (see copyStylesToPopout).
   */
  private writePopoutDocument(popoutWindow: Window): void {
    const doc = popoutWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    doc.close();

    // Set base styles on body
    doc.body.style.margin = '0';
    doc.body.style.overflow = 'hidden';
  }

  /**
   * Copy all stylesheets and inline styles from parent document to popout.
   * Must be called AFTER portal attachment so that Angular's component styles
   * (generated on first instantiation) are present in the parent's <head>.
   */
  private copyStylesToPopout(popoutWindow: Window): void {
    const doc = popoutWindow.document;
    document.head.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
      const clone = doc.importNode(node, true);
      doc.head.appendChild(clone);
    });
  }

  /**
   * Broadcast state to all popout windows
   */
  broadcastState(state: any, filterOptionsCache?: any): void {
    if (this.popoutWindows.size === 0) {
      return;
    }

    const message = {
      type: PopOutMessageType.STATE_UPDATE,
      payload: {
        state,
        filterOptionsCache: filterOptionsCache || null
      },
      timestamp: Date.now()
    };

    this.popoutWindows.forEach(({ channel }) => {
      try {
        channel.postMessage(message);
      } catch {
        // Silently ignore posting errors
      }
    });
  }

  closePopOut(panelId: string): void {
    const ref = this.popoutWindows.get(panelId);
    if (ref) {
      if (ref.window && !ref.window.closed) {
        ref.window.close();
      }
      this.handlePopOutClosed(panelId);
    }
  }

  closeAllPopOuts(): void {
    this.popoutWindows.forEach((ref, panelId) => {
      if (ref.window && !ref.window.closed) {
        ref.window.close();
      }
    });
  }

  private handlePopOutClosed(panelId: string): void {
    const ref = this.popoutWindows.get(panelId);
    if (!ref) {
      return;
    }

    clearInterval(ref.checkInterval);

    // Detach portal and clean up CDK outlet
    if (ref.outlet) {
      ref.outlet.detach();
      ref.outlet.dispose();
    }

    ref.channel.close();
    this.popoutWindows.delete(panelId);
    this.poppedOutPanels.delete(panelId);

    this.closedSubject.next(panelId);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);

    this.popoutWindows.forEach((ref) => {
      clearInterval(ref.checkInterval);
      if (ref.outlet) {
        ref.outlet.detach();
        ref.outlet.dispose();
      }
      ref.channel.close();
      if (ref.window && !ref.window.closed) {
        ref.window.close();
      }
    });

    this.messagesSubject.complete();
    this.closedSubject.complete();
    this.blockedSubject.complete();
  }
}
