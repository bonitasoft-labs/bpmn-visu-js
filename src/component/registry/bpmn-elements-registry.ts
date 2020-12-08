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
import { ensureIsArray } from '../parser/json/converter/utils';
import { ShapeBpmnElementKind } from '../../model/bpmn/internal/shape';
import { BpmnMxGraph } from '../mxgraph/BpmnMxGraph';

/**
 * @experimental subject to change, feedback welcome
 */
export class HtmlElementRegistry {
  constructor(private containerId: string) {}

  /**
   * Returns `null` if no element is found.
   * @param bpmnElementId the id of the BPMN element represented by the searched Html Element.
   */
  getBpmnHtmlElement(bpmnElementId: string): HTMLElement | null {
    /**
     * Once mxGraph is initialized at BpmnVisualization construction, prior loading a BPMN diagram, the DOM looks like:
     * ```html
     * <div id="bpmn-container" style="touch-action: none;">
     *   <svg style="left: 0px; top: 0px; width: 100%; height: 100%; display: block; min-width: 1px; min-height: 1px;">
     *     <g>
     *       <g></g>
     *       <g></g>
     *       <g></g>
     *       <g></g>
     *     </g>
     *   </svg>
     * </div>
     * ```
     *
     * After loading, the DOM looks like:
     * ```html
     * <div id="bpmn-container" style="touch-action: none;">
     *   <svg style="left: 0px; top: 0px; width: 100%; height: 100%; display: block; min-width: 900px; min-height: 181px;">
     *     <g>
     *       <g></g>
     *       <g>
     *         <g style="" class="pool" data-bpmn-id="Participant_1">....</g>
     *       </g>
     *       <g></g>
     *       <g></g>
     *     </g>
     *   </svg>
     * </div>
     * ```
     * In the 2nd 'g' node, children 'g' nodes with the 'data-cell-id' attribute (extra attribute generated by the lib) are only available when the rendering is done
     */
    // TODO can we improve the selector? see also BpmnElementSelector in tests
    const cssSelector = `#${this.containerId} svg g g[data-bpmn-id="${bpmnElementId}"]`;
    // TODO error management, for now we return null
    return document.querySelector<HTMLElement>(cssSelector);
  }
}

// TODO move comments from HtmlElementRegistry here
export class BpmnElementsRegistry {
  // TODO we should extract the code processing the model (mxgraph or internal) from this class and the code that does the DOM lookup as well
  constructor(private containerId: string, private graph: BpmnMxGraph) {}

  getElementsByIds(bpmnElementIds: string | string[]): BpmnElement[] {
    // TODO move ensureIsArray to helpers/arrays.ts and add dedicated tests
    const ids = ensureIsArray(bpmnElementIds) as string[];

    ids.forEach(id => {
      // TODO we don't need this for now, this is part of #929
      const mxCell = this.graph.getModel().getCell(id);
      // TODO if null, return
      const label = mxCell.value;
      // TODO get shape kind from model
    });

    return [];
  }

  getElementsByKinds(kinds: ShapeBpmnElementKind | ShapeBpmnElementKind[]): BpmnElement[] {
    return [];
  }
}

interface BpmnSemantic {
  id: string;
  label: string;
  kind: ShapeBpmnElementKind;
}

export interface BpmnElement extends BpmnSemantic {
  htmlElement: HTMLElement;
}
