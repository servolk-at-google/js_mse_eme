/*
Copyright 2015 Google Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
'use strict';

var TestView = (function() {

var createElement = util.createElement;

var createAnchor = function(text, id) {
  return util.createElement('a', id, 'rightmargin20', text);
};

var createOption = function(text, value) {
  var option = document.createElement('option');
  option.text = text;
  option.value = value;
  return option;
};

function TestView(mseSpec) {
  this.mseSpec = mseSpec;
  this.testList = null;

  var selectors = [];
  var switches = [];
  var commands = [];
  var testSuites = [];
  var links = [];

  this.addSelector = function(text, optionTexts, values, callback) {
    optionTexts = optionTexts instanceof Array ? optionTexts : [optionTexts];
    values = values instanceof Array ? values : [values];

    if (optionTexts.length !== values.length)
      throw "text length and value length don't match!";

    selectors.push({
      'text': text,
      'optionTexts': optionTexts,
      'values': values,
      'cb': callback
    })
  };

  this.addSwitch = function(text, id) {
    switches.push({text: text, id: id});
  };

  this.addCommand = function(text, id, title, onclick) {
    commands.push({text: text, id: id, title: title, onclick: onclick});
  };

  this.addTestSuite = function(text, href) {
    testSuites.push({text: text, href: href});
  };

  this.addTestSuites = function(testTypes) {
    var isTestTypeSupported = function(testType) {
      var supported = testTypes[testType].supported;
      if (typeof supported === 'string' && supported == 'all') {
        return true;
      } else if (typeof supported === 'object') {
        for (var index in supported) {
          if (supported[index] == mseSpec) {
            return true;
          }
        }
      }
      return false;
    };

    for (var testType in testTypes) {
      if (testType !== currentTestType && isTestTypeSupported(testType)) {
        this.addTestSuite(testTypes[testType].name, '?test_type=' + testType);
      }
    }
  }

  this.addLink = function(text, href) {
    links.push({text: text, href: href});
  };

  this.generate = function() {
    var heading = '[' + this.mseSpec + '] ' +
        testTypes[currentTestType].heading + ' (v REVISION)';
    document.title = testTypes[currentTestType].title;
    document.body.appendChild(createElement('h3', 'title', null, heading));
    document.body.appendChild(createElement('h4', 'info'));
    document.body.appendChild(createElement('h4', 'usage'));
    document.body.appendChild(createElement('div', 'testview'));

    var div = document.getElementById(this.divId);
    div.innerHTML = '';
    div.appendChild(createElement('div', 'testsuites', 'container'));
    div.appendChild(createElement('div', 'switches', 'container'));
    div.appendChild(createElement('div', 'controls', 'container'));

    var testContainer = createElement('div', null, 'container');
    testContainer.appendChild(createElement('div', 'testlist', 'box-left'));
    testContainer.appendChild(createElement('div', 'testarea'));
    div.appendChild(testContainer);

    var outputArea = createElement('div', 'outputarea');
    var textArea = createElement('textarea', 'output');
    textArea.rows = 10;
    textArea.cols = 80;
    outputArea.appendChild(textArea);
    div.appendChild(outputArea);

    var switchDiv = document.getElementById('switches');
    for (var i = 0; i < switches.length; ++i) {
      var id = switches[i].id;
      switchDiv.appendChild(document.createTextNode(switches[i].text));
      switchDiv.appendChild(createAnchor(window[id] ? 'on' : 'off', id));
      switchDiv.lastChild.href = 'javascript:;';
      switchDiv.lastChild.onclick = (function(id) {
        return function(e) {
          var wasOff = e.target.innerHTML === 'off';
          e.target.innerHTML = wasOff ? 'on' : 'off';
          window[id] = wasOff;
        };
      })(id);
    }
    for (var i = 0; i < selectors.length; ++i) {
      switchDiv.appendChild(document.createTextNode(selectors[i].text));
      var select = document.createElement('select');
      for (var j = 0; j < selectors[i].optionTexts.length; ++j) {
        select.appendChild(createOption(selectors[i].optionTexts[j],
            selectors[i].values[j]));
      }
      select.onchange = selectors[i].cb;
      switchDiv.appendChild(select);
    }

    switchDiv.appendChild(
        createElement('span', 'finish-count', null, '0 tests finished'));

    var controlsDiv = document.getElementById('controls');
    for (var i = 0; i < commands.length; ++i) {
      controlsDiv.appendChild(createAnchor(commands[i].text, commands[i].id));
      controlsDiv.lastChild.href = 'javascript:;';
      controlsDiv.lastChild.onclick = commands[i].onclick;
      controlsDiv.lastChild.title = commands[i].title;
    }

    for (var i = 0; i < links.length; ++i) {
      controlsDiv.appendChild(createAnchor(links[i].text));
      controlsDiv.lastChild.href = links[i].href;
    }

    var testSuitesDiv = document.getElementById('testsuites');
    for (var i = 0; i < testSuites.length; ++i) {
      testSuitesDiv.appendChild(createAnchor(testSuites[i].text));
      testSuitesDiv.lastChild.href = testSuites[i].href;
    }

    this.testList.generate(document.getElementById('testlist'));
  };

  this.addTest = function(desc) {
    return this.testList.addTest(desc);
  };

  this.anySelected = function() {
    return this.testList.anySelected();
  };
};

return {
  create: function(mseSpec) {
    return new TestView(mseSpec);
  }};

})();
