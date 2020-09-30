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
import { ShapeBaseElementType } from '../../../../../src/model/bpmn/internal/shape/ShapeBpmnElementType';
import { parseJsonAndExpectOnlyFlowNodes, verifyShape } from './JsonTestUtils';
import { TProcess } from '../../../../../src/model/bpmn/json/baseElement/rootElement/rootElement';
import { TMultiInstanceLoopCharacteristics, TStandardLoopCharacteristics } from '../../../../../src/model/bpmn/json/baseElement/loopCharacteristics';
import { BpmnMarkerType } from '../../../../../src/model/bpmn/internal/shape/ShapeBpmnMarkerType';
import { CallActivityType } from '../../../../../src/model/bpmn/internal/shape/ShapeBpmnCallActivityType';

describe.each([
  ['callActivity', ShapeBaseElementType.CALL_ACTIVITY],
  ['subProcess', ShapeBaseElementType.SUB_PROCESS],
  ['task', ShapeBaseElementType.TASK],
  ['serviceTask', ShapeBaseElementType.TASK_SERVICE],
  ['userTask', ShapeBaseElementType.TASK_USER],
  ['receiveTask', ShapeBaseElementType.TASK_RECEIVE],
  ['sendTask', ShapeBaseElementType.TASK_SEND],
  ['manualTask', ShapeBaseElementType.TASK_MANUAL],
  ['scriptTask', ShapeBaseElementType.TASK_SCRIPT],

  // TODO: To uncomment when it's supported
  ['businessRuleTask', ShapeBpmnElementKind.TASK_BUSINESS_RULE],
  //['adHocSubProcess', ShapeBpmnElementKind.AD_HOC_SUB_PROCESS],
  //['transaction', ShapeBpmnElementKind.TRANSACTION],
])(`parse bpmn as json for '%s'`, (bpmnKind: string, expectedShapeBpmnElementKind: ShapeBaseElementType) => {
  describe.each([
    ['standardLoopCharacteristics', BpmnMarkerType.LOOP],
    ['multiInstanceLoopCharacteristics', BpmnMarkerType.MULTI_INSTANCE_PARALLEL],
  ])(`parse bpmn as json for '${bpmnKind}' with '%s'`, (bpmnLoopCharacteristicsKind: string, expectedMarkerKind: BpmnMarkerType) => {
    it.each([
      ['empty string', ''],
      ['empty object', {}],
      ['array with empty string & object', ['', {}]],
    ])(
      `should convert as Shape with ${expectedMarkerKind} marker, when '${bpmnLoopCharacteristicsKind}' is an attribute (as %s) of '${bpmnKind}' and BPMNShape is expanded`,
      (
        title: string,
        loopCharacteristics:
          | string
          | TStandardLoopCharacteristics
          | TMultiInstanceLoopCharacteristics
          | (string | TStandardLoopCharacteristics | TMultiInstanceLoopCharacteristics)[],
      ) => {
        const json = {
          definitions: {
            targetNamespace: '',
            process: {},
            BPMNDiagram: {
              name: 'process 0',
              BPMNPlane: {
                BPMNShape: {
                  id: `shape_${bpmnKind}_id_0`,
                  bpmnElement: `${bpmnKind}_id_0`,
                  Bounds: { x: 362, y: 232, width: 36, height: 45 },
                  isExpanded: true,
                },
              },
            },
          },
        };
        (json.definitions.process as TProcess)[bpmnKind] = {
          id: `${bpmnKind}_id_0`,
          name: `${bpmnKind} name`,
        };
        (json.definitions.process as TProcess)[bpmnKind][bpmnLoopCharacteristicsKind] = loopCharacteristics;

        const model = parseJsonAndExpectOnlyFlowNodes(json, 1);

        verifyShape(model.flowNodes[0], {
          shapeId: `shape_${bpmnKind}_id_0`,
          bpmnElementId: `${bpmnKind}_id_0`,
          bpmnElementName: `${bpmnKind} name`,
          bpmnElementType: expectedShapeBpmnElementKind,
          bpmnElementMarkers: [expectedMarkerKind],
          bpmnElementCallActivityType: expectedShapeBpmnElementKind === ShapeBaseElementType.CALL_ACTIVITY ? CallActivityType.CALLING_PROCESS : undefined,
          bounds: {
            x: 362,
            y: 232,
            width: 36,
            height: 45,
          },
        });
      },
    );

    if (expectedShapeBpmnElementKind === ShapeBaseElementType.SUB_PROCESS) {
      it(`should convert as Shape with ${expectedMarkerKind} & expand markers, when '${bpmnLoopCharacteristicsKind}' is an attribute of '${bpmnKind}' and BPMNShape is NOT expanded`, () => {
        const json = {
          definitions: {
            targetNamespace: '',
            process: {},
            BPMNDiagram: {
              name: 'process 0',
              BPMNPlane: {
                BPMNShape: {
                  id: `shape_${bpmnKind}_id_0`,
                  bpmnElement: `${bpmnKind}_id_0`,
                  Bounds: { x: 362, y: 232, width: 36, height: 45 },
                  isExpanded: false,
                },
              },
            },
          },
        };
        (json.definitions.process as TProcess)[bpmnKind] = {
          id: `${bpmnKind}_id_0`,
          name: `${bpmnKind} name`,
        };
        (json.definitions.process as TProcess)[bpmnKind][bpmnLoopCharacteristicsKind] = '';

        const model = parseJsonAndExpectOnlyFlowNodes(json, 1);

        verifyShape(model.flowNodes[0], {
          shapeId: `shape_${bpmnKind}_id_0`,
          bpmnElementId: `${bpmnKind}_id_0`,
          bpmnElementName: `${bpmnKind} name`,
          bpmnElementType: expectedShapeBpmnElementKind,
          bpmnElementMarkers: [expectedMarkerKind, BpmnMarkerType.EXPAND],
          bounds: {
            x: 362,
            y: 232,
            width: 36,
            height: 45,
          },
        });
      });
    }
  });
  describe.each([
    [true, BpmnMarkerType.MULTI_INSTANCE_SEQUENTIAL],
    [false, BpmnMarkerType.MULTI_INSTANCE_PARALLEL],
  ])(`parse bpmn as json for '${bpmnKind}' with 'multiInstanceLoopCharacteristics'`, (isSequential: boolean, expectedMarkerKind: BpmnMarkerType) => {
    it.each([
      ['object', { isSequential }],
      ['array with object', [{ isSequential }]],
    ])(
      `should convert as Shape with ${expectedMarkerKind} marker, when 'isSequential' is an attribute (as ${isSequential}) of 'multiInstanceLoopCharacteristics' (as %s) of '${bpmnKind}'  and BPMNShape is expanded`,
      (title: string, loopCharacteristics: TMultiInstanceLoopCharacteristics | TMultiInstanceLoopCharacteristics[]) => {
        const json = {
          definitions: {
            targetNamespace: '',
            process: {},
            BPMNDiagram: {
              name: 'process 0',
              BPMNPlane: {
                BPMNShape: {
                  id: `shape_${bpmnKind}_id_0`,
                  bpmnElement: `${bpmnKind}_id_0`,
                  Bounds: { x: 362, y: 232, width: 36, height: 45 },
                  isExpanded: true,
                },
              },
            },
          },
        };
        (json.definitions.process as TProcess)[bpmnKind] = {
          id: `${bpmnKind}_id_0`,
          name: `${bpmnKind} name`,
          multiInstanceLoopCharacteristics: loopCharacteristics,
        };

        const model = parseJsonAndExpectOnlyFlowNodes(json, 1);

        verifyShape(model.flowNodes[0], {
          shapeId: `shape_${bpmnKind}_id_0`,
          bpmnElementId: `${bpmnKind}_id_0`,
          bpmnElementName: `${bpmnKind} name`,
          bpmnElementType: expectedShapeBpmnElementKind,
          bpmnElementMarkers: [expectedMarkerKind],
          bpmnElementCallActivityType: expectedShapeBpmnElementKind === ShapeBaseElementType.CALL_ACTIVITY ? CallActivityType.CALLING_PROCESS : undefined,
          bounds: {
            x: 362,
            y: 232,
            width: 36,
            height: 45,
          },
        });
      },
    );

    if (expectedShapeBpmnElementKind === ShapeBaseElementType.SUB_PROCESS || expectedShapeBpmnElementKind === ShapeBaseElementType.CALL_ACTIVITY) {
      it(`should convert as Shape with ${expectedMarkerKind} & expand markers, when 'isSequential' is an attribute (as ${isSequential}) of 'multiInstanceLoopCharacteristics' of '${bpmnKind}' and BPMNShape is NOT expanded`, () => {
        const json = {
          definitions: {
            targetNamespace: '',
            process: {},
            BPMNDiagram: {
              name: 'process 0',
              BPMNPlane: {
                BPMNShape: {
                  id: `shape_${bpmnKind}_id_0`,
                  bpmnElement: `${bpmnKind}_id_0`,
                  Bounds: { x: 362, y: 232, width: 36, height: 45 },
                  isExpanded: false,
                },
              },
            },
          },
        };
        (json.definitions.process as TProcess)[bpmnKind] = {
          id: `${bpmnKind}_id_0`,
          name: `${bpmnKind} name`,
          multiInstanceLoopCharacteristics: { isSequential },
        };

        const model = parseJsonAndExpectOnlyFlowNodes(json, 1);

        verifyShape(model.flowNodes[0], {
          shapeId: `shape_${bpmnKind}_id_0`,
          bpmnElementId: `${bpmnKind}_id_0`,
          bpmnElementName: `${bpmnKind} name`,
          bpmnElementType: expectedShapeBpmnElementKind,
          bpmnElementMarkers: [expectedMarkerKind, BpmnMarkerType.EXPAND],
          bpmnElementCallActivityType: expectedShapeBpmnElementKind === ShapeBaseElementType.CALL_ACTIVITY ? CallActivityType.CALLING_PROCESS : undefined,
          bounds: {
            x: 362,
            y: 232,
            width: 36,
            height: 45,
          },
        });
      });
    }
  });
});
