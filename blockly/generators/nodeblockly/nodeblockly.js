
'use strict';

goog.require('Blockly.JavaScript');

Blockly.JavaScript.LastOrder = Blockly.JavaScript.ORDER_ATOMIC;

Blockly.JavaScript['node_out'] = function (block) {
    var dropdown_bit = block.getFieldValue('ACTION');
    var arg0 = Blockly.JavaScript.valueToCode(block, 'ACTION',
        Blockly.JavaScript.ORDER_NONE) || 'NULL';
    Blockly.JavaScript.LastOrder = Blockly.JavaScript.ORDER_NONE;
    return dropdown_bit + ' = ' + arg0 + ';\n';
};


Blockly.JavaScript['node_in'] = function (block) {
    var order = Blockly.JavaScript.ORDER_ATOMIC;
    var dropdown_bit = block.getFieldValue('SENSOR');
    var code = dropdown_bit;
    Blockly.JavaScript.LastOrder = order;
    return [code, order];
};


Blockly.JavaScript['node_2gate'] = function (block) {
    var operator = block.getFieldValue('GTYPE');
    var order = (operator == "and") ? Blockly.JavaScript.ORDER_LOGICAL_AND :
        (operator == "or") ? Blockly.JavaScript.ORDER_LOGICAL_OR :
            (operator == "xor") ? Blockly.JavaScript.ORDER_LOGICAL_XOR :
                Blockly.JavaScript.ORDER_NONE;
    var arg0 = Blockly.JavaScript.valueToCode(block, 'ARG0', order) || 'NULL';
    var arg1 = Blockly.JavaScript.valueToCode(block, 'ARG1', order) || 'NULL';
    var code = arg0 + ' ' + operator + ' ' + arg1;
    Blockly.JavaScript.LastOrder = order;
    return [code, order];
};



Blockly.JavaScript['node_1gate'] = function (block) {
    var operator = block.getFieldValue('GTYPE');
    var order = (operator == "not") ? Blockly.JavaScript.ORDER_LOGICAL_NOT : 
        Blockly.JavaScript.ORDER_ATOMIC;
    var arg0 = Blockly.JavaScript.valueToCode(block, 'ARG0', order) || 'NULL';
    var code = operator + ' ' + arg0;
    return [code, order];
};



Blockly.JavaScript['node_confrom'] = function (block) {
    //NOP
    return null;
};



Blockly.JavaScript['node_conto'] = function (block) {
    var con_in = block.getConFrom();
    var code_in = Blockly.JavaScript.valueToCode(con_in, 'ARG0',
        Blockly.JavaScript.ORDER_ATOMIC, true);
    var code = code_in;
    return [code, Blockly.JavaScript.LastOrder];
};


