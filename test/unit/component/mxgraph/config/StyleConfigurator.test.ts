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

import StyleConfigurator from '../../../../../src/component/mxgraph/config/StyleConfigurator';
import Shape from '../../../../../src/model/bpmn/internal/shape/Shape';
import ShapeBpmnElement, {
  ShapeBpmnActivity,
  ShapeBpmnBoundaryEvent,
  ShapeBpmnCallActivity,
  ShapeBpmnEvent,
  ShapeBpmnStartEvent,
  ShapeBpmnSubProcess,
} from '../../../../../src/model/bpmn/internal/shape/ShapeBpmnElement';
import { ShapeBpmnElementType, ShapeBpmnCallActivityKind, ShapeBpmnMarkerType, ShapeBpmnSubProcessKind, ShapeBpmnEventType } from '../../../../../src/model/bpmn/internal/shape';
import Label from '../../../../../src/model/bpmn/internal/Label';
import { ExpectedFont } from '../../parser/json/JsonTestUtils';
import Edge from '../../../../../src/model/bpmn/internal/edge/Edge';
import { AssociationFlow, MessageFlow, SequenceFlow } from '../../../../../src/model/bpmn/internal/edge/Flow';
import { SequenceFlowKind } from '../../../../../src/model/bpmn/internal/edge/SequenceFlowKind';
import { BpmnEventType } from '../../../../../src/model/bpmn/internal/shape/ShapeUtil';
import each from 'jest-each';
import { MessageVisibleKind } from '../../../../../src/model/bpmn/json-xsd/BPMNDI';
import { Bounds, Font } from '../../../../../src/model/bpmn/json-xsd/DC';
import { TAssociationDirection } from '../../../../../src/model/bpmn/json-xsd/baseElement/artifact';

function toFont(font: ExpectedFont): Font {
  return { name: font.name, size: font.size, isBold: font.isBold, isItalic: font.isItalic, isUnderline: font.isUnderline, isStrikeThrough: font.isStrikeThrough };
}

function newLabel(font: ExpectedFont, bounds?: Bounds): Label {
  return new Label(toFont(font), bounds);
}

/**
 * Returns a new `Shape` instance with arbitrary id and `undefined` bounds.
 * @param kind the `ShapeBpmnElementKind` to set in the new `ShapeBpmnElement` instance
 */
function newShape(bpmnElement: ShapeBpmnElement, label?: Label, isHorizontal?: boolean): Shape {
  return new Shape('id', bpmnElement, undefined, label, isHorizontal);
}

/**
 * Returns a new `ShapeBpmnElement` instance with arbitrary id and name.
 * `kind` is the `ShapeBpmnElementKind` to set in the new `ShapeBpmnElement` instance
 */
function newShapeBpmnElement(kind: ShapeBpmnElementType): ShapeBpmnElement {
  return new ShapeBpmnElement('id', 'name', kind);
}

function newShapeBpmnActivity(kind: ShapeBpmnElementType, markers?: ShapeBpmnMarkerType[], instantiate?: boolean): ShapeBpmnElement {
  return new ShapeBpmnActivity('id', 'name', kind, undefined, instantiate, markers);
}

function newShapeBpmnCallActivity(markers?: ShapeBpmnMarkerType[]): ShapeBpmnElement {
  return new ShapeBpmnCallActivity('id', 'name', ShapeBpmnCallActivityKind.CALLING_PROCESS, undefined, markers);
}

function newShapeBpmnEvent(bpmnElementKind: BpmnEventType, eventKind: ShapeBpmnEventType): ShapeBpmnEvent {
  return new ShapeBpmnEvent('id', 'name', bpmnElementKind, eventKind, null);
}

function newShapeBpmnBoundaryEvent(eventKind: ShapeBpmnEventType, isInterrupting: boolean): ShapeBpmnBoundaryEvent {
  return new ShapeBpmnBoundaryEvent('id', 'name', eventKind, null, isInterrupting);
}

function newShapeBpmnStartEvent(eventKind: ShapeBpmnEventType, isInterrupting: boolean): ShapeBpmnStartEvent {
  return new ShapeBpmnStartEvent('id', 'name', eventKind, null, isInterrupting);
}

function newShapeBpmnSubProcess(subProcessKind: ShapeBpmnSubProcessKind, marker?: ShapeBpmnMarkerType[]): ShapeBpmnSubProcess {
  return new ShapeBpmnSubProcess('id', 'name', subProcessKind, null, marker);
}

