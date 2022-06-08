import { module } from 'angular';
//import type { IQService } from 'angular';
//import { load } from 'js-yaml';
import { cloneDeep } from 'lodash';
import { $q } from 'ngimport';

import type {
  Application,
  IAccountDetails,
  IExpectedArtifact,
  IMoniker,
  IPipeline,
  IServerGroupCommand,
  IServerGroupCommandViewState,
  IStage,
} from '@spinnaker/core';
import { AccountService } from '@spinnaker/core';

//const LAST_APPLIED_CONFIGURATION = 'kubectl.cloudrun.io/last-applied-configuration';

export enum ServerGroupSource {
  TEXT = 'text',
  ARTIFACT = 'artifact',
}

export interface ICloudrunServerGroupCommandData {
  command: ICloudrunServerGroupCommand;
  metadata: ICloudrunServerGroupCommandMetadata;
}

// export interface configFileData {
//   configFile: string;
// }

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
  public buildNewServerGroupCommand(app: Application): PromiseLike<ICloudrunServerGroupCommandData> {
    return CloudrunServerGroupCommandBuilder.buildNewServerGroupCommand(app);
  }

  public buildNewServerGroupCommandForPipeline(_stage: IStage, pipeline: IPipeline) {
    // eslint-disable-next-line no-debugger
    debugger;
    /*     let app : Application
    let cluster : ICloudrunServerGroupCommand */
    return CloudrunServerGroupCommandBuilder.buildNewServerGroupCommandForPipeline(_stage, pipeline);
  }
}

export class CloudrunServerGroupCommandBuilder {
  public static $inject = ['$q'];
  //constructor(private $q: IQService) {}

  private static getExpectedArtifacts(pipeline: IPipeline): any[] {
    return pipeline.expectedArtifacts || [];
  }

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

  public static buildServerGroupCommandFromPipeline(
    app: Application,
    cluster: ICloudrunServerGroupCommand,
    _stage: IStage,
    pipeline: IPipeline,
  ): PromiseLike<ICloudrunServerGroupCommandData> {
    return CloudrunServerGroupCommandBuilder.buildNewServerGroupCommand(app, 'cloudrun', 'create').then(
      (command: ICloudrunServerGroupCommandData) => {
        command = {
          ...command,
          ...cluster,
          backingData: {
            ...command.metadata.backingData.backingData,
            // triggerOptions: AppengineServerGroupCommandBuilder.getTriggerOptions(pipeline),
            expectedArtifacts: CloudrunServerGroupCommandBuilder.getExpectedArtifacts(pipeline),
          },
          credentials: cluster.account || command.metadata.backingData.credentials,
          viewState: {
            ...command.metadata.backingData.viewState,
            stage: _stage,
            pipeline,
          },
        } as ICloudrunServerGroupCommandData;
        return command;
      },
    );
  }

  public static buildNewServerGroupCommandForPipeline(
    _stage: IStage,
    pipeline: IPipeline,
  ): PromiseLike<{
    viewState: {
      stage: IStage;
      pipeline: IPipeline;
    };
    backingData: {
      // triggerOptions: Array<IAppengineGitTrigger | IAppengineJenkinsTrigger>;
      expectedArtifacts: IExpectedArtifact[];
    };
  }> {
    // eslint-disable-next-line no-debugger
    debugger;
    // We can't copy server group configuration for App Engine, and can't build the full command here because we don't have
    // access to the application.
    return $q.when({
      viewState: {
        pipeline,
        stage: _stage,
      },
      backingData: {
        // triggerOptions: AppengineServerGroupCommandBuilder.getTriggerOptions(pipeline),
        expectedArtifacts: CloudrunServerGroupCommandBuilder.getExpectedArtifacts(pipeline),
      },
    });
  }

  public static buildNewServerGroupCommand(
    app: Application,
    /*  sourceManifest?: any,
    sourceMoniker?: IMoniker, */
    sourceAccount?: string,
    mode = 'create',
  ): PromiseLike<ICloudrunServerGroupCommandData> {
    /* if (sourceManifest != null && has(sourceManifest, ['metadata', 'annotations', LAST_APPLIED_CONFIGURATION])) {
      sourceManifest = load(sourceManifest.metadata.annotations[LAST_APPLIED_CONFIGURATION]);
    } */

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
      /*    let manifestArtifactAccount: string = null;
        const [artifactAccountData] = artifactAccounts;
        if (artifactAccountData) {
          manifestArtifactAccount = artifactAccountData.name;
        } */

      //TODO : needs to be modified to [] at the time of integration
      const regions = backingData.accounts.some((a) => a.name === sourceAccount)
        ? accounts.find((a) => a.name === sourceAccount).regions
        : ['us-central', 'india'];
      const credentials = account;
      const cloudProvider = 'cloudrun';
      /*     const moniker = sourceMoniker || {
          app: app.name,
        };

        const relationships = {
          loadBalancers: [] as string[],
          securityGroups: [] as string[],
        }; */

      // const versioned: any = null;
      //  const provider = 'kubernetes';

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
          /*     manifests: Array.isArray(sourceManifest)
              ? sourceManifest
              : sourceManifest != null
              ? [sourceManifest]
              : null,
            relationships,
            moniker, */
          account,
          // versioned,
          // manifestArtifactAccount,
          // source: ManifestSource.TEXT,
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
