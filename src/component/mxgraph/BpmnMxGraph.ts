/**
 * Copyright 2020 Bonitasoft S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { mxgraph } from 'ts-mxgraph';
// TODO unable to load mxClient from mxgraph-type-definitions@1.0.4
declare const mxClient: typeof mxgraph.mxClient;

import { ZoomConfiguration } from '../BpmnVisualization';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';

export class BpmnMxGraph extends mxGraph {
  private cumulativeZoomFactor = 1;

  constructor(readonly container: HTMLElement) {
    super(container);
  }

  // override fit to set initial cumulativeZoomFactor
  fit(order: number, keepOrigin?: boolean, margin?: number, enabled?: boolean, ignoreWidth?: boolean, ignoreHeight?: boolean, maxHeight?: number): number {
    const scale = super.fit(order, keepOrigin, margin, enabled, ignoreWidth, ignoreHeight, maxHeight);
    this.cumulativeZoomFactor = scale;
    return scale;
  }

  zoomTo(scale: number, center?: boolean, up?: boolean, offsetX?: number, offsetY?: number, performScaling?: boolean): void {
    if (scale === null) {
      const [newScale, dx, dy] = this.getScaleAndTranslationDeltas(up, offsetX, offsetY);
      if (performScaling) {
        this.view.scaleAndTranslate(newScale, this.view.translate.x + dx, this.view.translate.y + dy);
        // eslint-disable-next-line no-console
        console.log('___ SCALING IT ___', this.cumulativeZoomFactor);
      }
      // eslint-disable-next-line no-console
      console.log('___ JUST CALCULATING THE FACTOR ___', this.cumulativeZoomFactor);
    } else {
      super.zoomTo(scale, center);
    }
  }

  createMouseWheelZoomExperience(config: ZoomConfiguration = { throttleDelay: 50, debounceDelay: 50 }): void {
    mxEvent.addMouseWheelListener(debounce(this.getZoomHandler(true), config.debounceDelay), this.container);
    mxEvent.addMouseWheelListener(throttle(this.getZoomHandler(false), config.throttleDelay), this.container);
  }

  // solution inspired by https://github.com/algenty/grafana-flowcharting/blob/0.9.0/src/graph_class.ts#L1254
  private performZoom(up: boolean, evt: MouseEvent, performScaling: boolean): void {
    const [x, y] = this.getRelativeEventCoordinates(evt);
    this.zoomTo(null, null, up, x, y, performScaling);
    if (performScaling) {
      mxEvent.consume(evt);
    }
  }

  private getZoomHandler(calculateFactorOnly: boolean) {
    return (event: Event, up: boolean) => {
      // TODO review type: this hack is due to the introduction of mxgraph-type-definitions
      const evt = (event as unknown) as MouseEvent;
      if (mxEvent.isConsumed((evt as unknown) as mxMouseEvent)) {
        return;
      }
      // only the ctrl key or the meta key on mac
      const isZoomWheelEvent = (evt.ctrlKey || (mxClient.IS_MAC && evt.metaKey)) && !evt.altKey && !evt.shiftKey;
      if (isZoomWheelEvent) {
        this.performZoom(up, evt, calculateFactorOnly);
      }
    };
  }

  private getRelativeEventCoordinates(evt: MouseEvent): [number, number] {
    const rect = this.container.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    return [x, y];
  }

  private getScaleAndTranslationDeltas(up: boolean, offsetX: number, offsetY: number): [number, number, number] {
    let dx = offsetX * 2;
    let dy = offsetY * 2;
    const [factor, scale] = this.calculateFactorAndScale(up);
    [dx, dy] = this.calculateTranslationDeltas(factor, scale, dx, dy);
    return [scale, dx, dy];
  }

  private calculateTranslationDeltas(factor: number, scale: number, dx: number, dy: number): [number, number] {
    if (factor > 1) {
      const f = (factor - 1) / (scale * 2);
      dx *= -f;
      dy *= -f;
    } else {
      const f = (1 / factor - 1) / (this.view.scale * 2);
      dx *= f;
      dy *= f;
    }
    return [dx, dy];
  }

  private calculateFactorAndScale(up: boolean): [number, number] {
    this.cumulativeZoomFactor *= up ? 1.25 : 0.8;
    let factor = this.cumulativeZoomFactor / this.view.scale;
    const scale = Math.round(this.view.scale * factor * 100) / 100;
    factor = scale / this.view.scale;
    return [factor, scale];
  }
}