/**
 * Returns a new `SequenceFlow` instance with arbitrary id and name.
 * @param kind the `SequenceFlowKind` to set in the new `SequenceFlow` instance
 */
function newSequenceFlow(kind: SequenceFlowKind): SequenceFlow {
  return new SequenceFlow('id', 'name', undefined, undefined, kind);
}

function newMessageFlow(): MessageFlow {
  return new MessageFlow('id', 'name', undefined, undefined);
}

function newAssociationFlow(kind: TAssociationDirection): AssociationFlow {
  return new AssociationFlow('id', 'name', undefined, undefined, kind);
}

function newBounds(width: number): Bounds {
  return { x: 20, y: 20, width, height: 200 };
}

describe('mxgraph renderer', () => {
  const styleConfigurator = new StyleConfigurator(null); // we don't care of mxgraph graph here

  // shortcut as the current computeStyle implementation requires to pass the BPMN label bounds as extra argument
  function computeStyle(bpmnCell: Shape | Edge): string {
    return styleConfigurator.computeStyle(bpmnCell, bpmnCell.label?.bounds);
  }

  describe('compute style - shape label', () => {
    it('compute style of shape with no label', () => {
      const shape = new Shape('id', newShapeBpmnElement(ShapeBpmnElementType.TASK_USER));
      expect(computeStyle(shape)).toEqual('userTask');
    });

    it('compute style of shape with a no font label', () => {
      const shape = new Shape('id', newShapeBpmnElement(ShapeBpmnElementType.EVENT_END), undefined, new Label(undefined, undefined));
      expect(computeStyle(shape)).toEqual('endEvent');
    });
    it('compute style of shape with label including bold font', () => {
      const shape = new Shape(
        'id',
        newShapeBpmnElement(ShapeBpmnElementType.GATEWAY_EXCLUSIVE),
        undefined,
        new Label(toFont({ name: 'Courier', size: 9, isBold: true }), undefined),
      );
      expect(computeStyle(shape)).toEqual('exclusiveGateway;fontFamily=Courier;fontSize=9;fontStyle=1');
    });

    it('compute style of shape with label including italic font', () => {
      const shape = new Shape('id', newShapeBpmnElement(ShapeBpmnElementType.EVENT_INTERMEDIATE_CATCH), undefined, new Label(toFont({ name: 'Arial', isItalic: true }), undefined));
      expect(computeStyle(shape)).toEqual('intermediateCatchEvent;fontFamily=Arial;fontStyle=2');
    });

    it('compute style of shape with label including bold/italic font', () => {
      const shape = new Shape('id', newShapeBpmnElement(ShapeBpmnElementType.EVENT_INTERMEDIATE_THROW), undefined, new Label(toFont({ isBold: true, isItalic: true }), undefined));
      expect(computeStyle(shape)).toEqual('intermediateThrowEvent;fontStyle=3');
    });

    it('compute style of shape with label bounds', () => {
      const shape = new Shape('id', newShapeBpmnElement(ShapeBpmnElementType.CALL_ACTIVITY), undefined, new Label(undefined, newBounds(80)));
      expect(computeStyle(shape)).toEqual('callActivity;verticalAlign=top;align=center;labelWidth=81;labelPosition=top;verticalLabelPosition=left');
    });
  });

  describe('compute style - edge label', () => {
    it('compute style of edge with no label', () => {
      const edge = new Edge('id', newSequenceFlow(SequenceFlowKind.CONDITIONAL_FROM_GATEWAY));
      expect(computeStyle(edge)).toEqual('sequenceFlow;conditional_from_gateway');
    });

    it('compute style of edge with a no font label', () => {
      const edge = new Edge('id', newSequenceFlow(SequenceFlowKind.NORMAL), undefined, new Label(undefined, undefined));
      expect(computeStyle(edge)).toEqual('sequenceFlow;normal');
    });

    it('compute style of edge with label including strike-through font', () => {
      const edge = new Edge('id', newSequenceFlow(SequenceFlowKind.CONDITIONAL_FROM_ACTIVITY), undefined, new Label(toFont({ size: 14.2, isStrikeThrough: true }), undefined));
      expect(computeStyle(edge)).toEqual('sequenceFlow;conditional_from_activity;fontSize=14.2;fontStyle=8');
    });

    it('compute style of edge with label including underline font', () => {
      const edge = new Edge('id', newSequenceFlow(SequenceFlowKind.DEFAULT), undefined, new Label(toFont({ isUnderline: true }), undefined));
      expect(computeStyle(edge)).toEqual('sequenceFlow;default;fontStyle=4');
    });

    it('compute style of edge with label including bold/italic/strike-through/underline font', () => {
      const edge = new Edge(
        'id',
        newSequenceFlow(SequenceFlowKind.NORMAL),
        undefined,
        new Label(toFont({ isBold: true, isItalic: true, isStrikeThrough: true, isUnderline: true }), undefined),
      );
      expect(computeStyle(edge)).toEqual('sequenceFlow;normal;fontStyle=15');
    });

    it('compute style of edge with label bounds', () => {
      const edge = new Edge('id', newSequenceFlow(SequenceFlowKind.NORMAL), undefined, new Label(toFont({ name: 'Helvetica' }), newBounds(100)));
      expect(computeStyle(edge)).toEqual('sequenceFlow;normal;fontFamily=Helvetica;verticalAlign=top;align=center');
    });
  });

  each([
    [SequenceFlowKind.CONDITIONAL_FROM_GATEWAY, 'conditional_from_gateway'],
    [SequenceFlowKind.CONDITIONAL_FROM_ACTIVITY, 'conditional_from_activity'],
    [SequenceFlowKind.DEFAULT, 'default'],
    [SequenceFlowKind.NORMAL, 'normal'],
  ]).it('compute style - sequence flows: %s', (kind, expected) => {
    const edge = new Edge('id', newSequenceFlow(kind));
    expect(computeStyle(edge)).toEqual(`sequenceFlow;${expected}`);
  });

  each([
    [TAssociationDirection.None, 'None'],
    [TAssociationDirection.One, 'One'],
    [TAssociationDirection.Both, 'Both'],
  ]).it('compute style - association flows: %s', (kind, expected) => {
    const edge = new Edge('id', newAssociationFlow(kind));
    expect(computeStyle(edge)).toEqual(`association;${expected}`);
  });

  each([
    [MessageVisibleKind.nonInitiating, 'non_initiating'],
    [MessageVisibleKind.initiating, 'initiating'],
  ]).it('compute style - message flow icon: %s', (messageVisibleKind, expected) => {
    const edge = new Edge('id', newMessageFlow(), undefined, undefined, messageVisibleKind);
    expect(styleConfigurator.computeMessageFlowIconStyle(edge)).toEqual(`shape=bpmn.messageFlowIcon;bpmn.isInitiating=${expected}`);
  });

  describe('compute style - events kind', () => {
    it('intermediate catch conditional', () => {
      const shape = newShape(newShapeBpmnEvent(ShapeBpmnElementType.EVENT_INTERMEDIATE_CATCH, ShapeBpmnEventType.CONDITIONAL), newLabel({ name: 'Ubuntu' }));
      expect(computeStyle(shape)).toEqual('intermediateCatchEvent;bpmn.eventKind=conditional;fontFamily=Ubuntu');
    });

    it('start signal', () => {
      const shape = newShape(newShapeBpmnEvent(ShapeBpmnElementType.EVENT_START, ShapeBpmnEventType.SIGNAL), newLabel({ isBold: true }));
      expect(computeStyle(shape)).toEqual('startEvent;bpmn.eventKind=signal;fontStyle=1');
    });
  });
  describe('compute style - boundary events', () => {
    it('interrupting message', () => {
      const shape = newShape(newShapeBpmnBoundaryEvent(ShapeBpmnEventType.MESSAGE, true), newLabel({ name: 'Arial' }));
      expect(computeStyle(shape)).toEqual('boundaryEvent;bpmn.eventKind=message;bpmn.isInterrupting=true;fontFamily=Arial');
    });

    it('non interrupting timer', () => {
      const shape = newShape(newShapeBpmnBoundaryEvent(ShapeBpmnEventType.TIMER, false), newLabel({ isItalic: true }));
      expect(computeStyle(shape)).toEqual('boundaryEvent;bpmn.eventKind=timer;bpmn.isInterrupting=false;fontStyle=2');
    });

    it('cancel with undefined interrupting value', () => {
      const shape = newShape(newShapeBpmnBoundaryEvent(ShapeBpmnEventType.CANCEL, undefined), newLabel({ isStrikeThrough: true }));
      expect(computeStyle(shape)).toEqual('boundaryEvent;bpmn.eventKind=cancel;bpmn.isInterrupting=true;fontStyle=8');
    });
  });

  describe('compute style - event sub-process start event', () => {
    it('interrupting message', () => {
      const shape = newShape(newShapeBpmnStartEvent(ShapeBpmnEventType.MESSAGE, true), newLabel({ name: 'Arial' }));
      expect(computeStyle(shape)).toEqual('startEvent;bpmn.eventKind=message;bpmn.isInterrupting=true;fontFamily=Arial');
    });

    it('non interrupting timer', () => {
      const shape = newShape(newShapeBpmnStartEvent(ShapeBpmnEventType.TIMER, false), newLabel({ isItalic: true }));
      expect(computeStyle(shape)).toEqual('startEvent;bpmn.eventKind=timer;bpmn.isInterrupting=false;fontStyle=2');
    });

    it('cancel with undefined interrupting value', () => {
      const shape = newShape(newShapeBpmnStartEvent(ShapeBpmnEventType.CANCEL, undefined), newLabel({ isStrikeThrough: true }));
      expect(computeStyle(shape)).toEqual('startEvent;bpmn.eventKind=cancel;fontStyle=8');
    });
  });

  describe('compute style - sub-processes', () => {
    describe.each([
      ['expanded', []],
      ['collapsed', [ShapeBpmnMarkerType.EXPAND]],
    ])(`compute style - %s sub-processes`, (expandKind, markers: ShapeBpmnMarkerType[]) => {
      it(`${expandKind} embedded sub-process without label bounds`, () => {
        const shape = newShape(newShapeBpmnSubProcess(ShapeBpmnSubProcessKind.EMBEDDED, markers), newLabel({ name: 'Arial' }));
        const additionalMarkerStyle = markers.includes(ShapeBpmnMarkerType.EXPAND) ? ';bpmn.markers=expand' : '';
        const additionalTerminalStyle = !markers.includes(ShapeBpmnMarkerType.EXPAND) ? ';verticalAlign=top' : '';
        expect(computeStyle(shape)).toEqual(`subProcess;bpmn.subProcessKind=embedded${additionalMarkerStyle};fontFamily=Arial${additionalTerminalStyle}`);
      });

      it(`${expandKind} embedded sub-process with label bounds`, () => {
        const shape = newShape(newShapeBpmnSubProcess(ShapeBpmnSubProcessKind.EMBEDDED, markers), newLabel({ name: 'sans-serif' }, newBounds(300)));
        const additionalMarkerStyle = markers.includes(ShapeBpmnMarkerType.EXPAND) ? ';bpmn.markers=expand' : '';
        expect(computeStyle(shape)).toEqual(
          `subProcess;bpmn.subProcessKind=embedded${additionalMarkerStyle};fontFamily=sans-serif;verticalAlign=top;align=center;labelWidth=301;labelPosition=top;verticalLabelPosition=left`,
        );
      });
    });
  });

  describe('compute style - call activities', () => {
    describe.each([
      ['expanded', []],
      ['collapsed', [ShapeBpmnMarkerType.EXPAND]],
    ])(`compute style - %s call activities`, (expandKind, markers: ShapeBpmnMarkerType[]) => {
      it(`${expandKind} call activity without label bounds`, () => {
        const shape = newShape(newShapeBpmnCallActivity(markers), newLabel({ name: 'Arial' }));
        const additionalMarkerStyle = markers.includes(ShapeBpmnMarkerType.EXPAND) ? ';bpmn.markers=expand' : '';
        const additionalTerminalStyle = !markers.includes(ShapeBpmnMarkerType.EXPAND) ? ';verticalAlign=top' : '';
        expect(computeStyle(shape)).toEqual(`callActivity${additionalMarkerStyle};fontFamily=Arial${additionalTerminalStyle}`);
      });

      it(`${expandKind} call activity with label bounds`, () => {
        const shape = newShape(newShapeBpmnCallActivity(markers), newLabel({ name: 'sans-serif' }, newBounds(300)));
        const additionalMarkerStyle = markers.includes(ShapeBpmnMarkerType.EXPAND) ? ';bpmn.markers=expand' : '';
        expect(computeStyle(shape)).toEqual(
          `callActivity${additionalMarkerStyle};fontFamily=sans-serif;verticalAlign=top;align=center;labelWidth=301;labelPosition=top;verticalLabelPosition=left`,
        );
      });
    });
  });

  describe('compute style - receive tasks', () => {
    it.each([
      ['non-instantiating', false],
      ['instantiating', true],
    ])('%s receive task', (instantiatingKind: string, instantiate: boolean) => {
      const shape = newShape(newShapeBpmnActivity(ShapeBpmnElementType.TASK_RECEIVE, undefined, instantiate), newLabel({ name: 'Arial' }));
      expect(computeStyle(shape)).toEqual(`receiveTask;bpmn.isInstantiating=${instantiate};fontFamily=Arial`);
    });
  });

  describe('compute style - text annotation', () => {
    it('without label', () => {
      const shape = newShape(newShapeBpmnElement(ShapeBpmnElementType.TEXT_ANNOTATION));
      expect(computeStyle(shape)).toEqual('textAnnotation');
    });
    it('with label bounds', () => {
      const shape = newShape(newShapeBpmnElement(ShapeBpmnElementType.TEXT_ANNOTATION), newLabel({ name: 'Segoe UI' }, newBounds(100)));
      expect(computeStyle(shape)).toEqual('textAnnotation;fontFamily=Segoe UI;verticalAlign=top;labelWidth=101;labelPosition=top;verticalLabelPosition=left');
    });
  });

  describe('compute style - pool references a Process', () => {
    it.each([
      ['vertical', false, '1'],
      ['horizontal', true, '0'],
    ])('%s pool references a Process', (title, isHorizontal: boolean, expected: string) => {
      const shape = newShape(newShapeBpmnElement(ShapeBpmnElementType.POOL), undefined, isHorizontal);
      expect(computeStyle(shape)).toEqual(`pool;horizontal=${expected}`);
    });
  });

  describe('compute style - lane', () => {
    it.each([
      ['vertical', false, '1'],
      ['horizontal', true, '0'],
    ])('%s lane', (title, isHorizontal: boolean, expected: string) => {
      const shape = newShape(newShapeBpmnElement(ShapeBpmnElementType.LANE), undefined, isHorizontal);
      expect(computeStyle(shape)).toEqual(`lane;horizontal=${expected}`);
    });
  });

  describe.each([
    [ShapeBpmnElementType.CALL_ACTIVITY],
    [ShapeBpmnElementType.SUB_PROCESS],
    [ShapeBpmnElementType.TASK],
    [ShapeBpmnElementType.TASK_SERVICE],
    [ShapeBpmnElementType.TASK_USER],
    [ShapeBpmnElementType.TASK_RECEIVE],
    [ShapeBpmnElementType.TASK_SEND],
    [ShapeBpmnElementType.TASK_MANUAL],
    [ShapeBpmnElementType.TASK_SCRIPT],
    [ShapeBpmnElementType.TASK_BUSINESS_RULE],

    // TODO: To uncomment when it's supported
    //[ShapeBpmnElementType.AD_HOC_SUB_PROCESS],
    //[ShapeBpmnElementType.TRANSACTION],
  ])('compute style - markers for %s', (bpmnKind: ShapeBpmnElementType) => {
    describe.each([[ShapeBpmnMarkerType.LOOP], [ShapeBpmnMarkerType.MULTI_INSTANCE_SEQUENTIAL], [ShapeBpmnMarkerType.MULTI_INSTANCE_PARALLEL]])(
      `compute style - %s marker for ${bpmnKind}`,
      (markerKind: ShapeBpmnMarkerType) => {
        it(`${bpmnKind} with ${markerKind} marker`, () => {
          const shape = newShape(newShapeBpmnActivity(bpmnKind, [markerKind]), newLabel({ name: 'Arial' }));
          const additionalReceiveTaskStyle = bpmnKind === ShapeBpmnElementType.TASK_RECEIVE ? ';bpmn.isInstantiating=false' : '';
          expect(computeStyle(shape)).toEqual(`${bpmnKind}${additionalReceiveTaskStyle};bpmn.markers=${markerKind};fontFamily=Arial`);
        });

        if (bpmnKind == ShapeBpmnElementType.SUB_PROCESS) {
          it(`${bpmnKind} with Loop & Expand (collapsed) markers`, () => {
            const shape = newShape(newShapeBpmnSubProcess(ShapeBpmnSubProcessKind.EMBEDDED, [markerKind, ShapeBpmnMarkerType.EXPAND]));
            expect(computeStyle(shape)).toEqual(`subProcess;bpmn.subProcessKind=embedded;bpmn.markers=${markerKind},expand`);
          });
        }

        if (bpmnKind == ShapeBpmnElementType.CALL_ACTIVITY) {
          it(`${bpmnKind} with Loop & Expand (collapsed) markers`, () => {
            const shape = newShape(newShapeBpmnCallActivity([markerKind, ShapeBpmnMarkerType.EXPAND]));
            expect(computeStyle(shape)).toEqual(`callActivity;bpmn.markers=${markerKind},expand`);
          });
        }
      },
    );
  });
});
