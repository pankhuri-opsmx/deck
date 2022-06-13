import type { FormikProps } from 'formik';
import React from 'react';
import type { IAccount } from '@spinnaker/core';
import { AccountSelectInput, HelpField } from '@spinnaker/core';
import type { ICloudrunServerGroupCommandData } from '../serverGroupCommandBuilder.service';

export interface IServerGroupBasicSettingsProps {
  accounts: IAccount[];
  onAccountSelect: (account: string) => void;
  selectedAccount: string;
  //region: string;
  //onEnterRegion: (region: string) => void;
  formik: IWizardServerGroupBasicSettingsProps['formik'];
  onEnterStack: (stack: string) => void;
  // app: Application
}

export function ServerGroupBasicSettings({
  accounts,
  onAccountSelect,
  selectedAccount,
  formik,
  onEnterStack,
}: IServerGroupBasicSettingsProps) {
  const { values } = formik;
  //const { stack = "", credentials, regions } = values.command
  const { stack = '' } = values.command;
  //console.log("regions", regions)
  //const { backingData } = values.metadata
  //const readOnlyFields = viewState.readOnlyFields || {};

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

        {/* as discussed with Kiran , region is already there in config file, no need to enter it from UI/ but retrieve it in health right side section*/}
      </div>

      {/*       <RegionSelectField
        // readOnly={readOnlyFields.region}
        labelColumns={3}
        component={values}
        field="region"
        account={credentials}
        // regions={backingData.filtered.regions}
        regions={regions.map((region: string) => { return { name: region } })}
        onChange={onEnterRegion}
      /> */}
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
    </div>
  );
}

export interface IWizardServerGroupBasicSettingsProps {
  formik: FormikProps<ICloudrunServerGroupCommandData>;
  //app: Application
}

export class WizardServerGroupBasicSettings extends React.Component<IWizardServerGroupBasicSettingsProps> {
  private accountUpdated = (account: string): void => {
    const { formik } = this.props;
    formik.values.command.account = account;
    formik.setFieldValue('account', account);
  };

  // commented for now : until region is established correctly as it is already present in config file
  /*   private regionUpdated = (region: string): void => {
      const { formik } = this.props;
      formik.values.command.region = region;
      formik.setFieldValue('region', region);
    } */

  private stackChanged = (stack: string): void => {
    const { setFieldValue, values } = this.props.formik;
    values.command.stack = stack;
    setFieldValue('stack', stack);
  };

  public render() {
    const { formik } = this.props;
    return (
      <ServerGroupBasicSettings
        accounts={formik.values.metadata?.backingData?.accounts || []}
        onAccountSelect={this.accountUpdated}
        selectedAccount={formik.values.command?.account || ''}
        // onEnterRegion={this.regionUpdated}
        onEnterStack={this.stackChanged}
        // region={formik.values.command?.region}
        formik={formik}
        // app={app}
      />
    );
  }
}
