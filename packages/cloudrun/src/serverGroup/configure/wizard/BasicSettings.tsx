import type { FormikProps } from 'formik';
import React from 'react';
import type { IAccount } from '@spinnaker/core';
import { AccountSelectInput, HelpField } from '@spinnaker/core';
import type { ICloudrunServerGroupCommandData } from '../serverGroupCommandBuilder.service';

export interface IServerGroupBasicSettingsProps {
  accounts: IAccount[];
  onAccountSelect: (account: string) => void;
  selectedAccount: string;
  formik: IWizardServerGroupBasicSettingsProps['formik'];
  onEnterStack: (stack: string) => void;
  detailsChanged: (detail: string) => void;
}

export function ServerGroupBasicSettings({
  accounts,
  onAccountSelect,
  selectedAccount,
  formik,
  onEnterStack,
  detailsChanged,
}: IServerGroupBasicSettingsProps) {
  const { values } = formik;
  const { stack = '' } = values.command;

  return (
    <div className="form-horizontal">
      <div className="form-group">
        <div className="col-md-3 sm-label-right">Account</div>
        <div className="col-md-7">
          <AccountSelectInput
            value={selectedAccount}
            onChange={(evt: any) => onAccountSelect(evt.target.value)}
            readOnly={false}
            accounts={accounts}
            provider="cloudrun"
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">
          Stack <HelpField id="cloudrun.serverGroup.stack" />
        </div>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control input-sm no-spel"
            value={stack}
            onChange={(e) => onEnterStack(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">
          Detail <HelpField id="cloudrun.serverGroup.detail" />
        </div>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control input-sm no-spel"
            value={values.command.freeFormDetails}
            onChange={(e) => detailsChanged(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export interface IWizardServerGroupBasicSettingsProps {
  formik: FormikProps<ICloudrunServerGroupCommandData>;
}

export class WizardServerGroupBasicSettings extends React.Component<IWizardServerGroupBasicSettingsProps> {
  private accountUpdated = (account: string): void => {
    const { formik } = this.props;
    formik.values.command.account = account;
    formik.setFieldValue('account', account);
  };

  private stackChanged = (stack: string): void => {
    const { setFieldValue, values } = this.props.formik;
    values.command.stack = stack;
    setFieldValue('stack', stack);
  };

  private freeFormDetailsChanged = (freeFormDetails: string) => {
    const { setFieldValue, values } = this.props.formik;
    values.command.freeFormDetails = freeFormDetails;
    setFieldValue('freeFormDetails', freeFormDetails);
  };

  public render() {
    const { formik } = this.props;
    return (
      <ServerGroupBasicSettings
        accounts={formik.values.metadata?.backingData?.accounts || []}
        onAccountSelect={this.accountUpdated}
        selectedAccount={formik.values.command?.account || ''}
        onEnterStack={this.stackChanged}
        formik={formik}
        detailsChanged={this.freeFormDetailsChanged}
      />
    );
  }
}
