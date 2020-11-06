/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview NodeBlockly-DT blocks for Blockly.
 *
 * @author matejsuchane@post.cz
 */

goog.provide('Blockly.Constants.NodeBlockly');
goog.provide('Blockly.Constants.NodeBlockly.Colour');


Blockly.Constants.NodeBlockly.Colour.Input = "#d85700";
Blockly.Constants.NodeBlockly.Colour.Output = "#a31c2c";
Blockly.Constants.NodeBlockly.Colour.Gate = "#3734a9";
Blockly.Constants.NodeBlockly.Colour.Connection = "#7a7a7a";
Blockly.Constants.NodeBlockly.CreateConFieldName = "$CONMOD";


Blockly.Blocks['node_out'] = {
    init: function () {
        this.appendValueInput("ACTION")
            .setCheck("Boolean")
            .appendField(new Blockly.FieldDropdown([["0", "ACTION_0"], ["1", "ACTION_1"], ["2", "ACTION_2"], ["3", "ACTION_3"]]), "ACTION")  
            .appendField("ACTION");
        this.setColour(Blockly.Constants.NodeBlockly.Colour.Output);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['node_in'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["0", "SENSOR_0"], ["1", "SENSOR_1"], ["2", "SENSOR_2"], ["3", "SENSOR_3"]]), "SENSOR")   
            .appendField("SENSOR");
        this.setInputsInline(false);
        this.setOutput(true, "Boolean");
        this.setColour(Blockly.Constants.NodeBlockly.Colour.Input);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setCanCreateCons(true);
    }
};

Blockly.Blocks['node_2gate'] = {
    init: function () {
        this.appendValueInput("ARG0")
            .setCheck("Boolean")
            .appendField(new Blockly.FieldDropdown([["AND", "and"], ["OR", "or"],
            ["XOR", "xor"]]), "GTYPE");
        this.appendValueInput("ARG1")
            .setCheck("Boolean");
        this.setInputsInline(false);
        this.setOutput(true, "Boolean");
        this.setColour(Blockly.Constants.NodeBlockly.Colour.Gate);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setCanCreateCons(true);
    }
};

Blockly.Blocks['node_1gate'] = {
    init: function () {
        this.appendValueInput("ARG0")
            .setCheck("Boolean")
            .appendField(new Blockly.FieldDropdown([["NOT", "not"]]), "GTYPE");
        this.setInputsInline(false);
        this.setOutput(true, "Boolean");
        this.setColour(Blockly.Constants.NodeBlockly.Colour.Gate);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setCanCreateCons(true);
    }
};

Blockly.Blocks['node_confrom'] = {
    init: function () {
        this.appendValueInput("ARG0")
            .setCheck("Boolean");
        this.setInputsInline(false);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setColour(Blockly.Constants.NodeBlockly.Colour.Connection);
    }
};

Blockly.Blocks['node_conto'] = {
    init: function () {
        this.setInputsInline(false);
        this.setOutput(true, "Boolean");
        this.setTooltip("");
        this.setHelpUrl("");
        this.setColour(Blockly.Constants.NodeBlockly.Colour.Connection);
    }
};