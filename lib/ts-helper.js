// put in seperate file to keep main sequelize-auto clean
'use strict';

var Sequelize = require('sequelize');
var _ = Sequelize.Utils._;

function getModelFileStart(indentation, spaces, table, tableName) {
  var fileStart = "/* jshint indent: " + indentation + " */\n";
  fileStart += '// tslint:disable\n';
  fileStart += 'import * as sequelize from \'sequelize\';\n';
  fileStart += 'import { DataTypes } from \'sequelize\';\n';
  fileStart += "\nmodule.exports = function (sequelize: sequelize.Sequelize, DataTypes: DataTypes) {\n";
  fileStart += spaces + 'return sequelize.define<' + tableName + 'Instance, ' + tableName + 'Attribute>(\'' + table + '\', {\n';
  return fileStart;
}

function generateTableModels(tableNames, isSpaces, indentation, interfacePascalCase, isCamelCase, isCamelCaseForFile) {
  var spaces = '';
  for (var i = 0; i < indentation; ++i) {
    spaces += (isSpaces === true ? ' ' : "\t");
  }

  return generateImports() + generateInterface() + generateTableMapper();

  function generateImports() {
    var fileTextOutput = '// tslint:disable\n';
    fileTextOutput += 'import * as path from \'path\';\n';
    fileTextOutput += 'import * as sequelize from \'sequelize\';\n';
    fileTextOutput += '\n';
    return fileTextOutput;
  }

  function generateInterface() {
    var fileTextOutput = 'export interface ITables {\n';
    for (var i = 0; i < tableNames.length; i++) {
      var table = interfacePascalCase ? PascalCase(tableNames[i]) : tableNames[i];

      fileTextOutput += spaces + (isCamelCase ? _.camelCase(tableNames[i]) : tableNames[i]) + ': ' + table + 'Model;\n';
    }
    fileTextOutput += '}\n\n';
    return fileTextOutput;
  }

  function generateTableMapper() {
    var fileTextOutput = 'export const getModels = function (seq:sequelize.Sequelize): ITables {\n';
    fileTextOutput += spaces + 'const tables: ITables = {\n';
    for (var i = 0; i < tableNames.length; i++) {
      var tableForClass = isCamelCase ? _.camelCase(tableNames[i]) : tableNames[i];
      var tableForFile = isCamelCaseForFile ? _.camelCase(tableNames[i]) : tableNames[i];

      fileTextOutput += spaces + spaces + tableForClass + ': seq.import(path.join(__dirname, \'./' + tableForFile + '\')),\n';
    }
    fileTextOutput += spaces + '};\n';
    fileTextOutput += spaces + 'return tables;\n';
    fileTextOutput += '};\n';
    return fileTextOutput;
  }
}

exports.model = {
  getModelFileStart,
  generateTableModels
};

function getDefinitionFileStart() {
  return '// tslint:disable\nimport * as Sequelize from \'sequelize\';\n\ndeclare global {';
}

function getDefinitionFileEnd() {
  return '}\n';
}

function getTableDefinition(tsTableDefAttr, table, tableName, spaces) {
  var tableDef = '\n' + spaces + '// table: ' + table + '\n';
  tableDef += spaces + tsTableDefAttr + '\n' + spaces + '}\n';
  tableDef += spaces + 'export interface ' + tableName + 'Instance extends Sequelize.Instance<' + tableName + 'Attribute>, ' + tableName + 'Attribute { }\n';
  tableDef += spaces + 'export interface ' + tableName + 'Model extends Sequelize.Model<' + tableName + 'Instance, ' + tableName + 'Attribute> { }\n';
  return tableDef;
}

// doing this in ts helper to not clutter up main index if statement
function getMemberDefinition(spaces, fieldName, val, defaultVal, allowNull) {
  if (fieldName === undefined) return '';
  var m = '\n' + spaces + spaces + fieldName;

  if (fieldName === 'id' || allowNull === true || (!!defaultVal || defaultVal === 0)) {
    m += '?';
  }
  m += ': ';

  if (val === undefined) {
    m += 'any';
  } else if (val.indexOf('DataTypes.BOOLEAN') > -1) {
    m += 'boolean';
  } else if (val.indexOf('DataTypes.INTEGER') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.BIGINT') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.STRING') > -1) {
    m += 'string';
  } else if (val.indexOf('DataTypes.CHAR') > -1) {
    m += 'string';
  } else if (val.indexOf('DataTypes.REAL') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.TEXT') > -1) {
    m += 'string';
  } else if (val.indexOf('DataTypes.DATE') > -1) {
    m += 'Date';
  } else if (val.indexOf('DataTypes.FLOAT') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.DECIMAL') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.DOUBLE') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.UUIDV4') > -1) {
    m += 'string';
  } else if (val.indexOf('DataTypes.ENUM') > -1) {
    var reg_matches = val.match(/DataTypes\.ENUM\((.+)\)/);
    if (reg_matches && reg_matches.length > 0 && reg_matches[1] && reg_matches[1].length > 0) {
      m += reg_matches[1].split(', ').sort().join(' | ');
    } else {
      m += 'any';
    }
  } else {
    m += 'any';
  }

  if (fieldName !== 'id' && (allowNull === true || (!!defaultVal || defaultVal === 0))) {
    m += ' | null';
  }

  return m + ';';
}

function PascalCase(t) {
  const camel = _.camelCase(t);
  if (t.length < 1) { return ''; }
  return camel[0].toUpperCase() + camel.substring(1, camel.length);
}

exports.def = {
  getDefinitionFileStart,
  getDefinitionFileEnd,
  getTableDefinition,
  getMemberDefinition,
  PascalCase
};
