import type { FormikProps } from 'formik';
import React, { useState } from 'react';

import { HelpField, TextAreaInput } from '@spinnaker/core';
import type { ICloudrunServerGroupCommandData } from '../serverGroupCommandBuilder.service';

export interface IServerGroupConfigFilesSettingsProps {
  configFiles: string[];
  onEnterConfig: (file: string[]) => void;
}
type configFiles = IServerGroupConfigFilesSettingsProps['configFiles'];

export function ServerGroupConfigFilesSettings({ configFiles, onEnterConfig }: IServerGroupConfigFilesSettingsProps) {
  const [configValues, setConfigValues] = useState<configFiles>(configFiles);

  /*   const deleteConfig = (i: number) => {
      const newConfigValues = [...configValues];
      newConfigValues.splice(i, 1);
      setConfigValues(newConfigValues);
      onEnterConfig(newConfigValues);
    }; */
  function mapTabToSpaces(event: any, i: number) {
    if (event.which === 9) {
      event.preventDefault();
      const cursorPosition = event.target.selectionStart;
      const inputValue = event.target.value;
      event.target.value = `${inputValue.substring(0, cursorPosition)}  ${inputValue.substring(cursorPosition)}`;
      event.target.selectionStart += 2;
    }
    const newConfigValues = [...configValues];
    newConfigValues[i] = event.target.value;
    setConfigValues(newConfigValues);
    onEnterConfig(newConfigValues);
  }

  /*  const addConfigFile = () => {
     const newConfigValues = [...configValues];
     newConfigValues.push('');
     setConfigValues(newConfigValues);
     onEnterConfig(newConfigValues);
   }; */

  return (
    <div className="form-horizontal">
      <div className="form-group">
        {configValues.map((configFile, index) => (
          <>
            <div className="col-md-3 sm-label-right">
              Service Yaml
              <HelpField id="cloudrun.serverGroup.configFiles" />{' '}
            </div>
            <div className="col-md-7" key={index}>
              <TextAreaInput
                name={'text' + index}
                value={configFile}
                rows={6}
                onChange={(e) => mapTabToSpaces(e, index)}
              />
            </div>
            {/* Not reqiured right now as we do not have support deploy multiple services*/}
            {/*   <div className="col-md-1">
              <button type="button" className="btn btn-sm btn-default" onClick={() => deleteConfig(index)}>
                <span className="glyphicon glyphicon-trash" /> Delete
              </button>
            </div> */}
          </>
        ))}
      </div>
      {/* Not reqiured right now as we do not have support deploy multiple services*/}
      {/*    <div className="col-md-7 col-md-offset-3">
        <button type="button" className="btn btn-block btn-add-trigger add-new" onClick={addConfigFile}>
          <span className="glyphicon glyphicon-plus-sign" /> Add Config File
        </button>
      </div> */}
    </div>
  );
}

export interface IWizardServerGroupConfigFilesSettingsProps {
  formik: FormikProps<ICloudrunServerGroupCommandData>;
}

export class WizardServerGroupConfigFilesSettings extends React.Component<IWizardServerGroupConfigFilesSettingsProps> {
  private configUpdated = (configFiles: string[]): void => {
    const { formik } = this.props;
    formik.values.command.configFiles = configFiles;
    formik.setFieldValue('configFiles', configFiles);
  };

  // yaml config files input from server group wizard
  public render() {
    const { formik } = this.props;
    return (
      <ServerGroupConfigFilesSettings
        configFiles={formik.values.configFiles || formik.values.command.configFiles}
        onEnterConfig={this.configUpdated}
      />
    );
  }
}
