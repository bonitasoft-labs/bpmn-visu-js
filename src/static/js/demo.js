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
import { documentReady, handleFileSelect, startBpmnVisualization, FitType, updateFitType } from '../../index.es.js';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function startDemo() {
  startBpmnVisualization({ container: 'graph', loadOptions: { fitType: FitType[fitTypeSelected.value] } });
  document.getElementById('bpmn-file').addEventListener('change', handleFileSelect, false);
  fitTypeSelected.addEventListener('change', updateFitTypeSelection, false);

  const parameters = new URLSearchParams(window.location.search);
  if (!(parameters.get('hideControls') === 'true')) {
    document.getElementById('controls').classList.remove('hidden');
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function updateFitTypeSelection(event) {
  updateFitType(event);

  if (event.target.value === 'None') {
    resetClass(container);
  } else {
    setFixedSizeClass(container);
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function setFixedSizeClass(htmlElementId) {
  const htmlElement = document.getElementById(htmlElementId);
  htmlElement.classList.add('fixed-size');
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function resetClass(htmlElementId) {
  const htmlElement = document.getElementById(htmlElementId);
  htmlElement.classList.remove('fixed-size');
}

// Update the selected option at the initialization
const parameters = new URLSearchParams(window.location.search);
const parameterFitType = parameters.get('fitType');

const fitTypeSelected = document.getElementById('fitType-selected');
if (parameterFitType) {
  fitTypeSelected.value = parameterFitType;
}

if (fitTypeSelected.value !== 'None') {
  setFixedSizeClass('graph');
}

// Start
documentReady(startDemo);
