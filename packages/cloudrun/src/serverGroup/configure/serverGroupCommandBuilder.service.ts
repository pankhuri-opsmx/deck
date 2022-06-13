import { module } from 'angular';
import { cloneDeep } from 'lodash';
import { $q } from 'ngimport';

import type {
  Application,
  IAccountDetails,
  IMoniker,
  IPipeline,
  IServerGroupCommand,
  IServerGroupCommandViewState,
  IStage,
} from '@spinnaker/core';
import { AccountService } from '@spinnaker/core';

export enum ServerGroupSource {
  TEXT = 'text',
  ARTIFACT = 'artifact',
}

export interface ICloudrunServerGroupCommandData {
  command: ICloudrunServerGroupCommand;
  metadata: ICloudrunServerGroupCommandMetadata;
}

export interface ICloudrunServerGroupCommand extends Omit<IServerGroupCommand, 'source' | 'application'> {
  application?: string;
  stack?: string;
  account: string;
  configFiles: string[];
  region: string;
  regions: [];
  cloudProvider: string;
  provider: string;
  selectedProvider: string;
  manifest: any; // deprecated
  manifests: any[];
  relationships: ICloudrunServerGroupSpinnakerRelationships;
  moniker: IMoniker;
  manifestArtifactId?: string;
  manifestArtifactAccount?: string;
  source: ServerGroupSource;
  versioned?: boolean;
  gitCredentialType?: string;
  viewState: IServerGroupCommandViewState;
  mode: string;
  credentials: string;
  sourceType: string;
  configArtifacts: any[];
  interestingHealthProviderNames: [];
  fromArtifact: boolean;
}

export interface IViewState {
  mode: string;
  submitButtonLabel: string;
  disableStrategySelection: boolean;
  stage?: IStage;
  pipeline?: IPipeline;
}

export interface ICloudrunServerGroupCommandMetadata {
  backingData: any;
}

export interface ICloudrunServerGroupSpinnakerRelationships {
  loadBalancers?: string[];
  securityGroups?: string[];
}

const getSubmitButtonLabel = (mode: string): string => {
  switch (mode) {
    case 'createPipeline':
      return 'Add';
    case 'editPipeline':
      return 'Done';
    case 'clone':
      return 'Clone';
    default:
      return 'Create';
  }
};

export class CloudrunV2ServerGroupCommandBuilder {
  // new add servergroup
  public buildNewServerGroupCommand(app: Application): PromiseLike<ICloudrunServerGroupCommandData> {
    return CloudrunServerGroupCommandBuilder.buildNewServerGroupCommand(app);
  }

  // add servergroup from deploy stage of pipeline
  public buildNewServerGroupCommandForPipeline(_stage: IStage, pipeline: IPipeline) {
    return CloudrunServerGroupCommandBuilder.buildNewServerGroupCommandForPipeline(_stage, pipeline);
  }
}

export class CloudrunServerGroupCommandBuilder {
  public static $inject = ['$q'];

  // TODO(lwander) add explanatory error messages
  public static ServerGroupCommandIsValid(command: ICloudrunServerGroupCommand): boolean {
    if (!command.moniker) {
      return false;
    }

    if (!command.moniker.app) {
      return false;
    }

    return true;
  }

  public static copyAndCleanCommand(input: ICloudrunServerGroupCommand): ICloudrunServerGroupCommand {
    const command = cloneDeep(input);
    return command;
  }

  // deploy stage : construct servergroup command
  public static buildNewServerGroupCommandForPipeline(stage: IStage, pipeline: IPipeline): any {
    const command: any = this.buildNewServerGroupCommand({ name: pipeline.application } as Application);
    command.viewState = {
      ...command.viewState,
      pipeline,
      requiresTemplateSelection: true,
      stage,
    };
    return command;
  }

  // new servergroup command
  public static buildNewServerGroupCommand(
    app: Application,
    sourceAccount?: string,
    mode = 'create',
  ): PromiseLike<ICloudrunServerGroupCommandData> {
    const dataToFetch = {
      accounts: AccountService.getAllAccountDetailsForProvider('cloudrun'),
      artifactAccounts: AccountService.getArtifactAccounts(),
    };

    // TODO(dpeach): if no callers of this method are Angular controllers,
    // $q.all may be safely replaced with Promise.all.
    return $q.all(dataToFetch).then((backingData: { accounts: IAccountDetails[] }) => {
      const { accounts } = backingData;

      /*  .then((backingData: { accounts: IAccountDetails[]; artifactAccounts: IArtifactAccount[]}) => {
          const { accounts, artifactAccounts } = backingData; */

      const account = accounts.some((a) => a.name === sourceAccount)
        ? accounts.find((a) => a.name === sourceAccount).name
        : accounts.length
        ? accounts[0].name
        : null;
      const viewState: IViewState = {
        mode,
        submitButtonLabel: getSubmitButtonLabel(mode),
        disableStrategySelection: mode === 'create',
      };

      //TODO : needs to be modified to [] at the time of integration
      const regions = backingData.accounts.some((a) => a.name === sourceAccount)
        ? accounts.find((a) => a.name === sourceAccount).regions
        : ['us-central', 'india'];
      const credentials = account;
      const cloudProvider = 'cloudrun';
      return {
        command: {
          application: app.name,
          configFiles: [''],
          cloudProvider,
          selectedProvider: cloudProvider,
          provider: cloudProvider,
          regions,
          credentials,
          gitCredentialType: 'NONE',
          manifest: null,
          sourceType: 'git',
          configArtifacts: [],
          interestingHealthProviderNames: [],
          fromArtifact: false,
          account,
          viewState,
        },
        metadata: {
          backingData,
        },
      } as ICloudrunServerGroupCommandData;
    });
  }
}

export const CLOUDRUN_SERVER_GROUP_COMMAND_BUILDER = 'spinnaker.cloudrun.serverGroup.commandBuilder.service';

module(CLOUDRUN_SERVER_GROUP_COMMAND_BUILDER, []).service(
  'cloudrunV2ServerGroupCommandBuilder',
  CloudrunV2ServerGroupCommandBuilder,
);
